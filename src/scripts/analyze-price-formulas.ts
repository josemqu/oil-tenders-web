import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.LLM_API;

if (!SUPABASE_URL || !SUPABASE_KEY || !GEMINI_API_KEY) {
  console.error('Missing environment variables. Please check .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, LLM_API');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function analyzeOffer(offer: any) {
  const prompt = `
    You are an expert oil trader and data analyst.
    Your goal is to parse an oil price formula and its associated notes into a structured JSON format.
    
    Formula: "${offer.price_formula}"
    Notes: "${offer.notes || ''}"

    Extract the following components:
    1. formula_type: "export_parity", "fixed", "coefficient_based", or "other".
    2. base_index: The benchmark used (e.g., "BRENT", "WTI", "RBOB", etc.). If not found, null.
    3. components: An object containing:
       - base_adjustment: { operation: "+" or "-", value: number, source: "formula" or "variable_X" }. The fixed spread added/subtracted.
         (If the formula uses a variable like "Brent - A", look for "A=..." in the Notes to find the value).
       - retention: { applies: boolean, value: number (decimal, e.g. 0.08 for 8%) }. Look for "DDEE", "RET", "Retenciones". Default/estimate is often 0.08 if mentioned but not specified.
       - export_factor: number. The divisor (e.g., 0.97, 0.964). Default to 0.97 if implied by "Export Parity" but missing.
       - coefficient: number. If the formula is like "0.85 * ...", this is 0.85.
    4. calculated_logic: A simplified string representation of the math (e.g. "(BRENT - 7.5) * (1 - 0.08) / 0.97"). Replace variables with their found numbers.

    Return ONLY raw JSON (no markdown formatting).
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();
    
    // Cleanup markdown if present
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error(`Error analyzing offer ${offer.id}:`, error);
    return null;
  }
}

async function main() {
  console.log('Starting analysis...');

  let processedCount = 0;

  while (true) {
    // 1. Fetch a batch of offers that haven't been structured yet
    const { data: offers, error } = await supabase
      .from('oil_offers_export')
      .select('id, price_formula, notes')
      .not('price_formula', 'is', null) // Only rows with formulas
      .is('price_structure', null)      // Only rows not yet processed
      .order('id', { ascending: false }) // Prioritize newest offers for dashboard visibility
      .limit(50);                       // Batch size

    if (error) {
      console.error('Error fetching offers:', error);
      break;
    }

    if (!offers || offers.length === 0) {
      console.log('No more pending offers to analyze.');
      break;
    }

    console.log(`Fetching batch of ${offers.length} offers... (Total processed so far: ${processedCount})`);

    for (const offer of offers) {
      console.log(`Analyzing [${offer.id}]: ${offer.price_formula.substring(0, 50)}...`);
      
      const structure = await analyzeOffer(offer);
      
      if (structure) {
        const { error: updateError } = await supabase
          .from('oil_offers_export')
          .update({ price_structure: structure })
          .eq('id', offer.id);

        if (updateError) {
          console.error(`Failed to update offer ${offer.id}:`, updateError);
        } else {
          // console.log(`Updated offer ${offer.id} successfully.`);
        }
      } else {
         // If analysis failed/returned null, maybe mark as skipped or just log? 
         // For now we leave it null so it might be retried, but to avoid infinite loops on bad data 
         // we might want to flag it. However, the prompt implies "analyze to complete". 
         // If gemini fails, it returns null.
         console.warn(`Skipping [${offer.id}] due to analysis failure.`);
      }

      // Rate limiting delay (Gemini free tier: 15 RPM = ~4s per request safe margin)
      // 15 RPM = 1 request every 4 seconds.
      // 2 seconds might be too aggressive if strict 15 RPM. 60s / 15 = 4s.
      // Let's increase delay to 4000ms to be safe for free tier, or keep 2000 if user has paid.
      // Assuming free tier based on previous interaction context ("Gemini free tier").
      await new Promise(resolve => setTimeout(resolve, 4000));
      processedCount++;
    }
  }

  console.log(`Batch complete. Total offers processed: ${processedCount}`);
}

main().catch(console.error);

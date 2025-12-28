import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const GEMINI_API_KEY = process.env.LLM_API;

if (!GEMINI_API_KEY) {
  console.error('Missing LLM_API key');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function listModels() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Dummy 
    // Actually the SDK doesn't have a direct listModels method on the client instance easily accessible in this version?
    // Let's rely on the error message which says "Call ListModels to see...".
    // I entered this path because I assumed the SDK had it but maybe I need to check how to call it raw or if the SDK exposes it on the `GoogleGenerativeAI` instance.
    // Wait, the SDK does not expose listModels on the main class in all versions.
    // Let's try to just fetch a known working valid model like "gemini-1.5-flash" again but maybe I just had a typo or transient issue?
    // No, I got 404 consistently.
    // Let's try `gemini-1.0-pro`.
    console.log("Testing gemini-1.0-pro...");
    const model1 = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
    const res = await model1.generateContent("Hello");
    console.log("Success with gemini-1.0-pro:", res.response.text());
  } catch (e) {
    console.error("Failed with gemini-1.0-pro:", e);
  }
}

listModels();

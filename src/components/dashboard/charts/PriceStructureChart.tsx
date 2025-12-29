"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { shortenProductName } from "@/lib/utils";

type PriceStructure = {
  formula_type: string;
  base_index: string | null;
  components?: {
    base_adjustment?: { operation: "+" | "-"; value: number; source?: string };
    coefficient?: number;
    export_factor?: number;
  };
};

type OfferWithStructure = {
  id: string | number;
  price_structure: PriceStructure;
  company?: string;
  date?: string;
};

export function PriceStructureChart({ offers }: { offers: Record<string, any>[] }) {
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [selectedBase, setSelectedBase] = useState<string>("all");

  // Pre-process all offers to get unique products and base indices for the filters
  const { products, bases } = useMemo(() => {
    const pSet = new Set<string>();
    const bSet = new Set<string>();
    
    offers.forEach(o => {
      if (o.price_structure) {
        const p = shortenProductName(o.product || o.product_type || "");
        if (p) pSet.add(p);
        
        let b = (o.price_structure.base_index || "UNKNOWN").toUpperCase();
        if (b === "ICE BRENT") b = "BRENT";
        bSet.add(b);
      }
    });

    return {
      products: Array.from(pSet).sort(),
      bases: Array.from(bSet).sort()
    };
  }, [offers]);

  const data = useMemo(() => {
    const items = [];
    for (const o of offers) {
      if (!o.price_structure) continue;
      
      const struct = o.price_structure as PriceStructure;
      let baseIndex = (struct.base_index || "UNKNOWN").toUpperCase();
      if (baseIndex === "ICE BRENT") baseIndex = "BRENT";
      
      const product = shortenProductName(o.product || o.product_type || "");

      // Apply Local Filters
      if (selectedProduct !== "all" && product !== selectedProduct) continue;
      if (selectedBase !== "all" && baseIndex !== selectedBase) continue;
      
      // We focus on the spread (base_adjustment)



      
      // Determine if we need to convert cpg to USD/bbl (approx 1 cpg = 0.42 $/bbl)
      // Usually RBOB, ULSD, HO are quoted in cpg or cents.
      // If the value is > 10, it's likely cents/cpg, because spreads in USD/bbl are rarely > 10.
      // If baseIndex suggests refined products (RBOB, HEAT, ULSD, GASOIL, NAFTA), and val > 5, assume cpg.
      
      let spread = 0;
      if (struct.components?.base_adjustment) {
        let val = struct.components.base_adjustment.value;
        const op = struct.components.base_adjustment.operation;
        
        // Auto-normalization heuristic:
        // 1. If formula says "cpg", the LLM might have extracted the number 30.
        // 2. If it is RBOB/ULSD and value is > 10, treat as cents per gallon.
        const isRefined = ["RBOB", "ULSD", "HO", "HEAT", "GASOIL", "DIESEL", "NAFTA"].some(k => baseIndex.includes(k));
        
        // If explicitly cpg in logic or just inferred from magnitude for refined products
        if (isRefined && Math.abs(val) > 5) {
             val = val * 0.42; // Convert cpg (cents/gal) to USD/bbl. 1 gal = 3.785L, 1 bbl = 159L => 42 gal. 1 cpg = 0.42 $/bbl.
        } else if (Math.abs(val) < 1 && isRefined) {
            // value might be 0.75 (meaning 75 cents or 0.75 dollars? Usually 0.75 dollars/gal? No, 75cpg is common).
            // If it is 0.75, and it's RBOB. 
            // In the data we saw: "0.75" for "75 cpg". 
            // Wait, data showed val: 0.75 for 75 cpg in one case, and val: 30 for 30 cpg in another.
            // This suggests inconsistent LLM extraction. 
            // Let's rely on magnitude.
            // If < 2: likely USD/gal (so * 42) OR USD/bbl (keep as is).
            // If it's RBOB and < 2, it's likely USD/gallon (e.g. +75 cpg -> usually written as +0.75 if dollars).
            // But +1 USD/bbl is also < 2.
            // Hard to distinguish 75 cents vs 0.75 dollars vs 0.75 USD/bbl without units.
            // Let's assume for RBOB/ULSD:
            // > 2 => cents per gallon => * 0.42
            // <= 2 => dollars per gallon => * 42  (0.75 $/gal = 31.5 $/bbl)
            // UNLESS it is explicitly crude, where < 5 is USD/bbl.
            if (val <= 2) val = val * 42; 
        }

        if (op === "-") {
          spread = -Math.abs(val);
        } else {
          spread = Math.abs(val);
        }
      }

      items.push({
        id: o.id,
        company: o.company || o.buyer || o.seller || "N/A",
        baseIndex,
        product,
        spread,
        date: o.date || o.created_at || "",
        tooltipIndex: baseIndex,
        formula: o.price_formula
      });
    }

    // Sort by Spread descending (High premium to High discount)
    return items.sort((a, b) => b.spread - a.spread).slice(0, 50); // Limit to top 50 to avoid crowding
  }, [offers, selectedProduct, selectedBase]);

  if (data.length === 0 && (selectedProduct === "all" && selectedBase === "all")) {
    return (
      <Card className="shadow-sm">
         <CardHeader>
          <CardTitle>Diferenciales de Precio</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p className="mb-2">No hay datos de estructura de precios analizados aún.</p>
            <p className="text-sm">Ejecute el script de análisis o recargue la página si ya está corriendo.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle>Diferenciales de Precio (Spreads)</CardTitle>
        
        <div className="flex flex-wrap gap-2">
          {/* Product Filter */}
          <select 
            className="text-xs rounded border border-input bg-background px-2 py-1 outline-none focus:ring-1 focus:ring-ring"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="all">Todos los Productos</option>
            {products.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          {/* Base Index Filter */}
          <select 
            className="text-xs rounded border border-input bg-background px-2 py-1 outline-none focus:ring-1 focus:ring-ring"
            value={selectedBase}
            onChange={(e) => setSelectedBase(e.target.value)}
          >
            <option value="all">Todas las Bases</option>
            {bases.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </CardHeader>

      <CardContent className="h-[350px]">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
            No hay datos para los filtros seleccionados.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
              <XAxis hide dataKey="id" />
              <YAxis 
                label={{ value: 'Spread (USD/bbl)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))', fontSize: 12 } }}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
                        <div className="font-semibold mb-1 text-foreground">{d.company}</div>
                        <div className="text-muted-foreground text-[10px]">{d.product}</div>
                        <div className="text-muted-foreground mb-1">Base: {d.baseIndex}</div>
                        <div className={`font-mono font-bold ${d.spread >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                          Spread: {d.spread > 0 ? "+" : ""}{d.spread.toFixed(2)} USD/bbl
                        </div>
                        <div className="text-muted-foreground text-[10px] mt-1">{d.date.slice(0, 10)}</div>
                        {d.formula && (
                          <div className="mt-2 pt-1 border-t border-border text-[10px] italic text-muted-foreground break-words max-w-[200px]">
                            {d.formula}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={0} stroke="hsl(var(--foreground))" strokeOpacity={0.5} />
              <Bar dataKey="spread" name="Spread">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.spread >= 0 ? "#10b981" : "#f43f5e"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

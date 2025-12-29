"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Scatter, ScatterChart } from "recharts";
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

export function SpreadOverTime({ offers }: { offers: Record<string, any>[] }) {
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [selectedBase, setSelectedBase] = useState<string>("all");

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

  const chartData = useMemo(() => {
    const items: any[] = [];
    
    offers.forEach(o => {
      if (!o.price_structure || !o.delivery_start) return;
      
      const struct = o.price_structure as PriceStructure;
      let baseIndex = (struct.base_index || "UNKNOWN").toUpperCase();
      if (baseIndex === "ICE BRENT") baseIndex = "BRENT";
      
      const product = shortenProductName(o.product || o.product_type || "");
      
      if (selectedProduct !== "all" && product !== selectedProduct) return;
      if (selectedBase !== "all" && baseIndex !== selectedBase) return;

      let spread = 0;
      if (struct.components?.base_adjustment) {
        let val = struct.components.base_adjustment.value;
        const op = struct.components.base_adjustment.operation;
        const isRefined = ["RBOB", "ULSD", "HO", "HEAT", "GASOIL", "DIESEL", "NAFTA"].some(k => baseIndex.includes(k));
        
        if (isRefined && Math.abs(val) > 5) {
          val = val * 0.42; 
        } else if (Math.abs(val) < 1 && isRefined) {
          if (val <= 2) val = val * 42; 
        }
        spread = op === "-" ? -Math.abs(val) : Math.abs(val);
      }

      items.push({
        date: new Date(o.delivery_start).getTime(),
        dateStr: o.delivery_start,
        spread: spread,
        company: o.company || o.buyer || o.seller || "N/A",
        product,
        baseIndex,
        formula: o.price_formula
      });
    });

    return items.sort((a, b) => a.date - b.date);
  }, [offers, selectedProduct, selectedBase]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle>Evolución de Spreads (vs Delivery Start)</CardTitle>
        <div className="flex flex-wrap gap-2">
          <select 
            className="text-xs rounded border border-input bg-background px-2 py-1 outline-none"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="all">Todos los Productos</option>
            {products.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select 
            className="text-xs rounded border border-input bg-background px-2 py-1 outline-none"
            value={selectedBase}
            onChange={(e) => setSelectedBase(e.target.value)}
          >
            <option value="all">Todas las Bases</option>
            {bases.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </CardHeader>
      <CardContent className="h-[350px]">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
            No hay datos para los filtros seleccionados.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
              <XAxis 
                dataKey="date" 
                name="Fecha Entrega" 
                type="number"
                scale="time"
                domain={['auto', 'auto']}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(val) => {
                  const d = new Date(val);
                  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                }}
              />
              <YAxis 
                type="number"
                dataKey="spread"
                name="Spread"
                domain={['auto', 'auto']}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${val > 0 ? "+" : ""}${val}`}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
                        <div className="font-semibold text-foreground mb-1">{d.company}</div>
                        <div className="text-muted-foreground">Delivery: {d.dateStr}</div>
                        <div className="text-muted-foreground">Base: {d.baseIndex}</div>
                        <div className={`font-mono font-bold mt-1 ${d.spread >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                          Spread: {d.spread > 0 ? "+" : ""}{d.spread.toFixed(2)} USD/bbl
                        </div>
                        <div className="mt-2 text-[10px] italic text-muted-foreground break-words max-w-[200px]">
                          {d.formula}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Ofertas" data={chartData} fill="#3b82f6" />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

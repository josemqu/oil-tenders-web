"use client";

import { CartesianGrid, Legend, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartTooltip } from "@/components/dashboard/charts/ChartTooltip";

export type ScatterPoint = {
  price: number;
  volume: number;
  status: "tendered" | "active" | "awarded";
  product?: string;
  date?: string;
};

const colorByStatus: Record<ScatterPoint["status"], string> = {
  tendered: "#a78bfa",
  active: "#60a5fa",
  awarded: "#34d399",
};

export function PriceVsVolume({ data }: { data: ScatterPoint[] }) {
  const formatAxis = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
    return String(value);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Precio vs Volumen</CardTitle>
      </CardHeader>
      <CardContent className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
            <XAxis 
              type="number" 
              dataKey="price" 
              name="Precio" 
              tickFormatter={formatAxis}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              type="number" 
              dataKey="volume" 
              name="Volumen" 
              tickFormatter={formatAxis}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              dx={-10}
              width={45}
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as ScatterPoint;
                  return (
                    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
                      <div className="font-semibold mb-1 text-foreground">{d.product || "Desconocido"}</div>
                      <div className="text-muted-foreground mb-1">Estado: <span style={{ color: colorByStatus[d.status] }}>{d.status === 'tendered' ? 'Licitado' : d.status === 'active' ? 'Activo' : 'Adjudicado'}</span></div>
                      <div className="text-foreground">Precio: {d.price}</div>
                      <div className="text-foreground">Vol: {d.volume}</div>
                      {d.date && <div className="text-muted-foreground mt-1">{d.date.slice(0, 10)}</div>}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} formatter={(value) => value === 'tendered' ? 'Licitado' : value === 'active' ? 'Activo' : 'Adjudicado'} />
            {(["tendered", "active", "awarded"] as const).map((k) => (
              <Scatter key={k} name={k} data={data.filter((d) => d.status === k)} fill={colorByStatus[k]} />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

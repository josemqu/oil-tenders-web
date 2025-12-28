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
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Precio vs Volumen</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis type="number" dataKey="price" name="Precio" />
            <YAxis type="number" dataKey="volume" name="Volumen" />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as ScatterPoint;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm text-xs">
                      <div className="font-semibold mb-1">{d.product || "Desconocido"}</div>
                      <div className="text-muted-foreground">Status: <span style={{ color: colorByStatus[d.status] }}>{d.status}</span></div>
                      <div>Price: {d.price}</div>
                      <div>Vol: {d.volume}</div>
                      {d.date && <div className="text-muted-foreground mt-1">{d.date.slice(0, 10)}</div>}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            {(["tendered", "active", "awarded"] as const).map((k) => (
              <Scatter key={k} name={k} data={data.filter((d) => d.status === k)} fill={colorByStatus[k]} />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

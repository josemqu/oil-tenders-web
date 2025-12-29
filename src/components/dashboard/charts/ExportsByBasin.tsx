"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "@/components/dashboard/charts/ChartTooltip";
import { unitSuffix, type VolumeUnit } from "@/lib/utils";

export type BasinBar = {
  basin: string;
  volume: number;
};

export function ExportsByBasin({ data, unit = "m3" }: { data: BasinBar[]; unit?: VolumeUnit }) {
  const formatYAxis = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
    return String(value);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Exportaciones por cuenca</CardTitle>
      </CardHeader>
      <CardContent className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
            <XAxis 
              dataKey="basin" 
              interval={0} 
              angle={-15} 
              height={50} 
              textAnchor="end"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              tickFormatter={formatYAxis}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              dx={-10}
              width={45}
            />
            <Tooltip content={(props) => <ChartTooltip {...props} suffix={unitSuffix(unit)} />} />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            <Bar 
              name="Volumen"
              dataKey="volume" 
              fill="#10b981" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

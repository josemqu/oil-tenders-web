"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartTooltip } from "@/components/dashboard/charts/ChartTooltip";
import { unitSuffix, type VolumeUnit } from "@/lib/utils";

export type CountryItem = {
  country: string;
  offering: number;
  destination: number;
};

export function VolumeByCountry({ data, onClick, unit = "m3" }: { data: CountryItem[]; onClick?: (country: string) => void; unit?: VolumeUnit }) {
  const formatYAxis = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
    return String(value);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Volumen por país (oferente / destino)</CardTitle>
      </CardHeader>
      <CardContent className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
            <XAxis 
              dataKey="country" 
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              minTickGap={30}
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
            <Bar name="Oferta" dataKey="offering" fill="#22c55e" radius={[4, 4, 0, 0]} onClick={(d: any) => onClick?.(d?.country)} />
            <Bar name="Destino" dataKey="destination" fill="#3b82f6" radius={[4, 4, 0, 0]} onClick={(d: any) => onClick?.(d?.country)} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

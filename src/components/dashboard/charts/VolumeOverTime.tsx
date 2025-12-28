"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartTooltip } from "@/components/dashboard/charts/ChartTooltip";
import { unitSuffix, type VolumeUnit } from "@/lib/utils";

export type TimePoint = {
  date: string; // YYYY-MM-DD
  tendered: number;
  awarded: number;
};

export function VolumeOverTime({ data, unit = "m3" }: { data: TimePoint[]; unit?: VolumeUnit }) {
  // Format helpers
  const formatYAxis = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
    return String(value);
  };

  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    // Simple formatter "DD/MM" or similar if date-fns overhead isn't desired,
    // but we have date-fns. Let's stick to native simple format to avoid imports if possible,
    // or use date-fns if we want "d MMM".
    // Native:
    return date.toLocaleDateString("es-AR", { day: "2-digit", month: "short", timeZone: "UTC" });
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Volumen licitado vs adjudicado</CardTitle>
      </CardHeader>
      <CardContent className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="tendered" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="awarded" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis}
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
            <Area 
              type="monotone" 
              dataKey="tendered" 
              name="Licitado"
              stroke="#3b82f6" 
              strokeWidth={2}
              fill="url(#tendered)" 
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Area 
              type="monotone" 
              dataKey="awarded" 
              name="Adjudicado"
              stroke="#10b981" 
              strokeWidth={2}
              fill="url(#awarded)" 
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

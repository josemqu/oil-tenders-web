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

export type TimePoint = {
  date: string; // YYYY-MM-DD
  tendered: number;
  awarded: number;
};

export function VolumeOverTime({ data }: { data: TimePoint[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Volumen licitado vs adjudicado</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="tendered" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="awarded" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="date" tickMargin={8} />
            <YAxis tickMargin={8} />
            <Tooltip content={(props) => <ChartTooltip {...props} suffix=" bbl" />} />
            <Legend />
            <Area type="monotone" dataKey="tendered" stroke="#3b82f6" fill="url(#tendered)" />
            <Area type="monotone" dataKey="awarded" stroke="#10b981" fill="url(#awarded)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

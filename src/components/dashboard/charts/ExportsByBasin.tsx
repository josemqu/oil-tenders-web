"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "@/components/dashboard/charts/ChartTooltip";
import { unitSuffix, type VolumeUnit } from "@/lib/utils";

export type BasinBar = {
  basin: string;
  volume: number;
};

export function ExportsByBasin({ data, unit = "m3" }: { data: BasinBar[]; unit?: VolumeUnit }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Exportaciones por cuenca</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="basin" tickMargin={8} interval={0} angle={-15} height={50} textAnchor="end" />
            <YAxis tickMargin={8} />
            <Tooltip content={(props) => <ChartTooltip {...props} suffix={unitSuffix(unit)} />} />
            <Bar dataKey="volume" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartTooltip } from "@/components/dashboard/charts/ChartTooltip";
import { unitSuffix, type VolumeUnit } from "@/lib/utils";

export type ProductItem = {
  product: string;
  volume: number;
};

export function VolumeByProduct({ data, onClick, unit = "m3" }: { data: ProductItem[]; onClick?: (product: string) => void; unit?: VolumeUnit }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Volumen por producto</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="product" tickMargin={8} />
            <YAxis tickMargin={8} />
            <Tooltip content={(props) => <ChartTooltip {...props} suffix={unitSuffix(unit)} />} />
            <Bar dataKey="volume" fill="#6366f1" onClick={(d: any) => onClick?.(d?.product)} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

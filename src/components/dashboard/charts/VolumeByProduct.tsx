"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type ProductItem = {
  product: string;
  volume: number;
};

export function VolumeByProduct({ data, onClick }: { data: ProductItem[]; onClick?: (product: string) => void }) {
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
            <Tooltip contentStyle={{ borderRadius: 8 }} />
            <Bar dataKey="volume" fill="#6366f1" onClick={(d: any) => onClick?.(d?.product)} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

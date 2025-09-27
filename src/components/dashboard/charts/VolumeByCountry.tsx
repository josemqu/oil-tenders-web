"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type CountryItem = {
  country: string;
  offering: number;
  destination: number;
};

export function VolumeByCountry({ data, onClick }: { data: CountryItem[]; onClick?: (country: string) => void }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Volumen por país (oferente / destino)</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="country" tickMargin={8} />
            <YAxis tickMargin={8} />
            <Tooltip contentStyle={{ borderRadius: 8 }} />
            <Bar dataKey="offering" fill="#22c55e" onClick={(d: any) => onClick?.(d?.country)} />
            <Bar dataKey="destination" fill="#3b82f6" onClick={(d: any) => onClick?.(d?.country)} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

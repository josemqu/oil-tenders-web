"use client";

import { ResponsiveContainer, Tooltip, Treemap } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartTooltip } from "@/components/dashboard/charts/ChartTooltip";

export type FunnelItem = { name: string; value: number };

export function OffersFunnel({ data }: { data: FunnelItem[] }) {
  // Using Treemap to emulate a funnel; keeps dependencies simple
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Embudo de ofertas</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap data={data} dataKey="value" stroke="#fff" fill="#fb7185" content={<CustomContent />}>
            {/* Tooltip must be a child of Treemap to access internal store */}
            <Tooltip content={(props) => <ChartTooltip {...props} suffix="" />} />
          </Treemap>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function CustomContent(props: any) {
  const { x, y, width, height, name, value } = props;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill="#fb7185" opacity={0.85} rx={8} />
      <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#fff" fontSize={12}>
        {name}: {value}
      </text>
    </g>
  );
}

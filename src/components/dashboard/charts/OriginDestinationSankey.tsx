"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, Sankey, Tooltip } from "recharts";
import { unitSuffix, type VolumeUnit } from "@/lib/utils";

export type SankeyLink = {
  source: string;
  target: string;
  value: number;
};

export function OriginDestinationSankey({
  title = "Origen → Destino (volumen)",
  links,
  unit = "m3",
}: {
  title?: string;
  links: SankeyLink[];
  unit?: VolumeUnit;
}) {
  // Build nodes and indexed links
  const nodeNames = Array.from(
    new Set<string>(links.flatMap((l) => [l.source, l.target]).filter(Boolean))
  );
  const indexOf = (name: string) => nodeNames.indexOf(name);
  const nodes = nodeNames.map((name) => ({ name }));
  const iLinks = links
    .filter((l) => l && l.source && l.target && typeof l.value === "number" && l.value > 0)
    .map((l) => ({ source: indexOf(l.source), target: indexOf(l.target), value: l.value }))
    .filter((l) => l.source >= 0 && l.target >= 0);

  const total = iLinks.reduce((acc, l) => acc + (l.value || 0), 0);

  // Custom tooltip content handling node or link hovers
  const SankeyTip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0]?.payload || {};
    const fmtVal = (n: number) => `${(n || 0).toLocaleString()}${unitSuffix(unit)}`;
    const percent = (n: number) => (total > 0 ? `${((n / total) * 100).toFixed(1)}%` : "");

    // Helper to resolve node name if index or object
    const nodeName = (node: any) => {
      if (node == null) return "";
      if (typeof node === "number") return nodes[node]?.name || nodeNames[node] || String(node);
      if (typeof node?.name === "string") return node.name;
      return String(node);
    };

    // Link hover
    if (p && (p.source != null || p.target != null) && typeof p.value === "number") {
      const sName = nodeName(p.source);
      const tName = nodeName(p.target);
      return (
        <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
          <div className="mb-1 font-medium text-foreground">{sName} → {tName}</div>
          <div className="text-muted-foreground">{fmtVal(p.value)} {percent(p.value)}</div>
        </div>
      );
    }

    // Node hover
    const name = p?.name || payload[0]?.name || "Nodo";
    const v = typeof p?.value === "number" ? p.value : undefined;
    return (
      <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
        <div className="mb-1 font-medium text-foreground">{name}</div>
        {typeof v === "number" ? (
          <div className="text-muted-foreground">{fmtVal(v)} {percent(v)}</div>
        ) : null}
      </div>
    );
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {nodes.length > 0 && iLinks.length > 0 ? (
            <Sankey
              data={{ nodes, links: iLinks }}
              nodePadding={24}
              nodeWidth={16}
              margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
              link={{ strokeOpacity: 0.4 }}
            >
              <Tooltip content={<SankeyTip />} />
            </Sankey>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              Sin datos suficientes
            </div>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

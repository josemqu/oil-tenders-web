"use client";

import React from "react";

export function formatNumber(n: unknown) {
  if (typeof n !== "number") return String(n ?? "");
  return n.toLocaleString();
}

export function formatBbl(n: unknown) {
  if (typeof n !== "number") return String(n ?? "");
  return `${n.toLocaleString()} bbl`;
}

export type RechartsPayload = {
  name?: string;
  value?: number;
  color?: string;
  dataKey?: string;
  payload?: Record<string, any>;
};

export function ChartTooltip({
  active,
  label,
  payload,
  suffix,
  title,
}: {
  active?: boolean;
  label?: string | number;
  payload?: RechartsPayload[];
  suffix?: string; // e.g. ' bbl'
  title?: string; // override title
}) {
  if (!active || !payload || payload.length === 0) return null;
  const items = payload.filter(Boolean);
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="mb-1 font-medium text-foreground">
        {title || String(label ?? "")}
      </div>
      <div className="space-y-1">
        {items.map((p, idx) => (
          <div key={idx} className="flex items-center gap-2">
            {p.color ? (
              <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: p.color }} />
            ) : null}
            <span className="text-muted-foreground">
              {p.name || p.dataKey}
            </span>
            <span className="ml-auto font-medium text-foreground">
              {typeof p.value === "number"
                ? `${p.value.toLocaleString()}${suffix || ""}`
                : String(p.value ?? "")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/dashboard/DatePicker";
import { shortenProductName, shortCode } from "@/lib/utils";

export type FiltersValue = {
  product?: string;
  country?: string;
  company?: string;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
};

export function Filters({
  value,
  onChange,
  productOptions = [],
  countryOptions = [],
  companyOptions = [],
}: {
  value: FiltersValue;
  onChange: (v: FiltersValue) => void;
  productOptions?: string[];
  countryOptions?: string[];
  companyOptions?: string[];
}) {
  const [local, setLocal] = useState<FiltersValue>(value);

  useEffect(() => setLocal(value), [value]);

  const reset = () => {
    setLocal({});
    onChange({});
  };

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-background p-3 shadow-sm">
      <div className="flex flex-col">
        <label className="mb-1 text-xs text-muted-foreground">Producto</label>
        <select
          className="h-9 rounded-md border border-border bg-background px-2 text-sm"
          value={local.product || ""}
          onChange={(e) => {
            const next = { ...local, product: e.target.value || undefined };
            setLocal(next);
            onChange(next);
          }}
        >
          <option value="">Todos</option>
          {(() => {
            // Build a map of short label counts to detect collisions
            const counts = new Map<string, number>();
            for (const p of productOptions) {
              const s = shortenProductName(p);
              counts.set(s, (counts.get(s) || 0) + 1);
            }
            return productOptions.map((p) => {
              const s = shortenProductName(p);
              const needsDisambiguation = (counts.get(s) || 0) > 1;
              const label = needsDisambiguation ? `${s} (${shortCode(p).toUpperCase()})` : s;
              return (
                <option key={p} value={p}>
                  {label}
                </option>
              );
            });
          })()}
        </select>
      </div>
      <div className="flex flex-col">
        <label className="mb-1 text-xs text-muted-foreground">País</label>
        <select
          className="h-9 rounded-md border border-border bg-background px-2 text-sm"
          value={local.country || ""}
          onChange={(e) => {
            const next = { ...local, country: e.target.value || undefined };
            setLocal(next);
            onChange(next);
          }}
        >
          <option value="">Todos</option>
          {countryOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col">
        <label className="mb-1 text-xs text-muted-foreground">Compañía</label>
        <select
          className="h-9 rounded-md border border-border bg-background px-2 text-sm"
          value={local.company || ""}
          onChange={(e) => {
            const next = { ...local, company: e.target.value || undefined };
            setLocal(next);
            onChange(next);
          }}
        >
          <option value="">Todas</option>
          {companyOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col">
        <DatePicker
          label="Desde"
          value={local.from}
          onChange={(d) => {
            const next = { ...local, from: d };
            setLocal(next);
            onChange(next);
          }}
        />
      </div>
      <div className="flex flex-col">
        <DatePicker
          label="Hasta"
          value={local.to}
          onChange={(d) => {
            const next = { ...local, to: d };
            setLocal(next);
            onChange(next);
          }}
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="secondary" onClick={reset}>Limpiar</Button>
      </div>
    </div>
  );
}

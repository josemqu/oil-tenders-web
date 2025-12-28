"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/dashboard/DatePicker";
import { shortenProductName, shortCode } from "@/lib/utils";
import { subMonths, startOfYear, format } from "date-fns";

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
  const [quickRange, setQuickRange] = useState<string>("all");

  useEffect(() => {
    setLocal(value);
    
    // Attempt to sync quickRange with current values if they match exactly
    // detailed sync logic can be added here or we can just reset to 'custom' if not matching
    // For now, if value changes externally (e.g. clear), we might want to reset quickRange to 'all' if empty
    if (!value.from && !value.to) {
        setQuickRange("all");
    } else {
        // If it doesn't match the calculated active range, set to custom.
        // This is complex so we skip strict reverse matching for this MVP 
        // and just let it be 'custom' unless explicitly set.
        // Actually, let's leave it as is, or better, purely driven by user interaction.
    }
  }, [value]);

  const reset = () => {
    setLocal({});
    setQuickRange("all");
    onChange({});
  };

  const applyQuickRange = (range: string) => {
    setQuickRange(range);
    const today = new Date();
    let from: string | undefined;
    let to: string | undefined; // typically undefined means "now" which is fine

    switch (range) {
      case "last_month":
        from = format(subMonths(today, 1), "yyyy-MM-dd");
        break;
      case "last_3_months":
        from = format(subMonths(today, 3), "yyyy-MM-dd");
        break;
      case "last_6_months":
        from = format(subMonths(today, 6), "yyyy-MM-dd");
        break;
      case "last_year":
        from = format(subMonths(today, 12), "yyyy-MM-dd");
        break;
      case "ytd":
        from = format(startOfYear(today), "yyyy-MM-dd");
        break;
      case "all":
      default:
        from = undefined;
        to = undefined;
        break;
    }

    const next = { ...local, from, to };
    setLocal(next);
    onChange(next);
  };

  const onManualDateChange = (key: 'from' | 'to', d?: string) => {
      const next = { ...local, [key]: d };
      setLocal(next);
      setQuickRange("custom"); // Invalidates the quick range selection
      onChange(next);
  };

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-background p-3 shadow-sm">
      <div className="flex flex-col">
          <label className="mb-1 text-xs text-muted-foreground">Periodo</label>
          <select
            className="h-9 rounded-md border border-border bg-background px-2 text-sm w-36"
            value={quickRange}
            onChange={(e) => applyQuickRange(e.target.value)}
          >
            <option value="all">Todo el historial</option>
            <option value="last_month">Último mes</option>
            <option value="last_3_months">Últimos 3 meses</option>
            <option value="last_6_months">Últimos 6 meses</option>
            <option value="ytd">Año Actual (YTD)</option>
            <option value="last_year">Último año</option>
            <option value="custom" disabled hidden>Personalizado</option>
          </select>
      </div>

      <div className="flex flex-col">
        <label className="mb-1 text-xs text-muted-foreground">Producto</label>
        <select
          className="h-9 rounded-md border border-border bg-background px-2 text-sm w-32"
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
          className="h-9 rounded-md border border-border bg-background px-2 text-sm w-32"
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
          className="h-9 rounded-md border border-border bg-background px-2 text-sm w-32"
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
          onChange={(d) => onManualDateChange('from', d)}
        />
      </div>
      <div className="flex flex-col">
        <DatePicker
          label="Hasta"
          value={local.to}
          onChange={(d) => onManualDateChange('to', d)}
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="secondary" onClick={reset}>Limpiar</Button>
      </div>
    </div>
  );
}

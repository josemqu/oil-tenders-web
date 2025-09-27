"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Offer = Record<string, any>;

export default function Page() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    api
      .offers()
      .then((data: any) => {
        if (!mounted) return;
        // The endpoint might return an array or an object with `items`
        const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
        setOffers(items);
      })
      .catch((e: any) => {
        if (!mounted) return;
        setError(e?.message || "Error al cargar ofertas");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const hasAny = offers && offers.length > 0;

  // Define a set of preferred columns, but fall back to dynamic keys if needed
  const preferredColumns = [
    "id",
    "title",
    "buyer",
    "country",
    "published_at",
    "deadline",
    "value",
    "currency",
  ];

  const columns = useMemo(() => {
    if (!hasAny) return preferredColumns;
    const keys = Object.keys(offers[0] || {});
    // Keep preferred order if keys exist; otherwise append other keys
    const inPreferred = preferredColumns.filter((k) => keys.includes(k));
    const rest = keys.filter((k) => !inPreferred.includes(k));
    return inPreferred.concat(rest).slice(0, 8); // limit number of columns
  }, [offers, hasAny]);

  const formatCell = (val: any) => {
    if (val == null) return "—";
    if (typeof val === "string") return val;
    if (typeof val === "number") return val.toLocaleString();
    if (typeof val === "boolean") return val ? "Sí" : "No";
    if (val instanceof Date) return val.toLocaleString();
    // Attempt to format ISO dates
    if (typeof val === "string" && /\d{4}-\d{2}-\d{2}T/.test(val)) {
      const d = new Date(val);
      if (!isNaN(d.getTime())) return d.toLocaleString();
    }
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Últimas ofertas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Cargando ofertas…</div>
          ) : error ? (
            <div className="py-10 text-center text-sm text-red-600 dark:text-red-400">{error}</div>
          ) : !hasAny ? (
            <div className="py-10 text-center text-sm text-muted-foreground">No hay ofertas para mostrar.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    {columns.map((col) => (
                      <th key={col} className="px-3 py-2 text-left font-medium text-muted-foreground">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {offers.map((o, idx) => (
                    <tr key={o.id ?? idx} className="border-b hover:bg-muted/50">
                      {columns.map((col) => (
                        <td key={col} className="px-3 py-2 align-top">
                          {formatCell(o?.[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

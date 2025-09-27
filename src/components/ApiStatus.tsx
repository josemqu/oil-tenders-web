"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

// Minimal API status indicator: a small colored dot with a title tooltip
// Colors:
// - ok => green
// - degraded/warn => yellow
// - error/unreachable/unknown => red
// - loading => gray
export default function ApiStatus() {
  const [status, setStatus] = useState<string>("loading");
  const [detail, setDetail] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const h = await api.health();
        if (cancelled) return;
        setStatus(h.status || "ok");
        setDetail(h.detail);
      } catch (e: any) {
        if (cancelled) return;
        setStatus("error");
        setDetail(e?.message || "Error consultando /health");
      }
    };

    fetchStatus();
    const id = setInterval(fetchStatus, 30000); // refresh every 30s
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const { colorClass, label } = useMemo(() => {
    const s = (status || "").toLowerCase();
    if (s === "ok" || s === "healthy" || s === "up") {
      return { colorClass: "bg-emerald-500", label: "API: OK" };
    }
    if (s.includes("warn") || s.includes("degrad") || s === "yellow") {
      return { colorClass: "bg-amber-500", label: "API: Degradado" };
    }
    if (s === "loading") {
      return { colorClass: "bg-gray-400", label: "API: Cargando" };
    }
    return { colorClass: "bg-rose-500", label: "API: Error" };
  }, [status]);

  return (
    <div className="flex items-center gap-2" title={`${label}${detail ? ` - ${detail}` : ""}`}>
      <span
        aria-label={label}
        className={
          cn(
            "inline-block h-3 w-3 rounded-full",
            colorClass,
            status === "error" ? "animate-pulse" : undefined
          )
        }
      />
    </div>
  );
}

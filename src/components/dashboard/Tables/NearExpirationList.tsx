"use client";

import { format, parseISO } from "date-fns";

export type ExpiringOffer = {
  id: string | number;
  title: string;
  closingDate: string; // ISO
  product?: string;
  country?: string;
};

export function NearExpirationList({ items }: { items: ExpiringOffer[] }) {
  return (
    <div className="rounded-lg border border-border bg-background p-0 shadow-sm">
      <div className="border-b px-4 py-3 text-sm font-medium">Ofertas próximas a vencer</div>
      <ul className="divide-y">
        {items.map((o) => (
          <li key={o.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium">{o.title}</div>
              <div className="text-xs text-muted-foreground">
                {o.product ? `${o.product} · ` : ""}
                {o.country || "—"}
              </div>
            </div>
            <div className="text-right text-sm">
              <div className="font-medium">{format(parseISO(o.closingDate), "MMM d, HH:mm")}</div>
              <div className="text-xs text-muted-foreground">cierre</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

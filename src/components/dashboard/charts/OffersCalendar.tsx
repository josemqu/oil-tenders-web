"use client";

import { addDays, format, startOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type CalendarDay = { date: string; count: number };

export function OffersCalendar({ data }: { data: CalendarDay[] }) {
  // Simple month heatmap grid (7 x ~5)
  const monthStart = startOfMonth(new Date());
  const days = Array.from({ length: 35 }).map((_, i) => {
    const d = addDays(monthStart, i);
    const key = format(d, "yyyy-MM-dd");
    const found = data.find((x) => x.date.startsWith(key));
    return { date: d, count: found?.count ?? 0 };
  });

  const scale = (n: number) => {
    if (n === 0) return "bg-muted";
    if (n < 3) return "bg-emerald-200 dark:bg-emerald-900/40";
    if (n < 6) return "bg-emerald-400 dark:bg-emerald-800/60";
    return "bg-emerald-500 dark:bg-emerald-700";
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Ofertas que cierran por día</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {days.map((d, idx) => (
            <div key={idx} className={`h-8 w-8 rounded-md ${scale(d.count)}`} title={`${format(d.date, "MMM d")}: ${d.count}`} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

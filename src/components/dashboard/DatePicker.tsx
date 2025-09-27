"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { addMonths, eachDayOfInterval, endOfMonth, format, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek } from "date-fns";
import { Button } from "@/components/ui/button";

export function DatePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (isoDate?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(() => (value ? parseISO(value) : new Date()));
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedDate = useMemo(() => (value ? parseISO(value) : undefined), [value]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const end = endOfMonth(month);
    const endPadding = addMonths(startOfMonth(month), 1);
    const allDays = eachDayOfInterval({ start, end: endPadding });
    return allDays.slice(0, 42); // 6 rows * 7 cols
  }, [month]);

  const setToday = () => {
    const today = new Date();
    onChange(format(today, "yyyy-MM-dd"));
    setMonth(today);
    setOpen(false);
  };

  const clear = () => {
    onChange(undefined);
    setOpen(false);
  };

  return (
    <div className="relative flex flex-col" ref={containerRef}>
      <label className="mb-1 text-xs text-muted-foreground">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 min-w-[10rem] items-center justify-between gap-2 rounded-md border border-border bg-background px-3 text-left text-sm hover:bg-muted"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="truncate">
          {selectedDate ? format(selectedDate, "yyyy-MM-dd") : "Seleccionar fecha"}
        </span>
        <span aria-hidden>📅</span>
      </button>
      {open && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-[18rem] rounded-lg border border-border bg-background p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <button
              className="rounded-md border border-border px-2 py-1 text-sm hover:bg-muted"
              onClick={() => setMonth((m) => addMonths(m, -1))}
            >
              ◀
            </button>
            <div className="text-sm font-medium">{format(month, "MMMM yyyy")}</div>
            <button
              className="rounded-md border border-border px-2 py-1 text-sm hover:bg-muted"
              onClick={() => setMonth((m) => addMonths(m, 1))}
            >
              ▶
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            {["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"].map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map((d, idx) => {
              const isCurMonth = isSameMonth(d, month);
              const isSelected = selectedDate && isSameDay(d, selectedDate);
              return (
                <button
                  key={idx}
                  className={
                    "h-8 rounded-md text-sm transition-colors " +
                    (isSelected
                      ? "bg-emerald-600 text-white hover:bg-emerald-600"
                      : isCurMonth
                      ? "hover:bg-muted"
                      : "text-muted-foreground/60 hover:bg-muted")
                  }
                  onClick={() => {
                    onChange(format(d, "yyyy-MM-dd"));
                    setOpen(false);
                  }}
                  title={format(d, "yyyy-MM-dd")}
                >
                  {format(d, "d")}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <Button variant="secondary" onClick={clear}>Limpiar</Button>
            <Button variant="secondary" onClick={setToday}>Hoy</Button>
          </div>
        </div>
      )}
    </div>
  );
}

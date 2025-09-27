"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function KpiCard({
  title,
  value,
  subtitle,
  icon,
  accent,
}: {
  title: string;
  value: ReactNode;
  subtitle?: string;
  icon?: ReactNode;
  accent?: "emerald" | "blue" | "violet" | "amber" | "rose";
}) {
  const ring =
    accent === "emerald"
      ? "ring-emerald-200 dark:ring-emerald-900/40"
      : accent === "blue"
      ? "ring-blue-200 dark:ring-blue-900/40"
      : accent === "violet"
      ? "ring-violet-200 dark:ring-violet-900/40"
      : accent === "amber"
      ? "ring-amber-200 dark:ring-amber-900/40"
      : accent === "rose"
      ? "ring-rose-200 dark:ring-rose-900/40"
      : "ring-muted";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Card className={`shadow-sm ring-1 ${ring}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="text-muted-foreground/80">{icon}</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold tracking-tight">{value}</div>
          {subtitle && (
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

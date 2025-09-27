"use client";

import { useMemo, useState } from "react";

export type CompanyRow = {
  company: string;
  volume: number;
  percent: number; // 0..1
  offers: number;
};

export function TopCompaniesTable({ rows }: { rows: CompanyRow[] }) {
  const [sort, setSort] = useState<keyof CompanyRow>("volume");
  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => (b[sort] as number) - (a[sort] as number));
  }, [rows, sort]);

  return (
    <div className="rounded-lg border border-border bg-background p-0 shadow-sm">
      <div className="border-b px-4 py-3 text-sm font-medium">Top empresas por volumen licitado</div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <Th onClick={() => setSort("company")}>Empresa</Th>
              <Th onClick={() => setSort("volume")}>Volumen</Th>
              <Th onClick={() => setSort("percent")}>% del total</Th>
              <Th onClick={() => setSort("offers")}>Ofertas</Th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.company} className="border-b hover:bg-muted/50">
                <td className="px-3 py-2">{r.company}</td>
                <td className="px-3 py-2">{r.volume.toLocaleString()}</td>
                <td className="px-3 py-2">{(r.percent * 100).toFixed(1)}%</td>
                <td className="px-3 py-2">{r.offers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <th
      onClick={onClick}
      className="cursor-pointer select-none px-3 py-2 text-left text-xs font-semibold text-muted-foreground hover:text-foreground"
    >
      {children}
    </th>
  );
}

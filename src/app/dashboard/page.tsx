"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { VolumeOverTime, TimePoint } from "@/components/dashboard/charts/VolumeOverTime";
import { VolumeByProduct, ProductItem } from "@/components/dashboard/charts/VolumeByProduct";
import { VolumeByCountry, CountryItem } from "@/components/dashboard/charts/VolumeByCountry";
import { OffersFunnel, FunnelItem } from "@/components/dashboard/charts/OffersFunnel";
import { PriceVsVolume, ScatterPoint } from "@/components/dashboard/charts/PriceVsVolume";
import { ExportsByBasin, BasinBar } from "@/components/dashboard/charts/ExportsByBasin";
import { OriginDestinationSankey, SankeyLink } from "@/components/dashboard/charts/OriginDestinationSankey";
import { TopCompaniesTable, CompanyRow } from "@/components/dashboard/Tables/TopCompaniesTable";
import { NearExpirationList, ExpiringOffer } from "@/components/dashboard/Tables/NearExpirationList";
import { Filters, FiltersValue } from "@/components/dashboard/Filters";
import { Droplets, Award, Percent, Gauge } from "lucide-react";
import { api } from "@/lib/api";
import { ArgentinaBasinMap, BasinPoint } from "@/components/dashboard/charts/ArgentinaBasinMap";
import { getBasinCoords, getBasinGroup } from "@/components/dashboard/charts/basins";
import { convertVolume, unitSuffix, shortenDeliveryName, type VolumeUnit } from "@/lib/utils";

type AnyOffer = Record<string, any>;

function parseNumeric(input: string): number | undefined {
  const s = input.trim();
  // Try to detect European format (1.234,56) vs US (1,234.56)
  const hasComma = s.includes(",");
  const hasDot = s.includes(".");
  let candidate = s;
  if (hasComma && (!hasDot || s.lastIndexOf(",") > s.lastIndexOf("."))) {
    // Assume comma decimal, dot thousands: 1.234,56 -> 1234.56
    candidate = s.replace(/\./g, "").replace(/,/g, ".");
  } else {
    // Assume dot decimal, comma thousands: 1,234.56 -> 1234.56
    candidate = s.replace(/,/g, "");
  }
  // Keep only first number sequence with optional sign and decimals
  const m = candidate.match(/[+-]?\d*(?:\.\d+)?/g)?.find((x) => x && /\d/.test(x));
  if (!m) return undefined;
  const n = parseFloat(m);
  return isNaN(n) ? undefined : n;
}

function pickString(o: AnyOffer, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = o?.[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return undefined;
}

function pickNumber(o: AnyOffer, keys: string[]): number | undefined {
  for (const k of keys) {
    const v = o?.[k];
    if (typeof v === "number" && !isNaN(v)) return v;
    if (typeof v === "string") {
      const n = parseNumeric(v);
      if (typeof n === "number") return n;
    }
  }
  return undefined;
}

function pickDateISO(o: AnyOffer, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = o?.[k];
    if (typeof v === "string" && /\d{4}-\d{2}-\d{2}/.test(v)) return v;
  }
  return undefined;
}

function inferStatus(o: AnyOffer): "tendered" | "active" | "awarded" {
  const s = (pickString(o, ["status", "offer_status", "state"]) || "").toLowerCase();
  if (s.includes("award") || s === "adjudicada" || s === "awarded") return "awarded";
  if (s.includes("open") || s.includes("active") || s.includes("ongoing")) return "active";
  // boolean awarded flag
  if (o?.awarded === true) return "awarded";
  return "tendered";
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FiltersValue>({});
  const [offers, setOffers] = useState<AnyOffer[]>([]);
  const [unit, setUnit] = useState<VolumeUnit>("m3");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    api
      .offersMany(1000)
      .then((items) => {
        if (!alive) return;
        setOffers(items);
      })
      .catch((e: any) => {
        if (!alive) return;
        setError(e?.message || "Error cargando datos");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Initialize filters from URL or localStorage
  useEffect(() => {
    // Parse from URL
    const urlFilters: FiltersValue = {
      product: searchParams.get("product") || undefined,
      country: searchParams.get("country") || undefined,
      company: searchParams.get("company") || undefined,
      from: searchParams.get("from") || undefined,
      to: searchParams.get("to") || undefined,
    };
    const hasUrl = Object.values(urlFilters).some((v) => v && String(v).length > 0);
    if (hasUrl) {
      setFilters(urlFilters);
      try {
        localStorage.setItem("OIL_TENDERS_FILTERS", JSON.stringify(urlFilters));
      } catch {}
      return;
    }
    // Fallback to localStorage
    try {
      const raw = localStorage.getItem("OIL_TENDERS_FILTERS");
      if (raw) {
        const parsed = JSON.parse(raw);
        setFilters(parsed || {});
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist filters to URL and localStorage
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.product) params.set("product", filters.product);
    if (filters.country) params.set("country", filters.country);
    if (filters.company) params.set("company", filters.company);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    const qs = params.toString();
    const url = qs ? `/dashboard?${qs}` : `/dashboard`;
    // Typed routes may reject query strings; cast to any to update URL
    router.replace(url as any);
    try {
      localStorage.setItem("OIL_TENDERS_FILTERS", JSON.stringify(filters));
    } catch {}
  }, [filters, router]);

  const filteredProduct = useMemo(() => filters.product?.toLowerCase().trim(), [filters]);
  const filteredCountry = useMemo(() => filters.country?.toLowerCase().trim(), [filters]);
  const filteredCompany = useMemo(() => filters.company?.toLowerCase().trim(), [filters]);

  const filtered = useMemo(() => {
    return offers.filter((o) => {
      const product = (pickString(o, ["product", "product_type"]) || "").toLowerCase();
      const country = (pickString(o, ["country", "origin_country", "offering_country", "destination_country"]) || "").toLowerCase();
      const company = (pickString(o, ["company", "buyer", "seller"]) || "").toLowerCase();
      const dateISO = pickDateISO(o, ["date", "published_at", "created_at", "deadline", "closing_date"]) || "";
      const okProduct = !filteredProduct || product.includes(filteredProduct);
      const okCountry = !filteredCountry || country.includes(filteredCountry);
      const okCompany = !filteredCompany || company.includes(filteredCompany);
      const okFrom = !filters.from || (dateISO && dateISO >= filters.from);
      const okTo = !filters.to || (dateISO && dateISO <= filters.to);
      return okProduct && okCountry && okCompany && okFrom && okTo;
    });
  }, [offers, filteredProduct, filteredCountry, filteredCompany, filters.from, filters.to]);

  const productOptions = useMemo(() => {
    const set = new Set<string>();
    for (const o of offers) {
      const p = pickString(o, ["product", "product_type"]);
      if (p) set.add(p);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b)).slice(0, 100);
  }, [offers]);

  const countryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const o of offers) {
      const vals = [
        pickString(o, ["country", "origin_country", "offering_country"]),
        pickString(o, ["destination_country", "destination"]),
      ];
      for (const v of vals) if (v) set.add(v);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b)).slice(0, 100);
  }, [offers]);

  const companyOptions = useMemo(() => {
    const set = new Set<string>();
    for (const o of offers) {
      const c = pickString(o, ["company", "buyer", "seller"]);
      if (c) set.add(c);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b)).slice(0, 100);
  }, [offers]);

  const kpis = useMemo(() => {
    let tenderedVol = 0;
    let awardedVol = 0;
    const prices: number[] = [];
    let activeCount = 0;
    let awardedCount = 0;

    const now = new Date().toISOString();
    for (const o of filtered) {
      const vol = pickNumber(o, ["tendered_volume", "awarded_volume", "volume", "qty", "quantity", "bbl", "bbls"]) || 0;
      const price = pickNumber(o, ["tendered_price", "price", "unit_price"]);
      const status = inferStatus(o);
      const deadline = pickDateISO(o, ["deadline", "closing_date"]) || "";

      tenderedVol += vol || 0;
      if (status === "awarded") {
        awardedVol += pickNumber(o, ["awarded_volume", "volume", "qty", "quantity"]) || 0;
        awardedCount += 1;
      }
      if (status === "active" || (!!deadline && deadline > now)) activeCount += 1;
      if (typeof price === "number" && !isNaN(price)) prices.push(price);
    }
    const awardRate = filtered.length ? awardedCount / filtered.length : 0;
    const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    // Convert for display
    const tenderedConv = convertVolume(tenderedVol, "m3", unit);
    const awardedConv = convertVolume(awardedVol, "m3", unit);
    return { tenderedVolume: tenderedConv, awardedVolume: awardedConv, awardRate, avgPrice, activeOffers: activeCount };
  }, [filtered, unit]);

  // Sankey: Basin (source) -> Delivery Location (target)
  const sankeyLinks: SankeyLink[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of filtered) {
      const basin = (pickString(o, ["basin", "cuenca", "basin_name"]) || "N/A").trim();
      const delivery =
        (pickString(o, [
          "delivery_location",
          "delivery",
          "location",
          "port",
          "terminal",
          "destination",
          "destination_port",
        ]) || "N/A").trim();
      const vol = pickNumber(o, ["tendered_volume", "volume", "qty", "quantity"]) || 0;
      const deliveryShort = shortenDeliveryName(delivery);
      const key = `${basin}__${deliveryShort}`;
      map.set(key, (map.get(key) || 0) + vol);
    }
    // Convert and sort by value; assign color by basin group
    const groupColors: Record<string, string> = {
      "Neuquina": "#22c55e",
      "Golfo San Jorge": "#3b82f6",
      "Austral": "#ef4444",
      "Noroeste": "#a855f7",
      "Cuyana": "#f59e0b",
      "Otro": "#94a3b8",
    };
    const links: (SankeyLink & { color?: string; stroke?: string })[] = Array.from(map.entries()).map(([k, v]) => {
      const [source, target] = k.split("__");
      const g = getBasinGroup(source) || "Otro";
      const color = groupColors[g] || groupColors["Otro"];
      return { source, target, value: convertVolume(v, "m3", unit), color, stroke: color };
    });
    return links.sort((a, b) => b.value - a.value).slice(0, 40); // cap for readability
  }, [filtered, unit]);

  // Basin map aggregation (Argentina)
  const basinMapData: BasinPoint[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of filtered) {
      const basin = (pickString(o, ["basin", "cuenca", "basin_name"]) || "Desconocida").trim();
      const vol = pickNumber(o, ["tendered_volume", "volume", "qty", "quantity", "bbl", "bbls"]) || 0;
      map.set(basin, (map.get(basin) || 0) + vol);
    }
    const arr: BasinPoint[] = [];
    for (const [name, value] of map.entries()) {
      const coords = getBasinCoords(name) || [-64.0, -40.5];
      arr.push({ name, coordinates: coords, value: convertVolume(value, "m3", unit) });
    }
    return arr.sort((a, b) => b.value - a.value);
  }, [filtered, unit]);

  const series: TimePoint[] = useMemo(() => {
    const map = new Map<string, { tendered: number; awarded: number }>();
    for (const o of filtered) {
      const d = (pickDateISO(o, ["date", "published_at", "created_at"]) || "").slice(0, 10);
      if (!d) continue;
      const vol = pickNumber(o, ["tendered_volume", "volume", "qty", "quantity"]) || 0;
      const isAwarded = inferStatus(o) === "awarded";
      const cur = map.get(d) || { tendered: 0, awarded: 0 };
      cur.tendered += vol;
      if (isAwarded) cur.awarded += pickNumber(o, ["awarded_volume", "volume", "qty", "quantity"]) || 0;
      map.set(d, cur);
    }
    const converted = Array.from(map.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([date, v]) => ({
        date,
        tendered: convertVolume(v.tendered, "m3", unit),
        awarded: convertVolume(v.awarded, "m3", unit),
      }));
    return converted;
  }, [filtered, unit]);

  const byProduct: ProductItem[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of filtered) {
      const p = pickString(o, ["product", "product_type"]) || "Otro";
      const vol = pickNumber(o, ["tendered_volume", "volume", "qty", "quantity"]) || 0;
      map.set(p, (map.get(p) || 0) + vol);
    }
    return Array.from(map.entries())
      .map(([product, volume]) => ({ product, volume: convertVolume(volume, "m3", unit) }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 12);
  }, [filtered, unit]);

  const byCountry: CountryItem[] = useMemo(() => {
    const mapOffer = new Map<string, number>();
    const mapDest = new Map<string, number>();
    for (const o of filtered) {
      const offerC = pickString(o, ["country", "origin_country", "offering_country"]) || "N/A";
      const destC = pickString(o, ["destination_country", "destination"]) || offerC;
      const vol = pickNumber(o, ["tendered_volume", "volume", "qty", "quantity"]) || 0;
      mapOffer.set(offerC, (mapOffer.get(offerC) || 0) + vol);
      mapDest.set(destC, (mapDest.get(destC) || 0) + vol);
    }
    const countries = new Set([...mapOffer.keys(), ...mapDest.keys()]);
    return Array.from(countries).map((c) => ({
      country: c,
      offering: convertVolume(mapOffer.get(c) || 0, "m3", unit),
      destination: convertVolume(mapDest.get(c) || 0, "m3", unit),
    }))
    .sort((a, b) => b.offering + b.destination - (a.offering + a.destination))
    .slice(0, 12);
  }, [filtered, unit]);

  const funnel: FunnelItem[] = useMemo(() => {
    let total = filtered.length;
    let active = 0;
    let awarded = 0;
    const now = new Date().toISOString();
    for (const o of filtered) {
      const status = inferStatus(o);
      const deadline = pickDateISO(o, ["deadline", "closing_date"]) || "";
      if (status === "awarded") awarded += 1;
      if (status === "active" || (!!deadline && deadline > now)) active += 1;
    }
    return [
      { name: "Licitado", value: total },
      { name: "Activas", value: active },
      { name: "Adjudicadas", value: awarded },
    ];
  }, [filtered]);

  const scatter: ScatterPoint[] = useMemo(() => {
    const pts: ScatterPoint[] = [];
    for (const o of filtered) {
      const price = pickNumber(o, ["tendered_price", "price", "unit_price"]);
      const vol = pickNumber(o, ["tendered_volume", "volume", "qty", "quantity"]);
      if (price == null || vol == null) continue;
      pts.push({ price, volume: vol, status: inferStatus(o) });
    }
    return pts.slice(0, 1000);
  }, [filtered]);

  // Exports by basin (total volume per basin)
  const exportsByBasin: BasinBar[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of filtered) {
      const basin = (pickString(o, ["basin", "cuenca", "basin_name"]) || "Desconocida").trim();
      const vol = pickNumber(o, ["tendered_volume", "volume", "qty", "quantity", "bbl", "bbls"]) || 0;
      map.set(basin, (map.get(basin) || 0) + vol);
    }
    return Array.from(map.entries())
      .map(([basin, volume]) => ({ basin, volume: convertVolume(volume, "m3", unit) }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 12);
  }, [filtered, unit]);

  const companies: CompanyRow[] = useMemo(() => {
    const mapVol = new Map<string, { volume: number; offers: number }>();
    let totalVol = 0;
    for (const o of filtered) {
      const company = pickString(o, ["company", "buyer", "seller"]) || "N/A";
      const vol = pickNumber(o, ["tendered_volume", "volume", "qty", "quantity"]) || 0;
      totalVol += vol;
      const cur = mapVol.get(company) || { volume: 0, offers: 0 };
      cur.volume += vol;
      cur.offers += 1;
      mapVol.set(company, cur);
    }
    const rows: CompanyRow[] = Array.from(mapVol.entries()).map(([company, v]) => ({
      company,
      volume: convertVolume(v.volume, "m3", unit),
      percent: totalVol ? v.volume / totalVol : 0,
      offers: v.offers,
    }));
    return rows.sort((a, b) => b.volume - a.volume).slice(0, 20);
  }, [filtered, unit]);

  const expiring: ExpiringOffer[] = useMemo(() => {
    const items: ExpiringOffer[] = [];
    for (const o of filtered) {
      const dateISO = pickDateISO(o, ["deadline", "closing_date"]) || "";
      if (!dateISO) continue;
      items.push({
        id: o.id ?? o.uuid ?? Math.random(),
        title: pickString(o, ["title", "name", "product"]) || "Oferta",
        closingDate: dateISO,
        product: pickString(o, ["product", "product_type"]) || undefined,
        country: pickString(o, ["country", "destination_country", "offering_country"]) || undefined,
      });
    }
    return items.sort((a, b) => (a.closingDate < b.closingDate ? -1 : 1)).slice(0, 10);
  }, [filtered]);

  const onDrillProduct = (product: string) => setFilters((f) => ({ ...f, product }));
  const onDrillCountry = (country: string) => setFilters((f) => ({ ...f, country }));

  return (
    <div className="grid gap-6">
      {/* Filters */}
      <Filters
        value={filters}
        onChange={setFilters}
        productOptions={productOptions}
        countryOptions={countryOptions}
        companyOptions={companyOptions}
      />

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title={`Volumen licitado (${unitSuffix(unit).trim()})`} value={`${kpis.tenderedVolume.toLocaleString()}${unitSuffix(unit)}`} icon={<Droplets className="h-5 w-5" />} accent="blue" />
        <KpiCard title={`Volumen adjudicado (${unitSuffix(unit).trim()})`} value={`${kpis.awardedVolume.toLocaleString()}${unitSuffix(unit)}`} icon={<Award className="h-5 w-5" />} accent="emerald" />
        <KpiCard title="Tasa de adjudicación" value={`${(kpis.awardRate * 100).toFixed(1)}%`} icon={<Percent className="h-5 w-5" />} accent="violet" />
        <KpiCard title="Precio promedio" value={`$${kpis.avgPrice.toFixed(2)}`} icon={<Gauge className="h-5 w-5" />} accent="amber" />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <VolumeOverTime data={series} unit={unit} />
        </div>
        <OffersFunnel data={funnel} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <VolumeByProduct data={byProduct} onClick={onDrillProduct} unit={unit} />
        <VolumeByCountry data={byCountry} onClick={onDrillCountry} unit={unit} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PriceVsVolume data={scatter} />
        <ExportsByBasin data={exportsByBasin} unit={unit} />
      </div>

      {/* Sankey: Origin -> Destination */}
      <div className="grid grid-cols-1 gap-6">
        <OriginDestinationSankey links={sankeyLinks} unit={unit} />
      </div>

      {/* Tables + Map */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 auto-rows-[minmax(0,1fr)] items-stretch">
        <div className="lg:col-span-2 h-full">
          <TopCompaniesTable rows={companies} />
        </div>
        <div className="h-full">
          <ArgentinaBasinMap data={basinMapData} unit={unit} />
        </div>
      </div>

      {/* Units selector */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        Unidad de volumen:
        <button
          className={`rounded border px-2 py-1 ${unit === "m3" ? "bg-foreground text-background" : "hover:bg-muted"}`}
          onClick={() => setUnit("m3")}
        >
          m3
        </button>
        <button
          className={`rounded border px-2 py-1 ${unit === "bbl" ? "bg-foreground text-background" : "hover:bg-muted"}`}
          onClick={() => setUnit("bbl")}
        >
          bbl
        </button>
      </div>

      {/* Placeholder for drill-down navigation */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-muted-foreground">
        Click en barras para filtrar por producto o país. Limpia o ajusta los filtros arriba para explorar.
      </motion.div>

      {loading && (
        <div className="text-xs text-muted-foreground">Cargando datos…</div>
      )}
      {error && (
        <div className="text-xs text-rose-500">{error}</div>
      )}
    </div>
  );
}

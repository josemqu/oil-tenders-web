import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://oil-tenders-api.up.railway.app";

// Volume units and conversion
export type VolumeUnit = "m3" | "bbl";
export const M3_TO_BBL = 6.28981; // 1 m3 = 6.28981 barrels

export function convertVolume(value: number, from: VolumeUnit, to: VolumeUnit): number {
  if (typeof value !== "number" || isNaN(value)) return 0;
  if (from === to) return value;
  if (from === "m3" && to === "bbl") return value * M3_TO_BBL;
  if (from === "bbl" && to === "m3") return value / M3_TO_BBL;
  return value;
}

export function unitSuffix(u: VolumeUnit): string {
  return u === "bbl" ? " bbl" : " m3";
}

// Product name normalization and shortening
const PRODUCT_SHORT_DICT: Record<string, string> = {
  // crude oil
  "crude": "Crudo",
  "crude oil": "Crudo",
  "petroleo crudo": "Crudo",
  "petróleo crudo": "Crudo",
  "brent": "Brent",
  "wti": "WTI",
  // diesel / gasoil
  "diesel": "Diesel",
  "diesel oil": "Diesel",
  "gasoil": "Diesel",
  "gas oil": "Diesel",
  "diesel (10 ppm)": "Diesel 10ppm",
  "diesel (50 ppm)": "Diesel 50ppm",
  // gasoline / nafta
  "gasolina": "Nafta",
  "nafta": "Nafta",
  "mogas": "Nafta",
  // jet
  "jet a1": "Jet A1",
  "jet-a1": "Jet A1",
  // fuel oil
  "fuel oil": "Fuel Oil",
  // lpg / glp
  "lpg": "GLP",
  "glp": "GLP",
  "propano": "GLP",
  "butano": "GLP",
  // others
  "kerosene": "Kerosene",
  "bunker": "Bunker",
};

function normalizeStr(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[–—]/g, "-")
    .replace(/\s+\/\s+/g, "/")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function titleCase(s: string) {
  return s.replace(/\b([a-z])/g, (m) => m.toUpperCase());
}

// Shorten and standardize product labels while keeping them human-friendly
export function shortenProductName(name: string): string {
  if (!name) return "";
  const raw = String(name).trim();
  const n = normalizeStr(raw);

  // Exact dictionary match
  if (PRODUCT_SHORT_DICT[n]) return PRODUCT_SHORT_DICT[n];

  // Pattern-based rules
  // ppm compacting: "(10 ppm)" => "10ppm"
  const ppmMatch = n.match(/(\d+)\s*ppm/);
  if (ppmMatch) {
    if (n.includes("diesel")) return `Diesel ${ppmMatch[1]}ppm`;
  }

  // If contains keywords pick canonical
  if (/(crude|petr\w* crudo)/.test(n)) return "Crudo";
  if (/(diesel|gas ?oil|gasoil)/.test(n)) return "Diesel";
  if (/(gasolina|nafta|mogas)/.test(n)) return "Nafta";
  if (/(jet[ -]?a1)/.test(n)) return "Jet A1";
  if (/fuel oil/.test(n)) return "Fuel Oil";
  if (/(lpg|glp|propano|butano)/.test(n)) return "GLP";

  // Remove extra qualifiers in parentheses, keep first 2 words
  const noParens = n.replace(/\([^)]*\)/g, "").trim();
  const words = noParens.split(/\s+/).slice(0, 3).join(" ");
  const base = words || n;
  return titleCase(base);
}

// Create a short stable code from a string (used to disambiguate labels)
export function shortCode(s: string, length = 4): string {
  let h = 2166136261 >>> 0; // FNV-like
  const str = String(s);
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return (h >>> 0).toString(36).slice(0, length);
}

// Delivery/location normalization and shortening
const DELIVERY_SHORT_DICT: Record<string, string> = {
  "puerto de buenos aires": "Pto. Buenos Aires",
  "port of buenos aires": "Pto. Buenos Aires",
  "buenos aires": "Buenos Aires",
  "bahia blanca": "Bahía Blanca",
  "bahía blanca": "Bahía Blanca",
  "dock sud": "Dock Sud",
  "zarate": "Zárate",
  "zárate": "Zárate",
  "campana": "Campana",
  "san lorenzo": "San Lorenzo",
  "rosario": "Rosario",
  "necochea": "Necochea",
  "quequen": "Quequén",
  "quequén": "Quequén",
  "comodoro rivadavia": "Comodoro Rivadavia",
  "caleta paula": "Caleta Paula",
  "ushuaia": "Ushuaia",
  "punta quilla": "Punta Quilla",
  "punta loyola": "Punta Loyola",
};

export function shortenDeliveryName(name: string): string {
  if (!name) return "";
  const raw = String(name).trim();
  const n = normalizeStr(raw);

  // Exact dictionary
  if (DELIVERY_SHORT_DICT[n]) return DELIVERY_SHORT_DICT[n];

  // Remove common prefixes
  let s = n
    .replace(/^(puerto|puerta|port)\s+(de|of)\s+/i, "")
    .replace(/^(terminal|terminal\s+de)\s+/i, "")
    .replace(/^(muelle)\s+/i, "")
    .replace(/^pto\.?\s+/i, "")
    .trim();

  // Keep up to 3 words and title case
  s = s.replace(/\([^)]*\)/g, "").trim();
  const words = s.split(/\s+/).slice(0, 3).join(" ");
  if (DELIVERY_SHORT_DICT[words]) return DELIVERY_SHORT_DICT[words];
  return titleCase(words || s || raw);
}

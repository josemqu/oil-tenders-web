// Coordinates (lon, lat) for Argentine oil & gas basins or sub-basins
// Source: provided JSON (centers/ranges) and approximations
export const BASIN_COORDS: Record<string, [number, number]> = {
  // Neuquina sub-zones
  "Neuquina – Neuquén (Medanito)": [-69.126565, -38.543328],
  "Neuquina – Río Negro (Medanito)": [-67.385008, -38.956695], // coordenadas de Rio Negro, Argentina
  "Neuquina – La Pampa (Medanito)": [-67.965527, -37.288923], // coordenadas de La Pampa, Argentina
  "Neuquina – Mendoza": [-69.378964, -35.685917],

  // Extra Neuquina variants by province keywords
  "Neuquina – Neuquén": [-69.126565, -38.543328],
  "Neuquina – Río Negro": [-67.385008, -38.956695],
  "Neuquina – La Pampa": [-67.965527, -37.288923],
  // "Neuquina – Mendoza" variant already covered above

  // Aggregate Neuquina fallback
  Neuquina: [-69.126565, -38.543328],
  "Cuenca Neuquina": [-69.126565, -38.543328],

  // Golfo San Jorge (use range midpoint)
  "Golfo San Jorge – Chubut (Escalante / Cañadón Seco)": [
    (-71.0 + -66.0) / 2,
    (-47.0 + -45.0) / 2,
  ], // [-68.5, -46]
  "Golfo San Jorge": [-68.5, -46.0],
  "Cuenca del Golfo San Jorge": [-68.5, -46.0],
  // Province-specific emphasis for GSJ
  "Golfo San Jorge – Chubut": [-68.7, -45.8],
  "Golfo San Jorge – Santa Cruz": [-68.3, -46.4],

  // Austral variants
  "Austral – Tierra del Fuego Off Shore (Hidra)": [-67.0, -54.0],
  "Austral – Santa Cruz On Shore": [-70.0, -50.0],
  "Austral – Santa Cruz Off Shore": [-68.0, -52.0],
  "Austral – Tierra del Fuego – San Sebastián": [-66.5, -54.5],
  Austral: [-68.5, -52.0],
  "Cuenca Austral": [-68.5, -52.0],
  // Extra Austral variants
  "Austral – Tierra del Fuego": [-67.5, -54.3],
  "Austral – Magallanes": [-71.0, -53.0], // referencia general (lado chileno), útil si aparece en datos

  // Noroeste
  "Noroeste – Salta": [-65.5, -24.5],
  Noroeste: [-65.5, -24.5],
  "Cuenca del Noroeste": [-65.5, -24.5],
  // Extra NW variants
  "Noroeste – Jujuy": [-65.3, -23.3],
  "Noroeste – Formosa": [-58.2, -26.2],

  // Other basins for completeness
  Cuyana: [-68.8, -32.6],
  "Cuenca Cuyana": [-68.8, -32.6],
  // Province-level hints for Cuyana
  "Cuyana – Mendoza": [-68.845, -32.889],
  "Cuyana – San Juan": [-68.521, -31.535],
  "Cuyana – San Luis": [-66.335, -33.296],
};

export function getBasinCoords(name: string): [number, number] | undefined {
  if (!name) return undefined;

  // Exact match first (case-sensitive then insensitive)
  if (BASIN_COORDS[name]) return BASIN_COORDS[name];
  const exactInsensitive = Object.keys(BASIN_COORDS).find(
    (k) => k.toLowerCase() === name.toLowerCase()
  );
  if (exactInsensitive) return BASIN_COORDS[exactInsensitive];

  // Normalize accents and punctuation for robust matching
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[–—]/g, "-")
      .replace(/\s+\/\s+/g, "/")
      .replace(/\s{2,}/g, " ")
      .trim();

  const n = norm(name);

  // Token helpers
  const has = (kw: string | RegExp) =>
    typeof kw === "string" ? n.includes(norm(kw)) : kw.test(n);

  // Neuquina sub-zones by province
  if (has("neuquina") || has("cuenca neuquina")) {
    if (has("rio negro") || has("r\u00EDo negro")) return BASIN_COORDS["Neuquina – Río Negro (Medanito)"];
    if (has("la pampa")) return BASIN_COORDS["Neuquina – La Pampa (Medanito)"];
    if (has("mendoza")) return BASIN_COORDS["Neuquina – Mendoza"];
    if (has("neuquen") || has("neuqu\u00E9n")) return BASIN_COORDS["Neuquina – Neuquén (Medanito)"];
    // fallback to aggregate Neuquina centroid
    return BASIN_COORDS["Neuquina"];
  }

  // Golfo San Jorge sub-zones by province
  if (has("golfo") || has("san jorge")) {
    if (has("chubut")) return BASIN_COORDS["Golfo San Jorge – Chubut"];
    if (has("santa cruz")) return BASIN_COORDS["Golfo San Jorge – Santa Cruz"];
    return BASIN_COORDS["Golfo San Jorge"];
  }

  // Austral: onshore/offshore and province
  if (has("austral")) {
    const offshore = has("off") || has("offshore") || has("off shore") || has("mar") || has("costa afuera");
    if ((has("tierra del fuego") || has("tdf")) && offshore) return BASIN_COORDS["Austral – Tierra del Fuego Off Shore (Hidra)"];
    if (has("santa cruz") && offshore) return BASIN_COORDS["Austral – Santa Cruz Off Shore"];
    if (has("san sebastian") || has("san sebasti\u00E1n")) return BASIN_COORDS["Austral – Tierra del Fuego – San Sebastián"];
    if (has("santa cruz")) return BASIN_COORDS["Austral – Santa Cruz On Shore"];
    if (has("tierra del fuego")) return BASIN_COORDS["Austral – Tierra del Fuego"];
    return BASIN_COORDS["Cuenca Austral"];
  }

  // Noroeste by province
  if (has("noroeste") || has("noa") || has("noroeste argentino")) {
    if (has("jujuy")) return BASIN_COORDS["Noroeste – Jujuy"];
    if (has("salta")) return BASIN_COORDS["Noroeste – Salta"];
    if (has("formosa")) return BASIN_COORDS["Noroeste – Formosa"];
    return BASIN_COORDS["Cuenca del Noroeste"];
  }

  // Cuyana by province
  if (has("cuyana") || has("cuenca cuyana")) {
    if (has("mendoza")) return BASIN_COORDS["Cuyana – Mendoza"];
    if (has("san juan")) return BASIN_COORDS["Cuyana – San Juan"];
    if (has("san luis")) return BASIN_COORDS["Cuyana – San Luis"];
    return BASIN_COORDS["Cuenca Cuyana"];
  }

  // Generic province hints when basin name includes only province
  if (has("salta")) return BASIN_COORDS["Noroeste – Salta"];
  if (has("jujuy")) return BASIN_COORDS["Noroeste – Jujuy"];
  if (has("rio negro") || has("r\u00EDo negro")) return BASIN_COORDS["Neuquina – Río Negro (Medanito)"];
  if (has("neuquen") || has("neuqu\u00E9n")) return BASIN_COORDS["Neuquina – Neuquén (Medanito)"];
  if (has("la pampa")) return BASIN_COORDS["Neuquina – La Pampa (Medanito)"];
  if (has("mendoza")) return BASIN_COORDS["Neuquina – Mendoza"];

  return undefined;
}

// Returns a normalized basin group for coloring/aggregation purposes
// Possible values: "Neuquina", "Golfo San Jorge", "Austral", "Noroeste", "Cuyana"
export function getBasinGroup(name: string | undefined | null): string | undefined {
  if (!name) return undefined;
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[–—]/g, "-")
      .replace(/\s+\/\s+/g, "/")
      .replace(/\s{2,}/g, " ")
      .trim();
  const n = norm(name);

  // Group detection by keywords
  if (n.includes("neuquina") || n.includes("neuquen") || n.includes("medanito")) return "Neuquina";
  if (n.includes("golfo") || n.includes("san jorge")) return "Golfo San Jorge";
  if (
    n.includes("austral") ||
    n.includes("tierra del fuego") ||
    n.includes("santa cruz") ||
    n.includes("san sebastian") ||
    n.includes("san sebasti\u00e1n")
  )
    return "Austral";
  if (
    n.includes("noroeste") ||
    n.includes("noa") ||
    n.includes("salta") ||
    n.includes("jujuy") ||
    n.includes("formosa")
  )
    return "Noroeste";
  if (
    n.includes("cuyana") ||
    n.includes("mendoza") ||
    n.includes("san juan") ||
    n.includes("san luis")
  )
    return "Cuyana";

  return undefined;
}

// Coordinates (lon, lat) for Argentine oil & gas basins or sub-basins
// Source: provided JSON (centers/ranges) and approximations
export const BASIN_COORDS: Record<string, [number, number]> = {
  // Neuquina sub-zones
  "Neuquina – Neuquén (Medanito)": [-69.126565, -38.543328],
  "Neuquina – Río Negro (Medanito)": [-67.385008, -38.956695], // coordenadas de Rio Negro, Argentina
  "Neuquina – La Pampa (Medanito)": [-67.965527, -37.288923], // coordenadas de La Pampa, Argentina
  "Neuquina – Mendoza": [-69.378964, -35.685917],

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

  // Austral variants
  "Austral – Tierra del Fuego Off Shore (Hidra)": [-67.0, -54.0],
  "Austral – Santa Cruz On Shore": [-70.0, -50.0],
  "Austral – Santa Cruz Off Shore": [-68.0, -52.0],
  "Austral – Tierra del Fuego – San Sebastián": [-66.5, -54.5],
  Austral: [-68.5, -52.0],
  "Cuenca Austral": [-68.5, -52.0],

  // Noroeste
  "Noroeste – Salta": [-65.5, -24.5],
  Noroeste: [-65.5, -24.5],
  "Cuenca del Noroeste": [-65.5, -24.5],

  // Other basins for completeness
  Cuyana: [-68.8, -32.6],
  "Cuenca Cuyana": [-68.8, -32.6],
};

export function getBasinCoords(name: string): [number, number] | undefined {
  if (!name) return undefined;
  // Try exact, then case-insensitive
  if (BASIN_COORDS[name]) return BASIN_COORDS[name];
  const key = Object.keys(BASIN_COORDS).find(
    (k) => k.toLowerCase() === name.toLowerCase()
  );
  if (key) return BASIN_COORDS[key];
  // Heuristics: map by inclusion for common labels
  const n = name.toLowerCase();
  if (n.includes("neuquina") && n.includes("neuqu"))
    return BASIN_COORDS["Neuquina – Neuquén (Medanito)"];
  if (n.includes("neuquina") && n.includes("río negro"))
    return BASIN_COORDS["Neuquina – Río Negro (Medanito)"];
  if (n.includes("neuquina") && n.includes("la pampa"))
    return BASIN_COORDS["Neuquina – La Pampa (Medanito)"];
  if (n.includes("neuquina") && n.includes("mendoza"))
    return BASIN_COORDS["Neuquina – Mendoza"];
  if (n.includes("golfo") || n.includes("san jorge"))
    return BASIN_COORDS["Golfo San Jorge"];
  if (n.includes("austral") && n.includes("fuego") && n.includes("off"))
    return BASIN_COORDS["Austral – Tierra del Fuego Off Shore (Hidra)"];
  if (n.includes("austral") && n.includes("santa cruz") && n.includes("off"))
    return BASIN_COORDS["Austral – Santa Cruz Off Shore"];
  if (n.includes("austral") && n.includes("santa cruz"))
    return BASIN_COORDS["Austral – Santa Cruz On Shore"];
  if (n.includes("austral") && n.includes("san sebastián"))
    return BASIN_COORDS["Austral – Tierra del Fuego – San Sebastián"];
  if (n.includes("noroeste") || n.includes("salta"))
    return BASIN_COORDS["Noroeste – Salta"];
  return undefined;
}

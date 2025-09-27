// Coordinates (lon, lat) for main Argentine oil & gas basins (approximate centroids)
// Source: approximations based on public maps. Adjust as needed.
export const BASIN_COORDS: Record<string, [number, number]> = {
  // Cuenca Neuquina (provincias: Neuquén, Río Negro, La Pampa, Mendoza)
  Neuquina: [-69.6, -38.6],
  "Cuenca Neuquina": [-69.6, -38.6],

  // Cuenca del Golfo San Jorge (Chubut y Santa Cruz)
  "Golfo San Jorge": [-67.3, -46.5],
  "Cuenca del Golfo San Jorge": [-67.3, -46.5],

  // Cuenca Austral (sur de Santa Cruz y Tierra del Fuego)
  Austral: [-68.2, -50.5],
  "Cuenca Austral": [-68.2, -50.5],

  // Cuenca Cuyana (Mendoza y San Juan)
  Cuyana: [-68.8, -32.6],
  "Cuenca Cuyana": [-68.8, -32.6],

  // Cuenca del Noroeste (Salta, Jujuy, Formosa)
  Noroeste: [-64.5, -24.5],
  "Cuenca del Noroeste": [-64.5, -24.5],
};

export function getBasinCoords(name: string): [number, number] | undefined {
  if (!name) return undefined;
  // Try exact, then case-insensitive
  if (BASIN_COORDS[name]) return BASIN_COORDS[name];
  const key = Object.keys(BASIN_COORDS).find((k) => k.toLowerCase() === name.toLowerCase());
  return key ? BASIN_COORDS[key] : undefined;
}

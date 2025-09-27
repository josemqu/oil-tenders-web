"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup, Graticule } from "react-simple-maps";

// Public topojson for Argentina provinces
const ARG_TOPOJSON =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/argentina/argentina-provinces.json";

export type BasinPoint = {
  name: string;
  coordinates: [number, number]; // [lon, lat]
  value: number; // total volume
};

export function ArgentinaBasinMap({ data }: { data: BasinPoint[] }) {
  // Compute max for sizing
  const max = Math.max(1, ...data.map((d) => d.value || 0));
  const radius = (v: number) => {
    // 6px..26px scaled by sqrt for better visual
    const r = 6 + 20 * Math.sqrt(v / max);
    return Math.max(6, Math.min(26, r));
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Volumen ofrecido por cuenca</CardTitle>
      </CardHeader>
      <CardContent className="h-96">
        <ComposableMap projection="geoMercator" projectionConfig={{ scale: 600 }} className="h-full w-full">
          <ZoomableGroup center={[-65, -40]} zoom={1.5}>
            <Graticule stroke="#94a3b8" strokeOpacity={0.25} />
            <Geographies geography={ARG_TOPOJSON}>
              {({ geographies }: any) =>
                (geographies as any[]).map((geo: any) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: { fill: "#e2e8f0", stroke: "#334155", strokeWidth: 0.8 },
                      hover: { fill: "#cbd5e1", stroke: "#334155", strokeWidth: 1 },
                      pressed: { fill: "#cbd5e1", stroke: "#334155", strokeWidth: 1 },
                    }}
                  />
                ))
              }
            </Geographies>
            {data.map((b) => (
              <Marker key={b.name} coordinates={b.coordinates}>
                <circle r={radius(b.value)} fill="#22c55e" fillOpacity={0.6} stroke="#16a34a" strokeWidth={1.5} />
                <title>
                  {b.name}: {b.value.toLocaleString()} bbl
                </title>
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>
      </CardContent>
    </Card>
  );
}

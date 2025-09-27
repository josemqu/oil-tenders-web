"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
  Graticule,
  Sphere,
} from "react-simple-maps";
import { useState } from "react";

// Use world-atlas from unpkg CDN (commonly used with react-simple-maps)
const WORLD_110M = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

export type BasinPoint = {
  name: string;
  coordinates: [number, number]; // [lon, lat]
  value: number; // total volume
};

export function ArgentinaBasinMap({ data }: { data: BasinPoint[] }) {
  // Compute max for sizing
  const max = Math.max(1, ...data.map((d) => d.value || 0));
  const radius = (v: number) => {
    const r = 6 + 20 * Math.sqrt(v / max);
    return Math.max(6, Math.min(26, r));
  };

  const [hover, setHover] = useState<{
    name: string;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Volumen ofrecido por cuenca</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full aspect-[6/11]">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 900 }}
            className="h-full w-full"
          >
            <ZoomableGroup center={[-64, -40]} zoom={1.5}>
              <Sphere stroke="#475569" strokeWidth={0.5} fill="transparent" />
              <Graticule stroke="#94a3b8" strokeOpacity={0.2} />
              <Geographies geography={WORLD_110M}>
                {({ geographies }: any) => (
                  <>
                    {/* World outline (faint) */}
                    {(geographies as any[]).map((geo: any) => (
                      <Geography
                        key={`world-${geo.rsmKey}`}
                        geography={geo}
                        style={{
                          default: {
                            fill: "transparent",
                            stroke: "#64748b",
                            strokeWidth: 0.4,
                            outline: "none",
                          },
                          hover: {
                            fill: "transparent",
                            stroke: "#64748b",
                            strokeWidth: 0.5,
                            outline: "none",
                          },
                          pressed: {
                            fill: "transparent",
                            stroke: "#64748b",
                            strokeWidth: 0.5,
                            outline: "none",
                          },
                        }}
                      />
                    ))}
                    {/* Argentina highlighted */}
                    {(geographies as any[])
                      .filter(
                        (geo: any) =>
                          geo.id === "032" ||
                          geo.id === 32 ||
                          geo.properties?.name === "Argentina" ||
                          geo.properties?.NAME === "Argentina"
                      )
                      .map((geo: any) => (
                        <Geography
                          key={`ar-${geo.rsmKey}`}
                          geography={geo}
                          style={{
                            default: {
                              fill: "#e5e7eb",
                              stroke: "#1f2937",
                              strokeWidth: 1,
                            },
                            hover: {
                              fill: "#d1d5db",
                              stroke: "#1f2937",
                              strokeWidth: 1.1,
                            },
                            pressed: {
                              fill: "#d1d5db",
                              stroke: "#1f2937",
                              strokeWidth: 1.1,
                            },
                          }}
                        />
                      ))}
                  </>
                )}
              </Geographies>
              {data.map((b) => (
                <Marker
                  key={b.name}
                  coordinates={b.coordinates}
                  onMouseEnter={(e: any) =>
                    setHover({ name: b.name, value: b.value, x: e.clientX, y: e.clientY })
                  }
                  onMouseMove={(e: any) =>
                    setHover({ name: b.name, value: b.value, x: e.clientX, y: e.clientY })
                  }
                  onMouseLeave={() => setHover(null)}
                >
                  <circle
                    r={radius(b.value)}
                    fill="#22c55e"
                    fillOpacity={0.6}
                    stroke="#16a34a"
                    strokeWidth={1.5}
                  />
                  <title>
                    {b.name}: {b.value.toLocaleString()} bbl
                  </title>
                </Marker>
              ))}
            </ZoomableGroup>
          </ComposableMap>
          {hover && (
            <div
              className="pointer-events-none fixed z-50 rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md"
              style={{ left: hover.x + 12, top: hover.y + 12 }}
            >
              <div className="font-medium text-foreground">{hover.name}</div>
              <div className="text-muted-foreground">{hover.value.toLocaleString()} bbl</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

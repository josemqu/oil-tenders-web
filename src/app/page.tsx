"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Page() {
  const [status, setStatus] = useState<string>("cargando...");
  const [spec, setSpec] = useState<any | null>(null);
  const [endpoint, setEndpoint] = useState<string>("/health");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .health()
      .then((h) => setStatus(h.status || "ok"))
      .catch(() => setStatus("error"));

    api
      .openapi()
      .then(setSpec)
      .catch(() => setSpec(null));
  }, []);

  const endpoints = useMemo(() => {
    if (!spec) return [] as string[];
    return Object.keys(spec.paths || {});
  }, [spec]);

  const testCall = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || "https://oil-tenders-api.up.railway.app"}${endpoint}`, {
        cache: "no-store",
      });
      const text = await res.text();
      setResponse(text);
    } catch (e: any) {
      setResponse(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Estado de API</CardTitle>
          <CardDescription>Base: {process.env.NEXT_PUBLIC_API_BASE || "https://oil-tenders-api.up.railway.app"}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Status: {status}</p>
          <p className="text-xs text-muted-foreground mt-2">OpenAPI: {spec ? "cargado" : "no disponible"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Probar endpoint</CardTitle>
          <CardDescription>Selecciona un endpoint del spec</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              list="endpoints"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="/health"
            />
            <datalist id="endpoints">
              {endpoints.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
            <Button onClick={testCall} disabled={loading}>
              {loading ? "Llamando..." : "Llamar"}
            </Button>
          </div>
          <pre className="mt-4 max-h-64 overflow-auto rounded-md border bg-muted p-3 text-xs whitespace-pre-wrap">
            {response || "Sin respuesta todavía"}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

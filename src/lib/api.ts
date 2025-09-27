import { API_BASE } from "@/lib/utils";

export type ApiHealth = {
  status: string;
  detail?: string;
};

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}

export const api = {
  health: () => apiFetch<ApiHealth>("/health"),
  openapi: () => apiFetch<any>("/openapi.json"),
  // Returns the latest offers. The API is expected to return an array or an object with an `items` array.
  offers: () => apiFetch<any>("/offers"),
};

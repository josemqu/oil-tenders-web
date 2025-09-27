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

export type OffersQuery = {
  product?: string | null;
  country?: string | null; // tries multiple country columns server-side
  company?: string | null;
  order_by?: string | null;
  order_dir?: "asc" | "desc" | null;
  limit?: number; // API max 500
  offset?: number;
};

function buildQuery(params: Record<string, any>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v)) {
      // supports eq/ilike/min/max arrays if needed
      for (const item of v) q.append(k, String(item));
    } else {
      q.set(k, String(v));
    }
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const api = {
  health: () => apiFetch<ApiHealth>("/health"),
  openapi: () => apiFetch<any>("/openapi.json"),
  // Returns the latest offers. The API is expected to return an array or an object with an `items` array.
  offers: () => apiFetch<any>("/offers"),
  offersList: (q: OffersQuery = {}) => {
    // The backend max limit is 500 per request
    const limit = Math.min(Math.max(q.limit ?? 50, 1), 500);
    const query = buildQuery({
      product: q.product ?? undefined,
      company: q.company ?? undefined,
      order_by: q.order_by ?? undefined,
      order_dir: q.order_dir ?? undefined,
      limit,
      offset: q.offset ?? 0,
    });
    return apiFetch<any>(`/offers${query}`);
  },
  offersMany: async (desiredTotal = 1000, baseQuery: Omit<OffersQuery, "limit" | "offset"> = {}) => {
    // Batch requests because API enforces limit<=500
    const pageSize = 500;
    const pages = Math.ceil(desiredTotal / pageSize);
    const results: any[] = [];
    for (let i = 0; i < pages; i++) {
      const offset = i * pageSize;
      const data = await apiFetch<any>(
        `/offers${buildQuery({ ...baseQuery, limit: pageSize, offset })}`
      );
      const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
      results.push(...items);
      if (items.length < pageSize) break; // no more pages
    }
    return results.slice(0, desiredTotal);
  },
};

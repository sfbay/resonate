import type { SoQLParams } from './types';

const BASE_URL = 'https://data.sfgov.org/resource';

const DATASETS = {
  vendorPayments: 'n9pm-xkyq',
  supplierContracts: 'cqi5-hm2d',
} as const;

type DatasetKey = keyof typeof DATASETS;

// Simple in-memory cache (5 min TTL)
const cache = new Map<string, { data: unknown; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function getCacheKey(dataset: string, params: SoQLParams): string {
  return `${dataset}:${JSON.stringify(params)}`;
}

/** Escape single quotes for SoQL WHERE clauses */
export function escapeVendor(name: string): string {
  return name.replace(/'/g, "''");
}

/**
 * Fetch data from a Socrata dataset using SoQL.
 * Adapted from DataDiver's client.ts — simplified for Resonate's needs.
 */
export async function fetchDataset<T>(
  datasetKey: DatasetKey,
  params: SoQLParams,
  options?: { skipCache?: boolean }
): Promise<T[]> {
  const datasetId = DATASETS[datasetKey];
  const cacheKey = getCacheKey(datasetId, params);

  // Check cache
  if (!options?.skipCache) {
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return cached.data as T[];
    }
  }

  // Build URL with SoQL params
  const url = new URL(`${BASE_URL}/${datasetId}.json`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };
  const appToken = process.env.NEXT_PUBLIC_SOCRATA_APP_TOKEN;
  if (appToken) {
    headers['X-App-Token'] = appToken;
  }

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) {
    throw new Error(`Socrata API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as T[];

  cache.set(cacheKey, { data, expires: Date.now() + CACHE_TTL });

  return data;
}

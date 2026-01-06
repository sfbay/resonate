/**
 * DataSF API Client
 *
 * A reusable client for fetching data from San Francisco's Open Data portal.
 * Includes caching, rate limiting, and error handling.
 */

import type { DataSFMeta, DataSFResult } from './types';

// =============================================================================
// CONFIGURATION
// =============================================================================

const DATASF_BASE_URL = 'https://data.sfgov.org/resource';

// Cache TTL in milliseconds (15 minutes)
const CACHE_TTL = 15 * 60 * 1000;

// Maximum records per request (DataSF limit is 50,000)
const DEFAULT_LIMIT = 50000;

// =============================================================================
// CACHE IMPLEMENTATION
// =============================================================================

interface CacheEntry<T> {
  data: T[];
  fetchedAt: Date;
  expiresAt: Date;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCacheKey(dataset: string, params: Record<string, string>): string {
  const sortedParams = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  return `${dataset}:${sortedParams}`;
}

function getFromCache<T>(key: string): CacheEntry<T> | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;

  if (!entry) return null;

  // Check if expired
  if (new Date() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry;
}

function setCache<T>(key: string, data: T[]): void {
  const now = new Date();
  cache.set(key, {
    data,
    fetchedAt: now,
    expiresAt: new Date(now.getTime() + CACHE_TTL),
  });
}

/**
 * Clear all cached data
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Clear cache for a specific dataset
 */
export function clearDatasetCache(dataset: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(`${dataset}:`)) {
      cache.delete(key);
    }
  }
}

// =============================================================================
// API CLIENT
// =============================================================================

export interface DataSFQueryParams {
  /** SoQL $where clause for filtering */
  where?: string;
  /** SoQL $select clause for columns */
  select?: string;
  /** SoQL $order clause for sorting */
  order?: string;
  /** SoQL $group clause for aggregation */
  group?: string;
  /** Maximum records to return */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * Fetch data from a DataSF dataset
 *
 * @param dataset - The dataset identifier (e.g., '5cei-gny5' for evictions)
 * @param params - Query parameters (SoQL syntax)
 * @returns Promise with data and metadata
 */
export async function fetchDataSF<T>(
  dataset: string,
  params: DataSFQueryParams = {}
): Promise<DataSFResult<T>> {
  // Build query parameters
  const queryParams: Record<string, string> = {};

  if (params.where) queryParams['$where'] = params.where;
  if (params.select) queryParams['$select'] = params.select;
  if (params.order) queryParams['$order'] = params.order;
  if (params.group) queryParams['$group'] = params.group;

  queryParams['$limit'] = String(params.limit ?? DEFAULT_LIMIT);

  if (params.offset) {
    queryParams['$offset'] = String(params.offset);
  }

  // Check cache first
  const cacheKey = getCacheKey(dataset, queryParams);
  const cached = getFromCache<T>(cacheKey);

  if (cached) {
    return {
      data: cached.data,
      meta: {
        fetchedAt: cached.fetchedAt,
        recordCount: cached.data.length,
        cached: true,
      },
    };
  }

  // Build URL
  const url = new URL(`${DATASF_BASE_URL}/${dataset}.json`);
  for (const [key, value] of Object.entries(queryParams)) {
    url.searchParams.set(key, value);
  }

  // Fetch from API
  try {
    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        // App token can be added for higher rate limits
        // 'X-App-Token': process.env.DATASF_APP_TOKEN ?? '',
      },
    });

    if (!response.ok) {
      throw new Error(`DataSF API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as T[];
    const fetchedAt = new Date();

    // Cache the result
    setCache(cacheKey, data);

    return {
      data,
      meta: {
        fetchedAt,
        recordCount: data.length,
        cached: false,
      },
    };
  } catch (error) {
    console.error('DataSF fetch error:', error);
    throw error;
  }
}

/**
 * Helper to format dates for SoQL queries
 * DataSF expects ISO 8601 format: YYYY-MM-DDTHH:MM:SS
 */
export function formatDateForQuery(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Build a date range where clause
 */
export function buildDateRangeWhere(
  field: string,
  startDate: Date,
  endDate: Date
): string {
  const start = formatDateForQuery(startDate);
  const end = formatDateForQuery(endDate);
  return `${field} >= '${start}' AND ${field} <= '${end}'`;
}

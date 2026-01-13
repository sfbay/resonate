'use client';

/**
 * React Hook for Census Data
 *
 * Provides easy access to census data in React components with:
 * - Automatic data fetching from Census Bureau API
 * - Loading and error states
 * - Fallback to sample data during loading or on error
 * - Caching to prevent redundant requests
 */

import { useState, useEffect, useCallback } from 'react';
import type { SFNeighborhood } from '@/types';
import type { NeighborhoodCensusData } from './types';
import { getSFCensusData, fetchSFCensusData, type CensusApiConfig } from './sf-census-data';

interface UseCensusDataResult {
  /** Census data for all neighborhoods */
  data: Record<SFNeighborhood, NeighborhoodCensusData>;
  /** Whether live data is being fetched */
  isLoading: boolean;
  /** Whether live data was successfully loaded */
  isLive: boolean;
  /** Any error that occurred during fetching */
  error: Error | null;
  /** Force a refresh of the data */
  refresh: () => Promise<void>;
}

interface UseCensusDataOptions {
  /** Census API configuration */
  config?: CensusApiConfig;
  /** Whether to fetch live data (default: true in browser, false on server) */
  fetchLive?: boolean;
  /** Whether to skip initial fetch (useful for SSR) */
  skipInitialFetch?: boolean;
}

/**
 * Hook to access census data with automatic live data fetching
 *
 * @example
 * ```tsx
 * const { data, isLoading, isLive } = useCensusData();
 *
 * // data is immediately available (sample data)
 * // isLoading is true while fetching live data
 * // isLive becomes true when live data is loaded
 * ```
 */
export function useCensusData(options: UseCensusDataOptions = {}): UseCensusDataResult {
  const { config = {}, fetchLive = true, skipInitialFetch = false } = options;

  // Start with sample data for immediate render
  const [data, setData] = useState<Record<SFNeighborhood, NeighborhoodCensusData>>(getSFCensusData);
  const [isLoading, setIsLoading] = useState(!skipInitialFetch && fetchLive);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!fetchLive) return;

    setIsLoading(true);
    setError(null);

    try {
      const liveData = await fetchSFCensusData(config);
      setData(liveData);
      setIsLive(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch census data'));
      // Keep sample data on error
    } finally {
      setIsLoading(false);
    }
  }, [fetchLive, config]);

  // Initial fetch
  useEffect(() => {
    if (!skipInitialFetch && fetchLive) {
      fetchData();
    }
  }, [skipInitialFetch, fetchLive, fetchData]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    isLive,
    error,
    refresh,
  };
}

interface UseNeighborhoodCensusResult {
  /** Census data for the specific neighborhood */
  data: NeighborhoodCensusData | undefined;
  /** Whether live data is being fetched */
  isLoading: boolean;
  /** Whether live data was successfully loaded */
  isLive: boolean;
  /** Any error that occurred during fetching */
  error: Error | null;
}

/**
 * Hook to access census data for a specific neighborhood
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useNeighborhoodCensus('mission');
 *
 * if (data) {
 *   console.log(data.economic.medianHouseholdIncome);
 * }
 * ```
 */
export function useNeighborhoodCensus(
  neighborhood: SFNeighborhood,
  options: UseCensusDataOptions = {}
): UseNeighborhoodCensusResult {
  const { data, isLoading, isLive, error } = useCensusData(options);

  return {
    data: data[neighborhood],
    isLoading,
    isLive,
    error,
  };
}

/**
 * Get a human-readable description of census data quality
 */
export function getCensusDataQuality(isLive: boolean, isLoading: boolean): {
  label: string;
  description: string;
  color: 'green' | 'yellow' | 'gray';
} {
  if (isLoading) {
    return {
      label: 'Loading',
      description: 'Fetching latest ACS data from Census Bureau...',
      color: 'yellow',
    };
  }

  if (isLive) {
    return {
      label: 'Live Data',
      description: 'Real ACS 5-year estimates from Census Bureau',
      color: 'green',
    };
  }

  return {
    label: 'Sample Data',
    description: 'Representative estimates (live data unavailable)',
    color: 'gray',
  };
}

/**
 * Evictions Data Service
 *
 * Fetches and aggregates eviction notice data from DataSF,
 * providing neighborhood-level statistics and city-wide comparisons.
 */

import type { SFNeighborhood } from '@/types';
import { fetchDataSF, buildDateRangeWhere } from './client';
import {
  type EvictionNoticeRaw,
  type EvictionNotice,
  type EvictionCause,
  type NeighborhoodEvictionData,
  type CityEvictionStats,
  type TimeRange,
  type EvictionQueryOptions,
  EVICTION_CAUSES,
} from './types';
import { getNeighborhoodForZip, getHousingUnits } from './zip-to-neighborhood';

// =============================================================================
// CONSTANTS
// =============================================================================

// DataSF dataset ID for Eviction Notices
const EVICTIONS_DATASET = '5cei-gny5';

// =============================================================================
// DATA TRANSFORMATION
// =============================================================================

/**
 * Parse raw eviction record from API into typed structure
 */
function parseEvictionNotice(raw: EvictionNoticeRaw): EvictionNotice | null {
  if (!raw.eviction_id || !raw.file_date) {
    return null;
  }

  // Extract causes (fields that are "true")
  const causes: EvictionCause[] = [];
  for (const cause of EVICTION_CAUSES) {
    if (raw[cause] === 'true') {
      causes.push(cause);
    }
  }

  // Get neighborhood from zip
  const neighborhood = raw.zip ? getNeighborhoodForZip(raw.zip) : undefined;

  return {
    id: raw.eviction_id,
    address: raw.address ?? '',
    zip: raw.zip ?? '',
    fileDate: new Date(raw.file_date),
    causes,
    neighborhood,
  };
}

/**
 * Calculate time range dates
 */
function getTimeRangeDates(timeRange: TimeRange): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();

  if (timeRange === '30d') {
    startDate.setDate(startDate.getDate() - 30);
  } else {
    // 12 months
    startDate.setMonth(startDate.getMonth() - 12);
  }

  return { startDate, endDate };
}

// =============================================================================
// DATA FETCHING
// =============================================================================

/**
 * Fetch eviction notices for a given time range
 */
export async function fetchEvictions(
  options: EvictionQueryOptions
): Promise<EvictionNotice[]> {
  const { startDate, endDate } = options.startDate && options.endDate
    ? { startDate: options.startDate, endDate: options.endDate }
    : getTimeRangeDates(options.timeRange);

  const whereClause = buildDateRangeWhere('file_date', startDate, endDate);

  const result = await fetchDataSF<EvictionNoticeRaw>(EVICTIONS_DATASET, {
    where: whereClause,
    order: 'file_date DESC',
  });

  // Parse and filter valid records
  const notices: EvictionNotice[] = [];
  for (const raw of result.data) {
    const parsed = parseEvictionNotice(raw);
    if (parsed && parsed.neighborhood) {
      notices.push(parsed);
    }
  }

  return notices;
}

// =============================================================================
// AGGREGATION
// =============================================================================

/**
 * Aggregate eviction data by neighborhood
 */
function aggregateByNeighborhood(
  notices: EvictionNotice[]
): Map<SFNeighborhood, NeighborhoodEvictionData> {
  const byNeighborhood = new Map<SFNeighborhood, {
    total: number;
    causes: Map<EvictionCause, number>;
  }>();

  // Count evictions by neighborhood
  for (const notice of notices) {
    if (!notice.neighborhood) continue;

    let data = byNeighborhood.get(notice.neighborhood);
    if (!data) {
      data = { total: 0, causes: new Map() };
      byNeighborhood.set(notice.neighborhood, data);
    }

    data.total++;

    // Count each cause
    for (const cause of notice.causes) {
      data.causes.set(cause, (data.causes.get(cause) ?? 0) + 1);
    }
  }

  // Transform to final structure
  const result = new Map<SFNeighborhood, NeighborhoodEvictionData>();

  for (const [neighborhood, data] of byNeighborhood) {
    const housingUnits = getHousingUnits(neighborhood);
    const rate = (data.total / housingUnits) * 1000;

    // Convert causes map to object and sort for top causes
    const causesObj: Partial<Record<EvictionCause, number>> = {};
    for (const [cause, count] of data.causes) {
      causesObj[cause] = count;
    }

    // Get top causes sorted by count
    const topCauses = Array.from(data.causes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cause, count]) => ({
        cause,
        count,
        percentage: Math.round((count / data.total) * 100),
      }));

    result.set(neighborhood, {
      neighborhood,
      total: data.total,
      rate: Math.round(rate * 10) / 10, // Round to 1 decimal
      causes: causesObj,
      topCauses,
    });
  }

  return result;
}

/**
 * Calculate city-wide statistics
 */
function calculateCityStats(
  byNeighborhood: Map<SFNeighborhood, NeighborhoodEvictionData>
): CityEvictionStats {
  const neighborhoods = Array.from(byNeighborhood.values());

  // Calculate totals
  const totalEvictions = neighborhoods.reduce((sum, n) => sum + n.total, 0);

  // Calculate average rate
  const rates = neighborhoods.map((n) => n.rate);
  const averageRate = rates.length > 0
    ? Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 10) / 10
    : 0;

  // Calculate median rate
  const sortedRates = [...rates].sort((a, b) => a - b);
  const medianRate = sortedRates.length > 0
    ? sortedRates[Math.floor(sortedRates.length / 2)]
    : 0;

  // Create rankings (highest rate = rank 1)
  const rankings = neighborhoods
    .sort((a, b) => b.rate - a.rate)
    .map((n, index) => ({
      neighborhood: n.neighborhood,
      rank: index + 1,
      rate: n.rate,
    }));

  // Convert to record
  const byNeighborhoodRecord: Record<SFNeighborhood, NeighborhoodEvictionData> =
    {} as Record<SFNeighborhood, NeighborhoodEvictionData>;

  for (const [neighborhood, data] of byNeighborhood) {
    byNeighborhoodRecord[neighborhood] = data;
  }

  return {
    totalEvictions,
    averageRate,
    medianRate,
    byNeighborhood: byNeighborhoodRecord,
    rankings,
  };
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Get eviction statistics for all neighborhoods
 *
 * @param options - Query options (time range)
 * @returns City-wide eviction statistics with neighborhood breakdown
 */
export async function getEvictionStats(
  options: EvictionQueryOptions = { timeRange: '12mo' }
): Promise<CityEvictionStats> {
  const notices = await fetchEvictions(options);
  const byNeighborhood = aggregateByNeighborhood(notices);
  return calculateCityStats(byNeighborhood);
}

/**
 * Get eviction data for a specific neighborhood
 *
 * @param neighborhood - The neighborhood to query
 * @param options - Query options
 * @returns Eviction data for the neighborhood, or null if no data
 */
export async function getNeighborhoodEvictions(
  neighborhood: SFNeighborhood,
  options: EvictionQueryOptions = { timeRange: '12mo' }
): Promise<NeighborhoodEvictionData | null> {
  const stats = await getEvictionStats(options);
  return stats.byNeighborhood[neighborhood] ?? null;
}

/**
 * Get ranking and comparison data for a neighborhood
 *
 * @param neighborhood - The neighborhood to query
 * @param options - Query options
 * @returns Ranking info and comparison to city average
 */
export async function getNeighborhoodComparison(
  neighborhood: SFNeighborhood,
  options: EvictionQueryOptions = { timeRange: '12mo' }
): Promise<{
  data: NeighborhoodEvictionData;
  rank: number;
  totalNeighborhoods: number;
  comparedToAverage: number; // multiplier (e.g., 1.5 = 50% above average)
  comparedToMedian: number;
} | null> {
  const stats = await getEvictionStats(options);
  const data = stats.byNeighborhood[neighborhood];

  if (!data) return null;

  const ranking = stats.rankings.find((r) => r.neighborhood === neighborhood);

  return {
    data,
    rank: ranking?.rank ?? stats.rankings.length,
    totalNeighborhoods: stats.rankings.length,
    comparedToAverage: stats.averageRate > 0
      ? Math.round((data.rate / stats.averageRate) * 10) / 10
      : 0,
    comparedToMedian: stats.medianRate > 0
      ? Math.round((data.rate / stats.medianRate) * 10) / 10
      : 0,
  };
}

/**
 * React hook helper: Get eviction data for map visualization
 * Returns data formatted for the SFNeighborhoodMap colorBy prop
 */
export async function getEvictionMapData(
  options: EvictionQueryOptions = { timeRange: '12mo' }
): Promise<{
  neighborhood: SFNeighborhood;
  rate: number;
}[]> {
  const stats = await getEvictionStats(options);

  return Object.entries(stats.byNeighborhood).map(([neighborhood, data]) => ({
    neighborhood: neighborhood as SFNeighborhood,
    rate: data.rate,
  }));
}

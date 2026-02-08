/**
 * 311 Service Requests Data Service
 *
 * Fetches and aggregates 311 case data from DataSF,
 * providing neighborhood-level statistics and city-wide comparisons.
 *
 * Dataset: 311 Cases (vw6y-z8j6)
 * Rates are per 1,000 residents using census population data.
 */

import type { SFNeighborhood } from '@/types';
import { fetchDataSF, buildDateRangeWhere } from './client';
import type {
  Case311Raw,
  ServiceCategory,
  Neighborhood311Data,
  City311Stats,
  TimeRange,
} from './types';
import { mapDataSFNeighborhood, calculateRatePer1k } from './datasf-neighborhoods';

// =============================================================================
// CONSTANTS
// =============================================================================

const DATASET_311 = 'vw6y-z8j6';

// =============================================================================
// CATEGORY MAPPING
// =============================================================================

/**
 * Map a DataSF 311 category string to our ServiceCategory enum.
 * Uses keyword matching on the lowercased category string.
 */
function mapServiceCategory(rawCategory: string | undefined): ServiceCategory {
  if (!rawCategory) return 'other';

  const lower = rawCategory.toLowerCase();

  if (lower.includes('street') && lower.includes('clean')) return 'street_cleaning';
  if (lower.includes('sidewalk') && lower.includes('clean')) return 'street_cleaning';
  if (lower.includes('graffiti')) return 'graffiti';
  if (lower.includes('pothole') || lower.includes('street defect') || lower.includes('pavement')) return 'street_defects';
  if (lower.includes('curb') || lower.includes('sinkhole')) return 'street_defects';
  if (lower.includes('encampment') || lower.includes('homeless') || lower.includes('camp')) return 'encampments';
  if (lower.includes('noise')) return 'noise';
  if (lower.includes('dumping') || lower.includes('dump') || lower.includes('bulky')) return 'illegal_dumping';
  if (lower.includes('tree') || lower.includes('pruning')) return 'tree_maintenance';
  if (lower.includes('streetlight') || lower.includes('street light') || lower.includes('signal') || lower.includes('traffic sign')) return 'streetlight';

  return 'other';
}

// =============================================================================
// DATA TRANSFORMATION
// =============================================================================

function getTimeRangeDates(timeRange: TimeRange): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();

  if (timeRange === '30d') {
    startDate.setDate(startDate.getDate() - 30);
  } else {
    startDate.setMonth(startDate.getMonth() - 12);
  }

  return { startDate, endDate };
}

// =============================================================================
// DATA FETCHING
// =============================================================================

/**
 * Fetch 311 cases for a given time range
 */
export async function fetch311Cases(
  options: { timeRange: TimeRange; categories?: ServiceCategory[] }
): Promise<{ neighborhood: SFNeighborhood; category: ServiceCategory }[]> {
  const { startDate, endDate } = getTimeRangeDates(options.timeRange);
  const whereClause = buildDateRangeWhere('requested_datetime', startDate, endDate);

  const result = await fetchDataSF<Case311Raw>(DATASET_311, {
    where: whereClause,
    select: 'service_request_id,service_name,neighborhoods_sffind_boundaries',
    order: 'requested_datetime DESC',
    limit: 50000,
  });

  const cases: { neighborhood: SFNeighborhood; category: ServiceCategory }[] = [];

  for (const raw of result.data) {
    const neighborhood = mapDataSFNeighborhood(raw.neighborhoods_sffind_boundaries);
    if (!neighborhood) continue;

    const category = mapServiceCategory(raw.service_name);

    // If filtering by category, skip non-matching
    if (options.categories && options.categories.length > 0) {
      if (!options.categories.includes(category)) continue;
    }

    cases.push({ neighborhood, category });
  }

  return cases;
}

// =============================================================================
// AGGREGATION
// =============================================================================

/**
 * Aggregate 311 data by neighborhood
 */
function aggregate311ByNeighborhood(
  cases: { neighborhood: SFNeighborhood; category: ServiceCategory }[]
): Map<SFNeighborhood, Neighborhood311Data> {
  const byNeighborhood = new Map<SFNeighborhood, {
    total: number;
    categories: Map<ServiceCategory, number>;
  }>();

  for (const c of cases) {
    let data = byNeighborhood.get(c.neighborhood);
    if (!data) {
      data = { total: 0, categories: new Map() };
      byNeighborhood.set(c.neighborhood, data);
    }

    data.total++;
    data.categories.set(c.category, (data.categories.get(c.category) ?? 0) + 1);
  }

  const result = new Map<SFNeighborhood, Neighborhood311Data>();

  for (const [neighborhood, data] of byNeighborhood) {
    const rate = calculateRatePer1k(data.total, neighborhood);

    const topCategories = Array.from(data.categories.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / data.total) * 100),
      }));

    result.set(neighborhood, {
      neighborhood,
      total: data.total,
      rate,
      topCategories,
    });
  }

  return result;
}

/**
 * Calculate city-wide 311 statistics
 */
function calculate311CityStats(
  byNeighborhood: Map<SFNeighborhood, Neighborhood311Data>,
  cases: { neighborhood: SFNeighborhood; category: ServiceCategory }[]
): City311Stats {
  const neighborhoods = Array.from(byNeighborhood.values());

  const totalCases = neighborhoods.reduce((sum, n) => sum + n.total, 0);

  const rates = neighborhoods.map((n) => n.rate);
  const averageRate = rates.length > 0
    ? Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 10) / 10
    : 0;

  const rankings = neighborhoods
    .sort((a, b) => b.rate - a.rate)
    .map((n, index) => ({
      neighborhood: n.neighborhood,
      rank: index + 1,
      rate: n.rate,
    }));

  const byNeighborhoodRecord: Record<string, Neighborhood311Data> = {};
  for (const [neighborhood, data] of byNeighborhood) {
    byNeighborhoodRecord[neighborhood] = data;
  }

  // Aggregate by category across all neighborhoods
  const byCategory: Partial<Record<ServiceCategory, number>> = {};
  for (const c of cases) {
    byCategory[c.category] = (byCategory[c.category] ?? 0) + 1;
  }

  return {
    totalCases,
    averageRate,
    rankings,
    byNeighborhood: byNeighborhoodRecord,
    byCategory,
  };
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Get 311 statistics for all neighborhoods
 */
export async function get311Stats(
  options: { timeRange: TimeRange; categories?: ServiceCategory[] } = { timeRange: '12mo' }
): Promise<City311Stats> {
  const cases = await fetch311Cases(options);
  const byNeighborhood = aggregate311ByNeighborhood(cases);
  return calculate311CityStats(byNeighborhood, cases);
}

/**
 * Get 311 data for map visualization
 */
export async function get311MapData(
  options: { timeRange: TimeRange; categories?: ServiceCategory[] } = { timeRange: '12mo' }
): Promise<{ neighborhood: SFNeighborhood; rate: number }[]> {
  const stats = await get311Stats(options);

  return Object.entries(stats.byNeighborhood).map(([neighborhood, data]) => ({
    neighborhood: neighborhood as SFNeighborhood,
    rate: data.rate,
  }));
}

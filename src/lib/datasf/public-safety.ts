/**
 * Public Safety Data Service
 *
 * Combines fire incident and police report data from DataSF,
 * providing neighborhood-level safety statistics with sensitive framing.
 *
 * Datasets:
 *   - Fire Incidents (wr8u-xric)
 *   - Police Reports 2018+ (wg3w-h783)
 *
 * Rates are per 1,000 residents using census population data.
 * All labels use non-stigmatizing language (e.g., "Personal Safety" not "Violent Crime").
 */

import type { SFNeighborhood } from '@/types';
import { fetchDataSF, buildDateRangeWhere } from './client';
import type {
  FireIncidentRaw,
  PoliceReportRaw,
  SafetyCategory,
  NeighborhoodSafetyData,
  CitySafetyStats,
  TimeRange,
} from './types';
import { mapDataSFNeighborhood, calculateRatePer1k } from './datasf-neighborhoods';

// =============================================================================
// CONSTANTS
// =============================================================================

const FIRE_DATASET = 'wr8u-xric';
const POLICE_DATASET = 'wg3w-h783';

// =============================================================================
// CATEGORY MAPPING
// =============================================================================

/**
 * Map a fire primary_situation string to our SafetyCategory enum.
 */
function mapFireCategory(rawSituation: string | undefined): SafetyCategory {
  if (!rawSituation) return 'fire';

  const lower = rawSituation.toLowerCase();

  if (lower.includes('structure') || lower.includes('building')) return 'fire';
  if (lower.includes('vehicle') && lower.includes('fire')) return 'fire';
  if (lower.includes('rubbish') || lower.includes('trash') || lower.includes('waste')) return 'fire';
  if (lower.includes('traffic') || lower.includes('collision') || lower.includes('accident')) return 'traffic';
  if (lower.includes('fire')) return 'fire';

  return 'other';
}

/**
 * Map a police incident_category string to our SafetyCategory enum.
 * Uses sensitive framing: "Assault" → "personal_safety", "Larceny Theft" → "property"
 */
function mapPoliceCategory(rawCategory: string | undefined): SafetyCategory {
  if (!rawCategory) return 'other';

  const lower = rawCategory.toLowerCase();

  // Property categories
  if (lower.includes('larceny') || lower.includes('theft')) return 'property';
  if (lower.includes('burglary')) return 'property';
  if (lower.includes('motor vehicle') || lower.includes('vehicle theft') || lower.includes('stolen')) return 'property';
  if (lower.includes('fraud') || lower.includes('forgery') || lower.includes('embezzlement')) return 'property';

  // Personal safety categories
  if (lower.includes('assault')) return 'personal_safety';
  if (lower.includes('robbery')) return 'personal_safety';
  if (lower.includes('sex') || lower.includes('rape')) return 'personal_safety';
  if (lower.includes('homicide') || lower.includes('murder')) return 'personal_safety';
  if (lower.includes('kidnapping')) return 'personal_safety';
  if (lower.includes('weapon') || lower.includes('firearm')) return 'personal_safety';

  // Traffic categories
  if (lower.includes('traffic') || lower.includes('vehicle') || lower.includes('collision')) return 'traffic';
  if (lower.includes('hit and run')) return 'traffic';

  // Vandalism
  if (lower.includes('vandalism') || lower.includes('malicious mischief') || lower.includes('arson')) return 'vandalism';

  return 'other';
}

// =============================================================================
// DATA TRANSFORMATION
// =============================================================================

interface SafetyRecord {
  neighborhood: SFNeighborhood;
  category: SafetyCategory;
  source: 'fire' | 'police';
}

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
 * Fetch fire incidents for a given time range
 */
async function fetchFireIncidents(
  timeRange: TimeRange
): Promise<SafetyRecord[]> {
  const { startDate, endDate } = getTimeRangeDates(timeRange);
  const whereClause = buildDateRangeWhere('incident_date', startDate, endDate);

  const result = await fetchDataSF<FireIncidentRaw>(FIRE_DATASET, {
    where: whereClause,
    select: 'incident_number,neighborhood_district,primary_situation',
    order: 'incident_date DESC',
    limit: 50000,
  });

  const records: SafetyRecord[] = [];

  for (const raw of result.data) {
    const neighborhood = mapDataSFNeighborhood(raw.neighborhood_district);
    if (!neighborhood) continue;

    records.push({
      neighborhood,
      category: mapFireCategory(raw.primary_situation),
      source: 'fire',
    });
  }

  return records;
}

/**
 * Fetch police reports for a given time range
 */
async function fetchPoliceReports(
  timeRange: TimeRange
): Promise<SafetyRecord[]> {
  const { startDate, endDate } = getTimeRangeDates(timeRange);
  const whereClause = buildDateRangeWhere('incident_date', startDate, endDate);

  const result = await fetchDataSF<PoliceReportRaw>(POLICE_DATASET, {
    where: whereClause,
    select: 'incident_number,incident_category,analysis_neighborhood',
    order: 'incident_date DESC',
    limit: 50000,
  });

  const records: SafetyRecord[] = [];

  for (const raw of result.data) {
    const neighborhood = mapDataSFNeighborhood(raw.analysis_neighborhood);
    if (!neighborhood) continue;

    records.push({
      neighborhood,
      category: mapPoliceCategory(raw.incident_category),
      source: 'police',
    });
  }

  return records;
}

// =============================================================================
// AGGREGATION
// =============================================================================

/**
 * Aggregate safety data by neighborhood
 */
function aggregateSafetyByNeighborhood(
  records: SafetyRecord[]
): Map<SFNeighborhood, NeighborhoodSafetyData> {
  const byNeighborhood = new Map<SFNeighborhood, {
    total: number;
    fireCount: number;
    policeCount: number;
    categories: Map<SafetyCategory, number>;
  }>();

  for (const r of records) {
    let data = byNeighborhood.get(r.neighborhood);
    if (!data) {
      data = { total: 0, fireCount: 0, policeCount: 0, categories: new Map() };
      byNeighborhood.set(r.neighborhood, data);
    }

    data.total++;
    if (r.source === 'fire') data.fireCount++;
    else data.policeCount++;
    data.categories.set(r.category, (data.categories.get(r.category) ?? 0) + 1);
  }

  const result = new Map<SFNeighborhood, NeighborhoodSafetyData>();

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
      fireCount: data.fireCount,
      policeCount: data.policeCount,
      topCategories,
    });
  }

  return result;
}

/**
 * Calculate city-wide safety statistics
 */
function calculateSafetyCityStats(
  byNeighborhood: Map<SFNeighborhood, NeighborhoodSafetyData>,
  records: SafetyRecord[]
): CitySafetyStats {
  const neighborhoods = Array.from(byNeighborhood.values());

  const totalIncidents = neighborhoods.reduce((sum, n) => sum + n.total, 0);

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

  const byNeighborhoodRecord: Record<string, NeighborhoodSafetyData> = {};
  for (const [neighborhood, data] of byNeighborhood) {
    byNeighborhoodRecord[neighborhood] = data;
  }

  // Aggregate by category
  const byCategory: Partial<Record<SafetyCategory, number>> = {};
  for (const r of records) {
    byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
  }

  return {
    totalIncidents,
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
 * Get safety statistics for all neighborhoods (fire + police combined)
 */
export async function getSafetyStats(
  options: { timeRange: TimeRange; categories?: SafetyCategory[] } = { timeRange: '12mo' }
): Promise<CitySafetyStats> {
  // Fetch both datasets in parallel
  const [fireRecords, policeRecords] = await Promise.all([
    fetchFireIncidents(options.timeRange),
    fetchPoliceReports(options.timeRange),
  ]);

  let allRecords = [...fireRecords, ...policeRecords];

  // Filter by categories if specified
  if (options.categories && options.categories.length > 0) {
    allRecords = allRecords.filter(r => options.categories!.includes(r.category));
  }

  const byNeighborhood = aggregateSafetyByNeighborhood(allRecords);
  return calculateSafetyCityStats(byNeighborhood, allRecords);
}

/**
 * Get safety data for map visualization
 */
export async function getSafetyMapData(
  options: { timeRange: TimeRange; categories?: SafetyCategory[] } = { timeRange: '12mo' }
): Promise<{ neighborhood: SFNeighborhood; rate: number }[]> {
  const stats = await getSafetyStats(options);

  return Object.entries(stats.byNeighborhood).map(([neighborhood, data]) => ({
    neighborhood: neighborhood as SFNeighborhood,
    rate: data.rate,
  }));
}

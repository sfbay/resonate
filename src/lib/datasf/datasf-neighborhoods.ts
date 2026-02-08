/**
 * DataSF Neighborhood Name Mapping
 *
 * Maps neighborhood names used in DataSF datasets (311, Fire, Police)
 * to our canonical SFNeighborhood enum values. DataSF uses various
 * naming conventions across datasets, so this mapping normalizes them.
 *
 * Also provides population-based rate calculations using census data.
 */

import type { SFNeighborhood } from '@/types';
import { getSFCensusData } from '@/lib/census/sf-census-data';

// =============================================================================
// DATASF → SFNEIGHBORHOOD MAPPING
// =============================================================================

/**
 * Maps DataSF neighborhood name strings to our canonical SFNeighborhood values.
 * DataSF uses "Bayview Hunters Point", we use "bayview_hunters_point", etc.
 * Keys are lowercased for case-insensitive matching.
 */
const DATASF_NAME_MAP: Record<string, SFNeighborhood> = {
  // Standard names
  'bayview hunters point': 'bayview_hunters_point',
  'bayview': 'bayview_hunters_point',
  'bernal heights': 'bernal_heights',
  'castro/upper market': 'castro',
  'castro': 'castro',
  'chinatown': 'chinatown',
  'civic center/tenderloin': 'tenderloin',
  'cole valley': 'cole_valley',
  'diamond heights': 'diamond_heights',
  'dogpatch': 'dogpatch',
  'downtown/civic center': 'downtown',
  'downtown': 'downtown',
  'excelsior': 'excelsior',
  'financial district/south beach': 'financial_district',
  'financial district': 'financial_district',
  'glen park': 'glen_park',
  'haight ashbury': 'haight_ashbury',
  'haight-ashbury': 'haight_ashbury',
  'hayes valley': 'hayes_valley',
  'ingleside': 'ingleside',
  'inner richmond': 'inner_richmond',
  'inner sunset': 'inner_sunset',
  'japantown': 'japantown',
  'lakeshore': 'lakeshore',
  'laurel heights': 'laurel_heights',
  'lone mountain/usf': 'laurel_heights',
  'marina': 'marina',
  'mission': 'mission',
  'mission bay': 'mission_bay',
  'nob hill': 'nob_hill',
  'noe valley': 'noe_valley',
  'north beach': 'north_beach',
  'oceanview/merced/ingleside': 'oceanview',
  'oceanview': 'oceanview',
  'outer mission': 'outer_mission',
  'outer richmond': 'outer_richmond',
  'outer sunset': 'outer_sunset',
  'pacific heights': 'pacific_heights',
  'parkside': 'parkside',
  'portola': 'portola',
  'potrero hill': 'potrero_hill',
  'presidio': 'presidio',
  'presidio heights': 'presidio',
  'russian hill': 'russian_hill',
  'sea cliff': 'sea_cliff',
  'seacliff': 'sea_cliff',
  'soma': 'soma',
  'south of market': 'soma',
  'south beach': 'south_beach',
  'stonestown': 'stonestown',
  'sunset/parkside': 'outer_sunset',
  'tenderloin': 'tenderloin',
  'treasure island': 'treasure_island',
  'treasure island/ybi': 'treasure_island',
  'twin peaks': 'twin_peaks',
  'visitacion valley': 'visitacion_valley',
  'west portal': 'west_portal',
  'west of twin peaks': 'west_portal',
  'western addition': 'western_addition',

  // Police-specific variations
  'bayview_hunters_point': 'bayview_hunters_point',
  'bernal_heights': 'bernal_heights',
  'lincoln park': 'outer_richmond',
  'golden gate park': 'inner_richmond',
  'mclaren park': 'excelsior',
  'crocker amazon': 'excelsior',
  'silver terrace': 'bayview_hunters_point',
  'hunters point': 'bayview_hunters_point',
  'visitacion_valley': 'visitacion_valley',
  'mission terrace': 'outer_mission',

  // 311-specific sub-neighborhood names (neighborhoods_sffind_boundaries)
  'lower nob hill': 'nob_hill',
  'mission dolores': 'mission',
  'duboce triangle': 'castro',
  'cathedral hill': 'japantown',
  'panhandle': 'haight_ashbury',
  'dolores heights': 'noe_valley',
  'polk gulch': 'nob_hill',
  'lower pacific heights': 'pacific_heights',
  'union street': 'marina',
  'cayuga': 'excelsior',
  'eureka valley': 'castro',
  'buena vista': 'haight_ashbury',
  'lone mountain': 'laurel_heights',
  'downtown / union square': 'downtown',
  'downtown/union square': 'downtown',
  'cow hollow': 'marina',
  'anza vista': 'western_addition',
  'alamo square': 'western_addition',
  'jordan park': 'inner_richmond',
  'lake street': 'inner_richmond',
  'presidio terrace': 'presidio',
  'clarendon heights': 'twin_peaks',
  'midtown terrace': 'twin_peaks',
  'forest hill': 'west_portal',
  'forest knolls': 'twin_peaks',
  'ashbury heights': 'haight_ashbury',
  'corona heights': 'castro',
  'parnassus heights': 'cole_valley',
  'miraloma park': 'diamond_heights',
  'sunnyside': 'glen_park',
  'balboa terrace': 'ingleside',
  'ingleside heights': 'ingleside',
  'ingleside terrace': 'ingleside',
  'mount davidson manor': 'ingleside',
  'monterey heights': 'diamond_heights',
  'westwood park': 'west_portal',
  'westwood highlands': 'west_portal',
  'merced heights': 'oceanview',
  'merced manor': 'oceanview',
  'lakeside': 'lakeshore',
  'pine lake park': 'lakeshore',
  'saint francis wood': 'west_portal',
  'sherwood forest': 'diamond_heights',
  'rincon hill': 'soma',
  'yerba buena': 'soma',
  'showplace square': 'potrero_hill',
  'design district': 'potrero_hill',
};

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Map a DataSF neighborhood name to our canonical SFNeighborhood value.
 * Returns undefined if the name can't be matched.
 */
export function mapDataSFNeighborhood(name: string | undefined | null): SFNeighborhood | undefined {
  if (!name) return undefined;

  const normalized = name.toLowerCase().trim();
  return DATASF_NAME_MAP[normalized];
}

/**
 * Get population for a neighborhood from census data.
 * Used to calculate per-capita rates.
 */
export function getNeighborhoodPopulation(neighborhood: SFNeighborhood): number {
  const census = getSFCensusData();
  return census[neighborhood]?.population.total ?? 10000; // fallback
}

/**
 * Calculate rate per 1,000 residents for a neighborhood.
 */
export function calculateRatePer1k(count: number, neighborhood: SFNeighborhood): number {
  const population = getNeighborhoodPopulation(neighborhood);
  if (population === 0) return 0;
  return Math.round((count / population) * 1000 * 10) / 10; // 1 decimal
}

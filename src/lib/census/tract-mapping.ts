/**
 * Census Tract to Neighborhood Mapping
 *
 * Maps San Francisco census tracts to neighborhoods. Many tracts map 1:1 to
 * neighborhoods, but some span multiple neighborhoods and need weighted allocation.
 *
 * Census tracts are 11-digit FIPS codes: 06 (CA) + 075 (SF County) + 6-digit tract
 *
 * Source for mappings: SF Planning Department Analysis Neighborhoods
 * https://data.sfgov.org/Geographic-Locations-and-Boundaries/Analysis-Neighborhoods/p5b7-5n3h
 */

import type { SFNeighborhood } from '@/types';

export interface TractNeighborhoodMapping {
  tract: string;  // 6-digit tract code (without state/county prefix)
  neighborhoods: {
    id: SFNeighborhood;
    weight: number;  // Proportion of tract population in this neighborhood (0-1)
  }[];
}

/**
 * Mapping of SF census tracts to neighborhoods
 * Weights sum to 1.0 for each tract
 *
 * Based on SF Planning Department Analysis Neighborhoods boundaries
 * and Census 2020 tract boundaries
 */
export const TRACT_TO_NEIGHBORHOOD: TractNeighborhoodMapping[] = [
  // CHINATOWN (tracts 107, 113, 114, 118)
  { tract: '010700', neighborhoods: [{ id: 'chinatown', weight: 1 }] },
  { tract: '011300', neighborhoods: [{ id: 'chinatown', weight: 0.7 }, { id: 'nob_hill', weight: 0.3 }] },
  { tract: '011400', neighborhoods: [{ id: 'chinatown', weight: 1 }] },
  { tract: '011800', neighborhoods: [{ id: 'chinatown', weight: 0.6 }, { id: 'financial_district', weight: 0.4 }] },

  // NORTH BEACH (tracts 105, 106, 108)
  { tract: '010500', neighborhoods: [{ id: 'north_beach', weight: 1 }] },
  { tract: '010600', neighborhoods: [{ id: 'north_beach', weight: 0.8 }, { id: 'russian_hill', weight: 0.2 }] },
  { tract: '010800', neighborhoods: [{ id: 'north_beach', weight: 1 }] },

  // FINANCIAL DISTRICT / DOWNTOWN (tracts 104, 117, 119, 120, 121, 122, 123)
  { tract: '010400', neighborhoods: [{ id: 'financial_district', weight: 1 }] },
  { tract: '011700', neighborhoods: [{ id: 'financial_district', weight: 1 }] },
  { tract: '011900', neighborhoods: [{ id: 'downtown', weight: 1 }] },
  { tract: '012000', neighborhoods: [{ id: 'downtown', weight: 0.7 }, { id: 'tenderloin', weight: 0.3 }] },
  { tract: '012100', neighborhoods: [{ id: 'downtown', weight: 1 }] },
  { tract: '012200', neighborhoods: [{ id: 'downtown', weight: 0.5 }, { id: 'civic_center', weight: 0.5 }] },
  { tract: '012300', neighborhoods: [{ id: 'downtown', weight: 1 }] },

  // NOB HILL (tracts 109, 110, 111, 112)
  { tract: '010900', neighborhoods: [{ id: 'nob_hill', weight: 1 }] },
  { tract: '011000', neighborhoods: [{ id: 'nob_hill', weight: 1 }] },
  { tract: '011100', neighborhoods: [{ id: 'nob_hill', weight: 0.7 }, { id: 'russian_hill', weight: 0.3 }] },
  { tract: '011200', neighborhoods: [{ id: 'nob_hill', weight: 1 }] },

  // RUSSIAN HILL (tracts 101, 102, 103)
  { tract: '010100', neighborhoods: [{ id: 'russian_hill', weight: 1 }] },
  { tract: '010200', neighborhoods: [{ id: 'russian_hill', weight: 1 }] },
  { tract: '010300', neighborhoods: [{ id: 'russian_hill', weight: 0.8 }, { id: 'north_beach', weight: 0.2 }] },

  // TENDERLOIN (tracts 124, 125, 126, 127, 128, 129)
  { tract: '012400', neighborhoods: [{ id: 'tenderloin', weight: 1 }] },
  { tract: '012500', neighborhoods: [{ id: 'tenderloin', weight: 1 }] },
  { tract: '012600', neighborhoods: [{ id: 'tenderloin', weight: 1 }] },
  { tract: '012700', neighborhoods: [{ id: 'tenderloin', weight: 0.8 }, { id: 'civic_center', weight: 0.2 }] },
  { tract: '012800', neighborhoods: [{ id: 'tenderloin', weight: 1 }] },
  { tract: '012900', neighborhoods: [{ id: 'tenderloin', weight: 1 }] },

  // CIVIC CENTER (tracts 163, 164, 165)
  { tract: '016300', neighborhoods: [{ id: 'civic_center', weight: 1 }] },
  { tract: '016400', neighborhoods: [{ id: 'civic_center', weight: 0.7 }, { id: 'hayes_valley', weight: 0.3 }] },
  { tract: '016500', neighborhoods: [{ id: 'civic_center', weight: 1 }] },

  // SOMA (tracts 176.01, 176.02, 178, 179.01, 179.02, 180, 607)
  { tract: '017601', neighborhoods: [{ id: 'soma', weight: 1 }] },
  { tract: '017602', neighborhoods: [{ id: 'soma', weight: 1 }] },
  { tract: '017800', neighborhoods: [{ id: 'soma', weight: 1 }] },
  { tract: '017901', neighborhoods: [{ id: 'soma', weight: 0.7 }, { id: 'south_beach', weight: 0.3 }] },
  { tract: '017902', neighborhoods: [{ id: 'soma', weight: 1 }] },
  { tract: '018000', neighborhoods: [{ id: 'soma', weight: 1 }] },
  { tract: '060700', neighborhoods: [{ id: 'soma', weight: 0.6 }, { id: 'mission_bay', weight: 0.4 }] },

  // SOUTH BEACH (tracts 611, 612)
  { tract: '061100', neighborhoods: [{ id: 'south_beach', weight: 1 }] },
  { tract: '061200', neighborhoods: [{ id: 'south_beach', weight: 0.7 }, { id: 'mission_bay', weight: 0.3 }] },

  // MISSION BAY (tracts 614, 615)
  { tract: '061400', neighborhoods: [{ id: 'mission_bay', weight: 1 }] },
  { tract: '061500', neighborhoods: [{ id: 'mission_bay', weight: 1 }] },

  // MARINA (tracts 127.01, 127.02, 128)
  { tract: '012701', neighborhoods: [{ id: 'marina', weight: 1 }] },
  { tract: '012702', neighborhoods: [{ id: 'marina', weight: 1 }] },
  { tract: '012800', neighborhoods: [{ id: 'marina', weight: 1 }] },

  // PACIFIC HEIGHTS (tracts 129, 130, 131, 132, 133)
  { tract: '012900', neighborhoods: [{ id: 'pacific_heights', weight: 1 }] },
  { tract: '013000', neighborhoods: [{ id: 'pacific_heights', weight: 1 }] },
  { tract: '013100', neighborhoods: [{ id: 'pacific_heights', weight: 1 }] },
  { tract: '013200', neighborhoods: [{ id: 'pacific_heights', weight: 0.8 }, { id: 'laurel_heights', weight: 0.2 }] },
  { tract: '013300', neighborhoods: [{ id: 'pacific_heights', weight: 1 }] },

  // PRESIDIO (tracts 601, 602)
  { tract: '060100', neighborhoods: [{ id: 'presidio', weight: 1 }] },
  { tract: '060200', neighborhoods: [{ id: 'presidio', weight: 1 }] },

  // WESTERN ADDITION / JAPANTOWN (tracts 155, 156, 157, 158, 159, 160, 161, 162)
  { tract: '015500', neighborhoods: [{ id: 'western_addition', weight: 1 }] },
  { tract: '015600', neighborhoods: [{ id: 'western_addition', weight: 0.7 }, { id: 'japantown', weight: 0.3 }] },
  { tract: '015700', neighborhoods: [{ id: 'japantown', weight: 0.7 }, { id: 'western_addition', weight: 0.3 }] },
  { tract: '015800', neighborhoods: [{ id: 'western_addition', weight: 1 }] },
  { tract: '015900', neighborhoods: [{ id: 'western_addition', weight: 1 }] },
  { tract: '016000', neighborhoods: [{ id: 'western_addition', weight: 1 }] },
  { tract: '016100', neighborhoods: [{ id: 'western_addition', weight: 1 }] },
  { tract: '016200', neighborhoods: [{ id: 'western_addition', weight: 1 }] },

  // LAUREL HEIGHTS (tracts 134, 135)
  { tract: '013400', neighborhoods: [{ id: 'laurel_heights', weight: 1 }] },
  { tract: '013500', neighborhoods: [{ id: 'laurel_heights', weight: 1 }] },

  // INNER RICHMOND (tracts 451, 452, 453, 454, 455, 476)
  { tract: '045100', neighborhoods: [{ id: 'inner_richmond', weight: 1 }] },
  { tract: '045200', neighborhoods: [{ id: 'inner_richmond', weight: 1 }] },
  { tract: '045300', neighborhoods: [{ id: 'inner_richmond', weight: 1 }] },
  { tract: '045400', neighborhoods: [{ id: 'inner_richmond', weight: 1 }] },
  { tract: '045500', neighborhoods: [{ id: 'inner_richmond', weight: 1 }] },
  { tract: '047600', neighborhoods: [{ id: 'inner_richmond', weight: 0.6 }, { id: 'laurel_heights', weight: 0.4 }] },

  // OUTER RICHMOND (tracts 456, 457, 458, 459, 460, 461, 462, 463, 464, 479, 480)
  { tract: '045600', neighborhoods: [{ id: 'outer_richmond', weight: 1 }] },
  { tract: '045700', neighborhoods: [{ id: 'outer_richmond', weight: 1 }] },
  { tract: '045800', neighborhoods: [{ id: 'outer_richmond', weight: 1 }] },
  { tract: '045900', neighborhoods: [{ id: 'outer_richmond', weight: 1 }] },
  { tract: '046000', neighborhoods: [{ id: 'outer_richmond', weight: 1 }] },
  { tract: '046100', neighborhoods: [{ id: 'outer_richmond', weight: 1 }] },
  { tract: '046200', neighborhoods: [{ id: 'outer_richmond', weight: 1 }] },
  { tract: '046300', neighborhoods: [{ id: 'outer_richmond', weight: 1 }] },
  { tract: '046400', neighborhoods: [{ id: 'outer_richmond', weight: 1 }] },
  { tract: '047900', neighborhoods: [{ id: 'outer_richmond', weight: 0.8 }, { id: 'sea_cliff', weight: 0.2 }] },
  { tract: '048000', neighborhoods: [{ id: 'outer_richmond', weight: 1 }] },

  // SEA CLIFF (tract 427)
  { tract: '042700', neighborhoods: [{ id: 'sea_cliff', weight: 1 }] },

  // HAIGHT-ASHBURY (tracts 166, 167, 168)
  { tract: '016600', neighborhoods: [{ id: 'haight_ashbury', weight: 1 }] },
  { tract: '016700', neighborhoods: [{ id: 'haight_ashbury', weight: 1 }] },
  { tract: '016800', neighborhoods: [{ id: 'haight_ashbury', weight: 0.7 }, { id: 'cole_valley', weight: 0.3 }] },

  // COLE VALLEY (tract 169)
  { tract: '016900', neighborhoods: [{ id: 'cole_valley', weight: 1 }] },

  // HAYES VALLEY (tracts 169.01, 169.02)
  { tract: '016901', neighborhoods: [{ id: 'hayes_valley', weight: 1 }] },
  { tract: '016902', neighborhoods: [{ id: 'hayes_valley', weight: 1 }] },

  // INNER SUNSET (tracts 301, 302, 303, 304)
  { tract: '030100', neighborhoods: [{ id: 'inner_sunset', weight: 1 }] },
  { tract: '030200', neighborhoods: [{ id: 'inner_sunset', weight: 1 }] },
  { tract: '030300', neighborhoods: [{ id: 'inner_sunset', weight: 1 }] },
  { tract: '030400', neighborhoods: [{ id: 'inner_sunset', weight: 1 }] },

  // OUTER SUNSET (tracts 326, 327, 328, 329, 330, 331, 332, 333, 334, 335)
  { tract: '032600', neighborhoods: [{ id: 'outer_sunset', weight: 1 }] },
  { tract: '032700', neighborhoods: [{ id: 'outer_sunset', weight: 1 }] },
  { tract: '032800', neighborhoods: [{ id: 'outer_sunset', weight: 1 }] },
  { tract: '032900', neighborhoods: [{ id: 'outer_sunset', weight: 1 }] },
  { tract: '033000', neighborhoods: [{ id: 'outer_sunset', weight: 1 }] },
  { tract: '033100', neighborhoods: [{ id: 'outer_sunset', weight: 1 }] },
  { tract: '033200', neighborhoods: [{ id: 'outer_sunset', weight: 1 }] },
  { tract: '033300', neighborhoods: [{ id: 'outer_sunset', weight: 1 }] },
  { tract: '033400', neighborhoods: [{ id: 'outer_sunset', weight: 1 }] },
  { tract: '033500', neighborhoods: [{ id: 'outer_sunset', weight: 1 }] },

  // PARKSIDE (tracts 336, 337, 338, 339, 351, 352)
  { tract: '033600', neighborhoods: [{ id: 'parkside', weight: 1 }] },
  { tract: '033700', neighborhoods: [{ id: 'parkside', weight: 1 }] },
  { tract: '033800', neighborhoods: [{ id: 'parkside', weight: 1 }] },
  { tract: '033900', neighborhoods: [{ id: 'parkside', weight: 1 }] },
  { tract: '035100', neighborhoods: [{ id: 'parkside', weight: 1 }] },
  { tract: '035200', neighborhoods: [{ id: 'parkside', weight: 1 }] },

  // STONESTOWN / LAKESHORE (tracts 353, 354)
  { tract: '035300', neighborhoods: [{ id: 'stonestown', weight: 0.6 }, { id: 'lakeshore', weight: 0.4 }] },
  { tract: '035400', neighborhoods: [{ id: 'lakeshore', weight: 1 }] },

  // WEST PORTAL (tracts 308, 309)
  { tract: '030800', neighborhoods: [{ id: 'west_portal', weight: 1 }] },
  { tract: '030900', neighborhoods: [{ id: 'west_portal', weight: 1 }] },

  // TWIN PEAKS (tracts 201, 202)
  { tract: '020100', neighborhoods: [{ id: 'twin_peaks', weight: 1 }] },
  { tract: '020200', neighborhoods: [{ id: 'twin_peaks', weight: 1 }] },

  // DIAMOND HEIGHTS (tracts 204, 205)
  { tract: '020400', neighborhoods: [{ id: 'diamond_heights', weight: 1 }] },
  { tract: '020500', neighborhoods: [{ id: 'diamond_heights', weight: 1 }] },

  // GLEN PARK (tracts 206, 207)
  { tract: '020600', neighborhoods: [{ id: 'glen_park', weight: 1 }] },
  { tract: '020700', neighborhoods: [{ id: 'glen_park', weight: 1 }] },

  // NOE VALLEY (tracts 208, 209, 210, 211)
  { tract: '020800', neighborhoods: [{ id: 'noe_valley', weight: 1 }] },
  { tract: '020900', neighborhoods: [{ id: 'noe_valley', weight: 1 }] },
  { tract: '021000', neighborhoods: [{ id: 'noe_valley', weight: 1 }] },
  { tract: '021100', neighborhoods: [{ id: 'noe_valley', weight: 1 }] },

  // CASTRO (tracts 212, 213, 214)
  { tract: '021200', neighborhoods: [{ id: 'castro', weight: 1 }] },
  { tract: '021300', neighborhoods: [{ id: 'castro', weight: 1 }] },
  { tract: '021400', neighborhoods: [{ id: 'castro', weight: 1 }] },

  // MISSION (tracts 177, 201, 202, 208, 209, 210, 211, 226, 227, 228, 228.01, 228.02, 228.03, 229.01, 229.02, 229.03)
  { tract: '017700', neighborhoods: [{ id: 'mission', weight: 1 }] },
  { tract: '022600', neighborhoods: [{ id: 'mission', weight: 1 }] },
  { tract: '022700', neighborhoods: [{ id: 'mission', weight: 1 }] },
  { tract: '022800', neighborhoods: [{ id: 'mission', weight: 1 }] },
  { tract: '022801', neighborhoods: [{ id: 'mission', weight: 1 }] },
  { tract: '022802', neighborhoods: [{ id: 'mission', weight: 1 }] },
  { tract: '022803', neighborhoods: [{ id: 'mission', weight: 1 }] },
  { tract: '022901', neighborhoods: [{ id: 'mission', weight: 1 }] },
  { tract: '022902', neighborhoods: [{ id: 'mission', weight: 1 }] },
  { tract: '022903', neighborhoods: [{ id: 'mission', weight: 0.6 }, { id: 'bernal_heights', weight: 0.4 }] },

  // BERNAL HEIGHTS (tracts 252, 253, 254)
  { tract: '025200', neighborhoods: [{ id: 'bernal_heights', weight: 1 }] },
  { tract: '025300', neighborhoods: [{ id: 'bernal_heights', weight: 1 }] },
  { tract: '025400', neighborhoods: [{ id: 'bernal_heights', weight: 1 }] },

  // POTRERO HILL (tracts 225, 226)
  { tract: '022500', neighborhoods: [{ id: 'potrero_hill', weight: 1 }] },
  { tract: '022600', neighborhoods: [{ id: 'potrero_hill', weight: 1 }] },

  // DOGPATCH (tracts 227, 614.01)
  { tract: '022700', neighborhoods: [{ id: 'dogpatch', weight: 1 }] },
  { tract: '061401', neighborhoods: [{ id: 'dogpatch', weight: 1 }] },

  // BAYVIEW-HUNTERS POINT (tracts 230, 231, 232, 233, 234, 606, 608)
  { tract: '023000', neighborhoods: [{ id: 'bayview_hunters_point', weight: 1 }] },
  { tract: '023100', neighborhoods: [{ id: 'bayview_hunters_point', weight: 1 }] },
  { tract: '023200', neighborhoods: [{ id: 'bayview_hunters_point', weight: 1 }] },
  { tract: '023300', neighborhoods: [{ id: 'bayview_hunters_point', weight: 1 }] },
  { tract: '023400', neighborhoods: [{ id: 'bayview_hunters_point', weight: 1 }] },
  { tract: '060600', neighborhoods: [{ id: 'bayview_hunters_point', weight: 1 }] },
  { tract: '060800', neighborhoods: [{ id: 'bayview_hunters_point', weight: 1 }] },

  // VISITACION VALLEY (tracts 260, 261, 262)
  { tract: '026000', neighborhoods: [{ id: 'visitacion_valley', weight: 1 }] },
  { tract: '026100', neighborhoods: [{ id: 'visitacion_valley', weight: 1 }] },
  { tract: '026200', neighborhoods: [{ id: 'visitacion_valley', weight: 1 }] },

  // PORTOLA (tracts 256, 257)
  { tract: '025600', neighborhoods: [{ id: 'portola', weight: 1 }] },
  { tract: '025700', neighborhoods: [{ id: 'portola', weight: 1 }] },

  // EXCELSIOR (tracts 263, 264, 265, 266)
  { tract: '026300', neighborhoods: [{ id: 'excelsior', weight: 1 }] },
  { tract: '026400', neighborhoods: [{ id: 'excelsior', weight: 1 }] },
  { tract: '026500', neighborhoods: [{ id: 'excelsior', weight: 1 }] },
  { tract: '026600', neighborhoods: [{ id: 'excelsior', weight: 1 }] },

  // OUTER MISSION (tracts 255, 258, 259)
  { tract: '025500', neighborhoods: [{ id: 'outer_mission', weight: 1 }] },
  { tract: '025800', neighborhoods: [{ id: 'outer_mission', weight: 1 }] },
  { tract: '025900', neighborhoods: [{ id: 'outer_mission', weight: 1 }] },

  // INGLESIDE (tracts 310, 311, 312, 313)
  { tract: '031000', neighborhoods: [{ id: 'ingleside', weight: 1 }] },
  { tract: '031100', neighborhoods: [{ id: 'ingleside', weight: 1 }] },
  { tract: '031200', neighborhoods: [{ id: 'ingleside', weight: 1 }] },
  { tract: '031300', neighborhoods: [{ id: 'ingleside', weight: 1 }] },

  // OCEANVIEW (tracts 314, 315)
  { tract: '031400', neighborhoods: [{ id: 'oceanview', weight: 1 }] },
  { tract: '031500', neighborhoods: [{ id: 'oceanview', weight: 1 }] },

  // TREASURE ISLAND (tract 980)
  { tract: '980000', neighborhoods: [{ id: 'treasure_island', weight: 1 }] },
];

/**
 * Get the full tract ID (with state and county prefix)
 */
export function getFullTractId(tract: string): string {
  return `06075${tract}`;
}

/**
 * Get neighborhoods for a given tract
 */
export function getNeighborhoodsForTract(tract: string): { id: SFNeighborhood; weight: number }[] {
  // Strip prefix if present
  const tractCode = tract.replace('06075', '');
  const mapping = TRACT_TO_NEIGHBORHOOD.find((m) => m.tract === tractCode);
  return mapping?.neighborhoods ?? [];
}

/**
 * Get all tracts for a given neighborhood
 */
export function getTractsForNeighborhood(neighborhood: SFNeighborhood): { tract: string; weight: number }[] {
  return TRACT_TO_NEIGHBORHOOD
    .filter((m) => m.neighborhoods.some((n) => n.id === neighborhood))
    .map((m) => {
      const match = m.neighborhoods.find((n) => n.id === neighborhood)!;
      return { tract: m.tract, weight: match.weight };
    });
}

/**
 * Get all unique neighborhoods in the mapping
 */
export function getAllMappedNeighborhoods(): SFNeighborhood[] {
  const neighborhoods = new Set<SFNeighborhood>();
  for (const mapping of TRACT_TO_NEIGHBORHOOD) {
    for (const n of mapping.neighborhoods) {
      neighborhoods.add(n.id);
    }
  }
  return Array.from(neighborhoods);
}

/**
 * San Francisco Geographic Reference Data
 *
 * Contains neighborhood boundaries, district mappings, and geographic utilities
 * for the census overlay and map visualization features.
 */

import type { SFNeighborhood, SFDistrict } from '@/types';

// =============================================================================
// NEIGHBORHOOD METADATA
// =============================================================================

export interface NeighborhoodInfo {
  id: SFNeighborhood;
  name: string;                          // Display name
  district: SFDistrict;                  // Supervisorial district
  zipCodes: string[];                    // Associated zip codes
  // Rough bounding box for map positioning (SW corner, NE corner)
  bounds: {
    sw: { lat: number; lng: number };
    ne: { lat: number; lng: number };
  };
  // Center point for labels/markers
  center: { lat: number; lng: number };
}

/**
 * Complete SF neighborhood reference data
 * Coordinates are approximate centers and bounds for visualization
 */
export const SF_NEIGHBORHOODS: Record<SFNeighborhood, NeighborhoodInfo> = {
  bayview_hunters_point: {
    id: 'bayview_hunters_point',
    name: 'Bayview-Hunters Point',
    district: 10,
    zipCodes: ['94124'],
    bounds: { sw: { lat: 37.7198, lng: -122.4012 }, ne: { lat: 37.7425, lng: -122.3651 } },
    center: { lat: 37.7296, lng: -122.3878 },
  },
  bernal_heights: {
    id: 'bernal_heights',
    name: 'Bernal Heights',
    district: 9,
    zipCodes: ['94110'],
    bounds: { sw: { lat: 37.7358, lng: -122.4235 }, ne: { lat: 37.7512, lng: -122.4012 } },
    center: { lat: 37.7435, lng: -122.4154 },
  },
  castro: {
    id: 'castro',
    name: 'Castro',
    district: 8,
    zipCodes: ['94114'],
    bounds: { sw: { lat: 37.7558, lng: -122.4412 }, ne: { lat: 37.7678, lng: -122.4268 } },
    center: { lat: 37.7609, lng: -122.4350 },
  },
  chinatown: {
    id: 'chinatown',
    name: 'Chinatown',
    district: 3,
    zipCodes: ['94108', '94133'],
    bounds: { sw: { lat: 37.7912, lng: -122.4112 }, ne: { lat: 37.7978, lng: -122.4028 } },
    center: { lat: 37.7941, lng: -122.4078 },
  },
  civic_center: {
    id: 'civic_center',
    name: 'Civic Center',
    district: 6,
    zipCodes: ['94102'],
    bounds: { sw: { lat: 37.7758, lng: -122.4232 }, ne: { lat: 37.7832, lng: -122.4112 } },
    center: { lat: 37.7792, lng: -122.4158 },
  },
  cole_valley: {
    id: 'cole_valley',
    name: 'Cole Valley',
    district: 5,
    zipCodes: ['94117'],
    bounds: { sw: { lat: 37.7612, lng: -122.4532 }, ne: { lat: 37.7712, lng: -122.4432 } },
    center: { lat: 37.7658, lng: -122.4498 },
  },
  diamond_heights: {
    id: 'diamond_heights',
    name: 'Diamond Heights',
    district: 8,
    zipCodes: ['94131'],
    bounds: { sw: { lat: 37.7398, lng: -122.4432 }, ne: { lat: 37.7512, lng: -122.4298 } },
    center: { lat: 37.7438, lng: -122.4358 },
  },
  dogpatch: {
    id: 'dogpatch',
    name: 'Dogpatch',
    district: 10,
    zipCodes: ['94107'],
    bounds: { sw: { lat: 37.7558, lng: -122.3932 }, ne: { lat: 37.7658, lng: -122.3798 } },
    center: { lat: 37.7612, lng: -122.3878 },
  },
  downtown: {
    id: 'downtown',
    name: 'Downtown/Union Square',
    district: 3,
    zipCodes: ['94102', '94108'],
    bounds: { sw: { lat: 37.7832, lng: -122.4132 }, ne: { lat: 37.7912, lng: -122.4012 } },
    center: { lat: 37.7879, lng: -122.4074 },
  },
  excelsior: {
    id: 'excelsior',
    name: 'Excelsior',
    district: 11,
    zipCodes: ['94112'],
    bounds: { sw: { lat: 37.7198, lng: -122.4332 }, ne: { lat: 37.7358, lng: -122.4112 } },
    center: { lat: 37.7258, lng: -122.4248 },
  },
  financial_district: {
    id: 'financial_district',
    name: 'Financial District',
    district: 3,
    zipCodes: ['94104', '94111'],
    bounds: { sw: { lat: 37.7898, lng: -122.4032 }, ne: { lat: 37.7978, lng: -122.3912 } },
    center: { lat: 37.7946, lng: -122.3999 },
  },
  glen_park: {
    id: 'glen_park',
    name: 'Glen Park',
    district: 8,
    zipCodes: ['94131'],
    bounds: { sw: { lat: 37.7298, lng: -122.4398 }, ne: { lat: 37.7412, lng: -122.4232 } },
    center: { lat: 37.7341, lng: -122.4332 },
  },
  haight_ashbury: {
    id: 'haight_ashbury',
    name: 'Haight-Ashbury',
    district: 5,
    zipCodes: ['94117'],
    bounds: { sw: { lat: 37.7658, lng: -122.4532 }, ne: { lat: 37.7758, lng: -122.4378 } },
    center: { lat: 37.7692, lng: -122.4481 },
  },
  hayes_valley: {
    id: 'hayes_valley',
    name: 'Hayes Valley',
    district: 5,
    zipCodes: ['94102', '94117'],
    bounds: { sw: { lat: 37.7712, lng: -122.4332 }, ne: { lat: 37.7792, lng: -122.4198 } },
    center: { lat: 37.7759, lng: -122.4245 },
  },
  ingleside: {
    id: 'ingleside',
    name: 'Ingleside',
    district: 7,
    zipCodes: ['94112'],
    bounds: { sw: { lat: 37.7098, lng: -122.4532 }, ne: { lat: 37.7258, lng: -122.4332 } },
    center: { lat: 37.7198, lng: -122.4432 },
  },
  inner_richmond: {
    id: 'inner_richmond',
    name: 'Inner Richmond',
    district: 1,
    zipCodes: ['94118'],
    bounds: { sw: { lat: 37.7758, lng: -122.4698 }, ne: { lat: 37.7858, lng: -122.4498 } },
    center: { lat: 37.7792, lng: -122.4612 },
  },
  inner_sunset: {
    id: 'inner_sunset',
    name: 'Inner Sunset',
    district: 5,
    zipCodes: ['94122'],
    bounds: { sw: { lat: 37.7558, lng: -122.4732 }, ne: { lat: 37.7658, lng: -122.4532 } },
    center: { lat: 37.7625, lng: -122.4658 },
  },
  japantown: {
    id: 'japantown',
    name: 'Japantown',
    district: 5,
    zipCodes: ['94115'],
    bounds: { sw: { lat: 37.7832, lng: -122.4332 }, ne: { lat: 37.7878, lng: -122.4232 } },
    center: { lat: 37.7851, lng: -122.4298 },
  },
  lakeshore: {
    id: 'lakeshore',
    name: 'Lakeshore',
    district: 7,
    zipCodes: ['94132'],
    bounds: { sw: { lat: 37.7198, lng: -122.4898 }, ne: { lat: 37.7298, lng: -122.4732 } },
    center: { lat: 37.7258, lng: -122.4798 },
  },
  laurel_heights: {
    id: 'laurel_heights',
    name: 'Laurel Heights',
    district: 1,
    zipCodes: ['94118'],
    bounds: { sw: { lat: 37.7812, lng: -122.4532 }, ne: { lat: 37.7878, lng: -122.4432 } },
    center: { lat: 37.7841, lng: -122.4498 },
  },
  marina: {
    id: 'marina',
    name: 'Marina',
    district: 2,
    zipCodes: ['94123'],
    bounds: { sw: { lat: 37.7978, lng: -122.4498 }, ne: { lat: 37.8078, lng: -122.4298 } },
    center: { lat: 37.8025, lng: -122.4378 },
  },
  mission: {
    id: 'mission',
    name: 'Mission',
    district: 9,
    zipCodes: ['94110', '94103'],
    bounds: { sw: { lat: 37.7478, lng: -122.4232 }, ne: { lat: 37.7698, lng: -122.4032 } },
    center: { lat: 37.7599, lng: -122.4148 },
  },
  mission_bay: {
    id: 'mission_bay',
    name: 'Mission Bay',
    district: 6,
    zipCodes: ['94158'],
    bounds: { sw: { lat: 37.7658, lng: -122.3998 }, ne: { lat: 37.7778, lng: -122.3832 } },
    center: { lat: 37.7712, lng: -122.3912 },
  },
  nob_hill: {
    id: 'nob_hill',
    name: 'Nob Hill',
    district: 3,
    zipCodes: ['94108', '94109'],
    bounds: { sw: { lat: 37.7878, lng: -122.4198 }, ne: { lat: 37.7958, lng: -122.4098 } },
    center: { lat: 37.7925, lng: -122.4158 },
  },
  noe_valley: {
    id: 'noe_valley',
    name: 'Noe Valley',
    district: 8,
    zipCodes: ['94114', '94131'],
    bounds: { sw: { lat: 37.7458, lng: -122.4398 }, ne: { lat: 37.7578, lng: -122.4232 } },
    center: { lat: 37.7502, lng: -122.4332 },
  },
  north_beach: {
    id: 'north_beach',
    name: 'North Beach',
    district: 3,
    zipCodes: ['94133'],
    bounds: { sw: { lat: 37.7978, lng: -122.4132 }, ne: { lat: 37.8058, lng: -122.4012 } },
    center: { lat: 37.8012, lng: -122.4098 },
  },
  oceanview: {
    id: 'oceanview',
    name: 'Oceanview',
    district: 11,
    zipCodes: ['94112'],
    bounds: { sw: { lat: 37.7098, lng: -122.4598 }, ne: { lat: 37.7198, lng: -122.4432 } },
    center: { lat: 37.7148, lng: -122.4532 },
  },
  outer_mission: {
    id: 'outer_mission',
    name: 'Outer Mission',
    district: 11,
    zipCodes: ['94112'],
    bounds: { sw: { lat: 37.7198, lng: -122.4432 }, ne: { lat: 37.7358, lng: -122.4232 } },
    center: { lat: 37.7258, lng: -122.4348 },
  },
  outer_richmond: {
    id: 'outer_richmond',
    name: 'Outer Richmond',
    district: 1,
    zipCodes: ['94121'],
    bounds: { sw: { lat: 37.7758, lng: -122.5098 }, ne: { lat: 37.7858, lng: -122.4698 } },
    center: { lat: 37.7792, lng: -122.4898 },
  },
  outer_sunset: {
    id: 'outer_sunset',
    name: 'Outer Sunset',
    district: 4,
    zipCodes: ['94116', '94122'],
    bounds: { sw: { lat: 37.7498, lng: -122.5098 }, ne: { lat: 37.7598, lng: -122.4732 } },
    center: { lat: 37.7541, lng: -122.4932 },
  },
  pacific_heights: {
    id: 'pacific_heights',
    name: 'Pacific Heights',
    district: 2,
    zipCodes: ['94115', '94123'],
    bounds: { sw: { lat: 37.7878, lng: -122.4432 }, ne: { lat: 37.7978, lng: -122.4232 } },
    center: { lat: 37.7925, lng: -122.4348 },
  },
  parkside: {
    id: 'parkside',
    name: 'Parkside',
    district: 4,
    zipCodes: ['94116'],
    bounds: { sw: { lat: 37.7358, lng: -122.4832 }, ne: { lat: 37.7498, lng: -122.4632 } },
    center: { lat: 37.7425, lng: -122.4732 },
  },
  portola: {
    id: 'portola',
    name: 'Portola',
    district: 9,
    zipCodes: ['94134'],
    bounds: { sw: { lat: 37.7098, lng: -122.4112 }, ne: { lat: 37.7258, lng: -122.3932 } },
    center: { lat: 37.7178, lng: -122.4032 },
  },
  potrero_hill: {
    id: 'potrero_hill',
    name: 'Potrero Hill',
    district: 10,
    zipCodes: ['94107'],
    bounds: { sw: { lat: 37.7558, lng: -122.4098 }, ne: { lat: 37.7698, lng: -122.3912 } },
    center: { lat: 37.7612, lng: -122.4012 },
  },
  presidio: {
    id: 'presidio',
    name: 'Presidio',
    district: 2,
    zipCodes: ['94129'],
    bounds: { sw: { lat: 37.7878, lng: -122.4798 }, ne: { lat: 37.8058, lng: -122.4432 } },
    center: { lat: 37.7989, lng: -122.4662 },
  },
  russian_hill: {
    id: 'russian_hill',
    name: 'Russian Hill',
    district: 3,
    zipCodes: ['94109'],
    bounds: { sw: { lat: 37.7958, lng: -122.4232 }, ne: { lat: 37.8032, lng: -122.4098 } },
    center: { lat: 37.8002, lng: -122.4178 },
  },
  sea_cliff: {
    id: 'sea_cliff',
    name: 'Sea Cliff',
    district: 1,
    zipCodes: ['94121'],
    bounds: { sw: { lat: 37.7832, lng: -122.4932 }, ne: { lat: 37.7898, lng: -122.4798 } },
    center: { lat: 37.7858, lng: -122.4878 },
  },
  soma: {
    id: 'soma',
    name: 'SoMa',
    district: 6,
    zipCodes: ['94103', '94107'],
    bounds: { sw: { lat: 37.7698, lng: -122.4132 }, ne: { lat: 37.7858, lng: -122.3912 } },
    center: { lat: 37.7785, lng: -122.4012 },
  },
  south_beach: {
    id: 'south_beach',
    name: 'South Beach',
    district: 6,
    zipCodes: ['94105'],
    bounds: { sw: { lat: 37.7812, lng: -122.3998 }, ne: { lat: 37.7898, lng: -122.3878 } },
    center: { lat: 37.7858, lng: -122.3932 },
  },
  stonestown: {
    id: 'stonestown',
    name: 'Stonestown',
    district: 7,
    zipCodes: ['94132'],
    bounds: { sw: { lat: 37.7258, lng: -122.4832 }, ne: { lat: 37.7358, lng: -122.4732 } },
    center: { lat: 37.7292, lng: -122.4778 },
  },
  tenderloin: {
    id: 'tenderloin',
    name: 'Tenderloin',
    district: 6,
    zipCodes: ['94102', '94109'],
    bounds: { sw: { lat: 37.7798, lng: -122.4198 }, ne: { lat: 37.7878, lng: -122.4098 } },
    center: { lat: 37.7838, lng: -122.4148 },
  },
  treasure_island: {
    id: 'treasure_island',
    name: 'Treasure Island',
    district: 6,
    zipCodes: ['94130'],
    bounds: { sw: { lat: 37.8158, lng: -122.3798 }, ne: { lat: 37.8298, lng: -122.3598 } },
    center: { lat: 37.8235, lng: -122.3698 },
  },
  twin_peaks: {
    id: 'twin_peaks',
    name: 'Twin Peaks',
    district: 8,
    zipCodes: ['94114', '94131'],
    bounds: { sw: { lat: 37.7478, lng: -122.4532 }, ne: { lat: 37.7578, lng: -122.4398 } },
    center: { lat: 37.7525, lng: -122.4478 },
  },
  visitacion_valley: {
    id: 'visitacion_valley',
    name: 'Visitacion Valley',
    district: 10,
    zipCodes: ['94134'],
    bounds: { sw: { lat: 37.7098, lng: -122.4132 }, ne: { lat: 37.7198, lng: -122.3932 } },
    center: { lat: 37.7148, lng: -122.4048 },
  },
  west_portal: {
    id: 'west_portal',
    name: 'West Portal',
    district: 7,
    zipCodes: ['94127'],
    bounds: { sw: { lat: 37.7358, lng: -122.4698 }, ne: { lat: 37.7458, lng: -122.4598 } },
    center: { lat: 37.7402, lng: -122.4658 },
  },
  western_addition: {
    id: 'western_addition',
    name: 'Western Addition',
    district: 5,
    zipCodes: ['94115', '94117'],
    bounds: { sw: { lat: 37.7778, lng: -122.4432 }, ne: { lat: 37.7878, lng: -122.4232 } },
    center: { lat: 37.7812, lng: -122.4348 },
  },
};

// =============================================================================
// DISTRICT METADATA
// =============================================================================

export interface DistrictInfo {
  district: SFDistrict;
  name: string;
  supervisor?: string;                   // Current supervisor (can be updated)
  neighborhoods: SFNeighborhood[];
  description: string;
}

export const SF_DISTRICTS: Record<SFDistrict, DistrictInfo> = {
  1: {
    district: 1,
    name: 'District 1',
    neighborhoods: ['inner_richmond', 'outer_richmond', 'sea_cliff', 'laurel_heights'],
    description: 'Richmond District - Diverse Asian-American communities, families',
  },
  2: {
    district: 2,
    name: 'District 2',
    neighborhoods: ['marina', 'pacific_heights', 'presidio'],
    description: 'Marina/Pacific Heights - Affluent, young professionals',
  },
  3: {
    district: 3,
    name: 'District 3',
    neighborhoods: ['chinatown', 'north_beach', 'financial_district', 'downtown', 'nob_hill', 'russian_hill'],
    description: 'Northeast SF - Chinatown, North Beach, Financial District',
  },
  4: {
    district: 4,
    name: 'District 4',
    neighborhoods: ['outer_sunset', 'parkside'],
    description: 'Sunset District - Families, Asian-American communities',
  },
  5: {
    district: 5,
    name: 'District 5',
    neighborhoods: ['haight_ashbury', 'cole_valley', 'inner_sunset', 'hayes_valley', 'western_addition', 'japantown'],
    description: 'Central SF - Diverse, progressive, mixed income',
  },
  6: {
    district: 6,
    name: 'District 6',
    neighborhoods: ['soma', 'tenderloin', 'civic_center', 'south_beach', 'mission_bay', 'treasure_island'],
    description: 'SoMa/Tenderloin - Urban core, high need, tech workers',
  },
  7: {
    district: 7,
    name: 'District 7',
    neighborhoods: ['west_portal', 'ingleside', 'lakeshore', 'stonestown'],
    description: 'Southwest SF - Families, suburban feel',
  },
  8: {
    district: 8,
    name: 'District 8',
    neighborhoods: ['castro', 'noe_valley', 'diamond_heights', 'glen_park', 'twin_peaks'],
    description: 'Castro/Noe Valley - LGBTQ+ community, families',
  },
  9: {
    district: 9,
    name: 'District 9',
    neighborhoods: ['mission', 'bernal_heights', 'portola'],
    description: 'Mission/Bernal - Latino community, artists, families',
  },
  10: {
    district: 10,
    name: 'District 10',
    neighborhoods: ['bayview_hunters_point', 'potrero_hill', 'dogpatch', 'visitacion_valley'],
    description: 'Southeast SF - Black community, working class, gentrifying',
  },
  11: {
    district: 11,
    name: 'District 11',
    neighborhoods: ['excelsior', 'outer_mission', 'oceanview'],
    description: 'Excelsior/OMI - Immigrant families, working class, diverse',
  },
};

// =============================================================================
// ZIP CODE MAPPINGS
// =============================================================================

export const SF_ZIP_CODES: Record<string, {
  neighborhoods: SFNeighborhood[];
  district: SFDistrict;
}> = {
  '94102': { neighborhoods: ['tenderloin', 'civic_center', 'hayes_valley'], district: 6 },
  '94103': { neighborhoods: ['soma', 'mission'], district: 6 },
  '94104': { neighborhoods: ['financial_district'], district: 3 },
  '94105': { neighborhoods: ['south_beach'], district: 6 },
  '94107': { neighborhoods: ['potrero_hill', 'dogpatch', 'soma'], district: 10 },
  '94108': { neighborhoods: ['chinatown', 'downtown', 'nob_hill'], district: 3 },
  '94109': { neighborhoods: ['russian_hill', 'nob_hill', 'tenderloin'], district: 3 },
  '94110': { neighborhoods: ['mission', 'bernal_heights'], district: 9 },
  '94111': { neighborhoods: ['financial_district'], district: 3 },
  '94112': { neighborhoods: ['excelsior', 'outer_mission', 'ingleside', 'oceanview'], district: 11 },
  '94114': { neighborhoods: ['castro', 'noe_valley', 'twin_peaks'], district: 8 },
  '94115': { neighborhoods: ['pacific_heights', 'western_addition', 'japantown'], district: 2 },
  '94116': { neighborhoods: ['parkside', 'outer_sunset'], district: 4 },
  '94117': { neighborhoods: ['haight_ashbury', 'cole_valley', 'western_addition'], district: 5 },
  '94118': { neighborhoods: ['inner_richmond', 'laurel_heights'], district: 1 },
  '94121': { neighborhoods: ['outer_richmond', 'sea_cliff'], district: 1 },
  '94122': { neighborhoods: ['inner_sunset', 'outer_sunset'], district: 4 },
  '94123': { neighborhoods: ['marina', 'pacific_heights'], district: 2 },
  '94124': { neighborhoods: ['bayview_hunters_point'], district: 10 },
  '94127': { neighborhoods: ['west_portal'], district: 7 },
  '94129': { neighborhoods: ['presidio'], district: 2 },
  '94130': { neighborhoods: ['treasure_island'], district: 6 },
  '94131': { neighborhoods: ['glen_park', 'diamond_heights', 'noe_valley', 'twin_peaks'], district: 8 },
  '94132': { neighborhoods: ['lakeshore', 'stonestown'], district: 7 },
  '94133': { neighborhoods: ['north_beach', 'chinatown'], district: 3 },
  '94134': { neighborhoods: ['visitacion_valley', 'portola'], district: 10 },
  '94158': { neighborhoods: ['mission_bay'], district: 6 },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get all neighborhoods in a district
 */
export function getNeighborhoodsByDistrict(district: SFDistrict): SFNeighborhood[] {
  return SF_DISTRICTS[district].neighborhoods;
}

/**
 * Get district for a neighborhood
 */
export function getDistrictForNeighborhood(neighborhood: SFNeighborhood): SFDistrict {
  return SF_NEIGHBORHOODS[neighborhood].district;
}

/**
 * Get neighborhoods for a zip code
 */
export function getNeighborhoodsByZip(zipCode: string): SFNeighborhood[] {
  return SF_ZIP_CODES[zipCode]?.neighborhoods || [];
}

/**
 * Get all zip codes for a neighborhood
 */
export function getZipCodesForNeighborhood(neighborhood: SFNeighborhood): string[] {
  return SF_NEIGHBORHOODS[neighborhood].zipCodes;
}

/**
 * Check if a point is within SF bounds
 */
export function isWithinSF(lat: number, lng: number): boolean {
  // Rough SF bounding box
  return lat >= 37.70 && lat <= 37.83 && lng >= -122.52 && lng <= -122.35;
}

/**
 * Get SF city-wide bounds
 */
export function getSFBounds(): { sw: { lat: number; lng: number }; ne: { lat: number; lng: number } } {
  return {
    sw: { lat: 37.7039, lng: -122.5271 },
    ne: { lat: 37.8324, lng: -122.3482 },
  };
}

/**
 * Get center of SF
 */
export function getSFCenter(): { lat: number; lng: number } {
  return { lat: 37.7749, lng: -122.4194 };
}

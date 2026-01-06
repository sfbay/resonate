/**
 * SF Zip Code to Neighborhood Mapping
 *
 * Maps San Francisco zip codes to Analysis Neighborhoods.
 * Since zip codes don't perfectly align with neighborhood boundaries,
 * each zip code is assigned to its primary/dominant neighborhood.
 *
 * For zip codes that span multiple neighborhoods, we use the neighborhood
 * that contains the majority of residential addresses.
 */

import type { SFNeighborhood } from '@/types';

/**
 * Primary neighborhood assignment for each SF zip code
 * Based on geographic overlap with Analysis Neighborhoods
 */
export const ZIP_TO_NEIGHBORHOOD: Record<string, SFNeighborhood> = {
  // Downtown / Financial District area
  '94102': 'tenderloin',        // Tenderloin, Civic Center, Hayes Valley
  '94103': 'soma',              // SoMa
  '94104': 'financial_district', // Financial District
  '94105': 'financial_district', // South Beach, Rincon Hill
  '94107': 'potrero_hill',       // Potrero Hill, Dogpatch, Mission Bay
  '94108': 'chinatown',          // Chinatown, Nob Hill
  '94109': 'russian_hill',       // Russian Hill, Polk Gulch, Nob Hill
  '94111': 'financial_district', // Embarcadero, FiDi North

  // Mission / Castro / Noe Valley
  '94110': 'mission',            // Mission District
  '94114': 'castro',             // Castro, Noe Valley, Twin Peaks
  '94131': 'twin_peaks',         // Twin Peaks, Glen Park, Diamond Heights

  // North / Marina / Pacific Heights
  '94115': 'pacific_heights',    // Pacific Heights, Japantown, Western Addition
  '94117': 'haight_ashbury',     // Haight-Ashbury, Cole Valley
  '94118': 'inner_richmond',     // Inner Richmond
  '94121': 'outer_richmond',     // Outer Richmond, Sea Cliff
  '94123': 'marina',             // Marina, Cow Hollow
  '94133': 'north_beach',        // North Beach, Telegraph Hill

  // South / Excelsior / Bayview
  '94112': 'excelsior',          // Excelsior, Ingleside, Outer Mission
  '94124': 'bayview_hunters_point', // Bayview-Hunters Point
  '94134': 'visitacion_valley',  // Visitacion Valley, Portola

  // Sunset / West Side
  '94116': 'inner_sunset',       // Inner Sunset, Forest Hill
  '94122': 'inner_sunset',       // Sunset District (inner portion)
  '94127': 'west_portal',        // West Portal, St. Francis Wood
  '94132': 'lakeshore',          // Lake Merced, Stonestown, Parkside

  // Bernal / Glen Park
  '94110': 'mission',            // (already defined - Mission primary)

  // Special areas
  '94129': 'presidio',           // Presidio
  '94130': 'treasure_island',    // Treasure Island
  '94158': 'mission_bay',        // Mission Bay

  // PO Box / Commercial only (map to nearest residential)
  '94119': 'financial_district', // PO Boxes
  '94120': 'financial_district', // PO Boxes
  '94125': 'bayview_hunters_point', // Hunters Point
  '94126': 'financial_district', // PO Boxes
  '94137': 'financial_district', // PO Boxes
  '94139': 'financial_district', // PO Boxes
  '94140': 'soma',               // Commercial
  '94141': 'soma',               // PO Boxes
  '94142': 'soma',               // PO Boxes
  '94143': 'inner_sunset',       // UCSF
  '94144': 'haight_ashbury',     // PO Boxes
  '94145': 'financial_district', // PO Boxes
  '94146': 'bernal_heights',     // PO Boxes
  '94147': 'marina',             // PO Boxes
  '94151': 'financial_district', // PO Boxes
  '94159': 'outer_richmond',     // VA Medical Center
  '94160': 'financial_district', // Federal Reserve
  '94161': 'financial_district', // PO Boxes
  '94163': 'financial_district', // PO Boxes
  '94164': 'financial_district', // PO Boxes
  '94172': 'financial_district', // PO Boxes
  '94177': 'financial_district', // PO Boxes
  '94188': 'soma',               // PO Boxes
};

/**
 * Get the neighborhood for a given zip code
 * Returns undefined if zip code not found
 */
export function getNeighborhoodForZip(zip: string): SFNeighborhood | undefined {
  // Normalize zip code (first 5 digits only)
  const normalizedZip = zip?.replace(/\D/g, '').slice(0, 5);

  if (!normalizedZip || normalizedZip.length !== 5) {
    return undefined;
  }

  return ZIP_TO_NEIGHBORHOOD[normalizedZip];
}

/**
 * Validate if a string is a valid SF zip code
 */
export function isValidSFZip(zip: string): boolean {
  const normalizedZip = zip?.replace(/\D/g, '').slice(0, 5);
  return normalizedZip?.startsWith('941') ?? false;
}

/**
 * Get all zip codes for a given neighborhood
 * Useful for reverse lookups
 */
export function getZipsForNeighborhood(neighborhood: SFNeighborhood): string[] {
  return Object.entries(ZIP_TO_NEIGHBORHOOD)
    .filter(([, n]) => n === neighborhood)
    .map(([zip]) => zip);
}

/**
 * Housing unit estimates by neighborhood (from ACS data)
 * Used to calculate eviction rates per 1,000 units
 */
export const NEIGHBORHOOD_HOUSING_UNITS: Partial<Record<SFNeighborhood, number>> = {
  bayview_hunters_point: 14500,
  bernal_heights: 11200,
  castro: 12800,
  chinatown: 9800,
  excelsior: 16200,
  financial_district: 18500,
  glen_park: 5600,
  haight_ashbury: 9400,
  hayes_valley: 7200,
  ingleside: 8900,
  inner_richmond: 15600,
  inner_sunset: 12400,
  lakeshore: 8200,
  marina: 11800,
  mission: 24500,
  mission_bay: 8900,
  nob_hill: 14200,
  noe_valley: 9800,
  north_beach: 8600,
  outer_mission: 9400,
  outer_richmond: 18200,
  outer_sunset: 22800,
  pacific_heights: 13400,
  portola: 6800,
  potrero_hill: 9200,
  russian_hill: 11200,
  soma: 21500,
  tenderloin: 18900,
  twin_peaks: 7400,
  visitacion_valley: 8200,
  west_portal: 6200,
  western_addition: 14800,
};

/**
 * Get housing units for a neighborhood
 * Returns a default estimate if not in the lookup
 */
export function getHousingUnits(neighborhood: SFNeighborhood): number {
  return NEIGHBORHOOD_HOUSING_UNITS[neighborhood] ?? 10000;
}

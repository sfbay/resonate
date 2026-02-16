/**
 * Chicagoland Regional Type System
 *
 * Chicago isn't a single city like SF — it's a 6-county metro region.
 * Phase 1: City of Chicago (77 community areas, 50 wards)
 * Phase 2-ready: Suburban municipalities & collar counties
 *
 * The type system is hierarchical:
 * Metro Region → County → Community Area / Suburb
 */

// ─────────────────────────────────────────────────
// PHASE 1: City of Chicago (77 Community Areas)
// ─────────────────────────────────────────────────

export type ChicagoCommunityArea =
  | 'rogers_park' | 'west_ridge' | 'uptown' | 'lincoln_square' | 'north_center'
  | 'lake_view' | 'lincoln_park' | 'near_north_side' | 'edison_park' | 'norwood_park'
  | 'jefferson_park' | 'forest_glen' | 'north_park' | 'albany_park' | 'portage_park'
  | 'irving_park' | 'dunning' | 'montclare' | 'belmont_cragin' | 'hermosa'
  | 'avondale' | 'logan_square' | 'humboldt_park' | 'west_town' | 'austin'
  | 'west_garfield_park' | 'east_garfield_park' | 'near_west_side' | 'north_lawndale' | 'south_lawndale'
  | 'lower_west_side' | 'loop' | 'near_south_side' | 'armour_square' | 'douglas'
  | 'oakland' | 'fuller_park' | 'grand_boulevard' | 'kenwood' | 'washington_park'
  | 'hyde_park' | 'woodlawn' | 'south_shore' | 'chatham' | 'avalon_park'
  | 'south_chicago' | 'burnside' | 'calumet_heights' | 'roseland' | 'pullman'
  | 'south_deering' | 'east_side' | 'west_pullman' | 'riverdale' | 'hegewisch'
  | 'garfield_ridge' | 'archer_heights' | 'brighton_park' | 'mckinley_park' | 'bridgeport'
  | 'new_city' | 'west_elsdon' | 'gage_park' | 'clearing' | 'west_lawn'
  | 'chicago_lawn' | 'west_englewood' | 'englewood' | 'greater_grand_crossing' | 'ashburn'
  | 'auburn_gresham' | 'beverly' | 'washington_heights' | 'mount_greenwood' | 'morgan_park'
  | 'ohare' | 'edgewater';

export type ChicagoWard = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20
  | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30
  | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40
  | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50;

// ─────────────────────────────────────────────────
// PHASE 2-READY: Suburban & County Types
// ─────────────────────────────────────────────────

export type ChicagolandCounty = 'cook' | 'dupage' | 'kane' | 'lake' | 'mchenry' | 'will';

/** Open string type — 300+ suburban municipalities, populated incrementally */
export type ChicagolandSuburb = string;

// ─────────────────────────────────────────────────
// HIERARCHICAL REGION TYPE
// ─────────────────────────────────────────────────

export interface ChicagolandRegion {
  type: 'community_area' | 'suburb' | 'county';
  id: string;                     // e.g., 'austin', 'evanston', 'dupage'
  name: string;                   // Display name
  county: ChicagolandCounty;
  ward?: number;                  // Only for city community areas (primary ward)
  zipCodes: string[];
  center?: { lat: number; lng: number };
  /** Community area number from the City of Chicago (1-77) */
  communityAreaNumber?: number;
  /** Geographic grouping within the city */
  side?: ChicagoSide;
}

/** Side-of-city groupings used by Chicagoans to navigate the 77 community areas */
export type ChicagoSide =
  | 'far_north'
  | 'north'
  | 'northwest'
  | 'west'
  | 'central'
  | 'south'
  | 'southwest'
  | 'far_southwest'
  | 'far_southeast';

// ─────────────────────────────────────────────────
// COUNTY FIPS CODES
// ─────────────────────────────────────────────────

export const CHICAGOLAND_COUNTY_FIPS: Record<ChicagolandCounty, string> = {
  cook: '17031',
  dupage: '17043',
  kane: '17089',
  lake: '17097',
  mchenry: '17111',
  will: '17197',
};

export const IL_STATE_FIPS = '17';

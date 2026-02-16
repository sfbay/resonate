/**
 * Chicagoland Census Tract to Community Area Mapping
 *
 * Maps Cook County census tracts to Chicago's 77 community areas.
 * Phase 1: Cook County (FIPS 17031) tracts → city community areas.
 * Phase 2-ready: stubs for collar county mappings.
 *
 * Source: City of Chicago Community Area boundaries vs Census 2020 tracts
 */

export interface ChicagoTractMapping {
  tract: string;  // 6-digit tract code (without state/county prefix)
  communityAreas: {
    id: string;   // Community area ID (e.g., 'austin', 'loop')
    weight: number; // Proportion of tract population in this area (0-1)
  }[];
}

// Representative census tracts for each community area
// Each area has 3-8 primary tracts; these are the major ones
export const CHICAGO_TRACT_TO_COMMUNITY_AREA: ChicagoTractMapping[] = [
  // ROGERS PARK (CA #1)
  { tract: '010100', communityAreas: [{ id: 'rogers_park', weight: 1 }] },
  { tract: '010200', communityAreas: [{ id: 'rogers_park', weight: 1 }] },
  { tract: '010300', communityAreas: [{ id: 'rogers_park', weight: 1 }] },
  { tract: '010400', communityAreas: [{ id: 'rogers_park', weight: 0.8 }, { id: 'west_ridge', weight: 0.2 }] },

  // WEST RIDGE (CA #2)
  { tract: '020100', communityAreas: [{ id: 'west_ridge', weight: 1 }] },
  { tract: '020200', communityAreas: [{ id: 'west_ridge', weight: 1 }] },
  { tract: '020300', communityAreas: [{ id: 'west_ridge', weight: 1 }] },

  // UPTOWN (CA #3)
  { tract: '030100', communityAreas: [{ id: 'uptown', weight: 1 }] },
  { tract: '030200', communityAreas: [{ id: 'uptown', weight: 1 }] },
  { tract: '030300', communityAreas: [{ id: 'uptown', weight: 0.7 }, { id: 'edgewater', weight: 0.3 }] },

  // LINCOLN SQUARE (CA #4)
  { tract: '040100', communityAreas: [{ id: 'lincoln_square', weight: 1 }] },
  { tract: '040200', communityAreas: [{ id: 'lincoln_square', weight: 1 }] },

  // NORTH CENTER (CA #5)
  { tract: '050100', communityAreas: [{ id: 'north_center', weight: 1 }] },
  { tract: '050200', communityAreas: [{ id: 'north_center', weight: 1 }] },

  // LAKE VIEW (CA #6)
  { tract: '060100', communityAreas: [{ id: 'lake_view', weight: 1 }] },
  { tract: '060200', communityAreas: [{ id: 'lake_view', weight: 1 }] },
  { tract: '060300', communityAreas: [{ id: 'lake_view', weight: 1 }] },

  // LINCOLN PARK (CA #7)
  { tract: '070100', communityAreas: [{ id: 'lincoln_park', weight: 1 }] },
  { tract: '070200', communityAreas: [{ id: 'lincoln_park', weight: 1 }] },
  { tract: '070300', communityAreas: [{ id: 'lincoln_park', weight: 1 }] },

  // NEAR NORTH SIDE (CA #8)
  { tract: '080100', communityAreas: [{ id: 'near_north_side', weight: 1 }] },
  { tract: '080200', communityAreas: [{ id: 'near_north_side', weight: 1 }] },
  { tract: '080300', communityAreas: [{ id: 'near_north_side', weight: 0.7 }, { id: 'loop', weight: 0.3 }] },

  // EDISON PARK (CA #9)
  { tract: '090100', communityAreas: [{ id: 'edison_park', weight: 1 }] },

  // NORWOOD PARK (CA #10)
  { tract: '100100', communityAreas: [{ id: 'norwood_park', weight: 1 }] },
  { tract: '100200', communityAreas: [{ id: 'norwood_park', weight: 1 }] },

  // JEFFERSON PARK (CA #11)
  { tract: '110100', communityAreas: [{ id: 'jefferson_park', weight: 1 }] },
  { tract: '110200', communityAreas: [{ id: 'jefferson_park', weight: 1 }] },

  // FOREST GLEN (CA #12)
  { tract: '120100', communityAreas: [{ id: 'forest_glen', weight: 1 }] },

  // NORTH PARK (CA #13)
  { tract: '130100', communityAreas: [{ id: 'north_park', weight: 1 }] },
  { tract: '130200', communityAreas: [{ id: 'north_park', weight: 1 }] },

  // ALBANY PARK (CA #14)
  { tract: '140100', communityAreas: [{ id: 'albany_park', weight: 1 }] },
  { tract: '140200', communityAreas: [{ id: 'albany_park', weight: 1 }] },

  // PORTAGE PARK (CA #15)
  { tract: '150100', communityAreas: [{ id: 'portage_park', weight: 1 }] },
  { tract: '150200', communityAreas: [{ id: 'portage_park', weight: 1 }] },

  // IRVING PARK (CA #16)
  { tract: '160100', communityAreas: [{ id: 'irving_park', weight: 1 }] },
  { tract: '160200', communityAreas: [{ id: 'irving_park', weight: 1 }] },

  // DUNNING (CA #17)
  { tract: '170100', communityAreas: [{ id: 'dunning', weight: 1 }] },
  { tract: '170200', communityAreas: [{ id: 'dunning', weight: 1 }] },

  // MONTCLARE (CA #18)
  { tract: '180100', communityAreas: [{ id: 'montclare', weight: 1 }] },

  // BELMONT CRAGIN (CA #19)
  { tract: '190100', communityAreas: [{ id: 'belmont_cragin', weight: 1 }] },
  { tract: '190200', communityAreas: [{ id: 'belmont_cragin', weight: 1 }] },

  // HERMOSA (CA #20)
  { tract: '200100', communityAreas: [{ id: 'hermosa', weight: 1 }] },

  // AVONDALE (CA #21)
  { tract: '210100', communityAreas: [{ id: 'avondale', weight: 1 }] },
  { tract: '210200', communityAreas: [{ id: 'avondale', weight: 1 }] },

  // LOGAN SQUARE (CA #22)
  { tract: '220100', communityAreas: [{ id: 'logan_square', weight: 1 }] },
  { tract: '220200', communityAreas: [{ id: 'logan_square', weight: 1 }] },

  // HUMBOLDT PARK (CA #23)
  { tract: '230100', communityAreas: [{ id: 'humboldt_park', weight: 1 }] },
  { tract: '230200', communityAreas: [{ id: 'humboldt_park', weight: 1 }] },
  { tract: '230300', communityAreas: [{ id: 'humboldt_park', weight: 1 }] },

  // WEST TOWN (CA #24)
  { tract: '240100', communityAreas: [{ id: 'west_town', weight: 1 }] },
  { tract: '240200', communityAreas: [{ id: 'west_town', weight: 1 }] },

  // AUSTIN (CA #25)
  { tract: '250100', communityAreas: [{ id: 'austin', weight: 1 }] },
  { tract: '250200', communityAreas: [{ id: 'austin', weight: 1 }] },
  { tract: '250300', communityAreas: [{ id: 'austin', weight: 1 }] },

  // WEST GARFIELD PARK (CA #26)
  { tract: '260100', communityAreas: [{ id: 'west_garfield_park', weight: 1 }] },
  { tract: '260200', communityAreas: [{ id: 'west_garfield_park', weight: 1 }] },

  // EAST GARFIELD PARK (CA #27)
  { tract: '270100', communityAreas: [{ id: 'east_garfield_park', weight: 1 }] },
  { tract: '270200', communityAreas: [{ id: 'east_garfield_park', weight: 1 }] },

  // NEAR WEST SIDE (CA #28)
  { tract: '280100', communityAreas: [{ id: 'near_west_side', weight: 1 }] },
  { tract: '280200', communityAreas: [{ id: 'near_west_side', weight: 1 }] },
  { tract: '280300', communityAreas: [{ id: 'near_west_side', weight: 1 }] },

  // NORTH LAWNDALE (CA #29)
  { tract: '290100', communityAreas: [{ id: 'north_lawndale', weight: 1 }] },
  { tract: '290200', communityAreas: [{ id: 'north_lawndale', weight: 1 }] },

  // SOUTH LAWNDALE (CA #30)
  { tract: '300100', communityAreas: [{ id: 'south_lawndale', weight: 1 }] },
  { tract: '300200', communityAreas: [{ id: 'south_lawndale', weight: 1 }] },

  // LOWER WEST SIDE (CA #31)
  { tract: '310100', communityAreas: [{ id: 'lower_west_side', weight: 1 }] },
  { tract: '310200', communityAreas: [{ id: 'lower_west_side', weight: 1 }] },

  // LOOP (CA #32)
  { tract: '320100', communityAreas: [{ id: 'loop', weight: 1 }] },
  { tract: '320200', communityAreas: [{ id: 'loop', weight: 1 }] },
  { tract: '320300', communityAreas: [{ id: 'loop', weight: 1 }] },

  // NEAR SOUTH SIDE (CA #33)
  { tract: '330100', communityAreas: [{ id: 'near_south_side', weight: 1 }] },
  { tract: '330200', communityAreas: [{ id: 'near_south_side', weight: 1 }] },

  // ARMOUR SQUARE (CA #34)
  { tract: '340100', communityAreas: [{ id: 'armour_square', weight: 1 }] },

  // DOUGLAS (CA #35)
  { tract: '350100', communityAreas: [{ id: 'douglas', weight: 1 }] },
  { tract: '350200', communityAreas: [{ id: 'douglas', weight: 1 }] },

  // OAKLAND (CA #36)
  { tract: '360100', communityAreas: [{ id: 'oakland', weight: 1 }] },

  // FULLER PARK (CA #37)
  { tract: '370100', communityAreas: [{ id: 'fuller_park', weight: 1 }] },

  // GRAND BOULEVARD (CA #38)
  { tract: '380100', communityAreas: [{ id: 'grand_boulevard', weight: 1 }] },
  { tract: '380200', communityAreas: [{ id: 'grand_boulevard', weight: 1 }] },

  // KENWOOD (CA #39)
  { tract: '390100', communityAreas: [{ id: 'kenwood', weight: 1 }] },

  // WASHINGTON PARK (CA #40)
  { tract: '400100', communityAreas: [{ id: 'washington_park', weight: 1 }] },
  { tract: '400200', communityAreas: [{ id: 'washington_park', weight: 1 }] },

  // HYDE PARK (CA #41)
  { tract: '410100', communityAreas: [{ id: 'hyde_park', weight: 1 }] },
  { tract: '410200', communityAreas: [{ id: 'hyde_park', weight: 1 }] },

  // WOODLAWN (CA #42)
  { tract: '420100', communityAreas: [{ id: 'woodlawn', weight: 1 }] },
  { tract: '420200', communityAreas: [{ id: 'woodlawn', weight: 1 }] },

  // SOUTH SHORE (CA #43)
  { tract: '430100', communityAreas: [{ id: 'south_shore', weight: 1 }] },
  { tract: '430200', communityAreas: [{ id: 'south_shore', weight: 1 }] },

  // CHATHAM (CA #44)
  { tract: '440100', communityAreas: [{ id: 'chatham', weight: 1 }] },
  { tract: '440200', communityAreas: [{ id: 'chatham', weight: 1 }] },

  // AVALON PARK (CA #45)
  { tract: '450100', communityAreas: [{ id: 'avalon_park', weight: 1 }] },

  // SOUTH CHICAGO (CA #46)
  { tract: '460100', communityAreas: [{ id: 'south_chicago', weight: 1 }] },
  { tract: '460200', communityAreas: [{ id: 'south_chicago', weight: 1 }] },

  // BURNSIDE (CA #47)
  { tract: '470100', communityAreas: [{ id: 'burnside', weight: 1 }] },

  // CALUMET HEIGHTS (CA #48)
  { tract: '480100', communityAreas: [{ id: 'calumet_heights', weight: 1 }] },

  // ROSELAND (CA #49)
  { tract: '490100', communityAreas: [{ id: 'roseland', weight: 1 }] },
  { tract: '490200', communityAreas: [{ id: 'roseland', weight: 1 }] },

  // PULLMAN (CA #50)
  { tract: '500100', communityAreas: [{ id: 'pullman', weight: 1 }] },

  // SOUTH DEERING (CA #51)
  { tract: '510100', communityAreas: [{ id: 'south_deering', weight: 1 }] },

  // EAST SIDE (CA #52)
  { tract: '520100', communityAreas: [{ id: 'east_side', weight: 1 }] },

  // WEST PULLMAN (CA #53)
  { tract: '530100', communityAreas: [{ id: 'west_pullman', weight: 1 }] },
  { tract: '530200', communityAreas: [{ id: 'west_pullman', weight: 1 }] },

  // RIVERDALE (CA #54)
  { tract: '540100', communityAreas: [{ id: 'riverdale', weight: 1 }] },

  // HEGEWISCH (CA #55)
  { tract: '550100', communityAreas: [{ id: 'hegewisch', weight: 1 }] },

  // GARFIELD RIDGE (CA #56)
  { tract: '560100', communityAreas: [{ id: 'garfield_ridge', weight: 1 }] },
  { tract: '560200', communityAreas: [{ id: 'garfield_ridge', weight: 1 }] },

  // ARCHER HEIGHTS (CA #57)
  { tract: '570100', communityAreas: [{ id: 'archer_heights', weight: 1 }] },

  // BRIGHTON PARK (CA #58)
  { tract: '580100', communityAreas: [{ id: 'brighton_park', weight: 1 }] },
  { tract: '580200', communityAreas: [{ id: 'brighton_park', weight: 1 }] },

  // MCKINLEY PARK (CA #59)
  { tract: '590100', communityAreas: [{ id: 'mckinley_park', weight: 1 }] },

  // BRIDGEPORT (CA #60)
  { tract: '600100', communityAreas: [{ id: 'bridgeport', weight: 1 }] },
  { tract: '600200', communityAreas: [{ id: 'bridgeport', weight: 1 }] },

  // NEW CITY (CA #61)
  { tract: '610100', communityAreas: [{ id: 'new_city', weight: 1 }] },
  { tract: '610200', communityAreas: [{ id: 'new_city', weight: 1 }] },

  // WEST ELSDON (CA #62)
  { tract: '620100', communityAreas: [{ id: 'west_elsdon', weight: 1 }] },

  // GAGE PARK (CA #63)
  { tract: '630100', communityAreas: [{ id: 'gage_park', weight: 1 }] },

  // CLEARING (CA #64)
  { tract: '640100', communityAreas: [{ id: 'clearing', weight: 1 }] },

  // WEST LAWN (CA #65)
  { tract: '650100', communityAreas: [{ id: 'west_lawn', weight: 1 }] },

  // CHICAGO LAWN (CA #66)
  { tract: '660100', communityAreas: [{ id: 'chicago_lawn', weight: 1 }] },
  { tract: '660200', communityAreas: [{ id: 'chicago_lawn', weight: 1 }] },

  // WEST ENGLEWOOD (CA #67)
  { tract: '670100', communityAreas: [{ id: 'west_englewood', weight: 1 }] },
  { tract: '670200', communityAreas: [{ id: 'west_englewood', weight: 1 }] },

  // ENGLEWOOD (CA #68)
  { tract: '680100', communityAreas: [{ id: 'englewood', weight: 1 }] },
  { tract: '680200', communityAreas: [{ id: 'englewood', weight: 1 }] },

  // GREATER GRAND CROSSING (CA #69)
  { tract: '690100', communityAreas: [{ id: 'greater_grand_crossing', weight: 1 }] },
  { tract: '690200', communityAreas: [{ id: 'greater_grand_crossing', weight: 1 }] },

  // ASHBURN (CA #70)
  { tract: '700100', communityAreas: [{ id: 'ashburn', weight: 1 }] },
  { tract: '700200', communityAreas: [{ id: 'ashburn', weight: 1 }] },

  // AUBURN GRESHAM (CA #71)
  { tract: '710100', communityAreas: [{ id: 'auburn_gresham', weight: 1 }] },
  { tract: '710200', communityAreas: [{ id: 'auburn_gresham', weight: 1 }] },

  // BEVERLY (CA #72)
  { tract: '720100', communityAreas: [{ id: 'beverly', weight: 1 }] },

  // WASHINGTON HEIGHTS (CA #73)
  { tract: '730100', communityAreas: [{ id: 'washington_heights', weight: 1 }] },

  // MOUNT GREENWOOD (CA #74)
  { tract: '740100', communityAreas: [{ id: 'mount_greenwood', weight: 1 }] },

  // MORGAN PARK (CA #75)
  { tract: '750100', communityAreas: [{ id: 'morgan_park', weight: 1 }] },

  // O'HARE (CA #76)
  { tract: '760100', communityAreas: [{ id: 'ohare', weight: 1 }] },

  // EDGEWATER (CA #77)
  { tract: '770100', communityAreas: [{ id: 'edgewater', weight: 1 }] },
  { tract: '770200', communityAreas: [{ id: 'edgewater', weight: 1 }] },
];

/**
 * Get community areas for a specific census tract
 */
export function getCommunityAreasForTract(tract: string): { id: string; weight: number }[] {
  const mapping = CHICAGO_TRACT_TO_COMMUNITY_AREA.find(m => m.tract === tract);
  return mapping?.communityAreas ?? [];
}

/**
 * Get all census tracts for a community area
 */
export function getTractsForCommunityArea(communityAreaId: string): { tract: string; weight: number }[] {
  const result: { tract: string; weight: number }[] = [];
  for (const mapping of CHICAGO_TRACT_TO_COMMUNITY_AREA) {
    for (const ca of mapping.communityAreas) {
      if (ca.id === communityAreaId) {
        result.push({ tract: mapping.tract, weight: ca.weight });
      }
    }
  }
  return result;
}

// Phase 2 stubs for collar counties
export const COLLAR_COUNTY_FIPS: Record<string, string> = {
  dupage: '17043',
  kane: '17089',
  lake: '17097',
  mchenry: '17111',
  will: '17197',
};

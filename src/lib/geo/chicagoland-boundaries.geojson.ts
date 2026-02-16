/**
 * Chicagoland GeoJSON Boundaries
 *
 * Simplified polygon boundaries for 77 Chicago community areas and 6 surrounding counties.
 * Community area polygons are approximated from center coordinates with ~0.01-0.02 degree offsets.
 *
 * Source: City of Chicago Data Portal community area boundaries (simplified)
 * https://data.cityofchicago.org/Facilities-Geographical-Boundaries/Boundaries-Community-Areas-current-/cauq-8yn6
 */

export interface ChicagolandFeature {
  type: 'Feature';
  properties: {
    id: string;
    name: string;
    type: 'community_area' | 'county';
    county: string;
    communityAreaNumber?: number;
    side?: string;
    ward?: number;
  };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export interface ChicagolandFeatureCollection {
  type: 'FeatureCollection';
  features: ChicagolandFeature[];
}

/**
 * Get Chicagoland GeoJSON with simplified polygon boundaries
 */
export function getChicagolandGeoJSON(): ChicagolandFeatureCollection {
  return CHICAGOLAND_GEOJSON;
}

// Helper to build an irregular polygon from center with directional offsets
function irregularPoly(
  lng: number,
  lat: number,
  offsets: [number, number][],
): number[][] {
  const coords = offsets.map(([dLng, dLat]) => [lng + dLng, lat + dLat]);
  coords.push(coords[0]);
  return coords;
}

function area(
  id: string,
  name: string,
  communityAreaNumber: number,
  side: string,
  ward: number,
  coordinates: number[][],
): ChicagolandFeature {
  return {
    type: 'Feature',
    properties: { id, name, type: 'community_area', county: 'cook', communityAreaNumber, side, ward },
    geometry: { type: 'Polygon', coordinates: [coordinates] },
  };
}

function county(
  id: string,
  name: string,
  coordinates: number[][],
): ChicagolandFeature {
  return {
    type: 'Feature',
    properties: { id, name, type: 'county', county: id },
    geometry: { type: 'Polygon', coordinates: [coordinates] },
  };
}

const CHICAGOLAND_GEOJSON: ChicagolandFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    // ─────────────────────────────────────────────────
    // FAR NORTH SIDE
    // ─────────────────────────────────────────────────
    area('rogers_park', 'Rogers Park', 1, 'far_north', 49,
      irregularPoly(-87.6685, 42.0087, [
        [-0.012, -0.010], [0.008, -0.010], [0.012, -0.005],
        [0.012, 0.008], [-0.005, 0.010], [-0.012, 0.006],
      ]),
    ),
    area('west_ridge', 'West Ridge', 2, 'far_north', 50,
      irregularPoly(-87.6908, 41.9981, [
        [-0.015, -0.010], [0.010, -0.012], [0.015, 0.000],
        [0.012, 0.012], [-0.008, 0.012], [-0.015, 0.005],
      ]),
    ),
    area('uptown', 'Uptown', 3, 'far_north', 46,
      irregularPoly(-87.6534, 41.9664, [
        [-0.012, -0.010], [0.010, -0.010], [0.012, -0.003],
        [0.010, 0.010], [-0.005, 0.012], [-0.012, 0.005],
      ]),
    ),
    area('lincoln_square', 'Lincoln Square', 4, 'far_north', 47,
      irregularPoly(-87.6889, 41.9692, [
        [-0.012, -0.010], [0.012, -0.010], [0.014, 0.003],
        [0.010, 0.010], [-0.006, 0.012], [-0.014, 0.004],
      ]),
    ),
    area('forest_glen', 'Forest Glen', 12, 'far_north', 45,
      irregularPoly(-87.7464, 41.9821, [
        [-0.015, -0.010], [0.012, -0.012], [0.015, 0.002],
        [0.010, 0.012], [-0.008, 0.010], [-0.015, 0.003],
      ]),
    ),
    area('north_park', 'North Park', 13, 'far_north', 40,
      irregularPoly(-87.7226, 41.9815, [
        [-0.012, -0.010], [0.010, -0.010], [0.014, 0.000],
        [0.010, 0.010], [-0.006, 0.012], [-0.012, 0.004],
      ]),
    ),
    area('albany_park', 'Albany Park', 14, 'far_north', 33,
      irregularPoly(-87.7232, 41.9681, [
        [-0.014, -0.010], [0.010, -0.010], [0.014, 0.002],
        [0.010, 0.010], [-0.008, 0.012], [-0.014, 0.004],
      ]),
    ),
    area('edgewater', 'Edgewater', 77, 'far_north', 48,
      irregularPoly(-87.6599, 41.9838, [
        [-0.010, -0.008], [0.010, -0.008], [0.012, 0.002],
        [0.010, 0.008], [-0.005, 0.010], [-0.010, 0.004],
      ]),
    ),

    // ─────────────────────────────────────────────────
    // NORTH SIDE
    // ─────────────────────────────────────────────────
    area('north_center', 'North Center', 5, 'north', 47,
      irregularPoly(-87.6786, 41.9543, [
        [-0.010, -0.008], [0.010, -0.010], [0.012, 0.003],
        [0.008, 0.010], [-0.006, 0.010], [-0.012, 0.002],
      ]),
    ),
    area('lake_view', 'Lake View', 6, 'north', 44,
      irregularPoly(-87.6535, 41.9434, [
        [-0.014, -0.012], [0.012, -0.012], [0.014, 0.004],
        [0.010, 0.014], [-0.008, 0.014], [-0.014, 0.005],
      ]),
    ),
    area('lincoln_park', 'Lincoln Park', 7, 'north', 43,
      irregularPoly(-87.6513, 41.9214, [
        [-0.016, -0.014], [0.012, -0.014], [0.016, 0.000],
        [0.014, 0.016], [-0.008, 0.016], [-0.016, 0.006],
      ]),
    ),

    // ─────────────────────────────────────────────────
    // NORTHWEST SIDE
    // ─────────────────────────────────────────────────
    area('edison_park', 'Edison Park', 9, 'northwest', 41,
      irregularPoly(-87.8113, 42.0045, [
        [-0.010, -0.008], [0.008, -0.008], [0.010, 0.002],
        [0.008, 0.008], [-0.004, 0.008], [-0.010, 0.003],
      ]),
    ),
    area('norwood_park', 'Norwood Park', 10, 'northwest', 41,
      irregularPoly(-87.8064, 41.9861, [
        [-0.016, -0.012], [0.012, -0.012], [0.016, 0.002],
        [0.012, 0.012], [-0.008, 0.014], [-0.016, 0.005],
      ]),
    ),
    area('jefferson_park', 'Jefferson Park', 11, 'northwest', 45,
      irregularPoly(-87.7638, 41.9703, [
        [-0.014, -0.010], [0.010, -0.010], [0.014, 0.002],
        [0.010, 0.010], [-0.006, 0.012], [-0.014, 0.004],
      ]),
    ),
    area('portage_park', 'Portage Park', 15, 'northwest', 38,
      irregularPoly(-87.7654, 41.9579, [
        [-0.016, -0.012], [0.012, -0.012], [0.016, 0.002],
        [0.012, 0.012], [-0.008, 0.014], [-0.016, 0.005],
      ]),
    ),
    area('irving_park', 'Irving Park', 16, 'northwest', 33,
      irregularPoly(-87.7306, 41.9539, [
        [-0.016, -0.010], [0.014, -0.010], [0.016, 0.004],
        [0.012, 0.012], [-0.008, 0.012], [-0.016, 0.004],
      ]),
    ),
    area('dunning', 'Dunning', 17, 'northwest', 36,
      irregularPoly(-87.8048, 41.9467, [
        [-0.016, -0.012], [0.012, -0.012], [0.016, 0.002],
        [0.012, 0.012], [-0.008, 0.014], [-0.016, 0.004],
      ]),
    ),
    area('montclare', 'Montclare', 18, 'northwest', 36,
      irregularPoly(-87.8123, 41.9289, [
        [-0.010, -0.008], [0.008, -0.008], [0.010, 0.002],
        [0.008, 0.008], [-0.004, 0.008], [-0.010, 0.003],
      ]),
    ),
    area('belmont_cragin', 'Belmont Cragin', 19, 'northwest', 31,
      irregularPoly(-87.7694, 41.9309, [
        [-0.018, -0.012], [0.014, -0.012], [0.018, 0.002],
        [0.014, 0.012], [-0.010, 0.014], [-0.018, 0.005],
      ]),
    ),
    area('hermosa', 'Hermosa', 20, 'northwest', 31,
      irregularPoly(-87.7323, 41.9178, [
        [-0.010, -0.008], [0.008, -0.008], [0.010, 0.002],
        [0.008, 0.008], [-0.004, 0.008], [-0.010, 0.003],
      ]),
    ),
    area('avondale', 'Avondale', 21, 'northwest', 35,
      irregularPoly(-87.7110, 41.9389, [
        [-0.012, -0.010], [0.010, -0.010], [0.012, 0.003],
        [0.008, 0.010], [-0.006, 0.010], [-0.012, 0.003],
      ]),
    ),
    area('logan_square', 'Logan Square', 22, 'northwest', 35,
      irregularPoly(-87.7084, 41.9233, [
        [-0.014, -0.012], [0.012, -0.012], [0.014, 0.004],
        [0.010, 0.012], [-0.008, 0.014], [-0.014, 0.005],
      ]),
    ),
    area('ohare', "O'Hare", 76, 'northwest', 41,
      irregularPoly(-87.8556, 41.9794, [
        [-0.022, -0.016], [0.018, -0.016], [0.022, 0.004],
        [0.016, 0.018], [-0.012, 0.018], [-0.022, 0.006],
      ]),
    ),

    // ─────────────────────────────────────────────────
    // WEST SIDE
    // ─────────────────────────────────────────────────
    area('humboldt_park', 'Humboldt Park', 23, 'west', 26,
      irregularPoly(-87.7212, 41.9023, [
        [-0.016, -0.012], [0.014, -0.012], [0.016, 0.004],
        [0.012, 0.012], [-0.008, 0.014], [-0.016, 0.005],
      ]),
    ),
    area('west_town', 'West Town', 24, 'west', 1,
      irregularPoly(-87.6831, 41.8970, [
        [-0.018, -0.012], [0.014, -0.012], [0.018, 0.004],
        [0.014, 0.014], [-0.010, 0.014], [-0.018, 0.005],
      ]),
    ),
    area('austin', 'Austin', 25, 'west', 29,
      irregularPoly(-87.7616, 41.8939, [
        [-0.018, -0.016], [0.014, -0.016], [0.018, 0.004],
        [0.014, 0.016], [-0.010, 0.018], [-0.018, 0.006],
      ]),
    ),
    area('west_garfield_park', 'West Garfield Park', 26, 'west', 28,
      irregularPoly(-87.7276, 41.8808, [
        [-0.010, -0.008], [0.008, -0.008], [0.010, 0.002],
        [0.008, 0.008], [-0.004, 0.008], [-0.010, 0.003],
      ]),
    ),
    area('east_garfield_park', 'East Garfield Park', 27, 'west', 28,
      irregularPoly(-87.7039, 41.8810, [
        [-0.010, -0.008], [0.008, -0.008], [0.010, 0.002],
        [0.008, 0.008], [-0.004, 0.008], [-0.010, 0.003],
      ]),
    ),
    area('north_lawndale', 'North Lawndale', 29, 'west', 24,
      irregularPoly(-87.7175, 41.8603, [
        [-0.016, -0.012], [0.012, -0.012], [0.016, 0.002],
        [0.012, 0.012], [-0.008, 0.014], [-0.016, 0.005],
      ]),
    ),

    // ─────────────────────────────────────────────────
    // CENTRAL
    // ─────────────────────────────────────────────────
    area('near_north_side', 'Near North Side', 8, 'central', 42,
      irregularPoly(-87.6345, 41.9001, [
        [-0.014, -0.010], [0.012, -0.010], [0.014, 0.004],
        [0.010, 0.012], [-0.008, 0.012], [-0.014, 0.004],
      ]),
    ),
    area('near_west_side', 'Near West Side', 28, 'central', 25,
      irregularPoly(-87.6669, 41.8812, [
        [-0.018, -0.012], [0.016, -0.012], [0.018, 0.004],
        [0.014, 0.012], [-0.010, 0.014], [-0.018, 0.005],
      ]),
    ),
    area('loop', 'Loop', 32, 'central', 42,
      irregularPoly(-87.6298, 41.8820, [
        [-0.010, -0.008], [0.008, -0.008], [0.010, 0.002],
        [0.008, 0.008], [-0.004, 0.010], [-0.010, 0.004],
      ]),
    ),
    area('near_south_side', 'Near South Side', 33, 'central', 3,
      irregularPoly(-87.6271, 41.8555, [
        [-0.010, -0.010], [0.010, -0.010], [0.012, 0.004],
        [0.008, 0.010], [-0.006, 0.012], [-0.012, 0.004],
      ]),
    ),

    // ─────────────────────────────────────────────────
    // SOUTH SIDE
    // ─────────────────────────────────────────────────
    area('armour_square', 'Armour Square', 34, 'south', 11,
      irregularPoly(-87.6354, 41.8418, [
        [-0.008, -0.006], [0.006, -0.006], [0.008, 0.002],
        [0.006, 0.006], [-0.004, 0.006], [-0.008, 0.002],
      ]),
    ),
    area('douglas', 'Douglas', 35, 'south', 3,
      irregularPoly(-87.6179, 41.8352, [
        [-0.010, -0.008], [0.010, -0.008], [0.012, 0.003],
        [0.008, 0.008], [-0.006, 0.010], [-0.010, 0.004],
      ]),
    ),
    area('oakland', 'Oakland', 36, 'south', 4,
      irregularPoly(-87.6051, 41.8231, [
        [-0.006, -0.006], [0.006, -0.006], [0.008, 0.002],
        [0.006, 0.006], [-0.004, 0.006], [-0.006, 0.002],
      ]),
    ),
    area('fuller_park', 'Fuller Park', 37, 'south', 3,
      irregularPoly(-87.6516, 41.8318, [
        [-0.008, -0.006], [0.006, -0.006], [0.008, 0.002],
        [0.006, 0.006], [-0.004, 0.006], [-0.008, 0.002],
      ]),
    ),
    area('grand_boulevard', 'Grand Boulevard', 38, 'south', 3,
      irregularPoly(-87.6172, 41.8130, [
        [-0.010, -0.010], [0.010, -0.010], [0.012, 0.004],
        [0.008, 0.010], [-0.006, 0.012], [-0.010, 0.004],
      ]),
    ),
    area('kenwood', 'Kenwood', 39, 'south', 4,
      irregularPoly(-87.5935, 41.8095, [
        [-0.008, -0.008], [0.008, -0.008], [0.010, 0.002],
        [0.008, 0.008], [-0.004, 0.008], [-0.008, 0.003],
      ]),
    ),
    area('washington_park', 'Washington Park', 40, 'south', 6,
      irregularPoly(-87.6161, 41.7934, [
        [-0.012, -0.010], [0.010, -0.010], [0.012, 0.004],
        [0.008, 0.010], [-0.006, 0.012], [-0.012, 0.004],
      ]),
    ),
    area('hyde_park', 'Hyde Park', 41, 'south', 5,
      irregularPoly(-87.5914, 41.7943, [
        [-0.012, -0.010], [0.010, -0.010], [0.014, 0.002],
        [0.010, 0.010], [-0.006, 0.012], [-0.012, 0.004],
      ]),
    ),
    area('woodlawn', 'Woodlawn', 42, 'south', 5,
      irregularPoly(-87.5977, 41.7784, [
        [-0.012, -0.010], [0.010, -0.010], [0.014, 0.002],
        [0.010, 0.010], [-0.006, 0.012], [-0.012, 0.004],
      ]),
    ),
    area('south_shore', 'South Shore', 43, 'south', 7,
      irregularPoly(-87.5764, 41.7612, [
        [-0.014, -0.012], [0.012, -0.012], [0.016, 0.002],
        [0.012, 0.012], [-0.008, 0.014], [-0.014, 0.005],
      ]),
    ),
    area('chatham', 'Chatham', 44, 'south', 6,
      irregularPoly(-87.6127, 41.7403, [
        [-0.014, -0.012], [0.012, -0.012], [0.014, 0.004],
        [0.010, 0.012], [-0.008, 0.014], [-0.014, 0.005],
      ]),
    ),
    area('avalon_park', 'Avalon Park', 45, 'south', 8,
      irregularPoly(-87.5887, 41.7454, [
        [-0.010, -0.008], [0.008, -0.008], [0.010, 0.002],
        [0.008, 0.008], [-0.004, 0.008], [-0.010, 0.003],
      ]),
    ),
    area('burnside', 'Burnside', 47, 'south', 9,
      irregularPoly(-87.5994, 41.7292, [
        [-0.006, -0.006], [0.006, -0.006], [0.008, 0.002],
        [0.006, 0.006], [-0.004, 0.006], [-0.006, 0.002],
      ]),
    ),
    area('bridgeport', 'Bridgeport', 60, 'south', 11,
      irregularPoly(-87.6518, 41.8378, [
        [-0.012, -0.010], [0.010, -0.010], [0.012, 0.004],
        [0.008, 0.010], [-0.006, 0.010], [-0.012, 0.003],
      ]),
    ),
    area('englewood', 'Englewood', 68, 'south', 16,
      irregularPoly(-87.6441, 41.7798, [
        [-0.012, -0.010], [0.010, -0.010], [0.012, 0.004],
        [0.008, 0.010], [-0.006, 0.012], [-0.012, 0.004],
      ]),
    ),
    area('greater_grand_crossing', 'Greater Grand Crossing', 69, 'south', 6,
      irregularPoly(-87.6148, 41.7622, [
        [-0.014, -0.012], [0.012, -0.012], [0.014, 0.004],
        [0.010, 0.012], [-0.008, 0.014], [-0.014, 0.005],
      ]),
    ),

    // ─────────────────────────────────────────────────
    // SOUTHWEST SIDE
    // ─────────────────────────────────────────────────
    area('south_lawndale', 'South Lawndale', 30, 'southwest', 22,
      irregularPoly(-87.7135, 41.8437, [
        [-0.014, -0.010], [0.012, -0.010], [0.014, 0.004],
        [0.010, 0.010], [-0.008, 0.012], [-0.014, 0.004],
      ]),
    ),
    area('lower_west_side', 'Lower West Side', 31, 'southwest', 25,
      irregularPoly(-87.6660, 41.8529, [
        [-0.010, -0.010], [0.010, -0.010], [0.012, 0.004],
        [0.008, 0.010], [-0.006, 0.010], [-0.010, 0.003],
      ]),
    ),
    area('garfield_ridge', 'Garfield Ridge', 56, 'southwest', 23,
      irregularPoly(-87.7663, 41.7944, [
        [-0.018, -0.014], [0.014, -0.014], [0.018, 0.004],
        [0.014, 0.014], [-0.010, 0.016], [-0.018, 0.006],
      ]),
    ),
    area('archer_heights', 'Archer Heights', 57, 'southwest', 23,
      irregularPoly(-87.7237, 41.8102, [
        [-0.010, -0.008], [0.008, -0.008], [0.010, 0.002],
        [0.008, 0.008], [-0.004, 0.008], [-0.010, 0.003],
      ]),
    ),
    area('brighton_park', 'Brighton Park', 58, 'southwest', 14,
      irregularPoly(-87.6968, 41.8194, [
        [-0.012, -0.010], [0.010, -0.010], [0.012, 0.004],
        [0.008, 0.010], [-0.006, 0.012], [-0.012, 0.004],
      ]),
    ),
    area('mckinley_park', 'McKinley Park', 59, 'southwest', 12,
      irregularPoly(-87.6794, 41.8313, [
        [-0.010, -0.008], [0.008, -0.008], [0.010, 0.002],
        [0.008, 0.008], [-0.004, 0.008], [-0.010, 0.003],
      ]),
    ),
    area('new_city', 'New City', 61, 'southwest', 15,
      irregularPoly(-87.6584, 41.8093, [
        [-0.014, -0.012], [0.012, -0.012], [0.014, 0.004],
        [0.010, 0.012], [-0.008, 0.014], [-0.014, 0.005],
      ]),
    ),
    area('west_elsdon', 'West Elsdon', 62, 'southwest', 23,
      irregularPoly(-87.7248, 41.7929, [
        [-0.010, -0.008], [0.008, -0.008], [0.010, 0.002],
        [0.008, 0.008], [-0.004, 0.008], [-0.010, 0.003],
      ]),
    ),
    area('gage_park', 'Gage Park', 63, 'southwest', 15,
      irregularPoly(-87.6957, 41.7946, [
        [-0.012, -0.010], [0.010, -0.010], [0.012, 0.004],
        [0.008, 0.010], [-0.006, 0.010], [-0.012, 0.003],
      ]),
    ),
    area('clearing', 'Clearing', 64, 'southwest', 23,
      irregularPoly(-87.7610, 41.7804, [
        [-0.012, -0.010], [0.010, -0.010], [0.012, 0.004],
        [0.008, 0.010], [-0.006, 0.012], [-0.012, 0.004],
      ]),
    ),
    area('west_lawn', 'West Lawn', 65, 'southwest', 23,
      irregularPoly(-87.7229, 41.7738, [
        [-0.012, -0.010], [0.010, -0.010], [0.012, 0.004],
        [0.008, 0.010], [-0.006, 0.010], [-0.012, 0.003],
      ]),
    ),
    area('chicago_lawn', 'Chicago Lawn', 66, 'southwest', 18,
      irregularPoly(-87.6957, 41.7719, [
        [-0.012, -0.010], [0.010, -0.010], [0.012, 0.004],
        [0.008, 0.010], [-0.006, 0.012], [-0.012, 0.004],
      ]),
    ),
    area('west_englewood', 'West Englewood', 67, 'southwest', 16,
      irregularPoly(-87.6614, 41.7752, [
        [-0.014, -0.012], [0.012, -0.012], [0.014, 0.004],
        [0.010, 0.012], [-0.008, 0.014], [-0.014, 0.005],
      ]),
    ),

    // ─────────────────────────────────────────────────
    // FAR SOUTHWEST SIDE
    // ─────────────────────────────────────────────────
    area('ashburn', 'Ashburn', 70, 'far_southwest', 19,
      irregularPoly(-87.7114, 41.7474, [
        [-0.018, -0.014], [0.014, -0.014], [0.018, 0.004],
        [0.014, 0.014], [-0.010, 0.016], [-0.018, 0.006],
      ]),
    ),
    area('auburn_gresham', 'Auburn Gresham', 71, 'far_southwest', 17,
      irregularPoly(-87.6533, 41.7439, [
        [-0.014, -0.012], [0.012, -0.012], [0.014, 0.004],
        [0.010, 0.012], [-0.008, 0.014], [-0.014, 0.005],
      ]),
    ),
    area('beverly', 'Beverly', 72, 'far_southwest', 19,
      irregularPoly(-87.6683, 41.7145, [
        [-0.012, -0.012], [0.010, -0.012], [0.012, 0.004],
        [0.008, 0.012], [-0.006, 0.014], [-0.012, 0.005],
      ]),
    ),
    area('washington_heights', 'Washington Heights', 73, 'far_southwest', 21,
      irregularPoly(-87.6510, 41.7225, [
        [-0.012, -0.010], [0.010, -0.010], [0.012, 0.004],
        [0.008, 0.010], [-0.006, 0.012], [-0.012, 0.004],
      ]),
    ),
    area('mount_greenwood', 'Mount Greenwood', 74, 'far_southwest', 19,
      irregularPoly(-87.7066, 41.6949, [
        [-0.012, -0.010], [0.010, -0.010], [0.012, 0.004],
        [0.008, 0.010], [-0.006, 0.012], [-0.012, 0.004],
      ]),
    ),
    area('morgan_park', 'Morgan Park', 75, 'far_southwest', 21,
      irregularPoly(-87.6685, 41.6909, [
        [-0.014, -0.012], [0.012, -0.012], [0.014, 0.004],
        [0.010, 0.012], [-0.008, 0.014], [-0.014, 0.005],
      ]),
    ),

    // ─────────────────────────────────────────────────
    // FAR SOUTHEAST SIDE
    // ─────────────────────────────────────────────────
    area('south_chicago', 'South Chicago', 46, 'far_southeast', 10,
      irregularPoly(-87.5549, 41.7399, [
        [-0.014, -0.012], [0.012, -0.012], [0.016, 0.002],
        [0.012, 0.012], [-0.008, 0.014], [-0.014, 0.005],
      ]),
    ),
    area('calumet_heights', 'Calumet Heights', 48, 'far_southeast', 10,
      irregularPoly(-87.5789, 41.7282, [
        [-0.012, -0.010], [0.010, -0.010], [0.012, 0.004],
        [0.008, 0.010], [-0.006, 0.012], [-0.012, 0.004],
      ]),
    ),
    area('roseland', 'Roseland', 49, 'far_southeast', 9,
      irregularPoly(-87.6244, 41.7103, [
        [-0.016, -0.014], [0.014, -0.014], [0.016, 0.004],
        [0.012, 0.014], [-0.008, 0.016], [-0.016, 0.006],
      ]),
    ),
    area('pullman', 'Pullman', 50, 'far_southeast', 9,
      irregularPoly(-87.6086, 41.7082, [
        [-0.010, -0.008], [0.008, -0.008], [0.010, 0.002],
        [0.008, 0.008], [-0.004, 0.008], [-0.010, 0.003],
      ]),
    ),
    area('south_deering', 'South Deering', 51, 'far_southeast', 10,
      irregularPoly(-87.5620, 41.7103, [
        [-0.016, -0.014], [0.014, -0.014], [0.018, 0.002],
        [0.014, 0.014], [-0.010, 0.016], [-0.016, 0.006],
      ]),
    ),
    area('east_side', 'East Side', 52, 'far_southeast', 10,
      irregularPoly(-87.5344, 41.7136, [
        [-0.012, -0.010], [0.010, -0.010], [0.014, 0.002],
        [0.010, 0.010], [-0.006, 0.012], [-0.012, 0.004],
      ]),
    ),
    area('west_pullman', 'West Pullman', 53, 'far_southeast', 9,
      irregularPoly(-87.6335, 41.6895, [
        [-0.016, -0.012], [0.012, -0.012], [0.016, 0.002],
        [0.012, 0.012], [-0.008, 0.014], [-0.016, 0.005],
      ]),
    ),
    area('riverdale', 'Riverdale', 54, 'far_southeast', 9,
      irregularPoly(-87.6326, 41.6494, [
        [-0.014, -0.012], [0.012, -0.012], [0.016, 0.002],
        [0.012, 0.012], [-0.008, 0.014], [-0.014, 0.005],
      ]),
    ),
    area('hegewisch', 'Hegewisch', 55, 'far_southeast', 10,
      irregularPoly(-87.5510, 41.6546, [
        [-0.016, -0.014], [0.014, -0.014], [0.018, 0.002],
        [0.014, 0.014], [-0.010, 0.016], [-0.016, 0.006],
      ]),
    ),

    // ─────────────────────────────────────────────────
    // COUNTY OUTLINES
    // ─────────────────────────────────────────────────
    county('cook', 'Cook County', [
      [-88.26, 41.47], [-87.52, 41.47], [-87.52, 42.16],
      [-88.26, 42.16], [-88.26, 41.47],
    ]),
    county('dupage', 'DuPage County', [
      [-88.26, 41.65], [-87.93, 41.65], [-87.93, 41.97],
      [-88.26, 41.97], [-88.26, 41.65],
    ]),
    county('kane', 'Kane County', [
      [-88.60, 41.63], [-88.26, 41.63], [-88.26, 42.15],
      [-88.60, 42.15], [-88.60, 41.63],
    ]),
    county('lake', 'Lake County', [
      [-88.20, 42.15], [-87.52, 42.15], [-87.52, 42.50],
      [-88.20, 42.50], [-88.20, 42.15],
    ]),
    county('mchenry', 'McHenry County', [
      [-88.70, 42.15], [-88.20, 42.15], [-88.20, 42.50],
      [-88.70, 42.50], [-88.70, 42.15],
    ]),
    county('will', 'Will County', [
      [-88.26, 41.19], [-87.52, 41.19], [-87.52, 41.65],
      [-88.26, 41.65], [-88.26, 41.19],
    ]),
  ],
};

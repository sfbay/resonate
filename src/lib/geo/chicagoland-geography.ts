/**
 * Chicagoland Geography Data
 *
 * Phase 1: 77 Chicago community areas with names, county, wards, zip codes, centers.
 * Phase 2-ready: Stubs for key suburban municipalities.
 *
 * Source: City of Chicago Data Portal community area boundaries
 */

import type {
  ChicagoCommunityArea,
  ChicagolandRegion,
  ChicagoSide,
} from '@/types/chicagoland';

// ─────────────────────────────────────────────────
// COMMUNITY AREA DATA (77 areas)
// ─────────────────────────────────────────────────

interface CommunityAreaInfo {
  number: number;
  name: string;
  side: ChicagoSide;
  ward: number;       // Primary ward
  zipCodes: string[];
  center: { lat: number; lng: number };
}

export const CHICAGO_COMMUNITY_AREAS: Record<ChicagoCommunityArea, CommunityAreaInfo> = {
  rogers_park:           { number: 1,  name: 'Rogers Park',          side: 'far_north',    ward: 49, zipCodes: ['60626', '60645'], center: { lat: 42.0087, lng: -87.6685 } },
  west_ridge:            { number: 2,  name: 'West Ridge',           side: 'far_north',    ward: 50, zipCodes: ['60645', '60659'], center: { lat: 41.9981, lng: -87.6908 } },
  uptown:                { number: 3,  name: 'Uptown',               side: 'far_north',    ward: 46, zipCodes: ['60640'],          center: { lat: 41.9664, lng: -87.6534 } },
  lincoln_square:        { number: 4,  name: 'Lincoln Square',       side: 'far_north',    ward: 47, zipCodes: ['60625'],          center: { lat: 41.9692, lng: -87.6889 } },
  north_center:          { number: 5,  name: 'North Center',         side: 'north',        ward: 47, zipCodes: ['60613', '60618'], center: { lat: 41.9543, lng: -87.6786 } },
  lake_view:             { number: 6,  name: 'Lake View',            side: 'north',        ward: 44, zipCodes: ['60613', '60657'], center: { lat: 41.9434, lng: -87.6535 } },
  lincoln_park:          { number: 7,  name: 'Lincoln Park',         side: 'north',        ward: 43, zipCodes: ['60614'],          center: { lat: 41.9214, lng: -87.6513 } },
  near_north_side:       { number: 8,  name: 'Near North Side',      side: 'central',      ward: 42, zipCodes: ['60610', '60611', '60654'], center: { lat: 41.9001, lng: -87.6345 } },
  edison_park:           { number: 9,  name: 'Edison Park',          side: 'northwest',    ward: 41, zipCodes: ['60631'],          center: { lat: 42.0045, lng: -87.8113 } },
  norwood_park:          { number: 10, name: 'Norwood Park',         side: 'northwest',    ward: 41, zipCodes: ['60631', '60656'], center: { lat: 41.9861, lng: -87.8064 } },
  jefferson_park:        { number: 11, name: 'Jefferson Park',       side: 'northwest',    ward: 45, zipCodes: ['60630', '60646'], center: { lat: 41.9703, lng: -87.7638 } },
  forest_glen:           { number: 12, name: 'Forest Glen',          side: 'far_north',    ward: 45, zipCodes: ['60630', '60646'], center: { lat: 41.9821, lng: -87.7464 } },
  north_park:            { number: 13, name: 'North Park',           side: 'far_north',    ward: 40, zipCodes: ['60625', '60659'], center: { lat: 41.9815, lng: -87.7226 } },
  albany_park:           { number: 14, name: 'Albany Park',           side: 'far_north',    ward: 33, zipCodes: ['60625'],          center: { lat: 41.9681, lng: -87.7232 } },
  portage_park:          { number: 15, name: 'Portage Park',         side: 'northwest',    ward: 38, zipCodes: ['60634', '60641'], center: { lat: 41.9579, lng: -87.7654 } },
  irving_park:           { number: 16, name: 'Irving Park',          side: 'northwest',    ward: 33, zipCodes: ['60618', '60641'], center: { lat: 41.9539, lng: -87.7306 } },
  dunning:               { number: 17, name: 'Dunning',              side: 'northwest',    ward: 36, zipCodes: ['60634'],          center: { lat: 41.9467, lng: -87.8048 } },
  montclare:             { number: 18, name: 'Montclare',            side: 'northwest',    ward: 36, zipCodes: ['60707'],          center: { lat: 41.9289, lng: -87.8123 } },
  belmont_cragin:        { number: 19, name: 'Belmont Cragin',       side: 'northwest',    ward: 31, zipCodes: ['60634', '60639', '60641'], center: { lat: 41.9309, lng: -87.7694 } },
  hermosa:               { number: 20, name: 'Hermosa',              side: 'northwest',    ward: 31, zipCodes: ['60639', '60647'], center: { lat: 41.9178, lng: -87.7323 } },
  avondale:              { number: 21, name: 'Avondale',             side: 'northwest',    ward: 35, zipCodes: ['60618', '60647'], center: { lat: 41.9389, lng: -87.7110 } },
  logan_square:          { number: 22, name: 'Logan Square',         side: 'northwest',    ward: 35, zipCodes: ['60647'],          center: { lat: 41.9233, lng: -87.7084 } },
  humboldt_park:         { number: 23, name: 'Humboldt Park',        side: 'west',         ward: 26, zipCodes: ['60624', '60647', '60651'], center: { lat: 41.9023, lng: -87.7212 } },
  west_town:             { number: 24, name: 'West Town',            side: 'west',         ward: 1,  zipCodes: ['60612', '60622', '60642', '60647', '60651'], center: { lat: 41.8970, lng: -87.6831 } },
  austin:                { number: 25, name: 'Austin',               side: 'west',         ward: 29, zipCodes: ['60644', '60651'], center: { lat: 41.8939, lng: -87.7616 } },
  west_garfield_park:    { number: 26, name: 'West Garfield Park',   side: 'west',         ward: 28, zipCodes: ['60624'],          center: { lat: 41.8808, lng: -87.7276 } },
  east_garfield_park:    { number: 27, name: 'East Garfield Park',   side: 'west',         ward: 28, zipCodes: ['60612', '60624'], center: { lat: 41.8810, lng: -87.7039 } },
  near_west_side:        { number: 28, name: 'Near West Side',       side: 'central',      ward: 25, zipCodes: ['60607', '60608', '60612', '60661'], center: { lat: 41.8812, lng: -87.6669 } },
  north_lawndale:        { number: 29, name: 'North Lawndale',       side: 'west',         ward: 24, zipCodes: ['60623', '60624'], center: { lat: 41.8603, lng: -87.7175 } },
  south_lawndale:        { number: 30, name: 'South Lawndale',       side: 'southwest',    ward: 22, zipCodes: ['60623'],          center: { lat: 41.8437, lng: -87.7135 } },
  lower_west_side:       { number: 31, name: 'Lower West Side',      side: 'southwest',    ward: 25, zipCodes: ['60608'],          center: { lat: 41.8529, lng: -87.6660 } },
  loop:                  { number: 32, name: 'Loop',                  side: 'central',      ward: 42, zipCodes: ['60601', '60602', '60603', '60604', '60605', '60606', '60661'], center: { lat: 41.8820, lng: -87.6298 } },
  near_south_side:       { number: 33, name: 'Near South Side',      side: 'central',      ward: 3,  zipCodes: ['60605', '60616'], center: { lat: 41.8555, lng: -87.6271 } },
  armour_square:         { number: 34, name: 'Armour Square',        side: 'south',        ward: 11, zipCodes: ['60609', '60616'], center: { lat: 41.8418, lng: -87.6354 } },
  douglas:               { number: 35, name: 'Douglas',              side: 'south',        ward: 3,  zipCodes: ['60616'],          center: { lat: 41.8352, lng: -87.6179 } },
  oakland:               { number: 36, name: 'Oakland',              side: 'south',        ward: 4,  zipCodes: ['60615', '60616'], center: { lat: 41.8231, lng: -87.6051 } },
  fuller_park:           { number: 37, name: 'Fuller Park',          side: 'south',        ward: 3,  zipCodes: ['60609'],          center: { lat: 41.8318, lng: -87.6516 } },
  grand_boulevard:       { number: 38, name: 'Grand Boulevard',      side: 'south',        ward: 3,  zipCodes: ['60615', '60616', '60653'], center: { lat: 41.8130, lng: -87.6172 } },
  kenwood:               { number: 39, name: 'Kenwood',              side: 'south',        ward: 4,  zipCodes: ['60615', '60653'], center: { lat: 41.8095, lng: -87.5935 } },
  washington_park:       { number: 40, name: 'Washington Park',      side: 'south',        ward: 6,  zipCodes: ['60615', '60637'], center: { lat: 41.7934, lng: -87.6161 } },
  hyde_park:             { number: 41, name: 'Hyde Park',             side: 'south',        ward: 5,  zipCodes: ['60615', '60637'], center: { lat: 41.7943, lng: -87.5914 } },
  woodlawn:              { number: 42, name: 'Woodlawn',             side: 'south',        ward: 5,  zipCodes: ['60637'],          center: { lat: 41.7784, lng: -87.5977 } },
  south_shore:           { number: 43, name: 'South Shore',          side: 'south',        ward: 7,  zipCodes: ['60649'],          center: { lat: 41.7612, lng: -87.5764 } },
  chatham:               { number: 44, name: 'Chatham',              side: 'south',        ward: 6,  zipCodes: ['60619', '60637'], center: { lat: 41.7403, lng: -87.6127 } },
  avalon_park:           { number: 45, name: 'Avalon Park',          side: 'south',        ward: 8,  zipCodes: ['60619'],          center: { lat: 41.7454, lng: -87.5887 } },
  south_chicago:         { number: 46, name: 'South Chicago',        side: 'far_southeast', ward: 10, zipCodes: ['60617'],         center: { lat: 41.7399, lng: -87.5549 } },
  burnside:              { number: 47, name: 'Burnside',             side: 'south',        ward: 9,  zipCodes: ['60619', '60628'], center: { lat: 41.7292, lng: -87.5994 } },
  calumet_heights:       { number: 48, name: 'Calumet Heights',      side: 'far_southeast', ward: 10, zipCodes: ['60617', '60619', '60633'], center: { lat: 41.7282, lng: -87.5789 } },
  roseland:              { number: 49, name: 'Roseland',             side: 'far_southeast', ward: 9,  zipCodes: ['60628'],         center: { lat: 41.7103, lng: -87.6244 } },
  pullman:               { number: 50, name: 'Pullman',              side: 'far_southeast', ward: 9,  zipCodes: ['60628'],         center: { lat: 41.7082, lng: -87.6086 } },
  south_deering:         { number: 51, name: 'South Deering',        side: 'far_southeast', ward: 10, zipCodes: ['60617', '60633'], center: { lat: 41.7103, lng: -87.5620 } },
  east_side:             { number: 52, name: 'East Side',            side: 'far_southeast', ward: 10, zipCodes: ['60617'],         center: { lat: 41.7136, lng: -87.5344 } },
  west_pullman:          { number: 53, name: 'West Pullman',         side: 'far_southeast', ward: 9,  zipCodes: ['60628', '60643'], center: { lat: 41.6895, lng: -87.6335 } },
  riverdale:             { number: 54, name: 'Riverdale',            side: 'far_southeast', ward: 9,  zipCodes: ['60627', '60628'], center: { lat: 41.6494, lng: -87.6326 } },
  hegewisch:             { number: 55, name: 'Hegewisch',            side: 'far_southeast', ward: 10, zipCodes: ['60633'],         center: { lat: 41.6546, lng: -87.5510 } },
  garfield_ridge:        { number: 56, name: 'Garfield Ridge',       side: 'southwest',    ward: 23, zipCodes: ['60629', '60632', '60638'], center: { lat: 41.7944, lng: -87.7663 } },
  archer_heights:        { number: 57, name: 'Archer Heights',       side: 'southwest',    ward: 23, zipCodes: ['60632'],          center: { lat: 41.8102, lng: -87.7237 } },
  brighton_park:         { number: 58, name: 'Brighton Park',        side: 'southwest',    ward: 14, zipCodes: ['60609', '60632'], center: { lat: 41.8194, lng: -87.6968 } },
  mckinley_park:         { number: 59, name: 'McKinley Park',        side: 'southwest',    ward: 12, zipCodes: ['60608', '60609'], center: { lat: 41.8313, lng: -87.6794 } },
  bridgeport:            { number: 60, name: 'Bridgeport',           side: 'south',        ward: 11, zipCodes: ['60608', '60609'], center: { lat: 41.8378, lng: -87.6518 } },
  new_city:              { number: 61, name: 'New City',             side: 'southwest',    ward: 15, zipCodes: ['60609', '60621'], center: { lat: 41.8093, lng: -87.6584 } },
  west_elsdon:           { number: 62, name: 'West Elsdon',          side: 'southwest',    ward: 23, zipCodes: ['60629', '60632', '60638'], center: { lat: 41.7929, lng: -87.7248 } },
  gage_park:             { number: 63, name: 'Gage Park',            side: 'southwest',    ward: 15, zipCodes: ['60629', '60632'], center: { lat: 41.7946, lng: -87.6957 } },
  clearing:              { number: 64, name: 'Clearing',             side: 'southwest',    ward: 23, zipCodes: ['60638'],          center: { lat: 41.7804, lng: -87.7610 } },
  west_lawn:             { number: 65, name: 'West Lawn',            side: 'southwest',    ward: 23, zipCodes: ['60629'],          center: { lat: 41.7738, lng: -87.7229 } },
  chicago_lawn:          { number: 66, name: 'Chicago Lawn',         side: 'southwest',    ward: 18, zipCodes: ['60629', '60636'], center: { lat: 41.7719, lng: -87.6957 } },
  west_englewood:        { number: 67, name: 'West Englewood',       side: 'southwest',    ward: 16, zipCodes: ['60621', '60636'], center: { lat: 41.7752, lng: -87.6614 } },
  englewood:             { number: 68, name: 'Englewood',            side: 'south',        ward: 16, zipCodes: ['60621'],          center: { lat: 41.7798, lng: -87.6441 } },
  greater_grand_crossing:{ number: 69, name: 'Greater Grand Crossing', side: 'south',      ward: 6,  zipCodes: ['60619', '60621', '60637'], center: { lat: 41.7622, lng: -87.6148 } },
  ashburn:               { number: 70, name: 'Ashburn',              side: 'far_southwest', ward: 19, zipCodes: ['60620', '60643', '60655'], center: { lat: 41.7474, lng: -87.7114 } },
  auburn_gresham:        { number: 71, name: 'Auburn Gresham',       side: 'far_southwest', ward: 17, zipCodes: ['60620'],         center: { lat: 41.7439, lng: -87.6533 } },
  beverly:               { number: 72, name: 'Beverly',              side: 'far_southwest', ward: 19, zipCodes: ['60643', '60655'], center: { lat: 41.7145, lng: -87.6683 } },
  washington_heights:    { number: 73, name: 'Washington Heights',   side: 'far_southwest', ward: 21, zipCodes: ['60620', '60643'], center: { lat: 41.7225, lng: -87.6510 } },
  mount_greenwood:       { number: 74, name: 'Mount Greenwood',      side: 'far_southwest', ward: 19, zipCodes: ['60655'],         center: { lat: 41.6949, lng: -87.7066 } },
  morgan_park:           { number: 75, name: 'Morgan Park',          side: 'far_southwest', ward: 21, zipCodes: ['60643'],         center: { lat: 41.6909, lng: -87.6685 } },
  ohare:                 { number: 76, name: "O'Hare",               side: 'northwest',    ward: 41, zipCodes: ['60666', '60631'], center: { lat: 41.9794, lng: -87.8556 } },
  edgewater:             { number: 77, name: 'Edgewater',            side: 'far_north',    ward: 48, zipCodes: ['60640', '60660'], center: { lat: 41.9838, lng: -87.6599 } },
};

// ─────────────────────────────────────────────────
// SIDE GROUPINGS
// ─────────────────────────────────────────────────

export const CHICAGO_SIDES: Record<ChicagoSide, { label: string }> = {
  far_north:     { label: 'Far North Side' },
  north:         { label: 'North Side' },
  northwest:     { label: 'Northwest Side' },
  west:          { label: 'West Side' },
  central:       { label: 'Central' },
  south:         { label: 'South Side' },
  southwest:     { label: 'Southwest Side' },
  far_southwest: { label: 'Far Southwest Side' },
  far_southeast: { label: 'Far Southeast Side' },
};

export function getCommunityAreasBySide(side: ChicagoSide): ChicagoCommunityArea[] {
  return (Object.entries(CHICAGO_COMMUNITY_AREAS) as [ChicagoCommunityArea, CommunityAreaInfo][])
    .filter(([, info]) => info.side === side)
    .map(([id]) => id);
}

// ─────────────────────────────────────────────────
// PHASE 2 STUBS: Key Suburbs
// ─────────────────────────────────────────────────

export const CHICAGOLAND_SUBURBS: ChicagolandRegion[] = [
  { type: 'suburb', id: 'evanston',    name: 'Evanston',    county: 'cook',   zipCodes: ['60201', '60202'], center: { lat: 42.0451, lng: -87.6877 } },
  { type: 'suburb', id: 'oak_park',    name: 'Oak Park',    county: 'cook',   zipCodes: ['60301', '60302'], center: { lat: 41.8850, lng: -87.7845 } },
  { type: 'suburb', id: 'cicero',      name: 'Cicero',      county: 'cook',   zipCodes: ['60804'],          center: { lat: 41.8456, lng: -87.7539 } },
  { type: 'suburb', id: 'aurora',      name: 'Aurora',      county: 'kane',   zipCodes: ['60502', '60503', '60504', '60505', '60506'], center: { lat: 41.7606, lng: -88.3201 } },
  { type: 'suburb', id: 'elgin',       name: 'Elgin',       county: 'kane',   zipCodes: ['60120', '60123', '60124'], center: { lat: 42.0354, lng: -88.2826 } },
  { type: 'suburb', id: 'joliet',      name: 'Joliet',      county: 'will',   zipCodes: ['60431', '60432', '60433', '60435', '60436'], center: { lat: 41.5250, lng: -88.0817 } },
  { type: 'suburb', id: 'naperville',  name: 'Naperville',  county: 'dupage', zipCodes: ['60540', '60563', '60564', '60565'], center: { lat: 41.7508, lng: -88.1535 } },
  { type: 'suburb', id: 'waukegan',    name: 'Waukegan',    county: 'lake',   zipCodes: ['60085', '60087'], center: { lat: 42.3636, lng: -87.8448 } },
];

// ─────────────────────────────────────────────────
// LOOKUP UTILITIES
// ─────────────────────────────────────────────────

/**
 * Convert a community area to a ChicagolandRegion.
 */
export function communityAreaToRegion(id: ChicagoCommunityArea): ChicagolandRegion {
  const area = CHICAGO_COMMUNITY_AREAS[id];
  return {
    type: 'community_area',
    id,
    name: area.name,
    county: 'cook',
    ward: area.ward,
    zipCodes: area.zipCodes,
    center: area.center,
    communityAreaNumber: area.number,
    side: area.side,
  };
}

/**
 * Get all Chicagoland regions (Phase 1: community areas + suburb stubs).
 */
export function getAllChicagolandRegions(): ChicagolandRegion[] {
  const areas = (Object.keys(CHICAGO_COMMUNITY_AREAS) as ChicagoCommunityArea[])
    .map(id => communityAreaToRegion(id));
  return [...areas, ...CHICAGOLAND_SUBURBS];
}

/**
 * Get community area info by name (case-insensitive).
 */
export function findCommunityArea(name: string): ChicagoCommunityArea | undefined {
  const lower = name.toLowerCase().replace(/[\s-]+/g, '_');
  return Object.keys(CHICAGO_COMMUNITY_AREAS).find(
    k => k === lower
  ) as ChicagoCommunityArea | undefined;
}

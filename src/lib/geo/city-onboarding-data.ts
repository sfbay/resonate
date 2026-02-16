/**
 * City-Specific Onboarding Data
 *
 * Per-city constants for the government onboarding wizard:
 * departments, neighborhoods/regions, and languages.
 *
 * Replaces hardcoded SF-only arrays with a city-aware lookup.
 */

import type { CitySlug } from './types';

// =============================================================================
// TYPES
// =============================================================================

export interface OnboardingRegionGroup {
  label: string;
  items: string[];
}

export interface CityOnboardingData {
  departments: string[];
  regions: OnboardingRegionGroup[];
  languages: string[];
  regionLabel: string;         // "Neighborhood" for SF, "Community Area" for Chicago
  districtLabel?: string;      // "Supervisorial District" for SF, "Ward" for Chicago
}

// =============================================================================
// SAN FRANCISCO
// =============================================================================

const SF_DATA: CityOnboardingData = {
  regionLabel: 'Neighborhood',
  districtLabel: 'Supervisorial District',
  departments: [
    'Mayor\'s Office',
    'Public Health (DPH)',
    'Human Services (HSA)',
    'Environment (SFE)',
    'Municipal Transportation (SFMTA)',
    'Public Utilities Commission (SFPUC)',
    'Arts Commission',
    'Office of Economic & Workforce Development (OEWD)',
    'Recreation & Parks',
    'Fire Department (SFFD)',
    'Police Department (SFPD)',
    'District Attorney',
    'Public Defender',
    'Controller\'s Office',
    'Department of Elections',
    'Office of Civic Engagement & Immigrant Affairs (OCEIA)',
  ],
  regions: [
    {
      label: 'All Neighborhoods',
      items: [
        'Bayview-Hunters Point', 'Bernal Heights', 'Castro', 'Chinatown',
        'Civic Center', 'Crocker-Amazon', 'Diamond Heights', 'Downtown',
        'Excelsior', 'Financial District', 'Glen Park', 'Haight-Ashbury',
        'Hayes Valley', 'Ingleside', 'Inner Richmond', 'Inner Sunset',
        'Japantown', 'Lakeshore', 'Marina', 'Mission', 'Nob Hill',
        'Noe Valley', 'North Beach', 'Oceanview', 'Outer Mission',
        'Outer Richmond', 'Outer Sunset', 'Pacific Heights', 'Portola',
        'Potrero Hill', 'Presidio', 'Russian Hill', 'SOMA',
        'Sunset/Parkside', 'Tenderloin', 'Treasure Island',
        'Twin Peaks', 'Visitacion Valley', 'West Portal',
        'Western Addition',
      ],
    },
  ],
  languages: [
    'English', 'Spanish', 'Chinese (Cantonese)', 'Chinese (Mandarin)',
    'Filipino (Tagalog)', 'Vietnamese', 'Korean', 'Russian',
    'Japanese', 'Arabic', 'French', 'Portuguese',
    'Thai', 'Burmese', 'Samoan',
  ],
};

// =============================================================================
// CHICAGOLAND
// =============================================================================

const CHICAGOLAND_DATA: CityOnboardingData = {
  regionLabel: 'Community Area',
  districtLabel: 'Ward',
  departments: [
    // City of Chicago departments
    'City of Chicago — Public Health (CDPH)',
    'City of Chicago — Transit Authority (CTA)',
    'City of Chicago — Housing Authority (CHA)',
    'City of Chicago — Family & Support Services (DFSS)',
    'City of Chicago — Emergency Management (OEMC)',
    'City of Chicago — Police Department (CPD)',
    'City of Chicago — Public Library (CPL)',
    'City of Chicago — Park District',
    'City of Chicago — Mayor\'s Office',
    'City of Chicago — Planning & Development',
    'City of Chicago — DCASE (Cultural Affairs)',
    // Cook County departments
    'Cook County — Health & Hospitals',
    'Cook County — Transportation & Highways',
    'Cook County — Forest Preserves',
    'Cook County — Bureau of Economic Development',
    // Regional agencies
    'Regional Transportation Authority (RTA)',
    'Metra',
    'Pace Suburban Bus',
    'Illinois Department of Public Health (IDPH)',
  ],
  regions: [
    {
      label: 'Far North Side',
      items: [
        'Rogers Park', 'West Ridge', 'Uptown', 'Lincoln Square',
        'Edison Park', 'Norwood Park', 'Jefferson Park', 'Forest Glen',
        'North Park', 'Edgewater',
      ],
    },
    {
      label: 'North Side',
      items: [
        'North Center', 'Lake View', 'Lincoln Park', 'Near North Side',
      ],
    },
    {
      label: 'Northwest Side',
      items: [
        'Albany Park', 'Portage Park', 'Irving Park', 'Dunning',
        'Montclare', 'Belmont Cragin', 'Hermosa', 'Avondale',
      ],
    },
    {
      label: 'West Side',
      items: [
        'Logan Square', 'Humboldt Park', 'West Town', 'Austin',
        'West Garfield Park', 'East Garfield Park', 'Near West Side',
        'North Lawndale', 'South Lawndale', 'Lower West Side',
      ],
    },
    {
      label: 'Central',
      items: ['Loop', 'Near South Side'],
    },
    {
      label: 'South Side',
      items: [
        'Armour Square', 'Douglas', 'Oakland', 'Fuller Park',
        'Grand Boulevard', 'Kenwood', 'Washington Park', 'Hyde Park',
        'Woodlawn', 'South Shore', 'Chatham', 'Avalon Park',
        'South Chicago', 'Burnside', 'Calumet Heights',
      ],
    },
    {
      label: 'Southwest Side',
      items: [
        'Garfield Ridge', 'Archer Heights', 'Brighton Park',
        'McKinley Park', 'Bridgeport', 'New City', 'West Elsdon',
        'Gage Park', 'Clearing', 'West Lawn', 'Chicago Lawn',
        'West Englewood', 'Englewood',
      ],
    },
    {
      label: 'Far Southwest Side',
      items: [
        'Greater Grand Crossing', 'Ashburn', 'Auburn Gresham',
        'Beverly', 'Washington Heights', 'Mount Greenwood', 'Morgan Park',
      ],
    },
    {
      label: 'Far Southeast Side',
      items: [
        'Roseland', 'Pullman', 'South Deering', 'East Side',
        'West Pullman', 'Riverdale', 'Hegewisch',
      ],
    },
    {
      label: 'O\'Hare Area',
      items: ['O\'Hare'],
    },
    {
      label: 'Key Suburbs',
      items: [
        'Evanston', 'Oak Park', 'Cicero', 'Aurora',
        'Elgin', 'Joliet', 'Naperville', 'Waukegan',
      ],
    },
  ],
  languages: [
    'English', 'Spanish', 'Polish', 'Chinese (Mandarin)',
    'Chinese (Cantonese)', 'Arabic', 'Korean', 'Tagalog',
    'Vietnamese', 'Hindi', 'Urdu', 'Gujarati',
    'Russian', 'Ukrainian', 'French', 'Yoruba',
  ],
};

// =============================================================================
// LOOKUP
// =============================================================================

const CITY_ONBOARDING_DATA: Record<string, CityOnboardingData> = {
  sf: SF_DATA,
  chicago: CHICAGOLAND_DATA,
};

/**
 * Get onboarding data for a city.
 * Falls back to SF if city not found.
 */
export function getCityOnboardingData(citySlug: string): CityOnboardingData {
  return CITY_ONBOARDING_DATA[citySlug] ?? SF_DATA;
}

/**
 * Get all region items flattened for a city
 */
export function getAllRegionItems(citySlug: string): string[] {
  const data = getCityOnboardingData(citySlug);
  return data.regions.flatMap(g => g.items);
}

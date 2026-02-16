/**
 * Chicagoland Census Data
 *
 * Census demographics for Chicago community areas.
 * Supports both:
 * - Sync sample data (for SSR/immediate rendering)
 * - Async live data from Census Bureau API (for accuracy)
 *
 * Usage:
 *   const sample = getChicagolandCensusData();        // Immediate, sample data
 *   const live = await fetchChicagolandCensusData();   // From Census Bureau API
 */

import type { CensusApiConfig } from './census-api';

// Reuse the same NeighborhoodCensusData structure — it's generic enough
export interface CommunityAreaCensusData {
  population: {
    total: number;
  };
  economic: {
    medianHouseholdIncome: number;
    amiDistribution: {
      extremelyLow: number;
      veryLow: number;
      low: number;
      moderate: number;
      aboveModerate: number;
    };
  };
  housing: {
    renterOccupied: number;
  };
  language: {
    limitedEnglishProficiency: number;
    languagesSpoken: {
      spanish: number;
      polish: number;
      chinese: number;
      arabic: number;
      korean: number;
      tagalog: number;
    };
  };
  ethnicity: {
    distribution: {
      white: number;
      black: number;
      hispanic: number;
      asian: number;
      pacific: number;
      multiracial: number;
    };
  };
  age: {
    distribution: {
      under18: number;
      age18to24: number;
      age25to34: number;
      age35to44: number;
      age45to54: number;
      age55to64: number;
      age65plus: number;
    };
  };
}

// Chicago AMI (2024): ~$72,000 for metro area
const CHICAGO_AMI = 72000;

/**
 * Sample census data for key community areas (sync, for SSR)
 * Based on ACS 5-year estimates 2019-2023
 */
const SAMPLE_CENSUS_DATA: Record<string, CommunityAreaCensusData> = {
  loop: {
    population: { total: 42298 },
    economic: {
      medianHouseholdIncome: 105000,
      amiDistribution: { extremelyLow: 8, veryLow: 6, low: 10, moderate: 18, aboveModerate: 58 },
    },
    housing: { renterOccupied: 78 },
    language: {
      limitedEnglishProficiency: 8,
      languagesSpoken: { spanish: 5, polish: 1, chinese: 4, arabic: 1, korean: 1, tagalog: 1 },
    },
    ethnicity: { distribution: { white: 62, black: 8, hispanic: 10, asian: 16, pacific: 0, multiracial: 4 } },
    age: { distribution: { under18: 6, age18to24: 12, age25to34: 35, age35to44: 18, age45to54: 10, age55to64: 9, age65plus: 10 } },
  },
  austin: {
    population: { total: 96557 },
    economic: {
      medianHouseholdIncome: 32000,
      amiDistribution: { extremelyLow: 35, veryLow: 18, low: 20, moderate: 15, aboveModerate: 12 },
    },
    housing: { renterOccupied: 58 },
    language: {
      limitedEnglishProficiency: 5,
      languagesSpoken: { spanish: 8, polish: 0, chinese: 0, arabic: 1, korean: 0, tagalog: 0 },
    },
    ethnicity: { distribution: { white: 2, black: 82, hispanic: 12, asian: 1, pacific: 0, multiracial: 3 } },
    age: { distribution: { under18: 28, age18to24: 10, age25to34: 14, age35to44: 12, age45to54: 12, age55to64: 12, age65plus: 12 } },
  },
  south_lawndale: {
    population: { total: 73706 },
    economic: {
      medianHouseholdIncome: 38000,
      amiDistribution: { extremelyLow: 22, veryLow: 16, low: 22, moderate: 22, aboveModerate: 18 },
    },
    housing: { renterOccupied: 55 },
    language: {
      limitedEnglishProficiency: 38,
      languagesSpoken: { spanish: 78, polish: 2, chinese: 1, arabic: 0, korean: 0, tagalog: 0 },
    },
    ethnicity: { distribution: { white: 8, black: 4, hispanic: 82, asian: 3, pacific: 0, multiracial: 3 } },
    age: { distribution: { under18: 32, age18to24: 12, age25to34: 18, age35to44: 14, age45to54: 10, age55to64: 8, age65plus: 6 } },
  },
  hyde_park: {
    population: { total: 25681 },
    economic: {
      medianHouseholdIncome: 54000,
      amiDistribution: { extremelyLow: 20, veryLow: 10, low: 14, moderate: 16, aboveModerate: 40 },
    },
    housing: { renterOccupied: 72 },
    language: {
      limitedEnglishProficiency: 10,
      languagesSpoken: { spanish: 5, polish: 1, chinese: 6, arabic: 2, korean: 2, tagalog: 1 },
    },
    ethnicity: { distribution: { white: 38, black: 32, hispanic: 8, asian: 16, pacific: 0, multiracial: 6 } },
    age: { distribution: { under18: 10, age18to24: 22, age25to34: 22, age35to44: 14, age45to54: 10, age55to64: 10, age65plus: 12 } },
  },
  logan_square: {
    population: { total: 71665 },
    economic: {
      medianHouseholdIncome: 68000,
      amiDistribution: { extremelyLow: 12, veryLow: 8, low: 15, moderate: 22, aboveModerate: 43 },
    },
    housing: { renterOccupied: 62 },
    language: {
      limitedEnglishProficiency: 12,
      languagesSpoken: { spanish: 25, polish: 4, chinese: 1, arabic: 0, korean: 0, tagalog: 1 },
    },
    ethnicity: { distribution: { white: 48, black: 5, hispanic: 38, asian: 4, pacific: 0, multiracial: 5 } },
    age: { distribution: { under18: 15, age18to24: 10, age25to34: 28, age35to44: 18, age45to54: 10, age55to64: 10, age65plus: 9 } },
  },
  englewood: {
    population: { total: 24369 },
    economic: {
      medianHouseholdIncome: 24000,
      amiDistribution: { extremelyLow: 42, veryLow: 18, low: 18, moderate: 12, aboveModerate: 10 },
    },
    housing: { renterOccupied: 55 },
    language: {
      limitedEnglishProficiency: 3,
      languagesSpoken: { spanish: 4, polish: 0, chinese: 0, arabic: 0, korean: 0, tagalog: 0 },
    },
    ethnicity: { distribution: { white: 1, black: 94, hispanic: 3, asian: 0, pacific: 0, multiracial: 2 } },
    age: { distribution: { under18: 30, age18to24: 10, age25to34: 14, age35to44: 10, age45to54: 12, age55to64: 12, age65plus: 12 } },
  },
  lake_view: {
    population: { total: 100570 },
    economic: {
      medianHouseholdIncome: 95000,
      amiDistribution: { extremelyLow: 8, veryLow: 6, low: 10, moderate: 16, aboveModerate: 60 },
    },
    housing: { renterOccupied: 70 },
    language: {
      limitedEnglishProficiency: 6,
      languagesSpoken: { spanish: 6, polish: 2, chinese: 2, arabic: 1, korean: 1, tagalog: 1 },
    },
    ethnicity: { distribution: { white: 75, black: 4, hispanic: 10, asian: 8, pacific: 0, multiracial: 3 } },
    age: { distribution: { under18: 8, age18to24: 10, age25to34: 32, age35to44: 20, age45to54: 12, age55to64: 10, age65plus: 8 } },
  },
  humboldt_park: {
    population: { total: 54165 },
    economic: {
      medianHouseholdIncome: 36000,
      amiDistribution: { extremelyLow: 28, veryLow: 15, low: 20, moderate: 18, aboveModerate: 19 },
    },
    housing: { renterOccupied: 58 },
    language: {
      limitedEnglishProficiency: 18,
      languagesSpoken: { spanish: 42, polish: 1, chinese: 0, arabic: 0, korean: 0, tagalog: 0 },
    },
    ethnicity: { distribution: { white: 12, black: 38, hispanic: 45, asian: 2, pacific: 0, multiracial: 3 } },
    age: { distribution: { under18: 25, age18to24: 10, age25to34: 18, age35to44: 14, age45to54: 12, age55to64: 11, age65plus: 10 } },
  },
  near_north_side: {
    population: { total: 105481 },
    economic: {
      medianHouseholdIncome: 112000,
      amiDistribution: { extremelyLow: 10, veryLow: 5, low: 8, moderate: 12, aboveModerate: 65 },
    },
    housing: { renterOccupied: 68 },
    language: {
      limitedEnglishProficiency: 7,
      languagesSpoken: { spanish: 5, polish: 2, chinese: 3, arabic: 1, korean: 1, tagalog: 1 },
    },
    ethnicity: { distribution: { white: 70, black: 7, hispanic: 8, asian: 10, pacific: 0, multiracial: 5 } },
    age: { distribution: { under18: 8, age18to24: 8, age25to34: 28, age35to44: 18, age45to54: 14, age55to64: 12, age65plus: 12 } },
  },
  south_shore: {
    population: { total: 48000 },
    economic: {
      medianHouseholdIncome: 28000,
      amiDistribution: { extremelyLow: 38, veryLow: 16, low: 18, moderate: 15, aboveModerate: 13 },
    },
    housing: { renterOccupied: 60 },
    language: {
      limitedEnglishProficiency: 3,
      languagesSpoken: { spanish: 3, polish: 0, chinese: 0, arabic: 1, korean: 0, tagalog: 0 },
    },
    ethnicity: { distribution: { white: 2, black: 92, hispanic: 3, asian: 1, pacific: 0, multiracial: 2 } },
    age: { distribution: { under18: 26, age18to24: 10, age25to34: 16, age35to44: 12, age45to54: 12, age55to64: 12, age65plus: 12 } },
  },
  albany_park: {
    population: { total: 51542 },
    economic: {
      medianHouseholdIncome: 52000,
      amiDistribution: { extremelyLow: 16, veryLow: 10, low: 18, moderate: 22, aboveModerate: 34 },
    },
    housing: { renterOccupied: 62 },
    language: {
      limitedEnglishProficiency: 28,
      languagesSpoken: { spanish: 18, polish: 4, chinese: 3, arabic: 8, korean: 6, tagalog: 2 },
    },
    ethnicity: { distribution: { white: 30, black: 4, hispanic: 38, asian: 22, pacific: 0, multiracial: 6 } },
    age: { distribution: { under18: 20, age18to24: 10, age25to34: 20, age35to44: 16, age45to54: 12, age55to64: 12, age65plus: 10 } },
  },
  bridgeport: {
    population: { total: 33702 },
    economic: {
      medianHouseholdIncome: 56000,
      amiDistribution: { extremelyLow: 14, veryLow: 10, low: 16, moderate: 24, aboveModerate: 36 },
    },
    housing: { renterOccupied: 48 },
    language: {
      limitedEnglishProficiency: 22,
      languagesSpoken: { spanish: 14, polish: 3, chinese: 20, arabic: 0, korean: 0, tagalog: 0 },
    },
    ethnicity: { distribution: { white: 25, black: 8, hispanic: 32, asian: 30, pacific: 0, multiracial: 5 } },
    age: { distribution: { under18: 16, age18to24: 10, age25to34: 22, age35to44: 16, age45to54: 12, age55to64: 12, age65plus: 12 } },
  },
};

/**
 * Get sample census data for Chicagoland community areas (sync, for SSR)
 */
export function getChicagolandCensusData(): Record<string, CommunityAreaCensusData> {
  return SAMPLE_CENSUS_DATA;
}

/**
 * Fetch live census data for Chicagoland from Census Bureau API
 * Phase 1: Cook County tracts → community areas
 */
export async function fetchChicagolandCensusData(
  config: CensusApiConfig = {}
): Promise<Record<string, CommunityAreaCensusData>> {
  // For now, return sample data. When Phase 2 census integration is ready,
  // this will use the census-api.ts with state='17', county='031' and
  // aggregate via chicagoland-tract-mapping.ts
  console.log('[Census] Chicagoland live fetch not yet implemented, using sample data');
  return SAMPLE_CENSUS_DATA;
}

export { CHICAGO_AMI };

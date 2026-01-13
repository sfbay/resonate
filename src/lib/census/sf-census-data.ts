/**
 * San Francisco Census Data
 *
 * This module provides census demographics for SF neighborhoods.
 * Supports both:
 * - Sync sample data (for SSR/immediate rendering)
 * - Async live data from Census Bureau API (for accuracy)
 *
 * Usage:
 *   const sample = getSFCensusData();           // Immediate, sample data
 *   const live = await fetchSFCensusData();     // From Census Bureau API
 */

import type { SFNeighborhood } from '@/types';
import { getNeighborhoodCensusData as fetchFromAggregator, type CensusApiConfig } from './census-aggregator';
import type { NeighborhoodCensusData as FullCensusData } from './types';

// Re-export CensusApiConfig for consumers
export type { CensusApiConfig };

// =============================================================================
// TYPES
// =============================================================================

export interface NeighborhoodCensusData {
  population: {
    total: number;
  };
  economic: {
    medianHouseholdIncome: number;
    amiDistribution: {
      extremelyLow: number;  // <30% AMI
      veryLow: number;       // 30-50% AMI
      low: number;           // 50-80% AMI
      moderate: number;      // 80-120% AMI
      aboveModerate: number; // >120% AMI
    };
  };
  housing: {
    renterOccupied: number;  // Percentage
  };
  language: {
    limitedEnglishProficiency: number;  // Percentage
    languagesSpoken: {
      chinese: number;
      spanish: number;
      tagalog: number;
      vietnamese: number;
      korean: number;
      russian: number;
    };
  };
  ethnicity: {
    distribution: {
      white: number;
      asian: number;
      hispanic: number;
      black: number;
      pacific: number;
      multiracial: number;
    };
  };
  age: {
    under18: number;
    seniors: number;  // 65+
    distribution: {
      '18-24': number;
      '25-34': number;
      '35-44': number;
      '45-54': number;
      '55-64': number;
    };
  };
}

export type SFCensusDataMap = Record<SFNeighborhood, NeighborhoodCensusData>;

// =============================================================================
// SAMPLE CENSUS DATA
// =============================================================================

/**
 * Sample census data for SF neighborhoods
 * Values are approximations based on ACS 5-year estimates and neighborhood characteristics
 */
const SF_CENSUS_DATA: SFCensusDataMap = {
  bayview_hunters_point: {
    population: { total: 36580 },
    economic: {
      medianHouseholdIncome: 52000,
      amiDistribution: { extremelyLow: 28, veryLow: 18, low: 22, moderate: 18, aboveModerate: 14 },
    },
    housing: { renterOccupied: 58 },
    language: {
      limitedEnglishProficiency: 22,
      languagesSpoken: { chinese: 12, spanish: 14, tagalog: 8, vietnamese: 3, korean: 1, russian: 0 },
    },
    ethnicity: { distribution: { white: 8, asian: 35, hispanic: 22, black: 28, pacific: 3, multiracial: 4 } },
    age: { under18: 22, seniors: 14, distribution: { '18-24': 9, '25-34': 18, '35-44': 16, '45-54': 12, '55-64': 9 } },
  },
  bernal_heights: {
    population: { total: 26200 },
    economic: {
      medianHouseholdIncome: 128000,
      amiDistribution: { extremelyLow: 8, veryLow: 6, low: 12, moderate: 22, aboveModerate: 52 },
    },
    housing: { renterOccupied: 42 },
    language: {
      limitedEnglishProficiency: 12,
      languagesSpoken: { chinese: 5, spanish: 18, tagalog: 2, vietnamese: 1, korean: 1, russian: 0 },
    },
    ethnicity: { distribution: { white: 52, asian: 12, hispanic: 28, black: 3, pacific: 1, multiracial: 4 } },
    age: { under18: 16, seniors: 12, distribution: { '18-24': 5, '25-34': 22, '35-44': 25, '45-54': 12, '55-64': 8 } },
  },
  castro: {
    population: { total: 18500 },
    economic: {
      medianHouseholdIncome: 145000,
      amiDistribution: { extremelyLow: 6, veryLow: 5, low: 10, moderate: 18, aboveModerate: 61 },
    },
    housing: { renterOccupied: 62 },
    language: {
      limitedEnglishProficiency: 6,
      languagesSpoken: { chinese: 3, spanish: 8, tagalog: 1, vietnamese: 0, korean: 1, russian: 0 },
    },
    ethnicity: { distribution: { white: 72, asian: 10, hispanic: 10, black: 3, pacific: 1, multiracial: 4 } },
    age: { under18: 4, seniors: 14, distribution: { '18-24': 6, '25-34': 28, '35-44': 22, '45-54': 14, '55-64': 12 } },
  },
  chinatown: {
    population: { total: 15780 },
    economic: {
      medianHouseholdIncome: 28000,
      amiDistribution: { extremelyLow: 48, veryLow: 22, low: 15, moderate: 10, aboveModerate: 5 },
    },
    housing: { renterOccupied: 92 },
    language: {
      limitedEnglishProficiency: 72,
      languagesSpoken: { chinese: 85, spanish: 2, tagalog: 0, vietnamese: 2, korean: 0, russian: 0 },
    },
    ethnicity: { distribution: { white: 4, asian: 90, hispanic: 3, black: 1, pacific: 0, multiracial: 2 } },
    age: { under18: 12, seniors: 28, distribution: { '18-24': 8, '25-34': 15, '35-44': 14, '45-54': 12, '55-64': 11 } },
  },
  civic_center: {
    population: { total: 8200 },
    economic: {
      medianHouseholdIncome: 45000,
      amiDistribution: { extremelyLow: 38, veryLow: 18, low: 18, moderate: 14, aboveModerate: 12 },
    },
    housing: { renterOccupied: 88 },
    language: {
      limitedEnglishProficiency: 28,
      languagesSpoken: { chinese: 12, spanish: 15, tagalog: 3, vietnamese: 5, korean: 2, russian: 1 },
    },
    ethnicity: { distribution: { white: 38, asian: 28, hispanic: 18, black: 10, pacific: 2, multiracial: 4 } },
    age: { under18: 6, seniors: 18, distribution: { '18-24': 10, '25-34': 24, '35-44': 18, '45-54': 14, '55-64': 10 } },
  },
  cole_valley: {
    population: { total: 8900 },
    economic: {
      medianHouseholdIncome: 158000,
      amiDistribution: { extremelyLow: 5, veryLow: 4, low: 8, moderate: 16, aboveModerate: 67 },
    },
    housing: { renterOccupied: 48 },
    language: {
      limitedEnglishProficiency: 5,
      languagesSpoken: { chinese: 4, spanish: 5, tagalog: 1, vietnamese: 0, korean: 1, russian: 1 },
    },
    ethnicity: { distribution: { white: 75, asian: 12, hispanic: 6, black: 2, pacific: 1, multiracial: 4 } },
    age: { under18: 12, seniors: 10, distribution: { '18-24': 6, '25-34': 26, '35-44': 24, '45-54': 14, '55-64': 8 } },
  },
  diamond_heights: {
    population: { total: 6200 },
    economic: {
      medianHouseholdIncome: 125000,
      amiDistribution: { extremelyLow: 8, veryLow: 6, low: 12, moderate: 22, aboveModerate: 52 },
    },
    housing: { renterOccupied: 35 },
    language: {
      limitedEnglishProficiency: 10,
      languagesSpoken: { chinese: 8, spanish: 6, tagalog: 2, vietnamese: 1, korean: 1, russian: 0 },
    },
    ethnicity: { distribution: { white: 55, asian: 22, hispanic: 12, black: 5, pacific: 1, multiracial: 5 } },
    age: { under18: 10, seniors: 18, distribution: { '18-24': 5, '25-34': 18, '35-44': 20, '45-54': 16, '55-64': 13 } },
  },
  dogpatch: {
    population: { total: 4800 },
    economic: {
      medianHouseholdIncome: 165000,
      amiDistribution: { extremelyLow: 4, veryLow: 4, low: 8, moderate: 18, aboveModerate: 66 },
    },
    housing: { renterOccupied: 55 },
    language: {
      limitedEnglishProficiency: 6,
      languagesSpoken: { chinese: 5, spanish: 4, tagalog: 1, vietnamese: 0, korean: 1, russian: 0 },
    },
    ethnicity: { distribution: { white: 62, asian: 18, hispanic: 10, black: 4, pacific: 1, multiracial: 5 } },
    age: { under18: 8, seniors: 8, distribution: { '18-24': 6, '25-34': 32, '35-44': 28, '45-54': 12, '55-64': 6 } },
  },
  downtown: {
    population: { total: 12400 },
    economic: {
      medianHouseholdIncome: 68000,
      amiDistribution: { extremelyLow: 22, veryLow: 14, low: 16, moderate: 20, aboveModerate: 28 },
    },
    housing: { renterOccupied: 85 },
    language: {
      limitedEnglishProficiency: 25,
      languagesSpoken: { chinese: 18, spanish: 8, tagalog: 2, vietnamese: 3, korean: 2, russian: 1 },
    },
    ethnicity: { distribution: { white: 42, asian: 32, hispanic: 12, black: 8, pacific: 2, multiracial: 4 } },
    age: { under18: 4, seniors: 16, distribution: { '18-24': 10, '25-34': 28, '35-44': 20, '45-54': 12, '55-64': 10 } },
  },
  excelsior: {
    population: { total: 41500 },
    economic: {
      medianHouseholdIncome: 72000,
      amiDistribution: { extremelyLow: 14, veryLow: 12, low: 22, moderate: 28, aboveModerate: 24 },
    },
    housing: { renterOccupied: 45 },
    language: {
      limitedEnglishProficiency: 35,
      languagesSpoken: { chinese: 22, spanish: 18, tagalog: 12, vietnamese: 4, korean: 1, russian: 0 },
    },
    ethnicity: { distribution: { white: 15, asian: 42, hispanic: 32, black: 5, pacific: 2, multiracial: 4 } },
    age: { under18: 20, seniors: 16, distribution: { '18-24': 8, '25-34': 16, '35-44': 18, '45-54': 14, '55-64': 8 } },
  },
  financial_district: {
    population: { total: 4200 },
    economic: {
      medianHouseholdIncome: 148000,
      amiDistribution: { extremelyLow: 6, veryLow: 4, low: 8, moderate: 16, aboveModerate: 66 },
    },
    housing: { renterOccupied: 78 },
    language: {
      limitedEnglishProficiency: 12,
      languagesSpoken: { chinese: 10, spanish: 4, tagalog: 1, vietnamese: 1, korean: 2, russian: 0 },
    },
    ethnicity: { distribution: { white: 52, asian: 32, hispanic: 8, black: 3, pacific: 1, multiracial: 4 } },
    age: { under18: 3, seniors: 10, distribution: { '18-24': 8, '25-34': 38, '35-44': 25, '45-54': 10, '55-64': 6 } },
  },
  glen_park: {
    population: { total: 9800 },
    economic: {
      medianHouseholdIncome: 152000,
      amiDistribution: { extremelyLow: 5, veryLow: 4, low: 9, moderate: 18, aboveModerate: 64 },
    },
    housing: { renterOccupied: 32 },
    language: {
      limitedEnglishProficiency: 8,
      languagesSpoken: { chinese: 6, spanish: 8, tagalog: 2, vietnamese: 1, korean: 1, russian: 0 },
    },
    ethnicity: { distribution: { white: 62, asian: 16, hispanic: 14, black: 3, pacific: 1, multiracial: 4 } },
    age: { under18: 14, seniors: 14, distribution: { '18-24': 5, '25-34': 20, '35-44': 24, '45-54': 14, '55-64': 9 } },
  },
  haight_ashbury: {
    population: { total: 16200 },
    economic: {
      medianHouseholdIncome: 118000,
      amiDistribution: { extremelyLow: 10, veryLow: 8, low: 14, moderate: 22, aboveModerate: 46 },
    },
    housing: { renterOccupied: 68 },
    language: {
      limitedEnglishProficiency: 7,
      languagesSpoken: { chinese: 4, spanish: 6, tagalog: 1, vietnamese: 0, korean: 1, russian: 1 },
    },
    ethnicity: { distribution: { white: 68, asian: 12, hispanic: 10, black: 5, pacific: 1, multiracial: 4 } },
    age: { under18: 8, seniors: 10, distribution: { '18-24': 12, '25-34': 30, '35-44': 20, '45-54': 12, '55-64': 8 } },
  },
  hayes_valley: {
    population: { total: 10800 },
    economic: {
      medianHouseholdIncome: 135000,
      amiDistribution: { extremelyLow: 8, veryLow: 6, low: 11, moderate: 20, aboveModerate: 55 },
    },
    housing: { renterOccupied: 72 },
    language: {
      limitedEnglishProficiency: 9,
      languagesSpoken: { chinese: 5, spanish: 7, tagalog: 2, vietnamese: 1, korean: 1, russian: 1 },
    },
    ethnicity: { distribution: { white: 58, asian: 16, hispanic: 12, black: 8, pacific: 1, multiracial: 5 } },
    age: { under18: 6, seniors: 10, distribution: { '18-24': 8, '25-34': 32, '35-44': 24, '45-54': 12, '55-64': 8 } },
  },
  ingleside: {
    population: { total: 28400 },
    economic: {
      medianHouseholdIncome: 85000,
      amiDistribution: { extremelyLow: 12, veryLow: 10, low: 18, moderate: 28, aboveModerate: 32 },
    },
    housing: { renterOccupied: 38 },
    language: {
      limitedEnglishProficiency: 28,
      languagesSpoken: { chinese: 18, spanish: 14, tagalog: 10, vietnamese: 3, korean: 1, russian: 0 },
    },
    ethnicity: { distribution: { white: 18, asian: 45, hispanic: 22, black: 8, pacific: 3, multiracial: 4 } },
    age: { under18: 18, seniors: 18, distribution: { '18-24': 7, '25-34': 15, '35-44': 18, '45-54': 14, '55-64': 10 } },
  },
  inner_richmond: {
    population: { total: 25600 },
    economic: {
      medianHouseholdIncome: 108000,
      amiDistribution: { extremelyLow: 10, veryLow: 8, low: 14, moderate: 24, aboveModerate: 44 },
    },
    housing: { renterOccupied: 58 },
    language: {
      limitedEnglishProficiency: 28,
      languagesSpoken: { chinese: 32, spanish: 5, tagalog: 2, vietnamese: 2, korean: 3, russian: 4 },
    },
    ethnicity: { distribution: { white: 38, asian: 48, hispanic: 8, black: 2, pacific: 1, multiracial: 3 } },
    age: { under18: 12, seniors: 18, distribution: { '18-24': 8, '25-34': 22, '35-44': 18, '45-54': 12, '55-64': 10 } },
  },
  inner_sunset: {
    population: { total: 28900 },
    economic: {
      medianHouseholdIncome: 115000,
      amiDistribution: { extremelyLow: 8, veryLow: 7, low: 13, moderate: 24, aboveModerate: 48 },
    },
    housing: { renterOccupied: 52 },
    language: {
      limitedEnglishProficiency: 22,
      languagesSpoken: { chinese: 25, spanish: 4, tagalog: 2, vietnamese: 2, korean: 2, russian: 2 },
    },
    ethnicity: { distribution: { white: 42, asian: 45, hispanic: 7, black: 2, pacific: 1, multiracial: 3 } },
    age: { under18: 14, seniors: 16, distribution: { '18-24': 10, '25-34': 22, '35-44': 18, '45-54': 12, '55-64': 8 } },
  },
  japantown: {
    population: { total: 4600 },
    economic: {
      medianHouseholdIncome: 92000,
      amiDistribution: { extremelyLow: 14, veryLow: 10, low: 16, moderate: 24, aboveModerate: 36 },
    },
    housing: { renterOccupied: 72 },
    language: {
      limitedEnglishProficiency: 18,
      languagesSpoken: { chinese: 8, spanish: 5, tagalog: 3, vietnamese: 2, korean: 4, russian: 2 },
    },
    ethnicity: { distribution: { white: 42, asian: 38, hispanic: 10, black: 5, pacific: 2, multiracial: 3 } },
    age: { under18: 6, seniors: 22, distribution: { '18-24': 8, '25-34': 22, '35-44': 18, '45-54': 14, '55-64': 10 } },
  },
  lakeshore: {
    population: { total: 12800 },
    economic: {
      medianHouseholdIncome: 95000,
      amiDistribution: { extremelyLow: 10, veryLow: 8, low: 16, moderate: 28, aboveModerate: 38 },
    },
    housing: { renterOccupied: 42 },
    language: {
      limitedEnglishProficiency: 25,
      languagesSpoken: { chinese: 22, spanish: 8, tagalog: 8, vietnamese: 2, korean: 2, russian: 1 },
    },
    ethnicity: { distribution: { white: 28, asian: 48, hispanic: 14, black: 5, pacific: 2, multiracial: 3 } },
    age: { under18: 14, seniors: 20, distribution: { '18-24': 10, '25-34': 16, '35-44': 16, '45-54': 14, '55-64': 10 } },
  },
  laurel_heights: {
    population: { total: 8400 },
    economic: {
      medianHouseholdIncome: 165000,
      amiDistribution: { extremelyLow: 5, veryLow: 4, low: 8, moderate: 16, aboveModerate: 67 },
    },
    housing: { renterOccupied: 45 },
    language: {
      limitedEnglishProficiency: 12,
      languagesSpoken: { chinese: 10, spanish: 4, tagalog: 2, vietnamese: 1, korean: 2, russian: 2 },
    },
    ethnicity: { distribution: { white: 62, asian: 24, hispanic: 6, black: 3, pacific: 1, multiracial: 4 } },
    age: { under18: 12, seniors: 16, distribution: { '18-24': 5, '25-34': 20, '35-44': 22, '45-54': 14, '55-64': 11 } },
  },
  marina: {
    population: { total: 24200 },
    economic: {
      medianHouseholdIncome: 175000,
      amiDistribution: { extremelyLow: 4, veryLow: 4, low: 7, moderate: 14, aboveModerate: 71 },
    },
    housing: { renterOccupied: 68 },
    language: {
      limitedEnglishProficiency: 6,
      languagesSpoken: { chinese: 4, spanish: 5, tagalog: 1, vietnamese: 0, korean: 1, russian: 1 },
    },
    ethnicity: { distribution: { white: 78, asian: 12, hispanic: 5, black: 1, pacific: 0, multiracial: 4 } },
    age: { under18: 6, seniors: 12, distribution: { '18-24': 8, '25-34': 35, '35-44': 22, '45-54': 10, '55-64': 7 } },
  },
  mission: {
    population: { total: 58200 },
    economic: {
      medianHouseholdIncome: 88000,
      amiDistribution: { extremelyLow: 18, veryLow: 12, low: 16, moderate: 22, aboveModerate: 32 },
    },
    housing: { renterOccupied: 72 },
    language: {
      limitedEnglishProficiency: 32,
      languagesSpoken: { chinese: 6, spanish: 42, tagalog: 3, vietnamese: 2, korean: 1, russian: 0 },
    },
    ethnicity: { distribution: { white: 38, asian: 12, hispanic: 42, black: 3, pacific: 1, multiracial: 4 } },
    age: { under18: 14, seniors: 10, distribution: { '18-24': 10, '25-34': 28, '35-44': 20, '45-54': 10, '55-64': 8 } },
  },
  mission_bay: {
    population: { total: 12600 },
    economic: {
      medianHouseholdIncome: 185000,
      amiDistribution: { extremelyLow: 4, veryLow: 3, low: 6, moderate: 14, aboveModerate: 73 },
    },
    housing: { renterOccupied: 65 },
    language: {
      limitedEnglishProficiency: 8,
      languagesSpoken: { chinese: 8, spanish: 4, tagalog: 1, vietnamese: 1, korean: 1, russian: 0 },
    },
    ethnicity: { distribution: { white: 52, asian: 32, hispanic: 8, black: 3, pacific: 1, multiracial: 4 } },
    age: { under18: 8, seniors: 6, distribution: { '18-24': 6, '25-34': 38, '35-44': 28, '45-54': 10, '55-64': 4 } },
  },
  nob_hill: {
    population: { total: 18900 },
    economic: {
      medianHouseholdIncome: 125000,
      amiDistribution: { extremelyLow: 10, veryLow: 8, low: 12, moderate: 18, aboveModerate: 52 },
    },
    housing: { renterOccupied: 75 },
    language: {
      limitedEnglishProficiency: 18,
      languagesSpoken: { chinese: 15, spanish: 6, tagalog: 2, vietnamese: 2, korean: 2, russian: 2 },
    },
    ethnicity: { distribution: { white: 55, asian: 28, hispanic: 8, black: 4, pacific: 1, multiracial: 4 } },
    age: { under18: 5, seniors: 18, distribution: { '18-24': 8, '25-34': 26, '35-44': 20, '45-54': 13, '55-64': 10 } },
  },
  noe_valley: {
    population: { total: 22400 },
    economic: {
      medianHouseholdIncome: 195000,
      amiDistribution: { extremelyLow: 4, veryLow: 3, low: 6, moderate: 12, aboveModerate: 75 },
    },
    housing: { renterOccupied: 35 },
    language: {
      limitedEnglishProficiency: 6,
      languagesSpoken: { chinese: 5, spanish: 6, tagalog: 1, vietnamese: 0, korean: 1, russian: 0 },
    },
    ethnicity: { distribution: { white: 72, asian: 12, hispanic: 10, black: 2, pacific: 0, multiracial: 4 } },
    age: { under18: 18, seniors: 10, distribution: { '18-24': 4, '25-34': 20, '35-44': 28, '45-54': 12, '55-64': 8 } },
  },
  north_beach: {
    population: { total: 14800 },
    economic: {
      medianHouseholdIncome: 118000,
      amiDistribution: { extremelyLow: 10, veryLow: 8, low: 12, moderate: 20, aboveModerate: 50 },
    },
    housing: { renterOccupied: 72 },
    language: {
      limitedEnglishProficiency: 22,
      languagesSpoken: { chinese: 25, spanish: 6, tagalog: 2, vietnamese: 2, korean: 1, russian: 1 },
    },
    ethnicity: { distribution: { white: 52, asian: 32, hispanic: 8, black: 3, pacific: 1, multiracial: 4 } },
    age: { under18: 6, seniors: 18, distribution: { '18-24': 8, '25-34': 25, '35-44': 20, '45-54': 13, '55-64': 10 } },
  },
  oceanview: {
    population: { total: 15200 },
    economic: {
      medianHouseholdIncome: 68000,
      amiDistribution: { extremelyLow: 16, veryLow: 12, low: 20, moderate: 26, aboveModerate: 26 },
    },
    housing: { renterOccupied: 42 },
    language: {
      limitedEnglishProficiency: 38,
      languagesSpoken: { chinese: 25, spanish: 16, tagalog: 14, vietnamese: 4, korean: 1, russian: 0 },
    },
    ethnicity: { distribution: { white: 10, asian: 48, hispanic: 25, black: 10, pacific: 3, multiracial: 4 } },
    age: { under18: 20, seniors: 16, distribution: { '18-24': 8, '25-34': 16, '35-44': 18, '45-54': 13, '55-64': 9 } },
  },
  outer_mission: {
    population: { total: 22800 },
    economic: {
      medianHouseholdIncome: 72000,
      amiDistribution: { extremelyLow: 14, veryLow: 12, low: 20, moderate: 28, aboveModerate: 26 },
    },
    housing: { renterOccupied: 45 },
    language: {
      limitedEnglishProficiency: 35,
      languagesSpoken: { chinese: 15, spanish: 28, tagalog: 10, vietnamese: 3, korean: 1, russian: 0 },
    },
    ethnicity: { distribution: { white: 15, asian: 35, hispanic: 40, black: 4, pacific: 2, multiracial: 4 } },
    age: { under18: 18, seniors: 14, distribution: { '18-24': 9, '25-34': 18, '35-44': 18, '45-54': 14, '55-64': 9 } },
  },
  outer_richmond: {
    population: { total: 45200 },
    economic: {
      medianHouseholdIncome: 95000,
      amiDistribution: { extremelyLow: 12, veryLow: 10, low: 16, moderate: 26, aboveModerate: 36 },
    },
    housing: { renterOccupied: 52 },
    language: {
      limitedEnglishProficiency: 35,
      languagesSpoken: { chinese: 42, spanish: 4, tagalog: 3, vietnamese: 3, korean: 3, russian: 6 },
    },
    ethnicity: { distribution: { white: 32, asian: 55, hispanic: 6, black: 2, pacific: 1, multiracial: 4 } },
    age: { under18: 14, seniors: 22, distribution: { '18-24': 7, '25-34': 18, '35-44': 16, '45-54': 13, '55-64': 10 } },
  },
  outer_sunset: {
    population: { total: 72400 },
    economic: {
      medianHouseholdIncome: 98000,
      amiDistribution: { extremelyLow: 10, veryLow: 9, low: 16, moderate: 28, aboveModerate: 37 },
    },
    housing: { renterOccupied: 42 },
    language: {
      limitedEnglishProficiency: 32,
      languagesSpoken: { chinese: 38, spanish: 5, tagalog: 4, vietnamese: 3, korean: 2, russian: 2 },
    },
    ethnicity: { distribution: { white: 32, asian: 55, hispanic: 7, black: 2, pacific: 1, multiracial: 3 } },
    age: { under18: 16, seniors: 20, distribution: { '18-24': 8, '25-34': 16, '35-44': 18, '45-54': 13, '55-64': 9 } },
  },
  pacific_heights: {
    population: { total: 21800 },
    economic: {
      medianHouseholdIncome: 210000,
      amiDistribution: { extremelyLow: 4, veryLow: 3, low: 5, moderate: 10, aboveModerate: 78 },
    },
    housing: { renterOccupied: 55 },
    language: {
      limitedEnglishProficiency: 8,
      languagesSpoken: { chinese: 6, spanish: 5, tagalog: 2, vietnamese: 1, korean: 1, russian: 2 },
    },
    ethnicity: { distribution: { white: 78, asian: 12, hispanic: 4, black: 2, pacific: 0, multiracial: 4 } },
    age: { under18: 10, seniors: 16, distribution: { '18-24': 6, '25-34': 22, '35-44': 22, '45-54': 14, '55-64': 10 } },
  },
  parkside: {
    population: { total: 28600 },
    economic: {
      medianHouseholdIncome: 105000,
      amiDistribution: { extremelyLow: 9, veryLow: 8, low: 14, moderate: 28, aboveModerate: 41 },
    },
    housing: { renterOccupied: 38 },
    language: {
      limitedEnglishProficiency: 28,
      languagesSpoken: { chinese: 32, spanish: 5, tagalog: 4, vietnamese: 2, korean: 2, russian: 2 },
    },
    ethnicity: { distribution: { white: 35, asian: 52, hispanic: 7, black: 2, pacific: 1, multiracial: 3 } },
    age: { under18: 16, seniors: 20, distribution: { '18-24': 7, '25-34': 16, '35-44': 18, '45-54': 13, '55-64': 10 } },
  },
  portola: {
    population: { total: 15800 },
    economic: {
      medianHouseholdIncome: 78000,
      amiDistribution: { extremelyLow: 14, veryLow: 10, low: 18, moderate: 28, aboveModerate: 30 },
    },
    housing: { renterOccupied: 42 },
    language: {
      limitedEnglishProficiency: 32,
      languagesSpoken: { chinese: 18, spanish: 20, tagalog: 12, vietnamese: 4, korean: 1, russian: 0 },
    },
    ethnicity: { distribution: { white: 15, asian: 42, hispanic: 32, black: 5, pacific: 2, multiracial: 4 } },
    age: { under18: 18, seniors: 16, distribution: { '18-24': 8, '25-34': 16, '35-44': 18, '45-54': 14, '55-64': 10 } },
  },
  potrero_hill: {
    population: { total: 14200 },
    economic: {
      medianHouseholdIncome: 155000,
      amiDistribution: { extremelyLow: 6, veryLow: 5, low: 9, moderate: 18, aboveModerate: 62 },
    },
    housing: { renterOccupied: 48 },
    language: {
      limitedEnglishProficiency: 8,
      languagesSpoken: { chinese: 5, spanish: 8, tagalog: 2, vietnamese: 1, korean: 1, russian: 0 },
    },
    ethnicity: { distribution: { white: 58, asian: 18, hispanic: 14, black: 5, pacific: 1, multiracial: 4 } },
    age: { under18: 10, seniors: 10, distribution: { '18-24': 6, '25-34': 28, '35-44': 26, '45-54': 12, '55-64': 8 } },
  },
  presidio: {
    population: { total: 3800 },
    economic: {
      medianHouseholdIncome: 145000,
      amiDistribution: { extremelyLow: 6, veryLow: 5, low: 10, moderate: 18, aboveModerate: 61 },
    },
    housing: { renterOccupied: 62 },
    language: {
      limitedEnglishProficiency: 5,
      languagesSpoken: { chinese: 4, spanish: 4, tagalog: 2, vietnamese: 0, korean: 1, russian: 1 },
    },
    ethnicity: { distribution: { white: 68, asian: 16, hispanic: 8, black: 4, pacific: 1, multiracial: 3 } },
    age: { under18: 14, seniors: 8, distribution: { '18-24': 8, '25-34': 28, '35-44': 24, '45-54': 12, '55-64': 6 } },
  },
  russian_hill: {
    population: { total: 16400 },
    economic: {
      medianHouseholdIncome: 155000,
      amiDistribution: { extremelyLow: 6, veryLow: 5, low: 9, moderate: 16, aboveModerate: 64 },
    },
    housing: { renterOccupied: 72 },
    language: {
      limitedEnglishProficiency: 10,
      languagesSpoken: { chinese: 8, spanish: 5, tagalog: 1, vietnamese: 1, korean: 1, russian: 3 },
    },
    ethnicity: { distribution: { white: 72, asian: 16, hispanic: 6, black: 2, pacific: 0, multiracial: 4 } },
    age: { under18: 4, seniors: 14, distribution: { '18-24': 8, '25-34': 32, '35-44': 22, '45-54': 12, '55-64': 8 } },
  },
  sea_cliff: {
    population: { total: 2800 },
    economic: {
      medianHouseholdIncome: 250000,
      amiDistribution: { extremelyLow: 3, veryLow: 2, low: 4, moderate: 8, aboveModerate: 83 },
    },
    housing: { renterOccupied: 22 },
    language: {
      limitedEnglishProficiency: 12,
      languagesSpoken: { chinese: 12, spanish: 3, tagalog: 2, vietnamese: 1, korean: 1, russian: 2 },
    },
    ethnicity: { distribution: { white: 62, asian: 28, hispanic: 4, black: 1, pacific: 1, multiracial: 4 } },
    age: { under18: 16, seniors: 18, distribution: { '18-24': 5, '25-34': 14, '35-44': 22, '45-54': 14, '55-64': 11 } },
  },
  soma: {
    population: { total: 32800 },
    economic: {
      medianHouseholdIncome: 95000,
      amiDistribution: { extremelyLow: 18, veryLow: 12, low: 14, moderate: 18, aboveModerate: 38 },
    },
    housing: { renterOccupied: 78 },
    language: {
      limitedEnglishProficiency: 18,
      languagesSpoken: { chinese: 10, spanish: 10, tagalog: 5, vietnamese: 3, korean: 2, russian: 1 },
    },
    ethnicity: { distribution: { white: 45, asian: 28, hispanic: 14, black: 8, pacific: 2, multiracial: 3 } },
    age: { under18: 5, seniors: 12, distribution: { '18-24': 10, '25-34': 35, '35-44': 22, '45-54': 10, '55-64': 6 } },
  },
  south_beach: {
    population: { total: 8600 },
    economic: {
      medianHouseholdIncome: 175000,
      amiDistribution: { extremelyLow: 4, veryLow: 4, low: 7, moderate: 15, aboveModerate: 70 },
    },
    housing: { renterOccupied: 65 },
    language: {
      limitedEnglishProficiency: 8,
      languagesSpoken: { chinese: 8, spanish: 4, tagalog: 1, vietnamese: 1, korean: 1, russian: 0 },
    },
    ethnicity: { distribution: { white: 55, asian: 30, hispanic: 7, black: 3, pacific: 1, multiracial: 4 } },
    age: { under18: 6, seniors: 8, distribution: { '18-24': 6, '25-34': 38, '35-44': 26, '45-54': 10, '55-64': 6 } },
  },
  stonestown: {
    population: { total: 8200 },
    economic: {
      medianHouseholdIncome: 85000,
      amiDistribution: { extremelyLow: 12, veryLow: 10, low: 16, moderate: 26, aboveModerate: 36 },
    },
    housing: { renterOccupied: 55 },
    language: {
      limitedEnglishProficiency: 22,
      languagesSpoken: { chinese: 22, spanish: 6, tagalog: 6, vietnamese: 2, korean: 2, russian: 1 },
    },
    ethnicity: { distribution: { white: 32, asian: 50, hispanic: 10, black: 3, pacific: 2, multiracial: 3 } },
    age: { under18: 10, seniors: 18, distribution: { '18-24': 14, '25-34': 18, '35-44': 16, '45-54': 14, '55-64': 10 } },
  },
  tenderloin: {
    population: { total: 27600 },
    economic: {
      medianHouseholdIncome: 28000,
      amiDistribution: { extremelyLow: 52, veryLow: 18, low: 14, moderate: 10, aboveModerate: 6 },
    },
    housing: { renterOccupied: 94 },
    language: {
      limitedEnglishProficiency: 42,
      languagesSpoken: { chinese: 12, spanish: 18, tagalog: 5, vietnamese: 15, korean: 2, russian: 2 },
    },
    ethnicity: { distribution: { white: 28, asian: 35, hispanic: 20, black: 12, pacific: 2, multiracial: 3 } },
    age: { under18: 8, seniors: 16, distribution: { '18-24': 10, '25-34': 22, '35-44': 20, '45-54': 14, '55-64': 10 } },
  },
  treasure_island: {
    population: { total: 3200 },
    economic: {
      medianHouseholdIncome: 55000,
      amiDistribution: { extremelyLow: 22, veryLow: 16, low: 20, moderate: 24, aboveModerate: 18 },
    },
    housing: { renterOccupied: 72 },
    language: {
      limitedEnglishProficiency: 15,
      languagesSpoken: { chinese: 8, spanish: 10, tagalog: 5, vietnamese: 2, korean: 1, russian: 1 },
    },
    ethnicity: { distribution: { white: 35, asian: 25, hispanic: 20, black: 12, pacific: 4, multiracial: 4 } },
    age: { under18: 18, seniors: 8, distribution: { '18-24': 12, '25-34': 26, '35-44': 20, '45-54': 10, '55-64': 6 } },
  },
  twin_peaks: {
    population: { total: 5200 },
    economic: {
      medianHouseholdIncome: 145000,
      amiDistribution: { extremelyLow: 6, veryLow: 5, low: 10, moderate: 18, aboveModerate: 61 },
    },
    housing: { renterOccupied: 32 },
    language: {
      limitedEnglishProficiency: 10,
      languagesSpoken: { chinese: 8, spanish: 6, tagalog: 2, vietnamese: 1, korean: 1, russian: 0 },
    },
    ethnicity: { distribution: { white: 58, asian: 22, hispanic: 12, black: 3, pacific: 1, multiracial: 4 } },
    age: { under18: 10, seniors: 18, distribution: { '18-24': 5, '25-34': 18, '35-44': 22, '45-54': 16, '55-64': 11 } },
  },
  visitacion_valley: {
    population: { total: 18400 },
    economic: {
      medianHouseholdIncome: 62000,
      amiDistribution: { extremelyLow: 18, veryLow: 14, low: 22, moderate: 26, aboveModerate: 20 },
    },
    housing: { renterOccupied: 48 },
    language: {
      limitedEnglishProficiency: 42,
      languagesSpoken: { chinese: 28, spanish: 14, tagalog: 16, vietnamese: 5, korean: 1, russian: 0 },
    },
    ethnicity: { distribution: { white: 8, asian: 55, hispanic: 22, black: 8, pacific: 4, multiracial: 3 } },
    age: { under18: 20, seniors: 16, distribution: { '18-24': 8, '25-34': 16, '35-44': 18, '45-54': 13, '55-64': 9 } },
  },
  west_portal: {
    population: { total: 8800 },
    economic: {
      medianHouseholdIncome: 145000,
      amiDistribution: { extremelyLow: 6, veryLow: 5, low: 10, moderate: 18, aboveModerate: 61 },
    },
    housing: { renterOccupied: 32 },
    language: {
      limitedEnglishProficiency: 12,
      languagesSpoken: { chinese: 12, spanish: 5, tagalog: 3, vietnamese: 1, korean: 1, russian: 1 },
    },
    ethnicity: { distribution: { white: 55, asian: 28, hispanic: 10, black: 2, pacific: 1, multiracial: 4 } },
    age: { under18: 16, seniors: 16, distribution: { '18-24': 5, '25-34': 18, '35-44': 22, '45-54': 14, '55-64': 9 } },
  },
  western_addition: {
    population: { total: 24800 },
    economic: {
      medianHouseholdIncome: 78000,
      amiDistribution: { extremelyLow: 20, veryLow: 12, low: 16, moderate: 22, aboveModerate: 30 },
    },
    housing: { renterOccupied: 72 },
    language: {
      limitedEnglishProficiency: 14,
      languagesSpoken: { chinese: 6, spanish: 8, tagalog: 3, vietnamese: 2, korean: 2, russian: 2 },
    },
    ethnicity: { distribution: { white: 42, asian: 18, hispanic: 12, black: 22, pacific: 2, multiracial: 4 } },
    age: { under18: 10, seniors: 16, distribution: { '18-24': 10, '25-34': 26, '35-44': 18, '45-54': 12, '55-64': 8 } },
  },
};

// =============================================================================
// EXPORT FUNCTIONS
// =============================================================================

/**
 * Get census data for all SF neighborhoods
 * Returns a map keyed by neighborhood ID
 */
export function getSFCensusData(): SFCensusDataMap {
  return SF_CENSUS_DATA;
}

/**
 * Get census data for a specific neighborhood
 */
export function getNeighborhoodCensusData(neighborhood: SFNeighborhood): NeighborhoodCensusData | undefined {
  return SF_CENSUS_DATA[neighborhood];
}

/**
 * Get neighborhoods by income level
 */
export function getNeighborhoodsByIncome(minIncome: number, maxIncome: number): SFNeighborhood[] {
  return (Object.entries(SF_CENSUS_DATA) as [SFNeighborhood, NeighborhoodCensusData][])
    .filter(([, data]) =>
      data.economic.medianHouseholdIncome >= minIncome &&
      data.economic.medianHouseholdIncome <= maxIncome
    )
    .map(([id]) => id);
}

/**
 * Get neighborhoods with high concentration of a specific language
 */
export function getNeighborhoodsByLanguage(
  language: keyof NeighborhoodCensusData['language']['languagesSpoken'],
  minPercentage: number = 10
): SFNeighborhood[] {
  return (Object.entries(SF_CENSUS_DATA) as [SFNeighborhood, NeighborhoodCensusData][])
    .filter(([, data]) => data.language.languagesSpoken[language] >= minPercentage)
    .sort((a, b) => b[1].language.languagesSpoken[language] - a[1].language.languagesSpoken[language])
    .map(([id]) => id);
}

/**
 * Get neighborhoods with high concentration of a specific ethnicity
 */
export function getNeighborhoodsByEthnicity(
  ethnicity: keyof NeighborhoodCensusData['ethnicity']['distribution'],
  minPercentage: number = 20
): SFNeighborhood[] {
  return (Object.entries(SF_CENSUS_DATA) as [SFNeighborhood, NeighborhoodCensusData][])
    .filter(([, data]) => data.ethnicity.distribution[ethnicity] >= minPercentage)
    .sort((a, b) => b[1].ethnicity.distribution[ethnicity] - a[1].ethnicity.distribution[ethnicity])
    .map(([id]) => id);
}

// =============================================================================
// ASYNC CENSUS DATA (from Census Bureau API)
// =============================================================================

/**
 * Cache for live census data from the API
 */
let censusCache: {
  data: SFCensusDataMap;
  fetchedAt: Date;
  expiresAt: Date;
} | null = null;

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Transform comprehensive census data to the simplified format used by map components
 */
function transformToSimpleFormat(fullData: FullCensusData): NeighborhoodCensusData {
  return {
    population: {
      total: fullData.population.total,
    },
    economic: {
      medianHouseholdIncome: fullData.economic.medianHouseholdIncome,
      amiDistribution: {
        extremelyLow: fullData.economic.amiDistribution.extremelyLow,
        veryLow: fullData.economic.amiDistribution.veryLow,
        low: fullData.economic.amiDistribution.low,
        moderate: fullData.economic.amiDistribution.moderate,
        aboveModerate: fullData.economic.amiDistribution.aboveModerate,
      },
    },
    housing: {
      renterOccupied: fullData.housing.renterOccupied,
    },
    language: {
      limitedEnglishProficiency: fullData.language.limitedEnglishProficiency,
      languagesSpoken: {
        chinese: fullData.language.languagesSpoken.chinese,
        spanish: fullData.language.languagesSpoken.spanish,
        tagalog: fullData.language.languagesSpoken.tagalog,
        vietnamese: fullData.language.languagesSpoken.vietnamese,
        korean: fullData.language.languagesSpoken.korean,
        russian: fullData.language.languagesSpoken.russian,
      },
    },
    ethnicity: {
      distribution: {
        white: fullData.ethnicity.distribution.white,
        asian: fullData.ethnicity.distribution.asian,
        hispanic: fullData.ethnicity.distribution.hispanic,
        black: fullData.ethnicity.distribution.black,
        pacific: fullData.ethnicity.distribution.pacificIslander,
        multiracial: fullData.ethnicity.distribution.multiracial,
      },
    },
    age: {
      under18: fullData.age.under18,
      seniors: fullData.age.seniors,
      distribution: {
        '18-24': fullData.age.distribution.age18To24,
        '25-34': fullData.age.distribution.age25To34,
        '35-44': fullData.age.distribution.age35To44,
        '45-54': fullData.age.distribution.age45To54,
        '55-64': fullData.age.distribution.age55To64,
      },
    },
  };
}

/**
 * Fetch live census data from the Census Bureau API
 *
 * This function fetches real ACS 5-year estimates and aggregates them
 * to SF neighborhood level using population-weighted averages.
 *
 * Features:
 * - 24-hour caching to minimize API calls
 * - Automatic fallback to sample data on error
 * - Transforms comprehensive data to map-friendly format
 *
 * @param config - Optional API configuration (year, API key)
 * @returns Census data for all SF neighborhoods
 */
export async function fetchSFCensusData(
  config?: CensusApiConfig
): Promise<SFCensusDataMap> {
  // Check cache first
  const now = new Date();
  if (censusCache && now < censusCache.expiresAt) {
    console.log('[Census] Returning cached data, fetched at:', censusCache.fetchedAt.toISOString());
    return censusCache.data;
  }

  console.log('[Census] Fetching live data from Census Bureau API...');

  try {
    // Fetch and aggregate tract data to neighborhoods
    const fullData = await fetchFromAggregator(config);

    // Transform to simplified format for map components
    const simpleData: Partial<SFCensusDataMap> = {};
    for (const [neighborhood, data] of Object.entries(fullData)) {
      simpleData[neighborhood as SFNeighborhood] = transformToSimpleFormat(data);
    }

    // Cache the result
    censusCache = {
      data: simpleData as SFCensusDataMap,
      fetchedAt: now,
      expiresAt: new Date(now.getTime() + CACHE_TTL_MS),
    };

    console.log('[Census] Live data fetched and cached for 24 hours');
    console.log('[Census] Neighborhoods loaded:', Object.keys(simpleData).length);

    return simpleData as SFCensusDataMap;
  } catch (error) {
    console.error('[Census] Failed to fetch live data:', error);
    console.log('[Census] Falling back to sample data');

    // Return sample data as fallback
    return getSFCensusData();
  }
}

/**
 * Check if the current census data is from the live API or sample data
 */
export function isCensusDataLive(): boolean {
  return censusCache !== null && new Date() < censusCache.expiresAt;
}

/**
 * Get metadata about the current census data cache
 */
export function getCensusDataInfo(): {
  source: 'live' | 'sample';
  fetchedAt?: Date;
  expiresAt?: Date;
} {
  if (censusCache && new Date() < censusCache.expiresAt) {
    return {
      source: 'live',
      fetchedAt: censusCache.fetchedAt,
      expiresAt: censusCache.expiresAt,
    };
  }
  return { source: 'sample' };
}

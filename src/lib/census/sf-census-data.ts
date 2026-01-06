/**
 * San Francisco Census Data
 *
 * Provides census data for SF neighborhoods from two sources:
 * 1. Real-time ACS data from Census Bureau API (async)
 * 2. Sample/fallback data for SSR and when API is unavailable (sync)
 *
 * Components should prefer the async version when possible for accurate data.
 */

import type { SFNeighborhood } from '@/types';
import type { NeighborhoodCensusData } from './types';
import { getNeighborhoodCensusData as fetchLiveCensusData, type CensusApiConfig } from './census-aggregator';

// =============================================================================
// LIVE DATA (ASYNC) - Fetches real ACS data from Census Bureau API
// =============================================================================

/**
 * Fetch live census data from Census Bureau API
 * Returns real ACS 5-year estimates aggregated to neighborhood level
 *
 * @param config - Optional API configuration (API key, year, dataset)
 * @param forceRefresh - Force a fresh fetch, bypassing cache
 */
export async function fetchSFCensusData(
  config: CensusApiConfig = {},
  forceRefresh = false
): Promise<Record<SFNeighborhood, NeighborhoodCensusData>> {
  try {
    return await fetchLiveCensusData(config, forceRefresh);
  } catch (error) {
    console.warn('Failed to fetch live census data, falling back to sample data:', error);
    return SF_CENSUS_DATA;
  }
}

/**
 * Fetch live census data for a specific neighborhood
 */
export async function fetchNeighborhoodCensusData(
  neighborhood: SFNeighborhood,
  config: CensusApiConfig = {}
): Promise<NeighborhoodCensusData> {
  try {
    const allData = await fetchLiveCensusData(config);
    return allData[neighborhood] ?? SF_CENSUS_DATA[neighborhood];
  } catch (error) {
    console.warn('Failed to fetch live census data, falling back to sample data:', error);
    return SF_CENSUS_DATA[neighborhood];
  }
}

// =============================================================================
// SAMPLE DATA (SYNC) - For SSR, fallback, and development
// =============================================================================

/**
 * Get sample census data for all SF neighborhoods (synchronous)
 * Use this for SSR or when async data is not available
 */
export function getSFCensusData(): Record<SFNeighborhood, NeighborhoodCensusData> {
  return SF_CENSUS_DATA;
}

/**
 * Get sample census data for a specific neighborhood (synchronous)
 */
export function getNeighborhoodCensusData(neighborhood: SFNeighborhood): NeighborhoodCensusData | undefined {
  return SF_CENSUS_DATA[neighborhood];
}

// =============================================================================
// RE-EXPORT TYPES
// =============================================================================

export type { CensusApiConfig } from './census-aggregator';

// Helper to create base census data with defaults
function createCensusData(
  neighborhood: SFNeighborhood,
  name: string,
  overrides: Partial<NeighborhoodCensusData>
): NeighborhoodCensusData {
  const base: NeighborhoodCensusData = {
    geoId: `sf-${neighborhood}`,
    geoType: 'neighborhood',
    name,
    neighborhood,
    tractCount: 3,
    tracts: [],
    dataYear: 2022,
    population: {
      total: 15000,
      density: 20000,
    },
    economic: {
      medianHouseholdIncome: 120000,
      medianFamilyIncome: 140000,
      perCapitaIncome: 65000,
      incomeDistribution: {
        under25k: 12,
        from25kTo50k: 10,
        from50kTo75k: 12,
        from75kTo100k: 14,
        from100kTo150k: 22,
        over150k: 30,
      },
      amiDistribution: {
        extremelyLow: 10,
        veryLow: 8,
        low: 12,
        moderate: 20,
        aboveModerate: 50,
      },
      povertyRate: 10,
      childPovertyRate: 12,
      seniorPovertyRate: 14,
      unemploymentRate: 4,
      laborForceParticipation: 70,
      publicAssistanceRate: 8,
      snapRate: 6,
      medicaidRate: 15,
    },
    housing: {
      ownerOccupied: 38,
      renterOccupied: 62,
      vacancyRate: 8,
      rentBurdenedRate: 35,
      severelyRentBurdened: 15,
      medianRent: 2800,
      medianHomeValue: 1400000,
      singleFamily: 25,
      multiFamily: 70,
      mobileHome: 0,
    },
    language: {
      englishOnly: 55,
      limitedEnglishProficiency: 22,
      languagesSpoken: {
        english: 55,
        spanish: 12,
        chinese: 20,
        tagalog: 4,
        vietnamese: 2,
        korean: 1,
        russian: 2,
        arabic: 0.5,
        other: 3.5,
      },
      linguisticallyIsolatedHouseholds: 8,
    },
    ethnicity: {
      distribution: {
        white: 40,
        black: 5,
        asian: 35,
        hispanic: 15,
        nativeAmerican: 0.3,
        pacificIslander: 0.4,
        multiracial: 4,
        other: 0.3,
      },
      foreignBorn: 35,
      recentImmigrants: 8,
      naturalizedCitizens: 20,
    },
    age: {
      medianAge: 38,
      distribution: {
        under5: 4,
        age5To17: 8,
        age18To24: 8,
        age25To34: 22,
        age35To44: 18,
        age45To54: 14,
        age55To64: 12,
        age65To74: 8,
        age75Plus: 6,
      },
      under18: 12,
      workingAge: 74,
      seniors: 14,
    },
    education: {
      distribution: {
        lessThanHighSchool: 8,
        highSchool: 12,
        someCollege: 15,
        associates: 5,
        bachelors: 32,
        graduate: 28,
      },
      highSchoolOrHigher: 92,
      bachelorsOrHigher: 60,
    },
    household: {
      totalHouseholds: 6000,
      averageHouseholdSize: 2.3,
      averageFamilySize: 3.1,
      types: {
        marriedCouple: 35,
        marriedWithChildren: 15,
        singleParent: 8,
        livingAlone: 35,
        nonFamilyHousehold: 7,
      },
      multigenerationalHouseholds: 5,
      householdsWithSeniors: 22,
      seniorsLivingAlone: 10,
      householdsWithChildren: 20,
    },
  };

  return { ...base, ...overrides } as NeighborhoodCensusData;
}

// =============================================================================
// NEIGHBORHOOD-SPECIFIC DATA
// =============================================================================

const SF_CENSUS_DATA: Record<SFNeighborhood, NeighborhoodCensusData> = {
  // MISSION - Latino working-class, gentrifying
  mission: createCensusData('mission', 'Mission', {
    population: { total: 45000, density: 35000 },
    economic: {
      medianHouseholdIncome: 85000,
      medianFamilyIncome: 75000,
      perCapitaIncome: 45000,
      incomeDistribution: { under25k: 18, from25kTo50k: 15, from50kTo75k: 14, from75kTo100k: 12, from100kTo150k: 18, over150k: 23 },
      amiDistribution: { extremelyLow: 15, veryLow: 12, low: 18, moderate: 22, aboveModerate: 33 },
      povertyRate: 14,
      childPovertyRate: 18,
      seniorPovertyRate: 20,
      unemploymentRate: 5,
      laborForceParticipation: 72,
      publicAssistanceRate: 12,
      snapRate: 10,
      medicaidRate: 22,
    },
    housing: {
      ownerOccupied: 22,
      renterOccupied: 78,
      vacancyRate: 4,
      rentBurdenedRate: 45,
      severelyRentBurdened: 22,
      medianRent: 2400,
      medianHomeValue: 1300000,
      singleFamily: 15,
      multiFamily: 82,
      mobileHome: 0,
      estimatedRentControlled: 65,
    },
    language: {
      englishOnly: 35,
      limitedEnglishProficiency: 32,
      languagesSpoken: { english: 35, spanish: 45, chinese: 8, tagalog: 3, vietnamese: 1, korean: 0.5, russian: 0.5, arabic: 0.5, other: 6.5 },
      linguisticallyIsolatedHouseholds: 15,
    },
    ethnicity: {
      distribution: { white: 28, black: 4, asian: 12, hispanic: 50, nativeAmerican: 0.5, pacificIslander: 0.5, multiracial: 4, other: 1 },
      hispanicBreakdown: { mexican: 55, centralAmerican: 30, southAmerican: 8, caribbean: 2, other: 5 },
      foreignBorn: 42,
      recentImmigrants: 12,
      naturalizedCitizens: 22,
    },
    age: {
      medianAge: 34,
      distribution: { under5: 5, age5To17: 10, age18To24: 10, age25To34: 28, age35To44: 18, age45To54: 12, age55To64: 9, age65To74: 5, age75Plus: 3 },
      under18: 15,
      workingAge: 77,
      seniors: 8,
    },
  }),

  // CHINATOWN - Dense, older Chinese immigrant population
  chinatown: createCensusData('chinatown', 'Chinatown', {
    population: { total: 15000, density: 80000 },
    economic: {
      medianHouseholdIncome: 32000,
      medianFamilyIncome: 38000,
      perCapitaIncome: 18000,
      incomeDistribution: { under25k: 45, from25kTo50k: 25, from50kTo75k: 12, from75kTo100k: 8, from100kTo150k: 6, over150k: 4 },
      amiDistribution: { extremelyLow: 40, veryLow: 20, low: 18, moderate: 12, aboveModerate: 10 },
      povertyRate: 32,
      childPovertyRate: 35,
      seniorPovertyRate: 38,
      unemploymentRate: 6,
      laborForceParticipation: 58,
      publicAssistanceRate: 28,
      snapRate: 25,
      medicaidRate: 45,
    },
    housing: {
      ownerOccupied: 12,
      renterOccupied: 88,
      vacancyRate: 3,
      rentBurdenedRate: 55,
      severelyRentBurdened: 32,
      medianRent: 1200,
      medianHomeValue: 800000,
      singleFamily: 5,
      multiFamily: 92,
      mobileHome: 0,
      estimatedRentControlled: 85,
    },
    language: {
      englishOnly: 8,
      limitedEnglishProficiency: 65,
      languagesSpoken: { english: 8, spanish: 2, chinese: 85, tagalog: 1, vietnamese: 1, korean: 0.5, russian: 0, arabic: 0, other: 2.5 },
      linguisticallyIsolatedHouseholds: 42,
    },
    ethnicity: {
      distribution: { white: 5, black: 1, asian: 88, hispanic: 3, nativeAmerican: 0, pacificIslander: 0.5, multiracial: 2, other: 0.5 },
      asianBreakdown: { chinese: 92, filipino: 2, vietnamese: 2, korean: 1, japanese: 1, indian: 0.5, other: 1.5 },
      foreignBorn: 72,
      recentImmigrants: 15,
      naturalizedCitizens: 38,
    },
    age: {
      medianAge: 48,
      distribution: { under5: 3, age5To17: 8, age18To24: 6, age25To34: 12, age35To44: 14, age45To54: 16, age55To64: 15, age65To74: 14, age75Plus: 12 },
      under18: 11,
      workingAge: 63,
      seniors: 26,
    },
    household: {
      totalHouseholds: 5500,
      averageHouseholdSize: 2.8,
      averageFamilySize: 3.4,
      types: { marriedCouple: 40, marriedWithChildren: 18, singleParent: 10, livingAlone: 25, nonFamilyHousehold: 7 },
      multigenerationalHouseholds: 18,
      householdsWithSeniors: 35,
      seniorsLivingAlone: 18,
      householdsWithChildren: 25,
    },
  }),

  // BAYVIEW-HUNTERS POINT - Black community, working class
  bayview_hunters_point: createCensusData('bayview_hunters_point', 'Bayview-Hunters Point', {
    population: { total: 38000, density: 12000 },
    economic: {
      medianHouseholdIncome: 52000,
      medianFamilyIncome: 58000,
      perCapitaIncome: 28000,
      incomeDistribution: { under25k: 28, from25kTo50k: 22, from50kTo75k: 18, from75kTo100k: 12, from100kTo150k: 12, over150k: 8 },
      amiDistribution: { extremelyLow: 25, veryLow: 18, low: 22, moderate: 18, aboveModerate: 17 },
      povertyRate: 24,
      childPovertyRate: 32,
      seniorPovertyRate: 22,
      unemploymentRate: 9,
      laborForceParticipation: 62,
      publicAssistanceRate: 22,
      snapRate: 20,
      medicaidRate: 35,
    },
    housing: {
      ownerOccupied: 35,
      renterOccupied: 65,
      vacancyRate: 6,
      rentBurdenedRate: 48,
      severelyRentBurdened: 25,
      medianRent: 1800,
      medianHomeValue: 750000,
      singleFamily: 45,
      multiFamily: 50,
      mobileHome: 2,
      publicHousingUnits: 1200,
      section8Vouchers: 800,
    },
    language: {
      englishOnly: 62,
      limitedEnglishProficiency: 18,
      languagesSpoken: { english: 62, spanish: 12, chinese: 10, tagalog: 6, vietnamese: 2, korean: 0.5, russian: 0.5, arabic: 1, other: 6 },
      linguisticallyIsolatedHouseholds: 8,
    },
    ethnicity: {
      distribution: { white: 12, black: 32, asian: 28, hispanic: 20, nativeAmerican: 0.5, pacificIslander: 3, multiracial: 4, other: 0.5 },
      foreignBorn: 32,
      recentImmigrants: 8,
      naturalizedCitizens: 18,
    },
    age: {
      medianAge: 36,
      distribution: { under5: 6, age5To17: 14, age18To24: 10, age25To34: 18, age35To44: 16, age45To54: 14, age55To64: 10, age65To74: 7, age75Plus: 5 },
      under18: 20,
      workingAge: 68,
      seniors: 12,
    },
  }),

  // EXCELSIOR - Working-class immigrant families
  excelsior: createCensusData('excelsior', 'Excelsior', {
    population: { total: 42000, density: 22000 },
    economic: {
      medianHouseholdIncome: 72000,
      medianFamilyIncome: 78000,
      perCapitaIncome: 32000,
      incomeDistribution: { under25k: 15, from25kTo50k: 18, from50kTo75k: 20, from75kTo100k: 18, from100kTo150k: 18, over150k: 11 },
      amiDistribution: { extremelyLow: 12, veryLow: 14, low: 22, moderate: 28, aboveModerate: 24 },
      povertyRate: 12,
      childPovertyRate: 15,
      seniorPovertyRate: 18,
      unemploymentRate: 5,
      laborForceParticipation: 68,
      publicAssistanceRate: 14,
      snapRate: 12,
      medicaidRate: 28,
    },
    housing: {
      ownerOccupied: 48,
      renterOccupied: 52,
      vacancyRate: 3,
      rentBurdenedRate: 42,
      severelyRentBurdened: 20,
      medianRent: 2200,
      medianHomeValue: 950000,
      singleFamily: 55,
      multiFamily: 42,
      mobileHome: 1,
    },
    language: {
      englishOnly: 28,
      limitedEnglishProficiency: 38,
      languagesSpoken: { english: 28, spanish: 25, chinese: 22, tagalog: 15, vietnamese: 3, korean: 1, russian: 0.5, arabic: 0.5, other: 5 },
      linguisticallyIsolatedHouseholds: 18,
    },
    ethnicity: {
      distribution: { white: 12, black: 4, asian: 42, hispanic: 35, nativeAmerican: 0.3, pacificIslander: 2, multiracial: 4, other: 0.7 },
      asianBreakdown: { chinese: 45, filipino: 35, vietnamese: 8, korean: 3, japanese: 2, indian: 2, other: 5 },
      hispanicBreakdown: { mexican: 40, centralAmerican: 45, southAmerican: 8, caribbean: 2, other: 5 },
      foreignBorn: 52,
      recentImmigrants: 12,
      naturalizedCitizens: 28,
    },
    age: {
      medianAge: 40,
      distribution: { under5: 5, age5To17: 14, age18To24: 8, age25To34: 14, age35To44: 16, age45To54: 16, age55To64: 12, age65To74: 9, age75Plus: 6 },
      under18: 19,
      workingAge: 66,
      seniors: 15,
    },
    household: {
      totalHouseholds: 14000,
      averageHouseholdSize: 3.0,
      averageFamilySize: 3.6,
      types: { marriedCouple: 45, marriedWithChildren: 28, singleParent: 12, livingAlone: 18, nonFamilyHousehold: 5 },
      multigenerationalHouseholds: 15,
      householdsWithSeniors: 28,
      seniorsLivingAlone: 8,
      householdsWithChildren: 35,
    },
  }),

  // TENDERLOIN - Very low income, high need
  tenderloin: createCensusData('tenderloin', 'Tenderloin', {
    population: { total: 28000, density: 65000 },
    economic: {
      medianHouseholdIncome: 28000,
      medianFamilyIncome: 32000,
      perCapitaIncome: 22000,
      incomeDistribution: { under25k: 52, from25kTo50k: 22, from50kTo75k: 10, from75kTo100k: 6, from100kTo150k: 5, over150k: 5 },
      amiDistribution: { extremelyLow: 48, veryLow: 18, low: 14, moderate: 10, aboveModerate: 10 },
      povertyRate: 38,
      childPovertyRate: 45,
      seniorPovertyRate: 35,
      unemploymentRate: 12,
      laborForceParticipation: 52,
      publicAssistanceRate: 35,
      snapRate: 32,
      medicaidRate: 52,
    },
    housing: {
      ownerOccupied: 5,
      renterOccupied: 95,
      vacancyRate: 5,
      rentBurdenedRate: 58,
      severelyRentBurdened: 38,
      medianRent: 1100,
      medianHomeValue: 650000,
      singleFamily: 2,
      multiFamily: 95,
      mobileHome: 0,
      estimatedRentControlled: 75,
      publicHousingUnits: 800,
      section8Vouchers: 1500,
    },
    language: {
      englishOnly: 45,
      limitedEnglishProficiency: 28,
      languagesSpoken: { english: 45, spanish: 15, chinese: 12, tagalog: 5, vietnamese: 8, korean: 2, russian: 3, arabic: 3, other: 7 },
      linguisticallyIsolatedHouseholds: 15,
    },
    ethnicity: {
      distribution: { white: 32, black: 18, asian: 28, hispanic: 15, nativeAmerican: 1, pacificIslander: 1, multiracial: 4, other: 1 },
      foreignBorn: 38,
      recentImmigrants: 12,
      naturalizedCitizens: 18,
    },
    age: {
      medianAge: 42,
      distribution: { under5: 4, age5To17: 8, age18To24: 8, age25To34: 18, age35To44: 16, age45To54: 18, age55To64: 14, age65To74: 8, age75Plus: 6 },
      under18: 12,
      workingAge: 74,
      seniors: 14,
    },
  }),

  // PACIFIC HEIGHTS - Affluent
  pacific_heights: createCensusData('pacific_heights', 'Pacific Heights', {
    population: { total: 22000, density: 18000 },
    economic: {
      medianHouseholdIncome: 185000,
      medianFamilyIncome: 220000,
      perCapitaIncome: 125000,
      incomeDistribution: { under25k: 5, from25kTo50k: 5, from50kTo75k: 6, from75kTo100k: 8, from100kTo150k: 18, over150k: 58 },
      amiDistribution: { extremelyLow: 4, veryLow: 3, low: 5, moderate: 10, aboveModerate: 78 },
      povertyRate: 5,
      childPovertyRate: 3,
      seniorPovertyRate: 6,
      unemploymentRate: 2,
      laborForceParticipation: 68,
      publicAssistanceRate: 2,
      snapRate: 1,
      medicaidRate: 4,
    },
    housing: {
      ownerOccupied: 52,
      renterOccupied: 48,
      vacancyRate: 8,
      rentBurdenedRate: 18,
      severelyRentBurdened: 8,
      medianRent: 3800,
      medianHomeValue: 3500000,
      singleFamily: 35,
      multiFamily: 62,
      mobileHome: 0,
    },
    language: {
      englishOnly: 75,
      limitedEnglishProficiency: 8,
      languagesSpoken: { english: 75, spanish: 5, chinese: 8, tagalog: 2, vietnamese: 0.5, korean: 1, russian: 2, arabic: 0.5, other: 6 },
      linguisticallyIsolatedHouseholds: 3,
    },
    ethnicity: {
      distribution: { white: 72, black: 2, asian: 18, hispanic: 4, nativeAmerican: 0.2, pacificIslander: 0.2, multiracial: 3, other: 0.6 },
      foreignBorn: 22,
      recentImmigrants: 5,
      naturalizedCitizens: 12,
    },
    age: {
      medianAge: 45,
      distribution: { under5: 4, age5To17: 10, age18To24: 5, age25To34: 12, age35To44: 18, age45To54: 18, age55To64: 14, age65To74: 10, age75Plus: 9 },
      under18: 14,
      workingAge: 67,
      seniors: 19,
    },
  }),

  // CASTRO - LGBTQ+ community
  castro: createCensusData('castro', 'Castro', {
    population: { total: 18000, density: 28000 },
    economic: {
      medianHouseholdIncome: 125000,
      medianFamilyIncome: 145000,
      perCapitaIncome: 85000,
      incomeDistribution: { under25k: 8, from25kTo50k: 8, from50kTo75k: 10, from75kTo100k: 14, from100kTo150k: 25, over150k: 35 },
      amiDistribution: { extremelyLow: 6, veryLow: 5, low: 10, moderate: 18, aboveModerate: 61 },
      povertyRate: 8,
      childPovertyRate: 5,
      seniorPovertyRate: 12,
      unemploymentRate: 3,
      laborForceParticipation: 74,
      publicAssistanceRate: 5,
      snapRate: 4,
      medicaidRate: 10,
    },
    housing: {
      ownerOccupied: 35,
      renterOccupied: 65,
      vacancyRate: 5,
      rentBurdenedRate: 32,
      severelyRentBurdened: 14,
      medianRent: 2900,
      medianHomeValue: 1600000,
      singleFamily: 22,
      multiFamily: 75,
      mobileHome: 0,
      estimatedRentControlled: 55,
    },
    language: {
      englishOnly: 78,
      limitedEnglishProficiency: 8,
      languagesSpoken: { english: 78, spanish: 8, chinese: 5, tagalog: 2, vietnamese: 0.5, korean: 0.5, russian: 1, arabic: 0.5, other: 4.5 },
      linguisticallyIsolatedHouseholds: 3,
    },
    ethnicity: {
      distribution: { white: 68, black: 4, asian: 12, hispanic: 10, nativeAmerican: 0.3, pacificIslander: 0.3, multiracial: 5, other: 0.4 },
      foreignBorn: 18,
      recentImmigrants: 4,
      naturalizedCitizens: 10,
    },
    age: {
      medianAge: 42,
      distribution: { under5: 2, age5To17: 4, age18To24: 6, age25To34: 22, age35To44: 20, age45To54: 18, age55To64: 14, age65To74: 8, age75Plus: 6 },
      under18: 6,
      workingAge: 80,
      seniors: 14,
    },
    household: {
      totalHouseholds: 9000,
      averageHouseholdSize: 1.8,
      averageFamilySize: 2.5,
      types: { marriedCouple: 25, marriedWithChildren: 5, singleParent: 3, livingAlone: 52, nonFamilyHousehold: 15 },
      multigenerationalHouseholds: 2,
      householdsWithSeniors: 18,
      seniorsLivingAlone: 12,
      householdsWithChildren: 8,
    },
  }),

  // Fill in remaining neighborhoods with reasonable defaults
  // In production, each would have accurate ACS data

  bernal_heights: createCensusData('bernal_heights', 'Bernal Heights', {
    economic: { ...createCensusData('bernal_heights', '', {}).economic, medianHouseholdIncome: 115000 },
    ethnicity: { distribution: { white: 45, black: 3, asian: 15, hispanic: 30, nativeAmerican: 0.3, pacificIslander: 0.4, multiracial: 5, other: 1.3 }, foreignBorn: 28, recentImmigrants: 6, naturalizedCitizens: 16 },
  }),

  civic_center: createCensusData('civic_center', 'Civic Center', {
    economic: { ...createCensusData('civic_center', '', {}).economic, medianHouseholdIncome: 45000, povertyRate: 28 },
  }),

  cole_valley: createCensusData('cole_valley', 'Cole Valley', {
    economic: { ...createCensusData('cole_valley', '', {}).economic, medianHouseholdIncome: 145000 },
  }),

  diamond_heights: createCensusData('diamond_heights', 'Diamond Heights', {
    economic: { ...createCensusData('diamond_heights', '', {}).economic, medianHouseholdIncome: 135000 },
  }),

  dogpatch: createCensusData('dogpatch', 'Dogpatch', {
    economic: { ...createCensusData('dogpatch', '', {}).economic, medianHouseholdIncome: 155000 },
  }),

  downtown: createCensusData('downtown', 'Downtown/Union Square', {
    economic: { ...createCensusData('downtown', '', {}).economic, medianHouseholdIncome: 95000 },
  }),

  financial_district: createCensusData('financial_district', 'Financial District', {
    economic: { ...createCensusData('financial_district', '', {}).economic, medianHouseholdIncome: 165000 },
  }),

  glen_park: createCensusData('glen_park', 'Glen Park', {
    economic: { ...createCensusData('glen_park', '', {}).economic, medianHouseholdIncome: 155000 },
  }),

  haight_ashbury: createCensusData('haight_ashbury', 'Haight-Ashbury', {
    economic: { ...createCensusData('haight_ashbury', '', {}).economic, medianHouseholdIncome: 105000 },
  }),

  hayes_valley: createCensusData('hayes_valley', 'Hayes Valley', {
    economic: { ...createCensusData('hayes_valley', '', {}).economic, medianHouseholdIncome: 125000 },
  }),

  ingleside: createCensusData('ingleside', 'Ingleside', {
    economic: { ...createCensusData('ingleside', '', {}).economic, medianHouseholdIncome: 78000 },
    ethnicity: { distribution: { white: 15, black: 8, asian: 35, hispanic: 35, nativeAmerican: 0.3, pacificIslander: 2, multiracial: 4, other: 0.7 }, foreignBorn: 45, recentImmigrants: 10, naturalizedCitizens: 25 },
  }),

  inner_richmond: createCensusData('inner_richmond', 'Inner Richmond', {
    economic: { ...createCensusData('inner_richmond', '', {}).economic, medianHouseholdIncome: 105000 },
    ethnicity: { distribution: { white: 42, black: 2, asian: 42, hispanic: 8, nativeAmerican: 0.2, pacificIslander: 0.3, multiracial: 5, other: 0.5 }, foreignBorn: 38, recentImmigrants: 8, naturalizedCitizens: 22 },
  }),

  inner_sunset: createCensusData('inner_sunset', 'Inner Sunset', {
    economic: { ...createCensusData('inner_sunset', '', {}).economic, medianHouseholdIncome: 115000 },
    ethnicity: { distribution: { white: 45, black: 2, asian: 40, hispanic: 7, nativeAmerican: 0.2, pacificIslander: 0.3, multiracial: 5, other: 0.5 }, foreignBorn: 35, recentImmigrants: 7, naturalizedCitizens: 20 },
  }),

  japantown: createCensusData('japantown', 'Japantown', {
    economic: { ...createCensusData('japantown', '', {}).economic, medianHouseholdIncome: 85000 },
    ethnicity: { distribution: { white: 35, black: 8, asian: 38, hispanic: 12, nativeAmerican: 0.3, pacificIslander: 0.7, multiracial: 5, other: 1 }, foreignBorn: 32, recentImmigrants: 6, naturalizedCitizens: 18 },
  }),

  lakeshore: createCensusData('lakeshore', 'Lakeshore', {
    economic: { ...createCensusData('lakeshore', '', {}).economic, medianHouseholdIncome: 95000 },
  }),

  laurel_heights: createCensusData('laurel_heights', 'Laurel Heights', {
    economic: { ...createCensusData('laurel_heights', '', {}).economic, medianHouseholdIncome: 165000 },
  }),

  marina: createCensusData('marina', 'Marina', {
    economic: { ...createCensusData('marina', '', {}).economic, medianHouseholdIncome: 155000 },
    ethnicity: { distribution: { white: 75, black: 2, asian: 12, hispanic: 6, nativeAmerican: 0.2, pacificIslander: 0.2, multiracial: 4, other: 0.6 }, foreignBorn: 18, recentImmigrants: 5, naturalizedCitizens: 10 },
  }),

  mission_bay: createCensusData('mission_bay', 'Mission Bay', {
    economic: { ...createCensusData('mission_bay', '', {}).economic, medianHouseholdIncome: 175000 },
  }),

  nob_hill: createCensusData('nob_hill', 'Nob Hill', {
    economic: { ...createCensusData('nob_hill', '', {}).economic, medianHouseholdIncome: 125000 },
  }),

  noe_valley: createCensusData('noe_valley', 'Noe Valley', {
    economic: { ...createCensusData('noe_valley', '', {}).economic, medianHouseholdIncome: 185000 },
    household: { ...createCensusData('noe_valley', '', {}).household, householdsWithChildren: 35 },
  }),

  north_beach: createCensusData('north_beach', 'North Beach', {
    economic: { ...createCensusData('north_beach', '', {}).economic, medianHouseholdIncome: 105000 },
    ethnicity: { distribution: { white: 55, black: 2, asian: 28, hispanic: 10, nativeAmerican: 0.2, pacificIslander: 0.3, multiracial: 4, other: 0.5 }, foreignBorn: 32, recentImmigrants: 6, naturalizedCitizens: 18 },
  }),

  oceanview: createCensusData('oceanview', 'Oceanview', {
    economic: { ...createCensusData('oceanview', '', {}).economic, medianHouseholdIncome: 68000 },
    ethnicity: { distribution: { white: 10, black: 12, asian: 38, hispanic: 32, nativeAmerican: 0.3, pacificIslander: 3, multiracial: 4, other: 0.7 }, foreignBorn: 48, recentImmigrants: 12, naturalizedCitizens: 25 },
  }),

  outer_mission: createCensusData('outer_mission', 'Outer Mission', {
    economic: { ...createCensusData('outer_mission', '', {}).economic, medianHouseholdIncome: 72000 },
    ethnicity: { distribution: { white: 12, black: 5, asian: 35, hispanic: 42, nativeAmerican: 0.3, pacificIslander: 1.5, multiracial: 3.5, other: 0.7 }, foreignBorn: 50, recentImmigrants: 12, naturalizedCitizens: 26 },
  }),

  outer_richmond: createCensusData('outer_richmond', 'Outer Richmond', {
    economic: { ...createCensusData('outer_richmond', '', {}).economic, medianHouseholdIncome: 95000 },
    ethnicity: { distribution: { white: 38, black: 2, asian: 48, hispanic: 6, nativeAmerican: 0.2, pacificIslander: 0.3, multiracial: 5, other: 0.5 }, foreignBorn: 42, recentImmigrants: 9, naturalizedCitizens: 24 },
  }),

  outer_sunset: createCensusData('outer_sunset', 'Outer Sunset', {
    economic: { ...createCensusData('outer_sunset', '', {}).economic, medianHouseholdIncome: 98000 },
    ethnicity: { distribution: { white: 35, black: 2, asian: 50, hispanic: 7, nativeAmerican: 0.2, pacificIslander: 0.3, multiracial: 5, other: 0.5 }, foreignBorn: 45, recentImmigrants: 10, naturalizedCitizens: 26 },
  }),

  parkside: createCensusData('parkside', 'Parkside', {
    economic: { ...createCensusData('parkside', '', {}).economic, medianHouseholdIncome: 105000 },
    ethnicity: { distribution: { white: 38, black: 2, asian: 48, hispanic: 6, nativeAmerican: 0.2, pacificIslander: 0.3, multiracial: 5, other: 0.5 }, foreignBorn: 40, recentImmigrants: 8, naturalizedCitizens: 24 },
  }),

  portola: createCensusData('portola', 'Portola', {
    economic: { ...createCensusData('portola', '', {}).economic, medianHouseholdIncome: 75000 },
    ethnicity: { distribution: { white: 15, black: 6, asian: 40, hispanic: 32, nativeAmerican: 0.3, pacificIslander: 2, multiracial: 4, other: 0.7 }, foreignBorn: 48, recentImmigrants: 11, naturalizedCitizens: 26 },
  }),

  potrero_hill: createCensusData('potrero_hill', 'Potrero Hill', {
    economic: { ...createCensusData('potrero_hill', '', {}).economic, medianHouseholdIncome: 145000 },
  }),

  presidio: createCensusData('presidio', 'Presidio', {
    economic: { ...createCensusData('presidio', '', {}).economic, medianHouseholdIncome: 135000 },
  }),

  russian_hill: createCensusData('russian_hill', 'Russian Hill', {
    economic: { ...createCensusData('russian_hill', '', {}).economic, medianHouseholdIncome: 145000 },
  }),

  sea_cliff: createCensusData('sea_cliff', 'Sea Cliff', {
    economic: { ...createCensusData('sea_cliff', '', {}).economic, medianHouseholdIncome: 250000 },
  }),

  soma: createCensusData('soma', 'SoMa', {
    economic: { ...createCensusData('soma', '', {}).economic, medianHouseholdIncome: 115000 },
  }),

  south_beach: createCensusData('south_beach', 'South Beach', {
    economic: { ...createCensusData('south_beach', '', {}).economic, medianHouseholdIncome: 175000 },
  }),

  stonestown: createCensusData('stonestown', 'Stonestown', {
    economic: { ...createCensusData('stonestown', '', {}).economic, medianHouseholdIncome: 85000 },
  }),

  treasure_island: createCensusData('treasure_island', 'Treasure Island', {
    economic: { ...createCensusData('treasure_island', '', {}).economic, medianHouseholdIncome: 55000 },
  }),

  twin_peaks: createCensusData('twin_peaks', 'Twin Peaks', {
    economic: { ...createCensusData('twin_peaks', '', {}).economic, medianHouseholdIncome: 145000 },
  }),

  visitacion_valley: createCensusData('visitacion_valley', 'Visitacion Valley', {
    economic: { ...createCensusData('visitacion_valley', '', {}).economic, medianHouseholdIncome: 62000 },
    ethnicity: { distribution: { white: 8, black: 15, asian: 45, hispanic: 25, nativeAmerican: 0.3, pacificIslander: 3, multiracial: 3, other: 0.7 }, foreignBorn: 52, recentImmigrants: 14, naturalizedCitizens: 26 },
  }),

  west_portal: createCensusData('west_portal', 'West Portal', {
    economic: { ...createCensusData('west_portal', '', {}).economic, medianHouseholdIncome: 145000 },
  }),

  western_addition: createCensusData('western_addition', 'Western Addition', {
    economic: { ...createCensusData('western_addition', '', {}).economic, medianHouseholdIncome: 75000 },
    ethnicity: { distribution: { white: 35, black: 22, asian: 20, hispanic: 12, nativeAmerican: 0.5, pacificIslander: 1, multiracial: 8, other: 1.5 }, foreignBorn: 28, recentImmigrants: 6, naturalizedCitizens: 15 },
  }),
};

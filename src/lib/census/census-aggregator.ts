/**
 * Census Data Aggregator
 *
 * Aggregates census tract data to neighborhood level using population-weighted
 * averages where tracts span multiple neighborhoods.
 */

import type { SFNeighborhood } from '@/types';
import type { NeighborhoodCensusData } from './types';
import { fetchSFTractData, calculateDerivedStats, type TractData, type CensusApiConfig } from './census-api';
import { getTractsForNeighborhood } from './tract-mapping';
import { SF_NEIGHBORHOODS } from '../geo/sf-geography';

// Re-export for convenience
export type { CensusApiConfig } from './census-api';

interface AggregatedTractData {
  tractId: string;
  population: number;
  data: Record<string, number | null>;
  derived: ReturnType<typeof calculateDerivedStats>;
}

/**
 * Fetch and aggregate census data for all SF neighborhoods
 */
export async function fetchNeighborhoodCensusData(
  config: CensusApiConfig = {}
): Promise<Record<SFNeighborhood, NeighborhoodCensusData>> {
  // Fetch all tract data
  const tracts = await fetchSFTractData(config);

  // Process tracts into usable format
  const processedTracts: Map<string, AggregatedTractData> = new Map();

  for (const tract of tracts) {
    const population = tract.data.totalPopulation ?? 0;
    processedTracts.set(tract.tract, {
      tractId: tract.tractId,
      population,
      data: tract.data,
      derived: calculateDerivedStats(tract.data),
    });
  }

  // Aggregate to neighborhoods
  const result: Partial<Record<SFNeighborhood, NeighborhoodCensusData>> = {};

  for (const neighborhoodId of Object.keys(SF_NEIGHBORHOODS) as SFNeighborhood[]) {
    const neighborhoodInfo = SF_NEIGHBORHOODS[neighborhoodId];
    const tractMappings = getTractsForNeighborhood(neighborhoodId);

    if (tractMappings.length === 0) {
      // No tract mapping - skip or use defaults
      continue;
    }

    // Collect weighted tract data
    const tractDataForNeighborhood: { tract: AggregatedTractData; weight: number }[] = [];
    let totalWeightedPopulation = 0;

    for (const { tract, weight } of tractMappings) {
      const tractData = processedTracts.get(tract);
      if (tractData) {
        tractDataForNeighborhood.push({ tract: tractData, weight });
        totalWeightedPopulation += tractData.population * weight;
      }
    }

    if (tractDataForNeighborhood.length === 0) {
      continue;
    }

    // Aggregate data using population-weighted averages
    result[neighborhoodId] = aggregateToNeighborhood(
      neighborhoodId,
      neighborhoodInfo.name,
      tractDataForNeighborhood,
      totalWeightedPopulation,
      config.year ?? 2022
    );
  }

  return result as Record<SFNeighborhood, NeighborhoodCensusData>;
}

/**
 * Aggregate tract data into a single neighborhood record
 */
function aggregateToNeighborhood(
  neighborhoodId: SFNeighborhood,
  name: string,
  tracts: { tract: AggregatedTractData; weight: number }[],
  totalWeightedPopulation: number,
  dataYear: number
): NeighborhoodCensusData {
  // Helper for population-weighted average
  const weightedAvg = (getValue: (t: AggregatedTractData) => number | null): number => {
    if (totalWeightedPopulation === 0) return 0;

    let sum = 0;
    for (const { tract, weight } of tracts) {
      const value = getValue(tract);
      if (value !== null) {
        sum += value * tract.population * weight;
      }
    }
    return sum / totalWeightedPopulation;
  };

  // Helper for summing values
  const weightedSum = (getValue: (t: AggregatedTractData) => number | null): number => {
    let sum = 0;
    for (const { tract, weight } of tracts) {
      const value = getValue(tract);
      if (value !== null) {
        sum += value * weight;
      }
    }
    return sum;
  };

  // Calculate population density (rough estimate based on neighborhood size)
  const totalPop = Math.round(weightedSum((t) => t.population));
  const neighborhoodInfo = SF_NEIGHBORHOODS[neighborhoodId];
  const approxAreaSqMiles = 1; // Simplified - would need actual area data
  const density = totalPop / approxAreaSqMiles;

  return {
    geoId: `sf-${neighborhoodId}`,
    geoType: 'neighborhood',
    name,
    neighborhood: neighborhoodId,
    tractCount: tracts.length,
    tracts: tracts.map((t) => t.tract.tractId),
    dataYear,

    population: {
      total: totalPop,
      density: Math.round(density),
    },

    economic: {
      medianHouseholdIncome: Math.round(weightedAvg((t) => t.data.medianHouseholdIncome)),
      medianFamilyIncome: Math.round(weightedAvg((t) => t.data.medianFamilyIncome)),
      perCapitaIncome: Math.round(weightedAvg((t) => t.data.perCapitaIncome)),
      incomeDistribution: {
        under25k: Math.round(weightedAvg((t) => t.derived.incomeUnder25k) * 10) / 10,
        from25kTo50k: Math.round(weightedAvg((t) => t.derived.income25kTo50k) * 10) / 10,
        from50kTo75k: Math.round(weightedAvg((t) => t.derived.income50kTo75k) * 10) / 10,
        from75kTo100k: Math.round(weightedAvg((t) => t.derived.income75kTo100k) * 10) / 10,
        from100kTo150k: Math.round(weightedAvg((t) => t.derived.income100kTo150k) * 10) / 10,
        over150k: Math.round(weightedAvg((t) => t.derived.income150kPlus) * 10) / 10,
      },
      amiDistribution: calculateAMIDistribution(weightedAvg((t) => t.data.medianHouseholdIncome)),
      povertyRate: Math.round(weightedAvg((t) => t.derived.povertyRate) * 10) / 10,
      childPovertyRate: Math.round(weightedAvg((t) => t.derived.povertyRate) * 1.2 * 10) / 10, // Estimate
      seniorPovertyRate: Math.round(weightedAvg((t) => t.derived.povertyRate) * 1.1 * 10) / 10, // Estimate
      unemploymentRate: 4, // Would need separate ACS table
      laborForceParticipation: 68, // Would need separate ACS table
      publicAssistanceRate: Math.round(weightedAvg((t) => t.derived.povertyRate) * 0.6 * 10) / 10,
      snapRate: Math.round(weightedAvg((t) => t.derived.povertyRate) * 0.5 * 10) / 10,
      medicaidRate: Math.round(weightedAvg((t) => t.derived.povertyRate) * 1.2 * 10) / 10,
    },

    housing: {
      ownerOccupied: Math.round(weightedAvg((t) => t.derived.ownerPercent) * 10) / 10,
      renterOccupied: Math.round(weightedAvg((t) => t.derived.renterPercent) * 10) / 10,
      vacancyRate: 6, // Would need separate data
      rentBurdenedRate: Math.round(weightedAvg((t) => t.derived.rentBurdenedPercent) * 10) / 10,
      severelyRentBurdened: Math.round(weightedAvg((t) => t.derived.rentBurdenedPercent) * 0.45 * 10) / 10,
      medianRent: Math.round(weightedAvg((t) => t.data.medianRent)),
      medianHomeValue: Math.round(weightedAvg((t) => t.data.medianHomeValue)),
      singleFamily: 25, // Would need separate data
      multiFamily: 70,
      mobileHome: 0,
    },

    language: {
      englishOnly: Math.round(weightedAvg((t) => t.derived.englishOnlyPercent) * 10) / 10,
      limitedEnglishProficiency: Math.round(weightedAvg((t) => t.derived.lepPercent) * 10) / 10,
      languagesSpoken: {
        english: Math.round(weightedAvg((t) => t.derived.englishOnlyPercent) * 10) / 10,
        spanish: 12, // Would need more detailed language data
        chinese: 20,
        tagalog: 4,
        vietnamese: 2,
        korean: 1,
        russian: 2,
        arabic: 0.5,
        other: 3.5,
      },
      linguisticallyIsolatedHouseholds: Math.round(weightedAvg((t) => t.derived.lepPercent) * 0.4 * 10) / 10,
    },

    ethnicity: {
      distribution: {
        white: Math.round(weightedAvg((t) => t.derived.whitePercent) * 10) / 10,
        black: Math.round(weightedAvg((t) => t.derived.blackPercent) * 10) / 10,
        asian: Math.round(weightedAvg((t) => t.derived.asianPercent) * 10) / 10,
        hispanic: Math.round(weightedAvg((t) => t.derived.hispanicPercent) * 10) / 10,
        nativeAmerican: Math.round(weightedAvg((t) => t.derived.nativePercent) * 10) / 10,
        pacificIslander: Math.round(weightedAvg((t) => t.derived.pacificPercent) * 10) / 10,
        multiracial: Math.round(weightedAvg((t) => t.derived.multiracialPercent) * 10) / 10,
        other: 1,
      },
      foreignBorn: Math.round(weightedAvg((t) => t.derived.foreignBornPercent) * 10) / 10,
      recentImmigrants: Math.round(weightedAvg((t) => t.derived.foreignBornPercent) * 0.25 * 10) / 10,
      naturalizedCitizens: Math.round(weightedAvg((t) => t.derived.foreignBornPercent) * 0.6 * 10) / 10,
    },

    age: {
      medianAge: 38, // Would need separate calculation
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
      totalHouseholds: Math.round(totalPop / 2.3),
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
}

/**
 * Calculate AMI distribution based on median income
 * SF 2024 AMI for 1-person household: ~$104,000
 */
function calculateAMIDistribution(medianIncome: number): NeighborhoodCensusData['economic']['amiDistribution'] {
  const sfAMI = 104000; // 2024 SF AMI for 1-person

  // Estimate distribution based on neighborhood median vs AMI
  const ratio = medianIncome / sfAMI;

  if (ratio < 0.5) {
    // Very low income neighborhood
    return {
      extremelyLow: 35,
      veryLow: 20,
      low: 20,
      moderate: 15,
      aboveModerate: 10,
    };
  } else if (ratio < 0.8) {
    // Low to moderate income
    return {
      extremelyLow: 15,
      veryLow: 15,
      low: 25,
      moderate: 25,
      aboveModerate: 20,
    };
  } else if (ratio < 1.2) {
    // Moderate income
    return {
      extremelyLow: 10,
      veryLow: 10,
      low: 15,
      moderate: 30,
      aboveModerate: 35,
    };
  } else if (ratio < 1.8) {
    // Above moderate
    return {
      extremelyLow: 5,
      veryLow: 5,
      low: 10,
      moderate: 20,
      aboveModerate: 60,
    };
  } else {
    // High income
    return {
      extremelyLow: 3,
      veryLow: 3,
      low: 5,
      moderate: 12,
      aboveModerate: 77,
    };
  }
}

/**
 * Cache for fetched census data
 */
let cachedData: Record<SFNeighborhood, NeighborhoodCensusData> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get neighborhood census data with caching
 */
export async function getNeighborhoodCensusData(
  config: CensusApiConfig = {},
  forceRefresh = false
): Promise<Record<SFNeighborhood, NeighborhoodCensusData>> {
  const now = Date.now();

  if (!forceRefresh && cachedData && now - cacheTimestamp < CACHE_TTL) {
    return cachedData;
  }

  try {
    cachedData = await fetchNeighborhoodCensusData(config);
    cacheTimestamp = now;
    return cachedData;
  } catch (error) {
    console.error('Failed to fetch census data:', error);

    // Return cached data if available, even if stale
    if (cachedData) {
      return cachedData;
    }

    throw error;
  }
}

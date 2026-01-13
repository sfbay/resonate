/**
 * Census Data Types
 *
 * Data structures for census demographic information used in the
 * audience overlay feature. Based on American Community Survey (ACS) data.
 */

import type { SFNeighborhood, SFDistrict, IncomeLevel, HousingStatus, Ethnicity, Language } from '@/types';

// =============================================================================
// CENSUS DEMOGRAPHIC DATA
// =============================================================================

/**
 * Comprehensive demographic data for a geographic area
 * Based on ACS 5-year estimates
 */
export interface CensusData {
  // Geographic reference
  geoId: string;                         // Census tract or block group ID
  geoType: 'tract' | 'block_group' | 'neighborhood' | 'district' | 'zip';
  name: string;

  // Population
  population: PopulationData;

  // Economic
  economic: EconomicData;

  // Housing
  housing: HousingData;

  // Language
  language: LanguageData;

  // Ethnicity/Race
  ethnicity: EthnicityData;

  // Age
  age: AgeData;

  // Education
  education: EducationData;

  // Household composition
  household: HouseholdData;

  // Data quality
  dataYear: number;                      // e.g., 2022
  marginOfError?: number;                // ACS margin of error percentage
}

// =============================================================================
// POPULATION
// =============================================================================

export interface PopulationData {
  total: number;
  density: number;                       // Per square mile
  growthRate?: number;                   // Year over year change
}

// =============================================================================
// ECONOMIC DATA
// =============================================================================

export interface EconomicData {
  // Median incomes
  medianHouseholdIncome: number;
  medianFamilyIncome: number;
  perCapitaIncome: number;

  // Income distribution (percentage in each bracket)
  incomeDistribution: {
    under25k: number;
    from25kTo50k: number;
    from50kTo75k: number;
    from75kTo100k: number;
    from100kTo150k: number;
    over150k: number;
  };

  // AMI-based (SF Area Median Income for housing programs)
  amiDistribution: {
    extremelyLow: number;                // ≤30% AMI
    veryLow: number;                     // 31-50% AMI
    low: number;                         // 51-80% AMI
    moderate: number;                    // 81-120% AMI
    aboveModerate: number;               // >120% AMI
  };

  // Poverty
  povertyRate: number;
  childPovertyRate: number;
  seniorPovertyRate: number;

  // Employment
  unemploymentRate: number;
  laborForceParticipation: number;

  // Public assistance
  publicAssistanceRate: number;          // % receiving any public benefits
  snapRate: number;                      // % receiving SNAP/CalFresh
  medicaidRate: number;                  // % on Medi-Cal
}

// =============================================================================
// HOUSING DATA
// =============================================================================

export interface HousingData {
  // Tenure
  ownerOccupied: number;                 // Percentage
  renterOccupied: number;
  vacancyRate: number;

  // Rent burden
  rentBurdenedRate: number;              // Paying >30% income on rent
  severelyRentBurdened: number;          // Paying >50% income on rent

  // Housing costs
  medianRent: number;
  medianHomeValue: number;

  // Housing types
  singleFamily: number;                  // Percentage
  multiFamily: number;
  mobileHome: number;

  // Rent control estimate (SF specific)
  estimatedRentControlled?: number;

  // Public/subsidized housing
  publicHousingUnits?: number;
  section8Vouchers?: number;
}

// =============================================================================
// LANGUAGE DATA
// =============================================================================

export interface LanguageData {
  // English proficiency
  englishOnly: number;                   // Percentage
  limitedEnglishProficiency: number;     // LEP rate

  // Languages spoken at home (percentages)
  languagesSpoken: {
    english: number;
    spanish: number;
    chinese: number;                     // Combined Cantonese/Mandarin
    tagalog: number;
    vietnamese: number;
    korean: number;
    russian: number;
    arabic: number;
    other: number;
  };

  // Linguistic isolation
  linguisticallyIsolatedHouseholds: number;
}

// =============================================================================
// ETHNICITY DATA
// =============================================================================

export interface EthnicityData {
  // Major categories (percentages)
  distribution: {
    white: number;
    black: number;
    asian: number;
    hispanic: number;
    nativeAmerican: number;
    pacificIslander: number;
    multiracial: number;
    other: number;
  };

  // Asian breakdown (of Asian population)
  asianBreakdown?: {
    chinese: number;
    filipino: number;
    vietnamese: number;
    korean: number;
    japanese: number;
    indian: number;
    other: number;
  };

  // Hispanic/Latino breakdown
  hispanicBreakdown?: {
    mexican: number;
    centralAmerican: number;
    southAmerican: number;
    caribbean: number;
    other: number;
  };

  // Nativity
  foreignBorn: number;                   // Percentage
  recentImmigrants: number;              // Arrived in last 10 years
  naturalizedCitizens: number;
}

// =============================================================================
// AGE DATA
// =============================================================================

export interface AgeData {
  medianAge: number;

  // Age distribution (percentages)
  distribution: {
    under5: number;
    age5To17: number;
    age18To24: number;
    age25To34: number;
    age35To44: number;
    age45To54: number;
    age55To64: number;
    age65To74: number;
    age75Plus: number;
  };

  // Key demographics
  under18: number;
  workingAge: number;                    // 18-64
  seniors: number;                       // 65+
}

// =============================================================================
// EDUCATION DATA
// =============================================================================

export interface EducationData {
  // Highest level attained (25+ population, percentages)
  distribution: {
    lessThanHighSchool: number;
    highSchool: number;
    someCollege: number;
    associates: number;
    bachelors: number;
    graduate: number;
  };

  // Summary stats
  highSchoolOrHigher: number;
  bachelorsOrHigher: number;
}

// =============================================================================
// HOUSEHOLD DATA
// =============================================================================

export interface HouseholdData {
  totalHouseholds: number;
  averageHouseholdSize: number;
  averageFamilySize: number;

  // Household types (percentages)
  types: {
    marriedCouple: number;
    marriedWithChildren: number;
    singleParent: number;
    livingAlone: number;
    nonFamilyHousehold: number;
  };

  // Multi-generational
  multigenerationalHouseholds: number;

  // Seniors
  householdsWithSeniors: number;
  seniorsLivingAlone: number;

  // Children
  householdsWithChildren: number;
}

// =============================================================================
// NEIGHBORHOOD CENSUS SUMMARY
// =============================================================================

/**
 * Aggregated census data for a neighborhood
 * Combines multiple census tracts with population weighting
 */
export interface NeighborhoodCensusData extends CensusData {
  neighborhood: SFNeighborhood;
  tractCount: number;                    // Number of tracts aggregated
  tracts: string[];                      // Census tract IDs included
}

/**
 * District-level census summary
 */
export interface DistrictCensusData extends CensusData {
  district: SFDistrict;
  neighborhoodCount: number;
  neighborhoods: SFNeighborhood[];
}

// =============================================================================
// PUBLISHER AUDIENCE OVERLAY
// =============================================================================

/**
 * Result of overlaying publisher audience geography with census data
 */
export interface AudienceOverlay {
  publisherId: string;

  // Geographic breakdown of audience
  geographicDistribution: {
    neighborhood: SFNeighborhood;
    percentage: number;                  // % of audience in this neighborhood
    audienceCount?: number;              // Estimated audience in this area
  }[];

  // Inferred demographics based on geography
  inferredDemographics: InferredDemographics;

  // Confidence and methodology
  confidence: 'high' | 'medium' | 'low';
  methodology: OverlayMethodology;
  lastCalculated: Date;
}

/**
 * Demographics inferred from census overlay
 */
export interface InferredDemographics {
  // Weighted by audience geographic distribution
  estimatedMedianIncome: number;
  estimatedIncomeDistribution: CensusData['economic']['amiDistribution'];

  estimatedEthnicityDistribution: CensusData['ethnicity']['distribution'];

  estimatedLanguages: {
    language: Language;
    percentage: number;
  }[];

  estimatedAgeDistribution: CensusData['age']['distribution'];

  estimatedHousingStatus: {
    owners: number;
    renters: number;
    rentBurdened: number;
  };

  estimatedEducation: {
    highSchoolOrHigher: number;
    bachelorsOrHigher: number;
  };

  // Key indicators for city campaigns
  estimatedPovertyRate: number;
  estimatedLepRate: number;              // Limited English Proficiency
  estimatedSeniorPopulation: number;
  estimatedChildPopulation: number;
  estimatedForeignBorn: number;
}

/**
 * How the overlay was calculated
 */
export interface OverlayMethodology {
  dataSource: 'acs_5yr' | 'acs_1yr' | 'decennial';
  dataYear: number;
  geographicSource: 'platform_analytics' | 'self_reported' | 'estimated';
  aggregationMethod: 'population_weighted' | 'simple_average' | 'audience_weighted';
  notes?: string[];
}

// =============================================================================
// PUBLISHER ANNOTATIONS
// =============================================================================

/**
 * Publisher-provided annotations to augment census data
 */
export interface PublisherAnnotation {
  id: string;
  publisherId: string;
  createdAt: Date;
  updatedAt: Date;

  // What is being annotated
  annotationType: AnnotationType;

  // Geographic scope (optional - can be general)
  neighborhoods?: SFNeighborhood[];

  // The annotation content
  content: AnnotationContent;

  // Visibility
  visibility: 'private' | 'advertisers' | 'public';
}

export type AnnotationType =
  | 'community_insight'                  // Knowledge about the community
  | 'demographic_correction'             // Census doesn't capture this
  | 'cultural_note'                      // Cultural context
  | 'engagement_pattern'                 // When/how audience engages
  | 'audience_segment'                   // Distinct segment within audience
  | 'local_knowledge';                   // Hyperlocal information

export interface AnnotationContent {
  title: string;
  description: string;

  // Optional structured data
  demographics?: {
    factor: string;                      // e.g., "undocumented immigrants"
    estimatedPercentage?: number;
    confidence: 'known' | 'estimated' | 'anecdotal';
  };

  // Tags for searchability
  tags?: string[];

  // Supporting evidence
  evidence?: {
    type: 'survey' | 'engagement_data' | 'community_feedback' | 'observation';
    description: string;
  };
}

// =============================================================================
// MAP DISPLAY TYPES
// =============================================================================

/**
 * Data for rendering a neighborhood on the map
 */
export interface MapNeighborhoodData {
  neighborhood: SFNeighborhood;
  name: string;
  center: { lat: number; lng: number };
  bounds: { sw: { lat: number; lng: number }; ne: { lat: number; lng: number } };

  // Publisher coverage
  publisherCoverage?: {
    publisherCount: number;              // Publishers covering this area
    totalReach: number;                  // Combined follower count
    coverageStrength: 'high' | 'medium' | 'low' | 'none';
  };

  // Census overlay (for coloring/display)
  censusHighlights?: {
    medianIncome: number;
    predominantEthnicity: string;
    predominantLanguage: string;
    lepRate: number;
    povertyRate: number;
  };

  // For a specific publisher's view
  audiencePercentage?: number;           // % of their audience here
}

/**
 * Layer configuration for the map
 */
export interface MapLayerConfig {
  id: string;
  name: string;
  type: 'choropleth' | 'heatmap' | 'markers' | 'boundaries';
  dataField: keyof CensusData['economic'] | keyof CensusData['ethnicity']['distribution'] | 'publisherCoverage' | 'audienceDistribution';
  colorScale: string[];                  // e.g., ['#f7fbff', '#08306b']
  visible: boolean;
  opacity: number;
}

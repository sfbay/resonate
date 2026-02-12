/**
 * Matching Algorithm
 *
 * Core logic for matching campaign target audiences with publishers' audience profiles.
 * This is the heart of Resonate's value proposition — used by both government and private advertisers.
 *
 * Matching dimensions:
 * - Geographic: neighborhoods, zip codes, supervisorial districts
 * - Demographic: age, language, education, family status
 * - Economic: income, housing, employment, benefits
 * - Cultural: ethnicity, immigration, community affiliations, identity factors
 * - Reach: audience size and engagement quality
 */

import type {
  Publisher,
  TargetAudience,
  AudienceProfile,
  MatchResult,
  SFNeighborhood,
  SFDistrict,
  Language,
  AgeRange,
  IncomeLevel,
  HousingStatus,
  BenefitProgram,
  Ethnicity,
  CommunityAffiliation,
  IdentityFactor,
} from '@/types';

// =============================================================================
// MAIN MATCHING FUNCTION
// =============================================================================

/**
 * Find publishers that match a target audience
 */
export function findMatchingPublishers(
  targetAudience: TargetAudience,
  publishers: Publisher[],
  options: MatchOptions = {}
): MatchResult[] {
  const {
    minScore = 30,
    maxResults = 20,
    requiredVendorStatus = false,
  } = options;

  const results: MatchResult[] = [];

  for (const publisher of publishers) {
    // Skip if vendor status required but not met
    if (requiredVendorStatus && publisher.vendorStatus !== 'registered') {
      continue;
    }

    // Skip inactive publishers
    if (publisher.status !== 'active') {
      continue;
    }

    const matchResult = calculateMatch(targetAudience, publisher);

    if (matchResult.overallScore >= minScore) {
      results.push(matchResult);
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.overallScore - a.overallScore);

  return results.slice(0, maxResults);
}

interface MatchOptions {
  minScore?: number;           // Minimum match score (0-100)
  maxResults?: number;         // Maximum results to return
  requiredVendorStatus?: boolean; // Only return registered vendors
}

// =============================================================================
// DEFAULT WEIGHTS
// =============================================================================

const DEFAULT_WEIGHTS = {
  geographic: 25,
  demographic: 20,
  economic: 20,
  cultural: 25,
  reach: 10,
};

// =============================================================================
// SCORING LOGIC
// =============================================================================

/**
 * Calculate match score between target audience and publisher
 */
function calculateMatch(
  target: TargetAudience,
  publisher: Publisher
): MatchResult {
  const profile = publisher.audienceProfile;

  // Calculate individual dimension scores
  const geographicResult = calculateGeographicScore(target, profile);
  const demographicResult = calculateDemographicScore(target, profile);
  const economicResult = calculateEconomicScore(target, profile);
  const culturalResult = calculateCulturalScore(target, profile);
  const reachScore = calculateReachScore(publisher);

  const scores = {
    geographic: geographicResult.score,
    demographic: demographicResult.score,
    economic: economicResult.score,
    cultural: culturalResult.score,
    reach: reachScore,
  };

  // Use custom weights if provided, otherwise defaults
  const weights = {
    geographic: target.priorityWeights?.geographic ?? DEFAULT_WEIGHTS.geographic,
    demographic: target.priorityWeights?.demographic ?? DEFAULT_WEIGHTS.demographic,
    economic: target.priorityWeights?.economic ?? DEFAULT_WEIGHTS.economic,
    cultural: target.priorityWeights?.cultural ?? DEFAULT_WEIGHTS.cultural,
    reach: target.priorityWeights?.reach ?? DEFAULT_WEIGHTS.reach,
  };

  // Normalize weights to sum to 100
  const totalWeight = weights.geographic + weights.demographic + weights.economic + weights.cultural + weights.reach;
  const normalizedWeights = {
    geographic: weights.geographic / totalWeight,
    demographic: weights.demographic / totalWeight,
    economic: weights.economic / totalWeight,
    cultural: weights.cultural / totalWeight,
    reach: weights.reach / totalWeight,
  };

  // Calculate weighted overall score
  const overallScore = Math.round(
    scores.geographic * normalizedWeights.geographic +
    scores.demographic * normalizedWeights.demographic +
    scores.economic * normalizedWeights.economic +
    scores.cultural * normalizedWeights.cultural +
    scores.reach * normalizedWeights.reach
  );

  // Build match details
  const matchDetails: MatchResult['matchDetails'] = {};

  if (geographicResult.matchedNeighborhoods.length > 0 || geographicResult.matchedDistricts.length > 0) {
    matchDetails.geographic = {
      matchedNeighborhoods: geographicResult.matchedNeighborhoods,
      matchedDistricts: geographicResult.matchedDistricts,
      coverageStrength: scores.geographic >= 70 ? 'strong' : scores.geographic >= 40 ? 'moderate' : 'weak',
    };
  }

  if (demographicResult.matchedLanguages.length > 0 || demographicResult.matchedAgeRanges.length > 0) {
    matchDetails.demographic = {
      matchedLanguages: demographicResult.matchedLanguages,
      matchedAgeRanges: demographicResult.matchedAgeRanges,
      otherMatches: demographicResult.otherMatches,
    };
  }

  if (economicResult.matchedBenefitPrograms.length > 0 || economicResult.matchedIncomeLevel || economicResult.matchedHousingStatus) {
    matchDetails.economic = {
      matchedIncomeLevel: economicResult.matchedIncomeLevel,
      matchedHousingStatus: economicResult.matchedHousingStatus,
      matchedBenefitPrograms: economicResult.matchedBenefitPrograms,
    };
  }

  if (culturalResult.matchedEthnicities.length > 0 || culturalResult.matchedAffiliations.length > 0) {
    matchDetails.cultural = {
      matchedEthnicities: culturalResult.matchedEthnicities,
      matchedAffiliations: culturalResult.matchedAffiliations,
      matchedIdentityFactors: culturalResult.matchedIdentityFactors,
    };
  }

  const matchReasons = generateMatchReasons(scores, matchDetails, profile);
  const estimatedCost = estimateCampaignCost(publisher);
  const confidenceLevel = determineConfidenceLevel(profile);

  return {
    publisherId: publisher.id,
    publisher,
    overallScore,
    scores,
    matchDetails,
    matchReasons,
    confidenceLevel,
    estimatedCost: { ...estimatedCost, currency: 'USD' },
    estimatedReach: estimateReach(publisher),
  };
}

// =============================================================================
// GEOGRAPHIC SCORING
// =============================================================================

interface GeographicScoreResult {
  score: number;
  matchedNeighborhoods: SFNeighborhood[];
  matchedDistricts: SFDistrict[];
}

function calculateGeographicScore(
  target: TargetAudience,
  profile: AudienceProfile
): GeographicScoreResult {
  const result: GeographicScoreResult = {
    score: 50, // Base score
    matchedNeighborhoods: [],
    matchedDistricts: [],
  };

  const targetGeo = target.geographic;
  const profileGeo = profile.geographic;

  // If no geographic targeting specified, give decent score to citywide publishers
  if (!targetGeo || (!targetGeo.neighborhoods?.length && !targetGeo.zipCodes?.length && !targetGeo.supervisorialDistricts?.length)) {
    result.score = profileGeo.citywide ? 70 : 50;
    return result;
  }

  // If target wants citywide and publisher is citywide, good match
  if (targetGeo.citywide && profileGeo.citywide) {
    result.score = 85;
    return result;
  }

  let totalPoints = 0;
  let maxPoints = 0;

  // Neighborhood matching (weighted heavily)
  if (targetGeo.neighborhoods && targetGeo.neighborhoods.length > 0) {
    maxPoints += 50;
    const targetSet = new Set(targetGeo.neighborhoods);
    const profileSet = new Set(profileGeo.neighborhoods);

    for (const neighborhood of targetSet) {
      if (profileSet.has(neighborhood)) {
        result.matchedNeighborhoods.push(neighborhood);
      }
    }

    if (result.matchedNeighborhoods.length > 0) {
      const overlapRatio = result.matchedNeighborhoods.length / targetGeo.neighborhoods.length;
      totalPoints += 50 * overlapRatio;
    } else if (profileGeo.citywide) {
      // Citywide publisher gets partial credit
      totalPoints += 25;
    }
  }

  // District matching
  if (targetGeo.supervisorialDistricts && targetGeo.supervisorialDistricts.length > 0) {
    maxPoints += 30;
    const targetDistricts = new Set(targetGeo.supervisorialDistricts);
    const profileDistricts = new Set(profileGeo.supervisorialDistricts || []);

    for (const district of targetDistricts) {
      if (profileDistricts.has(district)) {
        result.matchedDistricts.push(district);
      }
    }

    if (result.matchedDistricts.length > 0) {
      const overlapRatio = result.matchedDistricts.length / targetGeo.supervisorialDistricts.length;
      totalPoints += 30 * overlapRatio;
    } else if (profileGeo.citywide) {
      totalPoints += 15;
    }
  }

  // Zip code matching
  if (targetGeo.zipCodes && targetGeo.zipCodes.length > 0) {
    maxPoints += 20;
    const targetZips = new Set(targetGeo.zipCodes);
    const profileZips = new Set(profileGeo.zipCodes || []);

    let zipMatches = 0;
    for (const zip of targetZips) {
      if (profileZips.has(zip)) {
        zipMatches++;
      }
    }

    if (zipMatches > 0) {
      totalPoints += 20 * (zipMatches / targetGeo.zipCodes.length);
    } else if (profileGeo.citywide) {
      totalPoints += 10;
    }
  }

  if (maxPoints > 0) {
    result.score = Math.round((totalPoints / maxPoints) * 100);
  }

  return result;
}

// =============================================================================
// DEMOGRAPHIC SCORING
// =============================================================================

interface DemographicScoreResult {
  score: number;
  matchedLanguages: Language[];
  matchedAgeRanges: AgeRange[];
  otherMatches: string[];
}

function calculateDemographicScore(
  target: TargetAudience,
  profile: AudienceProfile
): DemographicScoreResult {
  const result: DemographicScoreResult = {
    score: 50,
    matchedLanguages: [],
    matchedAgeRanges: [],
    otherMatches: [],
  };

  const targetDemo = target.demographic;
  const profileDemo = profile.demographic;

  if (!targetDemo) {
    return result;
  }

  let totalPoints = 0;
  let maxPoints = 0;

  // Language matching (high priority)
  if (targetDemo.languages && targetDemo.languages.length > 0) {
    maxPoints += 40;
    const targetLangs = new Set(targetDemo.languages);
    const profileLangs = new Set(profileDemo.languages);

    for (const lang of targetLangs) {
      if (profileLangs.has(lang)) {
        result.matchedLanguages.push(lang);
      }
    }

    if (result.matchedLanguages.length > 0) {
      totalPoints += 40 * (result.matchedLanguages.length / targetDemo.languages.length);
    }
  }

  // Age range matching
  if (targetDemo.ageRanges && targetDemo.ageRanges.length > 0) {
    maxPoints += 30;
    const targetAges = new Set(targetDemo.ageRanges);
    const profileAges = new Set(profileDemo.ageRanges);

    for (const age of targetAges) {
      if (profileAges.has(age)) {
        result.matchedAgeRanges.push(age);
      }
    }

    if (result.matchedAgeRanges.length > 0) {
      totalPoints += 30 * (result.matchedAgeRanges.length / targetDemo.ageRanges.length);
    }
  }

  // Education level matching
  if (targetDemo.educationLevels && targetDemo.educationLevels.length > 0 && profileDemo.educationLevels) {
    maxPoints += 15;
    const targetEdu = new Set(targetDemo.educationLevels);
    const profileEdu = new Set(profileDemo.educationLevels);

    let eduMatches = 0;
    for (const edu of targetEdu) {
      if (profileEdu.has(edu)) {
        eduMatches++;
        result.otherMatches.push(`Education: ${edu}`);
      }
    }

    if (eduMatches > 0) {
      totalPoints += 15 * (eduMatches / targetDemo.educationLevels.length);
    }
  }

  // Family status matching
  if (targetDemo.familyStatus && targetDemo.familyStatus.length > 0 && profileDemo.familyStatus) {
    maxPoints += 15;
    const targetFamily = new Set(targetDemo.familyStatus);
    const profileFamily = new Set(profileDemo.familyStatus);

    let familyMatches = 0;
    for (const status of targetFamily) {
      if (profileFamily.has(status)) {
        familyMatches++;
        result.otherMatches.push(`Family: ${status}`);
      }
    }

    if (familyMatches > 0) {
      totalPoints += 15 * (familyMatches / targetDemo.familyStatus.length);
    }
  }

  if (maxPoints > 0) {
    result.score = Math.round((totalPoints / maxPoints) * 100);
  }

  return result;
}

// =============================================================================
// ECONOMIC SCORING
// =============================================================================

interface EconomicScoreResult {
  score: number;
  matchedIncomeLevel: boolean;
  matchedHousingStatus: boolean;
  matchedBenefitPrograms: BenefitProgram[];
}

function calculateEconomicScore(
  target: TargetAudience,
  profile: AudienceProfile
): EconomicScoreResult {
  const result: EconomicScoreResult = {
    score: 50,
    matchedIncomeLevel: false,
    matchedHousingStatus: false,
    matchedBenefitPrograms: [],
  };

  const targetEcon = target.economic;
  const profileEcon = profile.economic;

  if (!targetEcon) {
    return result;
  }

  let totalPoints = 0;
  let maxPoints = 0;

  // Income level matching
  if (targetEcon.incomeLevel && targetEcon.incomeLevel.length > 0 && profileEcon.incomeLevel) {
    maxPoints += 35;
    const targetIncome = new Set(targetEcon.incomeLevel);
    const profileIncome = new Set(profileEcon.incomeLevel);

    let incomeMatches = 0;
    for (const income of targetIncome) {
      if (profileIncome.has(income)) {
        incomeMatches++;
      }
    }

    if (incomeMatches > 0) {
      result.matchedIncomeLevel = true;
      totalPoints += 35 * (incomeMatches / targetEcon.incomeLevel.length);
    }
  }

  // Housing status matching
  if (targetEcon.housingStatus && targetEcon.housingStatus.length > 0 && profileEcon.housingStatus) {
    maxPoints += 25;
    const targetHousing = new Set(targetEcon.housingStatus);
    const profileHousing = new Set(profileEcon.housingStatus);

    let housingMatches = 0;
    for (const housing of targetHousing) {
      if (profileHousing.has(housing)) {
        housingMatches++;
      }
    }

    if (housingMatches > 0) {
      result.matchedHousingStatus = true;
      totalPoints += 25 * (housingMatches / targetEcon.housingStatus.length);
    }
  }

  // Benefit programs matching (important for city outreach)
  if (targetEcon.benefitPrograms && targetEcon.benefitPrograms.length > 0 && profileEcon.benefitPrograms) {
    maxPoints += 25;
    const targetBenefits = new Set(targetEcon.benefitPrograms);
    const profileBenefits = new Set(profileEcon.benefitPrograms);

    for (const benefit of targetBenefits) {
      if (profileBenefits.has(benefit)) {
        result.matchedBenefitPrograms.push(benefit);
      }
    }

    if (result.matchedBenefitPrograms.length > 0) {
      totalPoints += 25 * (result.matchedBenefitPrograms.length / targetEcon.benefitPrograms.length);
    }
  }

  // Public benefits recipients flag
  if (targetEcon.publicBenefitsRecipients && profileEcon.publicBenefitsRecipients) {
    maxPoints += 15;
    totalPoints += 15;
  }

  if (maxPoints > 0) {
    result.score = Math.round((totalPoints / maxPoints) * 100);
  }

  return result;
}

// =============================================================================
// CULTURAL SCORING
// =============================================================================

interface CulturalScoreResult {
  score: number;
  matchedEthnicities: Ethnicity[];
  matchedAffiliations: CommunityAffiliation[];
  matchedIdentityFactors: IdentityFactor[];
}

function calculateCulturalScore(
  target: TargetAudience,
  profile: AudienceProfile
): CulturalScoreResult {
  const result: CulturalScoreResult = {
    score: 50,
    matchedEthnicities: [],
    matchedAffiliations: [],
    matchedIdentityFactors: [],
  };

  const targetCultural = target.cultural;
  const profileCultural = profile.cultural;

  if (!targetCultural) {
    return result;
  }

  let totalPoints = 0;
  let maxPoints = 0;

  // Ethnicity matching
  if (targetCultural.ethnicities && targetCultural.ethnicities.length > 0 && profileCultural.ethnicities) {
    maxPoints += 35;
    const targetEth = new Set(targetCultural.ethnicities);
    const profileEth = new Set(profileCultural.ethnicities);

    for (const eth of targetEth) {
      if (profileEth.has(eth)) {
        result.matchedEthnicities.push(eth);
      }
    }

    if (result.matchedEthnicities.length > 0) {
      totalPoints += 35 * (result.matchedEthnicities.length / targetCultural.ethnicities.length);
    }
  }

  // Community affiliation matching
  if (targetCultural.communityAffiliations && targetCultural.communityAffiliations.length > 0 && profileCultural.communityAffiliations) {
    maxPoints += 35;
    const targetAff = new Set(targetCultural.communityAffiliations);
    const profileAff = new Set(profileCultural.communityAffiliations);

    for (const aff of targetAff) {
      if (profileAff.has(aff)) {
        result.matchedAffiliations.push(aff);
      }
    }

    if (result.matchedAffiliations.length > 0) {
      totalPoints += 35 * (result.matchedAffiliations.length / targetCultural.communityAffiliations.length);
    }
  }

  // Identity factors matching
  if (targetCultural.identityFactors && targetCultural.identityFactors.length > 0 && profileCultural.identityFactors) {
    maxPoints += 30;
    const targetFactors = new Set(targetCultural.identityFactors);
    const profileFactors = new Set(profileCultural.identityFactors);

    for (const factor of targetFactors) {
      if (profileFactors.has(factor)) {
        result.matchedIdentityFactors.push(factor);
      }
    }

    if (result.matchedIdentityFactors.length > 0) {
      totalPoints += 30 * (result.matchedIdentityFactors.length / targetCultural.identityFactors.length);
    }
  }

  if (maxPoints > 0) {
    result.score = Math.round((totalPoints / maxPoints) * 100);
  }

  return result;
}

// =============================================================================
// REACH SCORING
// =============================================================================

function calculateReachScore(publisher: Publisher): number {
  const platforms = publisher.platforms;

  if (platforms.length === 0) return 0;

  // Total followers across platforms
  const totalFollowers = platforms.reduce((sum, p) => sum + p.followerCount, 0);

  // Average engagement rate (if available)
  const engagementRates = platforms
    .filter(p => p.engagementRate !== undefined)
    .map(p => p.engagementRate!);
  const avgEngagement = engagementRates.length > 0
    ? engagementRates.reduce((a, b) => a + b, 0) / engagementRates.length
    : 0;

  // Base score from follower count
  let reachScore: number;
  if (totalFollowers >= 50000) reachScore = 80;
  else if (totalFollowers >= 20000) reachScore = 70;
  else if (totalFollowers >= 10000) reachScore = 60;
  else if (totalFollowers >= 5000) reachScore = 50;
  else if (totalFollowers >= 1000) reachScore = 40;
  else reachScore = 25;

  // Bonus for high engagement (community publishers often have smaller but more engaged audiences)
  if (avgEngagement >= 5) reachScore += 20;
  else if (avgEngagement >= 3) reachScore += 10;
  else if (avgEngagement >= 1) reachScore += 5;

  // Bonus for verified accounts
  const verifiedCount = platforms.filter(p => p.verified).length;
  if (verifiedCount > 0) {
    reachScore += Math.min(10, verifiedCount * 3);
  }

  return Math.min(100, reachScore);
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Generate human-readable match reasons
 */
function generateMatchReasons(
  scores: MatchResult['scores'],
  matchDetails: MatchResult['matchDetails'],
  profile: AudienceProfile
): string[] {
  const reasons: string[] = [];

  // Geographic reasons
  if (scores.geographic >= 60 && matchDetails.geographic) {
    if (matchDetails.geographic.matchedNeighborhoods.length > 0) {
      const neighborhoods = matchDetails.geographic.matchedNeighborhoods
        .slice(0, 3)
        .map(n => formatNeighborhood(n))
        .join(', ');
      reasons.push(`Serves ${neighborhoods}`);
    } else if (profile.geographic.citywide) {
      reasons.push('Citywide coverage');
    }
  }

  // Demographic reasons
  if (scores.demographic >= 60 && matchDetails.demographic) {
    if (matchDetails.demographic.matchedLanguages.length > 0) {
      const langs = matchDetails.demographic.matchedLanguages
        .map(l => formatLanguage(l))
        .join(', ');
      reasons.push(`${langs} content`);
    }
    if (matchDetails.demographic.matchedAgeRanges.length > 0) {
      reasons.push('Age demographic match');
    }
  }

  // Economic reasons
  if (scores.economic >= 60 && matchDetails.economic) {
    if (matchDetails.economic.matchedIncomeLevel) {
      reasons.push('Income demographic match');
    }
    if (matchDetails.economic.matchedBenefitPrograms.length > 0) {
      reasons.push('Reaches benefits recipients');
    }
  }

  // Cultural reasons
  if (scores.cultural >= 60 && matchDetails.cultural) {
    if (matchDetails.cultural.matchedEthnicities.length > 0) {
      reasons.push('Strong cultural alignment');
    }
    if (matchDetails.cultural.matchedAffiliations.length > 0) {
      reasons.push('Community affiliation match');
    }
  }

  // Reach reasons
  if (scores.reach >= 70) {
    reasons.push('Strong audience engagement');
  }

  return reasons;
}

/**
 * Estimate campaign cost based on publisher rate card
 */
function estimateCampaignCost(publisher: Publisher): { low: number; high: number } {
  const rates = publisher.rateCard.rates;

  if (rates.length === 0) {
    return { low: 0, high: 0 };
  }

  const prices = rates.map(r => r.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Estimate based on a "typical" campaign (2-3 deliverables)
  return {
    low: minPrice * 2,
    high: maxPrice * 3,
  };
}

/**
 * Estimate reach based on publisher platforms
 */
function estimateReach(publisher: Publisher): MatchResult['estimatedReach'] {
  const totalFollowers = publisher.platforms.reduce((sum, p) => sum + p.followerCount, 0);

  if (totalFollowers === 0) return undefined;

  // Rough estimates based on typical social media metrics
  const avgEngagementRate = publisher.platforms
    .filter(p => p.engagementRate !== undefined)
    .reduce((sum, p, _, arr) => sum + (p.engagementRate || 0) / arr.length, 0) || 2;

  return {
    impressions: {
      low: Math.round(totalFollowers * 0.3),
      high: Math.round(totalFollowers * 0.8),
    },
    engagements: {
      low: Math.round(totalFollowers * (avgEngagementRate / 100) * 0.5),
      high: Math.round(totalFollowers * (avgEngagementRate / 100) * 1.5),
    },
  };
}

/**
 * Determine confidence level based on data quality
 */
function determineConfidenceLevel(profile: AudienceProfile): MatchResult['confidenceLevel'] {
  const verificationLevel = profile.dataSource.verificationLevel;

  if (verificationLevel === 'verified') return 'high';
  if (verificationLevel === 'partially_verified') return 'medium';
  return 'low';
}

/**
 * Format neighborhood for display
 */
function formatNeighborhood(neighborhood: SFNeighborhood): string {
  return neighborhood
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format language for display
 */
function formatLanguage(language: Language): string {
  const languageNames: Record<Language, string> = {
    english: 'English',
    spanish: 'Spanish',
    chinese_cantonese: 'Cantonese',
    chinese_mandarin: 'Mandarin',
    tagalog: 'Tagalog',
    vietnamese: 'Vietnamese',
    russian: 'Russian',
    korean: 'Korean',
    japanese: 'Japanese',
    arabic: 'Arabic',
    french: 'French',
    portuguese: 'Portuguese',
    hindi: 'Hindi',
    punjabi: 'Punjabi',
    thai: 'Thai',
    burmese: 'Burmese',
    samoan: 'Samoan',
    asl: 'ASL',
    other: 'Other',
  };
  return languageNames[language] || language;
}

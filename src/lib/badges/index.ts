/**
 * Badge System
 *
 * Exports all badge-related functionality.
 */

export {
  calculateBadges,
  compareBadges,
  buildGrowthMetrics,
  type BadgeCalculationInput,
  type BadgeCalculationResult,
} from './calculate';

export {
  ALL_BADGE_CRITERIA,
  getCriteria,
  risingStarCriteria,
  growthChampionCriteria,
  engagementLeaderCriteria,
  verifiedPublisherCriteria,
  emergingChannelCriteria,
  communityBuilderCriteria,
  type BadgeCriteria,
  type BadgeEvaluationContext,
  type BadgeEvaluationResult,
} from './criteria';

/**
 * Badge Calculation Service
 *
 * Evaluates publishers against all badge criteria and manages badge awards.
 */

import type { Badge, BadgeType, Platform, GrowthMetrics } from '@/types';
import type { DbGrowthBadge, DbMetricsSnapshot, DbGrowthSnapshot } from '@/lib/db/types';
import {
  ALL_BADGE_CRITERIA,
  type BadgeEvaluationContext,
  type BadgeEvaluationResult,
} from './criteria';

// =============================================================================
// TYPES
// =============================================================================

export interface BadgeCalculationInput {
  publisherId: string;

  // Current metrics
  latestMetrics: DbMetricsSnapshot[];
  growthSnapshots: DbGrowthSnapshot[];

  // Platform info
  connectedPlatforms: Platform[];
  verifiedPlatforms: Platform[];

  // Optional: engagement percentile (if pre-calculated)
  engagementPercentile?: number;
}

export interface BadgeCalculationResult {
  newBadges: Badge[];
  expiredBadges: BadgeType[];
  allEvaluations: Record<BadgeType, BadgeEvaluationResult>;
}

// =============================================================================
// CALCULATION FUNCTIONS
// =============================================================================

/**
 * Calculate which badges a publisher qualifies for
 */
export function calculateBadges(input: BadgeCalculationInput): BadgeCalculationResult {
  const context = buildEvaluationContext(input);
  const evaluations: Record<BadgeType, BadgeEvaluationResult> = {} as Record<BadgeType, BadgeEvaluationResult>;
  const newBadges: Badge[] = [];

  // Evaluate all badge criteria
  for (const criteria of ALL_BADGE_CRITERIA) {
    const result = criteria.evaluate(context);
    evaluations[criteria.type] = result;

    if (result.earned) {
      newBadges.push({
        type: criteria.type,
        tier: result.tier,
        awardedAt: new Date(),
        expiresAt: getBadgeExpiry(criteria.type),
        criteriaMet: result.criteriaMet,
      });
    }
  }

  return {
    newBadges,
    expiredBadges: [], // Would compare against existing badges
    allEvaluations: evaluations,
  };
}

/**
 * Build evaluation context from raw data
 */
function buildEvaluationContext(input: BadgeCalculationInput): BadgeEvaluationContext {
  // Aggregate metrics across platforms
  const totalFollowers = input.latestMetrics.reduce(
    (sum, m) => sum + (m.follower_count || m.subscriber_count || 0),
    0
  );

  // Calculate average engagement rate (weighted by followers)
  let totalWeightedEngagement = 0;
  let totalWeight = 0;
  for (const m of input.latestMetrics) {
    const followers = m.follower_count || m.subscriber_count || 0;
    const engagement = m.engagement_rate || 0;
    if (followers > 0 && engagement > 0) {
      totalWeightedEngagement += engagement * followers;
      totalWeight += followers;
    }
  }
  const averageEngagementRate = totalWeight > 0 ? totalWeightedEngagement / totalWeight : 0;

  // Calculate growth rates from snapshots
  const { growth7dRate, growth30dRate, growth90dRate, followersGained30d } =
    calculateGrowthRates(input.growthSnapshots, totalFollowers);

  // Determine active platforms (platforms with recent metrics)
  const now = Date.now();
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  const activePlatforms = input.latestMetrics
    .filter((m) => {
      const recordedAt = new Date(m.recorded_at).getTime();
      return now - recordedAt < THIRTY_DAYS;
    })
    .map((m) => m.platform as Platform);

  return {
    publisherId: input.publisherId,
    totalFollowers,
    averageEngagementRate,
    growth7dRate,
    growth30dRate,
    growth90dRate,
    followersGained30d,
    connectedPlatforms: input.connectedPlatforms,
    verifiedPlatforms: input.verifiedPlatforms,
    activePlatforms,
    engagementPercentile: input.engagementPercentile,
  };
}

/**
 * Calculate growth rates from snapshots
 */
function calculateGrowthRates(
  snapshots: DbGrowthSnapshot[],
  currentFollowers: number
): {
  growth7dRate: number;
  growth30dRate: number;
  growth90dRate: number;
  followersGained30d: number;
} {
  const now = new Date();
  const SEVEN_DAYS = 7;
  const THIRTY_DAYS = 30;
  const NINETY_DAYS = 90;

  // Sort by date descending
  const sorted = [...snapshots]
    .filter((s) => s.platform === null) // Aggregate snapshots
    .sort((a, b) => new Date(b.snapshot_date).getTime() - new Date(a.snapshot_date).getTime());

  // Find snapshots near each time horizon
  const findSnapshotNearDaysAgo = (daysAgo: number) => {
    const targetDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return sorted.find((s) => {
      const snapshotDate = new Date(s.snapshot_date);
      const diffDays = Math.abs(
        (targetDate.getTime() - snapshotDate.getTime()) / (24 * 60 * 60 * 1000)
      );
      return diffDays <= 3; // Within 3 days of target
    });
  };

  const snapshot7d = findSnapshotNearDaysAgo(SEVEN_DAYS);
  const snapshot30d = findSnapshotNearDaysAgo(THIRTY_DAYS);
  const snapshot90d = findSnapshotNearDaysAgo(NINETY_DAYS);

  const calcGrowthRate = (oldFollowers: number | null | undefined): number => {
    if (!oldFollowers || oldFollowers === 0) return 0;
    return ((currentFollowers - oldFollowers) / oldFollowers) * 100;
  };

  const followers7dAgo = snapshot7d?.followers_end || snapshot7d?.followers_start;
  const followers30dAgo = snapshot30d?.followers_end || snapshot30d?.followers_start;
  const followers90dAgo = snapshot90d?.followers_end || snapshot90d?.followers_start;

  return {
    growth7dRate: calcGrowthRate(followers7dAgo),
    growth30dRate: calcGrowthRate(followers30dAgo),
    growth90dRate: calcGrowthRate(followers90dAgo),
    followersGained30d: followers30dAgo ? currentFollowers - followers30dAgo : 0,
  };
}

/**
 * Get badge expiry date (some badges expire, some don't)
 */
function getBadgeExpiry(type: BadgeType): Date | undefined {
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;

  switch (type) {
    // Growth badges expire after the growth period
    case 'rising_star':
      return new Date(Date.now() + THIRTY_DAYS);
    case 'growth_champion':
      return new Date(Date.now() + NINETY_DAYS);

    // Status badges don't expire (but can be revoked)
    case 'verified_publisher':
    case 'engagement_leader':
    case 'emerging_channel':
    case 'community_builder':
      return undefined;

    default:
      return undefined;
  }
}

// =============================================================================
// BADGE COMPARISON & UPDATES
// =============================================================================

/**
 * Compare current badges with newly calculated badges
 */
export function compareBadges(
  existingBadges: DbGrowthBadge[],
  newCalculation: BadgeCalculationResult
): {
  toAward: Badge[];
  toUpgrade: Badge[];
  toExpire: string[]; // Badge IDs
  unchanged: string[]; // Badge IDs
} {
  const toAward: Badge[] = [];
  const toUpgrade: Badge[] = [];
  const toExpire: string[] = [];
  const unchanged: string[] = [];

  const existingByType = new Map(existingBadges.map((b) => [b.badge_type, b]));
  const newByType = new Map(newCalculation.newBadges.map((b) => [b.type, b]));

  // Check existing badges
  for (const existing of existingBadges) {
    if (existing.status !== 'active') continue;

    const newBadge = newByType.get(existing.badge_type as BadgeType);

    if (!newBadge) {
      // Badge no longer earned
      toExpire.push(existing.id);
    } else if (newBadge.tier && newBadge.tier !== existing.tier) {
      // Badge tier changed (upgrade or downgrade)
      if (isUpgrade(existing.tier as 'bronze' | 'silver' | 'gold' | null, newBadge.tier)) {
        toUpgrade.push(newBadge);
      } else {
        // Downgrade - keep existing
        unchanged.push(existing.id);
      }
    } else {
      unchanged.push(existing.id);
    }
  }

  // Check for new badges
  for (const [type, badge] of newByType) {
    if (!existingByType.has(type)) {
      toAward.push(badge);
    }
  }

  return { toAward, toUpgrade, toExpire, unchanged };
}

function isUpgrade(
  oldTier: 'bronze' | 'silver' | 'gold' | null,
  newTier: 'bronze' | 'silver' | 'gold'
): boolean {
  const tierOrder = { bronze: 1, silver: 2, gold: 3 };
  const oldRank = oldTier ? tierOrder[oldTier] : 0;
  const newRank = tierOrder[newTier];
  return newRank > oldRank;
}

// =============================================================================
// UTILITY: BUILD GROWTH METRICS
// =============================================================================

/**
 * Build a GrowthMetrics object from raw database data
 */
export function buildGrowthMetrics(
  metrics: DbMetricsSnapshot[],
  snapshots: DbGrowthSnapshot[],
  badges: Badge[],
  verifiedPlatforms: Platform[]
): GrowthMetrics {
  const totalFollowers = metrics.reduce(
    (sum, m) => sum + (m.follower_count || m.subscriber_count || 0),
    0
  );

  // Calculate weighted engagement
  let totalWeightedEngagement = 0;
  let totalWeight = 0;
  for (const m of metrics) {
    const followers = m.follower_count || m.subscriber_count || 0;
    const engagement = m.engagement_rate || 0;
    if (followers > 0) {
      totalWeightedEngagement += engagement * followers;
      totalWeight += followers;
    }
  }

  const averageEngagementRate = totalWeight > 0 ? totalWeightedEngagement / totalWeight : 0;
  const { growth7dRate, growth30dRate, growth90dRate, followersGained30d } = calculateGrowthRates(
    snapshots,
    totalFollowers
  );

  // Determine trend
  let trend: 'accelerating' | 'steady' | 'declining' = 'steady';
  if (growth7dRate > growth30dRate * 1.2) {
    trend = 'accelerating';
  } else if (growth7dRate < growth30dRate * 0.5) {
    trend = 'declining';
  }

  // Build platform breakdown
  const byPlatform: GrowthMetrics['byPlatform'] = {} as GrowthMetrics['byPlatform'];
  for (const m of metrics) {
    const platform = m.platform as Platform;
    byPlatform[platform] = {
      followers: m.follower_count || m.subscriber_count || 0,
      engagementRate: m.engagement_rate || 0,
      growth30d: 0, // Would need platform-specific snapshots
      lastSynced: m.recorded_at ? new Date(m.recorded_at) : null,
    };
  }

  // Verification level
  const allPlatformsVerified = metrics.length > 0 && verifiedPlatforms.length === metrics.length;
  const verificationLevel = allPlatformsVerified
    ? 'verified'
    : verifiedPlatforms.length > 0
    ? 'partial'
    : 'self_reported';

  return {
    totalFollowers,
    totalEngagement: Math.round(totalFollowers * (averageEngagementRate / 100)),
    averageEngagementRate,
    growth7d: { followersGained: Math.round(totalFollowers * (growth7dRate / 100)), growthRate: growth7dRate },
    growth30d: { followersGained: followersGained30d, growthRate: growth30dRate },
    growth90d: {
      followersGained: Math.round(totalFollowers * (growth90dRate / 100)),
      growthRate: growth90dRate,
    },
    trend,
    trendConfidence: 75, // Would be calculated from data consistency
    byPlatform,
    badges,
    verificationLevel,
    lastUpdated: new Date(),
  };
}

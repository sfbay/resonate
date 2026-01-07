/**
 * Badge Criteria Configuration
 *
 * Defines the thresholds and requirements for earning each badge type.
 */

import type { BadgeType, BadgeTier, Platform, MessagingPlatform } from '@/types';

// =============================================================================
// CRITERIA TYPES
// =============================================================================

export interface BadgeCriteria {
  type: BadgeType;
  name: string;
  description: string;
  evaluate: (context: BadgeEvaluationContext) => BadgeEvaluationResult;
}

export interface BadgeEvaluationContext {
  // Publisher info
  publisherId: string;

  // Current metrics
  totalFollowers: number;
  averageEngagementRate: number;

  // Growth metrics
  growth7dRate: number;
  growth30dRate: number;
  growth90dRate: number;
  followersGained30d: number;

  // Platform data
  connectedPlatforms: Platform[];
  verifiedPlatforms: Platform[];
  activePlatforms: Platform[]; // Platforms with recent activity

  // Engagement ranking (percentile among all publishers)
  engagementPercentile?: number;
}

export interface BadgeEvaluationResult {
  earned: boolean;
  tier?: BadgeTier;
  criteriaMet?: Array<{
    metric: string;
    value: number;
    threshold: number;
  }>;
  reason?: string;
}

// =============================================================================
// RISING STAR CRITERIA
// =============================================================================

/**
 * Rising Star Badge
 *
 * Awarded for rapid audience growth in the last 30 days.
 * Thresholds are tiered by audience size (smaller accounts need higher growth %).
 */
const RISING_STAR_THRESHOLDS = {
  small: { maxFollowers: 1000, bronze: 30, silver: 50, gold: 75 },
  medium: { maxFollowers: 10000, bronze: 20, silver: 35, gold: 50 },
  large: { maxFollowers: 100000, bronze: 15, silver: 25, gold: 40 },
  huge: { maxFollowers: Infinity, bronze: 10, silver: 20, gold: 35 },
};

function getAudienceTier(followers: number): keyof typeof RISING_STAR_THRESHOLDS {
  if (followers < 1000) return 'small';
  if (followers < 10000) return 'medium';
  if (followers < 100000) return 'large';
  return 'huge';
}

export const risingStarCriteria: BadgeCriteria = {
  type: 'rising_star',
  name: 'Rising Star',
  description: 'Rapid audience growth in the last 30 days',

  evaluate(ctx: BadgeEvaluationContext): BadgeEvaluationResult {
    const tier = getAudienceTier(ctx.totalFollowers);
    const thresholds = RISING_STAR_THRESHOLDS[tier];
    const growthRate = ctx.growth30dRate;

    // Determine badge tier
    let badgeTier: BadgeTier | undefined;
    if (growthRate >= thresholds.gold) {
      badgeTier = 'gold';
    } else if (growthRate >= thresholds.silver) {
      badgeTier = 'silver';
    } else if (growthRate >= thresholds.bronze) {
      badgeTier = 'bronze';
    }

    return {
      earned: !!badgeTier,
      tier: badgeTier,
      criteriaMet: badgeTier
        ? [
            {
              metric: 'growth30dRate',
              value: growthRate,
              threshold: thresholds[badgeTier],
            },
          ]
        : undefined,
      reason: badgeTier
        ? `${growthRate.toFixed(1)}% growth exceeds ${tier} account threshold of ${thresholds[badgeTier]}%`
        : `${growthRate.toFixed(1)}% growth below bronze threshold of ${thresholds.bronze}%`,
    };
  },
};

// =============================================================================
// GROWTH CHAMPION CRITERIA
// =============================================================================

/**
 * Growth Champion Badge
 *
 * Awarded for sustained 50%+ growth over 90 days.
 */
export const growthChampionCriteria: BadgeCriteria = {
  type: 'growth_champion',
  name: 'Growth Champion',
  description: 'Sustained 50%+ growth over 90 days',

  evaluate(ctx: BadgeEvaluationContext): BadgeEvaluationResult {
    const threshold = 50;
    const earned = ctx.growth90dRate >= threshold;

    return {
      earned,
      criteriaMet: earned
        ? [{ metric: 'growth90dRate', value: ctx.growth90dRate, threshold }]
        : undefined,
      reason: earned
        ? `${ctx.growth90dRate.toFixed(1)}% growth over 90 days`
        : `${ctx.growth90dRate.toFixed(1)}% growth below ${threshold}% threshold`,
    };
  },
};

// =============================================================================
// ENGAGEMENT LEADER CRITERIA
// =============================================================================

/**
 * Engagement Leader Badge
 *
 * Awarded to publishers in the top 10% for engagement rate.
 */
export const engagementLeaderCriteria: BadgeCriteria = {
  type: 'engagement_leader',
  name: 'Engagement Leader',
  description: 'Top 10% engagement rate among publishers',

  evaluate(ctx: BadgeEvaluationContext): BadgeEvaluationResult {
    // If we have percentile data, use it
    if (ctx.engagementPercentile !== undefined) {
      const earned = ctx.engagementPercentile >= 90;
      return {
        earned,
        criteriaMet: earned
          ? [{ metric: 'engagementPercentile', value: ctx.engagementPercentile, threshold: 90 }]
          : undefined,
        reason: earned
          ? `Top ${100 - ctx.engagementPercentile}% engagement`
          : `${ctx.engagementPercentile}th percentile (need 90th+)`,
      };
    }

    // Fallback: use absolute engagement rate threshold (5%+ is typically excellent)
    const absoluteThreshold = 5;
    const earned = ctx.averageEngagementRate >= absoluteThreshold;

    return {
      earned,
      criteriaMet: earned
        ? [{ metric: 'engagementRate', value: ctx.averageEngagementRate, threshold: absoluteThreshold }]
        : undefined,
      reason: earned
        ? `${ctx.averageEngagementRate.toFixed(1)}% engagement rate exceeds ${absoluteThreshold}%`
        : `${ctx.averageEngagementRate.toFixed(1)}% engagement rate below ${absoluteThreshold}%`,
    };
  },
};

// =============================================================================
// VERIFIED PUBLISHER CRITERIA
// =============================================================================

/**
 * Verified Publisher Badge
 *
 * Awarded when all connected platforms are verified.
 * Requires at least 2 verified platforms.
 */
export const verifiedPublisherCriteria: BadgeCriteria = {
  type: 'verified_publisher',
  name: 'Verified Publisher',
  description: 'All platforms connected and verified',

  evaluate(ctx: BadgeEvaluationContext): BadgeEvaluationResult {
    const minPlatforms = 2;
    const hasEnoughPlatforms = ctx.verifiedPlatforms.length >= minPlatforms;
    const allVerified =
      ctx.connectedPlatforms.length > 0 &&
      ctx.connectedPlatforms.length === ctx.verifiedPlatforms.length;

    const earned = hasEnoughPlatforms && allVerified;

    return {
      earned,
      criteriaMet: earned
        ? [{ metric: 'verifiedPlatforms', value: ctx.verifiedPlatforms.length, threshold: minPlatforms }]
        : undefined,
      reason: earned
        ? `${ctx.verifiedPlatforms.length} platforms verified`
        : !hasEnoughPlatforms
        ? `Need ${minPlatforms}+ verified platforms (have ${ctx.verifiedPlatforms.length})`
        : `${ctx.connectedPlatforms.length - ctx.verifiedPlatforms.length} platforms not yet verified`,
    };
  },
};

// =============================================================================
// EMERGING CHANNEL CRITERIA
// =============================================================================

/**
 * Emerging Channel Badge
 *
 * Awarded for being active on messaging platforms.
 * Prioritizes WhatsApp but recognizes any messaging platform.
 */
const MESSAGING_PLATFORMS: MessagingPlatform[] = ['whatsapp', 'telegram', 'signal', 'sms', 'weibo'];

export const emergingChannelCriteria: BadgeCriteria = {
  type: 'emerging_channel',
  name: 'Emerging Channel',
  description: 'Active on messaging platforms (WhatsApp, Telegram, etc.)',

  evaluate(ctx: BadgeEvaluationContext): BadgeEvaluationResult {
    const activeMessagingPlatforms = ctx.activePlatforms.filter((p) =>
      MESSAGING_PLATFORMS.includes(p as MessagingPlatform)
    );

    const earned = activeMessagingPlatforms.length > 0;

    // Give extra recognition for WhatsApp (prioritized in plan)
    const hasWhatsApp = activeMessagingPlatforms.includes('whatsapp');

    return {
      earned,
      tier: hasWhatsApp ? 'gold' : earned ? 'bronze' : undefined,
      criteriaMet: earned
        ? [{ metric: 'messagingPlatforms', value: activeMessagingPlatforms.length, threshold: 1 }]
        : undefined,
      reason: earned
        ? `Active on ${activeMessagingPlatforms.join(', ')}`
        : 'No messaging platforms connected',
    };
  },
};

// =============================================================================
// COMMUNITY BUILDER CRITERIA
// =============================================================================

/**
 * Community Builder Badge
 *
 * Awarded for strong local community engagement.
 * Based on consistent engagement and local audience focus.
 */
export const communityBuilderCriteria: BadgeCriteria = {
  type: 'community_builder',
  name: 'Community Builder',
  description: 'Strong local community engagement',

  evaluate(ctx: BadgeEvaluationContext): BadgeEvaluationResult {
    // Requires: decent engagement + consistent growth + multiple platforms
    const hasGoodEngagement = ctx.averageEngagementRate >= 3;
    const hasConsistentGrowth = ctx.growth30dRate > 0 && ctx.growth90dRate > 0;
    const hasMultiplePlatforms = ctx.activePlatforms.length >= 2;

    const earned = hasGoodEngagement && hasConsistentGrowth && hasMultiplePlatforms;

    return {
      earned,
      criteriaMet: earned
        ? [
            { metric: 'engagementRate', value: ctx.averageEngagementRate, threshold: 3 },
            { metric: 'activePlatforms', value: ctx.activePlatforms.length, threshold: 2 },
          ]
        : undefined,
      reason: earned
        ? 'Strong engagement across multiple platforms with consistent growth'
        : !hasGoodEngagement
        ? `Engagement rate ${ctx.averageEngagementRate.toFixed(1)}% below 3% threshold`
        : !hasMultiplePlatforms
        ? `Need 2+ active platforms (have ${ctx.activePlatforms.length})`
        : 'Inconsistent growth pattern',
    };
  },
};

// =============================================================================
// CRITERIA REGISTRY
// =============================================================================

export const ALL_BADGE_CRITERIA: BadgeCriteria[] = [
  risingStarCriteria,
  growthChampionCriteria,
  engagementLeaderCriteria,
  verifiedPublisherCriteria,
  emergingChannelCriteria,
  communityBuilderCriteria,
];

export function getCriteria(type: BadgeType): BadgeCriteria | undefined {
  return ALL_BADGE_CRITERIA.find((c) => c.type === type);
}

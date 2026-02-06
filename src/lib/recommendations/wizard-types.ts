/**
 * Wizard Types
 *
 * Type definitions for the Growth Opportunities wizard.
 * Keeps wizard-specific concerns separate from the existing recommendation system.
 */

import type { RecommendationType, RecommendationPriority, PlatformType } from '@/lib/db/types';
import type { NeighborhoodCensusData } from '@/lib/census/sf-census-data';
import type { CityEvictionStats } from '@/lib/datasf/types';
import type { DbAudienceProfile } from '@/lib/db/types';

// =============================================================================
// WIZARD CATEGORIES
// =============================================================================

export type WizardCategory =
  | 'audience_growth'
  | 'social_strategy'
  | 'platform_expansion'
  | 'community_landscape';

export const WIZARD_CATEGORIES: Record<WizardCategory, {
  label: string;
  description: string;
  icon: string;
}> = {
  audience_growth: {
    label: 'Audience Growth',
    description: 'Discover new neighborhoods and demographics to reach',
    icon: '👥',
  },
  social_strategy: {
    label: 'Social Media Strategy',
    description: 'Optimize your posting timing, cadence, and content mix',
    icon: '📱',
  },
  platform_expansion: {
    label: 'Platform Expansion',
    description: 'Find platforms where your audience is active',
    icon: '🚀',
  },
  community_landscape: {
    label: 'Community Landscape',
    description: 'Civic data signals relevant to your coverage areas',
    icon: '🏘️',
  },
};

// Maps each recommendation type to its wizard category
export const TYPE_TO_CATEGORY: Record<string, WizardCategory> = {
  neighborhood_expansion: 'audience_growth',
  demographic_reach: 'audience_growth',
  social_media_timing: 'social_strategy',
  content_series: 'social_strategy',
  platform_recommendation: 'platform_expansion',
  community_landscape: 'community_landscape',
};

// =============================================================================
// WIZARD DATA (lazy-loaded when wizard opens)
// =============================================================================

export interface WizardData {
  censusData: Record<string, NeighborhoodCensusData>;
  evictionStats: CityEvictionStats | null;
  audienceProfile: DbAudienceProfile | null;
  allNeighborhoods: string[];
  publisherNeighborhoods: string[];
  publisherPlatforms: PlatformType[];
}

// =============================================================================
// WIZARD RECOMMENDATION
// =============================================================================

export interface WizardRecommendation {
  id: string;
  type: RecommendationType;
  category: WizardCategory;
  priority: RecommendationPriority;
  title: string;
  summary: string;
  detail?: string;
  supportingData?: string;
  potentialReach?: number;
  confidence: number;
  basedOn: string;
}

// =============================================================================
// WIZARD RULE (matches template-engine pattern)
// =============================================================================

export interface WizardRuleContext {
  publisherId: string;
  publisherName: string;
  wizardData: WizardData;
  performanceData?: {
    posts: Array<{
      platform: PlatformType;
      contentType: string;
      publishedAt: Date;
      likes: number;
      comments: number;
      shares: number;
      engagementRate?: number;
    }>;
    avgEngagementRate: number;
    growthRate30d: number;
    totalFollowers: number;
  };
}

export interface WizardRule {
  id: string;
  type: RecommendationType;
  category: WizardCategory;
  check: (context: WizardRuleContext) => WizardRuleResult | null;
}

export interface WizardRuleResult {
  priority: RecommendationPriority;
  title: string;
  summary: string;
  detail?: string;
  supportingData?: string;
  potentialReach?: number;
  basedOn: string;
  confidence: number;
}

// =============================================================================
// GROUPED RESULTS (for panel display)
// =============================================================================

export interface WizardResults {
  byCategory: Record<WizardCategory, WizardRecommendation[]>;
  totalCount: number;
  generatedAt: Date;
}

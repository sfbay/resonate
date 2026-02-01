/**
 * Media Kit Types
 *
 * Data structures for the publisher media kit / sell sheet
 */

import type { Platform, Badge, SFNeighborhood } from '@/types';

// Core media kit data structure
export interface MediaKitData {
  // Publisher identity
  publisher: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    tagline: string | null;
    logoUrl: string | null;
    coverImageUrl: string | null;
    accentColor: string | null;
  };

  // Aggregate reach metrics
  reach: {
    totalFollowers: number;
    totalMonthlyImpressions: number | null;
    platforms: PlatformReach[];
  };

  // Audience demographics (from census overlay)
  demographics: {
    topLanguages: { language: string; percentage: number }[];
    incomeDistribution: {
      veryLow: number;
      low: number;
      moderate: number;
      aboveModerate: number;
    };
    ageDistribution: {
      under25: number;
      age25to44: number;
      age45to64: number;
      age65plus: number;
    };
    topEthnicities: { ethnicity: string; percentage: number }[];
  };

  // Geographic coverage
  geography: {
    isCitywide: boolean;
    neighborhoods: SFNeighborhood[];
    primaryNeighborhoods: SFNeighborhood[];
    coverageMapUrl?: string;
  };

  // Growth & credibility proof
  growth: {
    trend: 'accelerating' | 'steady' | 'declining';
    growth30d: { followers: number; percentage: number };
    growth90d: { followers: number; percentage: number };
    badges: Badge[];
    verificationLevel: 'verified' | 'partial' | 'self_reported';
  };

  // Engagement quality
  engagement: {
    averageRate: number;
    rateVsCityAverage: 'above' | 'at' | 'below';
    topPlatformRate: { platform: Platform; rate: number };
  };

  // Top performing content
  topContent: TopPost[];

  // Contact & booking
  contact: {
    showEmail: boolean;
    email: string | null;
    bookingUrl: string | null;
  };

  // Social proof
  socialProof: {
    featuredCampaigns: FeaturedCampaign[];
    testimonials: Testimonial[];
  };

  // Meta
  lastUpdated: Date;
  viewCount: number;
}

export interface PlatformReach {
  platform: Platform;
  handle: string | null;
  followers: number;
  engagementRate: number;
  verified: boolean;
  url?: string;
}

export interface TopPost {
  id: string;
  platform: Platform;
  thumbnailUrl: string | null;
  caption: string | null;
  publishedAt: Date;
  impressions: number | null;
  engagementScore: number;
  engagementRate: number | null;
}

export interface FeaturedCampaign {
  name: string;
  department: string;
  date: string;
  logoUrl?: string;
  description?: string;
}

export interface Testimonial {
  author: string;
  organization: string;
  quote: string;
  date: string;
}

// Settings for media kit display
export interface MediaKitSettings {
  visibility: 'public' | 'authenticated' | 'private';
  showFollowerCounts: boolean;
  showEngagementRates: boolean;
  showGrowthMetrics: boolean;
  showAudienceDemographics: boolean;
  showTopContent: boolean;
  showBadges: boolean;
  showWebTraffic: boolean;
  displayedPlatforms: Platform[] | null;
}

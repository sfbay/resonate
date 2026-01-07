/**
 * Database types for Supabase
 * These types mirror the SQL schema and provide type safety for database operations
 */

// =============================================================================
// ENUMS
// =============================================================================

export type VendorStatus = 'not_registered' | 'registration_in_progress' | 'registered' | 'registration_expired';
export type PublisherStatus = 'pending_review' | 'active' | 'suspended' | 'inactive';
export type PlatformType = 'instagram' | 'facebook' | 'tiktok' | 'twitter' | 'youtube' | 'mailchimp' | 'substack' | 'whatsapp' | 'telegram' | 'signal' | 'sms' | 'weibo' | 'newsletter' | 'website' | 'other';
export type ConnectionStatus = 'active' | 'expired' | 'revoked' | 'pending';
export type BadgeType = 'rising_star' | 'growth_champion' | 'engagement_leader' | 'verified_publisher' | 'emerging_channel' | 'community_builder';
export type BadgeTier = 'bronze' | 'silver' | 'gold';
export type BadgeStatus = 'active' | 'expired' | 'revoked';
export type VerificationLevel = 'self_reported' | 'partial' | 'verified';
export type GrowthPeriod = 'daily' | 'weekly' | 'monthly';

// =============================================================================
// TABLE TYPES
// =============================================================================

export interface DbPublisher {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  website: string | null;
  vendor_status: VendorStatus;
  vendor_id: string | null;
  vendor_registration_date: string | null;
  status: PublisherStatus;
  created_at: string;
  updated_at: string;
}

export interface DbPlatformConnection {
  id: string;
  publisher_id: string;
  platform: PlatformType;
  platform_user_id: string | null;
  handle: string | null;
  url: string | null;
  access_token: string | null; // encrypted
  refresh_token: string | null; // encrypted
  token_expires_at: string | null;
  scopes: string[] | null;
  verified: boolean;
  last_synced_at: string | null;
  connected_at: string;
  status: ConnectionStatus;
}

export interface DbMetricsSnapshot {
  id: string;
  publisher_id: string;
  platform: PlatformType;
  recorded_at: string;

  // Core metrics
  follower_count: number | null;
  following_count: number | null;
  post_count: number | null;

  // Engagement metrics
  engagement_rate: number | null;
  avg_likes: number | null;
  avg_comments: number | null;
  avg_shares: number | null;
  avg_saves: number | null;

  // Demographics (JSONB)
  demographics: PlatformDemographics | null;

  // Newsletter-specific
  subscriber_count: number | null;
  open_rate: number | null;
  click_rate: number | null;

  // Platform-specific metadata
  platform_data: Record<string, unknown> | null;
}

export interface DbGrowthSnapshot {
  id: string;
  publisher_id: string;
  platform: PlatformType | null; // null for aggregate
  snapshot_date: string;

  // Growth metrics
  followers_start: number | null;
  followers_end: number | null;
  followers_gained: number | null;
  followers_lost: number | null;
  net_growth: number | null;
  growth_rate_percent: number | null;

  // Engagement trend
  engagement_rate_start: number | null;
  engagement_rate_end: number | null;

  // Period
  period_type: GrowthPeriod;
}

export interface DbGrowthBadge {
  id: string;
  publisher_id: string;
  badge_type: BadgeType;
  tier: BadgeTier | null;
  awarded_at: string;
  expires_at: string | null;
  criteria_met: Record<string, unknown> | null;
  platform: PlatformType | null;
  status: BadgeStatus;
}

export interface DbAudienceProfile {
  id: string;
  publisher_id: string;

  // Geographic
  citywide: boolean;
  neighborhoods: string[] | null;
  zip_codes: string[] | null;
  supervisorial_districts: number[] | null;
  coverage_by_area: Record<string, number> | null;

  // Demographic
  age_ranges: string[] | null;
  primary_age_range: string | null;
  languages: string[] | null;
  primary_language: string | null;
  gender_distribution: GenderDistribution | null;
  education_levels: string[] | null;
  family_status: string[] | null;

  // Economic
  income_levels: string[] | null;
  housing_status: string[] | null;
  employment_status: string[] | null;
  business_owners: boolean | null;
  public_benefits_recipients: boolean | null;
  benefit_programs: string[] | null;

  // Cultural
  ethnicities: string[] | null;
  primary_ethnicity: string | null;
  immigration_generation: string[] | null;
  community_affiliations: string[] | null;
  identity_factors: string[] | null;

  // Interests
  interests: string[] | null;
  description: string | null;

  // Data quality
  data_source: DataSourceInfo | null;
  verification_level: VerificationLevel;
  confidence_score: number | null;
  last_updated: string;
}

export interface DbRateCard {
  id: string;
  publisher_id: string;
  currency: string;
  notes: string | null;
  updated_at: string;
}

export interface DbRate {
  id: string;
  rate_card_id: string;
  deliverable_type: string;
  platform: PlatformType;
  price: number; // in cents
  description: string | null;
}

export interface DbPublisherAnnotation {
  id: string;
  publisher_id: string;
  annotation_type: string;
  neighborhoods: string[] | null;
  content: Record<string, unknown>;
  visibility: string;
  created_at: string;
  updated_at: string;
}

export interface DbPlatformSyncLog {
  id: string;
  publisher_id: string;
  platform: PlatformType;
  sync_type: string;
  status: string;
  records_synced: number | null;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface DbContentPerformance {
  id: string;
  publisher_id: string;
  platform: PlatformType;
  content_id: string;
  content_type: string | null;
  published_at: string | null;

  // Performance metrics
  impressions: number | null;
  reach: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  clicks: number | null;

  // Engagement rate for this content
  engagement_rate: number | null;

  // Content metadata
  caption_excerpt: string | null;
  media_type: string | null;
  hashtags: string[] | null;

  recorded_at: string;
}

// =============================================================================
// JSONB TYPES
// =============================================================================

export interface PlatformDemographics {
  ageRanges?: Array<{ range: string; percentage: number }>;
  genderSplit?: { male: number; female: number; other: number };
  topCities?: Array<{ city: string; percentage: number }>;
  topCountries?: Array<{ country: string; percentage: number }>;
}

export interface GenderDistribution {
  male: number;
  female: number;
  other?: number;
}

export interface DataSourceInfo {
  collectionMethod: string;
  platformConnections?: string[];
  verificationLevel: VerificationLevel;
  lastUpdated: string;
}

// =============================================================================
// DATABASE SCHEMA TYPE (for Supabase client)
// =============================================================================

export interface Database {
  public: {
    Tables: {
      publishers: {
        Row: DbPublisher;
        Insert: Omit<DbPublisher, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DbPublisher, 'id'>>;
      };
      platform_connections: {
        Row: DbPlatformConnection;
        Insert: Omit<DbPlatformConnection, 'id' | 'connected_at'> & {
          id?: string;
          connected_at?: string;
        };
        Update: Partial<Omit<DbPlatformConnection, 'id'>>;
      };
      metrics_snapshots: {
        Row: DbMetricsSnapshot;
        Insert: Omit<DbMetricsSnapshot, 'id' | 'recorded_at'> & {
          id?: string;
          recorded_at?: string;
        };
        Update: Partial<Omit<DbMetricsSnapshot, 'id'>>;
      };
      growth_snapshots: {
        Row: DbGrowthSnapshot;
        Insert: Omit<DbGrowthSnapshot, 'id'> & { id?: string };
        Update: Partial<Omit<DbGrowthSnapshot, 'id'>>;
      };
      growth_badges: {
        Row: DbGrowthBadge;
        Insert: Omit<DbGrowthBadge, 'id' | 'awarded_at'> & {
          id?: string;
          awarded_at?: string;
        };
        Update: Partial<Omit<DbGrowthBadge, 'id'>>;
      };
      audience_profiles: {
        Row: DbAudienceProfile;
        Insert: Omit<DbAudienceProfile, 'id' | 'last_updated'> & {
          id?: string;
          last_updated?: string;
        };
        Update: Partial<Omit<DbAudienceProfile, 'id'>>;
      };
      rate_cards: {
        Row: DbRateCard;
        Insert: Omit<DbRateCard, 'id' | 'updated_at'> & {
          id?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DbRateCard, 'id'>>;
      };
      rates: {
        Row: DbRate;
        Insert: Omit<DbRate, 'id'> & { id?: string };
        Update: Partial<Omit<DbRate, 'id'>>;
      };
      publisher_annotations: {
        Row: DbPublisherAnnotation;
        Insert: Omit<DbPublisherAnnotation, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DbPublisherAnnotation, 'id'>>;
      };
      platform_sync_logs: {
        Row: DbPlatformSyncLog;
        Insert: Omit<DbPlatformSyncLog, 'id' | 'started_at'> & {
          id?: string;
          started_at?: string;
        };
        Update: Partial<Omit<DbPlatformSyncLog, 'id'>>;
      };
      content_performance: {
        Row: DbContentPerformance;
        Insert: Omit<DbContentPerformance, 'id' | 'recorded_at'> & {
          id?: string;
          recorded_at?: string;
        };
        Update: Partial<Omit<DbContentPerformance, 'id'>>;
      };
    };
  };
}

// =============================================================================
// HELPER TYPES FOR APPLICATION USE
// =============================================================================

/** Publisher with all related data loaded */
export interface PublisherWithRelations extends DbPublisher {
  platform_connections?: DbPlatformConnection[];
  audience_profile?: DbAudienceProfile;
  rate_card?: DbRateCard & { rates: DbRate[] };
  badges?: DbGrowthBadge[];
  latest_metrics?: DbMetricsSnapshot[];
}

/** Aggregated metrics across all platforms */
export interface AggregatedMetrics {
  totalFollowers: number;
  totalEngagement: number;
  averageEngagementRate: number;
  platformBreakdown: Record<PlatformType, {
    followers: number;
    engagementRate: number;
    lastSynced: string | null;
  }>;
  dataQuality: VerificationLevel;
  lastSynced: string | null;
}

/** Growth summary for display */
export interface GrowthSummary {
  period: '7d' | '30d' | '90d';
  overall: {
    followersGained: number;
    growthRate: number;
    trend: 'accelerating' | 'steady' | 'declining';
  };
  byPlatform: Record<PlatformType, {
    followersStart: number;
    followersEnd: number;
    netGrowth: number;
    growthRate: number;
  }>;
  badges: DbGrowthBadge[];
}

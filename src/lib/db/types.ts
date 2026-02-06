/**
 * Database types for Supabase
 * These types mirror the SQL schema and provide type safety for database operations
 */

// =============================================================================
// ENUMS
// =============================================================================

export type VendorStatus = 'not_registered' | 'registration_in_progress' | 'registered' | 'registration_expired';
export type PublisherStatus = 'pending_review' | 'active' | 'suspended' | 'inactive';
export type PlatformType = 'instagram' | 'facebook' | 'tiktok' | 'twitter' | 'youtube' | 'mailchimp' | 'substack' | 'whatsapp' | 'telegram' | 'signal' | 'sms' | 'weibo' | 'newsletter' | 'website' | 'other' | 'google';
export type ConnectionStatus = 'active' | 'expired' | 'revoked' | 'pending' | 'error';
export type BadgeType = 'rising_star' | 'growth_champion' | 'engagement_leader' | 'verified_publisher' | 'emerging_channel' | 'community_builder';
export type BadgeTier = 'bronze' | 'silver' | 'gold';
export type BadgeStatus = 'active' | 'expired' | 'revoked';
export type VerificationLevel = 'self_reported' | 'partial' | 'verified';
export type GrowthPeriod = 'daily' | 'weekly' | 'monthly';

// New types for analytics features
export type ContentType = 'post' | 'story' | 'reel' | 'video' | 'carousel' | 'article' | 'newsletter' | 'broadcast';
export type RecommendationType = 'content_timing' | 'content_format' | 'hashtag_strategy' | 'audience_growth' | 'engagement_boost' | 'cross_platform' | 'trending_topic' | 'competitor_insight' | 'web_traffic' | 'monetization' | 'neighborhood_expansion' | 'demographic_reach' | 'social_media_timing' | 'content_series' | 'platform_recommendation' | 'community_landscape';
export type RecommendationPriority = 'high' | 'medium' | 'low';
export type MediaKitVisibility = 'public' | 'authenticated' | 'private';
export type AnalyticsProvider = 'google_analytics' | 'plausible' | 'fathom' | 'simple_analytics';
export type SyncFrequency = 'hourly' | 'every_6_hours' | 'daily' | 'weekly';

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
  content_type: ContentType | null;
  content_url: string | null;
  published_at: string | null;

  // Performance metrics
  impressions: number | null;
  reach: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  clicks: number | null;
  video_views: number | null;
  watch_time_seconds: number | null;

  // Engagement metrics
  engagement_rate: number | null;
  engagement_score: number; // Computed: likes + comments*3 + shares*5 + saves*2

  // Content metadata
  caption_excerpt: string | null;
  thumbnail_url: string | null;
  media_type: string | null;
  hashtags: string[] | null;
  mentions: string[] | null;

  // UTM tracking
  utm_campaign: string | null;
  utm_content: string | null;

  recorded_at: string;
}

export interface DbAIRecommendation {
  id: string;
  publisher_id: string;
  recommendation_type: RecommendationType;
  priority: RecommendationPriority;
  title: string;
  summary: string;
  detailed_explanation: string | null;
  action_items: RecommendationActionItem[] | null;
  context: RecommendationContext | null;
  platform: PlatformType | null;
  is_ai_generated: boolean;
  ai_model: string | null;
  status: 'active' | 'dismissed' | 'completed' | 'expired';
  dismissed_at: string | null;
  completed_at: string | null;
  valid_from: string;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbMediaKitSettings {
  id: string;
  publisher_id: string;
  visibility: MediaKitVisibility;
  custom_slug: string | null;

  // Display preferences
  show_follower_counts: boolean;
  show_engagement_rates: boolean;
  show_growth_metrics: boolean;
  show_audience_demographics: boolean;
  show_top_content: boolean;
  show_badges: boolean;
  show_web_traffic: boolean;
  displayed_platforms: PlatformType[] | null;

  // Custom content
  headline: string | null;
  bio: string | null;
  mission_statement: string | null;

  // Branding
  accent_color: string | null;
  custom_logo_url: string | null;
  cover_image_url: string | null;

  // Contact
  show_contact_email: boolean;
  contact_email: string | null;
  booking_url: string | null;

  // Social proof
  featured_campaigns: FeaturedCampaign[] | null;
  testimonials: Testimonial[] | null;

  // Analytics
  view_count: number;
  last_viewed_at: string | null;

  created_at: string;
  updated_at: string;
}

export interface DbWebAnalyticsConnection {
  id: string;
  publisher_id: string;
  provider: AnalyticsProvider;
  property_id: string | null;
  property_name: string | null;
  website_url: string | null;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  scopes: string[] | null;
  status: ConnectionStatus;
  last_synced_at: string | null;
  last_sync_error: string | null;
  connected_at: string;
  updated_at: string;
}

export interface DbWebTrafficSnapshot {
  id: string;
  publisher_id: string;
  connection_id: string | null;
  snapshot_date: string;

  // Traffic metrics
  total_users: number | null;
  new_users: number | null;
  returning_users: number | null;
  sessions: number | null;
  pageviews: number | null;
  unique_pageviews: number | null;

  // Engagement
  avg_session_duration_seconds: number | null;
  pages_per_session: number | null;
  bounce_rate: number | null;
  engagement_rate: number | null;

  // Breakdown (JSONB)
  traffic_sources: TrafficSourceBreakdown | null;
  social_traffic: SocialTrafficBreakdown | null;
  top_cities: CityTraffic[] | null;
  device_breakdown: DeviceBreakdown | null;

  recorded_at: string;
}

export interface DbWebArticlePerformance {
  id: string;
  publisher_id: string;
  connection_id: string | null;
  page_path: string;
  page_title: string | null;
  published_date: string | null;
  snapshot_date: string;

  // Metrics
  pageviews: number | null;
  unique_pageviews: number | null;
  users: number | null;
  avg_time_on_page_seconds: number | null;
  bounce_rate: number | null;
  exit_rate: number | null;

  // Sources
  traffic_sources: TrafficSourceBreakdown | null;
  social_traffic: SocialTrafficBreakdown | null;

  recorded_at: string;
}

export interface DbSocialWebAttribution {
  id: string;
  publisher_id: string;
  content_id: string | null;
  platform: PlatformType;
  post_id: string | null;
  posted_at: string | null;

  // UTM
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;

  // Attribution metrics
  attributed_users: number;
  attributed_sessions: number;
  attributed_pageviews: number;
  attributed_conversions: number;

  // Engagement quality
  avg_session_duration_seconds: number | null;
  pages_per_session: number | null;
  bounce_rate: number | null;

  attribution_date: string;
  created_at: string;
  updated_at: string;
}

export interface DbPlatformSyncSchedule {
  id: string;
  publisher_id: string;
  platform: PlatformType;
  connection_id: string | null;
  frequency: SyncFrequency;
  is_enabled: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  sync_metrics: boolean;
  sync_content: boolean;
  sync_demographics: boolean;
  content_limit: number;
  last_status: 'success' | 'partial' | 'failed' | null;
  last_error: string | null;
  consecutive_failures: number;
  created_at: string;
  updated_at: string;
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

// AI Recommendations JSONB types
export interface RecommendationActionItem {
  text: string;
  completed: boolean;
}

export interface RecommendationContext {
  basedOn: string;
  dataPoints: number;
  confidenceScore: number;
  relatedMetrics?: Record<string, number>;
}

// Media Kit JSONB types
export interface FeaturedCampaign {
  name: string;
  date: string;
  logo?: string;
  testimonial?: string;
}

export interface Testimonial {
  author: string;
  org: string;
  quote: string;
  date: string;
}

// Web Traffic JSONB types
export interface TrafficSourceBreakdown {
  organic_search?: TrafficSourceData;
  direct?: TrafficSourceData;
  social?: TrafficSourceData;
  referral?: TrafficSourceData;
  email?: TrafficSourceData;
  paid_search?: TrafficSourceData;
  display?: TrafficSourceData;
}

export interface TrafficSourceData {
  users: number;
  sessions: number;
  percent: number;
}

export interface SocialTrafficBreakdown {
  instagram?: SocialTrafficData;
  tiktok?: SocialTrafficData;
  facebook?: SocialTrafficData;
  twitter?: SocialTrafficData;
  youtube?: SocialTrafficData;
  linkedin?: SocialTrafficData;
}

export interface SocialTrafficData {
  users: number;
  sessions: number;
}

export interface CityTraffic {
  city: string;
  users: number;
  percent: number;
}

export interface DeviceBreakdown {
  mobile: number;
  desktop: number;
  tablet: number;
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
        Insert: Omit<DbContentPerformance, 'id' | 'recorded_at' | 'engagement_score'> & {
          id?: string;
          recorded_at?: string;
        };
        Update: Partial<Omit<DbContentPerformance, 'id' | 'engagement_score'>>;
      };
      ai_recommendations: {
        Row: DbAIRecommendation;
        Insert: Omit<DbAIRecommendation, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DbAIRecommendation, 'id'>>;
      };
      media_kit_settings: {
        Row: DbMediaKitSettings;
        Insert: Omit<DbMediaKitSettings, 'id' | 'created_at' | 'updated_at' | 'view_count'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          view_count?: number;
        };
        Update: Partial<Omit<DbMediaKitSettings, 'id'>>;
      };
      web_analytics_connections: {
        Row: DbWebAnalyticsConnection;
        Insert: Omit<DbWebAnalyticsConnection, 'id' | 'connected_at' | 'updated_at'> & {
          id?: string;
          connected_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DbWebAnalyticsConnection, 'id'>>;
      };
      web_traffic_snapshots: {
        Row: DbWebTrafficSnapshot;
        Insert: Omit<DbWebTrafficSnapshot, 'id' | 'recorded_at'> & {
          id?: string;
          recorded_at?: string;
        };
        Update: Partial<Omit<DbWebTrafficSnapshot, 'id'>>;
      };
      web_article_performance: {
        Row: DbWebArticlePerformance;
        Insert: Omit<DbWebArticlePerformance, 'id' | 'recorded_at'> & {
          id?: string;
          recorded_at?: string;
        };
        Update: Partial<Omit<DbWebArticlePerformance, 'id'>>;
      };
      social_web_attribution: {
        Row: DbSocialWebAttribution;
        Insert: Omit<DbSocialWebAttribution, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DbSocialWebAttribution, 'id'>>;
      };
      platform_sync_schedule: {
        Row: DbPlatformSyncSchedule;
        Insert: Omit<DbPlatformSyncSchedule, 'id' | 'created_at' | 'updated_at' | 'consecutive_failures'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          consecutive_failures?: number;
        };
        Update: Partial<Omit<DbPlatformSyncSchedule, 'id'>>;
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

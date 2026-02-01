/**
 * OAuth types for platform integrations
 */

import type { Platform } from '@/types';

// =============================================================================
// OAUTH CONFIGURATION
// =============================================================================

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  authorizationUrl: string;
  tokenUrl: string;
}

export interface OAuthState {
  platform: Platform;
  publisherId: string;
  returnUrl?: string;
  nonce: string;
  timestamp: number;
}

// =============================================================================
// TOKEN TYPES
// =============================================================================

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  tokenType: string;
  scopes: string[];
}

export interface TokenRefreshResult {
  success: boolean;
  tokens?: OAuthTokens;
  error?: string;
}

// =============================================================================
// PLATFORM-SPECIFIC RESPONSES
// =============================================================================

export interface MetaTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface MetaUserResponse {
  id: string;
  name?: string;
}

export interface MetaPageResponse {
  id: string;
  name: string;
  access_token: string;
  category?: string;
}

export interface MetaInstagramAccountResponse {
  id: string;
  username: string;
  name?: string;
  profile_picture_url?: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
}

export interface MetaInstagramInsightsResponse {
  data: Array<{
    name: string;
    period: string;
    values: Array<{ value: number | Record<string, number> }>;
    title: string;
    description: string;
    id: string;
  }>;
}

// =============================================================================
// METRICS TYPES
// =============================================================================

export interface PlatformMetrics {
  platform: Platform;
  fetchedAt: Date;

  // Core metrics
  followerCount?: number;
  followingCount?: number;
  postCount?: number;

  // Engagement (last 30 days average)
  engagementRate?: number;
  avgLikes?: number;
  avgComments?: number;
  avgShares?: number;
  avgSaves?: number;

  // Demographics (if available)
  demographics?: {
    ageGender?: Record<string, number>;
    topCities?: Array<{ city: string; count: number }>;
    topCountries?: Array<{ country: string; count: number }>;
  };

  // Newsletter-specific
  subscriberCount?: number;
  openRate?: number;
  clickRate?: number;

  // Platform-specific raw data
  rawData?: Record<string, unknown>;
}

export interface MetricsFetchResult {
  success: boolean;
  metrics?: PlatformMetrics;
  error?: string;
  rateLimited?: boolean;
}

// =============================================================================
// CONTENT TYPES
// =============================================================================

export interface ContentPost {
  id: string;
  platform: Platform;
  contentType: 'post' | 'story' | 'reel' | 'video' | 'carousel' | 'article' | 'newsletter' | 'broadcast';
  publishedAt: Date;
  captionExcerpt?: string;
  contentUrl?: string;
  thumbnailUrl?: string;
  mediaType?: 'image' | 'video' | 'carousel' | 'text';
  hashtags?: string[];
  mentions?: string[];

  // Performance metrics
  impressions?: number;
  reach?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  clicks?: number;
  videoViews?: number;
  watchTimeSeconds?: number;

  // Engagement
  engagementRate?: number;
}

export interface ContentFetchResult {
  success: boolean;
  posts?: ContentPost[];
  error?: string;
  rateLimited?: boolean;
  hasMore?: boolean;
  cursor?: string;
}

// =============================================================================
// TIKTOK API TYPES
// =============================================================================

export interface TikTokTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  open_id: string;
  scope: string;
  token_type: string;
}

export interface TikTokUserInfo {
  open_id: string;
  union_id?: string;
  avatar_url?: string;
  avatar_url_100?: string;
  avatar_large_url?: string;
  display_name?: string;
  bio_description?: string;
  profile_deep_link?: string;
  is_verified?: boolean;
  follower_count?: number;
  following_count?: number;
  likes_count?: number;
  video_count?: number;
}

export interface TikTokVideo {
  id: string;
  create_time: number;
  cover_image_url?: string;
  share_url?: string;
  video_description?: string;
  duration?: number;
  title?: string;
  embed_html?: string;
  embed_link?: string;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
  view_count?: number;
}

export interface TikTokVideoQueryResponse {
  data: {
    videos: TikTokVideo[];
    cursor?: number;
    has_more?: boolean;
  };
  error: {
    code: string;
    message: string;
    log_id: string;
  };
}

// =============================================================================
// MAILCHIMP API TYPES
// =============================================================================

export interface MailchimpTokenResponse {
  access_token: string;
  expires_in?: number;
  scope?: string;
  token_type: string;
}

export interface MailchimpMetadata {
  dc: string; // Data center (e.g., "us1")
  accountname?: string;
  user_id?: number;
  login?: {
    email?: string;
    avatar?: string;
    login_id?: number;
    login_name?: string;
    login_email?: string;
  };
  api_endpoint: string;
}

export interface MailchimpListStats {
  member_count: number;
  unsubscribe_count: number;
  cleaned_count: number;
  member_count_since_send: number;
  unsubscribe_count_since_send: number;
  cleaned_count_since_send: number;
  campaign_count: number;
  campaign_last_sent?: string;
  merge_field_count: number;
  avg_sub_rate: number;
  avg_unsub_rate: number;
  target_sub_rate: number;
  open_rate: number;
  click_rate: number;
  last_sub_date?: string;
  last_unsub_date?: string;
}

export interface MailchimpList {
  id: string;
  web_id: number;
  name: string;
  stats: MailchimpListStats;
  date_created: string;
  list_rating: number;
}

export interface MailchimpCampaign {
  id: string;
  web_id: number;
  type: string;
  create_time: string;
  archive_url?: string;
  long_archive_url?: string;
  status: string;
  emails_sent: number;
  send_time?: string;
  content_type: string;
  recipients: {
    list_id: string;
    list_name: string;
    segment_text?: string;
    recipient_count: number;
  };
  settings: {
    subject_line?: string;
    preview_text?: string;
    title?: string;
    from_name?: string;
    reply_to?: string;
  };
  report_summary?: {
    opens: number;
    unique_opens: number;
    open_rate: number;
    clicks: number;
    subscriber_clicks: number;
    click_rate: number;
    ecommerce?: {
      total_orders: number;
      total_spent: number;
      total_revenue: number;
    };
  };
}

// =============================================================================
// OAUTH PROVIDER INTERFACE
// =============================================================================

export interface OAuthProvider {
  platform: Platform;

  /** Generate authorization URL with state */
  getAuthorizationUrl(state: OAuthState): string;

  /** Exchange authorization code for tokens */
  exchangeCode(code: string): Promise<OAuthTokens>;

  /** Refresh expired tokens */
  refreshTokens(refreshToken: string): Promise<TokenRefreshResult>;

  /** Revoke tokens on disconnect */
  revokeTokens(accessToken: string): Promise<boolean>;

  /** Fetch current metrics using access token */
  fetchMetrics(accessToken: string): Promise<MetricsFetchResult>;

  /** Fetch content/posts from the platform */
  fetchContent(accessToken: string, options?: ContentFetchOptions): Promise<ContentFetchResult>;

  /** Get connected account info */
  getAccountInfo(accessToken: string): Promise<{
    platformUserId: string;
    handle?: string;
    url?: string;
    profileImageUrl?: string;
  }>;
}

export interface ContentFetchOptions {
  limit?: number;
  cursor?: string;
  since?: Date;
}

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

  /** Get connected account info */
  getAccountInfo(accessToken: string): Promise<{
    platformUserId: string;
    handle?: string;
    url?: string;
  }>;
}

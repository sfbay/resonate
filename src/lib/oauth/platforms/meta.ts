/**
 * Meta Graph API OAuth Integration
 *
 * Handles Instagram Business, Facebook Pages, and WhatsApp Business accounts.
 *
 * Flow:
 * 1. User clicks "Connect Instagram" -> redirect to Meta OAuth
 * 2. Meta redirects back with code -> exchange for user token
 * 3. Fetch user's Facebook Pages
 * 4. Get Instagram Business Account connected to Page
 * 5. Store Page token (long-lived) for API access
 *
 * @see https://developers.facebook.com/docs/instagram-basic-display-api/
 * @see https://developers.facebook.com/docs/instagram-api/
 */

import type {
  OAuthProvider,
  OAuthConfig,
  OAuthState,
  OAuthTokens,
  TokenRefreshResult,
  MetricsFetchResult,
  PlatformMetrics,
  MetaTokenResponse,
  MetaPageResponse,
  MetaInstagramAccountResponse,
  MetaInstagramInsightsResponse,
} from '../types';
import type { Platform } from '@/types';

// =============================================================================
// CONFIGURATION
// =============================================================================

const GRAPH_API_VERSION = 'v18.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

function getMetaConfig(): OAuthConfig {
  const clientId = process.env.META_APP_ID;
  const clientSecret = process.env.META_APP_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!clientId || !clientSecret) {
    throw new Error('Missing META_APP_ID or META_APP_SECRET environment variables');
  }

  return {
    clientId,
    clientSecret,
    redirectUri: `${baseUrl}/api/auth/instagram/callback`,
    scopes: [
      'instagram_basic',
      'instagram_manage_insights',
      'pages_show_list',
      'pages_read_engagement',
      'business_management',
    ],
    authorizationUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: `${GRAPH_API_BASE}/oauth/access_token`,
  };
}

// =============================================================================
// META OAUTH PROVIDER
// =============================================================================

export class MetaOAuthProvider implements OAuthProvider {
  platform: Platform = 'instagram';
  private config: OAuthConfig;

  constructor() {
    this.config = getMetaConfig();
  }

  /**
   * Generate Meta OAuth authorization URL
   */
  getAuthorizationUrl(state: OAuthState): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(','),
      response_type: 'code',
      state: encodeState(state),
    });

    return `${this.config.authorizationUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCode(code: string): Promise<OAuthTokens> {
    // Step 1: Exchange code for short-lived user token
    const tokenUrl = new URL(this.config.tokenUrl);
    tokenUrl.searchParams.set('client_id', this.config.clientId);
    tokenUrl.searchParams.set('client_secret', this.config.clientSecret);
    tokenUrl.searchParams.set('redirect_uri', this.config.redirectUri);
    tokenUrl.searchParams.set('code', code);

    const tokenResponse = await fetch(tokenUrl.toString());
    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    const tokenData: MetaTokenResponse = await tokenResponse.json();

    // Step 2: Exchange for long-lived token (60 days)
    const longLivedUrl = new URL(`${GRAPH_API_BASE}/oauth/access_token`);
    longLivedUrl.searchParams.set('grant_type', 'fb_exchange_token');
    longLivedUrl.searchParams.set('client_id', this.config.clientId);
    longLivedUrl.searchParams.set('client_secret', this.config.clientSecret);
    longLivedUrl.searchParams.set('fb_exchange_token', tokenData.access_token);

    const longLivedResponse = await fetch(longLivedUrl.toString());
    if (!longLivedResponse.ok) {
      // Fall back to short-lived token if long-lived fails
      console.warn('Long-lived token exchange failed, using short-lived token');
      return {
        accessToken: tokenData.access_token,
        tokenType: 'bearer',
        scopes: this.config.scopes,
        expiresAt: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000)
          : undefined,
      };
    }

    const longLivedData: MetaTokenResponse = await longLivedResponse.json();

    return {
      accessToken: longLivedData.access_token,
      tokenType: 'bearer',
      scopes: this.config.scopes,
      expiresAt: longLivedData.expires_in
        ? new Date(Date.now() + longLivedData.expires_in * 1000)
        : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days default
    };
  }

  /**
   * Refresh tokens (Meta tokens can be refreshed before expiry)
   */
  async refreshTokens(currentToken: string): Promise<TokenRefreshResult> {
    try {
      const url = new URL(`${GRAPH_API_BASE}/oauth/access_token`);
      url.searchParams.set('grant_type', 'fb_exchange_token');
      url.searchParams.set('client_id', this.config.clientId);
      url.searchParams.set('client_secret', this.config.clientSecret);
      url.searchParams.set('fb_exchange_token', currentToken);

      const response = await fetch(url.toString());
      if (!response.ok) {
        return { success: false, error: 'Token refresh failed' };
      }

      const data: MetaTokenResponse = await response.json();

      return {
        success: true,
        tokens: {
          accessToken: data.access_token,
          tokenType: 'bearer',
          scopes: this.config.scopes,
          expiresAt: data.expires_in
            ? new Date(Date.now() + data.expires_in * 1000)
            : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Revoke access token
   */
  async revokeTokens(accessToken: string): Promise<boolean> {
    try {
      const url = new URL(`${GRAPH_API_BASE}/me/permissions`);
      url.searchParams.set('access_token', accessToken);

      const response = await fetch(url.toString(), { method: 'DELETE' });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get connected Instagram account info
   */
  async getAccountInfo(accessToken: string): Promise<{
    platformUserId: string;
    handle?: string;
    url?: string;
  }> {
    const instagram = await this.getInstagramBusinessAccount(accessToken);
    if (!instagram) {
      throw new Error('No Instagram Business account found');
    }

    return {
      platformUserId: instagram.id,
      handle: instagram.username ? `@${instagram.username}` : undefined,
      url: instagram.username ? `https://instagram.com/${instagram.username}` : undefined,
    };
  }

  /**
   * Fetch Instagram metrics via Graph API
   */
  async fetchMetrics(accessToken: string): Promise<MetricsFetchResult> {
    try {
      const instagram = await this.getInstagramBusinessAccount(accessToken);
      if (!instagram) {
        return { success: false, error: 'No Instagram Business account found' };
      }

      // Fetch basic metrics from account
      const metrics: PlatformMetrics = {
        platform: 'instagram',
        fetchedAt: new Date(),
        followerCount: instagram.followers_count,
        followingCount: instagram.follows_count,
        postCount: instagram.media_count,
      };

      // Fetch insights (engagement metrics)
      try {
        const insights = await this.fetchInstagramInsights(accessToken, instagram.id);
        if (insights) {
          Object.assign(metrics, insights);
        }
      } catch (insightError) {
        console.warn('Failed to fetch Instagram insights:', insightError);
        // Continue with basic metrics
      }

      // Fetch audience demographics
      try {
        const demographics = await this.fetchAudienceDemographics(accessToken, instagram.id);
        if (demographics) {
          metrics.demographics = demographics;
        }
      } catch (demoError) {
        console.warn('Failed to fetch audience demographics:', demoError);
        // Continue without demographics
      }

      return { success: true, metrics };
    } catch (error) {
      if (error instanceof Error && error.message.includes('rate limit')) {
        return { success: false, error: 'Rate limited', rateLimited: true };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ===========================================================================
  // PRIVATE HELPERS
  // ===========================================================================

  /**
   * Get Instagram Business Account connected to user's Facebook Page
   */
  private async getInstagramBusinessAccount(
    accessToken: string
  ): Promise<MetaInstagramAccountResponse | null> {
    // First get user's Facebook Pages
    const pagesUrl = new URL(`${GRAPH_API_BASE}/me/accounts`);
    pagesUrl.searchParams.set('access_token', accessToken);
    pagesUrl.searchParams.set('fields', 'id,name,access_token,instagram_business_account');

    const pagesResponse = await fetch(pagesUrl.toString());
    if (!pagesResponse.ok) {
      throw new Error('Failed to fetch Facebook Pages');
    }

    const pagesData = await pagesResponse.json();
    const pages: (MetaPageResponse & { instagram_business_account?: { id: string } })[] =
      pagesData.data || [];

    // Find page with connected Instagram Business Account
    const pageWithInstagram = pages.find((p) => p.instagram_business_account);
    if (!pageWithInstagram?.instagram_business_account) {
      return null;
    }

    // Fetch Instagram account details
    const igUrl = new URL(`${GRAPH_API_BASE}/${pageWithInstagram.instagram_business_account.id}`);
    igUrl.searchParams.set('access_token', pageWithInstagram.access_token);
    igUrl.searchParams.set(
      'fields',
      'id,username,name,profile_picture_url,followers_count,follows_count,media_count'
    );

    const igResponse = await fetch(igUrl.toString());
    if (!igResponse.ok) {
      throw new Error('Failed to fetch Instagram account details');
    }

    return igResponse.json();
  }

  /**
   * Fetch Instagram account insights (engagement metrics)
   */
  private async fetchInstagramInsights(
    accessToken: string,
    igAccountId: string
  ): Promise<Partial<PlatformMetrics> | null> {
    const url = new URL(`${GRAPH_API_BASE}/${igAccountId}/insights`);
    url.searchParams.set('access_token', accessToken);
    url.searchParams.set('metric', 'impressions,reach,profile_views');
    url.searchParams.set('period', 'day');

    const response = await fetch(url.toString());
    if (!response.ok) {
      return null;
    }

    const data: MetaInstagramInsightsResponse = await response.json();

    // Extract engagement metrics from insights
    const metricsMap: Record<string, number> = {};
    for (const insight of data.data) {
      const value = insight.values[0]?.value;
      if (typeof value === 'number') {
        metricsMap[insight.name] = value;
      }
    }

    // Calculate engagement rate from recent media
    const engagementRate = await this.calculateEngagementRate(accessToken, igAccountId);

    return {
      engagementRate,
      rawData: metricsMap,
    };
  }

  /**
   * Calculate engagement rate from recent posts
   */
  private async calculateEngagementRate(
    accessToken: string,
    igAccountId: string
  ): Promise<number | undefined> {
    const url = new URL(`${GRAPH_API_BASE}/${igAccountId}/media`);
    url.searchParams.set('access_token', accessToken);
    url.searchParams.set('fields', 'like_count,comments_count');
    url.searchParams.set('limit', '25');

    const response = await fetch(url.toString());
    if (!response.ok) {
      return undefined;
    }

    const data = await response.json();
    const media = data.data || [];

    if (media.length === 0) {
      return undefined;
    }

    // Get follower count for engagement rate calculation
    const accountUrl = new URL(`${GRAPH_API_BASE}/${igAccountId}`);
    accountUrl.searchParams.set('access_token', accessToken);
    accountUrl.searchParams.set('fields', 'followers_count');

    const accountResponse = await fetch(accountUrl.toString());
    if (!accountResponse.ok) {
      return undefined;
    }

    const accountData = await accountResponse.json();
    const followers = accountData.followers_count || 0;

    if (followers === 0) {
      return undefined;
    }

    // Calculate average engagement
    let totalEngagement = 0;
    for (const post of media) {
      totalEngagement += (post.like_count || 0) + (post.comments_count || 0);
    }

    const avgEngagement = totalEngagement / media.length;
    return Math.round((avgEngagement / followers) * 10000) / 100; // Percentage with 2 decimals
  }

  /**
   * Fetch audience demographics from Instagram insights
   */
  private async fetchAudienceDemographics(
    accessToken: string,
    igAccountId: string
  ): Promise<PlatformMetrics['demographics'] | null> {
    const url = new URL(`${GRAPH_API_BASE}/${igAccountId}/insights`);
    url.searchParams.set('access_token', accessToken);
    url.searchParams.set('metric', 'audience_city,audience_country,audience_gender_age');
    url.searchParams.set('period', 'lifetime');

    const response = await fetch(url.toString());
    if (!response.ok) {
      return null;
    }

    const data: MetaInstagramInsightsResponse = await response.json();

    const demographics: PlatformMetrics['demographics'] = {};

    for (const insight of data.data) {
      const value = insight.values[0]?.value;
      if (!value || typeof value !== 'object') continue;

      switch (insight.name) {
        case 'audience_gender_age':
          demographics.ageGender = value as Record<string, number>;
          break;
        case 'audience_city':
          demographics.topCities = Object.entries(value as Record<string, number>)
            .map(([city, count]) => ({ city, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
          break;
        case 'audience_country':
          demographics.topCountries = Object.entries(value as Record<string, number>)
            .map(([country, count]) => ({ country, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
          break;
      }
    }

    return Object.keys(demographics).length > 0 ? demographics : null;
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Encode OAuth state for URL transport
 */
export function encodeState(state: OAuthState): string {
  return Buffer.from(JSON.stringify(state)).toString('base64url');
}

/**
 * Decode OAuth state from URL
 */
export function decodeState(encoded: string): OAuthState {
  try {
    return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8'));
  } catch {
    throw new Error('Invalid OAuth state');
  }
}

/**
 * Verify state hasn't expired (5 minute window)
 */
export function verifyStateTimestamp(state: OAuthState): boolean {
  const MAX_AGE = 5 * 60 * 1000; // 5 minutes
  return Date.now() - state.timestamp < MAX_AGE;
}

// Note: We don't export a singleton here because getMetaConfig() throws
// if META_APP_ID/META_APP_SECRET are not set. This would break builds
// in environments where OAuth isn't configured. Instead, create instances
// on-demand in route handlers where the error can be caught gracefully.

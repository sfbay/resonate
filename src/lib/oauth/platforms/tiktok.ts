/**
 * TikTok API OAuth Integration
 *
 * Handles TikTok Business/Creator accounts for analytics.
 *
 * Flow:
 * 1. User clicks "Connect TikTok" -> redirect to TikTok OAuth
 * 2. TikTok redirects back with code -> exchange for tokens
 * 3. Fetch user profile and video metrics
 *
 * @see https://developers.tiktok.com/doc/login-kit-web/
 * @see https://developers.tiktok.com/doc/tiktok-api-v2-get-user-info/
 */

import type {
  OAuthProvider,
  OAuthConfig,
  OAuthState,
  OAuthTokens,
  TokenRefreshResult,
  MetricsFetchResult,
  ContentFetchResult,
  ContentFetchOptions,
  ContentPost,
  PlatformMetrics,
  TikTokTokenResponse,
  TikTokUserInfo,
  TikTokVideoQueryResponse,
} from '../types';
import type { Platform } from '@/types';
import { encodeState } from './meta';

// =============================================================================
// CONFIGURATION
// =============================================================================

const TIKTOK_API_BASE = 'https://open.tiktokapis.com/v2';
const TIKTOK_AUTH_BASE = 'https://www.tiktok.com/v2/auth/authorize';

function getTikTokConfig(): OAuthConfig {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';

  if (!clientKey || !clientSecret) {
    throw new Error('Missing TIKTOK_CLIENT_KEY or TIKTOK_CLIENT_SECRET environment variables');
  }

  return {
    clientId: clientKey,
    clientSecret,
    redirectUri: `${baseUrl}/api/auth/tiktok/callback`,
    scopes: [
      'user.info.basic',
      'user.info.profile',
      'user.info.stats',
      'video.list',
    ],
    authorizationUrl: TIKTOK_AUTH_BASE,
    tokenUrl: `${TIKTOK_API_BASE}/oauth/token/`,
  };
}

// =============================================================================
// TIKTOK OAUTH PROVIDER
// =============================================================================

export class TikTokOAuthProvider implements OAuthProvider {
  platform: Platform = 'tiktok';
  private config: OAuthConfig;

  constructor() {
    this.config = getTikTokConfig();
  }

  /**
   * Generate TikTok OAuth authorization URL
   */
  getAuthorizationUrl(state: OAuthState): string {
    const params = new URLSearchParams({
      client_key: this.config.clientId,
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
    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.config.redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    const data: TikTokTokenResponse = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenType: data.token_type || 'bearer',
      scopes: data.scope.split(','),
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  }

  /**
   * Refresh expired tokens
   */
  async refreshTokens(refreshToken: string): Promise<TokenRefreshResult> {
    try {
      const response = await fetch(this.config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_key: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        return { success: false, error: 'Token refresh failed' };
      }

      const data: TikTokTokenResponse = await response.json();

      return {
        success: true,
        tokens: {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          tokenType: data.token_type || 'bearer',
          scopes: data.scope.split(','),
          expiresAt: new Date(Date.now() + data.expires_in * 1000),
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
   * Revoke access token (TikTok doesn't have a direct revoke endpoint)
   */
  async revokeTokens(_accessToken: string): Promise<boolean> {
    // TikTok API v2 doesn't have a token revocation endpoint
    // Tokens expire naturally, and users can disconnect from TikTok settings
    return true;
  }

  /**
   * Get connected TikTok account info
   */
  async getAccountInfo(accessToken: string): Promise<{
    platformUserId: string;
    handle?: string;
    url?: string;
    profileImageUrl?: string;
  }> {
    const userInfo = await this.fetchUserInfo(accessToken);

    return {
      platformUserId: userInfo.open_id,
      handle: userInfo.display_name ? `@${userInfo.display_name}` : undefined,
      url: userInfo.profile_deep_link,
      profileImageUrl: userInfo.avatar_url,
    };
  }

  /**
   * Fetch TikTok account metrics
   */
  async fetchMetrics(accessToken: string): Promise<MetricsFetchResult> {
    try {
      const userInfo = await this.fetchUserInfo(accessToken);

      const metrics: PlatformMetrics = {
        platform: 'tiktok',
        fetchedAt: new Date(),
        followerCount: userInfo.follower_count,
        followingCount: userInfo.following_count,
        postCount: userInfo.video_count,
        rawData: {
          likesCount: userInfo.likes_count,
          isVerified: userInfo.is_verified,
          bioDescription: userInfo.bio_description,
        },
      };

      // Try to calculate engagement from recent videos
      try {
        const contentResult = await this.fetchContent(accessToken, { limit: 20 });
        if (contentResult.success && contentResult.posts?.length) {
          const totalEngagement = contentResult.posts.reduce((sum, post) => {
            return sum + (post.likes || 0) + (post.comments || 0) + (post.shares || 0);
          }, 0);
          const avgEngagement = totalEngagement / contentResult.posts.length;
          const followers = userInfo.follower_count || 1;
          metrics.engagementRate = Math.round((avgEngagement / followers) * 10000) / 100;

          // Calculate averages
          metrics.avgLikes = Math.round(
            contentResult.posts.reduce((sum, p) => sum + (p.likes || 0), 0) / contentResult.posts.length
          );
          metrics.avgComments = Math.round(
            contentResult.posts.reduce((sum, p) => sum + (p.comments || 0), 0) / contentResult.posts.length
          );
          metrics.avgShares = Math.round(
            contentResult.posts.reduce((sum, p) => sum + (p.shares || 0), 0) / contentResult.posts.length
          );
        }
      } catch {
        // Continue without engagement calculation
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

  /**
   * Fetch TikTok videos
   */
  async fetchContent(
    accessToken: string,
    options?: ContentFetchOptions
  ): Promise<ContentFetchResult> {
    try {
      const limit = options?.limit || 20;

      const requestBody: Record<string, unknown> = {
        max_count: Math.min(limit, 20), // TikTok API max is 20 per request
      };

      if (options?.cursor) {
        requestBody.cursor = parseInt(options.cursor, 10);
      }

      const response = await fetch(`${TIKTOK_API_BASE}/video/list/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error: `Failed to fetch videos: ${error}` };
      }

      const data: TikTokVideoQueryResponse = await response.json();

      if (data.error?.code !== 'ok' && data.error?.message) {
        return { success: false, error: data.error.message };
      }

      const posts: ContentPost[] = (data.data?.videos || []).map((video) => {
        // Extract hashtags from description
        const hashtags = video.video_description?.match(/#\w+/g)?.map(h => h.slice(1)) || [];

        return {
          id: video.id,
          platform: 'tiktok' as Platform,
          contentType: 'video' as const,
          publishedAt: new Date(video.create_time * 1000),
          captionExcerpt: video.video_description?.slice(0, 280) || video.title,
          contentUrl: video.share_url,
          thumbnailUrl: video.cover_image_url,
          mediaType: 'video' as const,
          hashtags,
          likes: video.like_count,
          comments: video.comment_count,
          shares: video.share_count,
          videoViews: video.view_count,
          watchTimeSeconds: video.duration,
        };
      });

      // Filter by date if specified
      const filteredPosts = options?.since
        ? posts.filter(p => p.publishedAt >= options.since!)
        : posts;

      return {
        success: true,
        posts: filteredPosts,
        hasMore: data.data?.has_more,
        cursor: data.data?.cursor?.toString(),
      };
    } catch (error) {
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
   * Fetch user info from TikTok API
   */
  private async fetchUserInfo(accessToken: string): Promise<TikTokUserInfo> {
    const response = await fetch(`${TIKTOK_API_BASE}/user/info/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch user info: ${error}`);
    }

    const data = await response.json();

    if (data.error?.code !== 'ok') {
      throw new Error(data.error?.message || 'Unknown TikTok API error');
    }

    return data.data.user as TikTokUserInfo;
  }
}

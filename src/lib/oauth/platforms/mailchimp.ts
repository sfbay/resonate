/**
 * Mailchimp API OAuth Integration
 *
 * Handles Mailchimp accounts for newsletter analytics.
 *
 * Flow:
 * 1. User clicks "Connect Mailchimp" -> redirect to Mailchimp OAuth
 * 2. Mailchimp redirects back with code -> exchange for token
 * 3. Fetch metadata to get data center -> use correct API endpoint
 * 4. Fetch lists and campaign metrics
 *
 * @see https://mailchimp.com/developer/marketing/guides/access-user-data-oauth-2/
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
  MailchimpTokenResponse,
  MailchimpMetadata,
  MailchimpList,
  MailchimpCampaign,
} from '../types';
import type { Platform } from '@/types';
import { encodeState } from './meta';

// =============================================================================
// CONFIGURATION
// =============================================================================

const MAILCHIMP_OAUTH_BASE = 'https://login.mailchimp.com';

function getMailchimpConfig(): OAuthConfig {
  const clientId = process.env.MAILCHIMP_CLIENT_ID;
  const clientSecret = process.env.MAILCHIMP_CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';

  if (!clientId || !clientSecret) {
    throw new Error('Missing MAILCHIMP_CLIENT_ID or MAILCHIMP_CLIENT_SECRET environment variables');
  }

  return {
    clientId,
    clientSecret,
    redirectUri: `${baseUrl}/api/auth/mailchimp/callback`,
    scopes: [], // Mailchimp doesn't use scopes in OAuth
    authorizationUrl: `${MAILCHIMP_OAUTH_BASE}/oauth2/authorize`,
    tokenUrl: `${MAILCHIMP_OAUTH_BASE}/oauth2/token`,
  };
}

// =============================================================================
// MAILCHIMP OAUTH PROVIDER
// =============================================================================

export class MailchimpOAuthProvider implements OAuthProvider {
  platform: Platform = 'mailchimp';
  private config: OAuthConfig;

  constructor() {
    this.config = getMailchimpConfig();
  }

  /**
   * Generate Mailchimp OAuth authorization URL
   */
  getAuthorizationUrl(state: OAuthState): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
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
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
        code,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    const data: MailchimpTokenResponse = await response.json();

    // Mailchimp tokens don't expire, but we'll set a long expiry
    return {
      accessToken: data.access_token,
      tokenType: data.token_type || 'bearer',
      scopes: [],
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    };
  }

  /**
   * Mailchimp tokens don't expire, so refresh is not needed
   */
  async refreshTokens(_refreshToken: string): Promise<TokenRefreshResult> {
    // Mailchimp tokens don't expire, so refresh is not applicable
    return {
      success: false,
      error: 'Mailchimp tokens do not expire and cannot be refreshed',
    };
  }

  /**
   * Revoke access token (Mailchimp doesn't have a revoke endpoint)
   */
  async revokeTokens(_accessToken: string): Promise<boolean> {
    // Mailchimp doesn't have a token revocation endpoint
    // Users must disconnect from their Mailchimp account settings
    return true;
  }

  /**
   * Get connected Mailchimp account info
   */
  async getAccountInfo(accessToken: string): Promise<{
    platformUserId: string;
    handle?: string;
    url?: string;
    profileImageUrl?: string;
  }> {
    const metadata = await this.fetchMetadata(accessToken);

    return {
      platformUserId: metadata.user_id?.toString() || metadata.accountname || 'unknown',
      handle: metadata.accountname,
      url: metadata.api_endpoint,
      profileImageUrl: metadata.login?.avatar,
    };
  }

  /**
   * Fetch Mailchimp account metrics (aggregate list stats)
   */
  async fetchMetrics(accessToken: string): Promise<MetricsFetchResult> {
    try {
      const metadata = await this.fetchMetadata(accessToken);
      const apiBase = metadata.api_endpoint;

      // Fetch all lists
      const listsResponse = await fetch(`${apiBase}/3.0/lists?count=100`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!listsResponse.ok) {
        throw new Error('Failed to fetch lists');
      }

      const listsData = await listsResponse.json();
      const lists: MailchimpList[] = listsData.lists || [];

      // Aggregate metrics across all lists
      let totalSubscribers = 0;
      let totalOpenRate = 0;
      let totalClickRate = 0;
      let listCount = 0;

      for (const list of lists) {
        totalSubscribers += list.stats.member_count;
        if (list.stats.open_rate > 0) {
          totalOpenRate += list.stats.open_rate;
          totalClickRate += list.stats.click_rate;
          listCount++;
        }
      }

      const metrics: PlatformMetrics = {
        platform: 'mailchimp',
        fetchedAt: new Date(),
        subscriberCount: totalSubscribers,
        openRate: listCount > 0 ? Math.round((totalOpenRate / listCount) * 100) / 100 : undefined,
        clickRate: listCount > 0 ? Math.round((totalClickRate / listCount) * 100) / 100 : undefined,
        rawData: {
          listCount: lists.length,
          lists: lists.map((l) => ({
            id: l.id,
            name: l.name,
            memberCount: l.stats.member_count,
            openRate: l.stats.open_rate,
            clickRate: l.stats.click_rate,
          })),
        },
      };

      return { success: true, metrics };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Fetch Mailchimp campaigns as content
   */
  async fetchContent(
    accessToken: string,
    options?: ContentFetchOptions
  ): Promise<ContentFetchResult> {
    try {
      const metadata = await this.fetchMetadata(accessToken);
      const apiBase = metadata.api_endpoint;
      const limit = options?.limit || 25;

      let url = `${apiBase}/3.0/campaigns?count=${limit}&status=sent&sort_field=send_time&sort_dir=DESC`;

      if (options?.since) {
        url += `&since_send_time=${options.since.toISOString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error: `Failed to fetch campaigns: ${error}` };
      }

      const data = await response.json();
      const campaigns: MailchimpCampaign[] = data.campaigns || [];

      const posts: ContentPost[] = campaigns.map((campaign) => ({
        id: campaign.id,
        platform: 'mailchimp' as Platform,
        contentType: 'newsletter' as const,
        publishedAt: new Date(campaign.send_time || campaign.create_time),
        captionExcerpt: campaign.settings.subject_line || campaign.settings.title,
        contentUrl: campaign.archive_url,
        impressions: campaign.report_summary?.unique_opens,
        reach: campaign.emails_sent,
        clicks: campaign.report_summary?.clicks,
        engagementRate: campaign.report_summary?.open_rate,
      }));

      return {
        success: true,
        posts,
        hasMore: campaigns.length === limit,
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
   * Fetch account metadata to get the correct API endpoint
   * Mailchimp uses different data centers (us1, us2, etc.)
   */
  private async fetchMetadata(accessToken: string): Promise<MailchimpMetadata> {
    const response = await fetch(`${MAILCHIMP_OAUTH_BASE}/oauth2/metadata`, {
      headers: {
        'Authorization': `OAuth ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch metadata: ${error}`);
    }

    return response.json();
  }
}

/**
 * Google Analytics (GA4) OAuth Integration
 *
 * Handles Google Analytics 4 OAuth for web traffic analytics.
 * Note: This is for GA4 analytics, not Google social accounts.
 *
 * Flow:
 * 1. User clicks "Connect Google Analytics" -> redirect to Google OAuth
 * 2. Google redirects back with code -> exchange for tokens
 * 3. Fetch GA4 properties list
 * 4. Store connection in web_analytics_connections table
 *
 * @see https://developers.google.com/analytics/devguides/config/admin/v1
 * @see https://developers.google.com/analytics/devguides/reporting/data/v1
 */

import type {
  OAuthConfig,
  OAuthState,
  OAuthTokens,
  TokenRefreshResult,
} from '../types';
import type { Platform } from '@/types';

// =============================================================================
// CONFIGURATION
// =============================================================================

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GA_ADMIN_API_BASE = 'https://analyticsadmin.googleapis.com/v1beta';
const GA_DATA_API_BASE = 'https://analyticsdata.googleapis.com/v1beta';

function getGoogleConfig(): OAuthConfig {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!clientId || !clientSecret) {
    throw new Error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables');
  }

  return {
    clientId,
    clientSecret,
    redirectUri: `${baseUrl}/api/auth/google/callback`,
    scopes: [
      'https://www.googleapis.com/auth/analytics.readonly',
    ],
    authorizationUrl: GOOGLE_AUTH_URL,
    tokenUrl: GOOGLE_TOKEN_URL,
  };
}

// =============================================================================
// TYPES
// =============================================================================

export interface GA4Property {
  name: string; // "properties/123456789"
  displayName: string;
  propertyType: string;
  createTime: string;
  updateTime: string;
  parent?: string;
  currencyCode?: string;
  timeZone?: string;
  industryCategory?: string;
}

export interface GA4Account {
  name: string; // "accounts/123456789"
  displayName: string;
  createTime: string;
  updateTime: string;
  regionCode?: string;
}

export interface GA4PropertyListResponse {
  accountSummaries: Array<{
    name: string;
    displayName: string;
    account: string;
    propertySummaries: Array<{
      property: string;
      displayName: string;
      propertyType: string;
    }>;
  }>;
}

export interface GA4MetricsResponse {
  rows?: Array<{
    dimensionValues?: Array<{ value: string }>;
    metricValues?: Array<{ value: string }>;
  }>;
  totals?: Array<{
    dimensionValues?: Array<{ value: string }>;
    metricValues?: Array<{ value: string }>;
  }>;
  rowCount?: number;
}

export interface WebTrafficMetrics {
  pageviews: number;
  sessions: number;
  users: number;
  avgSessionDuration: number;
  bounceRate: number;
  newUsers: number;
}

// =============================================================================
// GOOGLE OAUTH PROVIDER
// =============================================================================

/**
 * Google OAuth Provider for GA4 Analytics
 *
 * Note: This doesn't implement the full OAuthProvider interface since
 * GA4 is web analytics, not a social platform with content/metrics.
 * It stores data in web_analytics_connections, not platform_connections.
 */
export class GoogleOAuthProvider {
  readonly platform: Platform = 'google' as Platform;
  private config: OAuthConfig;

  constructor() {
    this.config = getGoogleConfig();
  }

  /**
   * Generate Google OAuth authorization URL
   */
  getAuthorizationUrl(state: OAuthState): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      response_type: 'code',
      state: encodeState(state),
      access_type: 'offline', // Get refresh token
      prompt: 'consent', // Always show consent to get refresh token
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
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenType: data.token_type || 'Bearer',
      scopes: this.config.scopes,
      expiresAt: data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000)
        : new Date(Date.now() + 3600 * 1000), // Default 1 hour
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
          refresh_token: refreshToken,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        return { success: false, error: 'Token refresh failed' };
      }

      const data = await response.json();

      return {
        success: true,
        tokens: {
          accessToken: data.access_token,
          refreshToken: refreshToken, // Refresh token stays the same
          tokenType: data.token_type || 'Bearer',
          scopes: this.config.scopes,
          expiresAt: data.expires_in
            ? new Date(Date.now() + data.expires_in * 1000)
            : new Date(Date.now() + 3600 * 1000),
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
      const response = await fetch(
        `https://oauth2.googleapis.com/revoke?token=${accessToken}`,
        { method: 'POST' }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Fetch list of GA4 properties the user has access to
   */
  async fetchProperties(accessToken: string): Promise<GA4Property[]> {
    const response = await fetch(`${GA_ADMIN_API_BASE}/accountSummaries`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch GA4 properties: ${error}`);
    }

    const data: GA4PropertyListResponse = await response.json();

    // Flatten property summaries into a list
    const properties: GA4Property[] = [];
    for (const account of data.accountSummaries || []) {
      for (const prop of account.propertySummaries || []) {
        properties.push({
          name: prop.property,
          displayName: prop.displayName,
          propertyType: prop.propertyType,
          createTime: '',
          updateTime: '',
          parent: account.name,
        });
      }
    }

    return properties;
  }

  /**
   * Fetch traffic metrics for a GA4 property
   */
  async fetchTrafficMetrics(
    accessToken: string,
    propertyId: string,
    dateRange: { startDate: string; endDate: string } = {
      startDate: '30daysAgo',
      endDate: 'today',
    }
  ): Promise<WebTrafficMetrics> {
    // Extract numeric property ID from "properties/123456789"
    const numericId = propertyId.replace('properties/', '');

    const response = await fetch(
      `${GA_DATA_API_BASE}/properties/${numericId}:runReport`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [dateRange],
          metrics: [
            { name: 'screenPageViews' },
            { name: 'sessions' },
            { name: 'totalUsers' },
            { name: 'averageSessionDuration' },
            { name: 'bounceRate' },
            { name: 'newUsers' },
          ],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch GA4 metrics: ${error}`);
    }

    const data: GA4MetricsResponse = await response.json();

    // Extract metric values from response
    const row = data.rows?.[0];
    const values = row?.metricValues || [];

    return {
      pageviews: parseInt(values[0]?.value || '0', 10),
      sessions: parseInt(values[1]?.value || '0', 10),
      users: parseInt(values[2]?.value || '0', 10),
      avgSessionDuration: parseFloat(values[3]?.value || '0'),
      bounceRate: parseFloat(values[4]?.value || '0'),
      newUsers: parseInt(values[5]?.value || '0', 10),
    };
  }

  /**
   * Fetch traffic by page/article
   */
  async fetchPageMetrics(
    accessToken: string,
    propertyId: string,
    dateRange: { startDate: string; endDate: string } = {
      startDate: '30daysAgo',
      endDate: 'today',
    },
    limit: number = 50
  ): Promise<Array<{ path: string; pageviews: number; sessions: number; avgTime: number }>> {
    const numericId = propertyId.replace('properties/', '');

    const response = await fetch(
      `${GA_DATA_API_BASE}/properties/${numericId}:runReport`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [dateRange],
          dimensions: [{ name: 'pagePath' }],
          metrics: [
            { name: 'screenPageViews' },
            { name: 'sessions' },
            { name: 'averageSessionDuration' },
          ],
          limit,
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch page metrics: ${error}`);
    }

    const data: GA4MetricsResponse = await response.json();

    return (data.rows || []).map((row) => ({
      path: row.dimensionValues?.[0]?.value || '',
      pageviews: parseInt(row.metricValues?.[0]?.value || '0', 10),
      sessions: parseInt(row.metricValues?.[1]?.value || '0', 10),
      avgTime: parseFloat(row.metricValues?.[2]?.value || '0'),
    }));
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

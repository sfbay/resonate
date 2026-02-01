/**
 * Google Analytics OAuth Callback Route
 *
 * GET /api/auth/google/callback?code=xxx&state=xxx
 *
 * Exchanges authorization code for tokens, fetches GA4 properties,
 * and stores the connection in web_analytics_connections.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  GoogleOAuthProvider,
  decodeState,
  verifyStateTimestamp,
} from '@/lib/oauth/platforms/google';
import { createServerClient } from '@/lib/db/supabase-server';
import type { OAuthState } from '@/lib/oauth/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth errors from Google
  if (error) {
    console.error('OAuth error from Google:', error, errorDescription);
    return redirectWithError(
      request.nextUrl.origin,
      '/publisher/dashboard',
      'oauth_denied',
      errorDescription || error
    );
  }

  // Validate required parameters
  if (!code || !stateParam) {
    return redirectWithError(
      request.nextUrl.origin,
      '/publisher/dashboard',
      'missing_params',
      'Missing code or state parameter'
    );
  }

  // Decode and validate state
  let state: OAuthState;
  try {
    state = decodeState(stateParam);
  } catch {
    return redirectWithError(
      request.nextUrl.origin,
      '/publisher/dashboard',
      'invalid_state',
      'Invalid OAuth state'
    );
  }

  // Verify state hasn't expired
  if (!verifyStateTimestamp(state)) {
    return redirectWithError(
      request.nextUrl.origin,
      state.returnUrl || '/publisher/dashboard',
      'expired_state',
      'OAuth session expired, please try again'
    );
  }

  const returnUrl = state.returnUrl || '/publisher/dashboard';

  try {
    // Exchange code for tokens
    const provider = new GoogleOAuthProvider();
    const tokens = await provider.exchangeCode(code);

    // Fetch GA4 properties
    const properties = await provider.fetchProperties(tokens.accessToken);

    if (properties.length === 0) {
      return redirectWithError(
        request.nextUrl.origin,
        returnUrl,
        'no_properties',
        'No Google Analytics 4 properties found for this account'
      );
    }

    // Use the first property by default (user can change later)
    const primaryProperty = properties[0];

    // Fetch initial traffic metrics
    let initialMetrics = null;
    try {
      initialMetrics = await provider.fetchTrafficMetrics(
        tokens.accessToken,
        primaryProperty.name
      );
    } catch (metricsError) {
      console.warn('Failed to fetch initial GA4 metrics:', metricsError);
      // Continue - metrics fetch is optional
    }

    // Store in Supabase
    const supabase = await createServerClient();

    // Upsert web analytics connection
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: connectionError } = await (supabase as any)
      .from('web_analytics_connections')
      .upsert(
        {
          publisher_id: state.publisherId,
          provider: 'google_analytics',
          property_id: primaryProperty.name,
          property_name: primaryProperty.displayName,
          access_token: tokens.accessToken, // Should be encrypted in production
          refresh_token: tokens.refreshToken,
          token_expires_at: tokens.expiresAt?.toISOString(),
          scopes: tokens.scopes,
          status: 'active',
          last_synced_at: new Date().toISOString(),
        },
        {
          onConflict: 'publisher_id,provider',
        }
      );

    if (connectionError) {
      console.error('Failed to store GA4 connection:', connectionError);
      return redirectWithError(
        request.nextUrl.origin,
        returnUrl,
        'db_error',
        'Failed to save connection'
      );
    }

    // Store initial traffic snapshot if we have metrics
    if (initialMetrics) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('web_traffic_snapshots').insert({
        publisher_id: state.publisherId,
        snapshot_date: new Date().toISOString().split('T')[0],
        pageviews: initialMetrics.pageviews,
        sessions: initialMetrics.sessions,
        users: initialMetrics.users,
        avg_session_duration: initialMetrics.avgSessionDuration,
        bounce_rate: initialMetrics.bounceRate,
        new_users: initialMetrics.newUsers,
      });
    }

    // Redirect back to dashboard with success
    const successUrl = new URL(returnUrl, request.nextUrl.origin);
    successUrl.searchParams.set('connected', 'google_analytics');
    successUrl.searchParams.set('property', primaryProperty.displayName);
    successUrl.searchParams.set(
      'properties_available',
      properties.length.toString()
    );

    return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return redirectWithError(
      request.nextUrl.origin,
      returnUrl,
      'exchange_error',
      error instanceof Error ? error.message : 'Failed to complete authentication'
    );
  }
}

/**
 * Helper to redirect with error parameters
 */
function redirectWithError(
  origin: string,
  returnUrl: string,
  errorCode: string,
  message: string
): NextResponse {
  const url = new URL(returnUrl, origin);
  url.searchParams.set('error', errorCode);
  url.searchParams.set('message', message);
  return NextResponse.redirect(url);
}

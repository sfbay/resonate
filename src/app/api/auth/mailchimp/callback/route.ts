/**
 * Mailchimp OAuth Callback Route
 *
 * GET /api/auth/mailchimp/callback?code=xxx&state=xxx
 *
 * Exchanges authorization code for tokens, fetches account info,
 * and stores the platform connection.
 */

import { NextRequest, NextResponse } from 'next/server';
import { MailchimpOAuthProvider } from '@/lib/oauth/platforms/mailchimp';
import { decodeState, verifyStateTimestamp } from '@/lib/oauth/platforms/meta';
import { createServerClient } from '@/lib/db/supabase-server';
import type { OAuthState } from '@/lib/oauth/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth errors from Mailchimp
  if (error) {
    console.error('OAuth error from Mailchimp:', error, errorDescription);
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
    const provider = new MailchimpOAuthProvider();
    const tokens = await provider.exchangeCode(code);

    // Get connected account info
    const accountInfo = await provider.getAccountInfo(tokens.accessToken);

    // Fetch initial metrics
    const metricsResult = await provider.fetchMetrics(tokens.accessToken);

    // Fetch recent campaigns
    const contentResult = await provider.fetchContent(tokens.accessToken, { limit: 25 });

    // Store in Supabase
    const supabase = await createServerClient();

    // Upsert platform connection
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: connectionError } = await (supabase as any)
      .from('platform_connections')
      .upsert(
        {
          publisher_id: state.publisherId,
          platform: 'mailchimp',
          platform_user_id: accountInfo.platformUserId,
          handle: accountInfo.handle,
          url: accountInfo.url,
          access_token: tokens.accessToken, // Should be encrypted in production
          refresh_token: tokens.refreshToken,
          token_expires_at: tokens.expiresAt?.toISOString(),
          scopes: tokens.scopes,
          verified: true,
          last_synced_at: new Date().toISOString(),
          status: 'active',
        },
        {
          onConflict: 'publisher_id,platform',
        }
      );

    if (connectionError) {
      console.error('Failed to store platform connection:', connectionError);
      return redirectWithError(
        request.nextUrl.origin,
        returnUrl,
        'db_error',
        'Failed to save connection'
      );
    }

    // Store initial metrics snapshot if we have metrics
    if (metricsResult.success && metricsResult.metrics) {
      const metrics = metricsResult.metrics;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('metrics_snapshots').insert({
        publisher_id: state.publisherId,
        platform: 'mailchimp',
        subscriber_count: metrics.subscriberCount,
        open_rate: metrics.openRate,
        click_rate: metrics.clickRate,
        raw_response: metrics.rawData,
      });
    }

    // Store initial content snapshots (campaigns)
    if (contentResult.success && contentResult.posts?.length) {
      const contentRows = contentResult.posts.map((post) => ({
        publisher_id: state.publisherId,
        platform: 'mailchimp',
        content_id: post.id,
        content_type: post.contentType,
        content_url: post.contentUrl,
        published_at: post.publishedAt.toISOString(),
        caption_excerpt: post.captionExcerpt,
        impressions: post.impressions,
        reach: post.reach,
        clicks: post.clicks,
        engagement_rate: post.engagementRate,
        media_type: 'text',
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('content_performance')
        .upsert(contentRows, {
          onConflict: 'publisher_id,platform,content_id,recorded_at',
          ignoreDuplicates: true,
        });
    }

    // Redirect back to dashboard with success
    const successUrl = new URL(returnUrl, request.nextUrl.origin);
    successUrl.searchParams.set('connected', 'mailchimp');
    successUrl.searchParams.set('handle', accountInfo.handle || '');

    return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error('Mailchimp OAuth callback error:', error);
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

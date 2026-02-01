/**
 * Mailchimp OAuth Initiation Route
 *
 * GET /api/auth/mailchimp?publisherId=xxx&returnUrl=xxx
 *
 * Redirects user to Mailchimp OAuth with proper state for callback handling.
 */

import { NextRequest, NextResponse } from 'next/server';
import { MailchimpOAuthProvider } from '@/lib/oauth/platforms/mailchimp';
import type { OAuthState } from '@/lib/oauth/types';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const publisherId = searchParams.get('publisherId');
  const returnUrl = searchParams.get('returnUrl') || '/publisher/dashboard';

  // Validate required parameters
  if (!publisherId) {
    return NextResponse.json(
      { error: 'Missing publisherId parameter' },
      { status: 400 }
    );
  }

  try {
    // Create OAuth state with security nonce
    const state: OAuthState = {
      platform: 'mailchimp',
      publisherId,
      returnUrl,
      nonce: crypto.randomBytes(16).toString('hex'),
      timestamp: Date.now(),
    };

    // Get authorization URL from Mailchimp provider
    const provider = new MailchimpOAuthProvider();
    const authUrl = provider.getAuthorizationUrl(state);

    // Redirect to Mailchimp OAuth
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Mailchimp OAuth initiation error:', error);

    // Redirect back with error if Mailchimp credentials aren't configured
    const errorUrl = new URL(returnUrl, request.nextUrl.origin);
    errorUrl.searchParams.set('error', 'oauth_config_error');
    errorUrl.searchParams.set(
      'message',
      error instanceof Error ? error.message : 'OAuth configuration error'
    );

    return NextResponse.redirect(errorUrl);
  }
}

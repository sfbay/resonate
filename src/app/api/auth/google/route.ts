/**
 * Google Analytics OAuth Initiation Route
 *
 * GET /api/auth/google?publisherId=xxx&returnUrl=xxx
 *
 * Redirects user to Google OAuth with proper state for callback handling.
 * Used for GA4 web analytics integration.
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleOAuthProvider, encodeState } from '@/lib/oauth/platforms/google';
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
      platform: 'google' as OAuthState['platform'],
      publisherId,
      returnUrl,
      nonce: crypto.randomBytes(16).toString('hex'),
      timestamp: Date.now(),
    };

    // Get authorization URL from Google provider
    const provider = new GoogleOAuthProvider();
    const authUrl = provider.getAuthorizationUrl(state);

    // Redirect to Google OAuth
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Google OAuth initiation error:', error);

    // Redirect back with error if credentials aren't configured
    const errorUrl = new URL(returnUrl, request.nextUrl.origin);
    errorUrl.searchParams.set('error', 'oauth_config_error');
    errorUrl.searchParams.set(
      'message',
      error instanceof Error ? error.message : 'Google OAuth configuration error'
    );

    return NextResponse.redirect(errorUrl);
  }
}

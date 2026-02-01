/**
 * OAuth Provider Registry
 *
 * Central point for accessing OAuth providers by platform.
 */

import type { Platform } from '@/types';
import type { OAuthProvider } from './types';
import { MetaOAuthProvider } from './platforms/meta';
import { TikTokOAuthProvider } from './platforms/tiktok';
import { MailchimpOAuthProvider } from './platforms/mailchimp';
import { GoogleOAuthProvider } from './platforms/google';

// =============================================================================
// PROVIDER REGISTRY
// =============================================================================

const providers: Partial<Record<Platform, () => OAuthProvider>> = {
  // Meta platforms (Instagram, Facebook, WhatsApp)
  instagram: () => new MetaOAuthProvider(),
  facebook: () => new MetaOAuthProvider(),
  whatsapp: () => new MetaOAuthProvider(),

  // TikTok
  tiktok: () => new TikTokOAuthProvider(),

  // Newsletter platforms
  mailchimp: () => new MailchimpOAuthProvider(),
  // substack: () => new SubstackOAuthProvider(), // Week 3

  // Web Analytics (note: stores in web_analytics_connections, not platform_connections)
  google: () => new GoogleOAuthProvider() as unknown as OAuthProvider,
};

/**
 * Get OAuth provider for a platform
 */
export function getOAuthProvider(platform: Platform): OAuthProvider | null {
  const factory = providers[platform];
  return factory ? factory() : null;
}

/**
 * Check if a platform supports OAuth
 */
export function supportsOAuth(platform: Platform): boolean {
  return platform in providers;
}

/**
 * Get list of platforms that support OAuth
 */
export function getOAuthPlatforms(): Platform[] {
  return Object.keys(providers) as Platform[];
}

// Re-export types
export * from './types';
export { encodeState, decodeState, verifyStateTimestamp } from './platforms/meta';

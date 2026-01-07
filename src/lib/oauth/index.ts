/**
 * OAuth Provider Registry
 *
 * Central point for accessing OAuth providers by platform.
 */

import type { Platform } from '@/types';
import type { OAuthProvider } from './types';
import { MetaOAuthProvider } from './platforms/meta';

// =============================================================================
// PROVIDER REGISTRY
// =============================================================================

const providers: Partial<Record<Platform, () => OAuthProvider>> = {
  instagram: () => new MetaOAuthProvider(),
  facebook: () => new MetaOAuthProvider(),
  // WhatsApp uses Meta OAuth with different scopes
  whatsapp: () => new MetaOAuthProvider(),
  // TikTok, newsletter platforms, etc. will be added here
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

/**
 * City Registry
 *
 * Central registry of all supported cities with their configurations.
 * Use getCityConfig() to safely retrieve city data.
 */

import type { CityConfig, CitySlug } from '../types';
import { SF_CONFIG } from './sf';
import { CHICAGO_CONFIG } from './chicago';
import { NYC_CONFIG } from './placeholder';

// =============================================================================
// CITY REGISTRY
// =============================================================================

/**
 * All supported cities
 */
export const CITIES: Record<CitySlug, CityConfig> = {
  sf: SF_CONFIG,
  chicago: CHICAGO_CONFIG,
  nyc: NYC_CONFIG,
};

/**
 * Ordered list of cities for UI display
 */
export const CITY_LIST: CityConfig[] = [
  SF_CONFIG,      // Active first
  CHICAGO_CONFIG, // Active
  NYC_CONFIG,     // Coming soon
];

/**
 * Active cities only
 */
export const ACTIVE_CITIES = CITY_LIST.filter(c => c.status === 'active');

/**
 * Coming soon cities only
 */
export const COMING_SOON_CITIES = CITY_LIST.filter(c => c.status === 'coming_soon');

// =============================================================================
// LOOKUP FUNCTIONS
// =============================================================================

/**
 * Get city configuration by slug
 * Returns undefined if slug is not valid
 */
export function getCityConfig(slug: string): CityConfig | undefined {
  return CITIES[slug as CitySlug];
}

/**
 * Get city configuration by slug, with fallback to SF
 * Use this when you need a guaranteed city config
 */
export function getCityConfigOrDefault(slug: string): CityConfig {
  return getCityConfig(slug) || SF_CONFIG;
}

/**
 * Check if a city is active (has full features enabled)
 */
export function isCityActive(slug: string): boolean {
  const config = getCityConfig(slug);
  return config?.status === 'active';
}

/**
 * Get the default/fallback city
 */
export function getDefaultCity(): CityConfig {
  return SF_CONFIG;
}

// =============================================================================
// RE-EXPORTS
// =============================================================================

export { SF_CONFIG } from './sf';
export { CHICAGO_CONFIG } from './chicago';
export { NYC_CONFIG } from './placeholder';

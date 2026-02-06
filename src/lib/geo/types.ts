/**
 * Multi-City Geographic Types
 *
 * Generic types for supporting multiple cities in the Resonate platform.
 * These types abstract city-specific data structures for scalable expansion.
 */

// =============================================================================
// CITY IDENTIFICATION
// =============================================================================

/**
 * Supported city slugs - used in URLs and routing
 */
export type CitySlug = 'sf' | 'chicago' | 'nyc';

/**
 * City availability status
 */
export type CityStatus = 'active' | 'coming_soon' | 'beta';

// =============================================================================
// BOUNDING BOX & COORDINATES
// =============================================================================

/**
 * Geographic coordinate
 */
export interface Coordinate {
  lat: number;
  lng: number;
}

/**
 * Bounding box for a geographic area
 */
export interface BBox {
  sw: Coordinate; // Southwest corner
  ne: Coordinate; // Northeast corner
}

// =============================================================================
// CITY CONFIGURATION
// =============================================================================

/**
 * Core city configuration
 */
export interface CityConfig {
  slug: CitySlug;
  name: string;                    // Short name (e.g., "San Francisco")
  fullName: string;                // Full official name
  state: string;                   // State abbreviation
  stateFullName: string;           // Full state name
  bounds: BBox;                    // City bounding box
  center: Coordinate;              // City center for map defaults
  zoom: number;                    // Default map zoom level
  status: CityStatus;
  timezone: string;                // IANA timezone

  // Branding
  tagline?: string;                // City-specific tagline
  heroImage?: string;              // Hero image path

  // Feature flags
  features: {
    publisherDashboard: boolean;
    governmentDiscovery: boolean;
    advertise: boolean;
    campaigns: boolean;
    reporting: boolean;
  };
}

/**
 * Extended city configuration with neighborhood data
 * Used only for active cities with full geographic data
 */
export interface ActiveCityConfig extends CityConfig {
  status: 'active';

  // Geographic divisions (varies by city)
  neighborhoodCount: number;
  districtCount?: number;

  // Data availability
  hasCensusData: boolean;
  hasGeoJSON: boolean;
}

/**
 * Coming soon city configuration
 * Minimal data for placeholder pages
 */
export interface ComingSoonCityConfig extends CityConfig {
  status: 'coming_soon';
  launchEstimate?: string;         // e.g., "Q2 2025"
  waitlistUrl?: string;
}

// =============================================================================
// CITY CONTEXT
// =============================================================================

/**
 * City context value provided to components
 */
export interface CityContextValue {
  city: CityConfig;
  slug: CitySlug;
  isActive: boolean;
  isComingSoon: boolean;

  // Navigation helpers
  getPath: (path: string) => string;  // Prepends city slug to path
  getApiPath: (path: string) => string; // API path with city context
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Check if a city config is for an active city
 */
export function isActiveCity(config: CityConfig): config is ActiveCityConfig {
  return config.status === 'active';
}

/**
 * Check if a city config is for a coming soon city
 */
export function isComingSoonCity(config: CityConfig): config is ComingSoonCityConfig {
  return config.status === 'coming_soon';
}

/**
 * Check if a string is a valid city slug
 */
export function isValidCitySlug(slug: string): slug is CitySlug {
  return ['sf', 'chicago', 'nyc'].includes(slug);
}

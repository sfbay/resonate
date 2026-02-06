/**
 * Placeholder City Configurations
 *
 * Chicago and NYC configurations for "Coming Soon" pages.
 * These cities will be expanded with full data when launched.
 */

import type { ComingSoonCityConfig } from '../types';

// =============================================================================
// CHICAGO
// =============================================================================

export const CHICAGO_CONFIG: ComingSoonCityConfig = {
  slug: 'chicago',
  name: 'Chicago',
  fullName: 'City of Chicago',
  state: 'IL',
  stateFullName: 'Illinois',

  // Geographic data (approximate bounds)
  bounds: {
    sw: { lat: 41.6445, lng: -87.9401 },
    ne: { lat: 42.0230, lng: -87.5241 },
  },
  center: { lat: 41.8781, lng: -87.6298 },
  zoom: 11,
  timezone: 'America/Chicago',

  // Status
  status: 'coming_soon',
  launchEstimate: 'Q3 2025',

  // Branding
  tagline: 'Empowering Chicago\'s diverse community voices',
  heroImage: '/images/cities/chicago-hero.jpg',

  // Features - all disabled until launch
  features: {
    publisherDashboard: false,
    governmentDiscovery: false,
    advertise: false,
    campaigns: false,
    reporting: false,
  },
};

// =============================================================================
// NEW YORK CITY
// =============================================================================

export const NYC_CONFIG: ComingSoonCityConfig = {
  slug: 'nyc',
  name: 'New York City',
  fullName: 'City of New York',
  state: 'NY',
  stateFullName: 'New York',

  // Geographic data (approximate bounds - all 5 boroughs)
  bounds: {
    sw: { lat: 40.4774, lng: -74.2591 },
    ne: { lat: 40.9176, lng: -73.7004 },
  },
  center: { lat: 40.7128, lng: -74.0060 },
  zoom: 10,
  timezone: 'America/New_York',

  // Status
  status: 'coming_soon',
  launchEstimate: 'Q4 2025',

  // Branding
  tagline: 'Connecting NYC\'s vibrant community media ecosystem',
  heroImage: '/images/cities/nyc-hero.jpg',

  // Features - all disabled until launch
  features: {
    publisherDashboard: false,
    governmentDiscovery: false,
    advertise: false,
    campaigns: false,
    reporting: false,
  },
};

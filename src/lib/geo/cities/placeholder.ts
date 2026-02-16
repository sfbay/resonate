/**
 * Placeholder City Configurations
 *
 * NYC configuration for "Coming Soon" page.
 * Chicago has been promoted to an active city (see chicago.ts).
 */

import type { ComingSoonCityConfig } from '../types';

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

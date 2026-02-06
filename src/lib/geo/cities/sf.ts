/**
 * San Francisco City Configuration
 *
 * Active city with full geographic data, census integration,
 * and all platform features enabled.
 */

import type { ActiveCityConfig } from '../types';

export const SF_CONFIG: ActiveCityConfig = {
  slug: 'sf',
  name: 'San Francisco',
  fullName: 'City and County of San Francisco',
  state: 'CA',
  stateFullName: 'California',

  // Geographic data
  bounds: {
    sw: { lat: 37.7039, lng: -122.5271 },
    ne: { lat: 37.8324, lng: -122.3482 },
  },
  center: { lat: 37.7749, lng: -122.4194 },
  zoom: 12,
  timezone: 'America/Los_Angeles',

  // Status
  status: 'active',

  // Branding
  tagline: 'Connecting community media with those who need to reach them',
  heroImage: '/images/cities/sf-hero.jpg',

  // Features - all enabled for SF
  features: {
    publisherDashboard: true,
    governmentDiscovery: true,
    advertise: true,
    campaigns: true,
    reporting: true,
  },

  // Geographic divisions
  neighborhoodCount: 41,
  districtCount: 11,

  // Data availability
  hasCensusData: true,
  hasGeoJSON: true,
};

/**
 * SF-specific helper to check if a point is within city bounds
 */
export function isWithinSF(lat: number, lng: number): boolean {
  return (
    lat >= SF_CONFIG.bounds.sw.lat &&
    lat <= SF_CONFIG.bounds.ne.lat &&
    lng >= SF_CONFIG.bounds.sw.lng &&
    lng <= SF_CONFIG.bounds.ne.lng
  );
}

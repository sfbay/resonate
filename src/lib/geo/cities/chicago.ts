/**
 * Chicagoland City Configuration
 *
 * Active city with full geographic data for the 6-county metro region.
 * Phase 1: City of Chicago (77 community areas, 50 wards)
 * Phase 2-ready: Suburban municipalities & collar counties
 */

import type { ActiveCityConfig } from '../types';

export const CHICAGO_CONFIG: ActiveCityConfig = {
  slug: 'chicago',
  name: 'Chicagoland',
  fullName: 'Chicagoland Metropolitan Area',
  state: 'IL',
  stateFullName: 'Illinois',

  // Geographic data — wider bounds for 6-county metro
  bounds: {
    sw: { lat: 41.47, lng: -88.70 },
    ne: { lat: 42.50, lng: -87.52 },
  },
  center: { lat: 41.85, lng: -87.75 },
  zoom: 9.5,
  timezone: 'America/Chicago',

  // Status
  status: 'active',

  // Branding
  tagline: 'Empowering Chicagoland\'s diverse community voices',
  heroImage: '/images/cities/chicago-hero.jpg',

  // Features — all enabled
  features: {
    publisherDashboard: true,
    governmentDiscovery: true,
    advertise: true,
    campaigns: true,
    reporting: true,
  },

  // Geographic divisions (Phase 1: city community areas)
  neighborhoodCount: 77,
  districtCount: 50,

  // Region terminology
  regionLabel: 'Community Area',
  metroScope: true,
  counties: ['cook', 'dupage', 'kane', 'lake', 'mchenry', 'will'],

  // Data availability
  hasCensusData: true,
  hasGeoJSON: true,
};

/**
 * Check if a point is within the Chicagoland metro bounds
 */
export function isWithinChicagoland(lat: number, lng: number): boolean {
  return (
    lat >= CHICAGO_CONFIG.bounds.sw.lat &&
    lat <= CHICAGO_CONFIG.bounds.ne.lat &&
    lng >= CHICAGO_CONFIG.bounds.sw.lng &&
    lng <= CHICAGO_CONFIG.bounds.ne.lng
  );
}

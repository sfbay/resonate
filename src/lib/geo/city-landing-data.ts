/**
 * City-Specific Landing Page Data
 *
 * Per-city content for the [city] landing page: publisher marquee,
 * stat counters, preview publishers, and closing copy.
 *
 * Follows the same pattern as city-onboarding-data.ts.
 */

import type { CitySlug } from './types';

// =============================================================================
// TYPES
// =============================================================================

export interface PublisherLogo {
  name: string;
  /** Path to logo image, or null for text-only display */
  src: string | null;
}

export interface PreviewPublisher {
  name: string;
  reach: string;
  lang: string;
  match: number;
}

export interface CityLandingData {
  /** Publisher names/logos for the marquee strip */
  publishers: PublisherLogo[];

  /** Stat counters for the Publisher (coral) panel */
  publisherStats: {
    publisherCount: number;
    languageCount: number;
    neighborhoodCount: number;
  };

  /** Stat counters for the Government (teal) panel */
  governmentStats: {
    districtCount: number;
    profileCount: number;
    overlayCount: number;
  };

  /** Preview publishers shown in the government discovery card */
  previewPublishers: PreviewPublisher[];

  /** Featured publisher name for the floating advertise card */
  featuredPublisher: {
    name: string;
    tagline: string;
  };

  /** Closing section copy */
  closing: {
    neighborhoodCount: number;
    neighborhoodLabel: string;  // "neighborhoods" or "community areas"
    languageCount: number;
  };
}

// =============================================================================
// SAN FRANCISCO
// =============================================================================

const SF_DATA: CityLandingData = {
  publishers: [
    { src: '/images/publishers/el-tecolote.png', name: 'El Tecolote' },
    { src: '/images/publishers/mission-local.png', name: 'Mission Local' },
    { src: '/images/publishers/bay-view.png', name: 'The Bay View' },
    { src: '/images/publishers/wind-newspaper.png', name: 'The Wind' },
    { src: '/images/publishers/48-hills.png', name: '48 Hills' },
    { src: '/images/publishers/sf-public-press.png', name: 'SF Public Press' },
    { src: '/images/publishers/nichi-bei.png', name: 'Nichi Bei' },
    { src: '/images/publishers/richmond-review.png', name: 'Richmond Review' },
    { src: '/images/publishers/sunset-beacon.png', name: 'Sunset Beacon' },
    { src: '/images/publishers/j-weekly.png', name: 'J. Weekly' },
    { src: '/images/publishers/ingleside-light.png', name: 'Ingleside Light' },
  ],

  publisherStats: {
    publisherCount: 13,
    languageCount: 19,
    neighborhoodCount: 45,
  },

  governmentStats: {
    districtCount: 11,
    profileCount: 41,
    overlayCount: 5,
  },

  previewPublishers: [
    { name: 'El Tecolote', reach: '12K', lang: 'Spanish', match: 94 },
    { name: 'Mission Local', reach: '18K', lang: 'English', match: 87 },
    { name: 'The Bay View', reach: '9K', lang: 'English', match: 82 },
  ],

  featuredPublisher: {
    name: 'El Tecolote',
    tagline: 'Your ad supports bilingual journalism',
  },

  closing: {
    neighborhoodCount: 41,
    neighborhoodLabel: 'neighborhoods',
    languageCount: 19,
  },
};

// =============================================================================
// CHICAGOLAND
// =============================================================================

const CHICAGOLAND_DATA: CityLandingData = {
  publishers: [
    { src: null, name: 'Chicago Defender' },
    { src: null, name: 'South Side Weekly' },
    { src: null, name: 'Block Club Chicago' },
    { src: null, name: 'La Raza' },
    { src: null, name: 'Windy City Times' },
    { src: null, name: 'Hyde Park Herald' },
    { src: null, name: 'Daily Herald' },
    { src: null, name: 'Evanston RoundTable' },
  ],

  publisherStats: {
    publisherCount: 8,
    languageCount: 16,
    neighborhoodCount: 77,
  },

  governmentStats: {
    districtCount: 50,
    profileCount: 77,
    overlayCount: 5,
  },

  previewPublishers: [
    { name: 'Chicago Defender', reach: '45K', lang: 'English', match: 92 },
    { name: 'Block Club Chicago', reach: '85K', lang: 'English', match: 88 },
    { name: 'La Raza', reach: '22K', lang: 'Spanish', match: 85 },
  ],

  featuredPublisher: {
    name: 'Chicago Defender',
    tagline: 'Your ad supports Black community journalism',
  },

  closing: {
    neighborhoodCount: 77,
    neighborhoodLabel: 'community areas',
    languageCount: 16,
  },
};

// =============================================================================
// LOOKUP
// =============================================================================

const CITY_LANDING_DATA: Record<string, CityLandingData> = {
  sf: SF_DATA,
  chicago: CHICAGOLAND_DATA,
};

/**
 * Get landing page data for a city. Falls back to SF for unknown slugs.
 */
export function getCityLandingData(citySlug: CitySlug | string): CityLandingData {
  return CITY_LANDING_DATA[citySlug] ?? SF_DATA;
}

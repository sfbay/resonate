/**
 * Demo Data for Media Kit
 *
 * Hardcoded demo data for SFBay and other demo publishers.
 * Used when database doesn't have full data, or for demos.
 */

import type { MediaKitData } from './types';

export const DEMO_PUBLISHERS: Record<string, MediaKitData> = {
  sfbay: {
    publisher: {
      id: 'demo-sfbay',
      name: 'SFBay',
      slug: 'sfbay',
      description:
        'SFBay is a community news platform covering the San Francisco Bay Area with a focus on local politics, housing, transit, and community stories that matter to Bay Area residents.',
      tagline: 'Bay Area News That Matters',
      logoUrl: null,
      coverImageUrl: null,
      accentColor: '#0B525B', // Teal
    },

    reach: {
      totalFollowers: 47500,
      totalMonthlyImpressions: 285000,
      platforms: [
        {
          platform: 'instagram',
          handle: 'sfbay',
          followers: 28000,
          engagementRate: 4.2,
          verified: true,
          url: 'https://instagram.com/sfbay',
        },
        {
          platform: 'twitter',
          handle: 'sfbay',
          followers: 19500,
          engagementRate: 2.8,
          verified: true,
          url: 'https://twitter.com/sfbay',
        },
      ],
    },

    demographics: {
      topLanguages: [
        { language: 'English', percentage: 78 },
        { language: 'Spanish', percentage: 15 },
        { language: 'Chinese', percentage: 7 },
      ],
      incomeDistribution: {
        veryLow: 12,
        low: 22,
        moderate: 38,
        aboveModerate: 28,
      },
      ageDistribution: {
        under25: 18,
        age25to44: 45,
        age45to64: 25,
        age65plus: 12,
      },
      topEthnicities: [
        { ethnicity: 'White', percentage: 38 },
        { ethnicity: 'Asian', percentage: 32 },
        { ethnicity: 'Latino/Hispanic', percentage: 20 },
        { ethnicity: 'Black', percentage: 10 },
      ],
    },

    geography: {
      isCitywide: true,
      neighborhoods: [],
      primaryNeighborhoods: [],
    },

    growth: {
      trend: 'accelerating',
      growth30d: {
        followers: 2340,
        percentage: 5.2,
      },
      growth90d: {
        followers: 8500,
        percentage: 21.8,
      },
      badges: [
        {
          type: 'rising_star',
          tier: 'gold',
          awardedAt: new Date('2026-01-15'),
          criteriaMet: [
            { metric: 'growthRate', value: 5.2, threshold: 5.0 },
            { metric: 'engagementRate', value: 3.5, threshold: 3.0 },
            { metric: 'followerCount', value: 47500, threshold: 10000 },
          ],
        },
        {
          type: 'engagement_leader',
          tier: 'silver',
          awardedAt: new Date('2026-01-10'),
          criteriaMet: [
            { metric: 'engagementRate', value: 3.5, threshold: 3.0 },
          ],
        },
      ],
      verificationLevel: 'verified',
    },

    engagement: {
      averageRate: 3.5,
      rateVsCityAverage: 'above',
      topPlatformRate: {
        platform: 'instagram',
        rate: 4.2,
      },
    },

    topContent: [
      {
        id: 'post-1',
        platform: 'instagram',
        thumbnailUrl: null,
        caption: 'Breaking: SF Board of Supervisors approves new housing development in the Mission...',
        publishedAt: new Date('2026-01-20'),
        impressions: 45000,
        engagementScore: 92,
        engagementRate: 5.8,
      },
      {
        id: 'post-2',
        platform: 'twitter',
        thumbnailUrl: null,
        caption: 'BART announces major service changes starting February. Here\'s what you need to know...',
        publishedAt: new Date('2026-01-18'),
        impressions: 38000,
        engagementScore: 85,
        engagementRate: 4.2,
      },
      {
        id: 'post-3',
        platform: 'instagram',
        thumbnailUrl: null,
        caption: 'The history of San Francisco\'s cable cars: A visual journey through 150 years...',
        publishedAt: new Date('2026-01-15'),
        impressions: 52000,
        engagementScore: 88,
        engagementRate: 6.1,
      },
    ],

    contact: {
      showEmail: true,
      email: 'partnerships@sfbay.news',
      bookingUrl: null,
    },

    socialProof: {
      featuredCampaigns: [
        {
          name: 'Muni Safety Campaign',
          department: 'SFMTA',
          date: '2025-10',
          description: 'Transit safety awareness reaching 150K+ Bay Area commuters',
        },
        {
          name: 'Census 2020 Outreach',
          department: 'SF Office of Civic Engagement',
          date: '2020-03',
          description: 'Community census participation drive',
        },
      ],
      testimonials: [
        {
          author: 'Maria Chen',
          organization: 'SF Department of Public Health',
          quote: 'SFBay helped us reach diverse Bay Area communities with critical health information. Their engagement rates exceeded our expectations.',
          date: '2025-11',
        },
      ],
    },

    lastUpdated: new Date(),
    viewCount: 234,
  },

  'el-tecolote': {
    publisher: {
      id: 'demo-el-tecolote',
      name: 'El Tecolote',
      slug: 'el-tecolote',
      description:
        'El Tecolote is San Francisco\'s bilingual newspaper, serving the Latino community in the Mission District since 1970. We provide news, culture, and community stories in Spanish and English.',
      tagline: 'La Voz Latina de San Francisco',
      logoUrl: null,
      coverImageUrl: null,
      accentColor: '#FF6B6B', // Coral
    },

    reach: {
      totalFollowers: 35000,
      totalMonthlyImpressions: 180000,
      platforms: [
        {
          platform: 'instagram',
          handle: 'eltecolotesf',
          followers: 18000,
          engagementRate: 5.5,
          verified: true,
        },
        {
          platform: 'facebook',
          handle: 'ElTecoloteSF',
          followers: 12000,
          engagementRate: 3.2,
          verified: true,
        },
        {
          platform: 'whatsapp',
          handle: null,
          followers: 5000,
          engagementRate: 45.0, // WhatsApp has high open rates
          verified: true,
        },
      ],
    },

    demographics: {
      topLanguages: [
        { language: 'Spanish', percentage: 68 },
        { language: 'English', percentage: 28 },
        { language: 'Portuguese', percentage: 4 },
      ],
      incomeDistribution: {
        veryLow: 25,
        low: 35,
        moderate: 28,
        aboveModerate: 12,
      },
      ageDistribution: {
        under25: 22,
        age25to44: 38,
        age45to64: 28,
        age65plus: 12,
      },
      topEthnicities: [
        { ethnicity: 'Latino/Hispanic', percentage: 72 },
        { ethnicity: 'White', percentage: 15 },
        { ethnicity: 'Asian', percentage: 8 },
        { ethnicity: 'Black', percentage: 5 },
      ],
    },

    geography: {
      isCitywide: false,
      neighborhoods: ['mission', 'bernal_heights', 'excelsior', 'outer_mission', 'bayview_hunters_point'],
      primaryNeighborhoods: ['mission', 'bernal_heights', 'excelsior'],
    },

    growth: {
      trend: 'steady',
      growth30d: {
        followers: 850,
        percentage: 2.5,
      },
      growth90d: {
        followers: 3200,
        percentage: 10.1,
      },
      badges: [
        {
          type: 'community_builder',
          tier: 'gold',
          awardedAt: new Date('2026-01-01'),
          criteriaMet: [
            { metric: 'yearsServing', value: 55, threshold: 10 },
          ],
        },
        {
          type: 'verified_publisher',
          tier: 'gold',
          awardedAt: new Date('2025-06-01'),
        },
      ],
      verificationLevel: 'verified',
    },

    engagement: {
      averageRate: 4.5,
      rateVsCityAverage: 'above',
      topPlatformRate: {
        platform: 'instagram',
        rate: 5.5,
      },
    },

    topContent: [
      {
        id: 'et-post-1',
        platform: 'instagram',
        thumbnailUrl: null,
        caption: 'Día de los Muertos en la Misión: Our community comes together to honor loved ones...',
        publishedAt: new Date('2025-11-02'),
        impressions: 28000,
        engagementScore: 95,
        engagementRate: 7.2,
      },
      {
        id: 'et-post-2',
        platform: 'whatsapp',
        thumbnailUrl: null,
        caption: 'ALERTA: Nuevo programa de asistencia de renta disponible para residentes del Distrito 9...',
        publishedAt: new Date('2026-01-10'),
        impressions: 4500,
        engagementScore: 98,
        engagementRate: 52.0,
      },
    ],

    contact: {
      showEmail: true,
      email: 'info@eltecolote.org',
      bookingUrl: 'https://calendly.com/eltecolote',
    },

    socialProof: {
      featuredCampaigns: [
        {
          name: 'Vacunación COVID-19',
          department: 'SF Department of Public Health',
          date: '2021-04',
          description: 'Spanish-language vaccine outreach in the Mission',
        },
        {
          name: 'Rental Assistance Program',
          department: 'Mayor\'s Office of Housing',
          date: '2022-08',
          description: 'Bilingual campaign reaching 50K+ Mission residents',
        },
      ],
      testimonials: [
        {
          author: 'Carlos Rodriguez',
          organization: 'SF Latino Task Force',
          quote: 'El Tecolote is the trusted voice for our community. When they share our message, people listen.',
          date: '2025-09',
        },
      ],
    },

    lastUpdated: new Date(),
    viewCount: 567,
  },
};

/**
 * Get demo data for a publisher slug
 */
export function getDemoMediaKitData(slug: string): MediaKitData | null {
  return DEMO_PUBLISHERS[slug] || null;
}

/**
 * Check if a slug has demo data
 */
export function hasDemoData(slug: string): boolean {
  return slug in DEMO_PUBLISHERS;
}

"use client";

import { useRouter } from "next/navigation";
import { Nav, Footer } from "@/components/shared";
import { PublisherDiscoveryMap } from "@/components/government/PublisherDiscoveryMap";
import type { Publisher } from "@/types";

// Extended publisher type with logo
type PublisherWithLogo = Publisher & { logo?: string };

// Sample publishers for demo
// Add logo paths to /public/images/publishers/ and reference them here
const SAMPLE_PUBLISHERS: PublisherWithLogo[] = [
  {
    id: "pub-1",
    userId: "user-1",
    name: "Mission Local",
    logo: "/images/publishers/mission-local.png", // Add logo to public/images/publishers/
    description: "Hyperlocal news for the Mission District and surrounding neighborhoods",
    website: "https://missionlocal.org",
    vendorStatus: "registered",
    vendorId: "V-12345",
    platforms: [
      { platform: "instagram", handle: "@missionlocal", url: "https://instagram.com/missionlocal", followerCount: 28000, engagementRate: 4.2, verified: true },
      { platform: "newsletter", handle: "newsletter", url: "https://missionlocal.org/newsletter", followerCount: 15000, engagementRate: 32, verified: true },
      { platform: "facebook", handle: "MissionLocal", url: "https://facebook.com/MissionLocal", followerCount: 12000, engagementRate: 2.1, verified: true },
    ],
    audienceProfile: {
      geographic: { citywide: false, neighborhoods: ["mission", "bernal_heights", "excelsior", "outer_mission"] },
      demographic: { ageRanges: ["25-34", "35-44", "45-54"], primaryAgeRange: "35-44", languages: ["english", "spanish"], primaryLanguage: "english" },
      economic: { incomeLevel: ["low", "moderate"], housingStatus: ["renter_rent_controlled", "renter_market_rate"] },
      cultural: { ethnicities: ["latino_mexican", "latino_central_american"], communityAffiliations: ["parents_families", "neighborhood_association"] },
      interests: ["Local news", "Politics", "Community events"],
      description: "Engaged local residents who care about neighborhood issues, housing, and community development.",
      dataSource: { methods: ["platform_analytics", "census_overlay"], verificationLevel: "verified" },
      lastUpdated: new Date(),
    },
    rateCard: { currency: "USD", rates: [{ deliverableType: "sponsored_post", platform: "instagram", price: 25000 }] },
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "pub-2",
    userId: "user-2",
    name: "El Tecolote",
    logo: "/images/publishers/el-tecolote.png",
    description: "Bilingual community newspaper serving the Latino community since 1970",
    website: "https://eltecolote.org",
    vendorStatus: "registered",
    vendorId: "V-12346",
    platforms: [
      { platform: "instagram", handle: "@eltecolotesf", url: "https://instagram.com/eltecolotesf", followerCount: 18000, engagementRate: 5.1, verified: true },
      { platform: "newsletter", handle: "newsletter", url: "https://eltecolote.org", followerCount: 8000, engagementRate: 28, verified: true },
    ],
    audienceProfile: {
      geographic: { citywide: false, neighborhoods: ["mission", "excelsior", "outer_mission", "visitacion_valley"] },
      demographic: { ageRanges: ["35-44", "45-54", "55-64"], primaryAgeRange: "45-54", languages: ["spanish", "english"], primaryLanguage: "spanish" },
      economic: { incomeLevel: ["very_low", "low", "moderate"], housingStatus: ["renter_rent_controlled", "renter_subsidized"] },
      cultural: { ethnicities: ["latino_mexican", "latino_central_american", "latino_south_american"], immigrationGeneration: ["first_gen_established", "second_gen"], communityAffiliations: ["faith_catholic", "parents_families"] },
      interests: ["Latino culture", "Immigration", "Community advocacy"],
      description: "Spanish-speaking families and community members engaged in cultural preservation and advocacy.",
      dataSource: { methods: ["self_reported", "census_overlay"], verificationLevel: "partially_verified" },
      lastUpdated: new Date(),
    },
    rateCard: { currency: "USD", rates: [{ deliverableType: "sponsored_post", platform: "instagram", price: 15000 }] },
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "pub-3",
    userId: "user-3",
    name: "The Wind Newspaper",
    logo: "/images/publishers/wind-newspaper.png",
    description: "Chinese-English bilingual community newspaper covering San Francisco's Chinese American communities",
    website: "https://thewindnewspaper.com",
    vendorStatus: "registered",
    vendorId: "V-12347",
    platforms: [
      { platform: "website", handle: "thewind", url: "https://thewindnewspaper.com", followerCount: 15000, engagementRate: 3.5, verified: true },
      { platform: "facebook", handle: "TheWindNewspaper", url: "https://facebook.com/TheWindNewspaper", followerCount: 8000, engagementRate: 4.1, verified: true },
    ],
    audienceProfile: {
      geographic: { citywide: false, neighborhoods: ["chinatown", "inner_richmond", "outer_richmond", "inner_sunset", "outer_sunset", "visitacion_valley"] },
      demographic: { ageRanges: ["35-44", "45-54", "55-64", "65-74"], primaryAgeRange: "45-54", languages: ["chinese_cantonese", "chinese_mandarin", "english"], primaryLanguage: "chinese_cantonese" },
      economic: { incomeLevel: ["low", "moderate"], housingStatus: ["renter_rent_controlled", "homeowner"] },
      cultural: { ethnicities: ["chinese"], immigrationGeneration: ["first_gen_established", "first_gen_recent", "second_gen"], communityAffiliations: ["seniors_community", "merchants_association", "neighborhood_association"] },
      interests: ["Chinese American community", "Local news", "Community events", "Small business"],
      description: "Chinese-speaking families and community members across SF neighborhoods with significant Chinese American populations.",
      dataSource: { methods: ["self_reported", "census_overlay"], verificationLevel: "partially_verified" },
      lastUpdated: new Date(),
    },
    rateCard: { currency: "USD", rates: [{ deliverableType: "sponsored_post", platform: "website", price: 18000 }] },
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "pub-4",
    userId: "user-4",
    name: "Bayview Hunters Point Community",
    logo: "/images/publishers/bayview-hp.png",
    description: "Community voice for Bayview-Hunters Point residents",
    vendorStatus: "registered",
    platforms: [
      { platform: "instagram", handle: "@bayviewhp", url: "https://instagram.com/bayviewhp", followerCount: 8500, engagementRate: 6.8, verified: true },
      { platform: "facebook", handle: "BayviewHP", url: "https://facebook.com/BayviewHP", followerCount: 12000, engagementRate: 4.5, verified: true },
    ],
    audienceProfile: {
      geographic: { citywide: false, neighborhoods: ["bayview_hunters_point", "visitacion_valley", "portola"] },
      demographic: { ageRanges: ["25-34", "35-44", "45-54"], primaryAgeRange: "35-44", languages: ["english"], primaryLanguage: "english" },
      economic: { incomeLevel: ["extremely_low", "very_low", "low"], housingStatus: ["renter_subsidized", "renter_market_rate"], publicBenefitsRecipients: true },
      cultural: { ethnicities: ["black_african_american", "pacific_islander"], communityAffiliations: ["faith_protestant", "parents_families", "neighborhood_association"] },
      interests: ["Community development", "Youth programs", "Local events"],
      description: "Bayview residents focused on community empowerment and neighborhood improvement.",
      dataSource: { methods: ["self_reported", "census_overlay"], verificationLevel: "partially_verified" },
      lastUpdated: new Date(),
    },
    rateCard: { currency: "USD", rates: [{ deliverableType: "sponsored_post", platform: "instagram", price: 12000 }] },
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "pub-5",
    userId: "user-5",
    name: "Richmond Review",
    logo: "/images/publishers/richmond-review.png",
    description: "Neighborhood news and events for the Richmond District",
    website: "https://richmondsunsetblog.com",
    vendorStatus: "registered",
    platforms: [
      { platform: "instagram", handle: "@richmondsf", url: "https://instagram.com/richmondsf", followerCount: 15000, engagementRate: 3.9, verified: true },
      { platform: "newsletter", handle: "newsletter", url: "https://richmondsunsetblog.com", followerCount: 9000, engagementRate: 35, verified: true },
    ],
    audienceProfile: {
      geographic: { citywide: false, neighborhoods: ["inner_richmond", "outer_richmond", "sea_cliff", "presidio"] },
      demographic: { ageRanges: ["35-44", "45-54", "55-64"], primaryAgeRange: "45-54", languages: ["english", "chinese_cantonese", "russian"], primaryLanguage: "english" },
      economic: { incomeLevel: ["moderate", "above_moderate"], housingStatus: ["homeowner", "renter_market_rate"] },
      cultural: { ethnicities: ["chinese", "white_european"], communityAffiliations: ["parents_families", "neighborhood_association"] },
      interests: ["Local restaurants", "Parks", "Neighborhood news"],
      description: "Richmond District families and long-time residents engaged in neighborhood life.",
      dataSource: { methods: ["platform_analytics", "census_overlay"], verificationLevel: "verified" },
      lastUpdated: new Date(),
    },
    rateCard: { currency: "USD", rates: [{ deliverableType: "sponsored_post", platform: "instagram", price: 18000 }] },
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "pub-6",
    userId: "user-6",
    name: "Sunset Beacon",
    logo: "/images/publishers/sunset-beacon.png",
    description: "Community news for the Sunset and Parkside neighborhoods",
    vendorStatus: "registered",
    platforms: [
      { platform: "instagram", handle: "@sunsetbeacon", url: "https://instagram.com/sunsetbeacon", followerCount: 11000, engagementRate: 4.5, verified: true },
      { platform: "facebook", handle: "SunsetBeacon", url: "https://facebook.com/SunsetBeacon", followerCount: 8500, engagementRate: 3.8, verified: true },
    ],
    audienceProfile: {
      geographic: { citywide: false, neighborhoods: ["inner_sunset", "outer_sunset", "parkside", "stonestown"] },
      demographic: { ageRanges: ["35-44", "45-54", "55-64", "65-74"], primaryAgeRange: "45-54", languages: ["english", "chinese_cantonese"], primaryLanguage: "english" },
      economic: { incomeLevel: ["moderate", "above_moderate"], housingStatus: ["homeowner", "renter_rent_controlled"] },
      cultural: { ethnicities: ["chinese", "white_european", "filipino"], communityAffiliations: ["parents_families", "seniors_community"] },
      interests: ["Schools", "Local business", "Ocean Beach"],
      description: "Sunset District families, many multi-generational, invested in schools and neighborhood.",
      dataSource: { methods: ["self_reported", "census_overlay"], verificationLevel: "partially_verified" },
      lastUpdated: new Date(),
    },
    rateCard: { currency: "USD", rates: [{ deliverableType: "sponsored_post", platform: "instagram", price: 14000 }] },
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "pub-9",
    userId: "user-9",
    name: "SF Bay View",
    logo: "/images/publishers/sf-bay-view.png",
    description: "National Black newspaper based in San Francisco",
    website: "https://sfbayview.com",
    vendorStatus: "registered",
    platforms: [
      { platform: "website", handle: "sfbayview", url: "https://sfbayview.com", followerCount: 45000, engagementRate: 2.8, verified: true },
      { platform: "facebook", handle: "SFBayView", url: "https://facebook.com/SFBayView", followerCount: 32000, engagementRate: 3.5, verified: true },
      { platform: "instagram", handle: "@sfbayview", url: "https://instagram.com/sfbayview", followerCount: 18000, engagementRate: 4.1, verified: true },
    ],
    audienceProfile: {
      geographic: { citywide: true, neighborhoods: ["bayview_hunters_point", "western_addition", "visitacion_valley", "oceanview", "ingleside"] },
      demographic: { ageRanges: ["25-34", "35-44", "45-54", "55-64"], primaryAgeRange: "45-54", languages: ["english"], primaryLanguage: "english" },
      economic: { incomeLevel: ["very_low", "low", "moderate"], housingStatus: ["renter_subsidized", "renter_rent_controlled", "renter_market_rate"] },
      cultural: { ethnicities: ["black_african_american", "black_african", "black_caribbean"], communityAffiliations: ["faith_protestant", "parents_families", "labor_union"] },
      interests: ["Civil rights", "Community news", "Black culture"],
      description: "Black community members across SF and the Bay Area engaged in social justice.",
      dataSource: { methods: ["self_reported", "census_overlay"], verificationLevel: "partially_verified" },
      lastUpdated: new Date(),
    },
    rateCard: { currency: "USD", rates: [{ deliverableType: "sponsored_post", platform: "website", price: 35000 }] },
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "pub-10",
    userId: "user-10",
    name: "Hoodline",
    logo: "/images/publishers/hoodline.png",
    description: "Hyperlocal news covering all SF neighborhoods",
    website: "https://hoodline.com",
    vendorStatus: "registered",
    platforms: [
      { platform: "website", handle: "hoodline", url: "https://hoodline.com", followerCount: 120000, engagementRate: 1.5, verified: true },
      { platform: "instagram", handle: "@haborhood", url: "https://instagram.com/hoodline", followerCount: 45000, engagementRate: 2.8, verified: true },
      { platform: "newsletter", handle: "newsletter", url: "https://hoodline.com/newsletters", followerCount: 65000, engagementRate: 22, verified: true },
    ],
    audienceProfile: {
      geographic: { citywide: true, neighborhoods: [] },
      demographic: { ageRanges: ["25-34", "35-44"], primaryAgeRange: "25-34", languages: ["english"], primaryLanguage: "english" },
      economic: { incomeLevel: ["moderate", "above_moderate"], housingStatus: ["renter_market_rate"] },
      cultural: { ethnicities: ["white_european", "multiracial"], communityAffiliations: ["artists_creatives"] },
      interests: ["Local news", "Restaurants", "Real estate"],
      description: "Tech-savvy SF residents who want hyperlocal news about their neighborhoods.",
      dataSource: { methods: ["platform_analytics"], verificationLevel: "verified" },
      lastUpdated: new Date(),
    },
    rateCard: { currency: "USD", rates: [{ deliverableType: "sponsored_post", platform: "website", price: 75000 }] },
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "pub-11",
    userId: "user-11",
    name: "Bay Area Reporter",
    logo: "/images/publishers/bayarea-reporter.png",
    description: "The nation's oldest continuously-published LGBTQ newspaper, serving the Bay Area since 1971",
    website: "https://ebar.com",
    vendorStatus: "registered",
    platforms: [
      { platform: "website", handle: "ebar", url: "https://ebar.com", followerCount: 55000, engagementRate: 2.4, verified: true },
      { platform: "instagram", handle: "@bayaborter", url: "https://instagram.com/bayareporter", followerCount: 12000, engagementRate: 3.8, verified: true },
      { platform: "newsletter", handle: "newsletter", url: "https://ebar.com/newsletter", followerCount: 18000, engagementRate: 28, verified: true },
    ],
    audienceProfile: {
      geographic: { citywide: true, neighborhoods: ["castro", "soma", "hayes_valley", "mission", "noe_valley"] },
      demographic: { ageRanges: ["25-34", "35-44", "45-54", "55-64"], primaryAgeRange: "35-44", languages: ["english"], primaryLanguage: "english" },
      economic: { incomeLevel: ["moderate", "above_moderate"], housingStatus: ["renter_market_rate", "homeowner"] },
      cultural: { ethnicities: ["white_european", "latino_other", "multiracial"], communityAffiliations: ["lgbtq", "artists_creatives"] },
      interests: ["LGBTQ news", "Politics", "Arts & culture", "Nightlife"],
      description: "LGBTQ community members and allies engaged in local politics, culture, and community issues.",
      dataSource: { methods: ["platform_analytics", "census_overlay"], verificationLevel: "verified" },
      lastUpdated: new Date(),
    },
    rateCard: { currency: "USD", rates: [{ deliverableType: "sponsored_post", platform: "website", price: 35000 }] },
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "pub-12",
    userId: "user-12",
    name: "SF Public Press",
    logo: "/images/publishers/sf-public-press.png",
    description: "Nonprofit investigative news for San Francisco, focusing on accountability journalism",
    website: "https://sfpublicpress.org",
    vendorStatus: "registered",
    platforms: [
      { platform: "website", handle: "sfpublicpress", url: "https://sfpublicpress.org", followerCount: 35000, engagementRate: 3.2, verified: true },
      { platform: "newsletter", handle: "newsletter", url: "https://sfpublicpress.org/newsletter", followerCount: 22000, engagementRate: 35, verified: true },
      { platform: "instagram", handle: "@sfpublicpress", url: "https://instagram.com/sfpublicpress", followerCount: 8500, engagementRate: 4.1, verified: true },
    ],
    audienceProfile: {
      geographic: { citywide: true, neighborhoods: [] },
      demographic: { ageRanges: ["35-44", "45-54", "55-64"], primaryAgeRange: "45-54", languages: ["english"], primaryLanguage: "english" },
      economic: { incomeLevel: ["moderate", "above_moderate"], housingStatus: ["renter_market_rate", "homeowner"] },
      cultural: { ethnicities: ["white_european", "multiracial"], communityAffiliations: ["environmentalists", "neighborhood_association"] },
      interests: ["Investigative journalism", "Local politics", "Housing", "Government accountability"],
      description: "Civically engaged San Franciscans who follow local government and policy issues closely.",
      dataSource: { methods: ["self_reported", "census_overlay"], verificationLevel: "partially_verified" },
      lastUpdated: new Date(),
    },
    rateCard: { currency: "USD", rates: [{ deliverableType: "sponsored_post", platform: "website", price: 28000 }] },
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "pub-14",
    userId: "user-14",
    name: "48 Hills",
    logo: "/images/publishers/48-hills.png",
    description: "Progressive news and culture covering San Francisco politics, arts, and nightlife",
    website: "https://48hills.org",
    vendorStatus: "registered",
    vendorId: "V-12358",
    platforms: [
      { platform: "website", handle: "48hills", url: "https://48hills.org", followerCount: 65000, engagementRate: 2.8, verified: true },
      { platform: "newsletter", handle: "newsletter", url: "https://48hills.org/newsletter", followerCount: 30000, engagementRate: 28, verified: true },
      { platform: "instagram", handle: "@48aborlls", url: "https://instagram.com/48hills", followerCount: 15000, engagementRate: 3.5, verified: true },
    ],
    audienceProfile: {
      geographic: { citywide: true, neighborhoods: ["mission", "haight_ashbury", "soma", "western_addition", "castro", "tenderloin"] },
      demographic: { ageRanges: ["25-34", "35-44", "45-54"], primaryAgeRange: "35-44", languages: ["english"], primaryLanguage: "english" },
      economic: { incomeLevel: ["low", "moderate"], housingStatus: ["renter_rent_controlled", "renter_market_rate"] },
      cultural: { ethnicities: ["white_european", "latino_mexican", "multiracial"], communityAffiliations: ["artists_creatives", "labor_union", "lgbtq", "environmentalists"] },
      interests: ["Local politics", "Arts & culture", "Housing justice", "Nightlife"],
      description: "Politically engaged San Franciscans interested in progressive politics, arts, and tenant issues.",
      dataSource: { methods: ["platform_analytics", "census_overlay"], verificationLevel: "verified" },
      lastUpdated: new Date(),
    },
    rateCard: { currency: "USD", rates: [{ deliverableType: "sponsored_post", platform: "website", price: 35000 }] },
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "pub-15",
    userId: "user-15",
    name: "Nichi Bei News",
    logo: "/images/publishers/nichi-bei.png",
    description: "Japanese American community newspaper serving the Bay Area since 2009, successor to the Nichi Bei Times (1946)",
    website: "https://nichibei.org",
    vendorStatus: "registered",
    vendorId: "V-12359",
    platforms: [
      { platform: "website", handle: "nichibei", url: "https://nichibei.org", followerCount: 12000, engagementRate: 3.2, verified: true },
      { platform: "newsletter", handle: "newsletter", url: "https://nichibei.org/newsletter", followerCount: 6000, engagementRate: 35, verified: true },
      { platform: "facebook", handle: "NichiBei", url: "https://facebook.com/NichiBeiWeekly", followerCount: 5500, engagementRate: 4.0, verified: true },
    ],
    audienceProfile: {
      geographic: { citywide: false, neighborhoods: ["japantown", "western_addition", "inner_richmond", "inner_sunset"] },
      demographic: { ageRanges: ["45-54", "55-64", "65-74", "75+"], primaryAgeRange: "55-64", languages: ["english", "japanese"], primaryLanguage: "english" },
      economic: { incomeLevel: ["moderate", "above_moderate"], housingStatus: ["homeowner", "renter_rent_controlled"] },
      cultural: { ethnicities: ["japanese"], immigrationGeneration: ["second_gen", "third_gen_plus"], communityAffiliations: ["faith_buddhist", "seniors_community", "neighborhood_association"] },
      interests: ["Japanese American culture", "Community history", "AAPI issues", "Japantown preservation"],
      description: "Japanese American community members and AAPI allies engaged in cultural preservation and community advocacy.",
      dataSource: { methods: ["self_reported", "census_overlay"], verificationLevel: "partially_verified" },
      lastUpdated: new Date(),
    },
    rateCard: { currency: "USD", rates: [{ deliverableType: "sponsored_post", platform: "website", price: 15000 }] },
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "pub-16",
    userId: "user-16",
    name: "Ingleside Light",
    logo: "/images/publishers/ingleside-light.png",
    description: "Hyperlocal community news for the Ingleside, Oceanview, and surrounding neighborhoods",
    website: "https://inglesidelight.com",
    vendorStatus: "registered",
    vendorId: "V-12360",
    platforms: [
      { platform: "website", handle: "inglesidelight", url: "https://inglesidelight.com", followerCount: 8000, engagementRate: 4.5, verified: true },
      { platform: "newsletter", handle: "newsletter", url: "https://inglesidelight.com/newsletter", followerCount: 4500, engagementRate: 40, verified: true },
      { platform: "instagram", handle: "@inglesidelight", url: "https://instagram.com/inglesidelight", followerCount: 3200, engagementRate: 5.8, verified: true },
    ],
    audienceProfile: {
      geographic: { citywide: false, neighborhoods: ["ingleside", "oceanview", "excelsior", "outer_mission"] },
      demographic: { ageRanges: ["35-44", "45-54", "55-64"], primaryAgeRange: "45-54", languages: ["english", "spanish", "chinese_cantonese"], primaryLanguage: "english" },
      economic: { incomeLevel: ["low", "moderate"], housingStatus: ["homeowner", "renter_rent_controlled"] },
      cultural: { ethnicities: ["latino_mexican", "chinese", "filipino", "black_african_american"], communityAffiliations: ["parents_families", "neighborhood_association"] },
      interests: ["Neighborhood development", "Local schools", "Community safety", "Small business"],
      description: "Diverse working-class families in SF's southern neighborhoods invested in community development.",
      dataSource: { methods: ["self_reported", "census_overlay"], verificationLevel: "partially_verified" },
      lastUpdated: new Date(),
    },
    rateCard: { currency: "USD", rates: [{ deliverableType: "sponsored_post", platform: "website", price: 10000 }] },
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "pub-13",
    userId: "user-13",
    name: "J. The Jewish News of Northern California",
    logo: "/images/publishers/jnews.png",
    description: "Award-winning Jewish community newspaper serving the Bay Area since 1895",
    website: "https://jweekly.com",
    vendorStatus: "registered",
    platforms: [
      { platform: "website", handle: "jweekly", url: "https://jweekly.com", followerCount: 42000, engagementRate: 2.6, verified: true },
      { platform: "newsletter", handle: "newsletter", url: "https://jweekly.com/newsletter", followerCount: 28000, engagementRate: 32, verified: true },
      { platform: "instagram", handle: "@jaborewish", url: "https://instagram.com/jweekly", followerCount: 9500, engagementRate: 3.9, verified: true },
    ],
    audienceProfile: {
      geographic: { citywide: true, neighborhoods: [] },
      demographic: { ageRanges: ["35-44", "45-54", "55-64", "65-74"], primaryAgeRange: "55-64", languages: ["english"], primaryLanguage: "english" },
      economic: { incomeLevel: ["moderate", "above_moderate"], housingStatus: ["homeowner", "renter_market_rate"] },
      cultural: { ethnicities: ["jewish"], communityAffiliations: ["faith_jewish", "parents_families", "seniors_community"] },
      interests: ["Jewish culture", "Israel news", "Community events", "Arts & culture"],
      description: "Jewish community members across the Bay Area engaged in cultural and religious life.",
      dataSource: { methods: ["platform_analytics", "census_overlay"], verificationLevel: "verified" },
      lastUpdated: new Date(),
    },
    rateCard: { currency: "USD", rates: [{ deliverableType: "sponsored_post", platform: "website", price: 32000 }] },
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function DiscoverPublishersPage() {
  const router = useRouter();

  const handlePublisherSelect = (pub: Publisher) => {
    const params = new URLSearchParams();
    const neighborhoods = pub.audienceProfile?.geographic?.neighborhoods || [];
    if (neighborhoods.length > 0) {
      params.set('neighborhoods', neighborhoods.join(','));
    }
    const languages = pub.audienceProfile?.demographic?.languages || [];
    if (languages.length > 0) {
      params.set('languages', languages.join(','));
    }
    router.push(`/government/onboarding?${params.toString()}`);
  };

  const handleStartCampaign = () => {
    router.push('/government/onboarding');
  };

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Nav variant="government" />

      {/* Header */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-sm font-semibold tracking-widest uppercase text-[var(--color-teal)] mb-4">
            Publisher Network
          </div>
          <h1 className="font-[family-name:var(--font-fraunces)] text-[var(--color-charcoal)] mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, lineHeight: 1.1 }}>
            Discover Publishers by Geography
          </h1>
          <p className="text-xl text-[var(--color-slate)] max-w-2xl">
            Explore our network of community publishers across San Francisco. Click a publisher to start a campaign targeting their audience, or browse neighborhoods to view demographic insights.
          </p>
        </div>
      </section>

      {/* Map */}
      <section className="pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <PublisherDiscoveryMap
            publishers={SAMPLE_PUBLISHERS}
            onPublisherSelect={handlePublisherSelect}
          />
        </div>
      </section>

      {/* Start Campaign CTA */}
      <section className="pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[var(--color-teal)] rounded-2xl p-8 flex items-center justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-fraunces)] text-white text-xl font-semibold">
                Ready to start a campaign?
              </h2>
              <p className="text-teal-100 mt-1 max-w-lg">
                Select a publisher above to pre-fill your audience targets, or start from scratch with our guided campaign builder.
              </p>
            </div>
            <button
              onClick={handleStartCampaign}
              className="flex-shrink-0 bg-white text-[var(--color-teal)] px-6 py-3 rounded-full text-sm font-semibold hover:bg-white/90 transition-colors flex items-center gap-2"
            >
              Start Campaign
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

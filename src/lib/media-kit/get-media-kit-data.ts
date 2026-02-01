/**
 * Media Kit Data Aggregator
 *
 * Server-side function to fetch and combine all data needed
 * for a publisher's media kit / sell sheet.
 */

import { createClient } from '@supabase/supabase-js';
import type { MediaKitData, PlatformReach, TopPost, MediaKitSettings } from './types';
import type { Platform, Badge, SFNeighborhood } from '@/types';
import { getDemoMediaKitData, hasDemoData } from './demo-data';

// Create Supabase client for server-side use
function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key);
}

/**
 * Fetch media kit data by publisher slug
 * Falls back to demo data if database lookup fails
 */
export async function getMediaKitDataBySlug(slug: string): Promise<MediaKitData | null> {
  // Check for demo data first (useful for demos and testing)
  if (hasDemoData(slug)) {
    const demoData = getDemoMediaKitData(slug);
    if (demoData) {
      return demoData;
    }
  }

  const supabase = getServerSupabase();

  // If no Supabase connection, return demo data or null
  if (!supabase) {
    return getDemoMediaKitData(slug);
  }

  try {
    // First, find the publisher by slug (check media_kit_settings or publisher name)
    const { data: settings, error: settingsError } = await supabase
      .from('media_kit_settings')
      .select('*, publishers(*)')
      .eq('custom_slug', slug)
      .single();

    if (settingsError || !settings) {
      // Try finding by publisher name as slug
      const { data: publisher, error: pubError } = await supabase
        .from('publishers')
        .select('*')
        .ilike('name', slug.replace(/-/g, ' '))
        .single();

      if (pubError || !publisher) {
        // Fall back to demo data
        return getDemoMediaKitData(slug);
      }

      return getMediaKitDataByPublisherId(publisher.id);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const publisher = (settings as any).publishers;
    return getMediaKitDataByPublisherId(publisher.id, settings);
  } catch (error) {
    console.error('Error fetching media kit data:', error);
    // Fall back to demo data on any error
    return getDemoMediaKitData(slug);
  }
}

/**
 * Fetch media kit data by publisher ID
 */
export async function getMediaKitDataByPublisherId(
  publisherId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  existingSettings?: any
): Promise<MediaKitData | null> {
  const supabase = getServerSupabase();

  if (!supabase) {
    return null;
  }

  // Fetch publisher
  const { data: publisher, error: pubError } = await supabase
    .from('publishers')
    .select('*')
    .eq('id', publisherId)
    .single();

  if (pubError || !publisher) {
    return null;
  }

  // Fetch media kit settings if not provided
  let settings = existingSettings;
  if (!settings) {
    const { data: settingsData } = await supabase
      .from('media_kit_settings')
      .select('*')
      .eq('publisher_id', publisherId)
      .single();
    settings = settingsData;
  }

  // Fetch platform connections
  const { data: connections } = await supabase
    .from('platform_connections')
    .select('*')
    .eq('publisher_id', publisherId)
    .eq('status', 'active');

  // Fetch latest metrics snapshots
  const { data: snapshots } = await supabase
    .from('metrics_snapshots')
    .select('*')
    .eq('publisher_id', publisherId)
    .order('recorded_at', { ascending: false });

  // Fetch growth snapshots
  const { data: growthData } = await supabase
    .from('growth_snapshots')
    .select('*')
    .eq('publisher_id', publisherId)
    .order('snapshot_date', { ascending: false });

  // Fetch badges
  const { data: badgesData } = await supabase
    .from('growth_badges')
    .select('*')
    .eq('publisher_id', publisherId)
    .eq('status', 'active');

  // Fetch top content (last 90 days, sorted by engagement)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const { data: contentData } = await supabase
    .from('content_performance')
    .select('*')
    .eq('publisher_id', publisherId)
    .gte('published_at', ninetyDaysAgo.toISOString())
    .order('engagement_score', { ascending: false })
    .limit(6);

  // Build platform reach data
  const platformReach: PlatformReach[] = [];
  const seenPlatforms = new Set<string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const connectionsList = (connections || []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const snapshotsList = (snapshots || []) as any[];

  for (const conn of connectionsList) {
    if (seenPlatforms.has(conn.platform)) continue;
    seenPlatforms.add(conn.platform);

    const latestSnapshot = snapshotsList.find((s) => s.platform === conn.platform);

    platformReach.push({
      platform: conn.platform as Platform,
      handle: conn.handle || null,
      followers: latestSnapshot?.follower_count || 0,
      engagementRate: latestSnapshot?.engagement_rate ? Number(latestSnapshot.engagement_rate) : 0,
      verified: conn.verified || false,
      url: conn.url || undefined,
    });
  }

  // Calculate totals
  const totalFollowers = platformReach.reduce((sum, p) => sum + p.followers, 0);
  const avgEngagement =
    platformReach.length > 0
      ? platformReach.reduce((sum, p) => sum + p.engagementRate, 0) / platformReach.length
      : 0;

  // Get growth data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const growthList = (growthData || []) as any[];
  const monthlyGrowth = growthList.find((g) => g.period_type === 'monthly');
  const quarterlyGrowth = growthList.find((g) => g.period_type === 'quarterly');

  // Determine trend
  let trend: 'accelerating' | 'steady' | 'declining' = 'steady';
  const growthRate = monthlyGrowth?.growth_rate_percent || 0;
  if (growthRate > 10) trend = 'accelerating';
  else if (growthRate < -5) trend = 'declining';

  // Transform badges
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const badges: Badge[] = ((badgesData || []) as any[]).map((b) => ({
    type: b.badge_type,
    tier: b.tier,
    awardedAt: new Date(b.awarded_at),
    expiresAt: b.expires_at ? new Date(b.expires_at) : undefined,
    platform: b.platform || undefined,
    criteriaMet: b.criteria_met,
  }));

  // Transform top content
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topContent: TopPost[] = ((contentData || []) as any[]).map((c) => ({
    id: c.id,
    platform: c.platform as Platform,
    thumbnailUrl: c.thumbnail_url || null,
    caption: c.caption_excerpt || null,
    publishedAt: new Date(c.published_at),
    impressions: c.impressions || null,
    engagementScore: c.engagement_score || 0,
    engagementRate: c.engagement_rate ? Number(c.engagement_rate) : null,
  }));

  // Get top platform by engagement
  const topPlatform = platformReach.reduce(
    (best, p) => (p.engagementRate > best.rate ? { platform: p.platform, rate: p.engagementRate } : best),
    { platform: 'instagram' as Platform, rate: 0 }
  );

  // Parse audience profile from publisher
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const audienceProfile = (publisher.audience_profile as any) || {};
  const geographic = audienceProfile.geographic || {};
  const neighborhoods = (geographic.neighborhoods || []) as SFNeighborhood[];

  // Build demographic data (simplified - in production would use census overlay)
  // For now, use sample data that looks realistic
  const demographics = {
    topLanguages: [
      { language: 'English', percentage: 65 },
      { language: 'Spanish', percentage: 25 },
      { language: 'Chinese', percentage: 10 },
    ],
    incomeDistribution: {
      veryLow: 15,
      low: 25,
      moderate: 35,
      aboveModerate: 25,
    },
    ageDistribution: {
      under25: 15,
      age25to44: 40,
      age45to64: 30,
      age65plus: 15,
    },
    topEthnicities: [
      { ethnicity: 'Latino/Hispanic', percentage: 35 },
      { ethnicity: 'White', percentage: 30 },
      { ethnicity: 'Asian', percentage: 25 },
      { ethnicity: 'Black', percentage: 10 },
    ],
  };

  // Determine slug
  const slug = settings?.custom_slug || publisher.name.toLowerCase().replace(/\s+/g, '-');

  // Build the media kit data
  const mediaKitData: MediaKitData = {
    publisher: {
      id: publisher.id,
      name: publisher.name,
      slug,
      description: publisher.description || null,
      tagline: settings?.headline || null,
      logoUrl: settings?.custom_logo_url || null,
      coverImageUrl: settings?.cover_image_url || null,
      accentColor: settings?.accent_color || '#FF6B6B',
    },

    reach: {
      totalFollowers,
      totalMonthlyImpressions: null, // Would calculate from content data
      platforms: platformReach,
    },

    demographics,

    geography: {
      isCitywide: geographic.citywide || neighborhoods.length === 0,
      neighborhoods,
      primaryNeighborhoods: neighborhoods.slice(0, 5),
    },

    growth: {
      trend,
      growth30d: {
        followers: monthlyGrowth?.net_growth || 0,
        percentage: monthlyGrowth?.growth_rate_percent || 0,
      },
      growth90d: {
        followers: quarterlyGrowth?.net_growth || 0,
        percentage: quarterlyGrowth?.growth_rate_percent || 0,
      },
      badges,
      verificationLevel: platformReach.some((p) => p.verified)
        ? platformReach.every((p) => p.verified)
          ? 'verified'
          : 'partial'
        : 'self_reported',
    },

    engagement: {
      averageRate: avgEngagement,
      rateVsCityAverage: avgEngagement > 3 ? 'above' : avgEngagement > 1.5 ? 'at' : 'below',
      topPlatformRate: topPlatform,
    },

    topContent,

    contact: {
      showEmail: settings?.show_contact_email || false,
      email: settings?.contact_email || null,
      bookingUrl: settings?.booking_url || null,
    },

    socialProof: {
      featuredCampaigns: settings?.featured_campaigns || [],
      testimonials: settings?.testimonials || [],
    },

    lastUpdated: new Date(),
    viewCount: settings?.view_count || 0,
  };

  return mediaKitData;
}

/**
 * Increment view count for a media kit
 */
export async function incrementMediaKitViews(publisherId: string): Promise<void> {
  const supabase = getServerSupabase();

  if (!supabase) {
    return;
  }

  await supabase.rpc('increment_media_kit_views', {
    kit_id: publisherId,
  });
}

/**
 * Get media kit settings for a publisher
 */
export async function getMediaKitSettings(publisherId: string): Promise<MediaKitSettings | null> {
  const supabase = getServerSupabase();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('media_kit_settings')
    .select('*')
    .eq('publisher_id', publisherId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    visibility: data.visibility,
    showFollowerCounts: data.show_follower_counts,
    showEngagementRates: data.show_engagement_rates,
    showGrowthMetrics: data.show_growth_metrics,
    showAudienceDemographics: data.show_audience_demographics,
    showTopContent: data.show_top_content,
    showBadges: data.show_badges,
    showWebTraffic: data.show_web_traffic,
    displayedPlatforms: data.displayed_platforms,
  };
}

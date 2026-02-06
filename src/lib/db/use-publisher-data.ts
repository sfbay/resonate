'use client';

/**
 * Hook to fetch publisher data from Supabase
 *
 * Fetches publisher info, platform connections, metrics snapshots,
 * growth data, and badges for the dashboard.
 */

import { useState, useEffect } from 'react';
import { getSupabaseClient } from './supabase';
import type {
  GrowthMetrics,
  PlatformConnection,
  MetricsSnapshot,
  Badge,
  Platform,
  GrowthTrend,
} from '@/types';
import type { PostPerformance, GrowthDataPoint } from '@/components/publisher/analytics';

interface PublisherData {
  publisherId: string;
  publisherName: string;
  publisherDescription: string | null;
  metrics: GrowthMetrics | null;
  connections: PlatformConnection[];
  latestSnapshots: Record<Platform, MetricsSnapshot | null>;
  badges: Badge[];
  // New: Content performance and growth history for visualizations
  posts: PostPerformance[];
  growthHistory: GrowthDataPoint[];
}

interface UsePublisherDataResult {
  data: PublisherData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// Initialize empty snapshots record
function createEmptySnapshots(): Record<Platform, MetricsSnapshot | null> {
  return {
    instagram: null,
    facebook: null,
    tiktok: null,
    twitter: null,
    youtube: null,
    newsletter: null,
    website: null,
    other: null,
    whatsapp: null,
    telegram: null,
    signal: null,
    sms: null,
    weibo: null,
    mailchimp: null,
    substack: null,
    google: null,
  };
}

/**
 * Fetch publisher data from Supabase
 *
 * @param publisherId - Optional publisher ID. If not provided, fetches the first active publisher.
 */
export function usePublisherData(publisherId?: string): UsePublisherDataResult {
  const [data, setData] = useState<PublisherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        const supabase = getSupabaseClient();

        // Fetch publisher
        let publisherQuery = supabase
          .from('publishers')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: true });

        if (publisherId) {
          publisherQuery = publisherQuery.eq('id', publisherId);
        }

        const { data: publisherRows, error: publisherError } = await publisherQuery.limit(1);

        if (publisherError) {
          throw new Error(`Failed to fetch publisher: ${publisherError.message}`);
        }

        if (!publisherRows || publisherRows.length === 0) {
          // No publisher found - return empty state instead of throwing
          setData(null);
          setIsLoading(false);
          return;
        }

        const publisher = publisherRows[0] as { id: string; [key: string]: unknown };

        const pubId = publisher.id;

        // Fetch platform connections
        const { data: connections, error: connectionsError } = await supabase
          .from('platform_connections')
          .select('*')
          .eq('publisher_id', pubId);

        if (connectionsError) {
          console.error('Connections error:', connectionsError);
        }

        // Fetch latest metrics snapshots for each platform
        const { data: snapshots, error: snapshotsError } = await supabase
          .from('metrics_snapshots')
          .select('*')
          .eq('publisher_id', pubId)
          .order('recorded_at', { ascending: false });

        if (snapshotsError) {
          console.error('Snapshots error:', snapshotsError);
        }

        // Fetch growth snapshots
        const { data: growthData, error: growthError } = await supabase
          .from('growth_snapshots')
          .select('*')
          .eq('publisher_id', pubId)
          .order('snapshot_date', { ascending: false });

        if (growthError) {
          console.error('Growth error:', growthError);
        }

        // Fetch badges
        const { data: badgesData, error: badgesError } = await supabase
          .from('growth_badges')
          .select('*')
          .eq('publisher_id', pubId)
          .eq('status', 'active');

        if (badgesError) {
          console.error('Badges error:', badgesError);
        }

        // Fetch content performance (last 90 days, limit 100 posts)
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const { data: contentData, error: contentError } = await supabase
          .from('content_performance')
          .select('*')
          .eq('publisher_id', pubId)
          .gte('published_at', ninetyDaysAgo.toISOString())
          .order('published_at', { ascending: false })
          .limit(100);

        if (contentError) {
          console.error('Content performance error:', contentError);
        }

        // Transform connections to app format
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformedConnections: PlatformConnection[] = ((connections || []) as any[]).map((c) => ({
          id: c.id,
          publisherId: c.publisher_id,
          platform: c.platform as Platform,
          handle: c.handle || undefined,
          url: c.url || undefined,
          platformUserId: c.platform_user_id || undefined,
          status: c.status,
          verified: c.verified || false,
          connectedAt: c.connected_at ? new Date(c.connected_at) : new Date(),
          lastSyncedAt: c.last_synced_at ? new Date(c.last_synced_at) : undefined,
        }));

        // Build snapshots record (latest per platform)
        const latestSnapshots = createEmptySnapshots();
        const seenPlatforms = new Set<string>();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const snapshotsList = (snapshots || []) as any[];
        for (const snap of snapshotsList) {
          if (!seenPlatforms.has(snap.platform)) {
            seenPlatforms.add(snap.platform);
            latestSnapshots[snap.platform as Platform] = {
              id: snap.id,
              publisherId: snap.publisher_id,
              platform: snap.platform as Platform,
              recordedAt: new Date(snap.recorded_at),
              followerCount: snap.follower_count || undefined,
              followingCount: snap.following_count || undefined,
              postCount: snap.post_count || undefined,
              engagementRate: snap.engagement_rate ? Number(snap.engagement_rate) : undefined,
              avgLikes: snap.avg_likes || undefined,
              avgComments: snap.avg_comments || undefined,
              // Newsletter-specific metrics
              subscriberCount: snap.subscriber_count || undefined,
              openRate: snap.open_rate ? Number(snap.open_rate) / 100 : undefined, // Convert from percentage to decimal
              clickRate: snap.click_rate ? Number(snap.click_rate) / 100 : undefined,
              demographics: snap.demographics as MetricsSnapshot['demographics'],
            };
          }
        }

        // Calculate aggregate metrics
        const totalFollowers = snapshotsList.reduce(
          (sum, s) => sum + (s.follower_count || 0),
          0
        );

        const avgEngagement =
          snapshotsList.filter((s) => s.engagement_rate).length > 0
            ? snapshotsList
                .filter((s) => s.engagement_rate)
                .reduce((sum, s) => sum + Number(s.engagement_rate || 0), 0) /
              snapshotsList.filter((s) => s.engagement_rate).length
            : 0;

        // Get growth data from snapshots
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const growthList = (growthData || []) as any[];

        // Aggregate growth across all platforms for each period type
        const weeklyGrowths = growthList.filter((g) => g.period_type === 'weekly');
        const monthlyGrowths = growthList.filter((g) => g.period_type === 'monthly');

        // Calculate total 7-day growth (sum across platforms)
        const growth7d = weeklyGrowths.length > 0
          ? {
              followersGained: weeklyGrowths.reduce((sum, g) => sum + (g.net_growth || 0), 0),
              growthRate: weeklyGrowths.reduce((sum, g) => sum + Number(g.growth_rate_percent || 0), 0) / weeklyGrowths.length,
            }
          : { followersGained: 0, growthRate: 0 };

        // Calculate total 30-day growth (sum across platforms)
        const growth30d = monthlyGrowths.length > 0
          ? {
              followersGained: monthlyGrowths.reduce((sum, g) => sum + (g.net_growth || 0), 0),
              growthRate: monthlyGrowths.reduce((sum, g) => sum + Number(g.growth_rate_percent || 0), 0) / monthlyGrowths.length,
            }
          : { followersGained: 0, growthRate: 0 };

        // Estimate 90-day growth (use monthly rate * 3 as approximation)
        const growth90d = {
          followersGained: Math.round(growth30d.followersGained * 2.8),
          growthRate: Math.round(growth30d.growthRate * 2.5 * 100) / 100,
        };

        // Determine trend based on comparing weekly vs monthly rates
        let trend: GrowthTrend = 'steady';
        if (growth7d.growthRate > growth30d.growthRate / 4 * 1.2) trend = 'accelerating';
        else if (growth7d.growthRate < growth30d.growthRate / 4 * 0.8) trend = 'declining';

        // Build GrowthMetrics
        const metrics: GrowthMetrics = {
          totalFollowers,
          totalEngagement: 0,
          averageEngagementRate: avgEngagement,
          growth7d,
          growth30d,
          growth90d,
          trend,
          trendConfidence: 70,
          byPlatform: {} as GrowthMetrics['byPlatform'],
          badges: [],
          verificationLevel: 'self_reported',
          lastUpdated: new Date(),
        };

        // Build per-platform metrics
        for (const snap of snapshotsList) {
          if (!metrics.byPlatform[snap.platform as Platform]) {
            const platformGrowth = growthList.find(
              (g) => g.platform === snap.platform && g.period_type === 'monthly'
            );
            metrics.byPlatform[snap.platform as Platform] = {
              followers: snap.follower_count || 0,
              engagementRate: Number(snap.engagement_rate || 0),
              growth30d: Number(platformGrowth?.growth_rate_percent || 0),
              lastSynced: new Date(snap.recorded_at),
            };
          }
        }

        // Transform badges
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformedBadges: Badge[] = ((badgesData || []) as any[]).map((b) => ({
          type: b.badge_type as Badge['type'],
          tier: b.tier as Badge['tier'],
          awardedAt: new Date(b.awarded_at),
          expiresAt: b.expires_at ? new Date(b.expires_at) : undefined,
          platform: b.platform as Platform | undefined,
          criteriaMet: b.criteria_met as Badge['criteriaMet'],
        }));

        // Transform content performance to PostPerformance
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformedPosts: PostPerformance[] = ((contentData || []) as any[]).map((c) => ({
          id: c.id,
          platform: c.platform as Platform,
          contentType: c.content_type || 'post',
          publishedAt: new Date(c.published_at),
          captionExcerpt: c.caption_excerpt || null,
          thumbnailUrl: c.thumbnail_url || null,
          contentUrl: c.content_url || null,
          impressions: c.impressions || null,
          reach: c.reach || null,
          likes: c.likes || null,
          comments: c.comments || null,
          shares: c.shares || null,
          saves: c.saves || null,
          videoViews: c.video_views || null,
          engagementScore: c.engagement_score || 0,
          engagementRate: c.engagement_rate ? Number(c.engagement_rate) : null,
        }));

        // Build growth history from metrics snapshots (aggregate by date)
        const snapshotsByDate = new Map<string, { date: Date; followers: number; netGrowth: number }>();
        for (const snap of snapshotsList) {
          const dateKey = new Date(snap.recorded_at).toISOString().split('T')[0];
          const existing = snapshotsByDate.get(dateKey);
          if (existing) {
            existing.followers += snap.follower_count || 0;
          } else {
            snapshotsByDate.set(dateKey, {
              date: new Date(snap.recorded_at),
              followers: snap.follower_count || 0,
              netGrowth: 0,
            });
          }
        }

        // Convert to array and sort by date
        const growthHistory: GrowthDataPoint[] = Array.from(snapshotsByDate.values())
          .sort((a, b) => a.date.getTime() - b.date.getTime());

        // Calculate net growth (difference from previous day)
        for (let i = 1; i < growthHistory.length; i++) {
          growthHistory[i].netGrowth = growthHistory[i].followers - growthHistory[i - 1].followers;
        }

        setData({
          publisherId: pubId,
          publisherName: publisher.name as string,
          publisherDescription: (publisher.description as string) || null,
          metrics,
          connections: transformedConnections,
          latestSnapshots,
          badges: transformedBadges,
          posts: transformedPosts,
          growthHistory,
        });
      } catch (err) {
        console.error('Error fetching publisher data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [publisherId, fetchTrigger]);

  const refetch = () => setFetchTrigger((t) => t + 1);

  return { data, isLoading, error, refetch };
}

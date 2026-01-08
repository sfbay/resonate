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

interface PublisherData {
  publisherId: string;
  publisherName: string;
  publisherDescription: string | null;
  metrics: GrowthMetrics | null;
  connections: PlatformConnection[];
  latestSnapshots: Record<Platform, MetricsSnapshot | null>;
  badges: Badge[];
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
          .eq('status', 'active');

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

        const publishers = publisherRows[0];

        const pubId = publishers.id;

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

        // Transform connections to app format
        const transformedConnections: PlatformConnection[] = (connections || []).map((c) => ({
          id: c.id,
          publisherId: c.publisher_id,
          platform: c.platform as Platform,
          handle: c.handle || undefined,
          url: c.url || undefined,
          platformUserId: c.platform_user_id || undefined,
          status: c.status as 'active' | 'expired' | 'revoked' | 'error',
          verified: c.verified || false,
          connectedAt: c.connected_at ? new Date(c.connected_at) : new Date(),
          lastSyncedAt: c.last_synced_at ? new Date(c.last_synced_at) : undefined,
        }));

        // Build snapshots record (latest per platform)
        const latestSnapshots = createEmptySnapshots();
        const seenPlatforms = new Set<string>();

        for (const snap of snapshots || []) {
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
              demographics: snap.demographics as MetricsSnapshot['demographics'],
            };
          }
        }

        // Calculate aggregate metrics
        const totalFollowers = (snapshots || []).reduce(
          (sum, s) => sum + (s.follower_count || 0),
          0
        );

        const avgEngagement =
          (snapshots || []).filter((s) => s.engagement_rate).length > 0
            ? (snapshots || [])
                .filter((s) => s.engagement_rate)
                .reduce((sum, s) => sum + Number(s.engagement_rate || 0), 0) /
              (snapshots || []).filter((s) => s.engagement_rate).length
            : 0;

        // Get growth data (most recent monthly snapshot)
        const monthlyGrowth = (growthData || []).find((g) => g.period_type === 'monthly');
        const growth30d = monthlyGrowth
          ? {
              followersGained: monthlyGrowth.net_growth || 0,
              growthRate: Number(monthlyGrowth.growth_rate_percent || 0),
            }
          : { followersGained: 0, growthRate: 0 };

        // Determine trend
        let trend: GrowthTrend = 'steady';
        if (growth30d.growthRate > 10) trend = 'accelerating';
        else if (growth30d.growthRate < -5) trend = 'declining';

        // Build GrowthMetrics
        const metrics: GrowthMetrics = {
          totalFollowers,
          totalEngagement: 0,
          averageEngagementRate: avgEngagement,
          growth7d: { followersGained: 0, growthRate: 0 }, // Would need weekly data
          growth30d,
          growth90d: { followersGained: 0, growthRate: 0 }, // Would need 90-day data
          trend,
          trendConfidence: 70,
          byPlatform: {},
          badges: [],
          verificationLevel: 'self_reported',
          lastUpdated: new Date(),
        };

        // Build per-platform metrics
        for (const snap of snapshots || []) {
          if (!metrics.byPlatform[snap.platform as Platform]) {
            const platformGrowth = (growthData || []).find(
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
        const transformedBadges: Badge[] = (badgesData || []).map((b) => ({
          type: b.badge_type as Badge['type'],
          tier: b.tier as Badge['tier'],
          awardedAt: new Date(b.awarded_at),
          expiresAt: b.expires_at ? new Date(b.expires_at) : undefined,
          platform: b.platform as Platform | undefined,
          criteriaMet: b.criteria_met as Badge['criteriaMet'],
        }));

        setData({
          publisherId: pubId,
          publisherName: publishers.name,
          publisherDescription: publishers.description,
          metrics,
          connections: transformedConnections,
          latestSnapshots,
          badges: transformedBadges,
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

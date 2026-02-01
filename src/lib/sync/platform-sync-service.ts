/**
 * Platform Sync Service
 *
 * Handles syncing metrics and content from connected platforms.
 * Used by background jobs (Vercel Cron) and manual refresh triggers.
 */

import { createServerClient } from '@/lib/db/supabase-server';
import { getOAuthProvider } from '@/lib/oauth';
import { isAIEnabled } from '@/lib/ai';
import type { PlatformMetrics, ContentPost } from '@/lib/oauth/types';
import type { PlatformType, DbPlatformConnection } from '@/lib/db/types';

// =============================================================================
// TYPES
// =============================================================================

export interface SyncOptions {
  syncMetrics?: boolean;
  syncContent?: boolean;
  syncDemographics?: boolean;
  contentLimit?: number;
  refreshTokensIfNeeded?: boolean;
  generateAIRecommendations?: boolean;
}

export interface SyncResult {
  success: boolean;
  platform: PlatformType;
  publisherId: string;
  metricsUpdated?: boolean;
  contentCount?: number;
  error?: string;
  tokenRefreshed?: boolean;
}

export interface BatchSyncResult {
  total: number;
  successful: number;
  failed: number;
  results: SyncResult[];
  aiRecommendationsGenerated?: boolean;
  aiRecommendationsCount?: number;
}

// =============================================================================
// SYNC SERVICE
// =============================================================================

/**
 * Sync a single platform connection
 */
export async function syncPlatformConnection(
  connection: DbPlatformConnection,
  options: SyncOptions = {}
): Promise<SyncResult> {
  const {
    syncMetrics = true,
    syncContent = true,
    contentLimit = 50,
    refreshTokensIfNeeded = true,
  } = options;

  const result: SyncResult = {
    success: false,
    platform: connection.platform,
    publisherId: connection.publisher_id,
  };

  try {
    // Get the OAuth provider for this platform
    const provider = getOAuthProvider(connection.platform);
    if (!provider) {
      result.error = `No OAuth provider available for ${connection.platform}`;
      return result;
    }

    // Check if we have a valid access token
    let accessToken = connection.access_token;
    if (!accessToken) {
      result.error = 'No access token available';
      return result;
    }

    // Check if token needs refresh
    if (refreshTokensIfNeeded && connection.token_expires_at) {
      const expiresAt = new Date(connection.token_expires_at);
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      if (expiresAt < oneHourFromNow && connection.refresh_token) {
        const refreshResult = await provider.refreshTokens(connection.refresh_token);
        if (refreshResult.success && refreshResult.tokens) {
          accessToken = refreshResult.tokens.accessToken;
          result.tokenRefreshed = true;

          // Update stored tokens
          await updateConnectionTokens(
            connection.id,
            refreshResult.tokens.accessToken,
            refreshResult.tokens.refreshToken,
            refreshResult.tokens.expiresAt
          );
        }
      }
    }

    const supabase = await createServerClient();

    // Sync metrics
    if (syncMetrics) {
      const metricsResult = await provider.fetchMetrics(accessToken);
      if (metricsResult.success && metricsResult.metrics) {
        await storeMetricsSnapshot(supabase, connection.publisher_id, metricsResult.metrics);
        result.metricsUpdated = true;
      } else if (metricsResult.rateLimited) {
        result.error = 'Rate limited by platform API';
        return result;
      }
    }

    // Sync content
    if (syncContent) {
      const contentResult = await provider.fetchContent(accessToken, { limit: contentLimit });
      if (contentResult.success && contentResult.posts?.length) {
        await storeContentSnapshots(supabase, connection.publisher_id, contentResult.posts);
        result.contentCount = contentResult.posts.length;
      } else if (contentResult.rateLimited) {
        result.error = 'Rate limited by platform API';
        return result;
      }
    }

    // Update last synced timestamp
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('platform_connections')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', connection.id);

    result.success = true;
    return result;
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown error';
    return result;
  }
}

/**
 * Sync all connections for a publisher
 */
export async function syncPublisher(
  publisherId: string,
  options: SyncOptions = {}
): Promise<BatchSyncResult> {
  const supabase = await createServerClient();

  // Fetch all active connections for this publisher
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: connections, error } = await (supabase as any)
    .from('platform_connections')
    .select('*')
    .eq('publisher_id', publisherId)
    .eq('status', 'active');

  if (error) {
    return {
      total: 0,
      successful: 0,
      failed: 1,
      results: [{
        success: false,
        platform: 'instagram',
        publisherId,
        error: `Failed to fetch connections: ${error.message}`,
      }],
    };
  }

  const results: SyncResult[] = [];
  for (const connection of connections || []) {
    const result = await syncPlatformConnection(connection, options);
    results.push(result);
  }

  const batchResult: BatchSyncResult = {
    total: results.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results,
  };

  // Generate AI recommendations if enabled and we had successful syncs with content
  const { generateAIRecommendations = true } = options;
  const hasContentSynced = results.some(r => r.success && r.contentCount && r.contentCount > 0);

  if (generateAIRecommendations && hasContentSynced && isAIEnabled()) {
    try {
      const aiResult = await triggerAIRecommendations(publisherId);
      batchResult.aiRecommendationsGenerated = aiResult.success;
      batchResult.aiRecommendationsCount = aiResult.count;
    } catch (error) {
      console.warn('AI recommendation generation failed (non-blocking):', error);
    }
  }

  return batchResult;
}

/**
 * Process pending syncs from the schedule table
 * Called by background cron job
 */
export async function processPendingSyncs(
  batchSize: number = 50
): Promise<BatchSyncResult> {
  const supabase = await createServerClient();

  // Get pending syncs using the database function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pendingSyncs, error } = await (supabase as any)
    .rpc('get_pending_syncs', { batch_size: batchSize });

  if (error) {
    return {
      total: 0,
      successful: 0,
      failed: 1,
      results: [{
        success: false,
        platform: 'instagram',
        publisherId: '',
        error: `Failed to fetch pending syncs: ${error.message}`,
      }],
    };
  }

  const results: SyncResult[] = [];

  for (const sync of pendingSyncs || []) {
    // Fetch the full connection record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: connection } = await (supabase as any)
      .from('platform_connections')
      .select('*')
      .eq('id', sync.connection_id)
      .single();

    if (!connection) {
      results.push({
        success: false,
        platform: sync.platform,
        publisherId: sync.publisher_id,
        error: 'Connection not found',
      });
      continue;
    }

    // Perform the sync
    const result = await syncPlatformConnection(connection, {
      syncMetrics: sync.sync_metrics,
      syncContent: sync.sync_content,
      syncDemographics: sync.sync_demographics,
      contentLimit: sync.content_limit,
    });

    results.push(result);

    // Update sync schedule status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .rpc('update_sync_status', {
        schedule_id: sync.schedule_id,
        new_status: result.success ? 'success' : 'failed',
        error_message: result.error || null,
      });
  }

  return {
    total: results.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results,
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Update connection tokens after refresh
 */
async function updateConnectionTokens(
  connectionId: string,
  accessToken: string,
  refreshToken?: string,
  expiresAt?: Date
): Promise<void> {
  const supabase = await createServerClient();

  const update: Record<string, unknown> = {
    access_token: accessToken,
    updated_at: new Date().toISOString(),
  };

  if (refreshToken) {
    update.refresh_token = refreshToken;
  }

  if (expiresAt) {
    update.token_expires_at = expiresAt.toISOString();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('platform_connections')
    .update(update)
    .eq('id', connectionId);
}

/**
 * Store metrics snapshot in database
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function storeMetricsSnapshot(
  supabase: ReturnType<typeof createServerClient> extends Promise<infer T> ? T : never,
  publisherId: string,
  metrics: PlatformMetrics
): Promise<void> {
  const snapshot = {
    publisher_id: publisherId,
    platform: metrics.platform,
    follower_count: metrics.followerCount,
    following_count: metrics.followingCount,
    post_count: metrics.postCount,
    engagement_rate: metrics.engagementRate,
    avg_likes: metrics.avgLikes,
    avg_comments: metrics.avgComments,
    avg_shares: metrics.avgShares,
    avg_saves: metrics.avgSaves,
    subscriber_count: metrics.subscriberCount,
    open_rate: metrics.openRate,
    click_rate: metrics.clickRate,
    demographics: metrics.demographics || null,
    raw_response: metrics.rawData || null,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('metrics_snapshots').insert(snapshot);
}

/**
 * Store content snapshots in database
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function storeContentSnapshots(
  supabase: ReturnType<typeof createServerClient> extends Promise<infer T> ? T : never,
  publisherId: string,
  posts: ContentPost[]
): Promise<void> {
  const rows = posts.map((post) => ({
    publisher_id: publisherId,
    platform: post.platform,
    content_id: post.id,
    content_type: post.contentType,
    content_url: post.contentUrl,
    published_at: post.publishedAt.toISOString(),
    caption_excerpt: post.captionExcerpt,
    thumbnail_url: post.thumbnailUrl,
    impressions: post.impressions,
    reach: post.reach,
    likes: post.likes,
    comments: post.comments,
    shares: post.shares,
    saves: post.saves,
    clicks: post.clicks,
    video_views: post.videoViews,
    watch_time_seconds: post.watchTimeSeconds,
    engagement_rate: post.engagementRate,
    media_type: post.mediaType,
    hashtags: post.hashtags,
    mentions: post.mentions,
  }));

  // Upsert to handle duplicate content IDs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('content_performance')
    .upsert(rows, {
      onConflict: 'publisher_id,platform,content_id,recorded_at',
      ignoreDuplicates: true,
    });
}

/**
 * Calculate and store growth snapshot
 */
export async function calculateGrowthSnapshot(
  publisherId: string,
  platform: PlatformType,
  periodType: 'daily' | 'weekly' | 'monthly'
): Promise<void> {
  const supabase = await createServerClient();

  // Determine date range based on period
  const endDate = new Date();
  const startDate = new Date();

  switch (periodType) {
    case 'daily':
      startDate.setDate(startDate.getDate() - 1);
      break;
    case 'weekly':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'monthly':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
  }

  // Fetch start and end metrics
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: startMetrics } = await (supabase as any)
    .from('metrics_snapshots')
    .select('follower_count, engagement_rate')
    .eq('publisher_id', publisherId)
    .eq('platform', platform)
    .lte('recorded_at', startDate.toISOString())
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: endMetrics } = await (supabase as any)
    .from('metrics_snapshots')
    .select('follower_count, engagement_rate')
    .eq('publisher_id', publisherId)
    .eq('platform', platform)
    .lte('recorded_at', endDate.toISOString())
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single();

  if (!startMetrics || !endMetrics) {
    return; // Not enough data
  }

  const followersStart = startMetrics.follower_count || 0;
  const followersEnd = endMetrics.follower_count || 0;
  const netGrowth = followersEnd - followersStart;
  const growthRate = followersStart > 0
    ? Math.round((netGrowth / followersStart) * 10000) / 100
    : 0;

  // Store growth snapshot
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('growth_snapshots').insert({
    publisher_id: publisherId,
    platform,
    snapshot_date: endDate.toISOString().split('T')[0],
    followers_start: followersStart,
    followers_end: followersEnd,
    net_growth: netGrowth,
    growth_rate_percent: growthRate,
    engagement_rate_start: startMetrics.engagement_rate,
    engagement_rate_end: endMetrics.engagement_rate,
    period_type: periodType,
  });
}

/**
 * Trigger AI recommendation generation for a publisher
 * Called after successful content sync
 */
async function triggerAIRecommendations(
  publisherId: string
): Promise<{ success: boolean; count: number }> {
  // Import dynamically to avoid circular dependencies
  const {
    generateAIRecommendations,
    storeRecommendations,
  } = await import('@/lib/recommendations/ai-recommendation-service');

  // Types are imported at compile time, we use the values from the module
  type GrowthMetrics = {
    totalFollowers: number;
    avgEngagementRate: number;
    growth30d: { absolute: number; growthRate: number };
  };

  const supabase = await createServerClient();

  // Fetch recent content performance
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: contentData } = await (supabase as any)
    .from('content_performance')
    .select('*')
    .eq('publisher_id', publisherId)
    .order('published_at', { ascending: false })
    .limit(50);

  if (!contentData || contentData.length < 5) {
    return { success: false, count: 0 }; // Not enough data
  }

  // Fetch latest metrics snapshot for growth data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: snapshotData } = await (supabase as any)
    .from('metrics_snapshots')
    .select('*')
    .eq('publisher_id', publisherId)
    .order('created_at', { ascending: false })
    .limit(1);

  const latestSnapshot = snapshotData?.[0];

  // Transform content data
  const posts = contentData.map((row: {
    id: string;
    platform: string;
    content_type: string;
    published_at: string;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    impressions: number;
    reach: number;
    hashtags: string[];
  }) => ({
    id: row.id,
    platform: row.platform as PlatformType,
    contentType: row.content_type || 'post',
    publishedAt: new Date(row.published_at),
    likes: row.likes || 0,
    comments: row.comments || 0,
    shares: row.shares || 0,
    saves: row.saves,
    impressions: row.impressions,
    reach: row.reach,
    hashtags: row.hashtags,
  }));

  // Build metrics from snapshot
  const metrics: GrowthMetrics = {
    totalFollowers: latestSnapshot?.follower_count || 0,
    avgEngagementRate: latestSnapshot?.engagement_rate || 0,
    growth30d: {
      absolute: 0,
      growthRate: 0,
    },
  };

  // Generate and store recommendations
  const result = await generateAIRecommendations(publisherId, posts, metrics);

  if (result.recommendations.length > 0) {
    await storeRecommendations(publisherId, result);
  }

  return {
    success: true,
    count: result.recommendations.length,
  };
}

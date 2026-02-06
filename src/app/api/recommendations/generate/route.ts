/**
 * AI Recommendation Generation Route
 *
 * POST /api/recommendations/generate
 *
 * Generates AI-powered recommendations for a publisher based on their
 * content performance data. Stores results in the database.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/supabase-server';
import {
  generateAIRecommendations,
  generateHybridRecommendations,
  storeRecommendations,
  fetchActiveRecommendations,
  type ContentPerformance,
  type GrowthMetrics,
} from '@/lib/recommendations/ai-recommendation-service';
import type { PlatformType } from '@/lib/db/types';

interface GenerateRequestBody {
  publisherId: string;
  mode?: 'ai' | 'template' | 'hybrid';
  platform?: PlatformType;
  storeResults?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateRequestBody;
    const { publisherId, mode = 'ai', platform, storeResults = true } = body;

    if (!publisherId) {
      return NextResponse.json(
        { error: 'Missing publisherId' },
        { status: 400 }
      );
    }

    // Verify publisher exists and fetch their data
    const supabase = await createServerClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: publisher, error: publisherError } = await (supabase as any)
      .from('publishers')
      .select('id, name')
      .eq('id', publisherId)
      .single();

    if (publisherError || !publisher) {
      return NextResponse.json(
        { error: 'Publisher not found' },
        { status: 404 }
      );
    }

    // Fetch content performance data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: contentData, error: contentError } = await (supabase as any)
      .from('content_performance')
      .select('*')
      .eq('publisher_id', publisherId)
      .order('published_at', { ascending: false })
      .limit(50);

    if (contentError) {
      console.error('Failed to fetch content data:', contentError);
      return NextResponse.json(
        { error: 'Failed to fetch content data' },
        { status: 500 }
      );
    }

    // Fetch latest metrics snapshot for growth data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: snapshotData } = await (supabase as any)
      .from('metrics_snapshots')
      .select('*')
      .eq('publisher_id', publisherId)
      .order('recorded_at', { ascending: false })
      .limit(1);

    const latestSnapshot = snapshotData?.[0];

    // Fetch 30-day growth from growth_snapshots
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: growthData } = await (supabase as any)
      .from('growth_snapshots')
      .select('net_growth, growth_rate_percent')
      .eq('publisher_id', publisherId)
      .eq('period_type', 'monthly')
      .order('snapshot_date', { ascending: false })
      .limit(10);

    // Aggregate growth across all platforms
    const growthRows = growthData || [];
    const totalNetGrowth = growthRows.reduce((sum: number, g: { net_growth: number }) => sum + (g.net_growth || 0), 0);
    const avgGrowthRate = growthRows.length > 0
      ? growthRows.reduce((sum: number, g: { growth_rate_percent: string }) => sum + Number(g.growth_rate_percent || 0), 0) / growthRows.length
      : 0;

    // Transform content data
    const posts: ContentPerformance[] = (contentData || []).map((row: {
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

    if (posts.length === 0) {
      return NextResponse.json({
        success: true,
        recommendations: [],
        message: 'No content data available for recommendations',
      });
    }

    // Build metrics from snapshot + growth data
    const metrics: GrowthMetrics = {
      totalFollowers: latestSnapshot?.follower_count || 0,
      avgEngagementRate: latestSnapshot?.engagement_rate || 0,
      growth30d: {
        absolute: totalNetGrowth,
        growthRate: Math.round(avgGrowthRate * 100) / 100,
      },
    };

    // Generate recommendations based on mode
    const result = mode === 'hybrid'
      ? await generateHybridRecommendations(publisherId, posts, metrics, platform)
      : await generateAIRecommendations(publisherId, posts, metrics, platform);

    // Store results if requested
    if (storeResults && result.recommendations.length > 0) {
      try {
        await storeRecommendations(publisherId, result);
      } catch (storeError) {
        console.error('Failed to store recommendations:', storeError);
        // Continue - don't fail the request just because storage failed
      }
    }

    return NextResponse.json({
      success: true,
      publisherId,
      source: result.source,
      aiModel: result.aiModel,
      aiProvider: result.aiProvider,
      recommendations: result.recommendations,
      usage: result.promptTokens
        ? {
            promptTokens: result.promptTokens,
            completionTokens: result.completionTokens,
          }
        : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Recommendation generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/recommendations/generate?publisherId=xxx
 *
 * Fetch existing active recommendations for a publisher
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publisherId = searchParams.get('publisherId');

    if (!publisherId) {
      return NextResponse.json(
        { error: 'Missing publisherId query parameter' },
        { status: 400 }
      );
    }

    const recommendations = await fetchActiveRecommendations(publisherId);

    return NextResponse.json({
      success: true,
      publisherId,
      recommendations,
      count: recommendations.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Fetch recommendations error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

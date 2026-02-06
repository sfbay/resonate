/**
 * Campaign Matches API Route
 *
 * GET /api/campaigns/[id]/matches - Get matched publishers for a campaign
 *
 * Uses the findMatchingPublishers algorithm to score publishers
 * against the campaign's target criteria.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/supabase-server';
import { findMatchingPublishers } from '@/lib/matching';
import type {
  TargetAudience,
  Publisher,
  SFNeighborhood,
  Language,
} from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const supabase = await createServerClient();

    // Fetch campaign
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: campaign, error: campaignError } = await (supabase as any)
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Fetch all active publishers with their connections and metrics
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: publishers, error: publishersError } = await (supabase as any)
      .from('publishers')
      .select('*')
      .eq('status', 'active');

    if (publishersError) {
      console.error('Failed to fetch publishers:', publishersError);
      return NextResponse.json(
        { error: 'Failed to fetch publishers' },
        { status: 500 }
      );
    }

    // Build target audience from campaign
    const targetAudience: TargetAudience = {
      geographic: {
        neighborhoods: (campaign.target_neighborhoods || []) as SFNeighborhood[],
        citywide: !campaign.target_neighborhoods || campaign.target_neighborhoods.length === 0,
      },
      demographic: {
        languages: (campaign.target_languages || ['english']) as Language[],
        ageRanges: campaign.target_age_ranges,
      },
      economic: {},
      cultural: {},
      // Priority weights for matching algorithm
      priorityWeights: {
        geographic: campaign.weight_geographic,
        demographic: campaign.weight_demographic,
        economic: campaign.weight_economic,
        cultural: campaign.weight_cultural,
      },
      description: campaign.description || '',
    };

    // Build a map of logo URLs from database results
    const logoMap = new Map<string, string>();
    for (const p of publishers) {
      if (p.logo_url) {
        logoMap.set(p.id, p.logo_url);
      }
    }

    // Transform DB publishers to match algorithm input
    // For demo, create minimal publisher profiles
    const publisherProfiles: Publisher[] = publishers.map((p: {
      id: string;
      name: string;
      description: string;
      website: string;
      logo_url: string;
    }) => ({
      id: p.id,
      userId: '',
      name: p.name,
      description: p.description || '',
      website: p.website,
      audienceProfile: {
        geographic: {
          neighborhoods: campaign.target_neighborhoods?.slice(0, 3) || [],
          citywide: true,
        },
        demographic: {
          languages: campaign.target_languages || ['english'],
        },
        economic: {},
        cultural: {},
        dataSource: {
          type: 'platform_reported' as const,
          verificationLevel: 'partially_verified' as const,
          lastVerified: new Date(),
        },
        lastUpdated: new Date(),
      },
      platforms: [],
      rateCard: {
        rates: [],
        currency: 'USD',
      },
      vendorStatus: 'registered' as const,
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Run matching algorithm
    const matches = findMatchingPublishers(
      targetAudience,
      publisherProfiles,
      {
        minScore: 30,
        maxResults: limit,
      }
    );

    // Store matches in database
    for (const match of matches) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('campaign_matches')
        .upsert({
          campaign_id: campaignId,
          publisher_id: match.publisher.id,
          overall_score: Math.round(match.overallScore),
          geographic_score: match.scores.geographic,
          demographic_score: match.scores.demographic,
          economic_score: match.scores.economic,
          cultural_score: match.scores.cultural,
          reach_score: match.scores.reach,
          match_details: {
            matchingNeighborhoods: match.matchDetails.geographic?.matchedNeighborhoods || [],
            matchingLanguages: match.matchDetails.demographic?.matchedLanguages || [],
            reasons: match.matchReasons,
          },
        }, {
          onConflict: 'campaign_id,publisher_id',
        });
    }

    // Fetch actual metrics for matched publishers
    const publisherIds = matches.map(m => m.publisher.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: metricsData } = await (supabase as any)
      .from('metrics_snapshots')
      .select('publisher_id, follower_count, engagement_rate')
      .in('publisher_id', publisherIds)
      .order('recorded_at', { ascending: false });

    // Group latest metrics by publisher
    const metricsMap = new Map<string, { followers: number; engagement: number }>();
    for (const m of (metricsData || [])) {
      if (!metricsMap.has(m.publisher_id)) {
        metricsMap.set(m.publisher_id, {
          followers: m.follower_count || 0,
          engagement: Number(m.engagement_rate || 0),
        });
      } else {
        // Accumulate followers across platforms
        const existing = metricsMap.get(m.publisher_id)!;
        existing.followers += m.follower_count || 0;
      }
    }

    return NextResponse.json({
      success: true,
      campaignId,
      matches: matches.map((m) => {
        const metrics = metricsMap.get(m.publisher.id);
        return {
          publisher: {
            id: m.publisher.id,
            name: m.publisher.name,
            description: m.publisher.description,
            website: m.publisher.website,
            logoUrl: logoMap.get(m.publisher.id) || null,
          },
          score: Math.round(m.overallScore),
          breakdown: {
            geographic: m.scores.geographic,
            demographic: m.scores.demographic,
            economic: m.scores.economic,
            cultural: m.scores.cultural,
            reach: m.scores.reach,
          },
          matchingNeighborhoods: m.matchDetails.geographic?.matchedNeighborhoods || [],
          matchingLanguages: m.matchDetails.demographic?.matchedLanguages || [],
          keyStrengths: m.matchReasons,
          metrics: metrics || { followers: 0, engagement: 0 },
        };
      }),
      totalMatches: matches.length,
    });
  } catch (error) {
    console.error('Campaign matches error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

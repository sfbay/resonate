/**
 * Campaign API Routes
 *
 * POST /api/campaigns - Create a new campaign
 * GET /api/campaigns - List campaigns
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/supabase-server';

interface CreateCampaignBody {
  name: string;
  description?: string;
  department?: string;
  targetNeighborhoods?: string[];
  targetLanguages?: string[];
  targetCommunities?: string[];
  targetAgeRanges?: string[];
  targetIncomeLevels?: string[];
  budgetMin?: number;
  budgetMax?: number;
  startDate?: string;
  endDate?: string;
  citySlug?: string;
  // Custom weights
  weightGeographic?: number;
  weightDemographic?: number;
  weightEconomic?: number;
  weightCultural?: number;
  weightReach?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateCampaignBody;

    if (!body.name) {
      return NextResponse.json(
        { error: 'Campaign name is required' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Insert campaign
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: campaign, error } = await (supabase as any)
      .from('campaigns')
      .insert({
        name: body.name,
        description: body.description,
        department: body.department,
        target_neighborhoods: body.targetNeighborhoods,
        target_languages: body.targetLanguages,
        target_communities: body.targetCommunities,
        target_age_ranges: body.targetAgeRanges,
        target_income_levels: body.targetIncomeLevels,
        budget_min: body.budgetMin,
        budget_max: body.budgetMax,
        start_date: body.startDate,
        end_date: body.endDate,
        city_slug: body.citySlug || 'sf',
        weight_geographic: body.weightGeographic ?? 25,
        weight_demographic: body.weightDemographic ?? 20,
        weight_economic: body.weightEconomic ?? 20,
        weight_cultural: body.weightCultural ?? 20,
        weight_reach: body.weightReach ?? 15,
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create campaign:', error);
      return NextResponse.json(
        { error: 'Failed to create campaign' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        createdAt: campaign.created_at,
      },
    });
  } catch (error) {
    console.error('Campaign creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const citySlug = searchParams.get('city') || 'sf';

    const supabase = await createServerClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('campaigns')
      .select('*')
      .eq('city_slug', citySlug)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: campaigns, error } = await query;

    if (error) {
      console.error('Failed to fetch campaigns:', error);
      return NextResponse.json(
        { error: 'Failed to fetch campaigns' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      campaigns: campaigns.map((c: {
        id: string;
        name: string;
        description: string;
        department: string;
        status: string;
        target_neighborhoods: string[];
        target_languages: string[];
        budget_min: number;
        budget_max: number;
        start_date: string;
        end_date: string;
        created_at: string;
      }) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        department: c.department,
        status: c.status,
        targetNeighborhoods: c.target_neighborhoods,
        targetLanguages: c.target_languages,
        budgetRange: c.budget_min && c.budget_max
          ? { min: c.budget_min, max: c.budget_max }
          : null,
        dates: c.start_date && c.end_date
          ? { start: c.start_date, end: c.end_date }
          : null,
        createdAt: c.created_at,
      })),
      count: campaigns.length,
    });
  } catch (error) {
    console.error('Campaign fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

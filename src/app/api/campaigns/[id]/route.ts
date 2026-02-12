/**
 * Campaign Detail API Routes
 *
 * GET /api/campaigns/[id] - Get campaign details
 * PUT /api/campaigns/[id] - Update campaign
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/supabase-server';

interface UpdateCampaignBody {
  name?: string;
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
  status?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: campaign, error } = await (supabase as any)
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        department: campaign.department,
        status: campaign.status,
        targetNeighborhoods: campaign.target_neighborhoods,
        targetLanguages: campaign.target_languages,
        targetCommunities: campaign.target_communities,
        targetAgeRanges: campaign.target_age_ranges,
        targetIncomeLevels: campaign.target_income_levels,
        budgetRange: {
          min: campaign.budget_min,
          max: campaign.budget_max,
          currency: campaign.currency,
        },
        dates: {
          start: campaign.start_date,
          end: campaign.end_date,
        },
        weights: {
          geographic: campaign.weight_geographic,
          demographic: campaign.weight_demographic,
          economic: campaign.weight_economic,
          cultural: campaign.weight_cultural,
          reach: campaign.weight_reach,
        },
        citySlug: campaign.city_slug,
        source: campaign.source || 'government',
        goal: campaign.goal,
        advertiserProfile: campaign.advertiser_profile,
        createdAt: campaign.created_at,
        updatedAt: campaign.updated_at,
      },
    });
  } catch (error) {
    console.error('Campaign fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as UpdateCampaignBody;

    const supabase = await createServerClient();

    // Build update object
    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.department !== undefined) updates.department = body.department;
    if (body.targetNeighborhoods !== undefined) updates.target_neighborhoods = body.targetNeighborhoods;
    if (body.targetLanguages !== undefined) updates.target_languages = body.targetLanguages;
    if (body.targetCommunities !== undefined) updates.target_communities = body.targetCommunities;
    if (body.targetAgeRanges !== undefined) updates.target_age_ranges = body.targetAgeRanges;
    if (body.targetIncomeLevels !== undefined) updates.target_income_levels = body.targetIncomeLevels;
    if (body.budgetMin !== undefined) updates.budget_min = body.budgetMin;
    if (body.budgetMax !== undefined) updates.budget_max = body.budgetMax;
    if (body.startDate !== undefined) updates.start_date = body.startDate;
    if (body.endDate !== undefined) updates.end_date = body.endDate;
    if (body.status !== undefined) updates.status = body.status;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: campaign, error } = await (supabase as any)
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update campaign:', error);
      return NextResponse.json(
        { error: 'Failed to update campaign' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        updatedAt: campaign.updated_at,
      },
    });
  } catch (error) {
    console.error('Campaign update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

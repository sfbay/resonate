import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/db/supabase';

// GET /api/campaigns/[id]/units — list units for a campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: campaignId } = await params;
  const supabase = getSupabaseClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('campaign_units')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

// POST /api/campaigns/[id]/units — create a unit
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: campaignId } = await params;
  const body = await request.json();
  const supabase = getSupabaseClient();

  const {
    publisherId,
    channelGroup,
    formatKey,
    platform,
    placement,
    tier = 'upload',
    creativeAssets = {},
    complianceNotes,
    deadline,
    payoutCents = 0,
    templateId,
  } = body;

  if (!publisherId || !channelGroup || !formatKey || !platform || !placement) {
    return NextResponse.json(
      { error: 'publisherId, channelGroup, formatKey, platform, and placement are required' },
      { status: 400 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('campaign_units')
    .insert({
      campaign_id: campaignId,
      publisher_id: publisherId,
      channel_group: channelGroup,
      format_key: formatKey,
      platform,
      placement,
      tier,
      creative_assets: creativeAssets,
      compliance_notes: complianceNotes,
      deadline,
      payout_cents: payoutCents,
      template_id: templateId,
      status: 'draft',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

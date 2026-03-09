import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/db/supabase';
import { COMPLIANCE_DEFAULTS } from '@/lib/channels';

// GET /api/campaigns/[id]/units/[unitId]/production-kit
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; unitId: string }> }
) {
  const { id: campaignId, unitId } = await params;
  const supabase = getSupabaseClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: unit, error } = await (supabase as any)
    .from('campaign_units')
    .select('*')
    .eq('id', unitId)
    .eq('campaign_id', campaignId)
    .single();

  if (error || !unit) {
    return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
  }

  if (unit.status !== 'accepted' && unit.status !== 'in_production') {
    return NextResponse.json(
      { error: 'Production kit is only available for accepted units' },
      { status: 400 }
    );
  }

  const assets = unit.creative_assets || {};
  const compliance = unit.compliance_notes || COMPLIANCE_DEFAULTS[unit.platform] || '';

  // Fetch campaign info for context
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: campaign } = await (supabase as any)
    .from('campaigns')
    .select('name, department, start_date, end_date')
    .eq('id', campaignId)
    .single();

  const kit = {
    unitId: unit.id,
    format: unit.format_key,
    platform: unit.platform,
    placement: unit.placement,
    campaign: campaign ? {
      name: campaign.name,
      department: campaign.department,
      startDate: campaign.start_date,
      endDate: campaign.end_date,
    } : null,
    creative: {
      files: assets.files || [],
      headline: assets.headline || null,
      bodyText: assets.body_text || assets.bodyText || null,
      ctaText: assets.cta_text || assets.ctaText || null,
      ctaUrl: assets.cta_url || assets.ctaUrl || null,
      hashtags: assets.hashtags || [],
      mentions: assets.mentions || [],
      clickThroughUrl: assets.click_through_url || assets.clickThroughUrl || null,
    },
    compliance,
    deadline: unit.deadline,
    payout: unit.payout_cents,
  };

  return NextResponse.json(kit);
}

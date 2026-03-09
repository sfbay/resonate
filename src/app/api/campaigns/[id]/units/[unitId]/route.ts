import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/db/supabase';

const UNIT_TRANSITIONS: Record<string, string[]> = {
  draft: ['ready'],
  ready: ['sent'],
  sent: ['pending_publisher'],
  pending_publisher: ['accepted', 'revision_requested', 'rejected'],
  accepted: ['in_production'],
  revision_requested: ['ready', 'sent', 'pending_publisher'],
  rejected: [],
  in_production: ['delivered'],
  delivered: [],
};

// GET /api/campaigns/[id]/units/[unitId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; unitId: string }> }
) {
  const { id: campaignId, unitId } = await params;
  const supabase = getSupabaseClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('campaign_units')
    .select('*')
    .eq('id', unitId)
    .eq('campaign_id', campaignId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PATCH /api/campaigns/[id]/units/[unitId] — update a unit
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; unitId: string }> }
) {
  const { id: campaignId, unitId } = await params;
  const body = await request.json();
  const supabase = getSupabaseClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = {};
  if (body.status !== undefined) {
    // Validate status transition
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: current } = await (supabase as any)
      .from('campaign_units')
      .select('status')
      .eq('id', unitId)
      .single();

    if (current) {
      const allowed = UNIT_TRANSITIONS[current.status] || [];
      if (!allowed.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid transition from '${current.status}' to '${body.status}'` },
          { status: 400 }
        );
      }
    }

    if (body.status === 'revision_requested' && !body.revisionFeedback) {
      return NextResponse.json(
        { error: 'revisionFeedback is required when requesting a revision' },
        { status: 400 }
      );
    }

    updates.status = body.status;
  }
  if (body.tier !== undefined) updates.tier = body.tier;
  if (body.creativeAssets !== undefined) updates.creative_assets = body.creativeAssets;
  if (body.complianceNotes !== undefined) updates.compliance_notes = body.complianceNotes;
  if (body.revisionFeedback !== undefined) updates.revision_feedback = body.revisionFeedback;
  if (body.proof !== undefined) updates.proof = body.proof;
  if (body.deadline !== undefined) updates.deadline = body.deadline;
  if (body.deliveredAt !== undefined) updates.delivered_at = body.deliveredAt;
  if (body.payoutCents !== undefined) updates.payout_cents = body.payoutCents;
  if (body.templateId !== undefined) updates.template_id = body.templateId;
  if (body.platform !== undefined) updates.platform = body.platform;
  if (body.placement !== undefined) updates.placement = body.placement;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('campaign_units')
    .update(updates)
    .eq('id', unitId)
    .eq('campaign_id', campaignId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/campaigns/[id]/units/[unitId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; unitId: string }> }
) {
  const { id: campaignId, unitId } = await params;
  const supabase = getSupabaseClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('campaign_units')
    .delete()
    .eq('id', unitId)
    .eq('campaign_id', campaignId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

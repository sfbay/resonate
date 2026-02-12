/**
 * Deliverables API Route
 *
 * POST /api/orders/:id/deliverables - Publisher submits a deliverable
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/supabase-server';

interface SubmitDeliverableBody {
  orderLineItemId: string;
  url?: string;
  screenshotUrl?: string;
  notes?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const body = (await request.json()) as SubmitDeliverableBody;

    if (!body.orderLineItemId) {
      return NextResponse.json(
        { error: 'orderLineItemId is required' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Find the pending deliverable for this line item
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: deliverables, error: fetchError } = await (supabase as any)
      .from('deliverables')
      .select('*')
      .eq('order_id', orderId)
      .eq('order_line_item_id', body.orderLineItemId)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(1);

    if (fetchError || !deliverables?.length) {
      return NextResponse.json(
        { error: 'No pending deliverable found for this line item' },
        { status: 404 }
      );
    }

    const deliverable = deliverables[0];

    // Update deliverable to submitted
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updated, error: updateError } = await (supabase as any)
      .from('deliverables')
      .update({
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        url: body.url || deliverable.url,
        screenshot_url: body.screenshotUrl || deliverable.screenshot_url,
        notes: body.notes || deliverable.notes,
      })
      .eq('id', deliverable.id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update deliverable:', updateError);
      return NextResponse.json(
        { error: 'Failed to submit deliverable' },
        { status: 500 }
      );
    }

    // Check if all deliverables for this order are now submitted or approved
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: allDeliverables } = await (supabase as any)
      .from('deliverables')
      .select('status')
      .eq('order_id', orderId);

    const allSubmitted = allDeliverables?.every(
      (d: { status: string }) => d.status === 'submitted' || d.status === 'approved'
    );

    // Auto-transition order to 'delivered' if all deliverables submitted
    if (allSubmitted) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: order } = await (supabase as any)
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

      if (order?.status === 'in_progress') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('orders')
          .update({ status: 'delivered' })
          .eq('id', orderId);
      }
    }

    return NextResponse.json({
      success: true,
      deliverable: {
        id: updated.id,
        orderLineItemId: updated.order_line_item_id,
        platform: updated.platform,
        type: updated.type,
        url: updated.url,
        screenshotUrl: updated.screenshot_url,
        status: updated.status,
        submittedAt: updated.submitted_at,
        notes: updated.notes,
      },
      allDelivered: allSubmitted,
    });
  } catch (error) {
    console.error('Deliverable submission error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

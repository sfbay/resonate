/**
 * Order Detail API Routes
 *
 * GET   /api/orders/:id - Get order detail with line items + deliverables
 * PATCH /api/orders/:id - Update order status (with state machine validation)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/supabase-server';
import { canTransitionOrder } from '@/lib/transactions/order-state';
import type { OrderStatus } from '@/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: order, error } = await (supabase as any)
      .from('orders')
      .select(`
        *,
        order_line_items (*),
        deliverables (*),
        campaigns (id, name, department, description, target_languages, target_neighborhoods, start_date, end_date),
        publishers (id, name)
      `)
      .eq('id', id)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        campaignId: order.campaign_id,
        publisherId: order.publisher_id,
        campaignMatchId: order.campaign_match_id,
        status: order.status,
        procurementStatus: order.procurement_status,
        subtotal: order.subtotal,
        platformFee: order.platform_fee,
        total: order.total,
        deliveryDeadline: order.delivery_deadline,
        purchaseOrderNumber: order.purchase_order_number,
        notes: order.notes,
        campaign: order.campaigns || null,
        publisher: order.publishers || null,
        lineItems: (order.order_line_items || []).map((li: Record<string, unknown>) => ({
          id: li.id,
          deliverableType: li.deliverable_type,
          platform: li.platform,
          quantity: li.quantity,
          unitPrice: li.unit_price,
          totalPrice: li.total_price,
          description: li.description,
        })),
        deliverables: (order.deliverables || []).map((d: Record<string, unknown>) => ({
          id: d.id,
          orderLineItemId: d.order_line_item_id,
          platform: d.platform,
          type: d.type,
          url: d.url,
          screenshotUrl: d.screenshot_url,
          metrics: d.metrics,
          status: d.status,
          submittedAt: d.submitted_at,
          approvedAt: d.approved_at,
          notes: d.notes,
        })),
        createdAt: order.created_at,
        updatedAt: order.updated_at,
      },
    });
  } catch (error) {
    console.error('Order detail error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

interface UpdateOrderBody {
  status?: OrderStatus;
  notes?: string;
  purchaseOrderNumber?: string;
  procurementStatus?: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as UpdateOrderBody;
    const supabase = await createServerClient();

    // Fetch current order
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: current, error: fetchError } = await (supabase as any)
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !current) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Build update payload
    const updates: Record<string, unknown> = {};

    // Status transition with state machine validation
    if (body.status && body.status !== current.status) {
      if (!canTransitionOrder(current.status as OrderStatus, body.status)) {
        return NextResponse.json(
          { error: `Invalid transition from '${current.status}' to '${body.status}'` },
          { status: 400 }
        );
      }
      updates.status = body.status;
    }

    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.purchaseOrderNumber !== undefined) updates.purchase_order_number = body.purchaseOrderNumber;
    if (body.procurementStatus !== undefined) updates.procurement_status = body.procurementStatus;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid updates provided' },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updated, error: updateError } = await (supabase as any)
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        order_line_items (*),
        deliverables (*)
      `)
      .single();

    if (updateError) {
      console.error('Failed to update order:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        id: updated.id,
        campaignId: updated.campaign_id,
        publisherId: updated.publisher_id,
        status: updated.status,
        procurementStatus: updated.procurement_status,
        subtotal: updated.subtotal,
        platformFee: updated.platform_fee,
        total: updated.total,
        deliveryDeadline: updated.delivery_deadline,
        purchaseOrderNumber: updated.purchase_order_number,
        notes: updated.notes,
        lineItems: (updated.order_line_items || []).map((li: Record<string, unknown>) => ({
          id: li.id,
          deliverableType: li.deliverable_type,
          platform: li.platform,
          quantity: li.quantity,
          unitPrice: li.unit_price,
          totalPrice: li.total_price,
        })),
        deliverables: (updated.deliverables || []).map((d: Record<string, unknown>) => ({
          id: d.id,
          status: d.status,
          submittedAt: d.submitted_at,
        })),
        updatedAt: updated.updated_at,
      },
    });
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Orders API Routes
 *
 * POST /api/orders - Create a new order (government places order with publisher)
 * GET /api/orders  - List orders with optional filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/supabase-server';
import { PLATFORM_FEE_RATE } from '@/lib/transactions/pricing';

interface LineItemInput {
  deliverableType: string;
  platform: string;
  quantity: number;
  unitPrice: number; // cents
  description?: string;
}

interface CreateOrderBody {
  campaignId: string;
  publisherId: string;
  campaignMatchId?: string;
  lineItems: LineItemInput[];
  deliveryDeadline?: string;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateOrderBody;

    if (!body.campaignId || !body.publisherId || !body.lineItems?.length) {
      return NextResponse.json(
        { error: 'campaignId, publisherId, and at least one lineItem are required' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Calculate pricing
    const lineItemsWithTotals = body.lineItems.map(li => ({
      ...li,
      totalPrice: li.unitPrice * li.quantity,
    }));
    const subtotal = lineItemsWithTotals.reduce((sum, li) => sum + li.totalPrice, 0);
    const platformFee = Math.round(subtotal * PLATFORM_FEE_RATE);
    const total = subtotal + platformFee;

    // Insert order
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: order, error: orderError } = await (supabase as any)
      .from('orders')
      .insert({
        campaign_id: body.campaignId,
        publisher_id: body.publisherId,
        campaign_match_id: body.campaignMatchId || null,
        status: 'pending_publisher',
        procurement_status: 'not_submitted',
        subtotal,
        platform_fee: platformFee,
        total,
        delivery_deadline: body.deliveryDeadline || null,
        notes: body.notes || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Failed to create order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Insert line items
    const lineItemRows = lineItemsWithTotals.map(li => ({
      order_id: order.id,
      deliverable_type: li.deliverableType,
      platform: li.platform,
      quantity: li.quantity,
      unit_price: li.unitPrice,
      total_price: li.totalPrice,
      description: li.description || null,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: lineItems, error: lineItemError } = await (supabase as any)
      .from('order_line_items')
      .insert(lineItemRows)
      .select();

    if (lineItemError) {
      console.error('Failed to create line items:', lineItemError);
      return NextResponse.json(
        { error: 'Order created but failed to add line items' },
        { status: 500 }
      );
    }

    // Create one pending deliverable per line item (one per quantity unit)
    const deliverableRows: {
      order_id: string;
      order_line_item_id: string;
      platform: string;
      type: string;
      status: string;
    }[] = [];
    for (const li of lineItems) {
      for (let i = 0; i < li.quantity; i++) {
        deliverableRows.push({
          order_id: order.id,
          order_line_item_id: li.id,
          platform: li.platform,
          type: li.deliverable_type,
          status: 'pending',
        });
      }
    }

    if (deliverableRows.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('deliverables')
        .insert(deliverableRows);
    }

    // Mark campaign match as selected if provided
    if (body.campaignMatchId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('campaign_matches')
        .update({ is_selected: true })
        .eq('id', body.campaignMatchId);
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        campaignId: order.campaign_id,
        publisherId: order.publisher_id,
        status: order.status,
        subtotal: order.subtotal,
        platformFee: order.platform_fee,
        total: order.total,
        lineItems: lineItems.map((li: Record<string, unknown>) => ({
          id: li.id,
          deliverableType: li.deliverable_type,
          platform: li.platform,
          quantity: li.quantity,
          unitPrice: li.unit_price,
          totalPrice: li.total_price,
          description: li.description,
        })),
        createdAt: order.created_at,
      },
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    const publisherId = searchParams.get('publisherId');
    const status = searchParams.get('status');

    const supabase = await createServerClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('orders')
      .select(`
        *,
        order_line_items (*),
        deliverables (*),
        campaigns!inner (id, name, department),
        publishers!inner (id, name)
      `)
      .order('created_at', { ascending: false });

    if (campaignId) query = query.eq('campaign_id', campaignId);
    if (publisherId) query = query.eq('publisher_id', publisherId);
    if (status) query = query.eq('status', status);

    const { data: orders, error } = await query;

    if (error) {
      console.error('Failed to fetch orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orders: (orders || []).map((o: Record<string, unknown>) => ({
        id: o.id,
        campaignId: o.campaign_id,
        publisherId: o.publisher_id,
        campaignMatchId: o.campaign_match_id,
        status: o.status,
        procurementStatus: o.procurement_status,
        subtotal: o.subtotal,
        platformFee: o.platform_fee,
        total: o.total,
        deliveryDeadline: o.delivery_deadline,
        purchaseOrderNumber: o.purchase_order_number,
        notes: o.notes,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        campaign: o.campaigns ? { id: (o.campaigns as any).id, name: (o.campaigns as any).name, department: (o.campaigns as any).department } : null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        publisher: o.publishers ? { id: (o.publishers as any).id, name: (o.publishers as any).name } : null,
        lineItems: Array.isArray(o.order_line_items)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? (o.order_line_items as any[]).map((li: Record<string, unknown>) => ({
              id: li.id,
              deliverableType: li.deliverable_type,
              platform: li.platform,
              quantity: li.quantity,
              unitPrice: li.unit_price,
              totalPrice: li.total_price,
              description: li.description,
            }))
          : [],
        deliverables: Array.isArray(o.deliverables)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? (o.deliverables as any[]).map((d: Record<string, unknown>) => ({
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
            }))
          : [],
        createdAt: o.created_at,
        updatedAt: o.updated_at,
      })),
      count: (orders || []).length,
    });
  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

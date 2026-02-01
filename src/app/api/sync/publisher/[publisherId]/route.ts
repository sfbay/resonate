/**
 * Manual Publisher Sync Route
 *
 * POST /api/sync/publisher/[publisherId]
 *
 * Triggers a manual sync for all connected platforms for a publisher.
 * Can be called from the dashboard refresh button.
 */

import { NextRequest, NextResponse } from 'next/server';
import { syncPublisher } from '@/lib/sync/platform-sync-service';
import { createServerClient } from '@/lib/db/supabase-server';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ publisherId: string }> }
) {
  const { publisherId } = await context.params;

  if (!publisherId) {
    return NextResponse.json(
      { error: 'Missing publisherId' },
      { status: 400 }
    );
  }

  try {
    // Verify the publisher exists and user has access
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

    // Parse options from request body
    let options = {};
    try {
      const body = await request.json();
      options = {
        syncMetrics: body.syncMetrics ?? true,
        syncContent: body.syncContent ?? true,
        contentLimit: body.contentLimit ?? 25,
      };
    } catch {
      // Use defaults if no body provided
    }

    // Perform the sync
    const result = await syncPublisher(publisherId, options);

    return NextResponse.json({
      success: result.successful === result.total,
      publisherId,
      publisherName: publisher.name,
      synced: result.successful,
      failed: result.failed,
      total: result.total,
      results: result.results.map(r => ({
        platform: r.platform,
        success: r.success,
        metricsUpdated: r.metricsUpdated,
        contentCount: r.contentCount,
        error: r.error,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Manual sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

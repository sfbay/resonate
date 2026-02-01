/**
 * Platform Sync Cron Job
 *
 * POST /api/sync/cron
 *
 * Called by Vercel Cron to process pending platform syncs.
 * Protected by CRON_SECRET environment variable.
 */

import { NextRequest, NextResponse } from 'next/server';
import { processPendingSyncs } from '@/lib/sync/platform-sync-service';

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Process pending syncs (default batch size: 50)
    const result = await processPendingSyncs();

    return NextResponse.json({
      success: true,
      processed: result.total,
      successful: result.successful,
      failed: result.failed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Also allow GET for Vercel Cron (it uses GET by default)
export async function GET(request: NextRequest) {
  return POST(request);
}

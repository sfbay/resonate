import { NextRequest, NextResponse } from 'next/server';
import { getAvailableFormats, getEnabledChannelGroups } from '@/lib/channels/queries';
import { CHANNEL_GROUPS } from '@/lib/channels';

// GET /api/channels?city=sf
export async function GET(request: NextRequest) {
  const citySlug = request.nextUrl.searchParams.get('city') || 'sf';

  try {
    const [enabledGroups, availableFormats] = await Promise.all([
      getEnabledChannelGroups(citySlug),
      getAvailableFormats(citySlug),
    ]);

    const enabledSet = new Set(enabledGroups);

    const groups = CHANNEL_GROUPS
      .filter(g => enabledSet.has(g.key))
      .map(g => ({
        ...g,
        formats: availableFormats.filter(f => f.channelGroup === g.key),
      }));

    return NextResponse.json({ citySlug, groups });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

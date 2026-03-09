import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/db/supabase';

// GET /api/templates?format=static_image&group=social
export async function GET(request: NextRequest) {
  const formatKey = request.nextUrl.searchParams.get('format');
  const group = request.nextUrl.searchParams.get('group');
  const category = request.nextUrl.searchParams.get('category');

  const supabase = getSupabaseClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('unit_templates')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (formatKey) query = query.eq('format_key', formatKey);
  if (group) query = query.eq('channel_group', group);
  if (category) query = query.eq('category', category);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    templates: (data || []).map((t: Record<string, unknown>) => ({
      id: t.id,
      name: t.name,
      channelGroup: t.channel_group,
      formatKey: t.format_key,
      tier: t.tier,
      category: t.category,
      templateData: t.template_data,
      thumbnailUrl: t.thumbnail_url,
      previewUrl: t.preview_url,
    })),
  });
}

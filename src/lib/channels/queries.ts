import { getSupabaseClient } from '@/lib/db/supabase';
import type { ChannelFormat, ChannelGroup, MarketChannelConfig } from './types';

export async function getChannelFormats(): Promise<ChannelFormat[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await (supabase as any)
    .from('channel_formats')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw new Error(`Failed to fetch channel formats: ${error.message}`);

  return (data || []).map((row: any) => ({
    formatKey: row.format_key,
    channelGroup: row.channel_group as ChannelGroup,
    label: row.label,
    description: row.description,
    platforms: row.platforms,
    placements: row.placements,
    spec: row.spec,
    sortOrder: row.sort_order,
  }));
}

export async function getChannelFormatsByGroup(group: ChannelGroup): Promise<ChannelFormat[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await (supabase as any)
    .from('channel_formats')
    .select('*')
    .eq('channel_group', group)
    .order('sort_order', { ascending: true });

  if (error) throw new Error(`Failed to fetch channel formats: ${error.message}`);

  return (data || []).map((row: any) => ({
    formatKey: row.format_key,
    channelGroup: row.channel_group as ChannelGroup,
    label: row.label,
    description: row.description,
    platforms: row.platforms,
    placements: row.placements,
    spec: row.spec,
    sortOrder: row.sort_order,
  }));
}

export async function getMarketChannels(citySlug: string): Promise<MarketChannelConfig[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await (supabase as any)
    .from('market_channels')
    .select('*')
    .eq('city_slug', citySlug);

  if (error) throw new Error(`Failed to fetch market channels: ${error.message}`);

  return (data || []).map((row: any) => ({
    citySlug: row.city_slug,
    channelGroup: row.channel_group as ChannelGroup,
    enabled: row.enabled,
    disabledFormats: row.disabled_formats || [],
  }));
}

export async function getEnabledChannelGroups(citySlug: string): Promise<ChannelGroup[]> {
  const configs = await getMarketChannels(citySlug);
  return configs
    .filter(c => c.enabled)
    .map(c => c.channelGroup);
}

export async function getAvailableFormats(citySlug: string): Promise<ChannelFormat[]> {
  const [formats, marketConfigs] = await Promise.all([
    getChannelFormats(),
    getMarketChannels(citySlug),
  ]);

  const enabledGroups = new Set(
    marketConfigs.filter(c => c.enabled).map(c => c.channelGroup)
  );
  const disabledFormats = new Set(
    marketConfigs.flatMap(c => c.disabledFormats)
  );

  return formats.filter(f =>
    enabledGroups.has(f.channelGroup) && !disabledFormats.has(f.formatKey)
  );
}

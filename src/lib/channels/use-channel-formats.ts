'use client';

import { useState, useEffect } from 'react';
import type { ChannelGroupConfig, ChannelFormat } from '@/lib/channels/types';

export interface ChannelGroupWithFormats extends ChannelGroupConfig {
  formats: ChannelFormat[];
}

interface UseChannelFormatsResult {
  groups: ChannelGroupWithFormats[];
  isLoading: boolean;
  error: string | null;
}

export function useChannelFormats(citySlug: string): UseChannelFormatsResult {
  const [groups, setGroups] = useState<ChannelGroupWithFormats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchChannels() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/channels?city=${encodeURIComponent(citySlug)}`);
        if (!res.ok) throw new Error(`Failed to fetch channels: ${res.status}`);
        const data = await res.json();
        if (!cancelled) setGroups(data.groups || []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchChannels();
    return () => { cancelled = true; };
  }, [citySlug]);

  return { groups, isLoading, error };
}

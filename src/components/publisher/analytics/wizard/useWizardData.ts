'use client';

/**
 * useWizardData Hook
 *
 * Lazy-loads census, eviction, and audience profile data when the wizard opens.
 * This data is NOT fetched on every dashboard load — only when the user
 * clicks "Explore Growth Areas".
 */

import { useState, useEffect, useCallback } from 'react';
import { getSFCensusData } from '@/lib/census/sf-census-data';
import { getSupabaseClient } from '@/lib/db/supabase';
import type { WizardData } from '@/lib/recommendations/wizard-types';
import type { PlatformType, DbAudienceProfile } from '@/lib/db/types';

interface UseWizardDataResult {
  data: WizardData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useWizardData(
  publisherId: string,
  isOpen: boolean
): UseWizardDataResult {
  const [data, setData] = useState<WizardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!publisherId) return;

    setIsLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();

      // Fetch census data (sync — sample data for immediate rendering)
      const censusData = getSFCensusData();
      const allNeighborhoods = Object.keys(censusData);

      // Fetch audience profile from Supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profileData } = await (supabase as any)
        .from('audience_profiles')
        .select('*')
        .eq('publisher_id', publisherId)
        .single();

      const audienceProfile = profileData as DbAudienceProfile | null;
      const publisherNeighborhoods = audienceProfile?.neighborhoods || [];

      // Fetch platform connections
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: connectionData } = await (supabase as any)
        .from('platform_connections')
        .select('platform')
        .eq('publisher_id', publisherId)
        .eq('status', 'active');

      const publisherPlatforms: PlatformType[] = (connectionData || []).map(
        (c: { platform: string }) => c.platform as PlatformType
      );

      // Fetch eviction stats via API (to avoid direct DataSF call from client)
      let evictionStats = null;
      try {
        const evictionRes = await fetch('/api/civic/evictions?timeRange=12mo');
        if (evictionRes.ok) {
          const evictionJson = await evictionRes.json();
          evictionStats = evictionJson.stats || null;
        }
      } catch {
        // Non-critical — wizard works without eviction data
        console.warn('Could not load eviction data for wizard');
      }

      setData({
        censusData,
        evictionStats,
        audienceProfile,
        allNeighborhoods,
        publisherNeighborhoods,
        publisherPlatforms,
      });
    } catch (err) {
      console.error('Wizard data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load wizard data');
    } finally {
      setIsLoading(false);
    }
  }, [publisherId]);

  // Fetch when wizard opens
  useEffect(() => {
    if (isOpen && !data) {
      fetchData();
    }
  }, [isOpen, data, fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

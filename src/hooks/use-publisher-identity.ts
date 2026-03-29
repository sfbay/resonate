'use client';

import { useState, useEffect } from 'react';
import { useCurrentUserOptional } from '@/lib/auth';
import { useSupabaseClient } from '@/lib/db/supabase';

/**
 * Resolves the authenticated publisher's ID and name from user_org_mapping.
 *
 * Returns null publisherId when:
 *   - No user is authenticated (anonymous visitor)
 *   - User is not a publisher org type
 *   - No mapping exists in user_org_mapping
 *
 * Uses the auth-aware Supabase client (useSupabaseClient) because
 * user_org_mapping RLS requires auth.jwt()->>'sub' to match.
 */

interface PublisherIdentity {
  publisherId: string | null;
  publisherName: string | null;
  isLoading: boolean;
}

export function usePublisherIdentity(): PublisherIdentity {
  const user = useCurrentUserOptional();
  const supabase = useSupabaseClient();
  const [publisherId, setPublisherId] = useState<string | null>(null);
  const [publisherName, setPublisherName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // No authenticated user — return null for demo fallback
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Only resolve for publisher org types
    if (user.orgType !== 'publisher') {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function resolve() {
      try {
        // Step 1: Look up publisher_id from user_org_mapping
        const { data: mapping } = await (supabase as any)
          .from('user_org_mapping')
          .select('publisher_id')
          .eq('clerk_user_id', user!.userId)
          .eq('org_type', 'publisher')
          .single();

        if (cancelled || !mapping?.publisher_id) {
          if (!cancelled) setIsLoading(false);
          return;
        }

        // Step 2: Get publisher name
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: publisher } = await (supabase as any)
          .from('publishers')
          .select('id, name')
          .eq('id', mapping.publisher_id)
          .single();

        if (cancelled) return;

        if (publisher) {
          setPublisherId(publisher.id);
          setPublisherName(publisher.name);
        }
      } catch (err) {
        console.error('[usePublisherIdentity] Error:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    resolve();
    return () => { cancelled = true; };
  }, [user, supabase]);

  return { publisherId, publisherName, isLoading };
}

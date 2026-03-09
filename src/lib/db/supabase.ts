'use client';

import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';
import { useSession } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Create a Supabase browser client (anon key, no auth).
 * Use for public data or when Clerk session is unavailable.
 */
export function createBrowserClient() {
  return createSupabaseBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

/**
 * Singleton anon browser client for non-auth contexts.
 */
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    return createBrowserClient();
  }
  if (!browserClient) {
    browserClient = createBrowserClient();
  }
  return browserClient;
}

/**
 * React hook that returns a Supabase client authenticated with the
 * current Clerk session's JWT. Falls back to anon client if no session.
 *
 * Usage:
 *   const supabase = useSupabaseClient();
 *   const { data } = await supabase.from('publishers').select('*');
 */
export function useSupabaseClient() {
  const { session } = useSession();
  const [client, setClient] = useState(() => getSupabaseClient());

  useEffect(() => {
    if (!session) {
      setClient(getSupabaseClient());
      return;
    }

    session.getToken({ template: 'supabase' }).then((token) => {
      if (token) {
        const authClient = createSupabaseBrowserClient<Database>(
          supabaseUrl,
          supabaseAnonKey,
          {
            global: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          }
        );
        setClient(authClient);
      }
    });
  }, [session]);

  return client;
}

export type { Database } from './types';
export type SupabaseClient = ReturnType<typeof createBrowserClient>;

import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseToken } from '@/lib/auth/supabase-token';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Server-side Supabase client for API routes and Server Components.
 *
 * When a Clerk user is authenticated, passes their Supabase JWT so
 * RLS policies see a real auth.uid(). Falls back to anon key for
 * unauthenticated/public requests.
 */
export async function createServerClient() {
  const cookieStore = await cookies();
  const supabaseToken = await getSupabaseToken();

  return createSupabaseServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from Server Component — safe to ignore
        }
      },
    },
    global: supabaseToken
      ? {
          headers: {
            Authorization: `Bearer ${supabaseToken}`,
          },
        }
      : undefined,
  });
}

export type { Database } from './types';
export type ServerSupabaseClient = Awaited<ReturnType<typeof createServerClient>>;

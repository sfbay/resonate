import { auth } from '@clerk/nextjs/server';

/**
 * Get a Supabase-compatible JWT from Clerk for server-side use.
 * Returns null if user is not authenticated.
 *
 * Requires a "supabase" JWT template configured in Clerk dashboard.
 */
export async function getSupabaseToken(): Promise<string | null> {
  const { getToken } = await auth();
  return getToken({ template: 'supabase' });
}

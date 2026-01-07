import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// =============================================================================
// ENVIRONMENT VARIABLES
// =============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// =============================================================================
// CLIENT INSTANCES
// =============================================================================

/**
 * Public Supabase client for browser-side operations
 * Uses anon key with RLS policies enforced
 */
export function createBrowserClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

/**
 * Server-side Supabase client with service role key
 * Bypasses RLS - use only in trusted server contexts
 */
export function createServerClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables for server client');
  }
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Singleton browser client for React components
 * Safe to use in client-side code
 */
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // Server-side: create new client each time
    return createBrowserClient();
  }
  // Client-side: reuse singleton
  if (!browserClient) {
    browserClient = createBrowserClient();
  }
  return browserClient;
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type { Database } from './types';
export type SupabaseClient = ReturnType<typeof createBrowserClient>;

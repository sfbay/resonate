'use client';

import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

// =============================================================================
// ENVIRONMENT VARIABLES
// =============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// =============================================================================
// CLIENT INSTANCES
// =============================================================================

/**
 * Public Supabase client for browser-side operations
 * Uses anon key with RLS policies enforced
 */
export function createBrowserClient() {
  return createSupabaseBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
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

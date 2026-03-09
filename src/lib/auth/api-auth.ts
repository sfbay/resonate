import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/supabase-server';

export type OrgType = 'publisher' | 'government' | 'advertiser' | 'admin';

export interface AuthContext {
  userId: string;
  orgType: OrgType;
  orgId: string;
  supabase: Awaited<ReturnType<typeof createServerClient>>;
}

/**
 * Authenticate an API request and return user context + Supabase client.
 * Returns a NextResponse error if authentication fails, or AuthContext on success.
 *
 * Usage:
 *   const authResult = await authenticateRequest();
 *   if (authResult instanceof NextResponse) return authResult;
 *   const { userId, orgType, supabase } = authResult;
 */
export async function authenticateRequest(): Promise<AuthContext | NextResponse> {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const metadata = sessionClaims?.metadata as Record<string, string> | undefined;
  const orgType = (metadata?.orgType || 'advertiser') as OrgType;
  const orgId = metadata?.orgId || '';

  const supabase = await createServerClient();

  return { userId, orgType, orgId, supabase };
}

/**
 * Authenticate and require a specific org type.
 * Returns 403 if user's org type doesn't match.
 */
export async function authenticateWithRole(
  ...allowedTypes: OrgType[]
): Promise<AuthContext | NextResponse> {
  const result = await authenticateRequest();
  if (result instanceof NextResponse) return result;

  if (!allowedTypes.includes(result.orgType)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return result;
}

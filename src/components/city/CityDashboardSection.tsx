'use client';

import { useUser } from '@clerk/nextjs';
import { useCurrentUserOptional, type OrgType } from '@/lib/auth';

/**
 * Hook that provides the authenticated user's orgType for the city page.
 * Returns null while loading or for anonymous users.
 *
 * Used by the city page to pass role context to the diagonal panels,
 * which adapt their content accordingly:
 *   - Panel matches user's role → show quick-access links
 *   - Panel doesn't match → hidden (single-role) or marketing (admin)
 *   - No user → all panels show marketing content
 */
export function useCityRole(): {
  orgType: OrgType | null;
  userName: string | null;
  isAdmin: boolean;
  isLoading: boolean;
} {
  const { isLoaded, isSignedIn } = useUser();
  const user = useCurrentUserOptional();

  if (!isLoaded) {
    return { orgType: null, userName: null, isAdmin: false, isLoading: true };
  }

  if (!isSignedIn || !user) {
    return { orgType: null, userName: null, isAdmin: false, isLoading: false };
  }

  return {
    orgType: user.orgType,
    userName: user.name || user.email,
    isAdmin: user.orgType === 'admin',
    isLoading: false,
  };
}

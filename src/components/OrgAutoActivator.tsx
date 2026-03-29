'use client';

import { useEffect } from 'react';
import { useUser, useOrganization, useOrganizationList } from '@clerk/nextjs';

/**
 * Auto-activates the user's organization if they only belong to one.
 *
 * Clerk doesn't auto-select an org on sign-in, so `useOrganization()`
 * returns null until the user manually picks one. This component
 * detects that case and activates the user's single org automatically.
 *
 * Without this, the JWT template {{org.public_metadata.type}} returns
 * empty, causing every user to default to orgType 'advertiser'.
 *
 * Mount once in the root layout, inside ClerkProvider.
 */
export function OrgAutoActivator() {
  const { isSignedIn } = useUser();
  const { organization } = useOrganization();
  const { userMemberships, setActive } = useOrganizationList({
    userMemberships: { infinite: true },
  });

  useEffect(() => {
    // Only act if: user is signed in, no org is active, and we have memberships loaded
    if (!isSignedIn || organization || !userMemberships?.data) return;

    // If user belongs to exactly one org, activate it
    if (userMemberships.data.length === 1 && setActive) {
      const orgId = userMemberships.data[0].organization.id;
      setActive({ organization: orgId }).catch((err: unknown) => {
        console.error('[OrgAutoActivator] Failed to activate org:', err);
      });
    }
  }, [isSignedIn, organization, userMemberships?.data, setActive]);

  return null; // Render nothing — this is a side-effect-only component
}

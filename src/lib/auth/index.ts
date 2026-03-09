'use client';

import { useUser, useOrganization } from '@clerk/nextjs';
import { useMemo } from 'react';

export type OrgType = 'publisher' | 'government' | 'advertiser';
export type UserRole = 'admin' | 'editor' | 'viewer';

export interface CurrentUser {
  userId: string;
  email: string;
  name: string;
  orgId: string;
  orgName: string;
  orgType: OrgType;
  role: UserRole;
}

/**
 * Returns the current authenticated user.
 * Throws if called when not authenticated — only use in protected routes.
 */
export function useCurrentUser(): CurrentUser {
  const { user } = useUser();
  const { organization, membership } = useOrganization();

  return useMemo(() => {
    if (!user) {
      throw new Error('useCurrentUser called without authenticated user. Use useCurrentUserOptional for public pages.');
    }

    const orgType = (organization?.publicMetadata?.type as OrgType) || 'advertiser';
    const role = (membership?.role === 'org:admin' ? 'admin' : 'editor') as UserRole;

    return {
      userId: user.id,
      email: user.primaryEmailAddress?.emailAddress || '',
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.primaryEmailAddress?.emailAddress || '',
      orgId: organization?.id || '',
      orgName: organization?.name || '',
      orgType,
      role,
    };
  }, [user, organization, membership]);
}

/**
 * Returns the current user or null if not authenticated.
 * Safe to use on public pages.
 */
export function useCurrentUserOptional(): CurrentUser | null {
  const { user, isLoaded } = useUser();
  const { organization, membership } = useOrganization();

  return useMemo(() => {
    if (!isLoaded || !user) return null;

    const orgType = (organization?.publicMetadata?.type as OrgType) || 'advertiser';
    const role = (membership?.role === 'org:admin' ? 'admin' : 'editor') as UserRole;

    return {
      userId: user.id,
      email: user.primaryEmailAddress?.emailAddress || '',
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.primaryEmailAddress?.emailAddress || '',
      orgId: organization?.id || '',
      orgName: organization?.name || '',
      orgType,
      role,
    };
  }, [user, isLoaded, organization, membership]);
}

export function canManageCampaigns(user: CurrentUser): boolean {
  return user.orgType === 'government' || user.orgType === 'advertiser';
}

export function canManagePublisher(user: CurrentUser): boolean {
  return user.orgType === 'publisher';
}

export function canReviewUnits(user: CurrentUser): boolean {
  return user.orgType === 'publisher' && (user.role === 'admin' || user.role === 'editor');
}

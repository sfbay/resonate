'use client';

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

// Stub: returns a mock user
// TODO: Replace with Clerk integration in Phase 4
const MOCK_USER: CurrentUser = {
  userId: 'mock-user-001',
  email: 'demo@resonatelocal.org',
  name: 'Demo User',
  orgId: 'mock-org-001',
  orgName: 'Demo Organization',
  orgType: 'government',
  role: 'admin',
};

export function useCurrentUser(): CurrentUser {
  return useMemo(() => MOCK_USER, []);
}

export function useCurrentUserOptional(): CurrentUser | null {
  return useMemo(() => MOCK_USER, []);
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

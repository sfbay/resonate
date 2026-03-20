'use client';

import { type ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';
import { useCurrentUserOptional, type OrgType } from '@/lib/auth';
import { ContinueWhereYouLeftOff } from './ContinueWhereYouLeftOff';
import { PublisherQuickAccess } from './PublisherQuickAccess';
import { GovernmentQuickAccess } from './GovernmentQuickAccess';
import { AdvertiserQuickAccess } from './AdvertiserQuickAccess';

interface CityDashboardSectionProps {
  /** The anonymous fallback content (existing diagonal panels + closing) */
  anonymousContent: ReactNode;
}

/**
 * Orchestrator: renders role-specific QuickAccess modules for authenticated
 * users, or the anonymous marketing panels for visitors.
 *
 * Auth states:
 *   - Clerk loading → show anonymous content (avoids layout shift)
 *   - Not signed in → show anonymous content
 *   - Signed in as publisher → PublisherQuickAccess
 *   - Signed in as government → GovernmentQuickAccess
 *   - Signed in as advertiser → AdvertiserQuickAccess
 *   - Signed in as admin → All three stacked
 */
export function CityDashboardSection({ anonymousContent }: CityDashboardSectionProps) {
  const { isLoaded, isSignedIn } = useUser();
  const user = useCurrentUserOptional();

  // While Clerk loads, show anonymous content to avoid flash
  if (!isLoaded || !isSignedIn || !user) {
    return <>{anonymousContent}</>;
  }

  const orgType = user.orgType;

  return (
    <>
      {/* "Continue where you left off" banner */}
      <div className="pt-8">
        <ContinueWhereYouLeftOff />
      </div>

      {/* Welcome message */}
      <div className="max-w-6xl mx-auto px-6 pb-4">
        <p className="text-[var(--color-slate)] text-sm">
          Welcome back, <span className="font-semibold text-[var(--color-charcoal)]">{user.name || user.email}</span>
        </p>
      </div>

      {/* Role-specific modules */}
      {orgType === 'admin' ? (
        // Admin sees all three portals
        <>
          <PublisherQuickAccess />
          <GovernmentQuickAccess />
          <AdvertiserQuickAccess />
        </>
      ) : orgType === 'publisher' ? (
        <PublisherQuickAccess />
      ) : orgType === 'government' ? (
        <GovernmentQuickAccess />
      ) : (
        <AdvertiserQuickAccess />
      )}
    </>
  );
}

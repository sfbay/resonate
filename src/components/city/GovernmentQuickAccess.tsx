'use client';

import Link from 'next/link';
import { useCity } from '@/lib/geo/city-context';

/**
 * Government-specific quick-access module grid for the city landing page.
 * Teal-themed cards linking to key government functionality.
 */
export function GovernmentQuickAccess() {
  const { getPath } = useCity();

  return (
    <section className="py-16 px-6 bg-[var(--color-cream)]">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-1 w-10 rounded-full bg-[var(--color-teal)]" />
          <h2 className="font-serif text-xl font-semibold text-[var(--color-charcoal)]">
            Your Government Portal
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Discover Publishers */}
          <Link
            href={getPath('/government/discover')}
            className="group bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:border-[var(--color-teal)]/30 hover:shadow-lg transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-[var(--color-teal)]/10 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-[var(--color-teal)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[var(--color-charcoal)] mb-1">Discover Publishers</h3>
            <p className="text-sm text-[var(--color-slate)] leading-relaxed">
              Browse community publishers by neighborhood, language, and audience reach.
            </p>
            <span className="inline-flex items-center gap-1 text-[var(--color-teal)] text-sm font-semibold mt-3 group-hover:gap-2 transition-all">
              Explore
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </Link>

          {/* Campaigns */}
          <Link
            href={getPath('/government/campaigns')}
            className="group bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:border-[var(--color-teal)]/30 hover:shadow-lg transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-[var(--color-teal)]/10 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-[var(--color-teal)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[var(--color-charcoal)] mb-1">Campaigns</h3>
            <p className="text-sm text-[var(--color-slate)] leading-relaxed">
              Manage your active campaigns, track budgets, and monitor publisher placements.
            </p>
            <span className="inline-flex items-center gap-1 text-[var(--color-teal)] text-sm font-semibold mt-3 group-hover:gap-2 transition-all">
              View Campaigns
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </Link>

          {/* Create Campaign */}
          <Link
            href={getPath('/government/onboarding')}
            className="group bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:border-[var(--color-teal)]/30 hover:shadow-lg transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-[var(--color-teal)]/10 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-[var(--color-teal)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <h3 className="font-semibold text-[var(--color-charcoal)] mb-1">Create Campaign</h3>
            <p className="text-sm text-[var(--color-slate)] leading-relaxed">
              Launch a new outreach campaign — define your audience, match publishers, place orders.
            </p>
            <span className="inline-flex items-center gap-1 text-[var(--color-teal)] text-sm font-semibold mt-3 group-hover:gap-2 transition-all">
              Get Started
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

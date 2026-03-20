'use client';

import Link from 'next/link';
import { useCity } from '@/lib/geo/city-context';

/**
 * Advertiser-specific quick-access module grid for the city landing page.
 * Marigold-themed cards linking to key advertiser functionality.
 */
export function AdvertiserQuickAccess() {
  const { getPath } = useCity();

  return (
    <section className="py-16 px-6 bg-[var(--color-cream)]">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-1 w-10 rounded-full bg-[var(--color-marigold)]" />
          <h2 className="font-serif text-xl font-semibold text-[var(--color-charcoal)]">
            Your Advertise Portal
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Create Ad */}
          <Link
            href={getPath('/advertise/create')}
            className="group bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:border-[var(--color-marigold)]/30 hover:shadow-lg transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-[var(--color-marigold)]/10 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-[var(--color-marigold-dark)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </div>
            <h3 className="font-semibold text-[var(--color-charcoal)] mb-1">Create an Ad</h3>
            <p className="text-sm text-[var(--color-slate)] leading-relaxed">
              Build your message with our ad builder — social posts, newsletters, and display ads.
            </p>
            <span className="inline-flex items-center gap-1 text-[var(--color-marigold-dark)] text-sm font-semibold mt-3 group-hover:gap-2 transition-all">
              Open Builder
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </Link>

          {/* Select Publishers */}
          <Link
            href={getPath('/advertise/select')}
            className="group bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:border-[var(--color-marigold)]/30 hover:shadow-lg transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-[var(--color-marigold)]/10 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-[var(--color-marigold-dark)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[var(--color-charcoal)] mb-1">Select Publishers</h3>
            <p className="text-sm text-[var(--color-slate)] leading-relaxed">
              Browse community publishers by neighborhood, language, and audience — see real-time pricing.
            </p>
            <span className="inline-flex items-center gap-1 text-[var(--color-marigold-dark)] text-sm font-semibold mt-3 group-hover:gap-2 transition-all">
              Browse Publishers
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </Link>

          {/* Campaigns */}
          <Link
            href={getPath('/advertise/validate')}
            className="group bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:border-[var(--color-marigold)]/30 hover:shadow-lg transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-[var(--color-marigold)]/10 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-[var(--color-marigold-dark)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[var(--color-charcoal)] mb-1">Your Campaigns</h3>
            <p className="text-sm text-[var(--color-slate)] leading-relaxed">
              Track impressions, clicks, and engagement across every publisher placement.
            </p>
            <span className="inline-flex items-center gap-1 text-[var(--color-marigold-dark)] text-sm font-semibold mt-3 group-hover:gap-2 transition-all">
              View Campaigns
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

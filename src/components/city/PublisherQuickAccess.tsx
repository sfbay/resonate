'use client';

import Link from 'next/link';
import { useCity } from '@/lib/geo/city-context';

/**
 * Publisher-specific quick-access module grid for the city landing page.
 * Coral-themed cards linking to key publisher functionality.
 */
export function PublisherQuickAccess() {
  const { getPath } = useCity();

  return (
    <section className="py-16 px-6 bg-[var(--color-cream)]">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-1 w-10 rounded-full bg-[var(--color-coral)]" />
          <h2 className="font-serif text-xl font-semibold text-[var(--color-charcoal)]">
            Your Publisher Portal
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Dashboard */}
          <Link
            href={getPath('/publisher/dashboard')}
            className="group bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:border-[var(--color-coral)]/30 hover:shadow-lg transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-[var(--color-coral)]/10 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-[var(--color-coral)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[var(--color-charcoal)] mb-1">Analytics Dashboard</h3>
            <p className="text-sm text-[var(--color-slate)] leading-relaxed">
              Track your reach, engagement, and growth across all connected platforms.
            </p>
            <span className="inline-flex items-center gap-1 text-[var(--color-coral)] text-sm font-semibold mt-3 group-hover:gap-2 transition-all">
              View Dashboard
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </Link>

          {/* Orders */}
          <Link
            href={getPath('/publisher/dashboard/orders')}
            className="group bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:border-[var(--color-coral)]/30 hover:shadow-lg transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-[var(--color-coral)]/10 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-[var(--color-coral)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.25 2.25m-13.5 0V18a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25V4.125c0-1.46-1.014-2.684-2.375-2.906A48.717 48.717 0 0012 1.5c-2.012 0-3.99.128-5.922.372C4.764 2.066 3.75 3.29 3.75 4.75v13.5A2.25 2.25 0 006 20.25h3" />
              </svg>
            </div>
            <h3 className="font-semibold text-[var(--color-charcoal)] mb-1">Orders</h3>
            <p className="text-sm text-[var(--color-slate)] leading-relaxed">
              Review incoming campaign orders, accept placements, and submit deliverables.
            </p>
            <span className="inline-flex items-center gap-1 text-[var(--color-coral)] text-sm font-semibold mt-3 group-hover:gap-2 transition-all">
              View Orders
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </Link>

          {/* Rate Card */}
          <Link
            href={getPath('/publisher/dashboard/rate-card')}
            className="group bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:border-[var(--color-coral)]/30 hover:shadow-lg transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-[var(--color-coral)]/10 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-[var(--color-coral)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[var(--color-charcoal)] mb-1">Rate Card</h3>
            <p className="text-sm text-[var(--color-slate)] leading-relaxed">
              Set your pricing for social posts, newsletters, display ads, and sponsored content.
            </p>
            <span className="inline-flex items-center gap-1 text-[var(--color-coral)] text-sm font-semibold mt-3 group-hover:gap-2 transition-all">
              Manage Rates
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

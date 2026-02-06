'use client';

/**
 * Publisher Landing Page (City-Scoped)
 *
 * Re-exports the main publisher page with city context.
 * The page uses useCity() to access city-specific data.
 */

import { useCity } from '@/lib/geo/city-context';
import Link from 'next/link';

export default function PublisherPage() {
  const { city, getPath } = useCity();

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={getPath('/')} className="text-charcoal font-semibold">
            ← Back to {city.name}
          </Link>
          <Link
            href={getPath('/publisher/dashboard')}
            className="btn btn-coral"
          >
            View Dashboard
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-coral-500 to-marigold-500 text-white">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <p className="text-coral-100 mb-2">For Publishers</p>
          <h1 className="display-lg mb-4">
            Grow Your Community Reach in {city.name}
          </h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Connect your social platforms, track audience growth, and get matched
            with city department campaigns that authentically reach your community.
          </p>
        </div>
      </section>

      {/* Features */}
      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="font-semibold text-charcoal text-lg mb-2">
              Analytics Dashboard
            </h3>
            <p className="text-slate-600">
              Track followers, engagement, and growth across all your connected
              platforms in one place.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="font-semibold text-charcoal text-lg mb-2">
              Growth Badges
            </h3>
            <p className="text-slate-600">
              Earn Rising Star and other badges that highlight your growth to
              potential advertising partners.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="font-semibold text-charcoal text-lg mb-2">
              Campaign Matching
            </h3>
            <p className="text-slate-600">
              Get matched with city campaigns based on your audience demographics
              and community coverage.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            href={getPath('/publisher/dashboard')}
            className="inline-block px-8 py-4 bg-coral-500 text-white text-lg font-semibold rounded-lg hover:bg-coral-600 transition-colors shadow-md"
          >
            Open Publisher Dashboard
          </Link>
          <p className="text-sm text-slate-500 mt-4">
            Connect your platforms and start tracking today
          </p>
        </div>
      </main>
    </div>
  );
}

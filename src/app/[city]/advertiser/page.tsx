'use client';

/**
 * Advertiser Landing Page (City-Scoped)
 *
 * Entry point for city departments to discover publishers
 * and create campaigns.
 */

import { useCity } from '@/lib/geo/city-context';
import Link from 'next/link';

export default function AdvertiserPage() {
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
            href={getPath('/advertiser/onboarding')}
            className="btn btn-teal"
          >
            Create Campaign
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-500 to-teal-700 text-white">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <p className="text-teal-100 mb-2">For City Departments</p>
          <h1 className="display-lg mb-4">
            Reach {city.name} Communities
          </h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Connect with trusted community publishers who authentically reach
            the audiences you need for your outreach campaigns.
          </p>
        </div>
      </section>

      {/* Features */}
      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="font-semibold text-charcoal text-lg mb-2">
              Discover Publishers
            </h3>
            <p className="text-slate-600">
              Explore an interactive map showing community publishers and their
              neighborhood coverage.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="font-semibold text-charcoal text-lg mb-2">
              Smart Matching
            </h3>
            <p className="text-slate-600">
              Get matched with publishers based on your target demographics,
              neighborhoods, and languages.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="font-semibold text-charcoal text-lg mb-2">
              Procurement Ready
            </h3>
            <p className="text-slate-600">
              Publishers are pre-vetted for city vendor status, simplifying
              the contracting process.
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <Link
            href={getPath('/advertiser/discover')}
            className="block bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-teal-500"
          >
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-charcoal mb-2">
              Explore Publishers
            </h3>
            <p className="text-slate-600 mb-4">
              Browse the map to see all available community publishers in {city.name}.
            </p>
            <span className="text-teal-500 font-semibold">View Map →</span>
          </Link>

          <Link
            href={getPath('/advertiser/onboarding')}
            className="block bg-teal-500 rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow text-white"
          >
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-xl font-semibold mb-2">
              Create a Campaign
            </h3>
            <p className="opacity-90 mb-4">
              Define your target audience and get matched with the best publishers.
            </p>
            <span className="font-semibold">Get Started →</span>
          </Link>
        </div>
      </main>
    </div>
  );
}

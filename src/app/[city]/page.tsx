'use client';

/**
 * City Landing Page
 *
 * Shows different content based on city status:
 * - Active cities: Links to publisher/advertiser dashboards
 * - Coming soon cities: Waitlist signup and info
 */

import { useCity } from '@/lib/geo/city-context';
import Link from 'next/link';

export default function CityPage() {
  const { city, isActive, isComingSoon, getPath } = useCity();

  if (isComingSoon) {
    return <ComingSoonPage />;
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <header className="bg-gradient-to-br from-coral-500 to-marigold-500 text-white">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <p className="text-coral-100 mb-2">{city.state}</p>
          <h1 className="display-lg mb-4">{city.name}</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            {city.tagline || 'Connecting community media with local government'}
          </p>
        </div>
      </header>

      {/* Role Selection */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="display-sm text-charcoal text-center mb-8">
          How would you like to use Resonate?
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Publisher Card */}
          <Link
            href={getPath('/publisher')}
            className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-coral-500"
          >
            <div className="text-5xl mb-4">📰</div>
            <h3 className="display-sm text-charcoal mb-3">I&apos;m a Publisher</h3>
            <p className="text-slate-600 mb-6">
              Connect your platforms, track your growth, and get matched with city
              department campaigns that reach your community.
            </p>
            <span className="inline-flex items-center gap-2 text-coral-500 font-semibold group-hover:gap-3 transition-all">
              View Dashboard
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </Link>

          {/* Advertiser Card */}
          <Link
            href={getPath('/advertiser')}
            className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-teal-500"
          >
            <div className="text-5xl mb-4">🏛️</div>
            <h3 className="display-sm text-charcoal mb-3">I&apos;m a Department</h3>
            <p className="text-slate-600 mb-6">
              Find community publishers who can authentically reach your target
              audiences with important city information.
            </p>
            <span className="inline-flex items-center gap-2 text-teal-500 font-semibold group-hover:gap-3 transition-all">
              Discover Publishers
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-3xl font-bold text-coral-500">13</p>
            <p className="text-slate-600">Coalition Publishers</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-teal-500">11</p>
            <p className="text-slate-600">Districts</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-marigold-500">41</p>
            <p className="text-slate-600">Neighborhoods</p>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Coming Soon Page for cities not yet launched
 */
function ComingSoonPage() {
  const { city } = useCity();
  const launchEstimate = ('launchEstimate' in city && typeof city.launchEstimate === 'string')
    ? city.launchEstimate
    : 'Soon';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-charcoal flex items-center justify-center px-6">
      <div className="max-w-xl text-center text-white">
        <p className="text-slate-400 mb-2">{city.state}</p>
        <h1 className="display-lg mb-4">{city.name}</h1>
        <p className="text-xl text-slate-300 mb-8">
          {city.tagline || 'Coming to your city soon'}
        </p>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-semibold mb-2">Coming {launchEstimate}</h2>
          <p className="text-slate-300">
            We&apos;re building partnerships with {city.name} community publishers
            and city departments. Join the waitlist to be first to know when we launch.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-white text-charcoal font-semibold rounded-lg hover:bg-slate-100 transition-colors"
          >
            Explore Other Cities
          </Link>
          <p className="text-sm text-slate-400">
            Currently live in San Francisco
          </p>
        </div>
      </div>
    </div>
  );
}

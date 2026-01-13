'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/**
 * Geographic Selector Entry Page
 *
 * A stunning nationwide map that positions Resonate as a scalable platform.
 * San Francisco is the active launch city; others shown as "coming soon".
 */

// City data with coordinates (approximate positions on our SVG viewBox)
const CITIES = [
  {
    id: 'sf',
    name: 'San Francisco',
    state: 'CA',
    x: 82,
    y: 185,
    active: true,
    publishers: 47,
    departments: 12,
  },
  { id: 'la', name: 'Los Angeles', state: 'CA', x: 95, y: 230, active: false },
  { id: 'seattle', name: 'Seattle', state: 'WA', x: 95, y: 85, active: false },
  { id: 'portland', name: 'Portland', state: 'OR', x: 88, y: 115, active: false },
  { id: 'denver', name: 'Denver', state: 'CO', x: 210, y: 195, active: false },
  { id: 'austin', name: 'Austin', state: 'TX', x: 265, y: 310, active: false },
  { id: 'chicago', name: 'Chicago', state: 'IL', x: 365, y: 160, active: false },
  { id: 'detroit', name: 'Detroit', state: 'MI', x: 400, y: 145, active: false },
  { id: 'atlanta', name: 'Atlanta', state: 'GA', x: 410, y: 270, active: false },
  { id: 'miami', name: 'Miami', state: 'FL', x: 470, y: 340, active: false },
  { id: 'dc', name: 'Washington', state: 'DC', x: 475, y: 200, active: false },
  { id: 'nyc', name: 'New York', state: 'NY', x: 500, y: 165, active: false },
  { id: 'boston', name: 'Boston', state: 'MA', x: 520, y: 135, active: false },
  { id: 'philly', name: 'Philadelphia', state: 'PA', x: 490, y: 175, active: false },
];

export default function GeographicSelector() {
  const router = useRouter();
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [showWaitlist, setShowWaitlist] = useState<string | null>(null);

  const handleCityClick = (city: typeof CITIES[0]) => {
    if (city.active) {
      router.push('/home');
    } else {
      setShowWaitlist(city.id);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-cream)] overflow-hidden">
      {/* Subtle background texture */}
      <div className="fixed inset-0 bg-dots opacity-40 pointer-events-none" />

      {/* Gradient accent in corner */}
      <div
        className="fixed top-0 right-0 w-1/2 h-1/2 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top right, rgba(247, 179, 43, 0.08) 0%, transparent 60%)',
        }}
      />
      <div
        className="fixed bottom-0 left-0 w-1/2 h-1/2 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at bottom left, rgba(11, 82, 91, 0.06) 0%, transparent 60%)',
        }}
      />

      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-coral)] to-[var(--color-marigold)] flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold font-[family-name:var(--font-fraunces)] text-[var(--color-charcoal)]">
              Resonate
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/about" className="text-sm font-medium text-[var(--color-slate)] hover:text-[var(--color-charcoal)] transition-colors">
              About
            </Link>
            <Link href="/home" className="btn btn-teal text-sm py-2 px-5">
              Enter SF Beta
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 pt-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Hero Text */}
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-teal)]/10 text-[var(--color-teal)] text-sm font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-[var(--color-teal)] animate-pulse" />
              Now Live in San Francisco
            </div>
            <h1 className="font-[family-name:var(--font-fraunces)] text-[var(--color-charcoal)] mb-4"
                style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 700, lineHeight: 1.1 }}>
              Civic Media,{' '}
              <span className="text-gradient-coral">Locally Connected</span>
            </h1>
            <p className="text-xl text-[var(--color-slate)] max-w-2xl mx-auto leading-relaxed">
              Connecting city departments with community publishers to reach residents through voices they already trust.
            </p>
          </div>

          {/* Map Container */}
          <div className="relative max-w-5xl mx-auto animate-fade-in-up stagger-1">
            {/* Map Card */}
            <div className="relative bg-white rounded-3xl shadow-xl border border-[var(--color-mist)] overflow-hidden">
              {/* Map Header */}
              <div className="px-6 py-4 border-b border-[var(--color-mist)] bg-gradient-to-r from-[var(--color-cream)] to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-[family-name:var(--font-fraunces)] text-lg font-semibold text-[var(--color-charcoal)]">
                      Select Your City
                    </h2>
                    <p className="text-sm text-[var(--color-slate)]">
                      Click a city to explore local civic media partnerships
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[var(--color-coral)] shadow-lg shadow-[var(--color-coral)]/30" />
                      <span className="text-[var(--color-slate)]">Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[var(--color-mist)]" />
                      <span className="text-[var(--color-slate)]">Coming Soon</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SVG Map */}
              <div className="relative p-6 bg-gradient-to-b from-white to-[var(--color-cream)]/30">
                <svg
                  viewBox="0 0 600 400"
                  className="w-full h-auto"
                  style={{ maxHeight: '500px' }}
                >
                  {/* US Map Path - Simplified outline */}
                  <defs>
                    <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--color-mist)" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="var(--color-mist)" stopOpacity="0.8" />
                    </linearGradient>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
                      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Continental US outline */}
                  <path
                    d="M 50 140
                       Q 55 100, 100 90
                       L 130 85 Q 145 75, 180 78
                       L 250 80 Q 280 75, 320 85
                       L 380 90 Q 420 85, 460 100
                       L 510 115 Q 540 120, 550 140
                       L 545 160 Q 555 180, 540 200
                       L 520 220 Q 530 250, 510 280
                       L 480 310 Q 490 340, 470 360
                       L 440 350 Q 420 370, 380 350
                       L 320 340 Q 280 360, 240 340
                       L 180 330 Q 140 350, 100 320
                       L 80 280 Q 60 250, 70 220
                       L 60 200 Q 45 170, 50 140"
                    fill="url(#mapGradient)"
                    stroke="var(--color-slate)"
                    strokeWidth="1"
                    strokeOpacity="0.2"
                  />

                  {/* State dividing lines (simplified) */}
                  <g stroke="var(--color-slate)" strokeWidth="0.5" strokeOpacity="0.15" fill="none">
                    <path d="M 150 80 L 150 320" />
                    <path d="M 250 80 L 280 340" />
                    <path d="M 350 85 L 350 350" />
                    <path d="M 450 100 L 430 350" />
                    <path d="M 50 200 L 550 200" />
                    <path d="M 60 280 L 520 280" />
                  </g>

                  {/* City Markers */}
                  {CITIES.map((city) => (
                    <g
                      key={city.id}
                      className="cursor-pointer transition-transform duration-300"
                      style={{
                        transform: hoveredCity === city.id ? 'scale(1.2)' : 'scale(1)',
                        transformOrigin: `${city.x}px ${city.y}px`
                      }}
                      onMouseEnter={() => setHoveredCity(city.id)}
                      onMouseLeave={() => setHoveredCity(null)}
                      onClick={() => handleCityClick(city)}
                    >
                      {city.active ? (
                        <>
                          {/* Active city - glowing pulse */}
                          <circle
                            cx={city.x}
                            cy={city.y}
                            r="24"
                            fill="var(--color-coral)"
                            opacity="0.15"
                            className="animate-ping"
                            style={{ animationDuration: '2s' }}
                          />
                          <circle
                            cx={city.x}
                            cy={city.y}
                            r="16"
                            fill="var(--color-coral)"
                            opacity="0.25"
                            filter="url(#softGlow)"
                          />
                          <circle
                            cx={city.x}
                            cy={city.y}
                            r="10"
                            fill="var(--color-coral)"
                            filter="url(#glow)"
                          />
                          <circle
                            cx={city.x}
                            cy={city.y}
                            r="4"
                            fill="white"
                          />
                        </>
                      ) : (
                        <>
                          {/* Inactive city - subtle dot */}
                          <circle
                            cx={city.x}
                            cy={city.y}
                            r={hoveredCity === city.id ? 8 : 6}
                            fill={hoveredCity === city.id ? 'var(--color-slate)' : 'var(--color-mist)'}
                            stroke="var(--color-slate)"
                            strokeWidth={hoveredCity === city.id ? 2 : 1}
                            strokeOpacity={hoveredCity === city.id ? 0.5 : 0.3}
                            className="transition-all duration-300"
                          />
                        </>
                      )}
                    </g>
                  ))}

                  {/* City Labels on Hover */}
                  {hoveredCity && (
                    <g>
                      {CITIES.filter(c => c.id === hoveredCity).map(city => (
                        <g key={`label-${city.id}`}>
                          <rect
                            x={city.x - 50}
                            y={city.y - 50}
                            width="100"
                            height={city.active ? "36" : "28"}
                            rx="6"
                            fill="var(--color-charcoal)"
                            opacity="0.95"
                          />
                          <text
                            x={city.x}
                            y={city.y - 32}
                            textAnchor="middle"
                            fill="white"
                            fontSize="12"
                            fontWeight="600"
                            fontFamily="var(--font-body)"
                          >
                            {city.name}, {city.state}
                          </text>
                          {city.active ? (
                            <text
                              x={city.x}
                              y={city.y - 18}
                              textAnchor="middle"
                              fill="var(--color-marigold)"
                              fontSize="10"
                              fontFamily="var(--font-body)"
                            >
                              {city.publishers} publishers · {city.departments} depts
                            </text>
                          ) : (
                            <text
                              x={city.x}
                              y={city.y - 28}
                              textAnchor="middle"
                              fill="var(--color-slate)"
                              fontSize="10"
                              fontFamily="var(--font-body)"
                            >
                              Coming Soon
                            </text>
                          )}
                        </g>
                      ))}
                    </g>
                  )}
                </svg>

                {/* San Francisco Callout Card */}
                <div className="absolute left-4 bottom-4 md:left-8 md:bottom-8">
                  <Link
                    href="/home"
                    className="group flex items-start gap-4 p-4 bg-white rounded-2xl shadow-lg border border-[var(--color-coral)]/20 hover:border-[var(--color-coral)]/50 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-coral)] to-[var(--color-coral-dark)] flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[var(--color-charcoal)]">San Francisco</span>
                        <span className="px-2 py-0.5 rounded-full bg-[var(--color-teal)] text-white text-xs font-medium">
                          LIVE
                        </span>
                      </div>
                      <p className="text-sm text-[var(--color-slate)] mb-2">
                        47 publishers · 850K+ reach · 12 departments
                      </p>
                      <div className="flex items-center gap-1 text-[var(--color-coral)] text-sm font-semibold group-hover:gap-2 transition-all">
                        Enter San Francisco
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in-up stagger-2">
            {[
              { value: '1', label: 'City Live', sublabel: 'San Francisco' },
              { value: '47', label: 'Publishers', sublabel: 'And growing' },
              { value: '850K+', label: 'Combined Reach', sublabel: 'Bay Area residents' },
              { value: '14', label: 'Cities Planned', sublabel: '2025 roadmap' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-[family-name:var(--font-fraunces)] text-3xl md:text-4xl font-bold text-[var(--color-charcoal)]">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-[var(--color-slate)] mt-1">
                  {stat.label}
                </div>
                <div className="text-xs text-[var(--color-slate)]/60">
                  {stat.sublabel}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center animate-fade-in-up stagger-3">
            <p className="text-[var(--color-slate)] mb-4">
              Want Resonate in your city?
            </p>
            <button
              onClick={() => setShowWaitlist('general')}
              className="btn btn-outline text-[var(--color-charcoal)] border-[var(--color-charcoal)]"
            >
              Join the Waitlist
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-[var(--color-mist)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-[var(--color-slate)]">
            A project of BAIMC in partnership with city governments
          </div>
          <div className="flex items-center gap-6 text-sm text-[var(--color-slate)]">
            <Link href="/about" className="hover:text-[var(--color-charcoal)] transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-[var(--color-charcoal)] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--color-charcoal)] transition-colors">Terms</Link>
          </div>
        </div>
      </footer>

      {/* Waitlist Modal */}
      {showWaitlist && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--color-charcoal)]/60 backdrop-blur-sm"
          onClick={() => setShowWaitlist(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--color-teal)] to-[var(--color-teal-light)] flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[var(--color-charcoal)] mb-2">
                Coming Soon
              </h3>
              <p className="text-[var(--color-slate)]">
                We&apos;re expanding! Join the waitlist to get notified when Resonate launches in your city.
              </p>
            </div>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowWaitlist(null); }}>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-mist)] focus:border-[var(--color-teal)] focus:ring-2 focus:ring-[var(--color-teal)]/20 outline-none transition-all"
              />
              <input
                type="text"
                placeholder="Your city"
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-mist)] focus:border-[var(--color-teal)] focus:ring-2 focus:ring-[var(--color-teal)]/20 outline-none transition-all"
              />
              <button type="submit" className="w-full btn btn-teal">
                Join Waitlist
              </button>
            </form>
            <button
              onClick={() => setShowWaitlist(null)}
              className="absolute top-4 right-4 text-[var(--color-slate)] hover:text-[var(--color-charcoal)] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Styles for animations */}
      <style jsx>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}

'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Map, { Marker, NavigationControl, type MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

/**
 * Geographic Selector Entry Page
 *
 * A stunning US map showcasing Resonate as a platform with San Francisco
 * as the Pre-Beta launch city.
 */

const MAPBOX_TOKEN = 'pk.eyJ1Ijoiamdhcm5pZXIiLCJhIjoiY21qem1kbnJuMDE0cjNlcHZ6em1tZGNneCJ9.rkWafIhT1k4RHXVRJWoEBw';

// San Francisco location
const SF_LOCATION = {
  id: 'sf',
  name: 'San Francisco',
  state: 'CA',
  lat: 37.7749,
  lng: -122.4194,
  publishers: 47,
  departments: 12,
};

// US center for initial view
const US_CENTER = {
  latitude: 39.8283,
  longitude: -98.5795,
  zoom: 3.5,
};

export default function GeographicSelector() {
  const router = useRouter();
  const mapRef = useRef<MapRef>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);

  const flyToSF = useCallback(() => {
    mapRef.current?.flyTo({
      center: [SF_LOCATION.lng, SF_LOCATION.lat],
      zoom: 10,
      duration: 2000,
    });
    // Navigate after the fly animation
    setTimeout(() => {
      router.push('/home');
    }, 2200);
  }, [router]);

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
              Enter SF Pre-Beta
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 pt-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Hero Text */}
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-coral)]/10 text-[var(--color-coral)] text-sm font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-[var(--color-coral)] animate-pulse" />
              Pre-Beta in San Francisco
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
                      Click San Francisco to explore civic media partnerships
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full bg-[var(--color-coral)] shadow-lg shadow-[var(--color-coral)]/30 animate-pulse" />
                    <span className="text-[var(--color-slate)]">Pre-Beta</span>
                  </div>
                </div>
              </div>

              {/* Mapbox Map */}
              <div className="relative" style={{ height: '500px' }}>
                <Map
                  ref={mapRef}
                  initialViewState={US_CENTER}
                  style={{ width: '100%', height: '100%' }}
                  mapStyle="mapbox://styles/mapbox/light-v11"
                  mapboxAccessToken={MAPBOX_TOKEN}
                  attributionControl={false}
                  dragRotate={false}
                  touchZoomRotate={false}
                >
                  <NavigationControl position="bottom-right" showCompass={false} />

                  {/* San Francisco Marker */}
                  <Marker
                    longitude={SF_LOCATION.lng}
                    latitude={SF_LOCATION.lat}
                    anchor="center"
                  >
                    <button
                      onClick={flyToSF}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                      className="relative cursor-pointer group focus:outline-none"
                      aria-label="Enter San Francisco Pre-Beta"
                    >
                      {/* Outer pulse ring */}
                      <span
                        className="absolute inset-0 rounded-full bg-[var(--color-coral)] animate-ping"
                        style={{
                          width: '60px',
                          height: '60px',
                          left: '-22px',
                          top: '-22px',
                          opacity: 0.3,
                          animationDuration: '2s',
                        }}
                      />
                      {/* Middle glow */}
                      <span
                        className="absolute rounded-full bg-[var(--color-coral)]"
                        style={{
                          width: '40px',
                          height: '40px',
                          left: '-12px',
                          top: '-12px',
                          opacity: 0.4,
                          filter: 'blur(8px)',
                        }}
                      />
                      {/* Main marker */}
                      <span
                        className={`relative block rounded-full bg-[var(--color-coral)] shadow-lg transition-transform duration-300 ${
                          isHovered ? 'scale-125' : 'scale-100'
                        }`}
                        style={{
                          width: '16px',
                          height: '16px',
                          boxShadow: '0 0 20px rgba(232, 93, 79, 0.5)',
                        }}
                      />
                      {/* Inner dot */}
                      <span
                        className="absolute rounded-full bg-white"
                        style={{
                          width: '6px',
                          height: '6px',
                          left: '5px',
                          top: '5px',
                        }}
                      />

                      {/* Hover tooltip */}
                      <div
                        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 transition-all duration-300 ${
                          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                        }`}
                      >
                        <div className="bg-[var(--color-charcoal)] text-white px-4 py-3 rounded-xl shadow-xl whitespace-nowrap">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{SF_LOCATION.name}</span>
                            <span className="px-2 py-0.5 rounded-full bg-[var(--color-coral)] text-xs font-medium">
                              PRE-BETA
                            </span>
                          </div>
                          <p className="text-xs text-white/70">
                            {SF_LOCATION.publishers} publishers · {SF_LOCATION.departments} departments
                          </p>
                          <p className="text-xs text-[var(--color-marigold)] mt-1 font-medium">
                            Click to enter →
                          </p>
                        </div>
                        {/* Arrow */}
                        <div
                          className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0"
                          style={{
                            borderLeft: '8px solid transparent',
                            borderRight: '8px solid transparent',
                            borderTop: '8px solid var(--color-charcoal)',
                          }}
                        />
                      </div>
                    </button>
                  </Marker>
                </Map>

                {/* San Francisco Callout Card - Fixed position */}
                <div className="absolute left-4 bottom-4 md:left-6 md:bottom-6 z-10">
                  <button
                    onClick={flyToSF}
                    className="group flex items-start gap-4 p-4 bg-white rounded-2xl shadow-lg border border-[var(--color-coral)]/20 hover:border-[var(--color-coral)]/50 hover:shadow-xl transition-all duration-300 text-left"
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
                        <span className="px-2 py-0.5 rounded-full bg-[var(--color-coral)] text-white text-xs font-medium">
                          PRE-BETA
                        </span>
                      </div>
                      <p className="text-sm text-[var(--color-slate)] mb-2">
                        {SF_LOCATION.publishers} publishers · 850K+ reach · {SF_LOCATION.departments} departments
                      </p>
                      <div className="flex items-center gap-1 text-[var(--color-coral)] text-sm font-semibold group-hover:gap-2 transition-all">
                        Enter San Francisco
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in-up stagger-2">
            {[
              { value: '1', label: 'City in Pre-Beta', sublabel: 'San Francisco' },
              { value: '47', label: 'Publishers', sublabel: 'And growing' },
              { value: '850K+', label: 'Combined Reach', sublabel: 'Bay Area residents' },
              { value: '12', label: 'Departments', sublabel: 'City partners' },
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
              onClick={() => setShowWaitlist(true)}
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
            A project of SFIMC in partnership with city governments
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
          onClick={() => setShowWaitlist(false)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--color-teal)] to-[var(--color-teal-light)] flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[var(--color-charcoal)] mb-2">
                Get Notified
              </h3>
              <p className="text-[var(--color-slate)]">
                Join the waitlist to hear when Resonate expands to your city.
              </p>
            </div>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowWaitlist(false); }}>
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
              onClick={() => setShowWaitlist(false)}
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

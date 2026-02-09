'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

/**
 * Resonate Landing
 *
 * Dark, cinematic entry with SF as the live proof point.
 * Background: dark Mapbox map of the continental US with a glowing
 * coral beacon on San Francisco. Coalition section showcases the
 * SF publisher network; expansion section invites other cities.
 */

// Lazy-load the map background to avoid SSR issues with mapbox-gl
const HeroMap = dynamic(() => import('@/components/HeroMapBackground'), { ssr: false });

// SF publisher data for the live proof section
const SF_PUBLISHERS = [
  { name: 'El Tecolote', src: '/images/publishers/el-tecolote.png', lang: 'Spanish/English', since: '1970' },
  { name: 'Mission Local', src: '/images/publishers/mission-local.png', lang: 'English/Spanish', since: '2009' },
  { name: 'The Bay View', src: '/images/publishers/bay-view.png', lang: 'English', since: '1976' },
  { name: 'The Wind', src: '/images/publishers/wind-newspaper.png', lang: 'Chinese', since: '2009' },
  { name: '48 Hills', src: '/images/publishers/48-hills.png', lang: 'English', since: '2013' },
  { name: 'SF Public Press', src: '/images/publishers/sf-public-press.png', lang: 'English', since: '2009' },
  { name: 'Nichi Bei', src: '/images/publishers/nichi-bei.png', lang: 'English/Japanese', since: '2009' },
  { name: 'Richmond Review', src: '/images/publishers/richmond-review.png', lang: 'English', since: '1980' },
  { name: 'Sunset Beacon', src: '/images/publishers/sunset-beacon.png', lang: 'English', since: '1980' },
  { name: 'J. Weekly', src: '/images/publishers/j-weekly.png', lang: 'English', since: '1946' },
  { name: 'Ingleside Light', src: '/images/publishers/ingleside-light.png', lang: 'English', since: '2019' },
];

// Animated counter
function useCountUp(end: number, duration = 1600, start = true) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * end));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

// Intersection observer for scroll triggers
function useInView(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const publisherRef = useInView(0.2);
  const expandRef = useInView(0.2);

  useEffect(() => { setMounted(true); }, []);

  const pubCount = useCountUp(13, 1400, mounted);
  const langCount = useCountUp(19, 1400, mounted);
  const neighborhoodCount = useCountUp(41, 1400, mounted);

  return (
    <div className="min-h-screen bg-[var(--color-charcoal)] text-white overflow-hidden">

      {/* ================================================================
          HERO
          ================================================================ */}
      <section className="relative min-h-screen flex flex-col">

        {/* Background atmosphere — base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1b1e] via-[var(--color-charcoal)] to-[#1a1210]" />

        {/* Dark Mapbox map of the continental US — atmospheric, non-interactive.
            No z-index on this container so beacons' z-20 (inside HeroMap)
            can escape to the section's stacking context and paint above hero content. */}
        <div className="absolute inset-0">
          <HeroMap />
          {/* Radial vignette — fades map edges to dark */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 85% 75% at 50% 45%, transparent 35%, rgba(13,27,30,0.45) 65%, #0d1b1e 90%)' }}
          />
          {/* Top and bottom fade for seamless blending */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0d1b1e] to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#1a1210] to-transparent pointer-events-none" />
        </div>

        {/* Nav */}
        <header className="relative z-20 px-6 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--color-coral)] to-[var(--color-marigold)] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold font-serif text-white">Resonate</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/sf"
                className="text-sm font-semibold px-5 py-2 rounded-full bg-white/10 border border-white/15 hover:bg-white/15 transition-all"
              >
                Enter San Francisco
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero content — centered, editorial */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-20">
          {/* Status pill */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-coral)]/30 bg-[var(--color-coral)]/10 mb-8 transition-all duration-1000"
            style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(15px)' }}
          >
            <span className="w-2 h-2 rounded-full bg-[var(--color-coral)] animate-pulse" />
            <span className="text-[var(--color-coral)] text-sm font-semibold tracking-wide">Live in San Francisco</span>
          </div>

          {/* Headline */}
          <h1
            className="font-serif text-center leading-[1.0] tracking-tight mb-6 transition-all duration-1000 delay-100"
            style={{
              fontSize: 'clamp(3rem, 8vw, 6.5rem)',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(25px)',
            }}
          >
            Community media<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-coral)] via-[var(--color-marigold)] to-[var(--color-teal-light)]">
              deserves infrastructure.
            </span>
          </h1>

          {/* Subhead */}
          <p
            className="text-center text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed mb-12 transition-all duration-1000 delay-200"
            style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)' }}
          >
            Resonate connects ethnic and community publishers with the institutions and businesses
            that need to reach their audiences — starting in San Francisco.
          </p>

          {/* Live stats strip */}
          <div
            className="flex items-center gap-8 md:gap-12 mb-14 transition-all duration-1000 delay-300"
            style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(15px)' }}
          >
            {[
              { value: pubCount, label: 'Publishers', color: 'var(--color-coral)' },
              { value: langCount, label: 'Languages', color: 'var(--color-marigold)' },
              { value: neighborhoodCount, label: 'Neighborhoods', color: 'var(--color-teal-light)' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold tabular-nums" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-white/40 mt-1 tracking-wide uppercase">{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div
            className="flex flex-col sm:flex-row items-center gap-4 transition-all duration-1000 delay-400"
            style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(15px)' }}
          >
            <Link
              href="/sf"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-[var(--color-coral)] hover:bg-[var(--color-coral-dark)] text-white font-semibold text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(241,81,82,0.3)]"
            >
              Enter San Francisco
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <button
              onClick={() => setShowWaitlist(true)}
              className="text-sm text-white/50 hover:text-white/80 transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-white/40"
            >
              Bring Resonate to your city
            </button>
          </div>
        </div>

        {/* Publisher logo marquee — monochrome scrolling ribbon */}
        <div
          className="relative z-10 border-t border-white/10 bg-white/[0.03] backdrop-blur-sm transition-all duration-1000 delay-600"
          style={{ opacity: mounted ? 1 : 0 }}
        >
          <div className="overflow-hidden py-4">
            <div className="flex animate-marquee gap-14 items-center">
              {[...SF_PUBLISHERS, ...SF_PUBLISHERS].map((pub, i) => (
                <div key={`${pub.name}-${i}`} className="flex-shrink-0 opacity-40 hover:opacity-80 transition-opacity grayscale hover:grayscale-0">
                  <Image
                    src={pub.src}
                    alt={pub.name}
                    width={100}
                    height={36}
                    className="h-6 w-auto object-contain invert"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="relative z-10 flex justify-center pb-8 transition-all duration-1000 delay-700"
          style={{ opacity: mounted ? 1 : 0 }}
        >
          <div className="w-5 h-8 rounded-full border-2 border-white/20 flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-white/40 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ================================================================
          PUBLISHER PROOF — "The Coalition" section
          ================================================================ */}
      <section ref={publisherRef.ref} className="relative py-24 bg-gradient-to-b from-[#1a1210] via-[var(--color-charcoal)] to-[var(--color-charcoal)]">
        <div className="max-w-6xl mx-auto px-6">

          {/* Section header */}
          <div
            className="text-center mb-16 transition-all duration-700"
            style={{
              opacity: publisherRef.inView ? 1 : 0,
              transform: publisherRef.inView ? 'translateY(0)' : 'translateY(25px)',
            }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-10 bg-[var(--color-coral)]" />
              <span className="text-[var(--color-coral)] text-xs font-bold tracking-[0.25em] uppercase">The San Francisco Coalition</span>
              <div className="h-px w-10 bg-[var(--color-coral)]" />
            </div>
            <h2
              className="font-serif text-white leading-tight mb-4"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
            >
              {SF_PUBLISHERS.length} publishers. {langCount} languages. One platform.
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              San Francisco&apos;s independent and ethnic media outlets — the voices that
              connect communities across {neighborhoodCount} neighborhoods.
            </p>
          </div>

          {/* Publisher grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {SF_PUBLISHERS.map((pub, i) => (
              <div
                key={pub.name}
                className="group relative bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 hover:bg-white/[0.08] hover:border-white/15 transition-all duration-300 cursor-default"
                style={{
                  opacity: publisherRef.inView ? 1 : 0,
                  transform: publisherRef.inView ? 'translateY(0)' : 'translateY(15px)',
                  transitionDelay: `${150 + i * 60}ms`,
                  transitionDuration: '500ms',
                }}
              >
                <div className="flex items-center justify-center h-10 mb-3">
                  <Image
                    src={pub.src}
                    alt={pub.name}
                    width={120}
                    height={40}
                    className="h-7 w-auto object-contain invert opacity-60 group-hover:opacity-90 transition-opacity"
                  />
                </div>
                <div className="text-center">
                  <div className="text-[11px] text-white/40 group-hover:text-white/60 transition-colors">{pub.lang}</div>
                  <div className="text-[10px] text-white/25 mt-0.5">Since {pub.since}</div>
                </div>
              </div>
            ))}

            {/* "+More" card */}
            <div
              className="relative bg-white/[0.02] border border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center"
              style={{
                opacity: publisherRef.inView ? 1 : 0,
                transform: publisherRef.inView ? 'translateY(0)' : 'translateY(15px)',
                transitionDelay: `${150 + SF_PUBLISHERS.length * 60}ms`,
                transitionDuration: '500ms',
              }}
            >
              <div className="text-white/30 text-sm font-medium">+ more</div>
              <div className="text-white/20 text-xs mt-1">joining monthly</div>
            </div>
          </div>

          {/* "Enter SF" inline CTA */}
          <div
            className="mt-12 text-center transition-all duration-700 delay-500"
            style={{
              opacity: publisherRef.inView ? 1 : 0,
              transform: publisherRef.inView ? 'translateY(0)' : 'translateY(15px)',
            }}
          >
            <Link
              href="/sf"
              className="group inline-flex items-center gap-2 text-[var(--color-coral)] font-semibold hover:underline underline-offset-4"
            >
              Explore the full coalition in San Francisco
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================
          BRING RESONATE TO YOUR CITY
          ================================================================ */}
      <section ref={expandRef.ref} className="relative py-24 bg-[var(--color-charcoal)]">
        <div className="max-w-3xl mx-auto px-6">

          <div
            className="text-center transition-all duration-700"
            style={{
              opacity: expandRef.inView ? 1 : 0,
              transform: expandRef.inView ? 'translateY(0)' : 'translateY(25px)',
            }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-10 bg-[var(--color-marigold)]" />
              <span className="text-[var(--color-marigold)] text-xs font-bold tracking-[0.25em] uppercase">Your City</span>
              <div className="h-px w-10 bg-[var(--color-marigold)]" />
            </div>
            <h2
              className="font-serif text-white leading-tight mb-5"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
            >
              Community media exists everywhere.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-marigold)] to-[var(--color-coral)]">
                Resonate can too.
              </span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto mb-10 leading-relaxed">
              Every city has ethnic and community publishers doing essential work.
              Resonate is built to connect them with the institutions and businesses
              that need to reach their audiences. If that sounds like your city,
              we want to hear from you.
            </p>
          </div>

          {/* Who should reach out */}
          <div
            className="grid sm:grid-cols-3 gap-4 mb-12 transition-all duration-700 delay-200"
            style={{
              opacity: expandRef.inView ? 1 : 0,
              transform: expandRef.inView ? 'translateY(0)' : 'translateY(15px)',
            }}
          >
            {[
              { icon: '📰', title: 'Publishers', desc: 'Community and ethnic media outlets ready for a better way to connect with advertisers' },
              { icon: '🏛️', title: 'Government', desc: 'City departments that need to reach diverse communities with public information' },
              { icon: '🏪', title: 'Businesses', desc: 'Local businesses and organizations that want to support community journalism' },
            ].map((item) => (
              <div
                key={item.title}
                className="text-center p-5 rounded-xl bg-white/[0.03] border border-white/[0.06]"
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-sm font-semibold text-white/80 mb-1">{item.title}</div>
                <div className="text-xs text-white/40 leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div
            className="text-center transition-all duration-700 delay-400"
            style={{
              opacity: expandRef.inView ? 1 : 0,
              transform: expandRef.inView ? 'translateY(0)' : 'translateY(15px)',
            }}
          >
            <button
              onClick={() => setShowWaitlist(true)}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-[var(--color-marigold)] hover:bg-[var(--color-marigold-dark)] text-white font-semibold text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(247,179,43,0.3)]"
            >
              Bring Resonate to your city
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <p className="text-white/30 text-sm mt-4">
              Tell us about your city and we&apos;ll be in touch.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================
          CLOSING + FOOTER
          ================================================================ */}
      <footer className="relative py-16 bg-[var(--color-charcoal)] border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">

          {/* Mission line */}
          <p className="font-serif text-center text-white/60 mb-12 leading-relaxed" style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)' }}>
            Every community has stories that matter.{' '}
            <span style={{ color: 'var(--color-coral)' }}>Resonate</span> makes sure
            they reach the people who need to hear them.
          </p>

          {/* Footer links */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[var(--color-coral)] to-[var(--color-marigold)] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-sm text-white/40">
                A project of the San Francisco Independent Media Coalition
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/30">
              <span className="cursor-default">About</span>
              <span className="cursor-default">Privacy</span>
              <span className="cursor-default">Terms</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ================================================================
          WAITLIST MODAL
          ================================================================ */}
      {showWaitlist && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowWaitlist(false)}
        >
          <div
            className="relative bg-[#1e2830] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[var(--color-teal)] to-[var(--color-teal-light)] flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-serif text-2xl font-semibold text-white mb-2">Get Notified</h3>
              <p className="text-white/50">
                Be first to know when Resonate expands to your city.
              </p>
            </div>
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); setShowWaitlist(false); }}>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[var(--color-teal-light)] focus:ring-2 focus:ring-[var(--color-teal)]/20 outline-none transition-all"
              />
              <input
                type="text"
                placeholder="Your city"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[var(--color-teal-light)] focus:ring-2 focus:ring-[var(--color-teal)]/20 outline-none transition-all"
              />
              <button type="submit" className="w-full py-3 rounded-xl bg-[var(--color-teal)] hover:bg-[var(--color-teal-dark)] text-white font-semibold transition-colors">
                Join Waitlist
              </button>
            </form>
            <button
              onClick={() => setShowWaitlist(false)}
              className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

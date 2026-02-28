'use client';

/**
 * City Landing Page — Bold "Choose Your Path" Experience
 *
 * Dark dramatic hero → three saturated portal teasers echoing
 * the actual Publisher / Government / Advertise pages.
 * Each panel uses bold color blocks, SFMapTexture, and diagonal clip-paths.
 */

import { useState, useEffect, useRef, useMemo, useSyncExternalStore } from 'react';
import { useCity } from '@/lib/geo/city-context';
import { getCityLandingData, type CityLandingData } from '@/lib/geo/city-landing-data';
import Link from 'next/link';
import Image from 'next/image';
import { SFMapTexture } from '@/components/SFMapTexture';
import { ResonanceBeacon } from '@/components/ResonanceBeacon';

// Animated counter hook
function useCountUp(end: number, duration: number = 1800, start: boolean = true) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

// Intersection observer hook for scroll-triggered animations
function useInView(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export default function CityPage() {
  const { city, isComingSoon, getPath } = useCity();
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const landingData = useMemo(() => getCityLandingData(city.slug), [city.slug]);
  const hasSFMapTexture = city.slug === 'sf';

  if (isComingSoon) {
    return <ComingSoonPage />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-charcoal)] overflow-hidden">

      {/* ============================================================
          BRANDING BAR — Slim Resonate identity strip
          ============================================================ */}
      <div className="relative z-50 bg-[var(--color-charcoal)] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            {/* Resonance mark — three concentric arcs */}
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
              <circle cx="13" cy="13" r="4" fill="var(--color-coral)" />
              <path d="M13 5a8 8 0 010 16" stroke="var(--color-teal-light)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M13 2a11 11 0 010 22" stroke="var(--color-marigold)" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7" />
            </svg>
            <span className="text-xl font-bold font-serif text-white tracking-tight">
              Resonate
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href={getPath('/publisher')}
              className="px-3.5 py-1.5 text-sm font-medium text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-all"
            >
              Publishers
            </Link>
            <Link
              href={getPath('/government')}
              className="px-3.5 py-1.5 text-sm font-medium text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-all"
            >
              Government
            </Link>
            <Link
              href={getPath('/advertise')}
              className="px-3.5 py-1.5 text-sm font-medium text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-all"
            >
              Advertise
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================
          HERO: Brighter, shallower — teal-to-charcoal gradient
          ============================================================ */}
      <header className="relative min-h-[60vh] flex flex-col justify-end bg-gradient-to-b from-[var(--color-teal)] via-[#0a4a52] to-[var(--color-charcoal)] overflow-hidden">
        {hasSFMapTexture && <SFMapTexture variant="teal" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-charcoal)]/80 via-transparent to-transparent z-[1]" />

        <ResonanceBeacon color="coral" size="lg" intensity="subtle" className="top-[10%] left-[8%] z-[2]" />
        <ResonanceBeacon color="marigold" size="md" intensity="subtle" className="top-[15%] right-[12%] z-[2]" delay={2000} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pb-16 pt-12 w-full">
          <div
            className="flex items-center gap-3 mb-5 transition-all duration-1000"
            style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)' }}
          >
            <div className="h-px w-12 bg-[var(--color-coral)]" />
            <span className="text-[var(--color-coral-light)] text-sm font-semibold tracking-[0.2em] uppercase">
              {city.state} &middot; Live Now
            </span>
          </div>

          <h1
            className="font-serif leading-[0.9] tracking-tight text-white mb-5 transition-all duration-1000 delay-150"
            style={{
              fontSize: 'clamp(3.5rem, 10vw, 7.5rem)',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(30px)',
            }}
          >
            {city.name}
          </h1>

          <p
            className="text-lg md:text-xl text-white/80 max-w-lg leading-relaxed mb-8 transition-all duration-1000 delay-300"
            style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)' }}
          >
            Community media serving neighbors, neighborhoods, and the stories that connect them.
          </p>

          <div
            className="flex items-center gap-4 flex-wrap transition-all duration-1000 delay-500"
            style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(15px)' }}
          >
            <span className="text-white/40 text-xs font-semibold tracking-[0.15em] uppercase">
              Choose your path
            </span>
            <div className="flex gap-2.5">
              <Link
                href={getPath('/publisher')}
                className="group px-5 py-2.5 rounded-full bg-[var(--color-coral)] text-white font-semibold text-sm transition-all duration-300 hover:bg-[var(--color-coral-dark)] hover:scale-105 hover:shadow-lg hover:shadow-[rgba(241,81,82,0.3)]"
              >
                Publishers
                <svg className="inline-block w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href={getPath('/government')}
                className="group px-5 py-2.5 rounded-full bg-white/15 text-white font-semibold text-sm backdrop-blur-sm transition-all duration-300 hover:bg-white/25 hover:scale-105"
              >
                Government
                <svg className="inline-block w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href={getPath('/advertise')}
                className="group px-5 py-2.5 rounded-full bg-[var(--color-marigold)] text-[var(--color-charcoal)] font-semibold text-sm transition-all duration-300 hover:bg-[var(--color-marigold-dark)] hover:scale-105 hover:shadow-lg hover:shadow-[rgba(247,179,43,0.3)]"
              >
                Businesses
                <svg className="inline-block w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Publisher logo marquee */}
        <div
          className="relative z-10 border-t border-white/10 bg-white/[0.04] backdrop-blur-sm transition-all duration-1000 delay-700"
          style={{ opacity: mounted ? 1 : 0 }}
        >
          <div className="overflow-hidden py-3.5">
            <div className="flex animate-marquee gap-12 items-center">
              {[...landingData.publishers, ...landingData.publishers].map((pub, i) => (
                <div key={`${pub.name}-${i}`} className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity">
                  {pub.src ? (
                    <Image src={pub.src} alt={pub.name} width={100} height={36} className="h-6 w-auto object-contain invert grayscale hover:grayscale-0" />
                  ) : (
                    <span className="text-white/80 text-sm font-semibold tracking-wide whitespace-nowrap">{pub.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================
          PUBLISHER PORTAL TEASER — Coral diagonal, left-anchored
          Echoes: publisher/page.tsx hero (coral clip-path left)
          ============================================================ */}
      <CoralPublisherPanel getPath={getPath} data={landingData} hasSFMapTexture={hasSFMapTexture} />

      {/* ============================================================
          GOVERNMENT PORTAL TEASER — Teal diagonal, right-anchored
          Echoes: government/page.tsx hero (teal clip-path right)
          ============================================================ */}
      <TealGovernmentPanel getPath={getPath} data={landingData} hasSFMapTexture={hasSFMapTexture} />

      {/* ============================================================
          ADVERTISE PORTAL TEASER — Marigold diagonal, left-anchored
          Echoes: advertise/page.tsx hero (marigold clip-path right)
          ============================================================ */}
      <MarigoldAdvertisePanel getPath={getPath} data={landingData} hasSFMapTexture={hasSFMapTexture} />

      {/* ============================================================
          CLOSING: Mission statement (dark bookend)
          ============================================================ */}
      <ClosingSection data={landingData} cityName={city.name} />
    </div>
  );
}


// =============================================================================
// PUBLISHER TEASER — Coral block on left, cream on right
// =============================================================================

function CoralPublisherPanel({ getPath, data, hasSFMapTexture }: { getPath: (p: string) => string; data: CityLandingData; hasSFMapTexture: boolean }) {
  const { ref, inView } = useInView(0.15);

  return (
    <section ref={ref} className="relative min-h-[70vh] flex items-center overflow-hidden bg-[var(--color-cream)]">
      {/* Coral block — diagonal clip-path on left (echoing publisher page) */}
      <div
        className="absolute inset-0 z-[1] bg-[var(--color-coral)]"
        style={{ clipPath: 'polygon(0 0, 60% 0, 48% 100%, 0 100%)' }}
      />
      <div
        className="absolute inset-0 z-[1]"
        style={{ clipPath: 'polygon(0 0, 60% 0, 48% 100%, 0 100%)' }}
      >
        {hasSFMapTexture && <SFMapTexture variant="coral" />}
      </div>

      {/* Ambient beacon */}
      <ResonanceBeacon color="marigold" size="lg" intensity="whisper" className="bottom-[15%] left-[35%] z-[2]" delay={1000} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content on coral */}
          <div
            className="transition-all duration-700"
            style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(30px)' }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-10 bg-white/50" />
              <span className="text-white/80 text-xs font-bold tracking-[0.25em] uppercase">
                For Publishers
              </span>
            </div>

            <h2
              className="font-serif text-white leading-[1.05] tracking-tight mb-5"
              style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)' }}
            >
              Transform reach<br />
              <span className="text-[var(--color-marigold)]">into revenue</span>
            </h2>

            <p className="text-lg text-white/85 leading-relaxed mb-8 max-w-md">
              Connect your platforms. Track your reach. Get matched with campaigns that amplify what you already do.
            </p>

            <div className="flex gap-8 mb-8">
              <StatCounter value={data.publisherStats.publisherCount} label="Publishers" color="white" inView={inView} delay={0} />
              <StatCounter value={data.publisherStats.languageCount} label="Languages" color="var(--color-marigold)" inView={inView} delay={150} />
              <StatCounter value={data.publisherStats.neighborhoodCount} label="Neighborhoods" color="white" inView={inView} delay={300} />
            </div>

            <Link
              href={getPath('/publisher')}
              className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-white text-[var(--color-coral)] font-semibold transition-all duration-300 hover:bg-[var(--color-cream)] hover:scale-[1.02] shadow-lg"
            >
              Open Dashboard
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Right: Floating preview card on cream background */}
          <div
            className="relative transition-all duration-700 delay-200"
            style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(20px)' }}
          >
            <div className="animate-float">
              <div className="bg-white rounded-2xl p-6 shadow-float max-w-sm ml-auto border border-gray-100">
                <div className="text-xs font-semibold uppercase tracking-widest text-[var(--color-coral)] mb-4">
                  Analytics Dashboard
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--color-slate)] text-sm">Social Reach</span>
                    <span className="font-bold text-[var(--color-charcoal)]">24,500</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--color-coral)] rounded-full" style={{ width: '72%' }} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--color-slate)] text-sm">Campaign Revenue</span>
                    <span className="font-bold text-[var(--color-coral)]">$2,400</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--color-marigold)] rounded-full" style={{ width: '58%' }} />
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-[var(--color-slate)] text-sm">Engagement</span>
                    <span className="font-bold text-[var(--color-teal)]">+24%</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Secondary floating badge */}
            <div className="absolute -bottom-3 left-8 bg-white rounded-xl px-4 py-3 shadow-lg animate-float-delayed border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--color-coral)] animate-pulse" />
                <span className="text-sm font-semibold text-[var(--color-charcoal)]">3 active campaigns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


// =============================================================================
// GOVERNMENT TEASER — Teal block on right, cream on left
// =============================================================================

function TealGovernmentPanel({ getPath, data, hasSFMapTexture }: { getPath: (p: string) => string; data: CityLandingData; hasSFMapTexture: boolean }) {
  const { ref, inView } = useInView(0.15);

  return (
    <section ref={ref} className="relative min-h-[70vh] flex items-center overflow-hidden bg-[var(--color-cream)]">
      {/* Teal block — diagonal clip-path on right (echoing government page) */}
      <div
        className="absolute inset-0 z-[1] bg-[var(--color-teal)]"
        style={{ clipPath: 'polygon(40% 0, 100% 0, 100% 100%, 52% 100%)' }}
      />
      <div
        className="absolute inset-0 z-[1]"
        style={{ clipPath: 'polygon(40% 0, 100% 0, 100% 100%, 52% 100%)' }}
      >
        {hasSFMapTexture && <SFMapTexture variant="teal" />}
      </div>

      {/* Ambient beacon */}
      <ResonanceBeacon color="marigold" size="md" intensity="whisper" className="top-[20%] right-[25%] z-[2]" delay={2000} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Floating preview card on cream */}
          <div
            className="relative order-2 lg:order-1 transition-all duration-700 delay-200"
            style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(20px)' }}
          >
            <div className="animate-float">
              <div className="bg-white rounded-2xl p-6 shadow-float max-w-sm border border-gray-100">
                <div className="text-xs font-semibold uppercase tracking-widest text-[var(--color-teal)] mb-4">
                  Publisher Discovery
                </div>
                <div className="space-y-3">
                  {data.previewPublishers.map((pub) => (
                    <div key={pub.name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <div className="text-sm font-semibold text-[var(--color-charcoal)]">{pub.name}</div>
                        <div className="text-xs text-[var(--color-slate)]">{pub.reach} reach &middot; {pub.lang}</div>
                      </div>
                      <div className="text-sm font-bold text-[var(--color-teal)]">{pub.match}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Floating campaign card */}
            <div className="absolute -bottom-3 right-4 bg-white rounded-xl px-4 py-3 shadow-lg animate-float-delayed border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--color-teal)] animate-pulse" />
                <span className="text-sm font-semibold text-[var(--color-charcoal)]">Flu Shot Outreach</span>
                <span className="text-xs text-[var(--color-slate)]">4 publishers</span>
              </div>
            </div>
          </div>

          {/* Right: Content on teal */}
          <div
            className="order-1 lg:order-2 transition-all duration-700"
            style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(30px)' }}
          >
            <div className="flex items-center gap-3 mb-5 lg:justify-end">
              <span className="text-white/80 text-xs font-bold tracking-[0.25em] uppercase">
                For Government
              </span>
              <div className="h-px w-10 bg-white/50" />
            </div>

            <h2
              className="font-serif text-white leading-[1.05] tracking-tight mb-5 lg:text-right"
              style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)' }}
            >
              Meet communities<br />
              <span className="text-[var(--color-marigold)]">where they are</span>
            </h2>

            <p className="text-lg text-white/85 leading-relaxed mb-8 max-w-md lg:ml-auto lg:text-right">
              Discover which trusted local voices already serve the neighborhoods you need to reach — by language, ethnicity, income, and more.
            </p>

            <div className="flex gap-8 mb-8 lg:justify-end">
              <StatCounter value={data.governmentStats.districtCount} label="Districts" color="white" inView={inView} delay={0} />
              <StatCounter value={data.governmentStats.profileCount} label="Profiles" color="var(--color-marigold)" inView={inView} delay={150} />
              <StatCounter value={data.governmentStats.overlayCount} label="Overlays" color="white" inView={inView} delay={300} />
            </div>

            <div className="lg:text-right">
              <Link
                href={getPath('/government')}
                className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-white text-[var(--color-teal)] font-semibold transition-all duration-300 hover:bg-[var(--color-cream)] hover:scale-[1.02] shadow-lg"
              >
                Discover Publishers
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


// =============================================================================
// ADVERTISE TEASER — Marigold block on left, navy on right
// =============================================================================

function MarigoldAdvertisePanel({ getPath, data, hasSFMapTexture }: { getPath: (p: string) => string; data: CityLandingData; hasSFMapTexture: boolean }) {
  const { ref, inView } = useInView(0.15);

  return (
    <section ref={ref} className="relative min-h-[70vh] flex items-center overflow-hidden bg-[var(--color-navy)]">
      {/* Marigold block — diagonal clip-path on left */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: 'linear-gradient(135deg, var(--color-marigold) 0%, var(--color-marigold-dark) 100%)',
          clipPath: 'polygon(0 0, 58% 0, 46% 100%, 0 100%)',
        }}
      />
      <div
        className="absolute inset-0 z-[1]"
        style={{ clipPath: 'polygon(0 0, 58% 0, 46% 100%, 0 100%)' }}
      >
        {hasSFMapTexture && <SFMapTexture variant="marigold" />}
      </div>

      {/* Ambient beacons */}
      <ResonanceBeacon color="coral" size="md" intensity="whisper" className="top-[25%] right-[20%] z-[2]" delay={3000} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content on marigold */}
          <div
            className="transition-all duration-700"
            style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(30px)' }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-10 bg-[var(--color-charcoal)]/30" />
              <span className="text-[var(--color-charcoal)]/70 text-xs font-bold tracking-[0.25em] uppercase">
                For Businesses &amp; Nonprofits
              </span>
            </div>

            <h2
              className="font-serif text-[var(--color-charcoal)] leading-[1.05] tracking-tight mb-5"
              style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)' }}
            >
              Amplify your message.<br />
              <span className="text-[var(--color-teal)]">Strengthen communities.</span>
            </h2>

            <p className="text-lg text-[var(--color-charcoal)]/80 leading-relaxed mb-8 max-w-md">
              Every ad dollar placed through Resonate sustains the community journalism that keeps neighborhoods informed and connected.
            </p>

            <div className="flex gap-8 mb-8">
              <StatCounter value={850} label="Avg. CPM" color="var(--color-charcoal)" inView={inView} delay={0} prefix="$" />
              <StatCounter value={3} label="Campaign types" color="var(--color-teal)" inView={inView} delay={150} />
              <StatCounter value={100} label="To publishers" color="var(--color-charcoal)" inView={inView} delay={300} suffix="%" />
            </div>

            <Link
              href={getPath('/advertise')}
              className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-[var(--color-charcoal)] text-white font-semibold transition-all duration-300 hover:bg-[var(--color-navy)] hover:scale-[1.02] shadow-lg"
            >
              Start a Campaign
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Right: Floating impact card on navy */}
          <div
            className="relative transition-all duration-700 delay-200"
            style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(20px)' }}
          >
            <div className="animate-float">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-sm ml-auto border border-white/20">
                <div className="text-xs font-semibold uppercase tracking-widest text-[var(--color-marigold)] mb-4">
                  Your Impact
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Impressions</span>
                    <span className="font-bold text-white">24,500</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Engagement Rate</span>
                    <span className="font-bold text-white">4.8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Publishers Supported</span>
                    <span className="font-bold text-[var(--color-marigold)]">3</span>
                  </div>
                  <div className="pt-3 border-t border-white/15">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm">Community Impact</span>
                      <span className="font-bold text-[var(--color-teal-light)]">$2,400 to journalism</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Secondary floating card */}
            <div className="absolute -bottom-3 left-8 bg-white rounded-xl px-4 py-3 shadow-lg animate-float-delayed">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--color-coral)]/15 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[var(--color-coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-[var(--color-charcoal)]">{data.featuredPublisher.name}</div>
                  <div className="text-xs text-[var(--color-slate)]">{data.featuredPublisher.tagline}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


// =============================================================================
// STAT COUNTER
// =============================================================================

function StatCounter({ value, label, color, inView, delay, prefix, suffix }: {
  value: number; label: string; color: string;
  inView: boolean; delay: number; prefix?: string; suffix?: string;
}) {
  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setStarted(true), delay);
      return () => clearTimeout(t);
    }
  }, [inView, delay]);
  const count = useCountUp(value, 1600, started);

  return (
    <div>
      <div className="text-3xl md:text-4xl font-bold tabular-nums" style={{ color }}>
        {prefix}{count}{suffix}
      </div>
      <div className="text-sm mt-1 opacity-60" style={{ color }}>{label}</div>
    </div>
  );
}


// =============================================================================
// CLOSING SECTION — Dark bookend
// =============================================================================

function ClosingSection({ data, cityName }: { data: CityLandingData; cityName: string }) {
  const { ref, inView } = useInView(0.2);

  return (
    <section ref={ref} className="relative py-28 bg-[var(--color-charcoal)] overflow-hidden">
      {/* Subtle teal glow at top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full blur-[120px]"
        style={{ background: 'var(--color-teal)', opacity: 0.08 }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        {/* Main kicker */}
        <p
          className="font-serif text-white leading-[1.45] transition-all duration-1000"
          style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.4rem)',
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(24px)',
          }}
        >
          In a city of{' '}
          <span className="font-bold" style={{ color: 'var(--color-coral)' }}>{data.closing.neighborhoodCount} {data.closing.neighborhoodLabel}</span>,{' '}
          <span className="font-bold" style={{ color: 'var(--color-marigold)' }}>{data.closing.languageCount} languages</span>,{' '}
          and millions of stories — make your message{' '}
          <span
            className="relative inline-block font-bold italic"
            style={{ color: 'var(--color-teal-light)' }}
          >
            Resonate
          </span>.
        </p>

        {/* Supporting line */}
        <p
          className="mt-6 text-white/55 leading-relaxed transition-all duration-1000 delay-200 max-w-xl mx-auto"
          style={{
            fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(16px)',
          }}
        >
          Reach the people and communities through trusted, authentic voices and publications.
        </p>

        {/* CTA row */}
        <div
          className="mt-10 flex items-center justify-center gap-4 flex-wrap transition-all duration-1000 delay-400"
          style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(12px)' }}
        >
          <Link
            href="/publisher"
            className="px-6 py-2.5 rounded-full bg-[var(--color-coral)] text-white font-semibold text-sm transition-all hover:bg-[var(--color-coral-dark)] hover:scale-105"
          >
            I&apos;m a Publisher
          </Link>
          <Link
            href="/government/onboarding"
            className="px-6 py-2.5 rounded-full bg-[var(--color-teal)] text-white font-semibold text-sm transition-all hover:bg-[var(--color-teal-dark)] hover:scale-105"
          >
            Start a Campaign
          </Link>
          <Link
            href="/advertise"
            className="px-6 py-2.5 rounded-full bg-[var(--color-marigold)] text-[var(--color-charcoal)] font-semibold text-sm transition-all hover:bg-[var(--color-marigold-dark)] hover:scale-105"
          >
            Advertise
          </Link>
        </div>

        {/* Brand footer mark */}
        <div
          className="mt-14 flex items-center justify-center gap-2 text-white/35 text-sm transition-all duration-1000 delay-500"
          style={{ opacity: inView ? 1 : 0 }}
        >
          <svg width="18" height="18" viewBox="0 0 26 26" fill="none" aria-hidden="true">
            <circle cx="13" cy="13" r="4" fill="var(--color-coral)" opacity="0.6" />
            <path d="M13 5a8 8 0 010 16" stroke="var(--color-teal-light)" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />
            <path d="M13 2a11 11 0 010 22" stroke="var(--color-marigold)" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.3" />
          </svg>
          <span>Resonate &middot; {cityName}</span>
        </div>
      </div>
    </section>
  );
}


// =============================================================================
// COMING SOON PAGE
// =============================================================================

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

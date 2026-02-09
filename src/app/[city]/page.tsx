'use client';

/**
 * City Landing Page — Editorial "Choose Your Path" Experience
 *
 * Dark dramatic hero with three color-coded CTA buttons, then
 * bright colorful portal sections for Publisher, Government, and Advertise.
 */

import { useState, useEffect, useRef } from 'react';
import { useCity } from '@/lib/geo/city-context';
import Link from 'next/link';
import Image from 'next/image';
import { SFMapTexture } from '@/components/SFMapTexture';
import { ResonanceBeacon } from '@/components/ResonanceBeacon';

// Publisher logos for social proof marquee
const PUBLISHER_LOGOS = [
  { src: '/images/publishers/el-tecolote.png', name: 'El Tecolote' },
  { src: '/images/publishers/mission-local.png', name: 'Mission Local' },
  { src: '/images/publishers/bay-view.png', name: 'The Bay View' },
  { src: '/images/publishers/wind-newspaper.png', name: 'The Wind' },
  { src: '/images/publishers/48-hills.png', name: '48 Hills' },
  { src: '/images/publishers/sf-public-press.png', name: 'SF Public Press' },
  { src: '/images/publishers/nichi-bei.png', name: 'Nichi Bei' },
  { src: '/images/publishers/richmond-review.png', name: 'Richmond Review' },
  { src: '/images/publishers/sunset-beacon.png', name: 'Sunset Beacon' },
  { src: '/images/publishers/potrero-view.png', name: 'Potrero View' },
  { src: '/images/publishers/noe-valley-voice.png', name: 'Noe Valley Voice' },
  { src: '/images/publishers/j-weekly.png', name: 'J. Weekly' },
  { src: '/images/publishers/ingleside-light.png', name: 'Ingleside Light' },
];

// Animated counter hook
function useCountUp(end: number, duration: number = 1800, start: boolean = true) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (isComingSoon) {
    return <ComingSoonPage />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)] overflow-hidden">

      {/* ============================================================
          HERO: Dark dramatic opening with color-coded CTAs
          ============================================================ */}
      <header className="relative min-h-[92vh] flex flex-col justify-end bg-gradient-to-b from-[var(--color-charcoal)] via-[#1a2a2a] to-[var(--color-charcoal)] overflow-hidden">
        {/* Map texture — desaturated, moody */}
        <SFMapTexture variant="teal" />

        {/* Gradient wash */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-charcoal)] via-transparent to-[var(--color-charcoal)]/40 z-[1]" />

        {/* Resonance beacons — scattered ambient glow */}
        <ResonanceBeacon color="coral" size="xl" intensity="subtle" className="top-[15%] left-[10%] z-[2]" />
        <ResonanceBeacon color="teal" size="lg" intensity="subtle" className="top-[25%] right-[15%] z-[2]" delay={2000} />
        <ResonanceBeacon color="marigold" size="md" intensity="subtle" className="bottom-[35%] left-[60%] z-[2]" delay={4000} />

        {/* Hero content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 pb-20 w-full">
          {/* Overline */}
          <div
            className="flex items-center gap-3 mb-6 transition-all duration-1000"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            }}
          >
            <div className="h-px w-12 bg-[var(--color-coral)]" />
            <span className="text-[var(--color-coral)] text-sm font-semibold tracking-[0.2em] uppercase">
              {city.state} &middot; Live Now
            </span>
          </div>

          {/* City name — massive editorial type */}
          <h1
            className="font-serif leading-[0.9] tracking-tight text-white mb-6 transition-all duration-1000 delay-150"
            style={{
              fontSize: 'clamp(4rem, 12vw, 9rem)',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(30px)',
            }}
          >
            {city.name}
          </h1>

          {/* Tagline */}
          <p
            className="text-xl md:text-2xl text-white/80 max-w-xl leading-relaxed mb-10 transition-all duration-1000 delay-300"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            }}
          >
            Where community and ethnic media serve neighbors, neighborhoods and communities.
          </p>

          {/* Choose your path — Three color-coded CTAs */}
          <div
            className="flex items-center gap-5 flex-wrap transition-all duration-1000 delay-500"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(15px)',
            }}
          >
            <span className="text-white/50 text-sm font-semibold tracking-[0.15em] uppercase">
              Choose your path
            </span>
            <div className="flex gap-3">
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
                className="group px-5 py-2.5 rounded-full bg-[var(--color-teal)] text-white font-semibold text-sm transition-all duration-300 hover:bg-[var(--color-teal-dark)] hover:scale-105 hover:shadow-lg hover:shadow-[rgba(11,82,91,0.3)]"
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

        {/* Publisher logo marquee — social proof ribbon */}
        <div
          className="relative z-10 border-t border-white/15 bg-white/[0.05] backdrop-blur-sm transition-all duration-1000 delay-700"
          style={{ opacity: mounted ? 1 : 0 }}
        >
          <div className="overflow-hidden py-4">
            <div className="flex animate-marquee gap-12 items-center">
              {[...PUBLISHER_LOGOS, ...PUBLISHER_LOGOS].map((pub, i) => (
                <div key={`${pub.name}-${i}`} className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
                  <Image
                    src={pub.src}
                    alt={pub.name}
                    width={100}
                    height={36}
                    className="h-7 w-auto object-contain invert"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================
          PORTAL PANELS: Three bright, colorful full-width sections
          ============================================================ */}

      {/* --- PUBLISHER PORTAL --- */}
      <PortalPanel
        theme="coral"
        overline="For Publishers"
        headline="Your stories sustain communities."
        subhead="Connect your platforms. Track your reach. Get matched with campaigns that amplify what you already do."
        stats={[
          { value: 13, label: 'Coalition publishers', suffix: '' },
          { value: 19, label: 'Languages served', suffix: '' },
          { value: 45, label: 'Neighborhoods covered', suffix: '' },
        ]}
        cta={{ label: 'Open Dashboard', href: getPath('/publisher') }}
        align="left"
      />

      {/* --- GOVERNMENT PORTAL --- */}
      <PortalPanel
        theme="teal"
        overline="For Government"
        headline="Reach the people. Through trusted voices."
        subhead="Discover which trusted local voices already serve the neighborhoods you need to reach — by language, ethnicity, income, and more."
        stats={[
          { value: 11, label: 'Supervisorial districts', suffix: '' },
          { value: 41, label: 'Neighborhood profiles', suffix: '' },
          { value: 5, label: 'Demographic overlays', suffix: '' },
        ]}
        cta={{ label: 'Discover Publishers', href: getPath('/government') }}
        align="right"
      />

      {/* --- ADVERTISE PORTAL --- */}
      <PortalPanel
        theme="marigold"
        overline="For Businesses & Nonprofits"
        headline="Advertise where it matters. Fund what matters more."
        subhead="Every ad dollar placed through Resonate sustains the community journalism that keeps San Francisco&apos;s neighborhoods informed and connected."
        stats={[
          { value: 850, label: 'Avg. cost per thousand', suffix: '', prefix: '$' },
          { value: 3, label: 'Campaign types', suffix: '' },
          { value: 100, label: 'Of spend goes to publishers', suffix: '%' },
        ]}
        cta={{ label: 'Start a Campaign', href: getPath('/advertise') }}
        align="left"
      />

      {/* ============================================================
          CLOSING: Mission statement (dark bookend)
          ============================================================ */}
      <ClosingSection />
    </div>
  );
}

// =============================================================================
// PORTAL PANEL — Light, colorful backgrounds with decorative accents
// =============================================================================

interface PortalPanelProps {
  theme: 'coral' | 'teal' | 'marigold';
  overline: string;
  headline: string;
  subhead: string;
  stats: { value: number; label: string; suffix: string; prefix?: string }[];
  cta: { label: string; href: string };
  align: 'left' | 'right';
}

const themeConfig = {
  coral: {
    accent: 'var(--color-coral)',
    bg: 'bg-gradient-to-br from-[#fef2f2] via-white to-[#fff7ed]',
    btnClass: 'bg-[var(--color-coral)] hover:bg-[var(--color-coral-dark)] text-white shadow-[0_4px_14px_rgba(241,81,82,0.25)] hover:shadow-[0_6px_20px_rgba(241,81,82,0.35)]',
    decorBg: 'rgba(241,81,82,0.06)',
    decorBorder: 'rgba(241,81,82,0.15)',
    topBorder: 'var(--color-coral)',
  },
  teal: {
    accent: 'var(--color-teal)',
    bg: 'bg-gradient-to-br from-[#f0fdfa] via-white to-[#ecfeff]',
    btnClass: 'bg-[var(--color-teal)] hover:bg-[var(--color-teal-dark)] text-white shadow-[0_4px_14px_rgba(11,82,91,0.25)] hover:shadow-[0_6px_20px_rgba(11,82,91,0.35)]',
    decorBg: 'rgba(11,82,91,0.05)',
    decorBorder: 'rgba(11,82,91,0.12)',
    topBorder: 'var(--color-teal)',
  },
  marigold: {
    accent: 'var(--color-marigold)',
    bg: 'bg-gradient-to-br from-[#fffbeb] via-white to-[#fef9f0]',
    btnClass: 'bg-[var(--color-marigold)] hover:bg-[var(--color-marigold-dark)] text-[var(--color-charcoal)] shadow-[0_4px_14px_rgba(247,179,43,0.25)] hover:shadow-[0_6px_20px_rgba(247,179,43,0.35)]',
    decorBg: 'rgba(247,179,43,0.06)',
    decorBorder: 'rgba(247,179,43,0.15)',
    topBorder: 'var(--color-marigold)',
  },
};

function PortalPanel({ theme, overline, headline, subhead, stats, cta, align }: PortalPanelProps) {
  const { ref, inView } = useInView(0.2);
  const config = themeConfig[theme];

  return (
    <section ref={ref} className={`relative min-h-[70vh] flex items-center ${config.bg} overflow-hidden`}>
      {/* Colored top border accent */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: config.topBorder }} />

      {/* Decorative circles — subtle colored geometry */}
      <div
        className="absolute rounded-full"
        style={{
          width: 500,
          height: 500,
          background: config.decorBg,
          border: `1px solid ${config.decorBorder}`,
          ...(align === 'left'
            ? { right: '-5%', top: '10%' }
            : { left: '-5%', bottom: '10%' }
          ),
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 200,
          height: 200,
          background: config.decorBg,
          border: `1px solid ${config.decorBorder}`,
          ...(align === 'left'
            ? { right: '20%', bottom: '15%' }
            : { left: '25%', top: '15%' }
          ),
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 w-full">
        <div className={`max-w-2xl ${align === 'right' ? 'ml-auto text-right' : ''}`}>
          {/* Overline */}
          <div
            className={`flex items-center gap-3 mb-6 transition-all duration-700 ${align === 'right' ? 'justify-end' : ''}`}
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(20px)',
            }}
          >
            {align === 'left' && <div className="h-px w-10" style={{ background: config.accent }} />}
            <span
              className="text-xs font-bold tracking-[0.25em] uppercase"
              style={{ color: config.accent }}
            >
              {overline}
            </span>
            {align === 'right' && <div className="h-px w-10" style={{ background: config.accent }} />}
          </div>

          {/* Headline */}
          <h2
            className="font-serif text-[var(--color-charcoal)] leading-[1.05] tracking-tight mb-6 transition-all duration-700 delay-100"
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(25px)',
            }}
          >
            {headline}
          </h2>

          {/* Subhead */}
          <p
            className="text-lg text-[var(--color-slate)] leading-relaxed mb-10 transition-all duration-700 delay-200"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(20px)',
            }}
          >
            {subhead}
          </p>

          {/* Stats row */}
          <div
            className={`flex gap-10 mb-10 transition-all duration-700 delay-300 ${align === 'right' ? 'justify-end' : ''}`}
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(15px)',
            }}
          >
            {stats.map((stat, i) => (
              <StatCounter key={i} {...stat} color={config.accent} inView={inView} delay={i * 200} light />
            ))}
          </div>

          {/* CTA */}
          <div
            className={`transition-all duration-700 delay-500 ${align === 'right' ? 'flex justify-end' : ''}`}
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(15px)',
            }}
          >
            <Link
              href={cta.href}
              className={`group inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-[1.02] ${config.btnClass}`}
            >
              {cta.label}
              <svg
                className="w-5 h-5 transition-transform group-hover:translate-x-1"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// STAT COUNTER
// =============================================================================

function StatCounter({ value, label, suffix, prefix, color, inView, delay, light }: {
  value: number; label: string; suffix: string; prefix?: string;
  color: string; inView: boolean; delay: number; light?: boolean;
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
      <div className={`text-sm mt-1 ${light ? 'text-[var(--color-slate)]' : 'text-white/60'}`}>{label}</div>
    </div>
  );
}

// =============================================================================
// CLOSING SECTION — Dark bookend for contrast
// =============================================================================

function ClosingSection() {
  const { ref, inView } = useInView(0.3);

  return (
    <section ref={ref} className="relative py-32 bg-[var(--color-charcoal)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-charcoal)] via-transparent to-[var(--color-charcoal)]" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <p
          className="font-serif text-white/90 leading-relaxed transition-all duration-1000"
          style={{
            fontSize: 'clamp(1.4rem, 3vw, 2.2rem)',
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          In a city of <span style={{ color: 'var(--color-coral)' }}>41 neighborhoods</span>,{' '}
          <span style={{ color: 'var(--color-marigold)' }}>19 languages</span>, and{' '}
          <span style={{ color: 'var(--color-teal-light)' }}>one million stories</span> —
          the question isn&apos;t whether your message matters. It&apos;s whether it reaches
          the people who need to hear it.
        </p>

        <div
          className="mt-12 flex items-center justify-center gap-2 text-white/50 text-sm transition-all duration-1000 delay-300"
          style={{
            opacity: inView ? 1 : 0,
          }}
        >
          <div className="w-2 h-2 rounded-full bg-[var(--color-coral)]" />
          <div className="w-2 h-2 rounded-full bg-[var(--color-teal-light)]" />
          <div className="w-2 h-2 rounded-full bg-[var(--color-marigold)]" />
          <span className="ml-2">Resonate &middot; San Francisco</span>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// COMING SOON PAGE (unchanged)
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

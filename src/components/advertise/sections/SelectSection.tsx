'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '../ScrollReveal';
import { useCityOptional } from '@/lib/geo/city-context';

const SAMPLE_PUBLISHERS = [
  { initials: 'ET', name: 'El Tecolote', area: 'Mission', reach: '12.4K', grad: 'from-rose-500 to-rose-600' },
  { initials: 'ML', name: 'Mission Local', area: 'Mission', reach: '8.2K', grad: 'from-sky-500 to-sky-600' },
  { initials: 'BV', name: 'The Bay View', area: 'Bayview', reach: '15.1K', grad: 'from-emerald-500 to-emerald-600' },
  { initials: 'SP', name: 'SF Public Press', area: 'Citywide', reach: '22.0K', grad: 'from-amber-500 to-amber-600' },
  { initials: 'NB', name: 'Nichi Bei', area: 'Japantown', reach: '6.8K', grad: 'from-violet-500 to-violet-600' },
  { initials: 'BA', name: 'Bay Area Reporter', area: 'Castro', reach: '18.5K', grad: 'from-pink-500 to-pink-600' },
];

export function SelectSection() {
  const cityCtx = useCityOptional();
  const prefix = cityCtx ? `/${cityCtx.slug}` : '';
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section id="select" className="relative bg-radiance hero-texture text-white py-24 md:py-32 px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <ScrollReveal className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 text-sm font-bold">2</span>
            <span className="label text-teal-400">Select</span>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold leading-tight mb-5">
            Pick the voices your audience{' '}
            <span className="text-teal-400">trusts.</span>
          </h2>
          <p className="text-gray-400 body-md max-w-lg mx-auto">
            Browse local publishers by neighborhood, language, and reach.
            See real-time availability and transparent pricing.
          </p>
        </ScrollReveal>

        {/* Horizontal scroll carousel */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {SAMPLE_PUBLISHERS.map((p, i) => (
              <motion.div
                key={p.initials}
                className="snap-start shrink-0 w-[260px]"
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  type: 'spring',
                  damping: 25,
                  stiffness: 120,
                  delay: i * 0.08,
                }}
              >
                <div className="glass-card rounded-2xl p-5 h-full hover:-translate-y-1 hover:border-teal-400/30 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.grad} text-white flex items-center justify-center text-sm font-bold shadow-lg mb-4`}>
                    {p.initials}
                  </div>
                  <h3 className="font-semibold text-white mb-1">{p.name}</h3>
                  <p className="text-sm text-gray-400 mb-3">{p.area} &middot; {p.reach} reach</p>
                  <div className="text-teal-400 text-sm font-bold">From $19</div>
                </div>
              </motion.div>
            ))}
          </div>
          {/* Fade edges */}
          <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-[var(--color-charcoal)] to-transparent pointer-events-none" />
        </div>

        {/* CTA */}
        <ScrollReveal className="text-center mt-10" delay={0.3}>
          <a
            href={`${prefix}/advertise/select`}
            className="inline-flex items-center gap-2 btn btn-teal"
          >
            Explore Publishers
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}

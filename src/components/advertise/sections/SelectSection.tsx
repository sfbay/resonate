'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '../ScrollReveal';
import { useCityOptional } from '@/lib/geo/city-context';

const SAMPLE_PUBLISHERS = [
  { initials: 'ET', name: 'El Tecolote', area: 'Mission District', lang: 'EN / ES', reach: '12.4K', price: '$19', grad: 'from-rose-500 to-rose-600', accent: 'bg-rose-500' },
  { initials: 'ML', name: 'Mission Local', area: 'Mission District', lang: 'EN', reach: '8.2K', price: '$24', grad: 'from-sky-500 to-sky-600', accent: 'bg-sky-500' },
  { initials: 'BV', name: 'The Bay View', area: 'Bayview-HP', lang: 'EN', reach: '15.1K', price: '$22', grad: 'from-emerald-500 to-emerald-600', accent: 'bg-emerald-500' },
  { initials: 'SP', name: 'SF Public Press', area: 'Citywide', lang: 'EN', reach: '22.0K', price: '$35', grad: 'from-amber-500 to-amber-600', accent: 'bg-amber-500' },
  { initials: 'NB', name: 'Nichi Bei', area: 'Japantown', lang: 'EN / JA', reach: '6.8K', price: '$18', grad: 'from-violet-500 to-violet-600', accent: 'bg-violet-500' },
  { initials: 'BA', name: 'Bay Area Reporter', area: 'Castro / SOMA', lang: 'EN', reach: '18.5K', price: '$28', grad: 'from-pink-500 to-pink-600', accent: 'bg-pink-500' },
];

export function SelectSection() {
  const cityCtx = useCityOptional();
  const prefix = cityCtx ? `/${cityCtx.slug}` : '';
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section id="select" className="relative bg-radiance hero-texture text-white py-28 md:py-36 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <ScrollReveal className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 text-sm font-bold ring-1 ring-teal-500/30">2</span>
            <span className="label text-teal-400 tracking-widest">Select</span>
          </div>
          <h2 className="font-heading text-3xl md:text-[2.75rem] font-bold leading-[1.15] mb-6">
            Pick the voices your<br className="hidden md:block" /> audience{' '}
            <span className="text-teal-400">trusts.</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-lg mx-auto leading-relaxed">
            Browse local publishers by neighborhood, language, and reach.
            Transparent pricing. Real availability.
          </p>
        </ScrollReveal>

        {/* Horizontal scroll carousel */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4"
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {SAMPLE_PUBLISHERS.map((p, i) => (
              <motion.div
                key={p.initials}
                className="snap-start shrink-0 w-[280px]"
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
                <div className="glass-card rounded-2xl overflow-hidden h-full hover:-translate-y-1 hover:border-teal-400/30 transition-all duration-300 group">
                  {/* Color accent bar */}
                  <div className={`h-1 ${p.accent}`} />

                  <div className="p-5">
                    {/* Logo + name */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.grad} text-white flex items-center justify-center text-xs font-bold shadow-lg shrink-0`}>
                        {p.initials}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-[15px] group-hover:text-teal-300 transition-colors">{p.name}</h3>
                        <p className="text-xs text-gray-500">{p.area}</p>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-3 mb-4 text-[11px]">
                      <span className="bg-white/5 rounded-md px-2 py-1 text-gray-400 font-medium">{p.lang}</span>
                      <span className="bg-white/5 rounded-md px-2 py-1 text-gray-400 font-medium">{p.reach} reach</span>
                    </div>

                    {/* Channels */}
                    <div className="flex items-center gap-1.5 mb-4">
                      {['Instagram', 'Newsletter', 'Web'].map(ch => (
                        <span key={ch} className="text-[9px] font-semibold uppercase tracking-wider text-gray-500 bg-white/5 rounded px-1.5 py-0.5">{ch}</span>
                      ))}
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <span className="text-teal-400 text-sm font-bold">From {p.price}</span>
                      <span className="text-[10px] text-gray-500">per placement</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Fade edge */}
          <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-[var(--color-charcoal)] to-transparent pointer-events-none" />
        </div>

        {/* CTA */}
        <ScrollReveal className="text-center mt-12" delay={0.3}>
          <a
            href={`${prefix}/advertise/select`}
            className="inline-flex items-center gap-2 btn btn-teal"
          >
            Explore All Publishers
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}

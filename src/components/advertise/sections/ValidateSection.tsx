'use client';

import { motion } from 'framer-motion';
import { ScrollReveal } from '../ScrollReveal';
import { AnimatedCounter } from '../AnimatedCounter';
import { useCityOptional } from '@/lib/geo/city-context';

const METRICS = [
  { value: 47.2, prefix: '', suffix: 'K', decimals: 1, label: 'Impressions', color: 'text-violet-400' },
  { value: 1842, prefix: '', suffix: '', decimals: 0, label: 'Clicks', color: 'text-teal-400' },
  { value: 3.9, prefix: '', suffix: '%', decimals: 1, label: 'Engagement', color: 'text-coral-400' },
  { value: 1.87, prefix: '$', suffix: '', decimals: 2, label: 'Cost / Click', color: 'text-marigold-400' },
];

const SPARKLINE = [30, 45, 38, 52, 48, 65, 58, 72, 68, 80, 75, 90];

export function ValidateSection() {
  const cityCtx = useCityOptional();
  const prefix = cityCtx ? `/${cityCtx.slug}` : '';

  return (
    <section id="validate" className="relative bg-radiance hero-texture text-white py-24 md:py-32 px-4 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <ScrollReveal className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-violet-500/20 text-violet-400 text-sm font-bold">4</span>
            <span className="label text-violet-400">Validate</span>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold leading-tight mb-5">
            See what{' '}
            <span className="text-gradient-violet">landed.</span>
          </h2>
          <p className="text-gray-400 body-md max-w-lg mx-auto">
            Real-time dashboards show impressions, clicks, and engagement across
            every publisher. Duplicate and redeploy winning campaigns.
          </p>
        </ScrollReveal>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {METRICS.map((m, i) => (
            <ScrollReveal key={m.label} delay={i * 0.1}>
              <div className="glass-card rounded-2xl p-6 text-center">
                <AnimatedCounter
                  value={m.value}
                  prefix={m.prefix}
                  suffix={m.suffix}
                  decimals={m.decimals}
                  className={`font-heading text-3xl font-bold ${m.color}`}
                />
                <div className="text-[11px] text-gray-500 mt-2 uppercase tracking-wider font-medium">
                  {m.label}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Sparkline chart */}
        <ScrollReveal delay={0.3}>
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-300">Engagement over time</span>
              <span className="text-xs text-gray-500">Last 12 months</span>
            </div>
            <div className="flex items-end gap-1 h-24">
              {SPARKLINE.map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-sm bg-violet-500/40"
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  viewport={{ once: true }}
                  transition={{
                    type: 'spring',
                    damping: 15,
                    stiffness: 100,
                    delay: 0.5 + i * 0.05,
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-gray-500 mt-2 px-0.5">
              <span>Jan</span>
              <span>Jun</span>
              <span>Dec</span>
            </div>
          </div>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal className="text-center mt-10" delay={0.4}>
          <a
            href={`${prefix}/advertise/validate`}
            className="inline-flex items-center gap-2 bg-violet-500 hover:bg-violet-600 text-white font-semibold px-6 py-3 rounded-full transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            View Dashboard
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}

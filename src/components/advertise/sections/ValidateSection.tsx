'use client';

import { motion } from 'framer-motion';
import { ScrollReveal } from '../ScrollReveal';
import { AnimatedCounter } from '../AnimatedCounter';
import { useCityOptional } from '@/lib/geo/city-context';

const METRICS = [
  { value: 47.2, prefix: '', suffix: 'K', decimals: 1, label: 'Impressions', color: 'text-violet-400', delta: '+18%' },
  { value: 1842, prefix: '', suffix: '', decimals: 0, label: 'Clicks', color: 'text-teal-400', delta: '+24%' },
  { value: 3.9, prefix: '', suffix: '%', decimals: 1, label: 'Engagement', color: 'text-coral-400', delta: '+0.8%' },
  { value: 1.87, prefix: '$', suffix: '', decimals: 2, label: 'Cost / Click', color: 'text-marigold-400', delta: '-12%' },
];

const SPARKLINE = [30, 45, 38, 52, 48, 65, 58, 72, 68, 80, 75, 90];

const CHANNEL_BREAKDOWN = [
  { name: 'Instagram', pct: 42, color: 'bg-rose-400' },
  { name: 'Newsletter', pct: 31, color: 'bg-sky-400' },
  { name: 'Web Display', pct: 27, color: 'bg-amber-400' },
];

export function ValidateSection() {
  const cityCtx = useCityOptional();
  const prefix = cityCtx ? `/${cityCtx.slug}` : '';

  return (
    <section id="validate" className="relative bg-radiance hero-texture text-white py-28 md:py-36 px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 text-sm font-bold ring-1 ring-violet-500/30">4</span>
            <span className="label text-violet-400 tracking-widest">Validate</span>
          </div>
          <h2 className="font-heading text-3xl md:text-[2.75rem] font-bold leading-[1.15] mb-6">
            See what{' '}
            <span className="text-gradient-violet">landed.</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-lg mx-auto leading-relaxed">
            Real-time dashboards show impressions, clicks, and engagement across
            every publisher. Duplicate and redeploy what works.
          </p>
        </ScrollReveal>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {METRICS.map((m, i) => (
            <ScrollReveal key={m.label} delay={i * 0.1}>
              <div className="glass-card rounded-2xl p-5 text-center group hover:border-violet-500/20 transition-colors">
                <AnimatedCounter
                  value={m.value}
                  prefix={m.prefix}
                  suffix={m.suffix}
                  decimals={m.decimals}
                  className={`font-heading text-3xl font-bold ${m.color}`}
                />
                <div className="text-[10px] text-gray-500 mt-1.5 uppercase tracking-wider font-medium">
                  {m.label}
                </div>
                <div className={`text-[10px] font-bold mt-1 ${m.delta.startsWith('+') || m.delta.startsWith('-1') ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {m.delta} vs prior
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Sparkline chart (2/3 width) */}
          <ScrollReveal delay={0.3} className="md:col-span-2">
            <div className="glass-card rounded-2xl p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-300">Engagement over time</span>
                <div className="flex gap-2">
                  {['7d', '30d', '12m'].map((t, i) => (
                    <span key={t} className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${i === 2 ? 'bg-violet-500/20 text-violet-300' : 'text-gray-500 hover:text-gray-400 cursor-pointer'}`}>{t}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-end gap-1.5 h-28">
                {SPARKLINE.map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-t-sm bg-gradient-to-t from-violet-500/30 to-violet-500/60 hover:from-violet-400/40 hover:to-violet-400/70 transition-colors"
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    viewport={{ once: true }}
                    transition={{
                      type: 'spring',
                      damping: 15,
                      stiffness: 100,
                      delay: 0.5 + i * 0.04,
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-gray-600 mt-2.5 px-0.5">
                <span>Jan</span>
                <span>Apr</span>
                <span>Jul</span>
                <span>Oct</span>
                <span>Dec</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Channel breakdown (1/3 width) */}
          <ScrollReveal delay={0.4}>
            <div className="glass-card rounded-2xl p-6 h-full">
              <span className="text-sm font-medium text-gray-300 block mb-5">By channel</span>
              <div className="space-y-4">
                {CHANNEL_BREAKDOWN.map(ch => (
                  <div key={ch.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-400">{ch.name}</span>
                      <span className="text-xs font-bold text-gray-300">{ch.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${ch.color}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${ch.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* CTA */}
        <ScrollReveal className="text-center mt-12" delay={0.4}>
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

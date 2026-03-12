'use client';

import { motion } from 'framer-motion';
import { ScrollReveal } from '../ScrollReveal';
import { useCityOptional } from '@/lib/geo/city-context';

const PLACEMENTS = [
  { pub: 'El Tecolote', channel: 'Instagram Story', status: 'Scheduled', time: 'Mar 15, 9am', color: 'bg-rose-500' },
  { pub: 'Mission Local', channel: 'Newsletter', status: 'Queued', time: 'Mar 15, 11am', color: 'bg-sky-500' },
  { pub: 'The Bay View', channel: 'Web Display', status: 'Queued', time: 'Mar 16, 8am', color: 'bg-emerald-500' },
];

export function AmplifySection() {
  const cityCtx = useCityOptional();
  const prefix = cityCtx ? `/${cityCtx.slug}` : '';

  return (
    <section id="amplify" className="relative bg-warm-page py-28 md:py-36 px-4 overflow-hidden">
      {/* Decorative coral glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-coral-500/[0.04] blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-14 md:gap-20 items-center">
        {/* Visual: placement flow card */}
        <ScrollReveal direction="left" delay={0.1}>
          <div className="relative">
            <div className="absolute -inset-3 bg-gradient-to-br from-coral-500/10 to-transparent rounded-3xl blur-xl" />

            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Card header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-semibold text-gray-900">Campaign Launch</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Flu Shot Awareness — Mission & Bayview</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Ready</span>
              </div>

              {/* Placement timeline */}
              <div className="p-5 space-y-0">
                {PLACEMENTS.map((p, i) => (
                  <motion.div
                    key={p.pub}
                    className="flex items-start gap-3 relative"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.12 }}
                  >
                    {/* Timeline line */}
                    {i < PLACEMENTS.length - 1 && (
                      <div className="absolute left-[11px] top-6 w-0.5 h-10 bg-gray-100" />
                    )}

                    {/* Dot */}
                    <div className={`w-[22px] h-[22px] rounded-full ${p.color} flex items-center justify-center shrink-0 mt-0.5`}>
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </div>

                    <div className="flex-1 pb-5">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-gray-900">{p.pub}</span>
                        <span className="text-[10px] text-gray-400">{p.time}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{p.channel}</span>
                        <span className="text-[9px] font-semibold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{p.status}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Totals + CTA */}
              <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-500">3 placements &middot; 2 publishers</div>
                    <div className="text-lg font-bold text-gray-900 mt-0.5">$65.00 <span className="text-sm font-normal text-gray-400">total</span></div>
                  </div>
                  <a
                    href={`${prefix}/advertise/amplify`}
                    className="bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-500 text-white font-bold px-6 py-3 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 text-sm"
                  >
                    Launch Campaign
                  </a>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Text column */}
        <ScrollReveal direction="right">
          <div className="flex items-center gap-3 mb-5">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-coral-500/10 text-coral-500 text-sm font-bold ring-1 ring-coral-500/20">3</span>
            <span className="label text-coral-500 tracking-widest">Amplify</span>
          </div>
          <h2 className="font-heading text-3xl md:text-[2.75rem] font-bold leading-[1.15] text-gray-900 mb-6">
            Set your budget.<br className="hidden md:block" />
            <span className="text-coral-500">Launch.</span>
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed mb-5">
            See exactly where your ad will run, when it goes live, and what it costs.
            One checkout for all placements.
          </p>
          <ul className="space-y-3 text-sm text-slate-500">
            {[
              'Bulk pricing across multiple publishers',
              'Schedule a single post or a month of placements',
              'Automated delivery — no back-and-forth emails',
            ].map(item => (
              <li key={item} className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-coral-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </ScrollReveal>
      </div>
    </section>
  );
}

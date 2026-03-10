'use client';

import { useCityOptional } from '@/lib/geo/city-context';

const PIECES = [
  { key: 'create', verb: 'Create', desc: 'Build your message', colorClass: 'text-marigold-400', hoverBorder: 'hover:border-marigold-400/40', iconBg: 'bg-marigold-500/20', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
  )},
  { key: 'select', verb: 'Select', desc: 'Choose your channels', colorClass: 'text-teal-400', hoverBorder: 'hover:border-teal-400/40', iconBg: 'bg-teal-500/20', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
  )},
  { key: 'amplify', verb: 'Amplify', desc: 'Set budget & launch', colorClass: 'text-coral-400', hoverBorder: 'hover:border-coral-400/40', iconBg: 'bg-coral-500/20', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
  )},
  { key: 'validate', verb: 'Validate', desc: 'Track what landed', colorClass: 'text-marigold-400', hoverBorder: 'hover:border-marigold-400/40', iconBg: 'bg-marigold-500/20', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
  )},
] as const;

export function PathwayHero() {
  const cityCtx = useCityOptional();
  const prefix = cityCtx ? `/${cityCtx.slug}` : '';

  return (
    <section className="relative bg-radiance hero-texture text-white overflow-hidden">
      {/* Decorative orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-marigold-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 py-28 md:py-36 px-4">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <p className="label text-marigold-400 mb-5 animate-fade-in-up">
            Resonate Advertise
          </p>
          <h1 className="display-xl mb-6 animate-fade-in-up stagger-1" style={{ opacity: 0 }}>
            Reach your community.{' '}
            <br className="hidden md:block" />
            <em className="text-gradient-marigold not-italic">Your way.</em>
          </h1>
          <p className="body-lg text-gray-400 max-w-xl mx-auto animate-fade-in-up stagger-2" style={{ opacity: 0 }}>
            Four tools. Any order. Whether you&apos;re boosting a weekend market
            or launching a citywide campaign, start wherever makes sense.
          </p>
        </div>

        <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {PIECES.map((p, i) => (
            <a
              key={p.key}
              href={`${prefix}/advertise/${p.key}`}
              className={`glass-card rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg ${p.hoverBorder} animate-fade-in-up stagger-${i + 1}`}
              style={{ opacity: 0 }}
            >
              <div className={`w-10 h-10 mx-auto rounded-xl ${p.iconBg} flex items-center justify-center mb-3 ${p.colorClass}`}>
                {p.icon}
              </div>
              <div className={`font-heading text-lg font-bold ${p.colorClass}`}>
                {p.verb}
              </div>
              <div className="text-xs text-gray-400 mt-1.5 leading-relaxed">{p.desc}</div>
            </a>
          ))}
        </div>

        <div className="max-w-md mx-auto text-center animate-fade-in-up stagger-5" style={{ opacity: 0 }}>
          <a
            href={`${prefix}/advertise/select`}
            className="group inline-flex items-center gap-2.5 bg-marigold-500/10 border border-marigold-500/25 rounded-full px-6 py-2.5 text-sm font-semibold text-marigold-400 hover:bg-marigold-500/20 hover:border-marigold-500/40 transition-all duration-300"
          >
            <svg className="w-4 h-4 text-marigold-400" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" /></svg>
            Need something quick? Buy an ad in under 60 seconds.
          </a>
        </div>
      </div>
    </section>
  );
}

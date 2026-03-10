'use client';

import { useCityOptional } from '@/lib/geo/city-context';

const PIECES = [
  { key: 'create', icon: '\u270F\uFE0F', verb: 'Create', desc: 'Build your message', color: 'marigold' },
  { key: 'select', icon: '\uD83D\uDCCD', verb: 'Select', desc: 'Choose your channels', color: 'teal' },
  { key: 'amplify', icon: '\uD83D\uDE80', verb: 'Amplify', desc: 'Set budget & launch', color: 'coral' },
  { key: 'validate', icon: '\uD83D\uDCCA', verb: 'Validate', desc: 'Track what landed', color: 'marigold' },
] as const;

export function PathwayHero() {
  const cityCtx = useCityOptional();
  const prefix = cityCtx ? `/${cityCtx.slug}` : '';

  return (
    <section className="relative bg-charcoal text-white py-24 px-4">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <p className="text-xs font-semibold tracking-widest uppercase text-marigold-400 mb-4">
          Resonate Advertise
        </p>
        <h1 className="font-heading text-4xl md:text-5xl font-bold leading-tight mb-4">
          Reach your community.<br />
          <em className="text-marigold-400">Your way.</em>
        </h1>
        <p className="text-lg text-gray-400 max-w-xl mx-auto">
          Four tools. Any order. Whether you&apos;re boosting a weekend market
          or launching a citywide campaign, start wherever makes sense for you.
        </p>
      </div>

      <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {PIECES.map((p) => (
          <a
            key={p.key}
            href={`${prefix}/advertise/${p.key}`}
            className="bg-white/5 border border-white/10 rounded-xl p-5 text-center hover:bg-white/10 transition-all hover:-translate-y-1"
          >
            <div className="text-2xl mb-2">{p.icon}</div>
            <div className={`font-heading text-lg font-bold text-${p.color}-400`}>
              {p.verb}
            </div>
            <div className="text-xs text-gray-400 mt-1">{p.desc}</div>
          </a>
        ))}
      </div>

      <div className="max-w-md mx-auto text-center">
        <a
          href={`${prefix}/advertise/select`}
          className="inline-flex items-center gap-2 bg-marigold-500/15 border border-marigold-500/30 rounded-full px-5 py-2 text-sm font-semibold text-marigold-400 hover:bg-marigold-500/25 transition-colors"
        >
          <span>{'\u26A1'}</span>
          Need something quick? Buy an ad in under 60 seconds.
        </a>
      </div>
    </section>
  );
}

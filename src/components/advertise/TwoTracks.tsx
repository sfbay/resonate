'use client';

import { useCityOptional } from '@/lib/geo/city-context';

const TRACKS = [
  {
    icon: '\u26A1',
    name: 'Buy an Ad',
    desc: 'Pick a publisher, pick a format, pay. Done in under a minute. Auto-approved for returning buyers.',
    example: '"Our farmers market is this Saturday \u2014 boost it."',
    href: '/advertise/select',
  },
  {
    icon: '\uD83D\uDDFA\uFE0F',
    name: 'Build a Campaign',
    desc: 'Design your message, target neighborhoods, choose publishers, schedule across weeks. Bulk pricing.',
    example: '"We\'re launching vaccination clinics across 6 neighborhoods."',
    href: '/advertise/create',
  },
];

export function TwoTracks() {
  const cityCtx = useCityOptional();
  const prefix = cityCtx ? `/${cityCtx.slug}` : '';

  return (
    <section className="bg-charcoal py-20 px-4">
      <div className="max-w-3xl mx-auto text-center text-white mb-12">
        <h2 className="font-heading text-3xl font-bold mb-3">
          Two ways in. Same great outcome.
        </h2>
        <p className="text-gray-400">
          Whether you need something now or you&apos;re planning a full campaign,
          Resonate meets you where you are.
        </p>
      </div>
      <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
        {TRACKS.map((t) => (
          <a
            key={t.name}
            href={`${prefix}${t.href}`}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 text-left text-white hover:bg-white/10 transition-all hover:-translate-y-1"
          >
            <div className="text-3xl mb-4">{t.icon}</div>
            <h3 className="font-heading text-xl font-bold mb-2">{t.name}</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">{t.desc}</p>
            <p className="text-xs italic text-marigold-400">{t.example}</p>
          </a>
        ))}
      </div>
    </section>
  );
}

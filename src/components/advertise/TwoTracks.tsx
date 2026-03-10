'use client';

import { useCityOptional } from '@/lib/geo/city-context';

const TRACKS = [
  {
    name: 'Buy an Ad',
    desc: 'Pick a publisher, pick a format, pay. Done in under a minute. Auto-approved for returning buyers.',
    example: '"Our farmers market is this Saturday — boost it."',
    href: '/advertise/select',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
    ),
    accent: 'marigold',
    borderHover: 'hover:border-marigold-400/40',
    iconBg: 'bg-marigold-500/15',
    iconColor: 'text-marigold-400',
  },
  {
    name: 'Build a Campaign',
    desc: 'Design your message, target neighborhoods, choose publishers, schedule across weeks. Bulk pricing.',
    example: '"We\'re launching vaccination clinics across 6 neighborhoods."',
    href: '/advertise/create',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" /></svg>
    ),
    accent: 'teal',
    borderHover: 'hover:border-teal-400/40',
    iconBg: 'bg-teal-500/15',
    iconColor: 'text-teal-400',
  },
];

export function TwoTracks() {
  const cityCtx = useCityOptional();
  const prefix = cityCtx ? `/${cityCtx.slug}` : '';

  return (
    <section className="relative bg-radiance hero-texture py-24 px-4 overflow-hidden">
      <div className="relative z-10 max-w-3xl mx-auto text-center text-white mb-14">
        <h2 className="font-heading display-md mb-4">
          Two ways in.{' '}
          <span className="text-gradient-marigold">Same great outcome.</span>
        </h2>
        <p className="text-gray-400 body-md max-w-lg mx-auto">
          Whether you need something now or you&apos;re planning a full campaign,
          Resonate meets you where you are.
        </p>
      </div>
      <div className="relative z-10 max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
        {TRACKS.map((t, i) => (
          <a
            key={t.name}
            href={`${prefix}${t.href}`}
            className={`group glass-card rounded-2xl p-8 text-left text-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${t.borderHover}`}
          >
            <div className={`w-12 h-12 rounded-xl ${t.iconBg} ${t.iconColor} flex items-center justify-center mb-5`}>
              {t.icon}
            </div>
            <h3 className="font-heading text-xl font-bold mb-3">{t.name}</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">{t.desc}</p>
            <p className={`text-xs italic ${t.accent === 'marigold' ? 'text-marigold-400' : 'text-teal-400'}`}>{t.example}</p>
            <div className={`mt-5 flex items-center gap-1.5 text-xs font-semibold ${t.accent === 'marigold' ? 'text-marigold-400' : 'text-teal-400'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
              Get started
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

'use client';

import { ScrollReveal } from '../ScrollReveal';
import { useCityOptional } from '@/lib/geo/city-context';

export function CreateSection() {
  const cityCtx = useCityOptional();
  const prefix = cityCtx ? `/${cityCtx.slug}` : '';

  return (
    <section id="create" className="relative bg-warm-page py-28 md:py-36 px-4 overflow-hidden">
      {/* Subtle marigold glow */}
      <div className="absolute top-20 -left-40 w-[500px] h-[500px] rounded-full bg-marigold-500/[0.04] blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 md:gap-20 items-center">
        {/* Text column */}
        <ScrollReveal direction="left">
          <div className="flex items-center gap-3 mb-5">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-marigold-500/10 text-marigold-500 text-sm font-bold ring-1 ring-marigold-500/20">1</span>
            <span className="label text-marigold-500 tracking-widest">Create</span>
          </div>
          <h2 className="font-heading text-3xl md:text-[2.75rem] font-bold leading-[1.15] text-gray-900 mb-6">
            Start with what you<br className="hidden md:block" /> want to{' '}
            <span className="text-gradient-marigold">say.</span>
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed mb-5">
            Pick a template or start blank. Drop in your copy, upload a visual, and
            preview how it&apos;ll look across social, newsletter, and display.
          </p>
          <p className="text-slate-400 text-sm mb-8">
            No design skills required — our builder handles sizing, formatting, and compliance automatically.
          </p>
          <a
            href={`${prefix}/advertise/create`}
            className="inline-flex items-center gap-2 btn btn-marigold"
          >
            Open the Builder
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </ScrollReveal>

        {/* Visual: finished ad preview (not empty builder) */}
        <ScrollReveal direction="right" delay={0.15}>
          <div className="relative">
            {/* Shadow base */}
            <div className="absolute -inset-3 bg-gradient-to-br from-marigold-500/10 to-transparent rounded-3xl blur-xl" />

            {/* Ad preview card */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100 bg-white">
              {/* Toolbar */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50/80">
                <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
                <div className="ml-3 text-[10px] font-medium text-gray-400 tracking-wider uppercase">Ad Builder — Social Post</div>
              </div>

              <div className="p-5">
                {/* Format tabs */}
                <div className="flex gap-1 mb-5">
                  {['Social Post', 'Newsletter', 'Display'].map((t, i) => (
                    <span
                      key={t}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        i === 0
                          ? 'bg-marigold-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Finished ad mock */}
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  {/* Image placeholder */}
                  <div className="h-36 bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-50 flex items-center justify-center relative">
                    <div className="text-center">
                      <div className="text-3xl mb-1">🎪</div>
                      <div className="text-xs font-medium text-amber-700/60">Community Event Photo</div>
                    </div>
                    {/* Format badge */}
                    <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-[9px] font-bold text-gray-500 px-2 py-0.5 rounded-full">1080 × 1080</span>
                  </div>
                  {/* Copy */}
                  <div className="p-4 space-y-2">
                    <div className="text-sm font-bold text-gray-900">Free flu shots this Saturday at Mission Rec Center</div>
                    <div className="text-xs text-gray-500 leading-relaxed">
                      Walk-ins welcome, 10am–4pm. Bring your whole family — all ages, all insurance. En español también.
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-teal-400 to-teal-600" />
                      <span className="text-[10px] font-semibold text-gray-400">SF Dept. of Public Health</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating channel indicators */}
            <div className="absolute -right-3 top-1/3 bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 text-[10px] font-semibold text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                3 formats ready
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

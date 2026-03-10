'use client';

import { ScrollReveal } from '../ScrollReveal';
import { useCityOptional } from '@/lib/geo/city-context';

export function CreateSection() {
  const cityCtx = useCityOptional();
  const prefix = cityCtx ? `/${cityCtx.slug}` : '';

  return (
    <section id="create" className="relative bg-warm-page py-24 md:py-32 px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        {/* Text column */}
        <ScrollReveal direction="left">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-marigold-500/10 text-marigold-500 text-sm font-bold">1</span>
            <span className="label text-marigold-500">Create</span>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold leading-tight text-gray-900 mb-5">
            Start with what you want to{' '}
            <span className="text-gradient-marigold">say.</span>
          </h2>
          <p className="text-slate-500 body-md leading-relaxed mb-8">
            Pick a template or start blank. Drop in your copy, upload a visual, and
            preview how it&apos;ll look across social, newsletter, and display — before
            you spend a dollar.
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

        {/* Builder mock */}
        <ScrollReveal direction="right" delay={0.15}>
          <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100 bg-white">
            {/* Mock toolbar */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50/80">
              <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
              <div className="ml-3 flex-1 h-5 rounded-full bg-gray-100" />
            </div>
            <div className="p-5 space-y-3">
              {/* Template choices */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Social Post', active: true, icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3" /></svg> },
                  { label: 'Newsletter', active: false, icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5" /></svg> },
                  { label: 'Display', active: false, icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" /></svg> },
                  { label: 'Blank', active: false, icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg> },
                ].map((t) => (
                  <div
                    key={t.label}
                    className={`rounded-xl p-3 text-center text-xs font-medium transition-all flex flex-col items-center gap-1.5 ${
                      t.active
                        ? 'bg-marigold-500/10 border-2 border-marigold-500/30 text-marigold-600'
                        : 'bg-gray-50 border-2 border-transparent text-gray-400'
                    }`}
                  >
                    {t.icon}
                    {t.label}
                  </div>
                ))}
              </div>
              {/* Input fields mock */}
              <div className="space-y-2 pt-2">
                <div className="h-9 rounded-lg bg-gray-50 border border-gray-100 px-3 flex items-center text-sm text-gray-400 font-medium">
                  Your headline here...
                </div>
                <div className="h-20 rounded-lg bg-gray-50 border border-gray-100 px-3 pt-2.5 text-xs text-gray-400">
                  Write your message...
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

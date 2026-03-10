'use client';

import { ScrollReveal } from '../ScrollReveal';
import { useCityOptional } from '@/lib/geo/city-context';

export function PowerModeStrip() {
  const cityCtx = useCityOptional();
  const prefix = cityCtx ? `/${cityCtx.slug}` : '';

  return (
    <section className="bg-warm-page py-14 px-4">
      <ScrollReveal>
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-5">
          <div>
            <h3 className="font-heading font-bold text-gray-900 text-lg mb-1">
              Know what you want?
            </h3>
            <p className="text-sm text-slate-500">
              Skip the walkthrough and jump straight in.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`${prefix}/advertise/select`}
              className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all hover:shadow-md"
            >
              Buy an Ad
            </a>
            <a
              href={`${prefix}/advertise/create`}
              className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
            >
              Open Builder
            </a>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

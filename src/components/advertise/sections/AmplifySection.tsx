'use client';

import { ScrollReveal } from '../ScrollReveal';
import { useCityOptional } from '@/lib/geo/city-context';

export function AmplifySection() {
  const cityCtx = useCityOptional();
  const prefix = cityCtx ? `/${cityCtx.slug}` : '';

  return (
    <section id="amplify" className="relative bg-warm-page py-24 md:py-32 px-4 overflow-hidden">
      {/* Decorative coral glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-coral-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Header */}
        <ScrollReveal className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-coral-500/10 text-coral-500 text-sm font-bold">3</span>
            <span className="label text-coral-500">Amplify</span>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold leading-tight text-gray-900 mb-5">
            Set your budget.{' '}
            <span className="text-coral-500">Launch.</span>
          </h2>
          <p className="text-slate-500 body-md max-w-lg mx-auto">
            Review your selections, see bulk pricing, and check out.
            Schedule a single post or a month of placements.
          </p>
        </ScrollReveal>

        {/* Centered showcase card */}
        <ScrollReveal direction="scale" delay={0.1}>
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Card header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-heading font-semibold text-gray-900">Order Summary</h3>
              <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">2 items</span>
            </div>

            {/* Line items */}
            <div className="divide-y divide-gray-50">
              {[
                { initials: 'ET', name: 'El Tecolote', price: '$19.00', grad: 'from-rose-500 to-rose-600' },
                { initials: 'BV', name: 'The Bay View', price: '$22.00', grad: 'from-emerald-500 to-emerald-600' },
              ].map((item) => (
                <div key={item.initials} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${item.grad} text-white flex items-center justify-center text-[10px] font-bold`}>
                      {item.initials}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                      <div className="text-xs text-gray-400">Social Post &times; 1</div>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900 tabular-nums text-sm">{item.price}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/50 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span className="tabular-nums">$41.00</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Platform fee (15%)</span>
                <span className="tabular-nums">$6.15</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                <span>Total</span>
                <span className="text-coral-500">$47.15</span>
              </div>
            </div>

            {/* CTA */}
            <div className="px-6 py-5">
              <a
                href={`${prefix}/advertise/amplify`}
                className="block w-full text-center bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-500 text-white font-bold py-3.5 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                Review &amp; Pay
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

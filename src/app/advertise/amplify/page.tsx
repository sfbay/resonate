'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Nav, Footer } from '@/components/shared';
import { useCityOptional } from '@/lib/geo/city-context';
import { formatCents, PLATFORM_FEE_RATE } from '@/lib/transactions/pricing';
import { getSupabaseClient } from '@/lib/db/supabase';

interface LineItem {
  publisherName: string;
  format: string;
  unitPrice: number;
  quantity: number;
}

export default function AmplifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-warm-page"><Nav variant="advertise" /><main className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-400">Loading...</main></div>}>
      <AmplifyPageInner />
    </Suspense>
  );
}

function AmplifyPageInner() {
  const cityCtx = useCityOptional();
  const prefix = cityCtx ? `/${cityCtx.slug}` : '';
  const searchParams = useSearchParams();
  const publisherIds = searchParams.get('publishers')?.split(',').filter(Boolean) || [];

  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (publisherIds.length === 0) {
      setLoading(false);
      return;
    }
    const supabase = getSupabaseClient();
    supabase
      .from('publishers')
      .select('id, name')
      .in('id', publisherIds)
      .then(({ data }) => {
        if (!data) { setLoading(false); return; }
        setLineItems(
          data.map((p: any) => ({
            publisherName: p.name,
            format: 'Social Post',
            unitPrice: 1900,
            quantity: 1,
          }))
        );
        setLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const subtotal = useMemo(() => lineItems.reduce((sum, li) => sum + li.unitPrice * li.quantity, 0), [lineItems]);
  const bulkDiscount = publisherIds.length >= 3 ? Math.round(subtotal * 0.1) : 0;
  const platformFee = Math.round((subtotal - bulkDiscount) * PLATFORM_FEE_RATE);
  const total = subtotal - bulkDiscount + platformFee;

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-page">
        <Nav variant="advertise" />
        <main className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-400">Loading...</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-page">
      <Nav variant="advertise" />

      {/* Page header */}
      <div className="relative bg-radiance hero-texture overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto px-4 pt-24 pb-16 text-white">
          <p className="label text-coral-400 mb-3">Step 03</p>
          <h1 className="display-md mb-3">Review & Launch</h1>
          <p className="text-gray-400 text-lg max-w-lg">
            Confirm your selections and complete your purchase.
          </p>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-10">
        {lineItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
            </div>
            <p className="text-gray-500 mb-4 text-lg">No publishers selected yet.</p>
            <a href={`${prefix}/advertise/select`} className="text-teal-600 font-semibold hover:underline inline-flex items-center gap-1.5">
              Browse publishers
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden border-glow">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-heading font-semibold text-gray-900">Order Summary</h2>
              <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                {lineItems.length} item{lineItems.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Line items */}
            <div className="divide-y divide-gray-50">
              {lineItems.map((li, i) => (
                <div key={i} className="px-6 py-4 flex justify-between items-center animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                      {li.publisherName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{li.publisherName}</div>
                      <div className="text-xs text-gray-500">{li.format} × {li.quantity}</div>
                    </div>
                  </div>
                  <div className="font-semibold text-gray-900 tabular-nums">
                    {formatCents(li.unitPrice * li.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing breakdown */}
            <div className="px-6 py-5 border-t border-gray-100 space-y-2.5 bg-gray-50/50">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatCents(subtotal)}</span>
              </div>
              {bulkDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span className="flex items-center gap-1.5">
                    Bulk discount
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">3+ publishers · -10%</span>
                  </span>
                  <span className="tabular-nums">-{formatCents(bulkDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-500">
                <span>Platform fee (15%)</span>
                <span className="tabular-nums">{formatCents(platformFee)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                <span>Total</span>
                <span className="text-gradient-marigold">{formatCents(total)}</span>
              </div>
            </div>

            {/* CTA */}
            <div className="px-6 py-5">
              <button
                className="w-full bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-500 text-white font-bold py-3.5 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 animate-pulse-glow"
                onClick={() => {/* Payment integration coming soon */}}
              >
                Amplify Now — {formatCents(total)}
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">
                Secure checkout powered by Stripe
              </p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

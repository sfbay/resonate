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
    <Suspense fallback={<div className="min-h-screen bg-gray-50"><Nav variant="advertise" /><main className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-400">Loading...</main></div>}>
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
      <div className="min-h-screen bg-gray-50">
        <Nav variant="advertise" />
        <main className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-400">Loading...</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav variant="advertise" />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">Review & Launch</h1>
        <p className="text-gray-500 mb-8">Confirm your selections and complete your purchase.</p>

        {lineItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-gray-400 mb-4">No publishers selected yet.</p>
            <a href={`${prefix}/advertise/select`} className="text-teal-600 font-semibold hover:underline">
              Browse publishers →
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Order Summary</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {lineItems.map((li, i) => (
                <div key={i} className="px-6 py-4 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">{li.publisherName}</div>
                    <div className="text-xs text-gray-500">{li.format} × {li.quantity}</div>
                  </div>
                  <div className="font-semibold text-gray-900">
                    {formatCents(li.unitPrice * li.quantity)}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{formatCents(subtotal)}</span>
              </div>
              {bulkDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>
                    Bulk discount (3+ publishers)
                    <span className="ml-1 bg-green-100 text-green-700 text-xs font-bold px-1.5 py-0.5 rounded-full">-10%</span>
                  </span>
                  <span>-{formatCents(bulkDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-500">
                <span>Platform fee (15%)</span>
                <span>{formatCents(platformFee)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-coral-600">{formatCents(total)}</span>
              </div>
            </div>
            <div className="px-6 py-4">
              <button
                className="w-full bg-coral-500 hover:bg-coral-600 text-white font-bold py-3 rounded-xl transition-colors"
                onClick={() => {/* Payment integration coming soon */}}
              >
                Amplify Now — {formatCents(total)}
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

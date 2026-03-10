'use client';

import { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Nav, Footer } from '@/components/shared';

export default function PublisherDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-warm-page"><Nav variant="advertise" /><main className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-400">Loading...</main></div>}>
      <PublisherDetailPageInner />
    </Suspense>
  );
}

function PublisherDetailPageInner() {
  const { publisherId } = useParams<{ publisherId: string }>();
  const searchParams = useSearchParams();
  const isQuickBuy = searchParams.get('quick') === 'true';

  return (
    <div className="min-h-screen bg-warm-page">
      <Nav variant="advertise" />
      <div className="relative bg-radiance hero-texture overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-24 pb-16 text-white">
          <p className="label text-teal-400 mb-3">{isQuickBuy ? 'Quick Buy' : 'Publisher Profile'}</p>
          <h1 className="display-md mb-3">
            {isQuickBuy ? 'Quick Buy' : 'Publisher Detail'}
          </h1>
          <p className="text-gray-400 text-lg">
            {isQuickBuy ? 'Streamlined single-publisher checkout — coming soon.' : 'Full publisher profile and rate card — coming soon.'}
          </p>
        </div>
      </div>
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-sm border-glow">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-teal-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></svg>
          </div>
          <p className="text-gray-500">
            Publisher ID: <code className="text-xs bg-gray-50 px-2 py-1 rounded font-mono">{publisherId}</code>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

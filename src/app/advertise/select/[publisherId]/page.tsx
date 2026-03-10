'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { Nav, Footer } from '@/components/shared';

export default function PublisherDetailPage() {
  const { publisherId } = useParams<{ publisherId: string }>();
  const searchParams = useSearchParams();
  const isQuickBuy = searchParams.get('quick') === 'true';

  return (
    <div className="min-h-screen bg-white">
      <Nav variant="advertise" />
      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">
          {isQuickBuy ? 'Quick Buy' : 'Publisher Detail'}
        </h1>
        <p className="text-gray-500">
          Publisher ID: {publisherId}
          {isQuickBuy && ' — Quick-buy flow coming soon.'}
        </p>
      </main>
      <Footer />
    </div>
  );
}

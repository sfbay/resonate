'use client';

import { Nav, Footer } from '@/components/shared';

export default function QuickBuyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav variant="advertise" />
      <main className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">Quick Buy</h1>
        <p className="text-gray-500">Streamlined single-publisher checkout — coming soon.</p>
      </main>
      <Footer />
    </div>
  );
}

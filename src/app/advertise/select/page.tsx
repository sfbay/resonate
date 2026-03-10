'use client';

import { Nav, Footer } from '@/components/shared';

export default function SelectPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav variant="advertise" />
      <main className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 font-heading">
          Choose Your Channels
        </h1>
        <p className="mt-4 text-gray-500">Coming soon — channel selection module.</p>
      </main>
      <Footer variant="advertise" />
    </div>
  );
}

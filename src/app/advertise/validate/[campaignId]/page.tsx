'use client';

import { useParams } from 'next/navigation';
import { Nav, Footer } from '@/components/shared';

export default function CampaignDetailPage() {
  const { campaignId } = useParams<{ campaignId: string }>();

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav variant="advertise" />
      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">Campaign Detail</h1>
        <p className="text-gray-500">Campaign: {campaignId} — detailed analytics coming soon.</p>
      </main>
      <Footer />
    </div>
  );
}

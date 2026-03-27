'use client';

import Link from 'next/link';
import { CityHistoryViewer } from '@/components/publisher/city-history/CityHistoryViewer';
import { useCityOptional } from '@/lib/geo/city-context';
import { useRecordVisit } from '@/lib/navigation/use-record-visit';

// TODO: Replace with real publisher context from auth
const DEMO_PUBLISHER_ID = '11111111-1111-1111-1111-111111111101';
const DEMO_PUBLISHER_NAME = 'El Tecolote';

export default function CityHistoryPage() {
  useRecordVisit();
  const cityCtx = useCityOptional();
  const prefix = cityCtx ? `/${cityCtx.slug}` : '';

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-charcoal text-white px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href={`${prefix}/publisher/dashboard`}
            className="text-coral-300 hover:text-coral-200 text-sm mb-3 inline-block"
          >
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold font-display">City History</h1>
          <p className="text-slate-300 mt-1 text-sm">
            Your complete transaction record with the City &amp; County of San Francisco.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <CityHistoryViewer
          publisherId={DEMO_PUBLISHER_ID}
          publisherName={DEMO_PUBLISHER_NAME}
        />
      </div>
    </div>
  );
}

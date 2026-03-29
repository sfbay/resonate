'use client';

import Link from 'next/link';
import { CityHistoryViewer } from '@/components/publisher/city-history/CityHistoryViewer';
import { useCityOptional } from '@/lib/geo/city-context';
import { useRecordVisit } from '@/lib/navigation/use-record-visit';
import { usePublisherIdentity } from '@/hooks/use-publisher-identity';

export default function CityHistoryPage() {
  useRecordVisit();
  const cityCtx = useCityOptional();
  const prefix = cityCtx ? `/${cityCtx.slug}` : '';
  const { publisherId, publisherName, isLoading } = usePublisherIdentity();

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
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-coral-200 border-t-coral-500 rounded-full animate-spin" />
          </div>
        ) : (
          <CityHistoryViewer
            publisherId={publisherId ?? ''}
            publisherName={publisherName ?? 'Your Publication'}
          />
        )}
      </div>
    </div>
  );
}

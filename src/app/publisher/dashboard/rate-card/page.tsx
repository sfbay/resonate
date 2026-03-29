'use client';

import Link from 'next/link';
import { OfferingsEditor } from '@/components/publisher/offerings/OfferingsEditor';
import { getDemoOfferings } from '@/lib/demo/publisher-data';
import { useCityOptional } from '@/lib/geo/city-context';
import { useRecordVisit } from '@/lib/navigation/use-record-visit';
import { usePublisherIdentity } from '@/hooks/use-publisher-identity';

export default function OfferingsPage() {
  useRecordVisit();
  const cityCtx = useCityOptional();
  const prefix = cityCtx ? `/${cityCtx.slug}` : '';
  const { publisherName } = usePublisherIdentity();

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
          <h1 className="text-2xl font-bold font-display">Our Offerings</h1>
          <p className="text-slate-300 mt-1 text-sm">
            What advertisers see when they choose you. Your menu of ad placements across every channel.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <OfferingsEditor
          initialOfferings={getDemoOfferings()}
          publisherName={publisherName ?? 'Your Publication'}
        />
      </div>
    </div>
  );
}

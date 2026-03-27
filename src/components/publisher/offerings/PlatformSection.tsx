'use client';

import { PLATFORM_LABELS } from '@/lib/transactions/pricing';
import { OfferingCard, type Offering } from './OfferingCard';
import type { SocialPlatform } from '@/types';

const PLATFORM_ICONS: Partial<Record<SocialPlatform, string>> = {
  instagram: 'IG',
  facebook: 'FB',
  tiktok: 'TK',
  newsletter: 'NL',
  website: 'WEB',
  other: 'WA',
};

interface Props {
  platform: SocialPlatform;
  offerings: Offering[];
  onRemove: (index: number) => void;
  onUpdate: (index: number, updated: Offering) => void;
}

export function PlatformSection({ platform, offerings, onRemove, onUpdate }: Props) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-8 h-8 bg-coral-100 text-coral-600 rounded-lg flex items-center justify-center text-xs font-bold">
          {PLATFORM_ICONS[platform] ?? '?'}
        </span>
        <h3 className="text-lg font-semibold text-slate-800">
          {PLATFORM_LABELS[platform]}
        </h3>
        <span className="text-xs text-slate-400 ml-auto">
          {offerings.length} offering{offerings.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {offerings.map((offering, i) => (
          <OfferingCard
            key={`${offering.deliverableType}-${offering.platform}-${i}`}
            offering={offering}
            onRemove={() => onRemove(i)}
            onUpdate={(updated) => onUpdate(i, updated)}
          />
        ))}
      </div>
    </div>
  );
}

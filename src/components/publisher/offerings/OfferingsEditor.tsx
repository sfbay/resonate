'use client';

import { useState, useMemo } from 'react';
import { PlatformSection } from './PlatformSection';
import type { Offering } from './OfferingCard';
import type { SocialPlatform, DeliverableType } from '@/types';
import {
  DELIVERABLE_TYPE_LABELS,
  PLATFORM_LABELS,
  PLATFORM_DELIVERABLE_TYPES,
  SUGGESTED_RATES,
} from '@/lib/transactions/pricing';

const CHANNEL_ORDER: SocialPlatform[] = [
  'instagram', 'facebook', 'newsletter', 'website', 'tiktok', 'other',
];

interface Props {
  initialOfferings: Offering[];
  publisherName: string;
}

export function OfferingsEditor({ initialOfferings, publisherName }: Props) {
  const [offerings, setOfferings] = useState<Offering[]>(initialOfferings);
  const [isAdding, setIsAdding] = useState(false);
  const [newPlatform, setNewPlatform] = useState<SocialPlatform>('instagram');
  const [newType, setNewType] = useState<DeliverableType>('sponsored_post');
  const [savedMsg, setSavedMsg] = useState('');

  const grouped = useMemo(() => {
    const map = new Map<SocialPlatform, { offerings: Offering[]; indices: number[] }>();
    offerings.forEach((o, i) => {
      const existing = map.get(o.platform) || { offerings: [], indices: [] };
      existing.offerings.push(o);
      existing.indices.push(i);
      map.set(o.platform, existing);
    });
    const sorted: { platform: SocialPlatform; offerings: Offering[]; indices: number[] }[] = [];
    for (const p of CHANNEL_ORDER) {
      const data = map.get(p);
      if (data) sorted.push({ platform: p, ...data });
    }
    return sorted;
  }, [offerings]);

  const handleRemove = (globalIndex: number) => {
    setOfferings((prev) => prev.filter((_, i) => i !== globalIndex));
  };

  const handleUpdate = (globalIndex: number, updated: Offering) => {
    setOfferings((prev) => prev.map((o, i) => (i === globalIndex ? updated : o)));
  };

  const handleAdd = () => {
    const suggested = SUGGESTED_RATES[newType];
    setOfferings((prev) => [
      ...prev,
      {
        deliverableType: newType,
        platform: newPlatform,
        price: suggested?.mid ?? 15000,
        description: '',
        reachEstimate: '',
        turnaround: '',
        specs: '',
      },
    ]);
    setIsAdding(false);
  };

  const handleSave = () => {
    setSavedMsg('Offerings saved!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-slate-600 text-sm">
          This is what advertisers see when they choose <span className="font-semibold">{publisherName}</span>.
          Each offering shows what they get, what it costs, and how many people it reaches.
        </p>
      </div>

      {grouped.map(({ platform, offerings: platOfferings, indices }) => (
        <PlatformSection
          key={platform}
          platform={platform}
          offerings={platOfferings}
          onRemove={(localIdx) => handleRemove(indices[localIdx])}
          onUpdate={(localIdx, updated) => handleUpdate(indices[localIdx], updated)}
        />
      ))}

      {isAdding ? (
        <div className="bg-coral-50 rounded-xl p-5 border border-coral-200 space-y-3">
          <h4 className="text-sm font-semibold text-slate-700">Add an Offering</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Channel</label>
              <select
                value={newPlatform}
                onChange={(e) => {
                  const p = e.target.value as SocialPlatform;
                  setNewPlatform(p);
                  const types = PLATFORM_DELIVERABLE_TYPES[p];
                  if (types && !types.includes(newType)) setNewType(types[0]);
                }}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              >
                {Object.entries(PLATFORM_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Format</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as DeliverableType)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              >
                {(PLATFORM_DELIVERABLE_TYPES[newPlatform] ?? []).map((t) => (
                  <option key={t} value={t}>{DELIVERABLE_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setIsAdding(false)} className="text-sm text-slate-500 px-3 py-1.5">Cancel</button>
            <button onClick={handleAdd} className="text-sm bg-coral-500 text-white px-4 py-1.5 rounded-lg hover:bg-coral-600">Add</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-coral-300 hover:text-coral-600 transition-colors"
        >
          + Add an Offering
        </button>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        {savedMsg ? (
          <span className="text-sm text-emerald-600 font-medium">{savedMsg}</span>
        ) : (
          <span className="text-xs text-slate-400">Changes are saved to your profile.</span>
        )}
        <button
          onClick={handleSave}
          className="bg-coral-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-coral-600 transition-colors"
        >
          Save Offerings
        </button>
      </div>
    </div>
  );
}

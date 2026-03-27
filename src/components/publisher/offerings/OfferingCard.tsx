'use client';

import { useState } from 'react';
import { DELIVERABLE_TYPE_LABELS, PLATFORM_LABELS, formatCents } from '@/lib/transactions/pricing';
import type { DeliverableType, SocialPlatform } from '@/types';

export interface Offering {
  deliverableType: DeliverableType;
  platform: SocialPlatform;
  price: number; // cents
  description?: string;
  reachEstimate?: string;
  turnaround?: string;
  specs?: string;
}

interface Props {
  offering: Offering;
  onRemove: () => void;
  onUpdate: (updated: Offering) => void;
}

export function OfferingCard({ offering, onRemove, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(offering);

  const handleSave = () => {
    onUpdate(draft);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl p-5 border-2 border-coral-300 shadow-md space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Price</label>
            <input
              type="number"
              value={draft.price / 100}
              onChange={(e) => setDraft({ ...draft, price: Math.round(parseFloat(e.target.value) * 100) || 0 })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              step="5"
              min="0"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Turnaround</label>
            <input
              type="text"
              value={draft.turnaround ?? ''}
              onChange={(e) => setDraft({ ...draft, turnaround: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              placeholder="e.g., 3-5 days"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">Description</label>
          <textarea
            value={draft.description ?? ''}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            rows={2}
            placeholder="What does the advertiser get?"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Estimated Reach</label>
            <input
              type="text"
              value={draft.reachEstimate ?? ''}
              onChange={(e) => setDraft({ ...draft, reachEstimate: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              placeholder="e.g., 5,200 followers"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Specs</label>
            <input
              type="text"
              value={draft.specs ?? ''}
              onChange={(e) => setDraft({ ...draft, specs: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              placeholder="e.g., 1080x1080, bilingual"
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setIsEditing(false)} className="text-sm text-slate-500 px-3 py-1.5">Cancel</button>
          <button onClick={handleSave} className="text-sm bg-coral-500 text-white px-4 py-1.5 rounded-lg hover:bg-coral-600">Save</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:border-coral-200 transition-colors group">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-slate-800">
            {DELIVERABLE_TYPE_LABELS[offering.deliverableType]}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            {PLATFORM_LABELS[offering.platform]}
          </p>
        </div>
        <p className="text-xl font-bold text-coral-600">{formatCents(offering.price)}</p>
      </div>

      {offering.description && (
        <p className="text-sm text-slate-600 mt-3">{offering.description}</p>
      )}

      <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-400">
        {offering.reachEstimate && (
          <span>Reach: <span className="text-slate-600">{offering.reachEstimate}</span></span>
        )}
        {offering.turnaround && (
          <span>Turnaround: <span className="text-slate-600">{offering.turnaround}</span></span>
        )}
        {offering.specs && (
          <span>Specs: <span className="text-slate-600">{offering.specs}</span></span>
        )}
      </div>

      <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setIsEditing(true)} className="text-xs text-coral-500 hover:underline">Edit</button>
        <button onClick={onRemove} className="text-xs text-red-400 hover:underline">Remove</button>
      </div>
    </div>
  );
}

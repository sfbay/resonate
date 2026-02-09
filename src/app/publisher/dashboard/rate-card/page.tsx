'use client';

/**
 * Publisher Rate Card Builder
 *
 * Interactive editor for publishers to set their per-deliverable pricing.
 * This is the "Become Buyable" step — setting up the rate card makes
 * a publisher visible to advertisers and government campaigns.
 *
 * DEMO: Powered by mock data from src/lib/demo/publisher-data.ts
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { getDemoRateCard } from '@/lib/demo/publisher-data';
import {
  DELIVERABLE_TYPE_LABELS,
  PLATFORM_LABELS,
  PLATFORM_DELIVERABLE_TYPES,
  SUGGESTED_RATES,
  formatCents,
  PLATFORM_FEE_RATE,
} from '@/lib/transactions/pricing';
import type { RateCard, Rate, DeliverableType, SocialPlatform } from '@/types';

export default function RateCardPage() {
  const [rateCard, setRateCard] = useState<RateCard>(getDemoRateCard());
  const [isAdding, setIsAdding] = useState(false);
  const [newRate, setNewRate] = useState<Partial<Rate>>({
    platform: 'instagram',
    deliverableType: 'sponsored_post',
    price: 15000,
  });
  const [savedMessage, setSavedMessage] = useState('');

  // Group rates by platform for display
  const ratesByPlatform = useMemo(() => {
    const grouped = new Map<SocialPlatform, Rate[]>();
    rateCard.rates.forEach(rate => {
      const existing = grouped.get(rate.platform) || [];
      existing.push(rate);
      grouped.set(rate.platform, existing);
    });
    return grouped;
  }, [rateCard]);

  const handleRemoveRate = (index: number) => {
    setRateCard(prev => ({
      ...prev,
      rates: prev.rates.filter((_, i) => i !== index),
    }));
  };

  const handleAddRate = () => {
    if (!newRate.deliverableType || !newRate.platform || !newRate.price) return;

    setRateCard(prev => ({
      ...prev,
      rates: [
        ...prev.rates,
        {
          deliverableType: newRate.deliverableType!,
          platform: newRate.platform!,
          price: newRate.price!,
          description: newRate.description,
        },
      ],
    }));
    setIsAdding(false);
    setNewRate({ platform: 'instagram', deliverableType: 'sponsored_post', price: 15000 });
  };

  const handleSave = () => {
    setSavedMessage('Rate card saved successfully!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const availableTypes = PLATFORM_DELIVERABLE_TYPES[newRate.platform as SocialPlatform] || [];

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link href="/publisher/dashboard" className="text-sm text-slate-400 hover:text-coral-500">
                Dashboard
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-sm font-medium text-slate-700">Rate Card</span>
            </div>
            <h1 className="text-2xl font-semibold text-[var(--color-charcoal)] font-[family-name:var(--font-display)]">
              Rate Card Builder
            </h1>
            <p className="text-slate-500 mt-1">Set your pricing for each deliverable type. Advertisers see these rates when matching with your publication.</p>
          </div>
          <div className="flex items-center gap-3">
            {savedMessage && (
              <span className="text-sm text-emerald-600 font-medium">{savedMessage}</span>
            )}
            <button
              onClick={handleSave}
              className="btn btn-coral text-sm px-5 py-2.5"
            >
              Save Rate Card
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Platform Fee Notice */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-marigold-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-marigold-500 text-sm font-bold">%</span>
            </div>
            <div>
              <p className="font-medium text-[var(--color-charcoal)]">How pricing works</p>
              <p className="text-sm text-slate-500 mt-1">
                You keep 100% of your listed rate. Resonate adds a {(PLATFORM_FEE_RATE * 100)}% service fee on top, charged to the advertiser.
                For example, if you set a rate of {formatCents(15000)}, you receive {formatCents(15000)} — the advertiser pays {formatCents(15000 + Math.round(15000 * PLATFORM_FEE_RATE))}.
              </p>
            </div>
          </div>
        </div>

        {/* Rate Cards by Platform */}
        {Array.from(ratesByPlatform.entries()).map(([platform, rates]) => (
          <section key={platform} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-gray-100">
              <h2 className="font-semibold text-[var(--color-charcoal)]">{PLATFORM_LABELS[platform]}</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {rates.map((rate, idx) => {
                const globalIndex = rateCard.rates.indexOf(rate);
                return (
                  <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-[var(--color-charcoal)]">
                        {DELIVERABLE_TYPE_LABELS[rate.deliverableType]}
                      </p>
                      {rate.description && (
                        <p className="text-sm text-slate-500 mt-0.5">{rate.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold text-[var(--color-charcoal)] text-lg">{formatCents(rate.price)}</p>
                        <p className="text-xs text-slate-400">You keep 100%</p>
                      </div>
                      <button
                        onClick={() => handleRemoveRate(globalIndex)}
                        className="text-slate-300 hover:text-red-400 transition-colors"
                        title="Remove rate"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* Add New Rate */}
        {isAdding ? (
          <section className="bg-white rounded-xl shadow-sm border-2 border-coral-500/20 p-6">
            <h3 className="font-semibold text-[var(--color-charcoal)] mb-4">Add New Rate</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Platform</label>
                <select
                  value={newRate.platform}
                  onChange={(e) => setNewRate(prev => ({ ...prev, platform: e.target.value as SocialPlatform }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[var(--color-charcoal)] bg-white"
                >
                  {Object.entries(PLATFORM_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Deliverable Type</label>
                <select
                  value={newRate.deliverableType}
                  onChange={(e) => setNewRate(prev => ({ ...prev, deliverableType: e.target.value as DeliverableType }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[var(--color-charcoal)] bg-white"
                >
                  {availableTypes.map(type => (
                    <option key={type} value={type}>{DELIVERABLE_TYPE_LABELS[type]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Price
                  {newRate.deliverableType && (
                    <span className="font-normal text-slate-400 ml-2">
                      Suggested: {formatCents(SUGGESTED_RATES[newRate.deliverableType as DeliverableType]?.low || 0)} – {formatCents(SUGGESTED_RATES[newRate.deliverableType as DeliverableType]?.high || 0)}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                  <input
                    type="number"
                    value={(newRate.price || 0) / 100}
                    onChange={(e) => setNewRate(prev => ({ ...prev, price: Math.round(parseFloat(e.target.value) * 100) }))}
                    className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-[var(--color-charcoal)]"
                    min="0"
                    step="5"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Description (optional)</label>
                <input
                  type="text"
                  value={newRate.description || ''}
                  onChange={(e) => setNewRate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g., Includes one round of revisions"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[var(--color-charcoal)]"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleAddRate} className="btn btn-coral text-sm px-5 py-2">Add Rate</button>
              <button onClick={() => setIsAdding(false)} className="btn btn-outline text-sm px-5 py-2 text-slate-500 border-slate-200">Cancel</button>
            </div>
          </section>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-slate-400 hover:text-coral-500 hover:border-coral-500/30 transition-colors font-medium"
          >
            + Add New Rate
          </button>
        )}

        {/* Notes */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-[var(--color-charcoal)] mb-3">Rate Card Notes</h3>
          <textarea
            value={rateCard.notes || ''}
            onChange={(e) => setRateCard(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[var(--color-charcoal)] text-sm resize-none"
            placeholder="Add any notes about your pricing, turnaround times, volume discounts, etc."
          />
        </section>
      </main>
    </div>
  );
}

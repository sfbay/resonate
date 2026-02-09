'use client';

/**
 * Publisher Content Guidelines & Capacity
 *
 * Publishers set editorial guidelines, turnaround times, availability,
 * blackout dates, and revision/cancellation policies.
 *
 * DEMO: Powered by mock data from src/lib/demo/publisher-data.ts
 */

import { useState } from 'react';
import Link from 'next/link';
import { getDemoContentGuidelines, type ContentGuidelines } from '@/lib/demo/publisher-data';

export default function GuidelinesPage() {
  const [guidelines, setGuidelines] = useState<ContentGuidelines>(getDemoContentGuidelines());
  const [savedMessage, setSavedMessage] = useState('');

  const handleSave = () => {
    setSavedMessage('Guidelines saved!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link href="/publisher/dashboard" className="text-sm text-slate-400 hover:text-coral-500">Dashboard</Link>
              <span className="text-slate-300">/</span>
              <span className="text-sm font-medium text-slate-700">Guidelines</span>
            </div>
            <h1 className="text-2xl font-semibold text-[var(--color-charcoal)] font-[family-name:var(--font-display)]">
              Content Guidelines & Capacity
            </h1>
            <p className="text-slate-500 mt-1">Set expectations for advertisers about your editorial standards and availability.</p>
          </div>
          <div className="flex items-center gap-3">
            {savedMessage && <span className="text-sm text-emerald-600 font-medium">{savedMessage}</span>}
            <button onClick={handleSave} className="btn btn-coral text-sm px-5 py-2.5">Save</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Editorial Guidelines */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-[var(--color-charcoal)] text-lg mb-3">Editorial Guidelines</h2>
          <p className="text-sm text-slate-500 mb-3">Describe your editorial standards for sponsored content. Advertisers see this before placing orders.</p>
          <textarea
            value={guidelines.editorialGuidelines}
            onChange={(e) => setGuidelines(prev => ({ ...prev, editorialGuidelines: e.target.value }))}
            rows={5}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[var(--color-charcoal)] text-sm resize-none"
          />
        </section>

        {/* Turnaround Times */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-[var(--color-charcoal)] text-lg mb-4">Turnaround Times</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { key: 'social' as const, label: 'Social Media', desc: 'Posts, stories, reels' },
              { key: 'newsletter' as const, label: 'Newsletter', desc: 'Features & dedicated sends' },
              { key: 'website' as const, label: 'Website', desc: 'Sponsored articles' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="p-4 bg-slate-50 rounded-lg">
                <p className="font-medium text-[var(--color-charcoal)]">{label}</p>
                <p className="text-xs text-slate-400 mb-2">{desc}</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={guidelines.turnaroundDays[key]}
                    onChange={(e) => setGuidelines(prev => ({
                      ...prev,
                      turnaroundDays: { ...prev.turnaroundDays, [key]: parseInt(e.target.value) || 0 },
                    }))}
                    className="w-16 px-2 py-1 border border-gray-200 rounded text-center text-[var(--color-charcoal)]"
                    min="1"
                    max="30"
                  />
                  <span className="text-sm text-slate-500">business days</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Capacity */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-[var(--color-charcoal)] text-lg mb-3">Order Capacity</h2>
          <p className="text-sm text-slate-500 mb-4">Maximum number of active orders you can handle simultaneously.</p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={guidelines.maxConcurrentOrders}
              onChange={(e) => setGuidelines(prev => ({ ...prev, maxConcurrentOrders: parseInt(e.target.value) || 1 }))}
              className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-center text-[var(--color-charcoal)] text-lg font-medium"
              min="1"
              max="20"
            />
            <span className="text-slate-500">concurrent orders</span>
          </div>
        </section>

        {/* Languages */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-[var(--color-charcoal)] text-lg mb-3">Languages Available</h2>
          <p className="text-sm text-slate-500 mb-4">Languages you can create sponsored content in.</p>
          <div className="flex flex-wrap gap-2">
            {['english', 'spanish', 'chinese_cantonese', 'chinese_mandarin', 'tagalog', 'vietnamese', 'korean', 'russian', 'japanese', 'arabic'].map(lang => {
              const isActive = guidelines.languages.includes(lang);
              const label = lang.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
              return (
                <button
                  key={lang}
                  onClick={() => {
                    setGuidelines(prev => ({
                      ...prev,
                      languages: isActive
                        ? prev.languages.filter(l => l !== lang)
                        : [...prev.languages, lang],
                    }));
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-coral-500 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Blackout Dates */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-[var(--color-charcoal)] text-lg mb-3">Blackout Dates</h2>
          <p className="text-sm text-slate-500 mb-4">Dates when you cannot accept or deliver orders (e.g., editorial coverage priorities).</p>
          <div className="space-y-3">
            {guidelines.blackoutDates.map((date, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-[var(--color-charcoal)]">{date.start}</span>
                {date.start !== date.end && (
                  <>
                    <span className="text-slate-300">—</span>
                    <span className="text-sm font-medium text-[var(--color-charcoal)]">{date.end}</span>
                  </>
                )}
                <span className="text-sm text-slate-500 flex-1">{date.reason}</span>
                <button
                  onClick={() => setGuidelines(prev => ({
                    ...prev,
                    blackoutDates: prev.blackoutDates.filter((_, i) => i !== idx),
                  }))}
                  className="text-slate-300 hover:text-red-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Policies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-[var(--color-charcoal)] text-lg mb-3">Revision Policy</h2>
            <textarea
              value={guidelines.revisionPolicy}
              onChange={(e) => setGuidelines(prev => ({ ...prev, revisionPolicy: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[var(--color-charcoal)] text-sm resize-none"
            />
          </section>
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-[var(--color-charcoal)] text-lg mb-3">Cancellation Policy</h2>
            <textarea
              value={guidelines.cancellationPolicy}
              onChange={(e) => setGuidelines(prev => ({ ...prev, cancellationPolicy: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[var(--color-charcoal)] text-sm resize-none"
            />
          </section>
        </div>
      </main>
    </div>
  );
}

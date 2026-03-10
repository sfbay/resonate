'use client';

import { Nav, Footer } from '@/components/shared';
import { PathwayHero } from '@/components/advertise/PathwayHero';
import { ModulePreview } from '@/components/advertise/ModulePreview';
import { TwoTracks } from '@/components/advertise/TwoTracks';

export default function AdvertiseLanding() {
  return (
    <div className="min-h-screen">
      <Nav variant="advertise" />
      <PathwayHero />

      {/* ── CREATE ── */}
      <ModulePreview
        id="create" number="01" label="Create"
        title={<>Start with what you want to <span className="text-gradient-marigold">say.</span></>}
        body="Pick a template or start blank. Drop in your copy, upload a visual, and preview how it'll look across social, newsletter, and display — before you spend a dollar."
        ctaLabel="Open the Builder →" ctaPath="/advertise/create"
        variant="light"
      >
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: '📱', label: 'Social Post', active: true },
              { icon: '📰', label: 'Newsletter', active: false },
              { icon: '🖼️', label: 'Display', active: false },
              { icon: '✨', label: 'Blank', active: false },
            ].map((t) => (
              <div
                key={t.label}
                className={`rounded-lg p-3 text-center text-xs font-medium transition-all ${
                  t.active
                    ? 'bg-marigold-500/10 border-2 border-marigold-500/30 text-marigold-600'
                    : 'bg-gray-50 border-2 border-transparent text-gray-500'
                }`}
              >
                <span className="block text-base mb-1">{t.icon}</span>
                {t.label}
              </div>
            ))}
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-8 rounded-lg bg-gray-50 border border-gray-100 px-3 flex items-center text-xs text-gray-400">
              Your headline here...
            </div>
            <div className="h-16 rounded-lg bg-gray-50 border border-gray-100 px-3 pt-2 text-xs text-gray-400">
              Write your message...
            </div>
          </div>
        </div>
      </ModulePreview>

      {/* ── SELECT ── */}
      <ModulePreview
        id="select" number="02" label="Select"
        title={<>Pick the voices your audience <span className="text-teal-400">trusts.</span></>}
        body="Browse local publishers by neighborhood, language, and reach. See real-time availability and transparent pricing."
        ctaLabel="Explore Publishers →" ctaPath="/advertise/select"
        variant="dark" reverse
      >
        <div className="p-5 space-y-2">
          {/* Search bar mock */}
          <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2 mb-3">
            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            <span className="text-xs text-gray-500">Filter by name or neighborhood...</span>
          </div>
          {[
            { initials: 'ET', name: 'El Tecolote', area: 'Mission · 12.4K reach', price: '$19', grad: 'from-rose-500 to-rose-600' },
            { initials: 'ML', name: 'Mission Local', area: 'Mission · 8.2K reach', price: '$25', grad: 'from-sky-500 to-sky-600' },
            { initials: 'BV', name: 'The Bay View', area: 'Bayview · 15.1K reach', price: '$22', grad: 'from-emerald-500 to-emerald-600', selected: true },
          ].map((p) => (
            <div key={p.initials} className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${p.selected ? 'bg-teal-500/10 border border-teal-500/30' : 'bg-white/5 border border-transparent'}`}>
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${p.grad} text-white flex items-center justify-center text-[10px] font-bold shadow-sm`}>{p.initials}</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">{p.name}</div>
                <div className="text-[11px] text-gray-400">{p.area}</div>
              </div>
              <div className="text-sm font-bold text-teal-400">{p.price}</div>
              {p.selected && (
                <div className="w-4 h-4 rounded bg-teal-500 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </ModulePreview>

      {/* ── AMPLIFY ── */}
      <ModulePreview
        id="amplify" number="03" label="Amplify"
        title={<>Set your budget. <span className="text-coral-500">Launch.</span></>}
        body="Review your selections, see bulk pricing, and check out. Schedule a single post or a month of placements."
        ctaLabel="Review & Pay →" ctaPath="/advertise/amplify"
        variant="light"
      >
        <div className="p-5 space-y-3 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-[8px] font-bold text-white">ET</div>
                <span className="text-gray-600 font-medium">El Tecolote</span>
              </div>
              <span className="font-semibold tabular-nums">$19.00</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-[8px] font-bold text-white">BV</div>
                <span className="text-gray-600 font-medium">The Bay View</span>
              </div>
              <span className="font-semibold tabular-nums">$22.00</span>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-2 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Subtotal</span>
              <span className="tabular-nums">$41.00</span>
            </div>
            <div className="flex justify-between text-xs text-green-600">
              <span className="flex items-center gap-1">Bulk discount <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1 py-0.5 rounded">-10%</span></span>
              <span className="tabular-nums">-$4.10</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Platform fee</span>
              <span className="tabular-nums">$5.54</span>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-base">
            <span>Total</span>
            <span className="text-coral-600">$42.44</span>
          </div>
        </div>
      </ModulePreview>

      {/* ── VALIDATE ── */}
      <ModulePreview
        id="validate" number="04" label="Validate"
        title={<>See what <span className="text-gradient-marigold">landed.</span></>}
        body="Real-time dashboards show impressions, clicks, and engagement across every publisher. Duplicate and redeploy winning campaigns."
        ctaLabel="View Dashboard →" ctaPath="/advertise/validate"
        variant="dark" reverse
      >
        <div className="p-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: '47.2K', label: 'Impressions', color: 'text-marigold-400' },
              { value: '1,842', label: 'Clicks', color: 'text-teal-400' },
              { value: '3.9%', label: 'Engagement', color: 'text-coral-400' },
              { value: '$1.87', label: 'Cost/Click', color: 'text-marigold-400' },
            ].map((m) => (
              <div key={m.label} className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                <div className={`font-heading text-xl font-bold ${m.color}`}>{m.value}</div>
                <div className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider font-medium">{m.label}</div>
              </div>
            ))}
          </div>
          {/* Mini sparkline mock */}
          <div className="mt-4 flex items-end gap-0.5 h-8 px-1">
            {[30,45,38,52,48,65,58,72,68,80,75,90].map((h, i) => (
              <div key={i} className="flex-1 rounded-sm bg-marigold-500/30" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 mt-1 px-1">
            <span>Jan</span>
            <span>Jun</span>
            <span>Dec</span>
          </div>
        </div>
      </ModulePreview>

      <TwoTracks />
      <Footer />
    </div>
  );
}

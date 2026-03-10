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

      <ModulePreview
        id="create" number="01" label="Create"
        title={<>Start with what you want to <span className="text-marigold-500">say.</span></>}
        body="Pick a template or start blank. Drop in your copy, upload a visual, and preview how it'll look across social, newsletter, and display — before you spend a dollar."
        ctaLabel="Open the Builder \u2192" ctaPath="/advertise/create"
        variant="light"
      >
        <div className="p-4">
          <div className="grid grid-cols-2 gap-2">
            {['📱 Social Post', '📰 Newsletter', '🖼️ Display', '✨ Blank'].map((t) => (
              <div key={t} className="bg-gray-50 rounded-lg p-3 text-center text-xs font-medium text-gray-600">
                {t}
              </div>
            ))}
          </div>
        </div>
      </ModulePreview>

      <ModulePreview
        id="select" number="02" label="Select"
        title={<>Pick the voices your audience <span className="text-teal-500">trusts.</span></>}
        body="Browse local publishers by neighborhood, language, and reach. See real-time availability and transparent pricing."
        ctaLabel="Explore Publishers \u2192" ctaPath="/advertise/select"
        variant="dark" reverse
      >
        <div className="p-4 space-y-2">
          {[
            { initials: 'ET', name: 'El Tecolote', area: 'Mission · 12.4K reach', price: '$19' },
            { initials: 'ML', name: 'Mission Local', area: 'Mission · 8.2K reach', price: '$25' },
            { initials: 'BV', name: 'The Bay View', area: 'Bayview · 15.1K reach', price: '$22' },
          ].map((p) => (
            <div key={p.initials} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
              <div className="w-8 h-8 rounded bg-teal-500 text-white flex items-center justify-center text-xs font-bold">{p.initials}</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">{p.name}</div>
                <div className="text-xs text-gray-400">{p.area}</div>
              </div>
              <div className="text-sm font-bold text-teal-400">{p.price}</div>
            </div>
          ))}
        </div>
      </ModulePreview>

      <ModulePreview
        id="amplify" number="03" label="Amplify"
        title={<>Set your budget. <span className="text-coral-500">Launch.</span></>}
        body="Review your selections, see bulk pricing, and check out. Schedule a single post or a month of placements."
        ctaLabel="Review & Pay \u2192" ctaPath="/advertise/amplify"
        variant="light"
      >
        <div className="p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">El Tecolote · Social</span><span className="font-semibold">$19</span></div>
          <div className="flex justify-between"><span className="text-gray-500">The Bay View · Social</span><span className="font-semibold">$22</span></div>
          <div className="flex justify-between text-green-600"><span>Bulk discount</span><span>−$4.10</span></div>
          <div className="border-t border-gray-100 pt-2 flex justify-between font-bold"><span>Total</span><span className="text-coral-600">$36.90</span></div>
        </div>
      </ModulePreview>

      <ModulePreview
        id="validate" number="04" label="Validate"
        title={<>See what <span className="text-marigold-500">landed.</span></>}
        body="Real-time dashboards show impressions, clicks, and engagement across every publisher. Duplicate and redeploy winning campaigns."
        ctaLabel="View Dashboard \u2192" ctaPath="/advertise/validate"
        variant="dark" reverse
      >
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: '47.2K', label: 'Impressions' },
              { value: '1,842', label: 'Clicks' },
              { value: '3.9%', label: 'Engagement' },
              { value: '$1.87', label: 'Cost/Click' },
            ].map((m) => (
              <div key={m.label} className="bg-white/5 rounded-lg p-3 text-center">
                <div className="font-heading text-lg font-bold text-white">{m.value}</div>
                <div className="text-xs text-gray-400">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </ModulePreview>

      <TwoTracks />
      <Footer />
    </div>
  );
}

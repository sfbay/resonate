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
        <div className="p-6 text-center text-gray-400 text-sm">
          Creative builder preview
        </div>
      </ModulePreview>

      <ModulePreview
        id="select" number="02" label="Select"
        title={<>Pick the voices your audience <span className="text-teal-500">trusts.</span></>}
        body="Browse local publishers by neighborhood, language, and reach. See real-time availability and transparent pricing."
        ctaLabel="Explore Publishers \u2192" ctaPath="/advertise/select"
        variant="dark" reverse
      >
        <div className="p-6 text-center text-gray-400 text-sm">
          Publisher marketplace preview
        </div>
      </ModulePreview>

      <ModulePreview
        id="amplify" number="03" label="Amplify"
        title={<>Set your budget. <span className="text-coral-500">Launch.</span></>}
        body="Review your selections, see bulk pricing, and check out. Schedule a single post or a month of placements."
        ctaLabel="Review & Pay \u2192" ctaPath="/advertise/amplify"
        variant="light"
      >
        <div className="p-6 text-center text-gray-400 text-sm">
          Checkout preview
        </div>
      </ModulePreview>

      <ModulePreview
        id="validate" number="04" label="Validate"
        title={<>See what <span className="text-marigold-500">landed.</span></>}
        body="Real-time dashboards show impressions, clicks, and engagement across every publisher. Duplicate and redeploy winning campaigns."
        ctaLabel="View Dashboard \u2192" ctaPath="/advertise/validate"
        variant="dark" reverse
      >
        <div className="p-6 text-center text-gray-400 text-sm">
          Performance dashboard preview
        </div>
      </ModulePreview>

      <TwoTracks />
      <Footer />
    </div>
  );
}

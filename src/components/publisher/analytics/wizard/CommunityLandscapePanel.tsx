'use client';

/**
 * CommunityLandscapePanel
 *
 * Shows civic data signals — eviction hotspots, census indicators —
 * relevant to the publisher's coverage areas.
 */

import { RecommendationCard } from './RecommendationCard';
import type { WizardRecommendation } from '@/lib/recommendations/wizard-types';

interface CommunityLandscapePanelProps {
  recommendations: WizardRecommendation[];
}

export function CommunityLandscapePanel({ recommendations }: CommunityLandscapePanelProps) {
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🏘️</div>
        <h3 className="font-semibold text-charcoal mb-2">Community Landscape</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          No notable civic data signals in your coverage areas right now. This section surfaces eviction trends, housing data, and other community indicators as they emerge.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-charcoal mb-1">Community Landscape</h2>
        <p className="text-sm text-slate-500">
          Civic data signals and community indicators in your coverage areas.
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600">
        This data comes from public sources (Census Bureau, DataSF) and highlights community conditions — not editorial recommendations. How you cover these topics is entirely up to you.
      </div>

      <div className="space-y-4">
        {recommendations.map((rec) => (
          <RecommendationCard key={rec.id} recommendation={rec} />
        ))}
      </div>
    </div>
  );
}

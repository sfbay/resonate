'use client';

/**
 * PlatformExpansionPanel
 *
 * Shows platform suggestions and growth momentum indicators.
 */

import { RecommendationCard } from './RecommendationCard';
import type { WizardRecommendation } from '@/lib/recommendations/wizard-types';

interface PlatformExpansionPanelProps {
  recommendations: WizardRecommendation[];
}

export function PlatformExpansionPanel({ recommendations }: PlatformExpansionPanelProps) {
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🚀</div>
        <h3 className="font-semibold text-charcoal mb-2">Platform Expansion</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Connect more platforms to get personalized expansion recommendations. We look at where your audience is active versus where you currently have a presence.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-charcoal mb-1">Platform Expansion</h2>
        <p className="text-sm text-slate-500">
          Platforms where your audience may be active, and momentum you can build on.
        </p>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec) => (
          <RecommendationCard key={rec.id} recommendation={rec} />
        ))}
      </div>
    </div>
  );
}

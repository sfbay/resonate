'use client';

/**
 * AudienceGrowthPanel
 *
 * Shows neighborhood expansion and demographic reach recommendations.
 */

import { RecommendationCard } from './RecommendationCard';
import type { WizardRecommendation } from '@/lib/recommendations/wizard-types';

interface AudienceGrowthPanelProps {
  recommendations: WizardRecommendation[];
}

export function AudienceGrowthPanel({ recommendations }: AudienceGrowthPanelProps) {
  if (recommendations.length === 0) {
    return (
      <EmptyState
        icon="👥"
        title="Audience Growth"
        message="We didn't find specific neighborhood or demographic expansion opportunities based on your current profile. As you add more coverage areas and audience data, suggestions may appear here."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-charcoal mb-1">Audience Growth</h2>
        <p className="text-sm text-slate-500">
          Discover neighborhoods and demographics that may benefit from your coverage.
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

function EmptyState({ icon, title, message }: { icon: string; title: string; message: string }) {
  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="font-semibold text-charcoal mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto">{message}</p>
    </div>
  );
}

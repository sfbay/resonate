'use client';

/**
 * SocialStrategyPanel
 *
 * Shows timing, cadence, and content mix recommendations.
 * Focuses on social media strategy — never editorial direction.
 */

import { RecommendationCard } from './RecommendationCard';
import type { WizardRecommendation } from '@/lib/recommendations/wizard-types';

interface SocialStrategyPanelProps {
  recommendations: WizardRecommendation[];
}

export function SocialStrategyPanel({ recommendations }: SocialStrategyPanelProps) {
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📱</div>
        <h3 className="font-semibold text-charcoal mb-2">Social Media Strategy</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          We need more posting data to generate timing and cadence recommendations. Keep posting, and suggestions will appear as patterns emerge.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-charcoal mb-1">Social Media Strategy</h2>
        <p className="text-sm text-slate-500">
          Optimize your posting timing, cadence, and content format mix.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
        <strong>Note:</strong> These suggestions focus on <em>when</em> and <em>how</em> you share content on social media — not <em>what</em> you cover. Your editorial voice is yours alone.
      </div>

      <div className="space-y-4">
        {recommendations.map((rec) => (
          <RecommendationCard key={rec.id} recommendation={rec} />
        ))}
      </div>
    </div>
  );
}

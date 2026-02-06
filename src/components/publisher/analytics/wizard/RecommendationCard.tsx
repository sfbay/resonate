'use client';

/**
 * Wizard RecommendationCard
 *
 * Displays a single recommendation with supportive, suggestive language.
 * Uses coral theme and positive "area for growth" framing.
 */

import { useState } from 'react';
import type { WizardRecommendation } from '@/lib/recommendations/wizard-types';
import type { RecommendationPriority } from '@/lib/db/types';

interface RecommendationCardProps {
  recommendation: WizardRecommendation;
}

const PRIORITY_STYLES: Record<RecommendationPriority, {
  border: string;
  badge: string;
  badgeText: string;
  label: string;
}> = {
  high: {
    border: 'border-coral-200',
    badge: 'bg-coral-50 text-coral-700',
    badgeText: 'High opportunity',
    label: '🔥',
  },
  medium: {
    border: 'border-amber-200',
    badge: 'bg-amber-50 text-amber-700',
    badgeText: 'Worth exploring',
    label: '💡',
  },
  low: {
    border: 'border-teal-200',
    badge: 'bg-teal-50 text-teal-700',
    badgeText: 'Something to consider',
    label: '✨',
  },
};

const TYPE_ICONS: Record<string, string> = {
  neighborhood_expansion: '📍',
  demographic_reach: '👥',
  social_media_timing: '⏰',
  content_series: '🔄',
  platform_recommendation: '🚀',
  community_landscape: '🏘️',
};

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const style = PRIORITY_STYLES[recommendation.priority];
  const icon = TYPE_ICONS[recommendation.type] || '📋';

  return (
    <div
      className={`bg-white rounded-xl border ${style.border} shadow-sm hover:shadow-md transition-all duration-200`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-start gap-4 text-left"
      >
        <div className="text-2xl flex-shrink-0 mt-0.5">{icon}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.badge}`}>
              {style.label} {style.badgeText}
            </span>
          </div>

          <h4 className="font-semibold text-charcoal text-base leading-snug mb-1">
            {recommendation.title}
          </h4>

          <p className="text-sm text-slate-600 leading-relaxed">
            {recommendation.summary}
          </p>
        </div>

        <div
          className={`text-slate-400 transition-transform duration-200 flex-shrink-0 mt-1 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 pt-0 space-y-3">
          {recommendation.detail && (
            <div className="bg-cream-500 rounded-lg p-4">
              <h5 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                Details
              </h5>
              <p className="text-sm text-slate-700 whitespace-pre-line">
                {recommendation.detail}
              </p>
            </div>
          )}

          {recommendation.potentialReach && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="text-blue-500">🔵</span>
              <span>Potential reach: ~{recommendation.potentialReach.toLocaleString()}</span>
            </div>
          )}

          {recommendation.supportingData && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>📊</span>
              <span>{recommendation.supportingData}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
            <span>{recommendation.basedOn}</span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
              {Math.round(recommendation.confidence * 100)}% confidence
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

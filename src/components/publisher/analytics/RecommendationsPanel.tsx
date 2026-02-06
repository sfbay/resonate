'use client';

/**
 * RecommendationsPanel Component
 *
 * Displays actionable recommendations with priority indicators
 * and expandable action items.
 */

import { useState } from 'react';
import type { Recommendation } from '@/lib/recommendations/template-engine';
import type { RecommendationPriority, RecommendationType } from '@/lib/db/types';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Extended recommendation type that includes AI-specific fields
 */
export interface ExtendedRecommendation extends Recommendation {
  isAIGenerated?: boolean;
  aiModel?: string;
  aiProvider?: string;
}

interface RecommendationsPanelProps {
  recommendations: ExtendedRecommendation[];
  isLoading?: boolean;
  onDismiss?: (id: string) => void;
  onComplete?: (id: string) => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const PRIORITY_CONFIG: Record<
  RecommendationPriority,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  high: {
    label: 'High Priority',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    icon: '🔥',
  },
  medium: {
    label: 'Suggested',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200',
    icon: '💡',
  },
  low: {
    label: 'Nice to Have',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50 border-teal-200',
    icon: '✨',
  },
};

const TYPE_ICONS: Record<RecommendationType, string> = {
  content_timing: '🕐',
  content_format: '📸',
  hashtag_strategy: '#️⃣',
  audience_growth: '📈',
  engagement_boost: '💬',
  cross_platform: '🔗',
  trending_topic: '🔥',
  competitor_insight: '👀',
  web_traffic: '🌐',
  monetization: '💰',
  neighborhood_expansion: '📍',
  demographic_reach: '👥',
  social_media_timing: '⏰',
  content_series: '🔄',
  platform_recommendation: '🚀',
  community_landscape: '🏘️',
};

// =============================================================================
// RECOMMENDATION CARD
// =============================================================================

interface RecommendationCardProps {
  recommendation: ExtendedRecommendation;
  isExpanded: boolean;
  onToggle: () => void;
  onDismiss?: () => void;
  onComplete?: () => void;
}

function RecommendationCard({
  recommendation,
  isExpanded,
  onToggle,
  onDismiss,
  onComplete,
}: RecommendationCardProps) {
  const priorityConfig = PRIORITY_CONFIG[recommendation.priority];
  const typeIcon = TYPE_ICONS[recommendation.type] || '📋';

  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${priorityConfig.bgColor} ${
        isExpanded ? 'shadow-md' : 'shadow-sm hover:shadow-md'
      }`}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-start gap-4 text-left"
      >
        {/* Icon */}
        <div className="text-2xl flex-shrink-0">{typeIcon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium ${priorityConfig.color}`}>
              {priorityConfig.icon} {priorityConfig.label}
            </span>
            {recommendation.platform && (
              <span className="text-xs text-slate-500 bg-white/50 px-2 py-0.5 rounded-full">
                {recommendation.platform}
              </span>
            )}
            {recommendation.isAIGenerated && (
              <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                AI
              </span>
            )}
          </div>

          <h4 className="font-semibold text-charcoal text-base leading-snug">
            {recommendation.title}
          </h4>

          <p className="text-sm text-slate-600 mt-1 line-clamp-2">{recommendation.summary}</p>
        </div>

        {/* Expand indicator */}
        <div
          className={`text-slate-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-0">
          {/* Action items */}
          <div className="bg-white/60 rounded-lg p-4 mb-4">
            <h5 className="text-sm font-medium text-charcoal mb-3">Action Items</h5>
            <ul className="space-y-2">
              {recommendation.actionItems.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-coral-100 text-coral-600 text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>{recommendation.basedOn}</span>
              {recommendation.isAIGenerated && recommendation.aiModel && (
                <span className="text-purple-500">
                  via {recommendation.aiModel}
                </span>
              )}
            </div>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
              {Math.round(recommendation.confidence * 100)}% confidence
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/50">
            {onComplete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete();
                }}
                className="flex-1 py-2 px-4 bg-coral-500 text-white text-sm font-medium rounded-lg hover:bg-coral-600 transition-colors"
              >
                Mark Complete
              </button>
            )}
            {onDismiss && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss();
                }}
                className="py-2 px-4 text-slate-500 text-sm hover:text-slate-700 transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function RecommendationsPanel({
  recommendations,
  isLoading,
  onDismiss,
  onComplete,
}: RecommendationsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    recommendations.length > 0 ? recommendations[0].id : null
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-100 rounded w-1/3" />
          <div className="h-24 bg-slate-100 rounded" />
          <div className="h-24 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="font-semibold text-charcoal text-lg mb-4">Recommendations</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-slate-500">
            Keep posting! We need more data to generate personalized recommendations.
          </p>
        </div>
      </div>
    );
  }

  // Group by priority
  const highPriority = recommendations.filter((r) => r.priority === 'high');
  const otherPriority = recommendations.filter((r) => r.priority !== 'high');

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-charcoal text-lg">Recommendations</h3>
          <p className="text-sm text-slate-500">
            {recommendations.length} insight{recommendations.length !== 1 ? 's' : ''} for you
          </p>
        </div>

        {highPriority.length > 0 && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-sm font-medium rounded-full">
            🔥 {highPriority.length} high priority
          </span>
        )}
      </div>

      {/* Recommendations list */}
      <div className="space-y-4">
        {recommendations.map((rec) => (
          <RecommendationCard
            key={rec.id}
            recommendation={rec}
            isExpanded={expandedId === rec.id}
            onToggle={() => setExpandedId(expandedId === rec.id ? null : rec.id)}
            onDismiss={onDismiss ? () => onDismiss(rec.id) : undefined}
            onComplete={onComplete ? () => onComplete(rec.id) : undefined}
          />
        ))}
      </div>

      {/* Footer tip */}
      <div className="mt-6 pt-4 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-400">
          Recommendations update as you post more content
        </p>
      </div>
    </div>
  );
}

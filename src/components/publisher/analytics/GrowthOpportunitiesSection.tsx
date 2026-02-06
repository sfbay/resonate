'use client';

/**
 * GrowthOpportunitiesSection
 *
 * Dashboard summary showing top 1-2 recommendations per wizard category.
 * Replaces the AI Insights panel. Includes button to open full wizard overlay.
 */

import { useMemo } from 'react';
import { getSFCensusData } from '@/lib/census/sf-census-data';
import { generateWizardRecommendations, getWizardSummary } from '@/lib/recommendations/wizard-service';
import { WIZARD_CATEGORIES } from '@/lib/recommendations/wizard-types';
import type { WizardCategory, WizardRecommendation } from '@/lib/recommendations/wizard-types';
import type { PostPerformance } from './PostPerformanceTable';
import type { PlatformType, DbAudienceProfile } from '@/lib/db/types';

interface GrowthOpportunitiesSectionProps {
  publisherId: string;
  publisherName: string;
  posts?: PostPerformance[];
  growthRate30d?: number;
  totalFollowers?: number;
  avgEngagementRate?: number;
  neighborhoods?: string[];
  platforms?: PlatformType[];
  onOpenWizard: () => void;
}

export function GrowthOpportunitiesSection({
  publisherId,
  publisherName,
  posts = [],
  growthRate30d = 0,
  totalFollowers = 0,
  avgEngagementRate = 0,
  neighborhoods = [],
  platforms = [],
  onOpenWizard,
}: GrowthOpportunitiesSectionProps) {
  // Generate quick summary from census data (sync)
  const summary = useMemo(() => {
    const censusData = getSFCensusData();

    const performanceData = posts.length > 0
      ? {
          posts: posts.map((p) => ({
            platform: p.platform as PlatformType,
            contentType: p.contentType,
            publishedAt: p.publishedAt,
            likes: p.likes || 0,
            comments: p.comments || 0,
            shares: p.shares || 0,
          })),
          avgEngagementRate,
          growthRate30d,
          totalFollowers,
        }
      : undefined;

    const results = generateWizardRecommendations({
      publisherId,
      publisherName,
      wizardData: {
        censusData,
        evictionStats: null, // Not loaded on dashboard — only in wizard
        audienceProfile: null, // Simplified — wizard loads full profile
        allNeighborhoods: Object.keys(censusData),
        publisherNeighborhoods: neighborhoods,
        publisherPlatforms: platforms,
      },
      performanceData,
    });

    return getWizardSummary(results);
  }, [publisherId, publisherName, posts, neighborhoods, platforms, avgEngagementRate, growthRate30d, totalFollowers]);

  // Count how many categories have recommendations
  const activeCategoriesList = (Object.entries(summary) as [WizardCategory, WizardRecommendation | null][])
    .filter(([, rec]) => rec !== null);

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-charcoal text-lg">Growth Opportunities</h3>
          <p className="text-sm text-slate-500">
            Areas for growth based on your community data
          </p>
        </div>
        {activeCategoriesList.length > 0 && (
          <span className="text-xs text-coral-600 bg-coral-50 px-2.5 py-1 rounded-full font-medium">
            {activeCategoriesList.length} area{activeCategoriesList.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {activeCategoriesList.length > 0 ? (
        <div className="space-y-3 mb-4">
          {activeCategoriesList.map(([category, rec]) => {
            if (!rec) return null;
            const config = WIZARD_CATEGORIES[category];

            return (
              <div
                key={category}
                className="flex items-start gap-3 p-3 rounded-lg bg-cream-500 hover:bg-cream-600 transition-colors"
              >
                <span className="text-lg flex-shrink-0">{config.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal">{rec.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{rec.summary}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 mb-4">
          <div className="text-3xl mb-2">🌱</div>
          <p className="text-sm text-slate-500">
            Add coverage neighborhoods and connect platforms to see growth opportunities.
          </p>
        </div>
      )}

      <button
        onClick={onOpenWizard}
        className="w-full py-3 px-4 rounded-lg font-medium transition-all bg-gradient-to-r from-coral-500 to-marigold-500 text-white hover:from-coral-600 hover:to-marigold-600 shadow-md flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Explore Growth Areas
      </button>
    </div>
  );
}

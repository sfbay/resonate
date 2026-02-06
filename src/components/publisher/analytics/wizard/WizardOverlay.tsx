'use client';

/**
 * WizardOverlay
 *
 * Full-screen modal container for the Growth Opportunities wizard.
 * Lazy-loads data when opened, runs wizard rules, and displays
 * results across 4 category panels.
 */

import { useState, useMemo, useEffect } from 'react';
import { WizardHeader } from './WizardHeader';
import { AudienceGrowthPanel } from './AudienceGrowthPanel';
import { SocialStrategyPanel } from './SocialStrategyPanel';
import { PlatformExpansionPanel } from './PlatformExpansionPanel';
import { CommunityLandscapePanel } from './CommunityLandscapePanel';
import { useWizardData } from './useWizardData';
import { generateWizardRecommendations, getWizardSummary } from '@/lib/recommendations/wizard-service';
import type { WizardCategory, WizardResults } from '@/lib/recommendations/wizard-types';
import type { PostPerformance } from '../PostPerformanceTable';
import type { PlatformType } from '@/lib/db/types';

interface WizardOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  publisherId: string;
  publisherName: string;
  posts?: PostPerformance[];
  growthRate30d?: number;
  totalFollowers?: number;
  avgEngagementRate?: number;
}

export function WizardOverlay({
  isOpen,
  onClose,
  publisherId,
  publisherName,
  posts = [],
  growthRate30d = 0,
  totalFollowers = 0,
  avgEngagementRate = 0,
}: WizardOverlayProps) {
  const [activeCategory, setActiveCategory] = useState<WizardCategory>('audience_growth');
  const { data: wizardData, isLoading, error } = useWizardData(publisherId, isOpen);

  // Generate recommendations when data is loaded
  const results: WizardResults | null = useMemo(() => {
    if (!wizardData) return null;

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

    return generateWizardRecommendations({
      publisherId,
      publisherName,
      wizardData,
      performanceData,
    });
  }, [wizardData, publisherId, publisherName, posts, avgEngagementRate, growthRate30d, totalFollowers]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const categoryCounts = results
    ? {
        audience_growth: results.byCategory.audience_growth.length,
        social_strategy: results.byCategory.social_strategy.length,
        platform_expansion: results.byCategory.platform_expansion.length,
        community_landscape: results.byCategory.community_landscape.length,
      }
    : { audience_growth: 0, social_strategy: 0, platform_expansion: 0, community_landscape: 0 };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-hidden flex flex-col">
      <WizardHeader
        publisherName={publisherName}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onClose={onClose}
        categoryCounts={categoryCounts}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-8 h-8 border-3 border-coral-200 border-t-coral-500 rounded-full animate-spin mb-4" />
              <p className="text-slate-500">Loading growth data...</p>
              <p className="text-xs text-slate-400 mt-1">Fetching census and community data</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-600 font-medium mb-1">Unable to load wizard data</p>
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {results && !isLoading && (
            <>
              {activeCategory === 'audience_growth' && (
                <AudienceGrowthPanel recommendations={results.byCategory.audience_growth} />
              )}
              {activeCategory === 'social_strategy' && (
                <SocialStrategyPanel recommendations={results.byCategory.social_strategy} />
              )}
              {activeCategory === 'platform_expansion' && (
                <PlatformExpansionPanel recommendations={results.byCategory.platform_expansion} />
              )}
              {activeCategory === 'community_landscape' && (
                <CommunityLandscapePanel recommendations={results.byCategory.community_landscape} />
              )}
            </>
          )}

          {results && results.totalCount === 0 && !isLoading && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🌱</div>
              <h3 className="text-lg font-semibold text-charcoal mb-2">Building your growth profile</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                We need more data to generate personalized growth recommendations. Try connecting more platforms, adding coverage neighborhoods to your audience profile, or posting more content.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-slate-200 px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between text-xs text-slate-400">
          <span>
            {results?.totalCount || 0} growth opportunit{results?.totalCount === 1 ? 'y' : 'ies'} found
          </span>
          <span>
            Data: Census Bureau, DataSF, your connected platforms
          </span>
        </div>
      </div>
    </div>
  );
}

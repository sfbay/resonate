'use client';

/**
 * AnalyticsDashboard Component
 *
 * Main dashboard view for publishers showing their analytics,
 * connected platforms, badges, and growth insights.
 */

import { useMemo } from 'react';
import { MetricsOverview } from './MetricsOverview';
import { PlatformConnectionCard } from './PlatformConnectionCard';
import { BadgeCollection, RisingStarBadge } from './GrowthBadge';
import { GrowthChart } from './GrowthChart';
import { PostPerformanceTable } from './PostPerformanceTable';
import { RecommendationsPanel } from './RecommendationsPanel';
import { generateRecommendations } from '@/lib/recommendations/template-engine';
import type { GrowthMetrics, PlatformConnection, MetricsSnapshot, Badge, Platform } from '@/types';
import type { PostPerformance } from './PostPerformanceTable';
import type { GrowthDataPoint } from './GrowthChart';
import type { Recommendation } from '@/lib/recommendations/template-engine';

interface AnalyticsDashboardProps {
  publisherId: string;
  publisherName: string;
  metrics: GrowthMetrics | null;
  connections: PlatformConnection[];
  latestSnapshots: Record<Platform, MetricsSnapshot | null>;
  badges: Badge[];
  isLoading?: boolean;
  // New props for enhanced analytics
  posts?: PostPerformance[];
  growthHistory?: GrowthDataPoint[];
}

// Platforms available for connection
const AVAILABLE_PLATFORMS: Platform[] = [
  'instagram',
  'facebook',
  'tiktok',
  'whatsapp',
  'telegram',
  'mailchimp',
  'substack',
];

export function AnalyticsDashboard({
  publisherId,
  publisherName,
  metrics,
  connections,
  latestSnapshots,
  badges,
  isLoading,
  posts = [],
  growthHistory = [],
}: AnalyticsDashboardProps) {
  const hasRisingStar = badges.some((b) => b.type === 'rising_star');
  const risingStarBadge = badges.find((b) => b.type === 'rising_star');

  // Generate recommendations based on performance data
  const recommendations = useMemo<Recommendation[]>(() => {
    if (posts.length === 0 || !metrics) return [];

    // Aggregate posts by platform
    const platformPosts = new Map<Platform, PostPerformance[]>();
    posts.forEach((post) => {
      const existing = platformPosts.get(post.platform) || [];
      existing.push(post);
      platformPosts.set(post.platform, existing);
    });

    // Generate recommendations for the primary platform
    const primaryPlatform = Array.from(platformPosts.entries())
      .sort((a, b) => b[1].length - a[1].length)[0];

    if (!primaryPlatform) return [];

    const [platform, platformPostList] = primaryPlatform;
    const snapshot = latestSnapshots[platform];

    return generateRecommendations({
      platform,
      posts: platformPostList.map((p) => ({
        id: p.id,
        platform: p.platform,
        contentType: p.contentType,
        publishedAt: p.publishedAt,
        likes: p.likes || 0,
        comments: p.comments || 0,
        shares: p.shares || 0,
        saves: p.saves || undefined,
        impressions: p.impressions || undefined,
        reach: p.reach || undefined,
        videoViews: p.videoViews || undefined,
        hashtags: [],
      })),
      followerCount: snapshot?.followerCount || 0,
      avgEngagementRate: snapshot?.engagementRate || 0,
      growthRate30d: metrics.growth30d.growthRate,
    });
  }, [posts, metrics, latestSnapshots]);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="display-sm text-charcoal">{publisherName}</h1>
              <p className="text-slate-500">Publisher Analytics Dashboard</p>
            </div>

            {hasRisingStar && risingStarBadge && (
              <RisingStarBadge
                growthRate={metrics?.growth30d.growthRate || 0}
                tier={risingStarBadge.tier || 'bronze'}
              />
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Metrics Overview */}
        <section>
          <h2 className="display-sm text-charcoal mb-4">Overview</h2>
          <MetricsOverview metrics={metrics} isLoading={isLoading} />
        </section>

        {/* Badges Section */}
        {badges.length > 0 && (
          <section className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-charcoal text-lg">Your Badges</h2>
              <span className="text-sm text-slate-500">
                {badges.length} badge{badges.length !== 1 ? 's' : ''} earned
              </span>
            </div>
            <BadgeCollection badges={badges} size="lg" />
          </section>
        )}

        {/* Platform Connections */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="display-sm text-charcoal">Connected Platforms</h2>
            <p className="text-sm text-slate-500">
              {connections.filter((c) => c.status === 'active').length} of{' '}
              {AVAILABLE_PLATFORMS.length} connected
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVAILABLE_PLATFORMS.map((platform) => {
              const connection = connections.find((c) => c.platform === platform) || null;
              const snapshot = latestSnapshots[platform] || null;

              return (
                <PlatformConnectionCard
                  key={platform}
                  platform={platform}
                  connection={connection}
                  latestMetrics={snapshot}
                  publisherId={publisherId}
                />
              );
            })}
          </div>
        </section>

        {/* Growth Chart & Insights */}
        {(growthHistory.length > 0 || metrics) && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Growth Chart - takes 2 columns */}
            <div className="lg:col-span-2">
              {growthHistory.length > 0 ? (
                <GrowthChart
                  data={growthHistory}
                  period="30d"
                  height={280}
                  isLoading={isLoading}
                />
              ) : (
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h3 className="font-semibold text-charcoal text-lg mb-4">Audience Growth</h3>
                  <div className="h-[200px] flex items-center justify-center text-slate-500">
                    Connect a platform to see your growth chart
                  </div>
                </div>
              )}
            </div>

            {/* Growth Stats - takes 1 column */}
            {metrics && (
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="font-semibold text-charcoal text-lg mb-4">Growth Stats</h3>

                <div className="space-y-4">
                  {/* 7-day growth */}
                  <div className="p-3 bg-cream-500 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">7 days</span>
                      <span
                        className={`text-lg font-bold ${
                          metrics.growth7d.growthRate > 0
                            ? 'text-emerald-600'
                            : metrics.growth7d.growthRate < 0
                            ? 'text-red-500'
                            : 'text-slate-500'
                        }`}
                      >
                        {metrics.growth7d.growthRate > 0 ? '+' : ''}
                        {metrics.growth7d.growthRate.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {metrics.growth7d.followersGained > 0 ? '+' : ''}
                      {metrics.growth7d.followersGained.toLocaleString()} followers
                    </p>
                  </div>

                  {/* 30-day growth */}
                  <div className="p-3 bg-cream-500 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">30 days</span>
                      <span
                        className={`text-lg font-bold ${
                          metrics.growth30d.growthRate > 0
                            ? 'text-emerald-600'
                            : metrics.growth30d.growthRate < 0
                            ? 'text-red-500'
                            : 'text-slate-500'
                        }`}
                      >
                        {metrics.growth30d.growthRate > 0 ? '+' : ''}
                        {metrics.growth30d.growthRate.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {metrics.growth30d.followersGained > 0 ? '+' : ''}
                      {metrics.growth30d.followersGained.toLocaleString()} followers
                    </p>
                  </div>

                  {/* 90-day growth */}
                  <div className="p-3 bg-cream-500 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">90 days</span>
                      <span
                        className={`text-lg font-bold ${
                          metrics.growth90d.growthRate > 0
                            ? 'text-emerald-600'
                            : metrics.growth90d.growthRate < 0
                            ? 'text-red-500'
                            : 'text-slate-500'
                        }`}
                      >
                        {metrics.growth90d.growthRate > 0 ? '+' : ''}
                        {metrics.growth90d.growthRate.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {metrics.growth90d.followersGained > 0 ? '+' : ''}
                      {metrics.growth90d.followersGained.toLocaleString()} followers
                    </p>
                  </div>
                </div>

                {/* Trend indicator */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2">
                  <span
                    className={`text-xl ${
                      metrics.trend === 'accelerating'
                        ? 'text-emerald-500'
                        : metrics.trend === 'declining'
                        ? 'text-red-500'
                        : 'text-amber-500'
                    }`}
                  >
                    {metrics.trend === 'accelerating'
                      ? '📈'
                      : metrics.trend === 'declining'
                      ? '📉'
                      : '➡️'}
                  </span>
                  <span className="text-sm text-slate-600">
                    {metrics.trend === 'accelerating'
                      ? 'Accelerating'
                      : metrics.trend === 'declining'
                      ? 'Slowing'
                      : 'Steady'}
                  </span>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Content Performance & Recommendations */}
        {(posts.length > 0 || recommendations.length > 0) && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Post Performance Table - takes 2 columns */}
            <div className="lg:col-span-2">
              <PostPerformanceTable posts={posts} isLoading={isLoading} />
            </div>

            {/* Recommendations - takes 1 column */}
            <div>
              <RecommendationsPanel recommendations={recommendations} isLoading={isLoading} />
            </div>
          </section>
        )}

        {/* Recommendations (placeholder) */}
        <section className="bg-gradient-to-br from-coral-500 to-marigold-500 rounded-xl p-6 text-white">
          <h2 className="font-semibold text-lg mb-2">Grow Your Reach</h2>
          <p className="opacity-90 mb-4">
            Connect more platforms to unlock detailed analytics and earn badges that highlight
            your growth to advertisers.
          </p>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_PLATFORMS.filter(
              (p) => !connections.some((c) => c.platform === p && c.status === 'active')
            ).map((platform) => (
              <span
                key={platform}
                className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm"
              >
                + {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </span>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

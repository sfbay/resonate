'use client';

/**
 * AnalyticsDashboard Component
 *
 * Main dashboard view for publishers showing their analytics,
 * connected platforms, badges, and growth insights.
 */

import { MetricsOverview } from './MetricsOverview';
import { PlatformConnectionCard } from './PlatformConnectionCard';
import { BadgeCollection, RisingStarBadge } from './GrowthBadge';
import type { GrowthMetrics, PlatformConnection, MetricsSnapshot, Badge, Platform } from '@/types';

interface AnalyticsDashboardProps {
  publisherId: string;
  publisherName: string;
  metrics: GrowthMetrics | null;
  connections: PlatformConnection[];
  latestSnapshots: Record<Platform, MetricsSnapshot | null>;
  badges: Badge[];
  isLoading?: boolean;
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
}: AnalyticsDashboardProps) {
  const hasRisingStar = badges.some((b) => b.type === 'rising_star');
  const risingStarBadge = badges.find((b) => b.type === 'rising_star');

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

        {/* Growth Insights */}
        {metrics && (
          <section className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="font-semibold text-charcoal text-lg mb-4">Growth Insights</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 7-day growth */}
              <div className="text-center p-4 bg-cream-500 rounded-lg">
                <p className="text-3xl font-bold text-charcoal">
                  {metrics.growth7d.growthRate > 0 ? '+' : ''}
                  {metrics.growth7d.growthRate.toFixed(1)}%
                </p>
                <p className="text-sm text-slate-500 mt-1">Last 7 days</p>
                <p className="text-xs text-slate-400">
                  {metrics.growth7d.followersGained > 0 ? '+' : ''}
                  {metrics.growth7d.followersGained.toLocaleString()} followers
                </p>
              </div>

              {/* 30-day growth */}
              <div className="text-center p-4 bg-cream-500 rounded-lg">
                <p className="text-3xl font-bold text-charcoal">
                  {metrics.growth30d.growthRate > 0 ? '+' : ''}
                  {metrics.growth30d.growthRate.toFixed(1)}%
                </p>
                <p className="text-sm text-slate-500 mt-1">Last 30 days</p>
                <p className="text-xs text-slate-400">
                  {metrics.growth30d.followersGained > 0 ? '+' : ''}
                  {metrics.growth30d.followersGained.toLocaleString()} followers
                </p>
              </div>

              {/* 90-day growth */}
              <div className="text-center p-4 bg-cream-500 rounded-lg">
                <p className="text-3xl font-bold text-charcoal">
                  {metrics.growth90d.growthRate > 0 ? '+' : ''}
                  {metrics.growth90d.growthRate.toFixed(1)}%
                </p>
                <p className="text-sm text-slate-500 mt-1">Last 90 days</p>
                <p className="text-xs text-slate-400">
                  {metrics.growth90d.followersGained > 0 ? '+' : ''}
                  {metrics.growth90d.followersGained.toLocaleString()} followers
                </p>
              </div>
            </div>

            {/* Trend indicator */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2">
              <span
                className={`text-2xl ${
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
              <span className="text-slate-600">
                Your growth is{' '}
                <span className="font-semibold">
                  {metrics.trend === 'accelerating'
                    ? 'accelerating'
                    : metrics.trend === 'declining'
                    ? 'slowing down'
                    : 'steady'}
                </span>
              </span>
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

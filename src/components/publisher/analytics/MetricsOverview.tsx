'use client';

/**
 * MetricsOverview Component
 *
 * Displays key metrics in a card grid: total followers, engagement rate,
 * growth trend, and verified platforms count.
 */

import type { GrowthMetrics } from '@/types';

interface MetricsOverviewProps {
  metrics: GrowthMetrics | null;
  isLoading?: boolean;
}

interface MetricCardProps {
  label: string;
  value: string;
  subtext?: string;
  trend?: {
    direction: 'up' | 'down' | 'flat';
    value: string;
  };
  accent?: 'coral' | 'teal' | 'marigold';
}

function MetricCard({ label, value, subtext, trend, accent = 'coral' }: MetricCardProps) {
  const accentColors = {
    coral: 'bg-coral-500',
    teal: 'bg-teal-500',
    marigold: 'bg-marigold-500',
  };

  const trendColors = {
    up: 'text-emerald-600',
    down: 'text-red-500',
    flat: 'text-slate-500',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    flat: '→',
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <span className="label text-slate-500">{label}</span>
        <div className={`w-2 h-2 rounded-full ${accentColors[accent]}`} />
      </div>

      <div className="stat-number text-charcoal mb-2">{value}</div>

      <div className="flex items-center gap-2">
        {trend && (
          <span className={`text-sm font-semibold ${trendColors[trend.direction]}`}>
            {trendIcons[trend.direction]} {trend.value}
          </span>
        )}
        {subtext && <span className="text-sm text-slate-500">{subtext}</span>}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="h-3 w-24 bg-slate-200 rounded" />
        <div className="w-2 h-2 rounded-full bg-slate-200" />
      </div>
      <div className="h-12 w-32 bg-slate-200 rounded mb-2" />
      <div className="h-4 w-20 bg-slate-200 rounded" />
    </div>
  );
}

export function MetricsOverview({ metrics, isLoading }: MetricsOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-cream-600 rounded-xl p-8 text-center">
        <p className="text-slate-600 mb-4">
          Connect your social platforms to see your analytics
        </p>
        <p className="text-sm text-slate-500">
          Link Instagram, Facebook, or other platforms to unlock insights
        </p>
      </div>
    );
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const getTrendDirection = (rate: number): 'up' | 'down' | 'flat' => {
    if (rate > 0.5) return 'up';
    if (rate < -0.5) return 'down';
    return 'flat';
  };

  const verifiedCount = metrics.verificationLevel === 'verified'
    ? Object.keys(metrics.byPlatform).length
    : metrics.verificationLevel === 'partial'
    ? Math.ceil(Object.keys(metrics.byPlatform).length / 2)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        label="Total Followers"
        value={formatNumber(metrics.totalFollowers)}
        trend={{
          direction: getTrendDirection(metrics.growth30d.growthRate),
          value: `${metrics.growth30d.growthRate.toFixed(1)}%`,
        }}
        subtext="last 30 days"
        accent="coral"
      />

      <MetricCard
        label="Engagement Rate"
        value={`${metrics.averageEngagementRate.toFixed(2)}%`}
        subtext="avg across platforms"
        accent="teal"
      />

      <MetricCard
        label="Growth Trend"
        value={
          metrics.trend === 'accelerating'
            ? 'Rising'
            : metrics.trend === 'steady'
            ? 'Steady'
            : 'Slowing'
        }
        trend={{
          direction: metrics.trend === 'accelerating' ? 'up' : metrics.trend === 'steady' ? 'flat' : 'down',
          value: `${metrics.growth7d.followersGained > 0 ? '+' : ''}${formatNumber(metrics.growth7d.followersGained)}`,
        }}
        subtext="this week"
        accent="marigold"
      />

      <MetricCard
        label="Verified Platforms"
        value={`${verifiedCount}`}
        subtext={`of ${Object.keys(metrics.byPlatform).length} connected`}
        accent="coral"
      />
    </div>
  );
}

'use client';

/**
 * MetricsOverview Component
 *
 * Hero metrics strip — bold serif numbers with coral accent bars.
 * "Editorial intelligence" aesthetic: the numbers speak loudly, the chrome is quiet.
 */

import type { GrowthMetrics } from '@/types';

interface MetricsOverviewProps {
  metrics: GrowthMetrics | null;
  isLoading?: boolean;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-100 animate-pulse">
      <div className="h-3 w-20 bg-slate-100 rounded mb-4" />
      <div className="h-10 w-28 bg-slate-100 rounded mb-2" />
      <div className="h-3 w-16 bg-slate-100 rounded" />
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
      <div className="bg-white rounded-xl p-8 border border-slate-100 text-center">
        <p className="text-slate-500 mb-1">Connect your social platforms to see analytics</p>
        <p className="text-sm text-slate-400">
          Link Instagram, Facebook, or other platforms to unlock insights
        </p>
      </div>
    );
  }

  const trendDirection = metrics.growth30d.growthRate > 0.5 ? 'up' : metrics.growth30d.growthRate < -0.5 ? 'down' : 'flat';

  const verifiedCount = metrics.verificationLevel === 'verified'
    ? Object.keys(metrics.byPlatform).length
    : metrics.verificationLevel === 'partial'
    ? Math.ceil(Object.keys(metrics.byPlatform).length / 2)
    : 0;

  const cards = [
    {
      label: 'Total Reach',
      value: formatNumber(metrics.totalFollowers),
      accent: 'coral' as const,
      trend: {
        direction: trendDirection,
        value: `${metrics.growth30d.growthRate > 0 ? '+' : ''}${metrics.growth30d.growthRate.toFixed(1)}%`,
      },
      subtext: '30-day trend',
    },
    {
      label: 'Engagement',
      value: `${metrics.averageEngagementRate.toFixed(2)}%`,
      accent: 'teal' as const,
      subtext: 'avg across platforms',
    },
    {
      label: 'Momentum',
      value: metrics.trend === 'accelerating' ? 'Rising' : metrics.trend === 'steady' ? 'Steady' : 'Slowing',
      accent: 'marigold' as const,
      trend: {
        direction: metrics.trend === 'accelerating' ? 'up' as const : metrics.trend === 'steady' ? 'flat' as const : 'down' as const,
        value: `${metrics.growth7d.followersGained > 0 ? '+' : ''}${formatNumber(metrics.growth7d.followersGained)}`,
      },
      subtext: 'this week',
    },
    {
      label: 'Platforms',
      value: `${Object.keys(metrics.byPlatform).length}`,
      accent: 'coral' as const,
      subtext: verifiedCount > 0
        ? `${verifiedCount} verified`
        : `${Object.keys(metrics.byPlatform).length} connected`,
    },
  ];

  const accentColors = {
    coral: {
      bar: 'bg-coral-500',
      bg: 'bg-coral-50/50',
      ring: 'ring-coral-100',
    },
    teal: {
      bar: 'bg-teal-500',
      bg: 'bg-teal-50/40',
      ring: 'ring-teal-100',
    },
    marigold: {
      bar: 'bg-marigold-500',
      bg: 'bg-marigold-50/40',
      ring: 'ring-marigold-100',
    },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const colors = accentColors[card.accent];
        return (
          <div
            key={card.label}
            className="relative bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
          >
            {/* Accent bar on left */}
            <div className={`absolute top-0 left-0 w-1 h-full ${colors.bar} rounded-l-xl`} />

            {/* Label */}
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 pl-3">
              {card.label}
            </p>

            {/* Big number */}
            <div className="pl-3 mb-2">
              <span
                className="font-[family-name:var(--font-fraunces)] text-charcoal"
                style={{ fontSize: 'clamp(1.75rem, 2.5vw, 2.25rem)', fontWeight: 600, lineHeight: 1 }}
              >
                {card.value}
              </span>
            </div>

            {/* Trend + subtext */}
            <div className="flex items-center gap-2 pl-3">
              {card.trend && (
                <span className={`text-sm font-semibold ${
                  card.trend.direction === 'up' ? 'text-emerald-600' :
                  card.trend.direction === 'down' ? 'text-red-500' : 'text-slate-400'
                }`}>
                  {card.trend.direction === 'up' ? '\u2191' : card.trend.direction === 'down' ? '\u2193' : '\u2192'}{' '}
                  {card.trend.value}
                </span>
              )}
              {card.subtext && (
                <span className="text-xs text-slate-400">{card.subtext}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

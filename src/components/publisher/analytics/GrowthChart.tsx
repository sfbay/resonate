'use client';

/**
 * GrowthChart Component
 *
 * Visualizes follower growth over time using an area chart.
 * Features coral gradient fill and interactive tooltips.
 */

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { PlatformType } from '@/lib/db/types';

// =============================================================================
// TYPES
// =============================================================================

export interface GrowthDataPoint {
  date: Date;
  followers: number;
  platform?: PlatformType;
  netGrowth?: number;
}

interface GrowthChartProps {
  data: GrowthDataPoint[];
  period?: '7d' | '30d' | '90d';
  showPlatformBreakdown?: boolean;
  height?: number;
  isLoading?: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

// Coral gradient colors from design system
const CORAL_PRIMARY = '#FF6B6B';
const CORAL_LIGHT = '#FFE5E5';
const CORAL_DARK = '#E55555';

// Platform colors for multi-line charts
const PLATFORM_COLORS: Partial<Record<PlatformType, string>> = {
  instagram: '#E4405F',
  tiktok: '#000000',
  facebook: '#1877F2',
  twitter: '#1DA1F2',
  youtube: '#FF0000',
  mailchimp: '#FFE01B',
  substack: '#FF6719',
};

// =============================================================================
// CUSTOM TOOLTIP
// =============================================================================

interface TooltipPayloadItem {
  dataKey: string;
  value: number;
  color: string;
  name: string;
  payload: {
    date: Date;
    netGrowth?: number;
    followers?: number;
    [key: string]: unknown;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  const date = new Date(data.date);

  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-3 min-w-[160px]">
      <p className="text-xs text-slate-500 mb-2">
        {date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })}
      </p>

      {payload.map((entry, index) => (
        <div key={index} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-charcoal font-medium">
              {entry.name === 'followers' ? 'Followers' : entry.name}
            </span>
          </div>
          <span className="text-sm font-semibold text-charcoal">
            {entry.value.toLocaleString()}
          </span>
        </div>
      ))}

      {data.netGrowth !== undefined && (
        <div className="mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Daily change</span>
            <span
              className={`text-xs font-semibold ${
                data.netGrowth > 0
                  ? 'text-emerald-600'
                  : data.netGrowth < 0
                  ? 'text-red-500'
                  : 'text-slate-500'
              }`}
            >
              {data.netGrowth > 0 ? '+' : ''}
              {data.netGrowth.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

export function GrowthChart({
  data,
  period = '30d',
  showPlatformBreakdown = false,
  height = 300,
  isLoading,
}: GrowthChartProps) {
  // Transform data for chart
  const chartData = useMemo(() => {
    if (showPlatformBreakdown) {
      // Group by date, with platform as separate series
      const byDate = new Map<string, Record<string, number>>();

      data.forEach((point) => {
        const dateKey = point.date.toISOString().split('T')[0];
        if (!byDate.has(dateKey)) {
          byDate.set(dateKey, { date: point.date.getTime() });
        }
        const entry = byDate.get(dateKey)!;
        if (point.platform) {
          entry[point.platform] = point.followers;
        } else {
          entry.followers = point.followers;
        }
      });

      return Array.from(byDate.values())
        .map((entry) => ({
          ...entry,
          date: new Date(entry.date as number),
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    // Aggregate view - sort by date
    return [...data]
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((point) => ({
        ...point,
        dateFormatted: point.date.toISOString().split('T')[0],
      }));
  }, [data, showPlatformBreakdown]);

  // Get unique platforms for multi-line chart
  const platforms = useMemo(() => {
    if (!showPlatformBreakdown) return [];
    const platformSet = new Set(data.map((d) => d.platform).filter(Boolean));
    return Array.from(platformSet) as PlatformType[];
  }, [data, showPlatformBreakdown]);

  // Calculate growth stats (only for aggregate view, not platform breakdown)
  const stats = useMemo(() => {
    // Skip stats calculation in platform breakdown mode or with insufficient data
    if (showPlatformBreakdown || chartData.length < 2) return null;

    const first = chartData[0] as GrowthDataPoint & { dateFormatted: string };
    const last = chartData[chartData.length - 1] as GrowthDataPoint & { dateFormatted: string };
    const startFollowers = first.followers || 0;
    const endFollowers = last.followers || 0;
    const netGrowth = endFollowers - startFollowers;
    const growthRate = startFollowers > 0 ? (netGrowth / startFollowers) * 100 : 0;

    return { startFollowers, endFollowers, netGrowth, growthRate };
  }, [chartData, showPlatformBreakdown]);

  // Format tick label based on period
  const formatXAxis = (date: Date): string => {
    if (period === '7d') {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    if (period === '30d') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    // 90d
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-100 rounded w-1/4" />
          <div className="h-[300px] bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="font-semibold text-charcoal text-lg mb-4">Audience Growth</h3>
        <div className="h-[200px] flex items-center justify-center text-slate-500">
          No growth data available yet. Connect a platform to track your audience.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      {/* Header with stats */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-charcoal text-lg">Audience Growth</h3>
          <p className="text-sm text-slate-500">
            {period === '7d' ? 'Last 7 days' : period === '30d' ? 'Last 30 days' : 'Last 90 days'}
          </p>
        </div>

        {stats && (
          <div className="text-right">
            <p
              className={`text-2xl font-bold ${
                stats.netGrowth > 0
                  ? 'text-emerald-600'
                  : stats.netGrowth < 0
                  ? 'text-red-500'
                  : 'text-slate-500'
              }`}
            >
              {stats.netGrowth > 0 ? '+' : ''}
              {stats.netGrowth.toLocaleString()}
            </p>
            <p className="text-sm text-slate-500">
              {stats.growthRate > 0 ? '+' : ''}
              {stats.growthRate.toFixed(1)}% growth
            </p>
          </div>
        )}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="coralGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CORAL_PRIMARY} stopOpacity={0.4} />
              <stop offset="100%" stopColor={CORAL_LIGHT} stopOpacity={0.1} />
            </linearGradient>

            {platforms.map((platform) => (
              <linearGradient
                key={`gradient-${platform}`}
                id={`gradient-${platform}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={PLATFORM_COLORS[platform] || CORAL_PRIMARY}
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor={PLATFORM_COLORS[platform] || CORAL_PRIMARY}
                  stopOpacity={0.05}
                />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />

          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
            minTickGap={40}
          />

          <YAxis
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            width={60}
            tickFormatter={(value) =>
              value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value.toString()
            }
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Reference line for starting point */}
          {stats && (
            <ReferenceLine
              y={stats.startFollowers}
              stroke="#94A3B8"
              strokeDasharray="5 5"
              strokeOpacity={0.5}
            />
          )}

          {/* Render areas */}
          {showPlatformBreakdown && platforms.length > 0 ? (
            platforms.map((platform) => (
              <Area
                key={platform}
                type="monotone"
                dataKey={platform}
                name={platform.charAt(0).toUpperCase() + platform.slice(1)}
                stroke={PLATFORM_COLORS[platform] || CORAL_PRIMARY}
                strokeWidth={2}
                fill={`url(#gradient-${platform})`}
                dot={false}
                activeDot={{
                  r: 5,
                  strokeWidth: 2,
                  fill: 'white',
                  stroke: PLATFORM_COLORS[platform] || CORAL_PRIMARY,
                }}
              />
            ))
          ) : (
            <Area
              type="monotone"
              dataKey="followers"
              name="followers"
              stroke={CORAL_PRIMARY}
              strokeWidth={2.5}
              fill="url(#coralGradient)"
              dot={false}
              activeDot={{
                r: 6,
                strokeWidth: 2,
                fill: 'white',
                stroke: CORAL_DARK,
              }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend for platform breakdown */}
      {showPlatformBreakdown && platforms.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-4 border-t border-slate-100">
          {platforms.map((platform) => (
            <div key={platform} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: PLATFORM_COLORS[platform] || CORAL_PRIMARY }}
              />
              <span className="text-sm text-slate-600">
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MINI SPARKLINE VARIANT
// =============================================================================

interface GrowthSparklineProps {
  data: GrowthDataPoint[];
  width?: number;
  height?: number;
  color?: string;
}

export function GrowthSparkline({
  data,
  width = 120,
  height = 40,
  color = CORAL_PRIMARY,
}: GrowthSparklineProps) {
  const chartData = useMemo(
    () =>
      [...data]
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map((point) => ({
          followers: point.followers,
          date: point.date.toISOString(),
        })),
    [data]
  );

  if (chartData.length < 2) return null;

  return (
    <ResponsiveContainer width={width} height={height}>
      <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <defs>
          <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="followers"
          stroke={color}
          strokeWidth={1.5}
          fill="url(#sparklineGradient)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

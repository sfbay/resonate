'use client';

/**
 * SummaryCards Component
 *
 * Displays key aggregate metrics for the coalition.
 */

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/db/supabase';

interface SummaryData {
  totalPublishers: number;
  activeConnections: number;
  totalReach: number;
  avgEngagement: number;
  totalPosts30d: number;
  badgesEarned: number;
}

export function SummaryCards() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const supabase = getSupabaseClient() as any;

        // Fetch publishers count
        const { count: publisherCount } = await supabase
          .from('publishers')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        // Fetch active connections count
        const { count: connectionCount } = await supabase
          .from('platform_connections')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        // Fetch latest metrics for reach
        const { data: metricsData } = await supabase
          .from('metrics_snapshots')
          .select('follower_count, engagement_rate')
          .order('recorded_at', { ascending: false })
          .limit(100) as { data: Array<{ follower_count: number | null; engagement_rate: number | null }> | null };

        // Calculate totals
        const totalReach = metricsData?.reduce(
          (sum: number, m: { follower_count: number | null }) => sum + (m.follower_count || 0),
          0
        ) || 0;

        const engagementRates = metricsData?.filter((m: { engagement_rate: number | null }) => m.engagement_rate) || [];
        const avgEngagement = engagementRates.length > 0
          ? engagementRates.reduce((sum: number, m: { engagement_rate: number | null }) => sum + Number(m.engagement_rate || 0), 0) / engagementRates.length
          : 0;

        // Fetch post count
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { count: postCount } = await supabase
          .from('content_performance')
          .select('*', { count: 'exact', head: true })
          .gte('published_at', thirtyDaysAgo.toISOString());

        // Fetch badges count
        const { count: badgeCount } = await supabase
          .from('growth_badges')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        setData({
          totalPublishers: publisherCount || 0,
          activeConnections: connectionCount || 0,
          totalReach: totalReach,
          avgEngagement: avgEngagement,
          totalPosts30d: postCount || 0,
          badgesEarned: badgeCount || 0,
        });
      } catch (error) {
        console.error('Failed to fetch summary:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSummary();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
            <div className="h-8 bg-slate-100 rounded mb-2" />
            <div className="h-4 bg-slate-100 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Coalition Publishers',
      value: data?.totalPublishers || 0,
      format: 'number',
      color: 'text-coral-500',
      bgColor: 'bg-coral-50',
    },
    {
      label: 'Platform Connections',
      value: data?.activeConnections || 0,
      format: 'number',
      color: 'text-teal-500',
      bgColor: 'bg-teal-50',
    },
    {
      label: 'Combined Reach',
      value: data?.totalReach || 0,
      format: 'compact',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Avg. Engagement',
      value: data?.avgEngagement || 0,
      format: 'percent',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Posts (30 days)',
      value: data?.totalPosts30d || 0,
      format: 'number',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Badges Earned',
      value: data?.badgesEarned || 0,
      format: 'number',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.bgColor} rounded-xl p-6 shadow-sm`}
        >
          <p className={`text-2xl font-bold ${card.color}`}>
            {formatValue(card.value, card.format)}
          </p>
          <p className="text-sm text-slate-600 mt-1">{card.label}</p>
        </div>
      ))}
    </div>
  );
}

function formatValue(value: number, format: string): string {
  switch (format) {
    case 'compact':
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
      return value.toLocaleString();
    case 'percent':
      return `${value.toFixed(1)}%`;
    default:
      return value.toLocaleString();
  }
}

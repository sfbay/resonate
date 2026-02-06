'use client';

/**
 * PublisherMetricsTable Component
 *
 * Leaderboard table showing all publishers with their metrics.
 */

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/db/supabase';

interface PublisherRow {
  id: string;
  name: string;
  platformCount: number;
  totalFollowers: number;
  avgEngagement: number;
  growth30d: number;
  badgeCount: number;
  lastSynced: Date | null;
  verified: boolean;
}

export function PublisherMetricsTable() {
  const [publishers, setPublishers] = useState<PublisherRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'followers' | 'engagement' | 'growth'>('followers');

  useEffect(() => {
    async function fetchPublishers() {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const supabase = getSupabaseClient() as any;

        // Fetch all active publishers
        const { data: pubData } = await supabase
          .from('publishers')
          .select('id, name')
          .eq('status', 'active') as { data: Array<{ id: string; name: string }> | null };

        if (!pubData) {
          setPublishers([]);
          return;
        }

        // For each publisher, fetch their metrics
        const rows: PublisherRow[] = await Promise.all(
          pubData.map(async (pub: { id: string; name: string }) => {
            // Fetch connections
            const { data: connections } = await supabase
              .from('platform_connections')
              .select('id, last_synced_at, verified')
              .eq('publisher_id', pub.id)
              .eq('status', 'active') as { data: Array<{ id: string; last_synced_at: string | null; verified: boolean }> | null };

            const platformCount = connections?.length || 0;
            const verified = connections?.some(c => c.verified) || false;
            const lastSynced = connections?.reduce<Date | null>((latest, c) => {
              if (!c.last_synced_at) return latest;
              const d = new Date(c.last_synced_at);
              return !latest || d > latest ? d : latest;
            }, null) ?? null;

            // Fetch latest metrics
            const { data: metrics } = await supabase
              .from('metrics_snapshots')
              .select('follower_count, engagement_rate')
              .eq('publisher_id', pub.id)
              .order('recorded_at', { ascending: false })
              .limit(20) as { data: Array<{ follower_count: number | null; engagement_rate: number | null }> | null };

            const totalFollowers = metrics?.reduce(
              (sum, m) => sum + (m.follower_count || 0),
              0
            ) || 0;

            const engagementRates = metrics?.filter(m => m.engagement_rate) || [];
            const avgEngagement = engagementRates.length > 0
              ? engagementRates.reduce((sum, m) => sum + Number(m.engagement_rate || 0), 0) / engagementRates.length
              : 0;

            // Fetch growth
            const { data: growth } = await supabase
              .from('growth_snapshots')
              .select('growth_rate_percent')
              .eq('publisher_id', pub.id)
              .eq('period_type', 'monthly')
              .limit(5) as { data: Array<{ growth_rate_percent: number | null }> | null };

            const growth30d = growth?.length
              ? growth.reduce((sum, g) => sum + Number(g.growth_rate_percent || 0), 0) / growth.length
              : 0;

            // Fetch badge count
            const { count: badgeCount } = await supabase
              .from('growth_badges')
              .select('*', { count: 'exact', head: true })
              .eq('publisher_id', pub.id)
              .eq('status', 'active');

            return {
              id: pub.id,
              name: pub.name,
              platformCount,
              totalFollowers,
              avgEngagement,
              growth30d,
              badgeCount: badgeCount || 0,
              lastSynced,
              verified,
            };
          })
        );

        // Sort by default
        rows.sort((a, b) => b.totalFollowers - a.totalFollowers);
        setPublishers(rows);
      } catch (error) {
        console.error('Failed to fetch publishers:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPublishers();
  }, []);

  // Sort publishers when sortBy changes
  useEffect(() => {
    setPublishers(prev => {
      const sorted = [...prev];
      switch (sortBy) {
        case 'followers':
          sorted.sort((a, b) => b.totalFollowers - a.totalFollowers);
          break;
        case 'engagement':
          sorted.sort((a, b) => b.avgEngagement - a.avgEngagement);
          break;
        case 'growth':
          sorted.sort((a, b) => b.growth30d - a.growth30d);
          break;
      }
      return sorted;
    });
  }, [sortBy]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="animate-pulse p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Sort Controls */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4">
        <span className="text-sm text-slate-500">Sort by:</span>
        {(['followers', 'engagement', 'growth'] as const).map((option) => (
          <button
            key={option}
            onClick={() => setSortBy(option)}
            className={`text-sm px-3 py-1 rounded-lg transition-colors ${
              sortBy === option
                ? 'bg-coral-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left">#</th>
              <th className="px-6 py-3 text-left">Publisher</th>
              <th className="px-6 py-3 text-center">Platforms</th>
              <th className="px-6 py-3 text-right">Followers</th>
              <th className="px-6 py-3 text-right">Engagement</th>
              <th className="px-6 py-3 text-right">30d Growth</th>
              <th className="px-6 py-3 text-center">Badges</th>
              <th className="px-6 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {publishers.map((pub, index) => (
              <tr key={pub.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-400">
                  {index + 1}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-coral-400 to-coral-600 flex items-center justify-center text-white font-bold text-sm">
                      {pub.name.charAt(0)}
                    </div>
                    <span className="font-medium text-charcoal">{pub.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                    {pub.platformCount}
                    <span className="text-xs text-slate-400">connected</span>
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-charcoal">
                  {formatNumber(pub.totalFollowers)}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={pub.avgEngagement > 5 ? 'text-emerald-600 font-semibold' : 'text-slate-600'}>
                    {pub.avgEngagement.toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`font-semibold ${
                    pub.growth30d > 0 ? 'text-emerald-600' :
                    pub.growth30d < 0 ? 'text-red-500' : 'text-slate-500'
                  }`}>
                    {pub.growth30d > 0 ? '+' : ''}{pub.growth30d.toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {pub.badgeCount > 0 ? (
                    <span className="inline-flex items-center gap-1 text-sm text-amber-600">
                      🏆 {pub.badgeCount}
                    </span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {pub.verified ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Self-reported</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

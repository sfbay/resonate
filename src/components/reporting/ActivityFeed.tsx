'use client';

/**
 * ActivityFeed Component
 *
 * Shows recent platform connections, syncs, and content activity.
 */

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/db/supabase';

interface ActivityItem {
  id: string;
  type: 'connection' | 'sync' | 'content' | 'badge';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  color: string;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const supabase = getSupabaseClient();
        const items: ActivityItem[] = [];

        // Fetch recent connections
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: connections } = await (supabase as any)
          .from('platform_connections')
          .select('id, platform, handle, connected_at, last_synced_at, publisher_id')
          .eq('status', 'active')
          .order('connected_at', { ascending: false })
          .limit(10) as { data: Array<{
            id: string;
            platform: string;
            handle: string;
            connected_at: string;
            last_synced_at: string | null;
            publisher_id: string;
          }> | null };

        // Get publisher names
        const publisherIds = [...new Set(connections?.map(c => c.publisher_id) || [])];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: publishers } = await (supabase as any)
          .from('publishers')
          .select('id, name')
          .in('id', publisherIds) as { data: Array<{ id: string; name: string }> | null };

        const publisherMap = new Map(publishers?.map(p => [p.id, p.name]) || []);

        // Add connection events
        connections?.forEach(conn => {
          const publisherName = publisherMap.get(conn.publisher_id) || 'Unknown';
          items.push({
            id: `conn-${conn.id}`,
            type: 'connection',
            title: `${publisherName} connected ${conn.platform}`,
            description: conn.handle || 'New platform connection',
            timestamp: new Date(conn.connected_at),
            icon: '🔗',
            color: 'bg-teal-50 text-teal-600',
          });
        });

        // Add sync events (from connections with recent sync)
        connections?.filter(c => c.last_synced_at !== null).forEach(conn => {
          const publisherName = publisherMap.get(conn.publisher_id) || 'Unknown';
          items.push({
            id: `sync-${conn.id}`,
            type: 'sync',
            title: `${conn.platform} synced`,
            description: `${publisherName} - Metrics updated`,
            timestamp: new Date(conn.last_synced_at!),
            icon: '🔄',
            color: 'bg-blue-50 text-blue-600',
          });
        });

        // Fetch recent badges
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: badges } = await (supabase as any)
          .from('growth_badges')
          .select('id, badge_type, tier, platform, awarded_at, publisher_id')
          .eq('status', 'active')
          .order('awarded_at', { ascending: false })
          .limit(5) as { data: Array<{
            id: string;
            badge_type: string;
            tier: string | null;
            platform: string;
            awarded_at: string;
            publisher_id: string;
          }> | null };

        badges?.forEach(badge => {
          const publisherName = publisherMap.get(badge.publisher_id) || 'Unknown';
          const badgeLabel = badge.badge_type.replace(/_/g, ' ');
          items.push({
            id: `badge-${badge.id}`,
            type: 'badge',
            title: `${publisherName} earned ${badgeLabel}`,
            description: badge.tier ? `${badge.tier} tier` : 'Achievement unlocked',
            timestamp: new Date(badge.awarded_at),
            icon: '🏆',
            color: 'bg-amber-50 text-amber-600',
          });
        });

        // Sort by timestamp
        items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        setActivities(items.slice(0, 15));
      } catch (error) {
        console.error('Failed to fetch activity:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchActivity();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-10 h-10 bg-slate-100 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 bg-slate-100 rounded mb-2 w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 max-h-[600px] overflow-y-auto">
      {activities.length === 0 ? (
        <p className="text-center text-slate-500 py-8">
          No recent activity
        </p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg ${activity.color} flex items-center justify-center text-lg`}>
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-charcoal text-sm truncate">
                  {activity.title}
                </p>
                <p className="text-xs text-slate-500">{activity.description}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {formatTimeAgo(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

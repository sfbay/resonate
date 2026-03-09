'use client';

import { useState, useEffect } from 'react';
import type { UnitStatus, ChannelGroup } from '@/lib/channels/types';
import { UNIT_STATUS_LABELS } from '@/lib/channels';

interface UnitMetrics {
  id: string;
  formatKey: string;
  formatLabel: string;
  channelGroup: ChannelGroup;
  platform: string;
  publisherName: string;
  status: UnitStatus;
  metrics?: {
    impressions?: number;
    reach?: number;
    engagement?: number;
    clicks?: number;
  };
  trackedCtaUrl?: string;
  deliveredAt?: string;
}

interface PerformanceDashboardProps {
  campaignId: string;
}

const GROUP_COLORS: Record<ChannelGroup, string> = {
  social: 'bg-blue-100 text-blue-700',
  display: 'bg-purple-100 text-purple-700',
  audio_video: 'bg-orange-100 text-orange-700',
};

function StatBlock({ label, value, sublabel }: { label: string; value: string | number; sublabel?: string }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
    </div>
  );
}

export function PerformanceDashboard({ campaignId }: PerformanceDashboardProps) {
  const [units, setUnits] = useState<UnitMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/campaigns/${campaignId}/units`)
      .then(res => res.json())
      .then(data => {
        const mapped = (Array.isArray(data) ? data : []).map((u: Record<string, unknown>) => ({
          id: u.id as string,
          formatKey: u.format_key as string,
          formatLabel: (u.format_key as string || '').replace(/_/g, ' '),
          channelGroup: u.channel_group as ChannelGroup,
          platform: u.platform as string,
          publisherName: (u.publisher_id as string || '').slice(-4), // Short ID until we join publisher names
          status: u.status as UnitStatus,
          metrics: (u.proof as Record<string, unknown>)?.metrics as UnitMetrics['metrics'],
          trackedCtaUrl: (u.creative_assets as Record<string, unknown>)?.trackedCtaUrl as string,
          deliveredAt: u.delivered_at as string,
        }));
        setUnits(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [campaignId]);

  // Aggregate stats
  const delivered = units.filter(u => u.status === 'delivered');
  const totalImpressions = delivered.reduce((sum, u) => sum + (u.metrics?.impressions || 0), 0);
  const totalReach = delivered.reduce((sum, u) => sum + (u.metrics?.reach || 0), 0);
  const totalEngagement = delivered.reduce((sum, u) => sum + (u.metrics?.engagement || 0), 0);
  const totalClicks = delivered.reduce((sum, u) => sum + (u.metrics?.clicks || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500" />
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-sm">No units in this campaign yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBlock label="Impressions" value={totalImpressions} sublabel="Publisher-reported" />
        <StatBlock label="Reach" value={totalReach} sublabel="Publisher-reported" />
        <StatBlock label="Engagement" value={totalEngagement} sublabel="Publisher-reported" />
        <StatBlock label="Clicks" value={totalClicks} sublabel={totalClicks > 0 ? 'Tracked + reported' : 'No clicks yet'} />
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Units ({units.length}) &middot; {delivered.length} delivered
        </h3>
      </div>

      {/* Per-unit cards */}
      <div className="space-y-3">
        {units.map(unit => {
          const statusDisplay = UNIT_STATUS_LABELS[unit.status] || { label: unit.status, color: 'gray' };
          const hasMetrics = unit.metrics && Object.values(unit.metrics).some(v => v && v > 0);

          return (
            <div key={unit.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${GROUP_COLORS[unit.channelGroup]}`}>
                  {unit.channelGroup === 'audio_video' ? 'Audio/Video' : unit.channelGroup.charAt(0).toUpperCase() + unit.channelGroup.slice(1)}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {unit.formatLabel}
                </span>
                <span className="text-xs text-gray-400">
                  {unit.platform}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ml-auto ${
                  statusDisplay.color === 'green' ? 'bg-emerald-50 text-emerald-700' :
                  statusDisplay.color === 'blue' ? 'bg-blue-50 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {statusDisplay.label}
                </span>
              </div>

              {unit.status === 'delivered' && hasMetrics ? (
                <div className="grid grid-cols-4 gap-3 mt-3">
                  <div>
                    <p className="text-xs text-gray-400">Impressions</p>
                    <p className="text-sm font-semibold text-gray-900">{(unit.metrics?.impressions || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Reach</p>
                    <p className="text-sm font-semibold text-gray-900">{(unit.metrics?.reach || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Engagement</p>
                    <p className="text-sm font-semibold text-gray-900">{(unit.metrics?.engagement || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Clicks</p>
                    <p className="text-sm font-semibold text-gray-900">{(unit.metrics?.clicks || 0).toLocaleString()}</p>
                  </div>
                </div>
              ) : unit.status === 'delivered' ? (
                <p className="text-xs text-gray-400 mt-2 italic">Delivered — metrics pending</p>
              ) : (
                <p className="text-xs text-gray-400 mt-2 italic">Awaiting delivery</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

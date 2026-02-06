'use client';

/**
 * WatchdogAlerts Component
 *
 * Shows data quality indicators, anomalies, and transparency features.
 */

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/db/supabase';

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'success' | 'anomaly';
  title: string;
  description: string;
  icon: string;
  action?: {
    label: string;
    href: string;
  };
}

interface DataQuality {
  totalPublishers: number;
  verifiedPublishers: number;
  staleConnections: number;
  recentSyncs: number;
  growthAnomalies: number;
}

export function WatchdogAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [quality, setQuality] = useState<DataQuality | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const supabase = getSupabaseClient();
        const newAlerts: Alert[] = [];

        // Fetch data quality metrics
        const { count: totalPublishers } = await supabase
          .from('publishers')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        // Verified connections
        const { count: verifiedCount } = await supabase
          .from('platform_connections')
          .select('*', { count: 'exact', head: true })
          .eq('verified', true)
          .eq('status', 'active');

        // Stale connections (not synced in 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const { count: staleCount } = await supabase
          .from('platform_connections')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')
          .lt('last_synced_at', weekAgo.toISOString());

        // Recent syncs (last 24 hours)
        const dayAgo = new Date();
        dayAgo.setDate(dayAgo.getDate() - 1);

        const { count: recentSyncs } = await supabase
          .from('platform_connections')
          .select('*', { count: 'exact', head: true })
          .gte('last_synced_at', dayAgo.toISOString());

        // Check for growth anomalies (>50% growth in 30 days)
        const { count: anomalyCount } = await supabase
          .from('growth_snapshots')
          .select('*', { count: 'exact', head: true })
          .eq('period_type', 'monthly')
          .gt('growth_rate_percent', 50);

        setQuality({
          totalPublishers: totalPublishers || 0,
          verifiedPublishers: verifiedCount || 0,
          staleConnections: staleCount || 0,
          recentSyncs: recentSyncs || 0,
          growthAnomalies: anomalyCount || 0,
        });

        // Generate alerts based on data quality

        // Verification rate
        const verificationRate = totalPublishers
          ? ((verifiedCount || 0) / totalPublishers) * 100
          : 0;

        if (verificationRate >= 80) {
          newAlerts.push({
            id: 'verification-good',
            type: 'success',
            title: 'High Verification Rate',
            description: `${verificationRate.toFixed(0)}% of publisher connections are OAuth verified.`,
            icon: '✓',
          });
        } else if (verificationRate >= 50) {
          newAlerts.push({
            id: 'verification-medium',
            type: 'info',
            title: 'Moderate Verification',
            description: `${verificationRate.toFixed(0)}% verified. Encourage more publishers to connect via OAuth.`,
            icon: '📊',
          });
        } else {
          newAlerts.push({
            id: 'verification-low',
            type: 'warning',
            title: 'Low Verification Rate',
            description: `Only ${verificationRate.toFixed(0)}% of connections are OAuth verified.`,
            icon: '⚠️',
          });
        }

        // Stale data alert
        if ((staleCount || 0) > 0) {
          newAlerts.push({
            id: 'stale-data',
            type: 'warning',
            title: 'Stale Data Detected',
            description: `${staleCount} connection${staleCount !== 1 ? 's' : ''} haven't synced in 7+ days.`,
            icon: '⏰',
          });
        }

        // Growth anomalies
        if ((anomalyCount || 0) > 0) {
          newAlerts.push({
            id: 'growth-anomaly',
            type: 'anomaly',
            title: 'Unusual Growth Detected',
            description: `${anomalyCount} publisher${anomalyCount !== 1 ? 's show' : ' shows'} >50% monthly growth. Review for accuracy.`,
            icon: '📈',
          });
        }

        // Recent activity
        if ((recentSyncs || 0) > 5) {
          newAlerts.push({
            id: 'active-syncs',
            type: 'success',
            title: 'Active Data Sync',
            description: `${recentSyncs} connections synced in the last 24 hours.`,
            icon: '🔄',
          });
        }

        setAlerts(newAlerts);
      } catch (error) {
        console.error('Failed to fetch watchdog data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAlerts();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      {/* Data Quality Indicators */}
      {quality && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 pb-6 border-b border-slate-100">
          <QualityIndicator
            label="Total Publishers"
            value={quality.totalPublishers}
            status="neutral"
          />
          <QualityIndicator
            label="OAuth Verified"
            value={quality.verifiedPublishers}
            status={quality.verifiedPublishers > quality.totalPublishers * 0.5 ? 'good' : 'warning'}
          />
          <QualityIndicator
            label="Stale Data"
            value={quality.staleConnections}
            status={quality.staleConnections === 0 ? 'good' : 'warning'}
          />
          <QualityIndicator
            label="24h Syncs"
            value={quality.recentSyncs}
            status={quality.recentSyncs > 5 ? 'good' : 'neutral'}
          />
          <QualityIndicator
            label="Anomalies"
            value={quality.growthAnomalies}
            status={quality.growthAnomalies === 0 ? 'good' : 'warning'}
          />
        </div>
      )}

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </div>

      {alerts.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <div className="text-4xl mb-2">✓</div>
          <p>All systems healthy. No alerts at this time.</p>
        </div>
      )}
    </div>
  );
}

function QualityIndicator({
  label,
  value,
  status,
}: {
  label: string;
  value: number;
  status: 'good' | 'warning' | 'neutral';
}) {
  const statusColors = {
    good: 'text-emerald-600',
    warning: 'text-amber-600',
    neutral: 'text-slate-600',
  };

  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${statusColors[status]}`}>
        {value}
      </p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function AlertCard({ alert }: { alert: Alert }) {
  const typeStyles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    anomaly: 'bg-purple-50 border-purple-200 text-purple-800',
  };

  return (
    <div className={`rounded-lg border p-4 ${typeStyles[alert.type]}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{alert.icon}</span>
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{alert.title}</h4>
          <p className="text-xs opacity-80 mt-1">{alert.description}</p>
          {alert.action && (
            <a
              href={alert.action.href}
              className="inline-block mt-2 text-xs font-medium underline hover:no-underline"
            >
              {alert.action.label}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

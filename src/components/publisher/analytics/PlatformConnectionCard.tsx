'use client';

/**
 * PlatformConnectionCard Component
 *
 * Shows a connected platform with its metrics, or a connect button if not linked.
 */

import type { Platform, PlatformConnection, MetricsSnapshot } from '@/types';

interface PlatformConnectionCardProps {
  platform: Platform;
  connection: PlatformConnection | null;
  latestMetrics: MetricsSnapshot | null;
  publisherId: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

const PLATFORM_INFO: Record<
  Platform,
  { name: string; icon: string; color: string; bgColor: string }
> = {
  instagram: {
    name: 'Instagram',
    icon: '📸',
    color: 'text-pink-600',
    bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500',
  },
  facebook: {
    name: 'Facebook',
    icon: '👤',
    color: 'text-blue-600',
    bgColor: 'bg-blue-600',
  },
  tiktok: {
    name: 'TikTok',
    icon: '🎵',
    color: 'text-black',
    bgColor: 'bg-black',
  },
  twitter: {
    name: 'X / Twitter',
    icon: '𝕏',
    color: 'text-black',
    bgColor: 'bg-black',
  },
  youtube: {
    name: 'YouTube',
    icon: '▶️',
    color: 'text-red-600',
    bgColor: 'bg-red-600',
  },
  newsletter: {
    name: 'Newsletter',
    icon: '📧',
    color: 'text-teal-600',
    bgColor: 'bg-teal-600',
  },
  mailchimp: {
    name: 'Mailchimp',
    icon: '🐵',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-400',
  },
  substack: {
    name: 'Substack',
    icon: '📰',
    color: 'text-orange-600',
    bgColor: 'bg-orange-500',
  },
  whatsapp: {
    name: 'WhatsApp',
    icon: '💬',
    color: 'text-green-600',
    bgColor: 'bg-green-500',
  },
  telegram: {
    name: 'Telegram',
    icon: '✈️',
    color: 'text-sky-500',
    bgColor: 'bg-sky-500',
  },
  signal: {
    name: 'Signal',
    icon: '🔒',
    color: 'text-blue-700',
    bgColor: 'bg-blue-700',
  },
  sms: {
    name: 'SMS',
    icon: '📱',
    color: 'text-gray-600',
    bgColor: 'bg-gray-600',
  },
  weibo: {
    name: 'Weibo',
    icon: '微',
    color: 'text-red-500',
    bgColor: 'bg-red-500',
  },
  website: {
    name: 'Website',
    icon: '🌐',
    color: 'text-slate-600',
    bgColor: 'bg-slate-600',
  },
  other: {
    name: 'Other',
    icon: '📢',
    color: 'text-slate-500',
    bgColor: 'bg-slate-500',
  },
  google: {
    name: 'Google Analytics',
    icon: '📊',
    color: 'text-orange-500',
    bgColor: 'bg-gradient-to-br from-yellow-400 to-orange-500',
  },
};

function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return '--';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

function formatDate(date: Date | string | undefined | null): string {
  if (!date) return 'Never';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function PlatformConnectionCard({
  platform,
  connection,
  latestMetrics,
  publisherId,
  onConnect,
  onDisconnect,
}: PlatformConnectionCardProps) {
  const info = PLATFORM_INFO[platform] || PLATFORM_INFO.other;
  const isConnected = connection?.status === 'active';
  const isExpired = connection?.status === 'expired';

  const handleConnect = () => {
    if (onConnect) {
      onConnect();
    } else {
      // Default: redirect to OAuth
      window.location.href = `/api/auth/${platform}?publisherId=${publisherId}&returnUrl=${encodeURIComponent(window.location.pathname)}`;
    }
  };

  if (!isConnected && !isExpired) {
    // Not connected state
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border-2 border-dashed border-slate-200 hover:border-coral-400 transition-colors">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xl">
            {info.icon}
          </div>
          <div>
            <h3 className="font-semibold text-charcoal">{info.name}</h3>
            <p className="text-xs text-slate-500">Not connected</p>
          </div>
        </div>

        <button
          onClick={handleConnect}
          className="w-full btn btn-coral text-sm py-2"
        >
          Connect {info.name}
        </button>
      </div>
    );
  }

  // Connected or expired state
  return (
    <div className="bg-white rounded-xl p-5 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg ${info.bgColor} flex items-center justify-center text-white text-xl`}
          >
            {info.icon}
          </div>
          <div>
            <h3 className="font-semibold text-charcoal">{info.name}</h3>
            <p className="text-xs text-slate-500">
              {connection?.handle || 'Connected'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isExpired ? (
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
              Reconnect needed
            </span>
          ) : (
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              Verified
            </span>
          )}
        </div>
      </div>

      {/* Metrics */}
      {latestMetrics && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <p className="text-lg font-bold text-charcoal">
              {formatNumber(latestMetrics.followerCount || latestMetrics.subscriberCount)}
            </p>
            <p className="text-xs text-slate-500">
              {latestMetrics.subscriberCount ? 'Subscribers' : 'Followers'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-charcoal">
              {latestMetrics.engagementRate
                ? `${latestMetrics.engagementRate.toFixed(1)}%`
                : latestMetrics.openRate
                ? `${(latestMetrics.openRate * 100).toFixed(0)}%`
                : '--'}
            </p>
            <p className="text-xs text-slate-500">
              {latestMetrics.openRate ? 'Open Rate' : 'Engagement'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-charcoal">
              {formatNumber(latestMetrics.postCount)}
            </p>
            <p className="text-xs text-slate-500">Posts</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
        <span>Last synced: {formatDate(connection?.lastSyncedAt)}</span>
        <div className="flex gap-2">
          <button
            className="text-coral-500 hover:text-coral-600 font-medium"
            onClick={() => window.location.reload()}
          >
            Sync
          </button>
          {onDisconnect && (
            <button
              className="text-slate-400 hover:text-slate-600"
              onClick={onDisconnect}
            >
              Disconnect
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

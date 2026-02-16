'use client';

/**
 * Deliverables View
 *
 * Grid of deliverable cards per order showing type, status, URL, and metrics.
 * Aggregate metrics row at top.
 */

interface Deliverable {
  id: string;
  status: string;
  url?: string;
  metrics?: {
    impressions?: number;
    reach?: number;
    engagement?: number;
    clicks?: number;
  };
  deliverableType?: string;
  platform?: string;
}

interface DeliverablesViewProps {
  deliverables: Deliverable[];
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Pending' },
  submitted: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Submitted' },
  approved: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Approved' },
  revision_requested: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Revision' },
};

const PLATFORM_ICONS: Record<string, string> = {
  instagram: 'IG',
  facebook: 'FB',
  tiktok: 'TT',
  twitter: 'X',
  youtube: 'YT',
  newsletter: 'NL',
  website: 'WB',
  whatsapp: 'WA',
  print: 'PR',
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function formatTypeName(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function DeliverablesView({ deliverables }: DeliverablesViewProps) {
  if (deliverables.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-slate-400">No deliverables yet</p>
      </div>
    );
  }

  // Aggregate metrics
  const totals = deliverables.reduce(
    (acc, d) => {
      if (d.metrics) {
        acc.impressions += d.metrics.impressions || 0;
        acc.reach += d.metrics.reach || 0;
        acc.engagement += d.metrics.engagement || 0;
        acc.clicks += d.metrics.clicks || 0;
      }
      return acc;
    },
    { impressions: 0, reach: 0, engagement: 0, clicks: 0 }
  );

  const hasMetrics = totals.impressions > 0 || totals.reach > 0;

  return (
    <div className="space-y-4">
      {/* Aggregate Metrics */}
      {hasMetrics && (
        <div className="grid grid-cols-4 gap-3">
          <MetricBlock label="Impressions" value={totals.impressions} />
          <MetricBlock label="Reach" value={totals.reach} />
          <MetricBlock label="Engagements" value={totals.engagement} />
          <MetricBlock label="Clicks" value={totals.clicks} />
        </div>
      )}

      {/* Deliverable Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {deliverables.map(d => {
          const statusStyle = STATUS_STYLES[d.status] || STATUS_STYLES.pending;
          const platformIcon = d.platform ? PLATFORM_ICONS[d.platform] || d.platform.slice(0, 2).toUpperCase() : '??';

          return (
            <div key={d.id} className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-slate-500">
                    {platformIcon}
                  </span>
                  <span className="text-xs font-medium text-[var(--color-charcoal)]">
                    {d.deliverableType ? formatTypeName(d.deliverableType) : 'Deliverable'}
                  </span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                  {statusStyle.label}
                </span>
              </div>

              {d.url && (
                <a
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-teal-600 hover:underline truncate block mb-2"
                >
                  {d.url}
                </a>
              )}

              {d.metrics && (d.metrics.impressions || d.metrics.reach || d.metrics.clicks) && (
                <div className="flex gap-3 text-[10px] text-slate-400">
                  {d.metrics.impressions !== undefined && d.metrics.impressions > 0 && (
                    <span>{formatNumber(d.metrics.impressions)} imp.</span>
                  )}
                  {d.metrics.reach !== undefined && d.metrics.reach > 0 && (
                    <span>{formatNumber(d.metrics.reach)} reach</span>
                  )}
                  {d.metrics.clicks !== undefined && d.metrics.clicks > 0 && (
                    <span>{formatNumber(d.metrics.clicks)} clicks</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MetricBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3 text-center">
      <p className="text-[10px] text-slate-400 font-medium">{label}</p>
      <p className="text-lg font-bold text-[var(--color-charcoal)]">{formatNumber(value)}</p>
    </div>
  );
}

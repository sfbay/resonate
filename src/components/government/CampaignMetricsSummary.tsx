'use client';

/**
 * Campaign Metrics Summary
 *
 * Dashboard card showing aggregate campaign health metrics:
 * publishers engaged, orders by status, spend vs budget, deliverable metrics.
 */

interface OrderData {
  id: string;
  status: string;
  total: number;
  deliverables?: { id: string; status: string }[];
}

interface CampaignMetricsSummaryProps {
  matchCount: number;
  orders: OrderData[];
  budgetRange?: { min: number; max: number } | null;
  dates?: { start: string; end: string } | null;
}

function formatCurrency(cents: number): string {
  return '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function CampaignMetricsSummary({
  matchCount,
  orders,
  budgetRange,
  dates,
}: CampaignMetricsSummaryProps) {
  // Aggregate order metrics
  const totalSpend = orders
    .filter(o => !['draft', 'cancelled', 'rejected'].includes(o.status))
    .reduce((sum, o) => sum + o.total, 0);
  const budget = budgetRange?.max || 0;
  const spendPercent = budget > 0 ? Math.round((totalSpend / budget) * 100) : 0;

  // Order status breakdown
  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Deliverable status breakdown
  const deliverableStatuses = orders.flatMap(o => o.deliverables || []);
  const totalDeliverables = deliverableStatuses.length;
  const completedDeliverables = deliverableStatuses.filter(d => d.status === 'approved' || d.status === 'completed').length;

  // Campaign timeline
  const today = new Date();
  let timelinePercent = 0;
  let timelineLabel = '';
  if (dates?.start && dates?.end) {
    const start = new Date(dates.start);
    const end = new Date(dates.end);
    const total = end.getTime() - start.getTime();
    const elapsed = today.getTime() - start.getTime();
    timelinePercent = total > 0 ? Math.max(0, Math.min(100, Math.round((elapsed / total) * 100))) : 0;
    if (today < start) timelineLabel = 'Not started';
    else if (today > end) timelineLabel = 'Completed';
    else timelineLabel = `Day ${Math.ceil(elapsed / 86400000)} of ${Math.ceil(total / 86400000)}`;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Publishers Engaged */}
        <div>
          <p className="text-xs text-slate-400 font-medium">Publishers</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-[var(--color-charcoal)] font-[family-name:var(--font-fraunces)]">
              {orders.length}
            </span>
            <span className="text-xs text-slate-400">of {matchCount} matched</span>
          </div>
        </div>

        {/* Spend vs Budget */}
        <div>
          <p className="text-xs text-slate-400 font-medium">Budget Used</p>
          <p className="text-2xl font-bold text-[var(--color-charcoal)] font-[family-name:var(--font-fraunces)] mt-1">
            {budget > 0 ? `${spendPercent}%` : formatCurrency(totalSpend)}
          </p>
          {budget > 0 && (
            <div className="mt-1">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${spendPercent > 90 ? 'bg-amber-500' : 'bg-teal-500'}`}
                  style={{ width: `${Math.min(100, spendPercent)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {formatCurrency(totalSpend)} of {formatCurrency(budget)}
              </p>
            </div>
          )}
        </div>

        {/* Orders by Status */}
        <div>
          <p className="text-xs text-slate-400 font-medium">Orders</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-[var(--color-charcoal)] font-[family-name:var(--font-fraunces)]">
              {orders.length}
            </span>
          </div>
          {Object.keys(statusCounts).length > 0 && (
            <div className="flex gap-1.5 mt-1 flex-wrap">
              {Object.entries(statusCounts).map(([status, count]) => (
                <span key={status} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                  {count} {status.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Deliverables / Timeline */}
        <div>
          {totalDeliverables > 0 ? (
            <>
              <p className="text-xs text-slate-400 font-medium">Deliverables</p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-bold text-[var(--color-charcoal)] font-[family-name:var(--font-fraunces)]">
                  {completedDeliverables}
                </span>
                <span className="text-xs text-slate-400">of {totalDeliverables}</span>
              </div>
            </>
          ) : dates ? (
            <>
              <p className="text-xs text-slate-400 font-medium">Timeline</p>
              <p className="text-sm font-medium text-[var(--color-charcoal)] mt-1">{timelineLabel}</p>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: `${timelinePercent}%` }} />
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-400 font-medium">Status</p>
              <p className="text-sm font-medium text-[var(--color-charcoal)] mt-1">Active</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

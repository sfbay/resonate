'use client';

import type { VendorYearRow } from '@/lib/socrata/types';

function formatDollars(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  return `$${amount.toFixed(0)}`;
}

interface Props {
  yearData: VendorYearRow[];
}

export function SpendingTimeline({ yearData }: Props) {
  const rows = yearData.map((r) => ({
    fy: r.fiscal_year,
    amount: parseFloat(r.total_paid) || 0,
    count: parseInt(r.payment_count) || 0,
  }));

  const maxAmount = Math.max(...rows.map((r) => r.amount), 1);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
        Spending by Fiscal Year
      </h3>
      {rows.length === 0 ? (
        <p className="text-slate-400 text-sm italic">No payment records found.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row, i) => {
            const widthPct = (row.amount / maxAmount) * 100;
            const prev = i > 0 ? rows[i - 1].amount : null;
            const yoy = prev && prev > 0
              ? ((row.amount - prev) / prev) * 100
              : null;

            return (
              <div key={row.fy} className="flex items-center gap-3">
                <span className="text-sm text-slate-600 w-16 shrink-0 font-medium">
                  FY{row.fy}
                </span>
                <div className="flex-1 h-7 bg-slate-100 rounded-md overflow-hidden relative">
                  <div
                    className="h-full bg-coral-400 rounded-md transition-all duration-500"
                    style={{ width: `${Math.max(widthPct, 2)}%` }}
                  />
                  <span className="absolute inset-y-0 left-2 flex items-center text-xs font-medium text-slate-700">
                    {formatDollars(row.amount)}
                  </span>
                </div>
                <span className="text-xs text-slate-400 w-20 text-right shrink-0">
                  {row.count} payment{row.count !== 1 ? 's' : ''}
                </span>
                {yoy !== null && (
                  <span
                    className={`text-xs font-medium w-16 text-right shrink-0 ${
                      yoy >= 0 ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    {yoy >= 0 ? '+' : ''}{yoy.toFixed(0)}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

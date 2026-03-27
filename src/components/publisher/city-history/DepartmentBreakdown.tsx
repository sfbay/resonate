'use client';

import type { VendorDeptRow } from '@/lib/socrata/types';

function formatDollars(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  return `$${amount.toFixed(0)}`;
}

function shortDept(name: string): string {
  return name
    .replace('GSA - City Administrator', 'City Admin')
    .replace('Municipal Transportation Agency', 'MTA')
    .replace('Human Services Agency', 'HSA')
    .replace('Board of Supervisors', 'BOS')
    .replace('Public Utilities Commission', 'PUC')
    .replace('Arts Commission', 'Arts')
    .replace('Children;Youth & Families', 'CYF');
}

interface Props {
  deptData: VendorDeptRow[];
}

export function DepartmentBreakdown({ deptData }: Props) {
  const rows = deptData.map((r) => ({
    department: r.department,
    amount: parseFloat(r.total_paid) || 0,
    count: parseInt(r.payment_count) || 0,
  }));

  const total = rows.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
        Departments
      </h3>
      {rows.length === 0 ? (
        <p className="text-slate-400 text-sm italic">No department data.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => {
            const pct = total > 0 ? (row.amount / total) * 100 : 0;
            return (
              <div key={row.department} className="flex items-center gap-3">
                <span className="text-sm text-slate-700 w-36 shrink-0 truncate" title={row.department}>
                  {shortDept(row.department)}
                </span>
                <div className="flex-1 h-6 bg-slate-100 rounded overflow-hidden">
                  <div
                    className="h-full bg-teal-400 rounded"
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-700 w-20 text-right shrink-0">
                  {formatDollars(row.amount)}
                </span>
                <span className="text-xs text-slate-400 w-12 text-right shrink-0">
                  {pct.toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

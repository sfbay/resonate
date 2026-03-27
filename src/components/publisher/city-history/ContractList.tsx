'use client';

import { useState } from 'react';
import type { SupplierContractRecord } from '@/lib/socrata/types';

function formatDollars(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  return `$${amount.toFixed(0)}`;
}

function formatDate(iso: string): string {
  if (!iso) return '\u2014';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

interface Props {
  contracts: SupplierContractRecord[];
}

export function ContractList({ contracts }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (contracts.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
          Contracts
        </h3>
        <p className="text-slate-400 text-sm italic">No contracts found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
        Contracts ({contracts.length})
      </h3>
      <div className="space-y-2">
        {contracts.map((c) => {
          const agreed = parseFloat(c.agreed_amt) || 0;
          const paid = parseFloat(c.pmt_amt) || 0;
          const isExpanded = expandedId === c.contract_no;

          return (
            <button
              key={c.contract_no}
              onClick={() => setExpandedId(isExpanded ? null : c.contract_no)}
              className="w-full text-left bg-white border border-slate-200 rounded-lg p-3 hover:border-coral-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {c.contract_title || c.contract_no}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {c.department} &middot; {formatDate(c.term_start_date)} &ndash; {formatDate(c.term_end_date)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-slate-800">{formatDollars(agreed)}</p>
                  <p className="text-xs text-slate-400">agreed</p>
                </div>
              </div>
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-slate-400">Paid</p>
                    <p className="font-medium text-slate-700">{formatDollars(paid)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Remaining</p>
                    <p className="font-medium text-slate-700">{formatDollars(parseFloat(c.remaining_amt) || 0)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Utilization</p>
                    <p className="font-medium text-slate-700">
                      {agreed > 0 ? `${((paid / agreed) * 100).toFixed(0)}%` : '\u2014'}
                    </p>
                  </div>
                  {c.scope_of_work && (
                    <div className="col-span-3 mt-1">
                      <p className="text-slate-400">Scope</p>
                      <p className="text-slate-600 mt-0.5">{c.scope_of_work}</p>
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

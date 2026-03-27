'use client';

import { useState } from 'react';
import { useCityHistory } from '@/hooks/use-city-history';
import { isRegisteredVendor } from '@/lib/socrata/vendor-names';
import { SpendingTimeline } from './SpendingTimeline';
import { DepartmentBreakdown } from './DepartmentBreakdown';
import { ContractList } from './ContractList';
import type { VendorMetrics } from '@/lib/socrata/types';

function formatDollars(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  return `$${amount.toFixed(0)}`;
}

function MetricsCards({ metrics }: { metrics: VendorMetrics }) {
  const cards = [
    { label: 'Lifetime Total', value: formatDollars(metrics.lifetimeTotal) },
    { label: 'Years Active', value: String(metrics.fiscalYears) },
    { label: 'Avg Annual', value: formatDollars(metrics.avgAnnual) },
    {
      label: 'YoY Change',
      value: metrics.yoyChange !== null ? `${metrics.yoyChange >= 0 ? '+' : ''}${metrics.yoyChange.toFixed(0)}%` : '\u2014',
      color: metrics.yoyChange !== null ? (metrics.yoyChange >= 0 ? 'text-emerald-600' : 'text-red-500') : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-400 uppercase tracking-wide">{card.label}</p>
          <p className={`text-xl font-bold mt-1 ${card.color ?? 'text-slate-800'}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}

type Tab = 'timeline' | 'departments' | 'contracts';

interface Props {
  publisherId: string;
  publisherName: string;
}

export function CityHistoryViewer({ publisherId, publisherName }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('timeline');
  const { vendorName, yearData, deptData, contracts, metrics, isLoading, error } = useCityHistory(publisherId);

  if (!isRegisteredVendor(publisherId)) {
    return (
      <div className="bg-white rounded-xl p-8 border border-slate-100 shadow-sm text-center">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Not Yet Registered</h3>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          {publisherName} does not appear in the city&apos;s vendor payment system yet.
          Registering as a city vendor opens the door to advertising contracts from SF departments.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-coral-200 border-t-coral-500 rounded-full animate-spin" />
        <span className="ml-3 text-slate-500">Loading city records...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-xl p-6 border border-red-100">
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'timeline', label: 'Timeline', count: yearData.length },
    { id: 'departments', label: 'Departments', count: deptData.length },
    { id: 'contracts', label: 'Contracts', count: contracts.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
          City of San Francisco &mdash; Vendor Record
        </p>
        <p className="text-sm text-slate-600">
          Registered as <span className="font-medium text-slate-800">{vendorName}</span>
        </p>
      </div>

      {metrics && <MetricsCards metrics={metrics} />}

      <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 text-xs text-slate-400">({tab.count})</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'timeline' && <SpendingTimeline yearData={yearData} />}
      {activeTab === 'departments' && <DepartmentBreakdown deptData={deptData} />}
      {activeTab === 'contracts' && <ContractList contracts={contracts} />}

      <p className="text-xs text-slate-300 text-center">
        Source: SF Open Data &middot; Vendor Payments (n9pm-xkyq) &middot; Supplier Contracts (cqi5-hm2d)
      </p>
    </div>
  );
}

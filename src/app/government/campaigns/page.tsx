'use client';

/**
 * Government Campaign Management
 *
 * Dashboard for government departments to manage their community media campaigns.
 * Shows campaigns at all lifecycle stages with budget tracking and compliance status.
 *
 * DEMO: Powered by mock data from src/lib/demo/campaign-data.ts
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { getDemoCampaigns, type DemoCampaign } from '@/lib/demo/campaign-data';
import { formatCents } from '@/lib/transactions/pricing';
import { MANDATES } from '@/lib/transactions/procurement';
import type { CampaignStatus } from '@/types';

type FilterTab = 'all' | 'draft' | 'active' | 'completed';

const STATUS_DISPLAY: Record<CampaignStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-slate-600', bg: 'bg-slate-100' },
  matching: { label: 'Matching', color: 'text-blue-700', bg: 'bg-blue-50' },
  in_progress: { label: 'Active', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  completed: { label: 'Completed', color: 'text-green-700', bg: 'bg-green-50' },
  cancelled: { label: 'Cancelled', color: 'text-gray-500', bg: 'bg-gray-100' },
};

export default function CampaignManagementPage() {
  const [campaigns] = useState<DemoCampaign[]>(getDemoCampaigns());
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filtered = useMemo(() => {
    switch (activeTab) {
      case 'draft': return campaigns.filter(c => c.status === 'draft');
      case 'active': return campaigns.filter(c => ['matching', 'in_progress'].includes(c.status));
      case 'completed': return campaigns.filter(c => ['completed', 'cancelled'].includes(c.status));
      default: return campaigns;
    }
  }, [campaigns, activeTab]);

  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget.max, 0);
  const totalSpend = campaigns.reduce((sum, c) => sum + c.totalSpend, 0);
  const activeCampaigns = campaigns.filter(c => ['matching', 'in_progress'].includes(c.status)).length;

  const tabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All Campaigns' },
    { id: 'draft', label: 'Drafts' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Header */}
      <header className="bg-[var(--color-teal)] text-white">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Link href="/government" className="text-sm text-teal-200 hover:text-white">Government</Link>
                <span className="text-teal-300">/</span>
                <span className="text-sm font-medium text-white">Campaigns</span>
              </div>
              <h1 className="text-2xl font-semibold font-[family-name:var(--font-display)]">
                Campaign Management
              </h1>
            </div>
            <Link href="/government/onboarding" className="btn bg-white text-[var(--color-teal)] text-sm px-5 py-2.5 hover:bg-teal-50">
              + New Campaign
            </Link>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
              <p className="text-sm text-teal-200">Active Campaigns</p>
              <p className="text-2xl font-bold">{activeCampaigns}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
              <p className="text-sm text-teal-200">Total Budget</p>
              <p className="text-2xl font-bold">{formatCents(totalBudget)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
              <p className="text-sm text-teal-200">Spend to Date</p>
              <p className="text-2xl font-bold">{formatCents(totalSpend)}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Campaign List */}
      <main className="max-w-6xl mx-auto px-6 py-6 space-y-4">
        {filtered.map(campaign => {
          const status = STATUS_DISPLAY[campaign.status];
          const budgetUtilization = campaign.budget.max > 0
            ? (campaign.totalSpend / campaign.budget.max * 100).toFixed(0)
            : '0';

          return (
            <Link
              key={campaign.id}
              href={`/government/campaigns/${campaign.id}`}
              className="block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="font-semibold text-[var(--color-charcoal)] text-lg">{campaign.name}</h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{campaign.department} ({campaign.departmentCode})</p>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-1">{campaign.description}</p>

                  {/* Mandates */}
                  {campaign.mandates.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {campaign.mandates.map(mandate => (
                        <span key={mandate} className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-xs font-medium">
                          {MANDATES[mandate]?.label || mandate}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-right ml-6">
                  <p className="text-sm text-slate-400">Budget</p>
                  <p className="font-semibold text-[var(--color-charcoal)]">
                    {formatCents(campaign.budget.min)} – {formatCents(campaign.budget.max)}
                  </p>
                  {campaign.totalSpend > 0 && (
                    <div className="mt-2">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full"
                          style={{ width: `${Math.min(100, parseInt(budgetUtilization))}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{budgetUtilization}% spent</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Campaign Metrics Row */}
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-50 text-sm">
                <span className="text-slate-400">
                  {campaign.matchCount} publishers matched
                </span>
                <span className="text-slate-400">
                  {campaign.orderCount} orders placed
                </span>
                <span className="text-slate-400">
                  {campaign.targetLanguages.length} languages targeted
                </span>
                <span className="text-slate-400 ml-auto">
                  {new Date(campaign.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(campaign.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </Link>
          );
        })}
      </main>
    </div>
  );
}

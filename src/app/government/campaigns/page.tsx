'use client';

/**
 * Government Campaign Management
 *
 * Dashboard for government departments to manage their community media campaigns.
 * Shows campaigns at all lifecycle stages with budget tracking and compliance status.
 *
 * Powered by real Supabase data from campaigns, campaign_matches, and orders tables.
 */

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { formatCents } from '@/lib/transactions/pricing';
import { MANDATES, type MandateType } from '@/lib/transactions/procurement';
import type { CampaignStatus } from '@/types';

type FilterTab = 'all' | 'draft' | 'active' | 'completed';

interface CampaignRow {
  id: string;
  name: string;
  description: string;
  department: string;
  status: CampaignStatus;
  budget_min: number;
  budget_max: number;
  start_date: string;
  end_date: string;
  target_neighborhoods: string[];
  target_languages: string[];
  created_at: string;
  matchCount: number;
  orderCount: number;
  totalSpend: number;
  mandates: MandateType[];
}

const STATUS_MAP: Record<string, CampaignStatus> = {
  draft: 'draft',
  pending_review: 'draft',
  active: 'in_progress',
  paused: 'in_progress',
  completed: 'completed',
  cancelled: 'cancelled',
};

const STATUS_DISPLAY: Record<CampaignStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-slate-600', bg: 'bg-slate-100' },
  matching: { label: 'Matching', color: 'text-blue-700', bg: 'bg-blue-50' },
  in_progress: { label: 'Active', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  completed: { label: 'Completed', color: 'text-green-700', bg: 'bg-green-50' },
  cancelled: { label: 'Cancelled', color: 'text-gray-500', bg: 'bg-gray-100' },
};

export default function CampaignManagementPage() {
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'budget' | 'status'>('date');

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        // Fetch campaigns from API
        const res = await fetch('/api/campaigns');
        const data = await res.json();
        if (!data.success || !data.campaigns?.length) {
          setCampaigns([]);
          setLoading(false);
          return;
        }

        // Fetch match counts and order data per campaign
        const enriched: CampaignRow[] = await Promise.all(
          data.campaigns.map(async (c: Record<string, unknown>) => {
            // Fetch orders for this campaign
            const ordersRes = await fetch(`/api/orders?campaignId=${c.id}`);
            const ordersData = await ordersRes.json();
            const orders = ordersData.orders || [];

            // Fetch match count
            let matchCount = 0;
            try {
              const matchRes = await fetch(`/api/campaigns/${c.id}/matches`);
              const matchData = await matchRes.json();
              matchCount = matchData.matches?.length || 0;
            } catch { /* no matches yet */ }

            const totalSpend = orders.reduce(
              (sum: number, o: { total: number; status: string }) =>
                ['accepted', 'in_progress', 'delivered', 'completed'].includes(o.status)
                  ? sum + o.total
                  : sum,
              0
            );

            // Map DB status to app CampaignStatus
            const dbStatus = c.status as string;
            let appStatus: CampaignStatus = STATUS_MAP[dbStatus] || 'draft';
            if (matchCount > 0 && appStatus === 'draft') appStatus = 'matching';
            if (orders.length > 0 && appStatus === 'matching') appStatus = 'in_progress';

            return {
              id: c.id as string,
              name: c.name as string,
              description: (c.description as string) || '',
              department: (c.department as string) || '',
              status: appStatus,
              budget_min: (c.budgetRange as { min: number; max: number })?.min || 0,
              budget_max: (c.budgetRange as { min: number; max: number })?.max || 0,
              start_date: (c.dates as { start: string; end: string })?.start || '',
              end_date: (c.dates as { start: string; end: string })?.end || '',
              target_neighborhoods: (c.targetNeighborhoods as string[]) || [],
              target_languages: (c.targetLanguages as string[]) || [],
              created_at: c.createdAt as string,
              matchCount,
              orderCount: orders.length,
              totalSpend,
              mandates: [] as MandateType[], // Mandates aren't stored in campaigns table yet
            };
          })
        );

        setCampaigns(enriched);
      } catch (err) {
        console.error('Failed to load campaigns:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  const filtered = useMemo(() => {
    let result = campaigns;

    // Tab filter
    switch (activeTab) {
      case 'draft': result = result.filter(c => c.status === 'draft'); break;
      case 'active': result = result.filter(c => ['matching', 'in_progress'].includes(c.status)); break;
      case 'completed': result = result.filter(c => ['completed', 'cancelled'].includes(c.status)); break;
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'budget': return b.budget_max - a.budget_max;
        case 'status': return a.status.localeCompare(b.status);
        case 'date':
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [campaigns, activeTab, searchQuery, sortBy]);

  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget_max, 0);
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
        {/* Search + Sort */}
        {!loading && campaigns.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300"
              />
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-slate-600"
            >
              <option value="date">Newest first</option>
              <option value="name">Name A–Z</option>
              <option value="budget">Highest budget</option>
              <option value="status">By status</option>
            </select>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400">Loading campaigns...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
            <p className="text-slate-400 text-lg">No campaigns found</p>
            <Link href="/government/onboarding" className="text-teal-600 text-sm mt-2 inline-block hover:underline">
              Create your first campaign
            </Link>
          </div>
        ) : (
          filtered.map(campaign => {
            const status = STATUS_DISPLAY[campaign.status];
            const budgetUtilization = campaign.budget_max > 0
              ? (campaign.totalSpend / campaign.budget_max * 100).toFixed(0)
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
                    {campaign.department && (
                      <p className="text-sm text-slate-500">{campaign.department}</p>
                    )}
                    {campaign.description && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-1">{campaign.description}</p>
                    )}

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
                      {campaign.budget_min || campaign.budget_max
                        ? `${formatCents(campaign.budget_min)} – ${formatCents(campaign.budget_max)}`
                        : 'Not set'}
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
                  {campaign.target_languages?.length > 0 && (
                    <span className="text-slate-400">
                      {campaign.target_languages.length} languages targeted
                    </span>
                  )}
                  {campaign.start_date && campaign.end_date && (
                    <span className="text-slate-400 ml-auto">
                      {new Date(campaign.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(campaign.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </main>
    </div>
  );
}

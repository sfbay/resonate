'use client';

/**
 * Advertise Campaign Dashboard
 *
 * Lists all non-government campaigns. Marigold theme.
 * Shows summary stats, filter tabs, and campaign cards with goal badges.
 */

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { getGoalPreset } from '@/lib/campaigns/goal-presets';

type FilterTab = 'all' | 'active' | 'completed';

interface CampaignRow {
  id: string;
  name: string;
  description: string;
  source: string;
  goal: string | null;
  advertiserProfile: Record<string, unknown> | null;
  status: string;
  budgetMin: number;
  budgetMax: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  matchCount: number;
  orderCount: number;
  totalSpend: number;
}

const STATUS_DISPLAY: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-slate-600', bg: 'bg-slate-100' },
  matching: { label: 'Matching', color: 'text-blue-700', bg: 'bg-blue-50' },
  active: { label: 'Active', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  in_progress: { label: 'Active', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  completed: { label: 'Completed', color: 'text-green-700', bg: 'bg-green-50' },
  cancelled: { label: 'Cancelled', color: 'text-gray-500', bg: 'bg-gray-100' },
};

function formatDollars(cents: number): string {
  if (!cents) return '$0';
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function AdvertiseDashboardPage() {
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        // Fetch only non-government campaigns
        const res = await fetch('/api/campaigns?source=business&source=nonprofit&source=foundation');
        const data = await res.json();
        if (!data.success || !data.campaigns?.length) {
          setCampaigns([]);
          setLoading(false);
          return;
        }

        const enriched: CampaignRow[] = await Promise.all(
          data.campaigns.map(async (c: Record<string, unknown>) => {
            // Fetch orders for this campaign
            let orderCount = 0;
            let totalSpend = 0;
            try {
              const ordersRes = await fetch(`/api/orders?campaignId=${c.id}`);
              const ordersData = await ordersRes.json();
              const orders = ordersData.orders || [];
              orderCount = orders.length;
              totalSpend = orders.reduce(
                (sum: number, o: { total: number; status: string }) =>
                  ['accepted', 'in_progress', 'delivered', 'completed'].includes(o.status)
                    ? sum + o.total
                    : sum,
                0
              );
            } catch { /* no orders */ }

            // Fetch match count
            let matchCount = 0;
            try {
              const matchRes = await fetch(`/api/campaigns/${c.id}/matches`);
              const matchData = await matchRes.json();
              matchCount = matchData.matches?.length || 0;
            } catch { /* no matches */ }

            // Derive display status
            let appStatus = (c.status as string) || 'draft';
            if (matchCount > 0 && appStatus === 'draft') appStatus = 'matching';
            if (orderCount > 0 && ['draft', 'matching'].includes(appStatus)) appStatus = 'active';

            return {
              id: c.id as string,
              name: c.name as string,
              description: (c.description as string) || '',
              source: (c.source as string) || 'business',
              goal: (c.goal as string) || null,
              advertiserProfile: (c.advertiserProfile as Record<string, unknown>) || null,
              status: appStatus,
              budgetMin: (c.budgetRange as { min: number })?.min || 0,
              budgetMax: (c.budgetRange as { min: number; max: number })?.max || 0,
              startDate: (c.dates as { start: string })?.start || '',
              endDate: (c.dates as { start: string; end: string })?.end || '',
              createdAt: c.createdAt as string,
              matchCount,
              orderCount,
              totalSpend,
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
    switch (activeTab) {
      case 'active': return campaigns.filter(c => ['matching', 'active', 'in_progress'].includes(c.status));
      case 'completed': return campaigns.filter(c => ['completed', 'cancelled'].includes(c.status));
      default: return campaigns;
    }
  }, [campaigns, activeTab]);

  const activeCampaigns = campaigns.filter(c => ['matching', 'active', 'in_progress'].includes(c.status)).length;
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budgetMax, 0);
  const totalSpend = campaigns.reduce((sum, c) => sum + c.totalSpend, 0);

  const tabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All Campaigns' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Header */}
      <header className="bg-[var(--color-marigold)] text-white">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Link href="/advertise" className="text-sm text-white/70 hover:text-white">Advertise</Link>
                <span className="text-white/30">/</span>
                <span className="text-sm font-medium text-white">My Campaigns</span>
              </div>
              <h1 className="text-2xl font-semibold font-[family-name:var(--font-fraunces)]">
                My Campaigns
              </h1>
            </div>
            <Link href="/advertise/onboarding" className="btn bg-white text-[var(--color-marigold-dark)] text-sm px-5 py-2.5 hover:bg-amber-50">
              + New Campaign
            </Link>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
              <p className="text-sm text-white/70">Active Campaigns</p>
              <p className="text-2xl font-bold">{activeCampaigns}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
              <p className="text-sm text-white/70">Total Budget</p>
              <p className="text-2xl font-bold">{formatDollars(totalBudget)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
              <p className="text-sm text-white/70">Community Impact</p>
              <p className="text-2xl font-bold">{formatDollars(totalSpend)}</p>
              <p className="text-xs text-white/50 mt-0.5">invested in local journalism</p>
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
                    ? 'border-[var(--color-marigold)] text-[var(--color-marigold-dark)]'
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
        {loading ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
            <div className="w-6 h-6 border-2 border-[var(--color-marigold)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400">Loading campaigns...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
            <p className="text-slate-400 text-lg">No campaigns found</p>
            <Link href="/advertise/onboarding" className="text-[var(--color-marigold-dark)] text-sm mt-2 inline-block hover:underline">
              Create your first campaign
            </Link>
          </div>
        ) : (
          filtered.map(campaign => {
            const status = STATUS_DISPLAY[campaign.status] || STATUS_DISPLAY.draft;
            const goalPreset = campaign.goal ? getGoalPreset(campaign.goal) : null;
            const orgName = (campaign.advertiserProfile?.orgName as string) || '';
            const sourceLabel = campaign.source.charAt(0).toUpperCase() + campaign.source.slice(1);

            return (
              <Link
                key={campaign.id}
                href={`/advertise/campaigns/${campaign.id}`}
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
                    {orgName && (
                      <p className="text-sm text-slate-500">{orgName} · {sourceLabel}</p>
                    )}
                    {goalPreset && (
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                          <span>{goalPreset.icon}</span>
                          {goalPreset.label}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-right ml-6">
                    <p className="text-sm text-slate-400">Budget</p>
                    <p className="font-semibold text-[var(--color-charcoal)]">
                      {campaign.budgetMin || campaign.budgetMax
                        ? `${formatDollars(campaign.budgetMin)} – ${formatDollars(campaign.budgetMax)}`
                        : 'Not set'}
                    </p>
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
                  {campaign.startDate && campaign.endDate && (
                    <span className="text-slate-400 ml-auto">
                      {new Date(campaign.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(campaign.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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

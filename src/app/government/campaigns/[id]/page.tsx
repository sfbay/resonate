'use client';

/**
 * Campaign Detail View
 *
 * Full campaign management page showing matched publishers, placed orders,
 * procurement status, and compliance tracking.
 *
 * DEMO: Powered by mock data from src/lib/demo/campaign-data.ts
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getDemoCampaigns, getDemoMatchesForCampaign, getDemoComplianceData, type DemoMatch } from '@/lib/demo/campaign-data';
import { formatCents } from '@/lib/transactions/pricing';
import { MANDATES, type MandateType } from '@/lib/transactions/procurement';
import { ORDER_STATUS_DISPLAY } from '@/lib/transactions/order-state';

type DetailTab = 'matches' | 'orders' | 'compliance';

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const [activeTab, setActiveTab] = useState<DetailTab>('matches');

  const campaign = useMemo(
    () => getDemoCampaigns().find(c => c.id === campaignId),
    [campaignId]
  );

  const matches = useMemo(
    () => getDemoMatchesForCampaign(campaignId),
    [campaignId]
  );

  const compliance = useMemo(
    () => getDemoComplianceData(campaignId),
    [campaignId]
  );

  if (!campaign) {
    return (
      <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 text-lg">Campaign not found</p>
          <Link href="/government/campaigns" className="text-teal-600 text-sm mt-2 inline-block hover:underline">
            Back to campaigns
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { id: DetailTab; label: string }[] = [
    { id: 'matches', label: `Publisher Matches (${matches.length})` },
    { id: 'orders', label: `Orders (${campaign.orderCount})` },
    { id: 'compliance', label: 'Compliance' },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Header */}
      <header className="bg-[var(--color-teal)] text-white">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/government/campaigns" className="text-sm text-teal-200 hover:text-white">Campaigns</Link>
            <span className="text-teal-300">/</span>
            <span className="text-sm text-white">{campaign.name}</span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold font-[family-name:var(--font-display)]">{campaign.name}</h1>
              <p className="text-teal-200 mt-1">{campaign.department}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-teal-200">Budget</p>
              <p className="text-xl font-bold">{formatCents(campaign.budget.min)} – {formatCents(campaign.budget.max)}</p>
            </div>
          </div>

          {/* Mandate Tags */}
          {campaign.mandates.length > 0 && (
            <div className="flex gap-2 mt-4">
              {campaign.mandates.map(mandate => (
                <span key={mandate} className="px-3 py-1 bg-white/15 text-white rounded-full text-xs font-medium backdrop-blur-sm">
                  {MANDATES[mandate]?.label || mandate}
                </span>
              ))}
            </div>
          )}

          {/* Campaign Meta */}
          <div className="flex gap-6 mt-4 text-sm text-teal-200">
            <span>{new Date(campaign.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} – {new Date(campaign.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span>{campaign.targetLanguages.length} target languages</span>
            <span>{campaign.targetNeighborhoods.length} neighborhoods</span>
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

      <main className="max-w-6xl mx-auto px-6 py-6">
        {/* MATCHES TAB */}
        {activeTab === 'matches' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">{matches.length} publishers matched to your campaign criteria</p>
              <button className="btn btn-teal text-sm px-5 py-2">Refresh Matches</button>
            </div>

            {matches.map(match => (
              <MatchCard key={match.publisherId} match={match} />
            ))}
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {matches.filter(m => m.hasOrder).length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                <p className="text-slate-400 text-lg">No orders placed yet</p>
                <p className="text-sm text-slate-400 mt-1">Select publishers from the Matches tab to place orders</p>
              </div>
            ) : (
              matches.filter(m => m.hasOrder).map(match => (
                <div key={match.publisherId} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-[var(--color-charcoal)]">{match.publisherName}</h3>
                      <p className="text-sm text-slate-500">{match.languages.join(', ')} content</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {match.orderStatus && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_DISPLAY[match.orderStatus].bgColor} ${ORDER_STATUS_DISPLAY[match.orderStatus].color}`}>
                          {ORDER_STATUS_DISPLAY[match.orderStatus].label}
                        </span>
                      )}
                      <span className="font-medium text-[var(--color-charcoal)]">
                        {formatCents(match.estimatedCost.low)} – {formatCents(match.estimatedCost.high)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* COMPLIANCE TAB */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            {/* Spending Summary */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-[var(--color-charcoal)] text-lg mb-4">Community Media Spending</h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-slate-400">Total Budget</p>
                  <p className="text-2xl font-bold text-[var(--color-charcoal)]">{formatCents(compliance.totalBudget)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Community Media Spend</p>
                  <p className="text-2xl font-bold text-teal-600">{formatCents(compliance.communityMediaSpend)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">% to Community Media</p>
                  <p className="text-2xl font-bold text-[var(--color-charcoal)]">{(compliance.communityMediaPercent * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>

            {/* Mandate Compliance */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-[var(--color-charcoal)] text-lg mb-4">Mandate Compliance</h3>
              <div className="space-y-3">
                {compliance.mandateStatus.map(ms => (
                  <div key={ms.mandate} className={`p-4 rounded-lg border ${ms.met ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${ms.met ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                        {ms.met ? '✓' : '!'}
                      </span>
                      <div>
                        <p className="font-medium text-[var(--color-charcoal)]">{MANDATES[ms.mandate]?.label || ms.mandate}</p>
                        <p className="text-sm text-slate-600">{ms.details}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Language Coverage */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-[var(--color-charcoal)] text-lg mb-4">Language Coverage</h3>
              <div className="space-y-3">
                {compliance.languageCoverage.map(lc => (
                  <div key={lc.language} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-[var(--color-charcoal)]">{lc.language}</span>
                      <span className="text-xs text-slate-400">{lc.publisherCount} publisher{lc.publisherCount !== 1 ? 's' : ''}</span>
                    </div>
                    <span className="font-medium text-[var(--color-charcoal)]">{formatCents(lc.spend)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Neighborhood Coverage */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-[var(--color-charcoal)] text-lg mb-4">Neighborhood Coverage</h3>
              <div className="space-y-3">
                {compliance.neighborhoodCoverage.map(nc => (
                  <div key={nc.neighborhood} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-[var(--color-charcoal)]">{nc.neighborhood}</span>
                      <span className="text-xs text-slate-400">{nc.publisherCount} publisher{nc.publisherCount !== 1 ? 's' : ''}</span>
                    </div>
                    <span className="font-medium text-[var(--color-charcoal)]">{formatCents(nc.spend)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// =============================================================================
// MATCH CARD COMPONENT
// =============================================================================

function MatchCard({ match }: { match: DemoMatch }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxScore = Math.max(match.scores.geographic, match.scores.demographic, match.scores.economic, match.scores.cultural, match.scores.reach);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div
        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          {/* Score Circle */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
            match.overallScore >= 80 ? 'bg-emerald-50 text-emerald-600' :
            match.overallScore >= 60 ? 'bg-blue-50 text-blue-600' :
            'bg-slate-50 text-slate-600'
          }`}>
            {match.overallScore}
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-charcoal)]">{match.publisherName}</h3>
            <div className="flex gap-2 mt-1">
              {match.languages.map(lang => (
                <span key={lang} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                  {lang.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {match.hasOrder && match.orderStatus && (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_DISPLAY[match.orderStatus].bgColor} ${ORDER_STATUS_DISPLAY[match.orderStatus].color}`}>
              {ORDER_STATUS_DISPLAY[match.orderStatus].label}
            </span>
          )}
          <div className="text-right">
            <p className="text-sm text-slate-400">Est. Cost</p>
            <p className="font-medium text-[var(--color-charcoal)]">{formatCents(match.estimatedCost.low)} – {formatCents(match.estimatedCost.high)}</p>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <polyline points="6,9 12,15 18,9" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 pb-5 border-t border-gray-50">
          {/* Score Breakdown */}
          <div className="mt-4 grid grid-cols-5 gap-3">
            {[
              { label: 'Geographic', score: match.scores.geographic },
              { label: 'Demographic', score: match.scores.demographic },
              { label: 'Economic', score: match.scores.economic },
              { label: 'Cultural', score: match.scores.cultural },
              { label: 'Reach', score: match.scores.reach },
            ].map(dim => (
              <div key={dim.label} className="text-center">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: `${dim.score}%` }} />
                </div>
                <p className="text-xs text-slate-400">{dim.label}</p>
                <p className="text-sm font-medium text-[var(--color-charcoal)]">{dim.score}</p>
              </div>
            ))}
          </div>

          {/* Match Reasons */}
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Why This Match</p>
            <div className="flex flex-wrap gap-2">
              {match.matchReasons.map((reason, i) => (
                <span key={i} className="text-sm text-teal-700 bg-teal-50 px-3 py-1 rounded-full">
                  {reason}
                </span>
              ))}
            </div>
          </div>

          {/* Neighborhoods */}
          <div className="mt-3 text-sm text-slate-500">
            Neighborhoods: {match.neighborhoods.map(n => n.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())).join(', ')}
          </div>

          {/* Action */}
          <div className="mt-4">
            {match.hasOrder ? (
              <span className="text-sm text-teal-600 font-medium">Order placed — {ORDER_STATUS_DISPLAY[match.orderStatus!]?.label}</span>
            ) : (
              <button className="btn btn-teal text-sm px-5 py-2">Place Order</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

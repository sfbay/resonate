'use client';

/**
 * Advertise Campaign Detail
 *
 * Simplified version of government campaign detail (no compliance tab).
 * Shows campaign info, publisher matches with Place Order builder, and orders.
 * Marigold theme.
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getGoalPreset } from '@/lib/campaigns/goal-presets';
import {
  formatCents,
  PLATFORM_FEE_RATE,
  SUGGESTED_RATES,
  PLATFORM_DELIVERABLE_TYPES,
  DELIVERABLE_TYPE_LABELS,
  PLATFORM_LABELS,
} from '@/lib/transactions/pricing';
import { ORDER_STATUS_DISPLAY } from '@/lib/transactions/order-state';
import type { SocialPlatform, DeliverableType, OrderStatus } from '@/types';

type DetailTab = 'matches' | 'orders';

interface MatchData {
  publisher: { id: string; name: string; description?: string };
  score: number;
  breakdown: { geographic: number; demographic: number; economic: number; cultural: number; reach: number };
  matchingNeighborhoods: string[];
  matchingLanguages: string[];
  keyStrengths: string[];
  metrics?: { followers: number; engagement: number };
}

interface OrderData {
  id: string;
  publisherId: string;
  status: OrderStatus;
  total: number;
  lineItems: { id: string; deliverableType: string; platform: string; quantity: number; unitPrice: number; totalPrice: number }[];
  deliverables: { id: string; status: string }[];
  publisher?: { id: string; name: string };
}

interface CampaignData {
  id: string;
  name: string;
  description: string;
  department: string;
  budgetRange: { min: number; max: number } | null;
  dates: { start: string; end: string } | null;
  targetLanguages: string[];
  targetNeighborhoods: string[];
  source: string;
  goal: string | null;
  advertiserProfile: Record<string, unknown> | null;
}

interface LineItemDraft {
  deliverableType: DeliverableType;
  platform: SocialPlatform;
  quantity: number;
  unitPrice: number;
}

export default function AdvertiseCampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const [activeTab, setActiveTab] = useState<DetailTab>('matches');
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [campaignRes, matchesRes, ordersRes] = await Promise.all([
        fetch(`/api/campaigns/${campaignId}`).catch(() => null),
        fetch(`/api/campaigns/${campaignId}/matches`).catch(() => null),
        fetch(`/api/orders?campaignId=${campaignId}`).catch(() => null),
      ]);

      if (campaignRes?.ok) {
        const data = await campaignRes.json();
        if (data.campaign) setCampaign(data.campaign);
        else if (data.campaigns?.[0]) setCampaign(data.campaigns[0]);
      }

      if (matchesRes?.ok) {
        const data = await matchesRes.json();
        setMatches(data.matches || []);
      }

      if (ordersRes?.ok) {
        const data = await ordersRes.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load campaign data:', err);
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const ordersByPublisher = useMemo(() => {
    const map = new Map<string, OrderData>();
    for (const o of orders) {
      if (!map.has(o.publisherId)) map.set(o.publisherId, o);
    }
    return map;
  }, [orders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--color-marigold)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 text-lg">Campaign not found</p>
          <Link href="/advertise/dashboard" className="text-[var(--color-marigold-dark)] text-sm mt-2 inline-block hover:underline">
            Back to campaigns
          </Link>
        </div>
      </div>
    );
  }

  const goalPreset = campaign.goal ? getGoalPreset(campaign.goal) : null;
  const orgName = (campaign.advertiserProfile?.orgName as string) || campaign.department || '';

  const tabs: { id: DetailTab; label: string }[] = [
    { id: 'matches', label: `Publisher Matches (${matches.length})` },
    { id: 'orders', label: `Orders (${orders.length})` },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Header */}
      <header className="bg-[var(--color-marigold)] text-white">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/advertise/dashboard" className="text-sm text-white/70 hover:text-white">Campaigns</Link>
            <span className="text-white/30">/</span>
            <span className="text-sm text-white">{campaign.name}</span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold font-[family-name:var(--font-fraunces)]">{campaign.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                {orgName && <span className="text-white/70">{orgName}</span>}
                {goalPreset && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/15 rounded-full text-xs font-medium text-white">
                    {goalPreset.icon} {goalPreset.label}
                  </span>
                )}
              </div>
            </div>
            {campaign.budgetRange && (
              <div className="text-right">
                <p className="text-sm text-white/70">Budget</p>
                <p className="text-xl font-bold">{formatCents(campaign.budgetRange.min)} – {formatCents(campaign.budgetRange.max)}</p>
              </div>
            )}
          </div>

          <div className="flex gap-6 mt-4 text-sm text-white/70">
            {campaign.dates && (
              <span>
                {new Date(campaign.dates.start).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} – {new Date(campaign.dates.end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            )}
            {campaign.targetLanguages?.length > 0 && (
              <span>{campaign.targetLanguages.length} target languages</span>
            )}
            {campaign.targetNeighborhoods?.length > 0 && (
              <span>{campaign.targetNeighborhoods.length} neighborhoods</span>
            )}
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

      <main className="max-w-6xl mx-auto px-6 py-6">
        {/* MATCHES TAB */}
        {activeTab === 'matches' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">{matches.length} publishers matched to your campaign</p>
              <button
                className="btn bg-[var(--color-marigold)] text-white text-sm px-5 py-2 hover:bg-[var(--color-marigold-dark)]"
                onClick={() => { setLoading(true); fetchData(); }}
              >
                Refresh Matches
              </button>
            </div>

            {matches.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                <p className="text-slate-400 text-lg">No matches found</p>
                <p className="text-sm text-slate-400 mt-1">The matching algorithm will run when publishers are available</p>
              </div>
            ) : (
              matches.map(match => (
                <MatchCard
                  key={match.publisher.id}
                  match={match}
                  order={ordersByPublisher.get(match.publisher.id)}
                  campaignId={campaignId}
                  onOrderPlaced={fetchData}
                />
              ))
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                <p className="text-slate-400 text-lg">No orders placed yet</p>
                <p className="text-sm text-slate-400 mt-1">Select publishers from the Matches tab to place orders</p>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-[var(--color-charcoal)]">{order.publisher?.name || 'Publisher'}</h3>
                      <p className="text-sm text-slate-500">
                        {order.lineItems.length} line item{order.lineItems.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_DISPLAY[order.status].bgColor} ${ORDER_STATUS_DISPLAY[order.status].color}`}>
                        {ORDER_STATUS_DISPLAY[order.status].label}
                      </span>
                      <span className="font-medium text-[var(--color-charcoal)]">
                        {formatCents(order.total)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    {order.lineItems.map(li => (
                      <div key={li.id} className="flex justify-between text-sm text-slate-500">
                        <span>{DELIVERABLE_TYPE_LABELS[li.deliverableType as DeliverableType] || li.deliverableType} on {PLATFORM_LABELS[li.platform as SocialPlatform] || li.platform}</span>
                        <span>{li.quantity} x {formatCents(li.unitPrice)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// =============================================================================
// MATCH CARD WITH INLINE ORDER BUILDER
// =============================================================================

function MatchCard({
  match,
  order,
  campaignId,
  onOrderPlaced,
}: {
  match: MatchData;
  order?: OrderData;
  campaignId: string;
  onOrderPlaced: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showOrderBuilder, setShowOrderBuilder] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div
        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
            match.score >= 80 ? 'bg-emerald-50 text-emerald-600' :
            match.score >= 60 ? 'bg-amber-50 text-amber-600' :
            'bg-slate-50 text-slate-600'
          }`}>
            {match.score}
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-charcoal)]">{match.publisher.name}</h3>
            <div className="flex gap-2 mt-1">
              {match.matchingLanguages.map(lang => (
                <span key={lang} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                  {lang.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {order && (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_DISPLAY[order.status].bgColor} ${ORDER_STATUS_DISPLAY[order.status].color}`}>
              {ORDER_STATUS_DISPLAY[order.status].label}
            </span>
          )}
          <svg
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
              { label: 'Geographic', score: match.breakdown.geographic },
              { label: 'Demographic', score: match.breakdown.demographic },
              { label: 'Economic', score: match.breakdown.economic },
              { label: 'Cultural', score: match.breakdown.cultural },
              { label: 'Reach', score: match.breakdown.reach },
            ].map(dim => (
              <div key={dim.label} className="text-center">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-[var(--color-marigold)] rounded-full" style={{ width: `${dim.score}%` }} />
                </div>
                <p className="text-xs text-slate-400">{dim.label}</p>
                <p className="text-sm font-medium text-[var(--color-charcoal)]">{dim.score}</p>
              </div>
            ))}
          </div>

          {match.keyStrengths?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Why This Match</p>
              <div className="flex flex-wrap gap-2">
                {match.keyStrengths.map((reason, i) => (
                  <span key={i} className="text-sm text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                    {reason}
                  </span>
                ))}
              </div>
            </div>
          )}

          {match.matchingNeighborhoods?.length > 0 && (
            <div className="mt-3 text-sm text-slate-500">
              Neighborhoods: {match.matchingNeighborhoods.map(n => n.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())).join(', ')}
            </div>
          )}

          {/* Action */}
          <div className="mt-4">
            {order ? (
              <span className="text-sm text-[var(--color-marigold-dark)] font-medium">
                Order placed — {ORDER_STATUS_DISPLAY[order.status]?.label} ({formatCents(order.total)})
              </span>
            ) : showOrderBuilder ? (
              <OrderBuilder
                publisherId={match.publisher.id}
                publisherName={match.publisher.name}
                campaignId={campaignId}
                onCancel={() => setShowOrderBuilder(false)}
                onSuccess={() => {
                  setShowOrderBuilder(false);
                  onOrderPlaced();
                }}
              />
            ) : (
              <button
                className="btn bg-[var(--color-marigold)] text-white text-sm px-5 py-2 hover:bg-[var(--color-marigold-dark)]"
                onClick={(e) => { e.stopPropagation(); setShowOrderBuilder(true); }}
              >
                Place Order
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// INLINE ORDER BUILDER
// =============================================================================

function OrderBuilder({
  publisherId,
  publisherName,
  campaignId,
  onCancel,
  onSuccess,
}: {
  publisherId: string;
  publisherName: string;
  campaignId: string;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([
    { deliverableType: 'sponsored_post', platform: 'instagram', quantity: 1, unitPrice: SUGGESTED_RATES.sponsored_post.mid },
  ]);
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const subtotal = lineItems.reduce((sum, li) => sum + li.unitPrice * li.quantity, 0);
  const platformFee = Math.round(subtotal * PLATFORM_FEE_RATE);
  const total = subtotal + platformFee;

  function addLineItem() {
    setLineItems([...lineItems, { deliverableType: 'sponsored_post', platform: 'instagram', quantity: 1, unitPrice: SUGGESTED_RATES.sponsored_post.mid }]);
  }

  function removeLineItem(index: number) {
    setLineItems(lineItems.filter((_, i) => i !== index));
  }

  function updateLineItem(index: number, updates: Partial<LineItemDraft>) {
    setLineItems(lineItems.map((li, i) => {
      if (i !== index) return li;
      const updated = { ...li, ...updates };
      if (updates.deliverableType && !updates.unitPrice) {
        updated.unitPrice = SUGGESTED_RATES[updates.deliverableType]?.mid || li.unitPrice;
      }
      return updated;
    }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          publisherId,
          lineItems: lineItems.map(li => ({
            deliverableType: li.deliverableType,
            platform: li.platform,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
          })),
          deliveryDeadline: deadline || undefined,
          notes: notes || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to create order');
        return;
      }

      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-emerald-500 text-white px-5 py-3 rounded-lg shadow-lg z-50 text-sm font-medium';
      toast.textContent = `Order placed with ${publisherName}`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);

      onSuccess();
    } catch {
      setError('Network error — please try again');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-2 bg-slate-50 rounded-lg p-5 border border-slate-200" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-[var(--color-charcoal)]">New Order — {publisherName}</h4>
        <button onClick={onCancel} className="text-sm text-slate-400 hover:text-slate-600">Cancel</button>
      </div>

      <div className="space-y-3">
        {lineItems.map((li, index) => {
          const availableTypes = PLATFORM_DELIVERABLE_TYPES[li.platform] || ['sponsored_post'];
          return (
            <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="grid grid-cols-5 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Platform</label>
                  <select
                    value={li.platform}
                    onChange={e => updateLineItem(index, { platform: e.target.value as SocialPlatform })}
                    className="w-full text-sm border border-gray-200 rounded px-2 py-1.5"
                  >
                    {(Object.keys(PLATFORM_LABELS) as SocialPlatform[]).map(p => (
                      <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Type</label>
                  <select
                    value={li.deliverableType}
                    onChange={e => updateLineItem(index, { deliverableType: e.target.value as DeliverableType })}
                    className="w-full text-sm border border-gray-200 rounded px-2 py-1.5"
                  >
                    {availableTypes.map(t => (
                      <option key={t} value={t}>{DELIVERABLE_TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Qty</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={li.quantity}
                    onChange={e => updateLineItem(index, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full text-sm border border-gray-200 rounded px-2 py-1.5"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Unit Price</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                    <input
                      type="number"
                      min={0}
                      value={Math.round(li.unitPrice / 100)}
                      onChange={e => updateLineItem(index, { unitPrice: (parseInt(e.target.value) || 0) * 100 })}
                      className="w-full text-sm border border-gray-200 rounded pl-5 pr-2 py-1.5"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <div className="flex-1">
                    <label className="text-xs text-slate-400 block mb-1">Total</label>
                    <p className="text-sm font-medium text-[var(--color-charcoal)] py-1.5">{formatCents(li.unitPrice * li.quantity)}</p>
                  </div>
                  {lineItems.length > 1 && (
                    <button onClick={() => removeLineItem(index)} className="text-slate-400 hover:text-red-500 ml-2 pb-1.5">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={addLineItem} className="mt-2 text-sm text-[var(--color-marigold-dark)] hover:text-[var(--color-marigold)] font-medium">
        + Add Line Item
      </button>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Delivery Deadline</label>
          <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full text-sm border border-gray-200 rounded px-3 py-1.5" />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Notes (optional)</label>
          <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Special instructions..." className="w-full text-sm border border-gray-200 rounded px-3 py-1.5" />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 space-y-1 text-sm">
        <div className="flex justify-between text-slate-500">
          <span>Subtotal (publisher payout)</span>
          <span>{formatCents(subtotal)}</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Platform fee (15%)</span>
          <span>{formatCents(platformFee)}</span>
        </div>
        <div className="flex justify-between font-semibold text-[var(--color-charcoal)]">
          <span>Total</span>
          <span>{formatCents(total)}</span>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={submitting || lineItems.length === 0}
          className="btn bg-[var(--color-marigold)] text-white text-sm px-6 py-2 hover:bg-[var(--color-marigold-dark)] disabled:opacity-50"
        >
          {submitting ? 'Placing Order...' : `Place Order — ${formatCents(total)}`}
        </button>
        <button onClick={onCancel} className="btn btn-outline text-sm px-4 py-2 text-slate-500 border-slate-200">
          Cancel
        </button>
      </div>
    </div>
  );
}

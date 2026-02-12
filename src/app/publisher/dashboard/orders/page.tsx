'use client';

/**
 * Publisher Order Inbox
 *
 * Shows incoming orders, active work, and completed deliveries.
 * Publishers accept/reject orders and manage their workload here.
 *
 * Powered by real Supabase data via API routes.
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ORDER_STATUS_DISPLAY } from '@/lib/transactions/order-state';
import { formatCents, DELIVERABLE_TYPE_LABELS, PLATFORM_LABELS } from '@/lib/transactions/pricing';
import type { OrderStatus, SocialPlatform, DeliverableType } from '@/types';

type FilterTab = 'all' | 'pending' | 'active' | 'completed';

// Demo publisher — swap with auth lookup when auth is built
const CURRENT_PUBLISHER_ID = '11111111-1111-1111-1111-111111111103'; // The Bay View

interface OrderRow {
  id: string;
  campaignId: string;
  publisherId: string;
  status: OrderStatus;
  procurementStatus: string;
  subtotal: number;
  platformFee: number;
  total: number;
  deliveryDeadline: string;
  purchaseOrderNumber: string | null;
  notes: string | null;
  campaign: { id: string; name: string; department: string } | null;
  publisher: { id: string; name: string } | null;
  lineItems: {
    id: string;
    deliverableType: string;
    platform: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    description: string | null;
  }[];
  deliverables: {
    id: string;
    orderLineItemId: string;
    platform: string;
    type: string;
    url: string | null;
    status: string;
    submittedAt: string | null;
  }[];
  createdAt: string;
}

export default function OrderInboxPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders?publisherId=${CURRENT_PUBLISHER_ID}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    switch (activeTab) {
      case 'pending':
        return orders.filter(o => o.status === 'pending_publisher');
      case 'active':
        return orders.filter(o => ['accepted', 'in_progress', 'delivered'].includes(o.status));
      case 'completed':
        return orders.filter(o => ['completed', 'cancelled', 'rejected'].includes(o.status));
      default:
        return orders;
    }
  }, [orders, activeTab]);

  const pendingCount = orders.filter(o => o.status === 'pending_publisher').length;
  const activeCount = orders.filter(o => ['accepted', 'in_progress', 'delivered'].includes(o.status)).length;

  const tabs: { id: FilterTab; label: string; count?: number }[] = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Needs Response', count: pendingCount },
    { id: 'active', label: 'Active', count: activeCount },
    { id: 'completed', label: 'Completed' },
  ];

  async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          newStatus === 'accepted' ? 'Order accepted' :
          newStatus === 'rejected' ? 'Order declined' :
          `Order status updated to ${newStatus}`
        );
        fetchOrders();
      } else {
        showToast(data.error || 'Failed to update order', true);
      }
    } catch {
      showToast('Network error — please try again', true);
    }
  }

  function showToast(message: string, isError = false) {
    const el = document.createElement('div');
    el.className = `fixed top-4 right-4 ${isError ? 'bg-red-500' : 'bg-emerald-500'} text-white px-5 py-3 rounded-lg shadow-lg z-50 text-sm font-medium`;
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex items-center gap-3 mb-1">
            <Link href="/publisher/dashboard" className="text-sm text-slate-400 hover:text-coral-500">Dashboard</Link>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-medium text-slate-700">Orders</span>
          </div>
          <h1 className="text-2xl font-semibold text-[var(--color-charcoal)] font-[family-name:var(--font-display)]">
            Order Inbox
          </h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-coral-500 text-coral-500'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-coral-500/10 text-coral-500' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
            <div className="w-6 h-6 border-2 border-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
            <p className="text-slate-400 text-lg">No orders in this category</p>
            {orders.length === 0 && (
              <p className="text-sm text-slate-400 mt-1">Orders will appear here when advertisers place them through campaign matching</p>
            )}
          </div>
        ) : (
          filteredOrders.map(order => {
            const campaignName = order.campaign?.name || 'Campaign';
            const advertiserName = order.campaign?.department || 'Advertiser';
            const statusDisplay = ORDER_STATUS_DISPLAY[order.status];
            const isExpanded = expandedOrder === order.id;
            const isPending = order.status === 'pending_publisher';
            const deliveredCount = order.deliverables.filter(d => d.status === 'submitted' || d.status === 'approved').length;
            const totalDeliverableCount = order.lineItems.reduce((sum, li) => sum + li.quantity, 0);

            return (
              <div
                key={order.id}
                className={`bg-white rounded-xl border transition-all ${
                  isPending ? 'border-amber-200 shadow-md' : 'border-gray-100 shadow-sm'
                }`}
              >
                {/* Order Header */}
                <div
                  className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div className="flex items-center gap-4">
                    {isPending && (
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-medium text-[var(--color-charcoal)]">{campaignName}</p>
                      <p className="text-sm text-slate-500">{advertiserName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusDisplay.bgColor} ${statusDisplay.color}`}>
                      {statusDisplay.label}
                    </span>
                    <span className="font-semibold text-[var(--color-charcoal)]">{formatCents(order.total)}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    >
                      <polyline points="6,9 12,15 18,9" />
                    </svg>
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="px-6 pb-5 border-t border-gray-50">
                    {/* Line Items */}
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Line Items</p>
                      {order.lineItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                          <div>
                            <span className="text-sm font-medium text-[var(--color-charcoal)]">
                              {DELIVERABLE_TYPE_LABELS[item.deliverableType as DeliverableType] || item.deliverableType}
                            </span>
                            <span className="text-sm text-slate-400 ml-2">
                              on {PLATFORM_LABELS[item.platform as SocialPlatform] || item.platform}
                            </span>
                            {item.description && (
                              <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-[var(--color-charcoal)]">{formatCents(item.totalPrice)}</p>
                            <p className="text-xs text-slate-400">{item.quantity} x {formatCents(item.unitPrice)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Progress & Deadline */}
                    <div className="mt-4 flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-slate-400">Deliverables: </span>
                        <span className="font-medium text-[var(--color-charcoal)]">{deliveredCount}/{totalDeliverableCount} submitted</span>
                      </div>
                      {order.deliveryDeadline && (
                        <div>
                          <span className="text-slate-400">Deadline: </span>
                          <span className="font-medium text-[var(--color-charcoal)]">
                            {new Date(order.deliveryDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      )}
                      {order.purchaseOrderNumber && (
                        <div>
                          <span className="text-slate-400">PO: </span>
                          <span className="font-medium text-[var(--color-charcoal)]">{order.purchaseOrderNumber}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex gap-3">
                      {isPending && (
                        <>
                          <button
                            className="btn btn-coral text-sm px-5 py-2"
                            onClick={() => updateOrderStatus(order.id, 'accepted')}
                          >
                            Accept Order
                          </button>
                          <button
                            className="btn btn-outline text-sm px-5 py-2 text-slate-500 border-slate-200"
                            onClick={() => updateOrderStatus(order.id, 'rejected')}
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {order.status === 'accepted' && (
                        <button
                          className="btn btn-coral text-sm px-5 py-2"
                          onClick={() => updateOrderStatus(order.id, 'in_progress')}
                        >
                          Start Work
                        </button>
                      )}
                      {order.status === 'in_progress' && (
                        <DeliverableSubmitter
                          orderId={order.id}
                          lineItems={order.lineItems}
                          deliverables={order.deliverables}
                          onSubmitted={fetchOrders}
                        />
                      )}
                      {order.status === 'completed' && (
                        <span className="text-sm text-emerald-600 font-medium py-2">
                          Order completed{order.procurementStatus === 'paid' ? ' — payment processed' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}

// =============================================================================
// DELIVERABLE SUBMITTER
// =============================================================================

function DeliverableSubmitter({
  orderId,
  lineItems,
  deliverables,
  onSubmitted,
}: {
  orderId: string;
  lineItems: OrderRow['lineItems'];
  deliverables: OrderRow['deliverables'];
  onSubmitted: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [selectedLineItem, setSelectedLineItem] = useState('');
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Find line items that still have pending deliverables
  const pendingLineItems = lineItems.filter(li => {
    const liDeliverables = deliverables.filter(d => d.orderLineItemId === li.id);
    return liDeliverables.some(d => d.status === 'pending');
  });

  async function handleSubmit() {
    if (!selectedLineItem) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/deliverables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderLineItemId: selectedLineItem,
          url: url || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-emerald-500 text-white px-5 py-3 rounded-lg shadow-lg z-50 text-sm font-medium';
        toast.textContent = data.allDelivered ? 'All deliverables submitted!' : 'Deliverable submitted';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
        setShowForm(false);
        setUrl('');
        setSelectedLineItem('');
        onSubmitted();
      }
    } catch {
      // Error handling
    } finally {
      setSubmitting(false);
    }
  }

  if (pendingLineItems.length === 0) {
    return (
      <span className="text-sm text-emerald-600 font-medium py-2">
        All deliverables submitted — awaiting review
      </span>
    );
  }

  if (!showForm) {
    return (
      <button
        className="btn btn-coral text-sm px-5 py-2"
        onClick={() => setShowForm(true)}
      >
        Submit Deliverable ({pendingLineItems.length} remaining)
      </button>
    );
  }

  return (
    <div className="w-full bg-slate-50 rounded-lg p-4 border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-[var(--color-charcoal)]">Submit Deliverable</p>
        <button onClick={() => setShowForm(false)} className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Line Item</label>
          <select
            value={selectedLineItem}
            onChange={e => setSelectedLineItem(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded px-3 py-1.5"
          >
            <option value="">Select line item...</option>
            {pendingLineItems.map(li => (
              <option key={li.id} value={li.id}>
                {DELIVERABLE_TYPE_LABELS[li.deliverableType as DeliverableType] || li.deliverableType} on {PLATFORM_LABELS[li.platform as SocialPlatform] || li.platform}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Content URL (optional)</label>
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://instagram.com/p/..."
            className="w-full text-sm border border-gray-200 rounded px-3 py-1.5"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!selectedLineItem || submitting}
          className="btn btn-coral text-sm px-5 py-2 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}

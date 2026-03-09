# Phase 3: Unit-Aware Publisher Order Flow — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enhance the publisher order inbox to show creative unit cards with per-unit accept/revision/reject actions, production kit downloads, and unit-level delivery proof uploads.

**Architecture:** The existing order inbox (`/publisher/dashboard/orders`) shows line items in a flat list. We replace this with unit cards that show creative previews, compliance notes, and per-unit actions. Units are fetched from the `campaign_units` table alongside orders. The order-level accept/reject is replaced with per-unit actions that roll up to order status. A new API endpoint generates downloadable production kit ZIPs. Delivery proof is submitted per-unit via PATCH to the units API.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, existing order state machine, existing campaign_units CRUD API

---

### Task 1: API — Fetch Units with Orders

Add a query parameter to the orders list API so the publisher's order inbox can fetch associated campaign units alongside each order.

**Files:**
- Modify: `src/app/api/orders/route.ts`

**Step 1: Read the existing GET handler**

Read `src/app/api/orders/route.ts` to understand the current GET handler. It fetches orders with line items, deliverables, campaigns, and publishers joined.

**Step 2: Add units to the order response**

After fetching orders, also fetch campaign_units for each order's campaign_id + publisher_id pair. Add a `units` array to each order in the response.

In the GET handler, after the main orders query, add a second query:

```typescript
// After fetching orders, fetch associated campaign units
const campaignIds = [...new Set(orders.map((o: any) => o.campaign_id))];
const publisherIds = [...new Set(orders.map((o: any) => o.publisher_id))];

let unitsData: any[] = [];
if (campaignIds.length > 0) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: units } = await (supabase as any)
    .from('campaign_units')
    .select('*')
    .in('campaign_id', campaignIds)
    .in('publisher_id', publisherIds);
  unitsData = units || [];
}
```

Then in the order mapping, add:

```typescript
units: unitsData
  .filter((u: any) => u.campaign_id === order.campaign_id && u.publisher_id === order.publisher_id)
  .map((u: any) => ({
    id: u.id,
    campaignId: u.campaign_id,
    publisherId: u.publisher_id,
    channelGroup: u.channel_group,
    formatKey: u.format_key,
    platform: u.platform,
    placement: u.placement,
    status: u.status,
    tier: u.tier,
    creativeAssets: u.creative_assets,
    complianceNotes: u.compliance_notes,
    revisionFeedback: u.revision_feedback,
    proof: u.proof,
    deadline: u.deadline,
    deliveredAt: u.delivered_at,
    payoutCents: u.payout_cents,
    createdAt: u.created_at,
  })),
```

**Step 3: Commit**

```bash
git add src/app/api/orders/route.ts
git commit -m "feat: include campaign units in order list API response"
```

---

### Task 2: API — Unit Status Actions

Add dedicated endpoints for the three publisher unit actions: accept, request revision, and reject. These PATCH the unit status and optionally set revision feedback or rejection reason.

**Files:**
- Modify: `src/app/api/campaigns/[id]/units/[unitId]/route.ts`

**Step 1: Read the existing PATCH handler**

The current PATCH handler accepts any field updates. We need to add validation for status transitions and handle the revision_feedback field properly.

**Step 2: Add unit status transition validation**

Add a `UNIT_TRANSITIONS` map at the top of the file (or import from a shared module):

```typescript
const UNIT_TRANSITIONS: Record<string, string[]> = {
  draft: ['ready'],
  ready: ['sent'],
  sent: ['pending_publisher'],
  pending_publisher: ['accepted', 'revision_requested', 'rejected'],
  accepted: ['in_production'],
  revision_requested: ['ready', 'sent', 'pending_publisher'],
  rejected: [],
  in_production: ['delivered'],
  delivered: [],
};
```

In the PATCH handler, when `body.status` is provided, validate the transition:

```typescript
if (body.status !== undefined) {
  // Fetch current unit to validate transition
  const { data: current } = await (supabase as any)
    .from('campaign_units')
    .select('status')
    .eq('id', unitId)
    .single();

  if (current) {
    const allowed = UNIT_TRANSITIONS[current.status] || [];
    if (!allowed.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid transition from '${current.status}' to '${body.status}'` },
        { status: 400 }
      );
    }
  }
  updates.status = body.status;
}
```

When status is `revision_requested`, require `revisionFeedback`:

```typescript
if (body.status === 'revision_requested' && !body.revisionFeedback) {
  return NextResponse.json(
    { error: 'revisionFeedback is required when requesting a revision' },
    { status: 400 }
  );
}
```

**Step 3: Commit**

```bash
git add src/app/api/campaigns/[id]/units/[unitId]/route.ts
git commit -m "feat: add unit status transition validation with revision feedback requirement"
```

---

### Task 3: UnitCard Component for Publisher View

A card component showing a unit's creative preview, format info, compliance notes, and action buttons (Accept / Request Revision / Reject). This is the publisher's view — different from the advertiser's `UnitReviewCard`.

**Files:**
- Create: `src/components/publisher/orders/UnitCard.tsx`

**Step 1: Write the component**

```typescript
'use client';

import { useState } from 'react';
import type { ChannelGroup, CreativeAssets, UnitStatus } from '@/lib/channels/types';
import { UNIT_STATUS_LABELS, COMPLIANCE_DEFAULTS } from '@/lib/channels';

interface UnitCardProps {
  unitId: string;
  campaignId: string;
  formatKey: string;
  formatLabel: string;
  channelGroup: ChannelGroup;
  platform: string;
  placement: string;
  status: UnitStatus;
  creativeAssets: CreativeAssets;
  complianceNotes: string | null;
  revisionFeedback: string | null;
  payoutCents: number;
  onAccept: (unitId: string) => Promise<void>;
  onRequestRevision: (unitId: string, feedback: string) => Promise<void>;
  onReject: (unitId: string, reason: string) => Promise<void>;
  onMarkDelivered: (unitId: string, proof: { postUrl?: string; screenshotUrl?: string }) => Promise<void>;
}

const GROUP_COLORS: Record<ChannelGroup, string> = {
  social: 'bg-blue-100 text-blue-700',
  display: 'bg-purple-100 text-purple-700',
  audio_video: 'bg-orange-100 text-orange-700',
};

const REJECTION_REASONS = [
  'Does not align with editorial standards',
  'Audience mismatch for our community',
  'Scheduling conflict',
  'Content quality concerns',
  'Other',
];

export function UnitCard({
  unitId,
  campaignId,
  formatKey,
  formatLabel,
  channelGroup,
  platform,
  placement,
  status,
  creativeAssets,
  complianceNotes,
  revisionFeedback: existingFeedback,
  payoutCents,
  onAccept,
  onRequestRevision,
  onReject,
  onMarkDelivered,
}: UnitCardProps) {
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showDeliverForm, setShowDeliverForm] = useState(false);
  const [revisionText, setRevisionText] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [deliverUrl, setDeliverUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const statusDisplay = UNIT_STATUS_LABELS[status] || { label: status, color: 'gray' };
  const thumbnail = creativeAssets.files?.[0];
  const isPending = status === 'pending_publisher';
  const isInProduction = status === 'in_production' || status === 'accepted';
  const compliance = complianceNotes || COMPLIANCE_DEFAULTS[platform] || '';

  async function handleAction(action: () => Promise<void>) {
    setLoading(true);
    try {
      await action();
    } finally {
      setLoading(false);
      setShowRevisionForm(false);
      setShowRejectForm(false);
      setShowDeliverForm(false);
    }
  }

  const STATUS_COLORS: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-50 text-blue-700',
    yellow: 'bg-amber-50 text-amber-700',
    green: 'bg-emerald-50 text-emerald-700',
    orange: 'bg-orange-50 text-orange-700',
    red: 'bg-red-50 text-red-700',
    purple: 'bg-purple-50 text-purple-700',
  };

  return (
    <div className={`rounded-xl border p-4 transition-all ${
      isPending ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200 bg-white'
    }`}>
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="w-24 h-24 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
          {thumbnail && thumbnail.mimeType?.startsWith('image/') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbnail.url} alt="" className="w-full h-full object-cover" />
          ) : thumbnail ? (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              {thumbnail.mimeType?.split('/')[0] || 'file'}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
              No preview
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${GROUP_COLORS[channelGroup]}`}>
              {channelGroup === 'audio_video' ? 'Audio/Video' : channelGroup.charAt(0).toUpperCase() + channelGroup.slice(1)}
            </span>
            <span className="text-xs text-gray-500">{formatLabel}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ml-auto ${STATUS_COLORS[statusDisplay.color] || STATUS_COLORS.gray}`}>
              {statusDisplay.label}
            </span>
          </div>

          <p className="text-sm font-medium text-gray-900 truncate">
            {creativeAssets.headline || '(No headline)'}
          </p>
          {creativeAssets.bodyText && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{creativeAssets.bodyText}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {platform.charAt(0).toUpperCase() + platform.slice(1)} · {placement.replace(/_/g, ' ')}
            {payoutCents > 0 && (
              <span className="ml-2 font-medium text-gray-600">
                ${(payoutCents / 100).toFixed(2)}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* CTA / Click-through info */}
      {creativeAssets.ctaUrl && (
        <div className="mt-3 px-3 py-2 bg-gray-50 rounded-lg text-xs">
          <span className="text-gray-400">CTA: </span>
          <span className="font-medium text-gray-700">{creativeAssets.ctaText || 'Link'}</span>
          <span className="text-gray-400 ml-1">→ {creativeAssets.ctaUrl}</span>
        </div>
      )}

      {/* Hashtags */}
      {creativeAssets.hashtags && creativeAssets.hashtags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {creativeAssets.hashtags.map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
      )}

      {/* Compliance */}
      {compliance && (
        <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg p-2.5">
          <p className="text-xs font-medium text-amber-700">Platform Compliance</p>
          <p className="text-xs text-amber-600 mt-0.5">{compliance}</p>
        </div>
      )}

      {/* Existing revision feedback */}
      {existingFeedback && (
        <div className="mt-3 bg-orange-50 border border-orange-100 rounded-lg p-2.5">
          <p className="text-xs font-medium text-orange-700">Revision Requested</p>
          <p className="text-xs text-orange-600 mt-0.5">{existingFeedback}</p>
        </div>
      )}

      {/* Actions — pending_publisher */}
      {isPending && !showRevisionForm && !showRejectForm && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => handleAction(() => onAccept(unitId))}
            disabled={loading}
            className="btn btn-coral text-sm px-4 py-2 disabled:opacity-50"
          >
            Accept
          </button>
          <button
            onClick={() => setShowRevisionForm(true)}
            className="text-sm px-4 py-2 border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
          >
            Request Revision
          </button>
          <button
            onClick={() => setShowRejectForm(true)}
            className="text-sm px-4 py-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
          >
            Reject
          </button>
        </div>
      )}

      {/* Revision form */}
      {showRevisionForm && (
        <div className="mt-4 bg-orange-50 rounded-lg p-3 border border-orange-200">
          <p className="text-sm font-medium text-orange-700 mb-2">What needs to change?</p>
          <textarea
            value={revisionText}
            onChange={e => setRevisionText(e.target.value)}
            placeholder="Describe what the advertiser should revise..."
            rows={3}
            className="w-full text-sm border border-orange-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleAction(() => onRequestRevision(unitId, revisionText))}
              disabled={!revisionText.trim() || loading}
              className="text-sm px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Sending...' : 'Send Revision Request'}
            </button>
            <button onClick={() => { setShowRevisionForm(false); setRevisionText(''); }} className="text-sm text-gray-500 px-3">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reject form */}
      {showRejectForm && (
        <div className="mt-4 bg-red-50 rounded-lg p-3 border border-red-200">
          <p className="text-sm font-medium text-red-700 mb-2">Reason for rejecting</p>
          <div className="space-y-1.5">
            {REJECTION_REASONS.map(reason => (
              <label key={reason} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="reject-reason"
                  value={reason}
                  checked={rejectReason === reason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="text-red-500 focus:ring-red-300"
                />
                <span className="text-sm text-gray-700">{reason}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => handleAction(() => onReject(unitId, rejectReason))}
              disabled={!rejectReason || loading}
              className="text-sm px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Rejecting...' : 'Reject Unit'}
            </button>
            <button onClick={() => { setShowRejectForm(false); setRejectReason(''); }} className="text-sm text-gray-500 px-3">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Deliver action — accepted or in_production */}
      {isInProduction && !showDeliverForm && (
        <div className="mt-4">
          <button
            onClick={() => setShowDeliverForm(true)}
            className="btn btn-coral text-sm px-4 py-2"
          >
            Mark as Delivered
          </button>
        </div>
      )}

      {/* Deliver form */}
      {showDeliverForm && (
        <div className="mt-4 bg-emerald-50 rounded-lg p-3 border border-emerald-200">
          <p className="text-sm font-medium text-emerald-700 mb-2">Delivery Proof (optional)</p>
          <input
            type="url"
            value={deliverUrl}
            onChange={e => setDeliverUrl(e.target.value)}
            placeholder="https://instagram.com/p/... (post URL)"
            className="w-full text-sm border border-emerald-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleAction(() => onMarkDelivered(unitId, { postUrl: deliverUrl || undefined }))}
              disabled={loading}
              className="text-sm px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Submitting...' : 'Confirm Delivery'}
            </button>
            <button onClick={() => { setShowDeliverForm(false); setDeliverUrl(''); }} className="text-sm text-gray-500 px-3">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/publisher/orders/UnitCard.tsx
git commit -m "feat: add publisher UnitCard with accept/revision/reject/deliver actions"
```

---

### Task 4: Wire UnitCards into Order Inbox

Replace the plain line-item display in the expanded order detail with UnitCard components. Fall back to line items for orders that don't have units (backward compatibility with existing demo orders).

**Files:**
- Modify: `src/app/publisher/dashboard/orders/page.tsx`

**Step 1: Read the current file**

Read `src/app/publisher/dashboard/orders/page.tsx` in full.

**Step 2: Add unit type to OrderRow**

Add to the `OrderRow` interface:

```typescript
units: {
  id: string;
  campaignId: string;
  publisherId: string;
  channelGroup: string;
  formatKey: string;
  platform: string;
  placement: string;
  status: string;
  tier: string;
  creativeAssets: Record<string, any>;
  complianceNotes: string | null;
  revisionFeedback: string | null;
  proof: Record<string, any> | null;
  deadline: string | null;
  deliveredAt: string | null;
  payoutCents: number;
  createdAt: string;
}[];
```

**Step 3: Import UnitCard and add action handlers**

Import:
```typescript
import { UnitCard } from '@/components/publisher/orders/UnitCard';
```

Add handler functions inside the component:

```typescript
async function handleUnitAccept(unitId: string) {
  const unit = orders.flatMap(o => o.units || []).find(u => u.id === unitId);
  if (!unit) return;
  const res = await fetch(`/api/campaigns/${unit.campaignId}/units/${unitId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'accepted' }),
  });
  if (res.ok) {
    showToast('Unit accepted');
    fetchOrders();
  } else {
    const data = await res.json();
    showToast(data.error || 'Failed to accept unit', true);
  }
}

async function handleUnitRevision(unitId: string, feedback: string) {
  const unit = orders.flatMap(o => o.units || []).find(u => u.id === unitId);
  if (!unit) return;
  const res = await fetch(`/api/campaigns/${unit.campaignId}/units/${unitId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'revision_requested', revisionFeedback: feedback }),
  });
  if (res.ok) {
    showToast('Revision requested');
    fetchOrders();
  } else {
    const data = await res.json();
    showToast(data.error || 'Failed to request revision', true);
  }
}

async function handleUnitReject(unitId: string, reason: string) {
  const unit = orders.flatMap(o => o.units || []).find(u => u.id === unitId);
  if (!unit) return;
  const res = await fetch(`/api/campaigns/${unit.campaignId}/units/${unitId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'rejected', revisionFeedback: reason }),
  });
  if (res.ok) {
    showToast('Unit rejected');
    fetchOrders();
  } else {
    const data = await res.json();
    showToast(data.error || 'Failed to reject unit', true);
  }
}

async function handleUnitDelivered(unitId: string, proof: { postUrl?: string; screenshotUrl?: string }) {
  const unit = orders.flatMap(o => o.units || []).find(u => u.id === unitId);
  if (!unit) return;
  const res = await fetch(`/api/campaigns/${unit.campaignId}/units/${unitId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'delivered', proof }),
  });
  if (res.ok) {
    showToast('Marked as delivered');
    fetchOrders();
  } else {
    const data = await res.json();
    showToast(data.error || 'Failed to mark delivered', true);
  }
}
```

**Step 4: Replace expanded detail section**

In the expanded order detail, find the "Line Items" section (the `<div className="mt-4 space-y-2">` with `<p className="text-xs ...">Line Items</p>`). Replace it with a conditional:

```typescript
{/* Units (new) — or fall back to line items for legacy orders */}
{order.units && order.units.length > 0 ? (
  <div className="mt-4 space-y-3">
    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Creative Units</p>
    {order.units.map(unit => (
      <UnitCard
        key={unit.id}
        unitId={unit.id}
        campaignId={unit.campaignId}
        formatKey={unit.formatKey}
        formatLabel={unit.formatKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
        channelGroup={unit.channelGroup as any}
        platform={unit.platform}
        placement={unit.placement}
        status={unit.status as any}
        creativeAssets={unit.creativeAssets as any}
        complianceNotes={unit.complianceNotes}
        revisionFeedback={unit.revisionFeedback}
        payoutCents={unit.payoutCents}
        onAccept={handleUnitAccept}
        onRequestRevision={handleUnitRevision}
        onReject={handleUnitReject}
        onMarkDelivered={handleUnitDelivered}
      />
    ))}
  </div>
) : (
  <div className="mt-4 space-y-2">
    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Line Items</p>
    {order.lineItems.map(item => (
      /* ... existing line item rendering unchanged ... */
    ))}
  </div>
)}
```

Keep the existing order-level Accept/Decline buttons for orders without units. For orders WITH units, hide them (per-unit actions replace them).

**Step 5: Update actions section**

Wrap the existing order-level action buttons in a condition:

```typescript
{/* Order-level actions — only show for orders without units */}
{(!order.units || order.units.length === 0) && (
  <div className="mt-4 flex gap-3">
    {/* ... existing isPending, accepted, in_progress buttons unchanged ... */}
  </div>
)}
```

**Step 6: Commit**

```bash
git add src/app/publisher/dashboard/orders/page.tsx
git commit -m "feat: wire UnitCards into publisher order inbox with per-unit actions"
```

---

### Task 5: Production Kit Download Endpoint

Create an API endpoint that generates a downloadable production kit for an accepted unit — returns a JSON manifest of assets with download URLs (full ZIP generation is a future enhancement; for now we provide a structured JSON response the frontend renders as a download checklist).

**Files:**
- Create: `src/app/api/campaigns/[id]/units/[unitId]/production-kit/route.ts`

**Step 1: Write the endpoint**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/db/supabase';
import { COMPLIANCE_DEFAULTS } from '@/lib/channels';

// GET /api/campaigns/[id]/units/[unitId]/production-kit
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; unitId: string }> }
) {
  const { id: campaignId, unitId } = await params;
  const supabase = getSupabaseClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: unit, error } = await (supabase as any)
    .from('campaign_units')
    .select('*')
    .eq('id', unitId)
    .eq('campaign_id', campaignId)
    .single();

  if (error || !unit) {
    return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
  }

  if (unit.status !== 'accepted' && unit.status !== 'in_production') {
    return NextResponse.json(
      { error: 'Production kit is only available for accepted units' },
      { status: 400 }
    );
  }

  const assets = unit.creative_assets || {};
  const compliance = unit.compliance_notes || COMPLIANCE_DEFAULTS[unit.platform] || '';

  // Fetch campaign info for context
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: campaign } = await (supabase as any)
    .from('campaigns')
    .select('name, department, start_date, end_date')
    .eq('id', campaignId)
    .single();

  const kit = {
    unitId: unit.id,
    format: unit.format_key,
    platform: unit.platform,
    placement: unit.placement,
    campaign: campaign ? {
      name: campaign.name,
      department: campaign.department,
      startDate: campaign.start_date,
      endDate: campaign.end_date,
    } : null,
    creative: {
      files: assets.files || [],
      headline: assets.headline || null,
      bodyText: assets.body_text || assets.bodyText || null,
      ctaText: assets.cta_text || assets.ctaText || null,
      ctaUrl: assets.cta_url || assets.ctaUrl || null,
      hashtags: assets.hashtags || [],
      mentions: assets.mentions || [],
      clickThroughUrl: assets.click_through_url || assets.clickThroughUrl || null,
    },
    compliance,
    deadline: unit.deadline,
    payout: unit.payout_cents,
  };

  return NextResponse.json(kit);
}
```

**Step 2: Commit**

```bash
git add src/app/api/campaigns/[id]/units/[unitId]/production-kit/route.ts
git commit -m "feat: add production kit API endpoint for accepted units"
```

---

### Task 6: Production Kit Panel in UnitCard

Add a "Download Production Kit" button to UnitCards that are in `accepted` or `in_production` status. Clicking it fetches the production kit API and displays the asset list + spec sheet inline.

**Files:**
- Modify: `src/components/publisher/orders/UnitCard.tsx`

**Step 1: Add production kit state and fetcher**

Inside the UnitCard component, add:

```typescript
const [showKit, setShowKit] = useState(false);
const [kit, setKit] = useState<any>(null);
const [kitLoading, setKitLoading] = useState(false);

async function fetchProductionKit() {
  setKitLoading(true);
  try {
    const res = await fetch(`/api/campaigns/${campaignId}/units/${unitId}/production-kit`);
    if (res.ok) {
      setKit(await res.json());
      setShowKit(true);
    }
  } finally {
    setKitLoading(false);
  }
}
```

**Step 2: Add the button and kit display**

After the compliance section, before the action buttons, add:

```typescript
{/* Production Kit — only for accepted/in_production */}
{(status === 'accepted' || status === 'in_production') && (
  <>
    {!showKit ? (
      <button
        onClick={fetchProductionKit}
        disabled={kitLoading}
        className="mt-3 w-full text-sm px-4 py-2 border border-teal-300 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors disabled:opacity-50"
      >
        {kitLoading ? 'Loading...' : 'View Production Kit'}
      </button>
    ) : kit && (
      <div className="mt-3 bg-teal-50 border border-teal-200 rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-teal-800">Production Kit</p>
          <button onClick={() => setShowKit(false)} className="text-xs text-teal-500">Hide</button>
        </div>

        {/* Campaign context */}
        {kit.campaign && (
          <div className="text-xs text-teal-700">
            <p><span className="font-medium">Campaign:</span> {kit.campaign.name}</p>
            {kit.campaign.department && <p><span className="font-medium">Department:</span> {kit.campaign.department}</p>}
            {kit.deadline && <p><span className="font-medium">Deadline:</span> {new Date(kit.deadline).toLocaleDateString()}</p>}
          </div>
        )}

        {/* Creative assets */}
        {kit.creative.files.length > 0 && (
          <div>
            <p className="text-xs font-medium text-teal-700 mb-1">Assets</p>
            {kit.creative.files.map((file: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-xs text-teal-600 py-1">
                <span>📎</span>
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-teal-800">
                  {file.filename}
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Copy */}
        {kit.creative.headline && (
          <div>
            <p className="text-xs font-medium text-teal-700">Headline</p>
            <p className="text-xs text-teal-600 bg-white rounded px-2 py-1 mt-0.5">{kit.creative.headline}</p>
          </div>
        )}
        {kit.creative.bodyText && (
          <div>
            <p className="text-xs font-medium text-teal-700">Body / Caption</p>
            <p className="text-xs text-teal-600 bg-white rounded px-2 py-1 mt-0.5 whitespace-pre-wrap">{kit.creative.bodyText}</p>
          </div>
        )}
        {kit.creative.hashtags.length > 0 && (
          <div>
            <p className="text-xs font-medium text-teal-700">Hashtags</p>
            <p className="text-xs text-teal-600">{kit.creative.hashtags.join(' ')}</p>
          </div>
        )}

        {/* Compliance */}
        {kit.compliance && (
          <div className="bg-amber-50 border border-amber-100 rounded p-2">
            <p className="text-xs font-medium text-amber-700">Compliance</p>
            <p className="text-xs text-amber-600">{kit.compliance}</p>
          </div>
        )}
      </div>
    )}
  </>
)}
```

**Step 3: Commit**

```bash
git add src/components/publisher/orders/UnitCard.tsx
git commit -m "feat: add production kit panel to UnitCard for accepted units"
```

---

### Task 7: Format Label Lookup Utility

The UnitCard currently derives format labels from the format_key by replacing underscores. Create a proper lookup from the channel_formats table.

**Files:**
- Create: `src/lib/channels/format-labels.ts`

**Step 1: Write the utility**

```typescript
// Static format label map — avoids an API call per card render.
// Keep in sync with seed data in 20260308000002_seed_channel_formats.sql

export const FORMAT_LABELS: Record<string, string> = {
  static_image: 'Static Image Post',
  video_reel: 'Video / Reel',
  story: 'Story',
  carousel: 'Carousel',
  text_image: 'Text + Image',
  newsletter_mention: 'Newsletter Mention',
  newsletter_dedicated: 'Dedicated Newsletter Send',
  messaging_broadcast: 'Messaging Broadcast',
  banner_ad: 'Banner Ad (IAB)',
  sponsored_article: 'Sponsored Article',
  podcast_clip: 'Podcast Audio Clip',
  podcast_script: 'Podcast Talent Read',
  video_produced: 'Produced Video',
};

export function getFormatLabel(formatKey: string): string {
  return FORMAT_LABELS[formatKey] || formatKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
```

**Step 2: Update UnitCard to use it**

In the order inbox where UnitCard is rendered, replace the inline `formatLabel` derivation with:

```typescript
import { getFormatLabel } from '@/lib/channels/format-labels';

// In the UnitCard render:
formatLabel={getFormatLabel(unit.formatKey)}
```

**Step 3: Commit**

```bash
git add src/lib/channels/format-labels.ts src/app/publisher/dashboard/orders/page.tsx
git commit -m "feat: add format label lookup utility and use in order inbox"
```

---

### Task 8: Build Verification and Push

**Step 1: Build check**

Run: `npx next build`
Expected: Build succeeds with no new errors.

**Step 2: Visual smoke test**

Start dev server, navigate to `/sf/publisher/dashboard/orders`:
- Orders with units should show UnitCards with creative previews
- Pending units show Accept / Request Revision / Reject buttons
- Revision form shows textarea, reject form shows radio reasons
- Accepted units show "View Production Kit" button
- Production kit panel shows campaign context, assets, copy, compliance
- Legacy orders (without units) still show line items as before

**Step 3: Push**

```bash
git push origin main
```

---

## Summary

| Task | What it creates | Depends on |
|------|----------------|------------|
| 1 | Units in order API response | Phase 1 campaign_units table |
| 2 | Unit status transition validation | Phase 1 units CRUD API |
| 3 | Publisher UnitCard component | — |
| 4 | Wire UnitCards into order inbox | Tasks 1, 3 |
| 5 | Production kit API endpoint | — |
| 6 | Production kit panel in UnitCard | Tasks 3, 5 |
| 7 | Format label utility | — |
| 8 | Verification + push | All above |

/**
 * Order Status State Machine
 *
 * Defines the valid transitions for order lifecycle management.
 * Based on business.md 8-step transaction lifecycle:
 *
 * 1. Campaign Created → 2. Publishers Matched → 3. Order Placed (draft)
 * 4. Publisher Accepts (accepted) → 5. Content Created (in_progress)
 * 6. Deliverables Submitted (delivered) → 7. Advertiser Confirms (completed)
 * 8. Payment Released (via procurement)
 *
 * STUB: This is demo-ready logic. Wire to real API routes when backend is built.
 */

import type { OrderStatus, ProcurementStatus } from '@/types';

// =============================================================================
// STATE TRANSITIONS
// =============================================================================

/** Valid order status transitions — directed graph */
const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft:             ['pending_publisher', 'cancelled'],
  pending_publisher: ['accepted', 'rejected', 'cancelled'],
  accepted:          ['in_progress', 'cancelled'],
  rejected:          [],  // Terminal state
  in_progress:       ['delivered', 'cancelled'],
  delivered:         ['completed', 'disputed'],
  completed:         [],  // Terminal state
  disputed:          ['in_progress', 'completed', 'cancelled'],
  cancelled:         [],  // Terminal state
};

/** Valid procurement status transitions */
const PROCUREMENT_TRANSITIONS: Record<ProcurementStatus, ProcurementStatus[]> = {
  not_submitted:   ['pending_approval'],
  pending_approval: ['approved', 'not_submitted'],
  approved:         ['po_generated'],
  po_generated:     ['invoiced'],
  invoiced:         ['paid'],
  paid:             [],  // Terminal state
};

// =============================================================================
// TRANSITION VALIDATION
// =============================================================================

/** Check if an order status transition is valid */
export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Check if a procurement status transition is valid */
export function canTransitionProcurement(from: ProcurementStatus, to: ProcurementStatus): boolean {
  return PROCUREMENT_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Get available next states for an order */
export function getAvailableOrderTransitions(current: OrderStatus): OrderStatus[] {
  return ORDER_TRANSITIONS[current] || [];
}

/** Get available next states for procurement */
export function getAvailableProcurementTransitions(current: ProcurementStatus): ProcurementStatus[] {
  return PROCUREMENT_TRANSITIONS[current] || [];
}

/** Check if an order is in a terminal state */
export function isTerminalOrderState(status: OrderStatus): boolean {
  return ORDER_TRANSITIONS[status]?.length === 0;
}

// =============================================================================
// STATUS DISPLAY HELPERS
// =============================================================================

export interface StatusDisplay {
  label: string;
  color: string;        // Tailwind color class
  bgColor: string;      // Tailwind bg class
  description: string;
}

export const ORDER_STATUS_DISPLAY: Record<OrderStatus, StatusDisplay> = {
  draft: {
    label: 'Draft',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    description: 'Order is being prepared',
  },
  pending_publisher: {
    label: 'Pending Publisher',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    description: 'Waiting for publisher to accept or reject',
  },
  accepted: {
    label: 'Accepted',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    description: 'Publisher accepted — work can begin',
  },
  rejected: {
    label: 'Rejected',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    description: 'Publisher declined this order',
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    description: 'Publisher is creating content',
  },
  delivered: {
    label: 'Delivered',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    description: 'Deliverables submitted for review',
  },
  completed: {
    label: 'Completed',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    description: 'Order fulfilled and confirmed',
  },
  disputed: {
    label: 'Disputed',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    description: 'Issue raised — needs resolution',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    description: 'Order was cancelled',
  },
};

export const PROCUREMENT_STATUS_DISPLAY: Record<ProcurementStatus, StatusDisplay> = {
  not_submitted: {
    label: 'Not Submitted',
    color: 'text-slate-500',
    bgColor: 'bg-slate-100',
    description: 'Procurement not yet initiated',
  },
  pending_approval: {
    label: 'Pending Approval',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    description: 'Awaiting department budget approval',
  },
  approved: {
    label: 'Approved',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    description: 'Budget approved — PO can be generated',
  },
  po_generated: {
    label: 'PO Generated',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    description: 'Purchase order issued to publisher',
  },
  invoiced: {
    label: 'Invoiced',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    description: 'Publisher submitted invoice',
  },
  paid: {
    label: 'Paid',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    description: 'Payment complete',
  },
};

// =============================================================================
// ACTION LABELS (what the user clicks to trigger a transition)
// =============================================================================

/** Human-readable action labels for order transitions */
export const ORDER_ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  pending_publisher: 'Send to Publisher',
  accepted: 'Accept Order',
  rejected: 'Decline Order',
  in_progress: 'Start Work',
  delivered: 'Submit Deliverables',
  completed: 'Confirm Delivery',
  disputed: 'Raise Issue',
  cancelled: 'Cancel Order',
};

/** Who can trigger each transition */
export const ORDER_TRANSITION_ACTORS: Partial<Record<OrderStatus, 'advertiser' | 'publisher' | 'either'>> = {
  pending_publisher: 'advertiser',   // Advertiser sends order
  accepted: 'publisher',             // Publisher accepts
  rejected: 'publisher',             // Publisher declines
  in_progress: 'publisher',          // Publisher starts work
  delivered: 'publisher',            // Publisher submits deliverables
  completed: 'advertiser',           // Advertiser confirms delivery
  disputed: 'either',                // Either party can raise dispute
  cancelled: 'either',               // Either party can cancel (with restrictions)
};

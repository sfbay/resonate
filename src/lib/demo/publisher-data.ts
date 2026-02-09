/**
 * Demo Publisher Data
 *
 * Mock data for publisher pathway demonstrations.
 * Includes rate cards, orders, deliverables, and order history
 * for El Tecolote (the primary demo publisher).
 *
 * All data matches the real type system in src/types/index.ts.
 * SWAP: Replace these generators with real Supabase queries when backend is built.
 */

import type {
  RateCard,
  Rate,
  Order,
  OrderLineItem,
  Deliverable,
  OrderStatus,
  ProcurementStatus,
  OrderStatusChange,
  DeliverableType,
  SocialPlatform,
} from '@/types';

// =============================================================================
// DEMO PUBLISHER RATE CARD
// =============================================================================

/** El Tecolote's demo rate card */
export function getDemoRateCard(): RateCard {
  return {
    currency: 'USD',
    rates: [
      { deliverableType: 'sponsored_post', platform: 'instagram', price: 15000, description: 'Feed post with up to 3 images. Includes one round of revisions.' },
      { deliverableType: 'story', platform: 'instagram', price: 7500, description: 'Story sequence (3-5 slides). 24-hour visibility.' },
      { deliverableType: 'reel', platform: 'instagram', price: 25000, description: '15-60 second Reel. Bilingual captions included.' },
      { deliverableType: 'carousel', platform: 'instagram', price: 20000, description: 'Up to 10 slides with cohesive storytelling.' },
      { deliverableType: 'sponsored_post', platform: 'facebook', price: 12000, description: 'Facebook feed post. Cross-posted to page.' },
      { deliverableType: 'newsletter_feature', platform: 'newsletter', price: 30000, description: 'Featured placement in weekly Resonate newsletter (5,000+ subscribers).' },
      { deliverableType: 'newsletter_dedicated', platform: 'newsletter', price: 55000, description: 'Dedicated newsletter send to full subscriber list.' },
      { deliverableType: 'sponsored_post', platform: 'website', price: 20000, description: 'Sponsored article on eltecolote.org. Includes SEO optimization.' },
    ],
    notes: 'All content available in English and Spanish. Turnaround: 3-5 business days for social, 5-7 for newsletter/web. Volume discounts available for 5+ deliverables.',
  };
}

// =============================================================================
// DEMO ORDERS
// =============================================================================

/** Demo orders for El Tecolote's inbox */
export function getDemoOrders(): Order[] {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  return [
    // Active order — in progress
    {
      id: 'ord-demo-001',
      campaignId: 'cmp-demo-001',
      publisherId: '11111111-1111-1111-1111-111111111101',
      advertiserId: 'adv-demo-dph',
      lineItems: [
        {
          id: 'li-001-1',
          deliverableType: 'sponsored_post',
          platform: 'instagram',
          quantity: 2,
          unitPrice: 15000,
          totalPrice: 30000,
          description: 'Flu shot awareness posts — bilingual',
        },
        {
          id: 'li-001-2',
          deliverableType: 'newsletter_feature',
          platform: 'newsletter',
          quantity: 1,
          unitPrice: 30000,
          totalPrice: 30000,
          description: 'Newsletter feature on flu shot clinic locations',
        },
      ],
      subtotal: 60000,
      total: 69000, // subtotal + 15% service fee
      status: 'in_progress',
      procurementStatus: 'po_generated',
      purchaseOrderNumber: 'PO-DPH-26-0142',
      deliveryDeadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      deliverables: [
        {
          id: 'del-001-1',
          orderLineItemId: 'li-001-1',
          platform: 'instagram',
          type: 'sponsored_post',
          status: 'submitted',
          submittedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
          url: 'https://instagram.com/p/demo-flu-shot-1',
          metrics: { impressions: 3200, reach: 2800, engagement: 245, clicks: 89, capturedAt: now },
        },
        {
          id: 'del-001-2',
          orderLineItemId: 'li-001-1',
          platform: 'instagram',
          type: 'sponsored_post',
          status: 'pending',
        },
        {
          id: 'del-001-3',
          orderLineItemId: 'li-001-2',
          platform: 'newsletter',
          type: 'newsletter_feature',
          status: 'pending',
        },
      ],
      statusHistory: [
        { from: 'draft' as OrderStatus, to: 'pending_publisher', changedAt: twoWeeksAgo, changedBy: 'adv-demo-dph', notes: 'Order placed by DPH' },
        { from: 'pending_publisher', to: 'accepted', changedAt: new Date(twoWeeksAgo.getTime() + 24 * 60 * 60 * 1000), changedBy: '11111111-1111-1111-1111-111111111101', notes: 'Accepted by El Tecolote' },
        { from: 'accepted', to: 'in_progress', changedAt: weekAgo, changedBy: '11111111-1111-1111-1111-111111111101', notes: 'Work started' },
      ],
      createdAt: twoWeeksAgo,
      updatedAt: now,
    },

    // Pending acceptance
    {
      id: 'ord-demo-002',
      campaignId: 'cmp-demo-002',
      publisherId: '11111111-1111-1111-1111-111111111101',
      advertiserId: 'adv-demo-rec',
      lineItems: [
        {
          id: 'li-002-1',
          deliverableType: 'reel',
          platform: 'instagram',
          quantity: 1,
          unitPrice: 25000,
          totalPrice: 25000,
          description: 'Summer programs enrollment Reel',
        },
        {
          id: 'li-002-2',
          deliverableType: 'story',
          platform: 'instagram',
          quantity: 3,
          unitPrice: 7500,
          totalPrice: 22500,
          description: 'Story sequence — program highlights',
        },
      ],
      subtotal: 47500,
      total: 54625, // subtotal + 15% service fee
      status: 'pending_publisher',
      procurementStatus: 'approved',
      deliveryDeadline: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
      deliverables: [],
      statusHistory: [
        { from: 'draft' as OrderStatus, to: 'pending_publisher', changedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), changedBy: 'adv-demo-rec', notes: 'Order placed by Rec & Parks' },
      ],
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: now,
    },

    // Completed order
    {
      id: 'ord-demo-003',
      campaignId: 'cmp-demo-003',
      publisherId: '11111111-1111-1111-1111-111111111101',
      advertiserId: 'adv-demo-sfmta',
      lineItems: [
        {
          id: 'li-003-1',
          deliverableType: 'sponsored_post',
          platform: 'instagram',
          quantity: 1,
          unitPrice: 15000,
          totalPrice: 15000,
        },
        {
          id: 'li-003-2',
          deliverableType: 'sponsored_post',
          platform: 'facebook',
          quantity: 1,
          unitPrice: 12000,
          totalPrice: 12000,
        },
      ],
      subtotal: 27000,
      total: 31050, // subtotal + 15% service fee
      status: 'completed',
      procurementStatus: 'paid',
      purchaseOrderNumber: 'PO-SFMTA-25-0891',
      deliveryDeadline: monthAgo,
      deliverables: [
        {
          id: 'del-003-1',
          orderLineItemId: 'li-003-1',
          platform: 'instagram',
          type: 'sponsored_post',
          status: 'approved',
          submittedAt: new Date(monthAgo.getTime() - 3 * 24 * 60 * 60 * 1000),
          approvedAt: new Date(monthAgo.getTime() - 1 * 24 * 60 * 60 * 1000),
          url: 'https://instagram.com/p/demo-muni-routes',
          metrics: { impressions: 4100, reach: 3500, engagement: 312, clicks: 156, capturedAt: monthAgo },
        },
        {
          id: 'del-003-2',
          orderLineItemId: 'li-003-2',
          platform: 'facebook',
          type: 'sponsored_post',
          status: 'approved',
          submittedAt: new Date(monthAgo.getTime() - 3 * 24 * 60 * 60 * 1000),
          approvedAt: new Date(monthAgo.getTime() - 1 * 24 * 60 * 60 * 1000),
          url: 'https://facebook.com/eltecolote/posts/demo-muni',
          metrics: { impressions: 2800, reach: 2200, engagement: 187, clicks: 93, capturedAt: monthAgo },
        },
      ],
      statusHistory: [
        { from: 'draft' as OrderStatus, to: 'pending_publisher', changedAt: new Date(monthAgo.getTime() - 21 * 24 * 60 * 60 * 1000), changedBy: 'adv-demo-sfmta' },
        { from: 'pending_publisher', to: 'accepted', changedAt: new Date(monthAgo.getTime() - 20 * 24 * 60 * 60 * 1000), changedBy: '11111111-1111-1111-1111-111111111101' },
        { from: 'accepted', to: 'in_progress', changedAt: new Date(monthAgo.getTime() - 14 * 24 * 60 * 60 * 1000), changedBy: '11111111-1111-1111-1111-111111111101' },
        { from: 'in_progress', to: 'delivered', changedAt: new Date(monthAgo.getTime() - 3 * 24 * 60 * 60 * 1000), changedBy: '11111111-1111-1111-1111-111111111101' },
        { from: 'delivered', to: 'completed', changedAt: new Date(monthAgo.getTime() - 1 * 24 * 60 * 60 * 1000), changedBy: 'adv-demo-sfmta' },
      ],
      createdAt: new Date(monthAgo.getTime() - 21 * 24 * 60 * 60 * 1000),
      updatedAt: monthAgo,
    },
  ];
}

// =============================================================================
// DEMO REVENUE SUMMARY
// =============================================================================

export interface RevenueSummary {
  totalEarnings: number;       // Cents — total from completed orders (publisher keeps 100%)
  pendingEarnings: number;     // Cents — from in-progress orders
  platformFees: number;        // Cents — 15% service fee charged to advertisers (not deducted)
  activeOrders: number;
  completedOrders: number;
  totalDeliverables: number;
  completedDeliverables: number;
  averageOrderValue: number;   // Cents
}

export function getDemoRevenueSummary(): RevenueSummary {
  return {
    totalEarnings: 270000,       // $2,700 from completed orders (publisher keeps 100%)
    pendingEarnings: 107500,     // $1,075 from active orders
    platformFees: 40500,         // 15% service fee charged to advertisers (not deducted from publisher)
    activeOrders: 2,
    completedOrders: 5,
    totalDeliverables: 18,
    completedDeliverables: 12,
    averageOrderValue: 48143,    // ~$481
  };
}

// =============================================================================
// DEMO CONTENT GUIDELINES
// =============================================================================

export interface ContentGuidelines {
  editorialGuidelines: string;
  turnaroundDays: { social: number; newsletter: number; website: number };
  maxConcurrentOrders: number;
  languages: string[];
  blackoutDates: { start: string; end: string; reason: string }[];
  revisionPolicy: string;
  cancellationPolicy: string;
}

export function getDemoContentGuidelines(): ContentGuidelines {
  return {
    editorialGuidelines: 'All sponsored content must align with El Tecolote\'s mission of serving the Latino community in the Mission District. We maintain editorial independence — content is clearly labeled as sponsored. We do not accept content that contradicts our community values or promotes displacement of existing residents.',
    turnaroundDays: { social: 3, newsletter: 5, website: 7 },
    maxConcurrentOrders: 3,
    languages: ['english', 'spanish'],
    blackoutDates: [
      { start: '2026-05-05', end: '2026-05-05', reason: 'Cinco de Mayo coverage' },
      { start: '2026-11-01', end: '2026-11-02', reason: 'Día de los Muertos coverage' },
    ],
    revisionPolicy: 'One round of revisions included in base price. Additional revisions at $50/hour.',
    cancellationPolicy: 'Full refund if cancelled before work begins. 50% refund within first 48 hours of work. No refund after content is submitted for review.',
  };
}

// =============================================================================
// DEMO ADVERTISER NAMES (for display in order inbox)
// =============================================================================

export const DEMO_ADVERTISER_NAMES: Record<string, { name: string; department?: string }> = {
  'adv-demo-dph': { name: 'Dept. of Public Health', department: 'DPH' },
  'adv-demo-rec': { name: 'Recreation & Parks', department: 'RPD' },
  'adv-demo-sfmta': { name: 'SFMTA', department: 'SFMTA' },
  'adv-demo-oewd': { name: 'Office of Economic & Workforce Dev.', department: 'OEWD' },
  'adv-demo-dcyf': { name: 'Dept. of Children, Youth & Families', department: 'DCYF' },
};

/** Campaign names for display */
export const DEMO_CAMPAIGN_NAMES: Record<string, string> = {
  'cmp-demo-001': 'Flu Shot Awareness 2026',
  'cmp-demo-002': 'Summer Programs Enrollment',
  'cmp-demo-003': 'New Muni Routes — Mission',
  'cmp-demo-004': 'Small Business Grants Q2',
  'cmp-demo-005': 'Youth Mentorship Program',
};

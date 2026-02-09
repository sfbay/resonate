/**
 * Pricing & Product Bundles
 *
 * Defines the Resonate product bundles and rate card calculation helpers.
 * Based on business.md Part 6: Transaction Model.
 *
 * Revenue model: 15% platform service fee added on top of publisher rates.
 * Publishers receive 100% of their listed rate. Fees are itemized to advertisers.
 * Pricing: Flat-fee per publisher placement (not CPM/CPC).
 *
 * STUB: Demo-ready pricing logic. Wire to real payment processing when Stripe is integrated.
 */

import type { DeliverableType, SocialPlatform, Rate, RateCard, OrderLineItem } from '@/types';

// =============================================================================
// PRODUCT BUNDLES (from business.md)
// =============================================================================

export interface ProductBundle {
  id: string;
  name: string;
  description: string;
  priceRange: { min: number; max: number }; // In dollars
  deliverableCount: { min: number; max: number };
  publisherCount: { min: number; max: number };
  features: string[];
  recommended?: boolean;
}

export const PRODUCT_BUNDLES: ProductBundle[] = [
  {
    id: 'single_placement',
    name: 'Single Placement',
    description: 'One post with one publisher — test the waters.',
    priceRange: { min: 50, max: 600 },
    deliverableCount: { min: 1, max: 1 },
    publisherCount: { min: 1, max: 1 },
    features: [
      'Single social post or newsletter feature',
      'Basic performance report',
      'Publisher match recommendations',
    ],
  },
  {
    id: 'community_reach',
    name: 'Community Reach',
    description: 'Multi-format campaign with a single community publisher.',
    priceRange: { min: 500, max: 2000 },
    deliverableCount: { min: 2, max: 5 },
    publisherCount: { min: 1, max: 2 },
    features: [
      '2-5 deliverables across formats',
      'Multilingual creative support',
      'Engagement tracking dashboard',
      'Campaign performance report',
    ],
    recommended: true,
  },
  {
    id: 'multi_voice',
    name: 'Multi-Voice',
    description: 'Reach multiple communities through diverse publisher voices.',
    priceRange: { min: 1500, max: 5000 },
    deliverableCount: { min: 5, max: 15 },
    publisherCount: { min: 3, max: 6 },
    features: [
      '5-15 deliverables across 3-6 publishers',
      'Cross-community coordination',
      'AI-powered creative variants per publisher',
      'Comprehensive performance analytics',
      'Dedicated campaign manager support',
    ],
  },
  {
    id: 'sustained_presence',
    name: 'Sustained Presence',
    description: 'Ongoing monthly engagement with community publishers.',
    priceRange: { min: 3000, max: 10000 },
    deliverableCount: { min: 10, max: 40 },
    publisherCount: { min: 3, max: 10 },
    features: [
      'Monthly recurring placements',
      'Rolling creative refresh',
      'Priority publisher matching',
      'Real-time performance dashboard',
      'Quarterly strategy review',
      'Compliance reporting for mandates',
    ],
  },
];

// =============================================================================
// PLATFORM FEE
// =============================================================================

/** Platform service fee percentage (15% added on top of publisher rates) */
export const PLATFORM_FEE_RATE = 0.15;

/** Calculate platform service fee from publisher rate total (in cents) */
export function calculatePlatformFee(publisherRateCents: number): number {
  return Math.round(publisherRateCents * PLATFORM_FEE_RATE);
}

/** Calculate publisher payout — publishers receive 100% of their listed rate */
export function calculatePublisherPayout(publisherRateCents: number): number {
  return publisherRateCents;
}

// =============================================================================
// RATE CARD HELPERS
// =============================================================================

/** Default rate suggestions by deliverable type (in cents) */
export const SUGGESTED_RATES: Record<DeliverableType, { low: number; mid: number; high: number }> = {
  sponsored_post:        { low: 5000,  mid: 15000, high: 40000 },
  story:                 { low: 2500,  mid: 7500,  high: 20000 },
  reel:                  { low: 7500,  mid: 20000, high: 50000 },
  carousel:              { low: 7500,  mid: 17500, high: 45000 },
  newsletter_feature:    { low: 10000, mid: 25000, high: 60000 },
  newsletter_dedicated:  { low: 20000, mid: 45000, high: 100000 },
  live_stream:           { low: 15000, mid: 35000, high: 75000 },
  custom:                { low: 5000,  mid: 20000, high: 50000 },
};

/** Human-readable deliverable type labels */
export const DELIVERABLE_TYPE_LABELS: Record<DeliverableType, string> = {
  sponsored_post: 'Sponsored Post',
  story: 'Story',
  reel: 'Reel / Short Video',
  carousel: 'Carousel Post',
  newsletter_feature: 'Newsletter Feature',
  newsletter_dedicated: 'Dedicated Newsletter',
  live_stream: 'Live Stream',
  custom: 'Custom',
};

/** Human-readable platform labels */
export const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  twitter: 'X (Twitter)',
  youtube: 'YouTube',
  newsletter: 'Newsletter',
  website: 'Website',
  other: 'Other',
};

/** Deliverable types available per platform */
export const PLATFORM_DELIVERABLE_TYPES: Record<SocialPlatform, DeliverableType[]> = {
  instagram:   ['sponsored_post', 'story', 'reel', 'carousel', 'live_stream'],
  tiktok:      ['sponsored_post', 'reel', 'live_stream'],
  facebook:    ['sponsored_post', 'story', 'reel', 'carousel', 'live_stream'],
  twitter:     ['sponsored_post'],
  youtube:     ['sponsored_post', 'live_stream'],
  newsletter:  ['newsletter_feature', 'newsletter_dedicated'],
  website:     ['sponsored_post', 'custom'],
  other:       ['custom'],
};

// =============================================================================
// ORDER LINE ITEM CALCULATIONS
// =============================================================================

/** Calculate line item total from rate and quantity */
export function calculateLineItemTotal(rate: Rate, quantity: number): number {
  return rate.price * quantity;
}

/** Calculate order subtotal from line items (in cents) */
export function calculateOrderSubtotal(lineItems: OrderLineItem[]): number {
  return lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
}

/** Calculate order total with platform fee added on top (in cents) */
export function calculateOrderTotal(lineItems: OrderLineItem[]): {
  subtotal: number;
  platformFee: number;
  total: number;
  publisherPayout: number;
} {
  const subtotal = calculateOrderSubtotal(lineItems);
  const platformFee = calculatePlatformFee(subtotal);
  return {
    subtotal,
    platformFee,
    total: subtotal + platformFee, // Advertiser pays publisher rate + service fee
    publisherPayout: subtotal,     // Publisher receives 100% of their listed rates
  };
}

/** Format cents to display dollars */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/** Format cents to precise dollars */
export function formatCentsPrecise(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// =============================================================================
// RATE CARD BUILDER HELPERS
// =============================================================================

/** Create an empty rate card */
export function createEmptyRateCard(): RateCard {
  return {
    currency: 'USD',
    rates: [],
  };
}

/** Add a rate to a rate card */
export function addRate(
  rateCard: RateCard,
  type: DeliverableType,
  platform: SocialPlatform,
  price: number,
  description?: string
): RateCard {
  return {
    ...rateCard,
    rates: [
      ...rateCard.rates,
      { deliverableType: type, platform, price, description },
    ],
  };
}

/** Remove a rate from a rate card by index */
export function removeRate(rateCard: RateCard, index: number): RateCard {
  return {
    ...rateCard,
    rates: rateCard.rates.filter((_, i) => i !== index),
  };
}

/** Update a rate in a rate card by index */
export function updateRate(rateCard: RateCard, index: number, updates: Partial<Rate>): RateCard {
  return {
    ...rateCard,
    rates: rateCard.rates.map((rate, i) =>
      i === index ? { ...rate, ...updates } : rate
    ),
  };
}

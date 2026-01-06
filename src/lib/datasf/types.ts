/**
 * DataSF API Types
 *
 * Type definitions for San Francisco Open Data API responses.
 * Starting with Eviction Notices dataset.
 */

import type { SFNeighborhood } from '@/types';

// =============================================================================
// EVICTION NOTICES (5cei-gny5)
// =============================================================================

/**
 * Raw eviction notice record from DataSF API
 * https://data.sfgov.org/Housing-and-Buildings/Eviction-Notices/5cei-gny5
 */
export interface EvictionNoticeRaw {
  eviction_id: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  file_date?: string;

  // Eviction cause flags (boolean strings: "true" or "false")
  non_payment?: string;
  breach?: string;
  nuisance?: string;
  illegal_use?: string;
  failure_to_sign_renewal?: string;
  access_denial?: string;
  unapproved_subtenant?: string;
  owner_move_in?: string;
  demolition?: string;
  capital_improvement?: string;
  substantial_rehab?: string;
  ellis_act_withdrawal?: string;
  condo_conversion?: string;
  roommate_same_unit?: string;
  other_cause?: string;
  late_payments?: string;
  lead_remediation?: string;
  development?: string;
  good_samaritan_ends?: string;

  // Metadata
  data_as_of?: string;
  data_loaded_at?: string;
}

/**
 * Eviction cause types
 */
export type EvictionCause =
  | 'non_payment'
  | 'breach'
  | 'nuisance'
  | 'illegal_use'
  | 'failure_to_sign_renewal'
  | 'access_denial'
  | 'unapproved_subtenant'
  | 'owner_move_in'
  | 'demolition'
  | 'capital_improvement'
  | 'substantial_rehab'
  | 'ellis_act_withdrawal'
  | 'condo_conversion'
  | 'roommate_same_unit'
  | 'other_cause'
  | 'late_payments'
  | 'lead_remediation'
  | 'development'
  | 'good_samaritan_ends';

/**
 * All eviction cause fields for iteration
 */
export const EVICTION_CAUSES: EvictionCause[] = [
  'non_payment',
  'breach',
  'nuisance',
  'illegal_use',
  'failure_to_sign_renewal',
  'access_denial',
  'unapproved_subtenant',
  'owner_move_in',
  'demolition',
  'capital_improvement',
  'substantial_rehab',
  'ellis_act_withdrawal',
  'condo_conversion',
  'roommate_same_unit',
  'other_cause',
  'late_payments',
  'lead_remediation',
  'development',
  'good_samaritan_ends',
];

/**
 * Human-readable labels for eviction causes
 */
export const EVICTION_CAUSE_LABELS: Record<EvictionCause, string> = {
  non_payment: 'Non-Payment',
  breach: 'Lease Breach',
  nuisance: 'Nuisance',
  illegal_use: 'Illegal Use',
  failure_to_sign_renewal: 'Failed to Sign Renewal',
  access_denial: 'Access Denial',
  unapproved_subtenant: 'Unapproved Subtenant',
  owner_move_in: 'Owner Move-In',
  demolition: 'Demolition',
  capital_improvement: 'Capital Improvement',
  substantial_rehab: 'Substantial Rehab',
  ellis_act_withdrawal: 'Ellis Act',
  condo_conversion: 'Condo Conversion',
  roommate_same_unit: 'Roommate (Same Unit)',
  other_cause: 'Other',
  late_payments: 'Late Payments',
  lead_remediation: 'Lead Remediation',
  development: 'Development',
  good_samaritan_ends: 'Good Samaritan Ends',
};

/**
 * Parsed eviction notice with typed fields
 */
export interface EvictionNotice {
  id: string;
  address: string;
  zip: string;
  fileDate: Date;
  causes: EvictionCause[];
  neighborhood?: SFNeighborhood;
}

/**
 * Aggregated eviction data for a single neighborhood
 */
export interface NeighborhoodEvictionData {
  neighborhood: SFNeighborhood;
  total: number;
  rate: number; // per 1,000 housing units
  causes: Partial<Record<EvictionCause, number>>;
  topCauses: { cause: EvictionCause; count: number; percentage: number }[];
}

/**
 * City-wide eviction statistics for comparisons
 */
export interface CityEvictionStats {
  totalEvictions: number;
  averageRate: number; // per 1,000 housing units
  medianRate: number;
  byNeighborhood: Record<SFNeighborhood, NeighborhoodEvictionData>;
  rankings: { neighborhood: SFNeighborhood; rank: number; rate: number }[];
}

/**
 * Time range options for data queries
 */
export type TimeRange = '30d' | '12mo';

/**
 * Options for fetching eviction data
 */
export interface EvictionQueryOptions {
  timeRange: TimeRange;
  startDate?: Date;
  endDate?: Date;
}

// =============================================================================
// DATASF CLIENT TYPES
// =============================================================================

/**
 * DataSF API response metadata
 */
export interface DataSFMeta {
  fetchedAt: Date;
  recordCount: number;
  cached: boolean;
}

/**
 * Generic DataSF query result
 */
export interface DataSFResult<T> {
  data: T[];
  meta: DataSFMeta;
}

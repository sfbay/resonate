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
// 311 SERVICE REQUESTS (vw6y-z8j6)
// =============================================================================

/**
 * Raw 311 case record from DataSF API
 * https://data.sfgov.org/City-Infrastructure/311-Cases/vw6y-z8j6
 */
export interface Case311Raw {
  service_request_id: string;
  requested_datetime?: string;
  closed_date?: string;
  status_description?: string;
  agency_responsible?: string;
  service_name?: string;
  service_subtype?: string;
  service_details?: string;
  neighborhoods_sffind_boundaries?: string;
  analysis_neighborhood?: string;
  point?: { latitude: string; longitude: string };
}

/**
 * Service request category groupings
 */
export type ServiceCategory =
  | 'street_cleaning'
  | 'graffiti'
  | 'street_defects'
  | 'encampments'
  | 'noise'
  | 'illegal_dumping'
  | 'tree_maintenance'
  | 'streetlight'
  | 'other';

/**
 * All service category values for iteration
 */
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  'street_cleaning',
  'graffiti',
  'street_defects',
  'encampments',
  'noise',
  'illegal_dumping',
  'tree_maintenance',
  'streetlight',
  'other',
];

/**
 * Human-readable labels for service categories
 */
export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  street_cleaning: 'Street & Sidewalk Cleaning',
  graffiti: 'Graffiti',
  street_defects: 'Street Defects',
  encampments: 'Encampments',
  noise: 'Noise',
  illegal_dumping: 'Illegal Dumping',
  tree_maintenance: 'Tree Maintenance',
  streetlight: 'Streetlight/Signal',
  other: 'Other',
};

/**
 * Aggregated 311 data for a single neighborhood
 */
export interface Neighborhood311Data {
  neighborhood: SFNeighborhood;
  total: number;
  rate: number; // per 1,000 residents
  topCategories: { category: ServiceCategory; count: number; percentage: number }[];
}

/**
 * City-wide 311 statistics
 */
export interface City311Stats {
  totalCases: number;
  averageRate: number; // per 1,000 residents
  rankings: { neighborhood: SFNeighborhood; rank: number; rate: number }[];
  byNeighborhood: Record<string, Neighborhood311Data>;
  byCategory: Partial<Record<ServiceCategory, number>>;
}

// =============================================================================
// PUBLIC SAFETY (Fire: wr8u-xric + Police: wg3w-h783)
// =============================================================================

/**
 * Raw fire incident record from DataSF API
 * https://data.sfgov.org/Public-Safety/Fire-Incidents/wr8u-xric
 */
export interface FireIncidentRaw {
  incident_number: string;
  incident_date?: string;
  neighborhood_district?: string;
  primary_situation?: string;
  battalion?: string;
  station_area?: string;
}

/**
 * Raw police report record from DataSF API
 * https://data.sfgov.org/Public-Safety/Police-Department-Incident-Reports-2018-to-Present/wg3w-h783
 */
export interface PoliceReportRaw {
  incident_number: string;
  incident_date?: string;
  incident_category?: string;
  analysis_neighborhood?: string;
  incident_subcategory?: string;
  report_type_description?: string;
}

/**
 * Safety incident category groupings (sensitive framing)
 */
export type SafetyCategory =
  | 'property'
  | 'personal_safety'
  | 'fire'
  | 'traffic'
  | 'vandalism'
  | 'other';

/**
 * All safety category values for iteration
 */
export const SAFETY_CATEGORIES: SafetyCategory[] = [
  'property',
  'personal_safety',
  'fire',
  'traffic',
  'vandalism',
  'other',
];

/**
 * Human-readable labels for safety categories (sensitive framing)
 */
export const SAFETY_CATEGORY_LABELS: Record<SafetyCategory, string> = {
  property: 'Property',
  personal_safety: 'Personal Safety',
  fire: 'Fire',
  traffic: 'Traffic',
  vandalism: 'Vandalism',
  other: 'Other',
};

/**
 * Aggregated safety data for a single neighborhood
 */
export interface NeighborhoodSafetyData {
  neighborhood: SFNeighborhood;
  total: number;
  rate: number; // per 1,000 residents
  fireCount: number;
  policeCount: number;
  topCategories: { category: SafetyCategory; count: number; percentage: number }[];
}

/**
 * City-wide safety statistics
 */
export interface CitySafetyStats {
  totalIncidents: number;
  averageRate: number; // per 1,000 residents
  rankings: { neighborhood: SFNeighborhood; rank: number; rate: number }[];
  byNeighborhood: Record<string, NeighborhoodSafetyData>;
  byCategory: Partial<Record<SafetyCategory, number>>;
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

/**
 * Procurement & Compliance Helpers
 *
 * Government-specific procurement logic: PO generation, mandate tagging,
 * and compliance reporting.
 *
 * Based on business.md references to AB 1511, Local Law 83, and SF
 * procurement requirements for community media spending.
 *
 * STUB: Demo-ready procurement logic. Wire to city vendor system APIs when available.
 */

// =============================================================================
// MANDATE TYPES
// =============================================================================

export type MandateType =
  | 'ab_1511'          // CA Assembly Bill 1511: community media advertising requirements
  | 'local_law_83'     // SF Local Law 83: language access requirements
  | 'eo_13166'         // Federal Executive Order 13166: LEP access
  | 'prop_e'           // SF Proposition E: language services
  | 'title_vi'         // Title VI: nondiscrimination in federally-funded programs
  | 'custom';

export interface MandateTag {
  type: MandateType;
  label: string;
  description: string;
  requirements: string[];
  languageRequirements?: string[];   // Required languages for compliance
  spendingThreshold?: number;        // Minimum % of budget for community media
}

/** Known government mandates that drive community media spending */
export const MANDATES: Record<MandateType, MandateTag> = {
  ab_1511: {
    type: 'ab_1511',
    label: 'AB 1511',
    description: 'California community media advertising requirements for state and local agencies.',
    requirements: [
      'Allocate portion of advertising budget to community media',
      'Target underserved and non-English-speaking communities',
      'Report on community media spending annually',
      'Define community media as outlets serving specific cultural/ethnic communities',
    ],
    spendingThreshold: 0.10, // 10% of advertising budget
  },
  local_law_83: {
    type: 'local_law_83',
    label: 'Local Law 83',
    description: 'SF language access requirements for city communications.',
    requirements: [
      'Translate vital documents into threshold languages',
      'Provide interpretation services at public meetings',
      'Advertise in community media serving LEP populations',
      'Track compliance by department and language',
    ],
    languageRequirements: ['spanish', 'chinese_cantonese', 'chinese_mandarin', 'tagalog', 'vietnamese', 'russian'],
  },
  eo_13166: {
    type: 'eo_13166',
    label: 'EO 13166',
    description: 'Federal Executive Order on improving access for LEP persons.',
    requirements: [
      'Provide meaningful access to programs for LEP individuals',
      'Develop language access plans',
      'Ensure translated outreach materials',
    ],
    languageRequirements: ['spanish', 'chinese_cantonese', 'tagalog', 'vietnamese'],
  },
  prop_e: {
    type: 'prop_e',
    label: 'Prop E',
    description: 'SF Proposition E language services mandate.',
    requirements: [
      'City departments must provide services in threshold languages',
      'Public outreach must include multilingual components',
    ],
    languageRequirements: ['spanish', 'chinese_cantonese', 'chinese_mandarin', 'tagalog'],
  },
  title_vi: {
    type: 'title_vi',
    label: 'Title VI',
    description: 'Civil Rights Act Title VI nondiscrimination requirements.',
    requirements: [
      'No discrimination on basis of race, color, or national origin',
      'Ensure equitable access to information and services',
      'Provide language assistance to LEP individuals',
    ],
  },
  custom: {
    type: 'custom',
    label: 'Custom Mandate',
    description: 'Department-specific compliance requirement.',
    requirements: [],
  },
};

// =============================================================================
// PO GENERATION
// =============================================================================

export interface PurchaseOrderData {
  poNumber: string;
  departmentCode: string;
  departmentName: string;
  vendorName: string;
  vendorId: string;
  campaignName: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;    // In cents
    totalPrice: number;   // In cents
  }[];
  subtotal: number;       // In cents
  total: number;          // In cents
  mandates: MandateType[];
  fiscalYear: string;
  createdDate: string;
  deliveryDate: string;
  notes?: string;
}

/** Generate a demo PO number */
export function generatePONumber(departmentCode: string): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
  return `PO-${departmentCode}-${year}-${seq}`;
}

/** Get current fiscal year string (SF fiscal year: July 1 - June 30) */
export function getCurrentFiscalYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  if (month >= 6) { // July or later
    return `FY${year}-${year + 1}`;
  }
  return `FY${year - 1}-${year}`;
}

// =============================================================================
// COMPLIANCE REPORTING
// =============================================================================

export interface ComplianceBreakdown {
  totalSpend: number;               // Total campaign spend in cents
  communityMediaSpend: number;      // Amount going to community publishers
  communityMediaPercent: number;    // Percentage
  byLanguage: {
    language: string;
    spend: number;
    publishers: number;
    deliverables: number;
  }[];
  byNeighborhood: {
    neighborhood: string;
    spend: number;
    publishers: number;
  }[];
  byCommunity: {
    community: string;
    spend: number;
    publishers: number;
  }[];
  mandateCompliance: {
    mandate: MandateType;
    met: boolean;
    details: string;
    threshold?: number;
    actual?: number;
  }[];
}

/** Check if a spending level meets a mandate's threshold */
export function checkMandateCompliance(
  mandate: MandateTag,
  communityMediaPercent: number
): { met: boolean; details: string } {
  if (!mandate.spendingThreshold) {
    return { met: true, details: 'No spending threshold defined for this mandate' };
  }

  const met = communityMediaPercent >= mandate.spendingThreshold;
  const thresholdPct = (mandate.spendingThreshold * 100).toFixed(0);
  const actualPct = (communityMediaPercent * 100).toFixed(1);

  return {
    met,
    details: met
      ? `${actualPct}% of budget allocated to community media (threshold: ${thresholdPct}%)`
      : `Only ${actualPct}% allocated — ${thresholdPct}% required by ${mandate.label}`,
  };
}

/** Check if all required languages are covered by campaign publishers */
export function checkLanguageCoverage(
  mandate: MandateTag,
  coveredLanguages: string[]
): { met: boolean; missing: string[]; details: string } {
  if (!mandate.languageRequirements || mandate.languageRequirements.length === 0) {
    return { met: true, missing: [], details: 'No language requirements for this mandate' };
  }

  const coveredSet = new Set(coveredLanguages);
  const missing = mandate.languageRequirements.filter(lang => !coveredSet.has(lang));

  return {
    met: missing.length === 0,
    missing,
    details: missing.length === 0
      ? `All ${mandate.languageRequirements.length} required languages covered`
      : `Missing coverage for: ${missing.join(', ')}`,
  };
}

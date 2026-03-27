/**
 * Maps Resonate publisher IDs to their registered names in the
 * City & County of SF vendor payment system (Socrata dataset n9pm-xkyq).
 *
 * Only publishers who appear in the city's financial records are listed.
 * Names must match EXACTLY as they appear in the vendor field.
 *
 * Source: Socrata vendor payments dataset n9pm-xkyq, cross-referenced
 * with supplier contracts dataset cqi5-hm2d (March 2026 audit).
 */

const PUBLISHER_VENDOR_MAP: Record<string, string> = {
  // Getting paid in FY2026
  '11111111-1111-1111-1111-111111111101': 'ACCION LATINA',
  '11111111-1111-1111-1111-111111111102': 'MISSION LOCAL SF',
  '11111111-1111-1111-1111-111111111103': 'SAN FRANCISCO BAY VIEW INC',
  '11111111-1111-1111-1111-111111111105': 'BAY AREA REPORTER',
  '11111111-1111-1111-1111-111111111108': 'SF NEIGHBORHOOD NEWSPAPER ASSOCIATION',
  '11111111-1111-1111-1111-111111111109': 'SF NEIGHBORHOOD NEWSPAPER ASSOCIATION',
  '11111111-1111-1111-1111-111111111110': 'WIND NEWSPAPER',
  '11111111-1111-1111-1111-111111111112': 'BROKE-ASS STUART',

  // Registered as vendors but $0 in advertising
  '11111111-1111-1111-1111-111111111106': 'Nichi Bei Foundation',
};

export function getCityVendorName(publisherId: string): string | null {
  return PUBLISHER_VENDOR_MAP[publisherId] ?? null;
}

export function isRegisteredVendor(publisherId: string): boolean {
  return publisherId in PUBLISHER_VENDOR_MAP;
}

export function getRegisteredPublisherIds(): string[] {
  return Object.keys(PUBLISHER_VENDOR_MAP);
}

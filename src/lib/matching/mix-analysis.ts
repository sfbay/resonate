/**
 * Publisher Mix Analysis
 *
 * Analyzes the coverage of a selected publisher set against campaign targets.
 * Shows gaps, per-publisher unique contributions, and incremental value
 * of adding each unselected publisher.
 *
 * Framing is always additive: "Adding X fills your gap in Bayview, Spanish."
 */

// ─────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────

export interface MixAnalysis {
  coveredNeighborhoods: string[];
  coveredLanguages: string[];
  coveredEthnicities: string[];
  gapNeighborhoods: string[];       // Target neighborhoods not yet covered
  gapLanguages: string[];
  gapEthnicities: string[];
  geographicCoverage: number;       // 0-100%
  languageCoverage: number;
  demographicCoverage: number;
  totalEstimatedCost: { low: number; high: number };
  totalEstimatedReach: number;
  publisherContributions: Map<string, PublisherContribution>;
}

export interface PublisherContribution {
  publisherId: string;
  publisherName: string;
  uniqueNeighborhoods: string[];    // Only THIS publisher covers these among selected
  uniqueLanguages: string[];
  gapsFilled: string[];             // Human-readable: "Fills your gap in Bayview"
  incrementalReach: number;
  isRedundant: boolean;             // All coverage duplicated by others in the mix
}

export interface MatchPublisherData {
  publisherId: string;
  publisherName: string;
  neighborhoods: string[];
  languages: string[];
  ethnicities?: string[];
  reach: number;
  score: number;
  estimatedCost?: { low: number; high: number };
}

export interface TargetAudienceData {
  neighborhoods: string[];
  languages: string[];
  ethnicities?: string[];
}

// ─────────────────────────────────────────────────
// CORE ANALYSIS
// ─────────────────────────────────────────────────

/**
 * Analyze the coverage of a set of selected publishers against campaign targets.
 */
export function analyzeMix(
  selectedIds: Set<string>,
  allMatches: MatchPublisherData[],
  target: TargetAudienceData
): MixAnalysis {
  const selected = allMatches.filter(m => selectedIds.has(m.publisherId));

  // Aggregate covered sets
  const coveredNeighborhoods = new Set<string>();
  const coveredLanguages = new Set<string>();
  const coveredEthnicities = new Set<string>();
  let totalReach = 0;
  let costLow = 0;
  let costHigh = 0;

  for (const pub of selected) {
    pub.neighborhoods.forEach(n => coveredNeighborhoods.add(n));
    pub.languages.forEach(l => coveredLanguages.add(l));
    (pub.ethnicities || []).forEach(e => coveredEthnicities.add(e));
    totalReach += pub.reach;
    if (pub.estimatedCost) {
      costLow += pub.estimatedCost.low;
      costHigh += pub.estimatedCost.high;
    }
  }

  // Compute gaps
  const gapNeighborhoods = target.neighborhoods.filter(n => !coveredNeighborhoods.has(n));
  const gapLanguages = target.languages.filter(l => !coveredLanguages.has(l));
  const gapEthnicities = (target.ethnicities || []).filter(e => !coveredEthnicities.has(e));

  // Coverage percentages
  const geographicCoverage = target.neighborhoods.length > 0
    ? Math.round(((target.neighborhoods.length - gapNeighborhoods.length) / target.neighborhoods.length) * 100)
    : 100;
  const languageCoverage = target.languages.length > 0
    ? Math.round(((target.languages.length - gapLanguages.length) / target.languages.length) * 100)
    : 100;
  const targetEthnicities = target.ethnicities || [];
  const demographicCoverage = targetEthnicities.length > 0
    ? Math.round(((targetEthnicities.length - gapEthnicities.length) / targetEthnicities.length) * 100)
    : 100;

  // Per-publisher contributions (uniqueness analysis)
  const contributions = new Map<string, PublisherContribution>();
  for (const pub of selected) {
    const othersNeighborhoods = new Set<string>();
    const othersLanguages = new Set<string>();
    for (const other of selected) {
      if (other.publisherId === pub.publisherId) continue;
      other.neighborhoods.forEach(n => othersNeighborhoods.add(n));
      other.languages.forEach(l => othersLanguages.add(l));
    }

    const uniqueNeighborhoods = pub.neighborhoods.filter(n => !othersNeighborhoods.has(n));
    const uniqueLanguages = pub.languages.filter(l => !othersLanguages.has(l));

    // Only count unique items that are also targets
    const uniqueTargetNeighborhoods = uniqueNeighborhoods.filter(n => target.neighborhoods.includes(n));
    const uniqueTargetLanguages = uniqueLanguages.filter(l => target.languages.includes(l));

    const gapsFilled: string[] = [];
    if (uniqueTargetNeighborhoods.length > 0) {
      gapsFilled.push(`Only publisher covering ${formatList(uniqueTargetNeighborhoods)}`);
    }
    if (uniqueTargetLanguages.length > 0) {
      gapsFilled.push(`Only ${formatList(uniqueTargetLanguages)} publisher`);
    }

    contributions.set(pub.publisherId, {
      publisherId: pub.publisherId,
      publisherName: pub.publisherName,
      uniqueNeighborhoods: uniqueTargetNeighborhoods,
      uniqueLanguages: uniqueTargetLanguages,
      gapsFilled,
      incrementalReach: pub.reach,
      isRedundant: uniqueTargetNeighborhoods.length === 0 && uniqueTargetLanguages.length === 0,
    });
  }

  return {
    coveredNeighborhoods: Array.from(coveredNeighborhoods),
    coveredLanguages: Array.from(coveredLanguages),
    coveredEthnicities: Array.from(coveredEthnicities),
    gapNeighborhoods,
    gapLanguages,
    gapEthnicities,
    geographicCoverage,
    languageCoverage,
    demographicCoverage,
    totalEstimatedCost: { low: costLow, high: costHigh },
    totalEstimatedReach: totalReach,
    publisherContributions: contributions,
  };
}

/**
 * Get the incremental value of adding a specific publisher to the current mix.
 */
export function getPublisherAddValue(
  pubId: string,
  currentSelectedIds: Set<string>,
  allMatches: MatchPublisherData[],
  target: TargetAudienceData
): PublisherContribution {
  const pub = allMatches.find(m => m.publisherId === pubId);
  if (!pub) {
    return {
      publisherId: pubId,
      publisherName: '',
      uniqueNeighborhoods: [],
      uniqueLanguages: [],
      gapsFilled: [],
      incrementalReach: 0,
      isRedundant: true,
    };
  }

  // Current coverage
  const currentCoveredNeighborhoods = new Set<string>();
  const currentCoveredLanguages = new Set<string>();
  for (const m of allMatches) {
    if (!currentSelectedIds.has(m.publisherId)) continue;
    m.neighborhoods.forEach(n => currentCoveredNeighborhoods.add(n));
    m.languages.forEach(l => currentCoveredLanguages.add(l));
  }

  // What this publisher adds
  const newNeighborhoods = pub.neighborhoods.filter(
    n => !currentCoveredNeighborhoods.has(n) && target.neighborhoods.includes(n)
  );
  const newLanguages = pub.languages.filter(
    l => !currentCoveredLanguages.has(l) && target.languages.includes(l)
  );

  const gapsFilled: string[] = [];
  if (newNeighborhoods.length > 0) {
    gapsFilled.push(`+${formatList(newNeighborhoods)}`);
  }
  if (newLanguages.length > 0) {
    gapsFilled.push(`+${formatList(newLanguages)}`);
  }

  return {
    publisherId: pub.publisherId,
    publisherName: pub.publisherName,
    uniqueNeighborhoods: newNeighborhoods,
    uniqueLanguages: newLanguages,
    gapsFilled,
    incrementalReach: pub.reach,
    isRedundant: newNeighborhoods.length === 0 && newLanguages.length === 0,
  };
}

// ─────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────

function formatList(items: string[], max = 3): string {
  const formatted = items.slice(0, max).map(formatName);
  if (items.length > max) {
    formatted.push(`+${items.length - max} more`);
  }
  return formatted.join(', ');
}

function formatName(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

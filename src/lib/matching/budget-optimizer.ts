/**
 * Budget Optimizer
 *
 * Given a budget constraint, suggests which publishers maximize coverage.
 * Uses a greedy knapsack-style approach (sufficient for < 20 publishers).
 * Generates alternative mixes by varying priority weights.
 */

import { analyzeMix } from './mix-analysis';
import type { MatchPublisherData, TargetAudienceData } from './mix-analysis';

// ─────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────

export interface OptimizationResult {
  selectedPublishers: string[];
  totalEstimatedCost: { low: number; high: number };
  coverageScore: number;          // 0-100
  matchQualityScore: number;      // Average match score
  explanation: string[];
  label?: string;                 // "Recommended" | "Budget option" | "Full coverage"
}

export interface OptimizationOptions {
  budget: number;                 // in cents
  prioritize?: 'coverage' | 'quality' | 'cost';
  minPublishers?: number;
  maxPublishers?: number;
}

// ─────────────────────────────────────────────────
// WEIGHTS BY PRIORITY
// ─────────────────────────────────────────────────

const PRIORITY_WEIGHTS = {
  coverage: { coverage: 0.5, quality: 0.3, costEfficiency: 0.2 },
  quality:  { coverage: 0.3, quality: 0.5, costEfficiency: 0.2 },
  cost:     { coverage: 0.2, quality: 0.2, costEfficiency: 0.6 },
};

// ─────────────────────────────────────────────────
// OPTIMIZER
// ─────────────────────────────────────────────────

export function optimizePublisherMix(
  matches: MatchPublisherData[],
  target: TargetAudienceData,
  options: OptimizationOptions
): OptimizationResult {
  const { budget, prioritize = 'coverage', minPublishers = 1, maxPublishers = 10 } = options;

  if (budget <= 0 || matches.length === 0) {
    return {
      selectedPublishers: [],
      totalEstimatedCost: { low: 0, high: 0 },
      coverageScore: 0,
      matchQualityScore: 0,
      explanation: budget <= 0
        ? ['Increase budget to see recommendations']
        : ['No publishers available for optimization'],
    };
  }

  const weights = PRIORITY_WEIGHTS[prioritize];

  // Score each publisher for value/cost ratio
  type ScoredPublisher = MatchPublisherData & { costMid: number; value: number };
  const scoredPublishers: ScoredPublisher[] = matches
    .map(m => {
      const costMid = m.estimatedCost
        ? Math.round((m.estimatedCost.low + m.estimatedCost.high) / 2)
        : 50000; // $500 default if no rate card

      // Coverage value: how many unique target items does this publisher cover?
      const targetNeighborhoodsCovered = m.neighborhoods.filter(n => target.neighborhoods.includes(n)).length;
      const targetLanguagesCovered = m.languages.filter(l => target.languages.includes(l)).length;
      const totalTargets = target.neighborhoods.length + target.languages.length;
      const coverageValue = totalTargets > 0
        ? ((targetNeighborhoodsCovered + targetLanguagesCovered) / totalTargets) * 100
        : 50;

      // Quality value: match score
      const qualityValue = m.score;

      // Cost efficiency: score per dollar (normalized)
      const costEfficiencyValue = costMid > 0 ? Math.min(100, (m.score / (costMid / 10000)) * 10) : 50;

      const value =
        weights.coverage * coverageValue +
        weights.quality * qualityValue +
        weights.costEfficiency * costEfficiencyValue;

      return { ...m, costMid, value };
    })
    .sort((a, b) => {
      // Sort by value/cost ratio (greedy)
      const ratioA = a.costMid > 0 ? a.value / a.costMid : 0;
      const ratioB = b.costMid > 0 ? b.value / b.costMid : 0;
      return ratioB - ratioA;
    });

  // Greedy knapsack: add publishers in order of value/cost ratio
  const selected: string[] = [];
  let totalLow = 0;
  let totalHigh = 0;

  for (const pub of scoredPublishers) {
    if (selected.length >= maxPublishers) break;

    const pubLow = pub.estimatedCost?.low || 25000;
    const pubHigh = pub.estimatedCost?.high || 75000;

    // Use midpoint for budget constraint
    if (totalLow + pub.costMid <= budget || selected.length < minPublishers) {
      selected.push(pub.publisherId);
      totalLow += pubLow;
      totalHigh += pubHigh;
    }
  }

  // Compute result metrics
  const selectedSet = new Set(selected);
  const analysis = analyzeMix(selectedSet, matches, target);
  const avgScore = selected.length > 0
    ? Math.round(matches.filter(m => selectedSet.has(m.publisherId)).reduce((s, m) => s + m.score, 0) / selected.length)
    : 0;

  const explanation: string[] = [];
  if (analysis.geographicCoverage === 100 && analysis.languageCoverage === 100) {
    explanation.push('Full coverage of all target neighborhoods and languages');
  } else {
    if (analysis.gapNeighborhoods.length > 0) {
      explanation.push(`${analysis.gapNeighborhoods.length} target neighborhood${analysis.gapNeighborhoods.length > 1 ? 's' : ''} not covered`);
    }
    if (analysis.gapLanguages.length > 0) {
      explanation.push(`${analysis.gapLanguages.length} target language${analysis.gapLanguages.length > 1 ? 's' : ''} not covered`);
    }
  }
  explanation.push(`${selected.length} publisher${selected.length !== 1 ? 's' : ''}, avg match score ${avgScore}`);

  return {
    selectedPublishers: selected,
    totalEstimatedCost: { low: totalLow, high: totalHigh },
    coverageScore: Math.round((analysis.geographicCoverage + analysis.languageCoverage) / 2),
    matchQualityScore: avgScore,
    explanation,
  };
}

/**
 * Generate the primary recommendation + 2 alternatives with different priorities.
 */
export function generateOptimizationAlternatives(
  matches: MatchPublisherData[],
  target: TargetAudienceData,
  budget: number
): OptimizationResult[] {
  if (budget <= 0 || matches.length === 0) {
    return [optimizePublisherMix(matches, target, { budget })];
  }

  // Check if budget covers all publishers
  const totalMidCost = matches.reduce((s, m) => {
    const mid = m.estimatedCost ? (m.estimatedCost.low + m.estimatedCost.high) / 2 : 50000;
    return s + mid;
  }, 0);

  if (totalMidCost <= budget) {
    // Budget covers all — return single result
    const result = optimizePublisherMix(matches, target, { budget, prioritize: 'coverage' });
    result.label = 'Recommended';
    result.explanation = ['Your budget covers all matched publishers'];
    result.selectedPublishers = matches.map(m => m.publisherId);
    // Recalculate totals
    result.totalEstimatedCost = {
      low: matches.reduce((s, m) => s + (m.estimatedCost?.low || 25000), 0),
      high: matches.reduce((s, m) => s + (m.estimatedCost?.high || 75000), 0),
    };
    const selectedSet = new Set(result.selectedPublishers);
    const analysis = analyzeMix(selectedSet, matches, target);
    result.coverageScore = Math.round((analysis.geographicCoverage + analysis.languageCoverage) / 2);
    result.matchQualityScore = Math.round(matches.reduce((s, m) => s + m.score, 0) / matches.length);
    return [result];
  }

  // Generate 3 alternatives
  const coverage = optimizePublisherMix(matches, target, { budget, prioritize: 'coverage' });
  coverage.label = 'Maximize Coverage';

  const quality = optimizePublisherMix(matches, target, { budget, prioritize: 'quality' });
  quality.label = 'Best Match Quality';

  const cost = optimizePublisherMix(matches, target, { budget, prioritize: 'cost' });
  cost.label = 'Budget Friendly';

  // Deduplicate: if two results have the same publisher set, keep only one
  const results: OptimizationResult[] = [coverage];
  const coverageKey = coverage.selectedPublishers.sort().join(',');

  const qualityKey = quality.selectedPublishers.sort().join(',');
  if (qualityKey !== coverageKey) results.push(quality);

  const costKey = cost.selectedPublishers.sort().join(',');
  if (costKey !== coverageKey && costKey !== qualityKey) results.push(cost);

  // Mark first as recommended
  if (results.length > 0) results[0].label = 'Recommended';

  return results;
}

/**
 * Wizard Service
 *
 * Runs wizard template rules against publisher + census + civic data,
 * groups results by category for panel display.
 */

import { WIZARD_RULES } from './wizard-rules';
import type {
  WizardData,
  WizardRecommendation,
  WizardRuleContext,
  WizardResults,
  WizardCategory,
} from './wizard-types';

// =============================================================================
// TYPES
// =============================================================================

interface WizardGenerateOptions {
  publisherId: string;
  publisherName: string;
  wizardData: WizardData;
  performanceData?: WizardRuleContext['performanceData'];
}

// =============================================================================
// MAIN GENERATION
// =============================================================================

/**
 * Generate wizard recommendations from template rules.
 * Runs all 10 rules against the provided data and groups results by category.
 */
export function generateWizardRecommendations(
  options: WizardGenerateOptions
): WizardResults {
  const { publisherId, publisherName, wizardData, performanceData } = options;

  const context: WizardRuleContext = {
    publisherId,
    publisherName,
    wizardData,
    performanceData,
  };

  const recommendations: WizardRecommendation[] = [];

  for (const rule of WIZARD_RULES) {
    try {
      const result = rule.check(context);
      if (result) {
        recommendations.push({
          id: `wizard-${rule.id}-${Date.now()}`,
          type: rule.type,
          category: rule.category,
          priority: result.priority,
          title: result.title,
          summary: result.summary,
          detail: result.detail,
          supportingData: result.supportingData,
          potentialReach: result.potentialReach,
          confidence: result.confidence,
          basedOn: result.basedOn,
        });
      }
    } catch (error) {
      console.warn(`Wizard rule ${rule.id} failed:`, error);
    }
  }

  // Group by category
  const byCategory: Record<WizardCategory, WizardRecommendation[]> = {
    audience_growth: [],
    social_strategy: [],
    platform_expansion: [],
    community_landscape: [],
  };

  for (const rec of recommendations) {
    byCategory[rec.category].push(rec);
  }

  // Sort each category by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  for (const category of Object.keys(byCategory) as WizardCategory[]) {
    byCategory[category].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  return {
    byCategory,
    totalCount: recommendations.length,
    generatedAt: new Date(),
  };
}

/**
 * Get a summary for the dashboard — top 1-2 recommendations per category.
 */
export function getWizardSummary(
  results: WizardResults
): Record<WizardCategory, WizardRecommendation | null> {
  const summary: Record<WizardCategory, WizardRecommendation | null> = {
    audience_growth: null,
    social_strategy: null,
    platform_expansion: null,
    community_landscape: null,
  };

  for (const category of Object.keys(summary) as WizardCategory[]) {
    const recs = results.byCategory[category];
    if (recs.length > 0) {
      summary[category] = recs[0];
    }
  }

  return summary;
}

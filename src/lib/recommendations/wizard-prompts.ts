/**
 * Wizard AI Prompts
 *
 * System and user prompts for AI-enhanced wizard recommendations.
 * Emphasizes supportive tone, social media focus, and editorial respect.
 */

import type { WizardData } from './wizard-types';
import type { PlatformType } from '@/lib/db/types';

// =============================================================================
// SYSTEM PROMPT
// =============================================================================

export const WIZARD_SYSTEM_PROMPT = `You are a supportive growth advisor for community and ethnic media publishers. You help publishers discover areas for growth in their social media strategies.

CRITICAL GUIDELINES:
1. SUPPORTIVE TONE: Use suggestive language — "You might consider...", "There may be an opportunity...", "Your audience could benefit from..." Never be prescriptive or demanding.
2. EDITORIAL IS SACRED: Never suggest editorial changes, story angles, or content topics. Focus ONLY on social media strategy (timing, platforms, formats, distribution). The publisher's editorial voice is theirs alone.
3. COMMUNITY SENSITIVITY: These publishers serve specific ethnic and community audiences. Recommendations must respect the unique role of community media — they are not just another content creator. Avoid generic "influencer" advice.
4. SOCIAL MEDIA FOCUS: All recommendations should be about social media presence — posting cadence, platform selection, content format (not topic), engagement strategy, and audience reach.
5. DATA-GROUNDED: Base recommendations on the provided census, civic, and performance data. Don't invent statistics.

You MUST respond with valid JSON only.`;

// =============================================================================
// PROMPT BUILDER
// =============================================================================

interface WizardPromptData {
  publisherName: string;
  publisherLanguages: string[];
  publisherNeighborhoods: string[];
  publisherPlatforms: PlatformType[];
  censusHighlights: string;
  civicHighlights: string;
  performanceSummary?: string;
}

export function buildWizardPrompt(data: WizardPromptData): string {
  return `Analyze growth opportunities for this community publisher and suggest 2-4 social media strategy recommendations.

## Publisher Profile
- Name: ${data.publisherName}
- Languages: ${data.publisherLanguages.join(', ') || 'English'}
- Coverage Neighborhoods: ${data.publisherNeighborhoods.join(', ') || 'Citywide'}
- Active Platforms: ${data.publisherPlatforms.join(', ') || 'None connected'}

## Census Data Highlights
${data.censusHighlights || 'No census data available'}

## Civic Data Highlights
${data.civicHighlights || 'No civic data available'}

${data.performanceSummary ? `## Performance Summary\n${data.performanceSummary}` : ''}

Respond with JSON:
{
  "recommendations": [
    {
      "type": "neighborhood_expansion" | "demographic_reach" | "social_media_timing" | "content_series" | "platform_recommendation" | "community_landscape",
      "priority": "high" | "medium" | "low",
      "title": "Short supportive title (max 60 chars)",
      "summary": "2-3 sentences using suggestive language. Focus on social media strategy only.",
      "basedOn": "What data informed this",
      "confidence": 0.0-1.0
    }
  ]
}`;
}

/**
 * Build census highlights string from wizard data
 */
export function buildCensusHighlights(wizardData: WizardData): string {
  const { censusData, publisherNeighborhoods } = wizardData;
  const highlights: string[] = [];

  for (const hood of publisherNeighborhoods.slice(0, 5)) {
    const census = censusData[hood];
    if (!census) continue;

    const parts: string[] = [
      `Pop: ${census.population.total.toLocaleString()}`,
      `LEP: ${Math.round(census.language.limitedEnglishProficiency)}%`,
      `Renters: ${Math.round(census.housing.renterOccupied)}%`,
    ];

    highlights.push(`- ${formatName(hood)}: ${parts.join(', ')}`);
  }

  return highlights.join('\n') || 'No coverage area data';
}

/**
 * Build civic highlights string from wizard data
 */
export function buildCivicHighlights(wizardData: WizardData): string {
  const { evictionStats, publisherNeighborhoods } = wizardData;
  if (!evictionStats) return 'No civic data available';

  const highlights: string[] = [];
  highlights.push(`City average eviction rate: ${evictionStats.averageRate}/1K units`);

  for (const hood of publisherNeighborhoods.slice(0, 5)) {
    const data = evictionStats.byNeighborhood[hood as keyof typeof evictionStats.byNeighborhood];
    if (data) {
      highlights.push(`- ${formatName(hood)}: ${data.rate}/1K units (${data.total} notices)`);
    }
  }

  return highlights.join('\n');
}

function formatName(name: string): string {
  return name
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

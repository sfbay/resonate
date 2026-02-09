/**
 * AI Creative Generation Prompts
 *
 * System and user prompts for generating ad creative across formats.
 * These prompts are tuned for community media contexts — culturally
 * sensitive, multilingual, and community-focused.
 */

import { FORMAT_CONSTRAINTS } from './types';
import type { CreativeBrief, CreativeFormat, FormatConstraints } from './types';
import type { Language } from '@/types';

// =============================================================================
// SYSTEM PROMPTS
// =============================================================================

export const CREATIVE_SYSTEM_PROMPT = `You are a creative copywriter for Resonate, a community media advertising platform that connects government agencies, businesses, and nonprofits with ethnic and community publishers in San Francisco.

Your role is to generate ad creative that:
1. Respects and authentically represents the target community
2. Uses culturally appropriate tone, references, and imagery
3. Communicates clearly in the target language (not just translated — culturally adapted)
4. Follows the specific format constraints provided
5. Serves the campaign objectives while being respectful of community sensitivities

Key principles:
- Community media audiences are smart, engaged, and skeptical of generic messaging
- Cultural adaptation > literal translation. Idioms, humor, and references should feel native
- Government communications should be accessible, not bureaucratic
- Always be truthful and avoid overpromising
- Sensitive topics (health, safety, immigration) require extra care with tone

You must respond with valid JSON matching the requested output schema.`;

export const MULTILINGUAL_SYSTEM_PROMPT = `You are a multilingual creative copywriter specializing in cultural adaptation for community media.

When creating language variants:
1. DO NOT simply translate — culturally adapt the message
2. Use natural, conversational language that native speakers actually use
3. Consider cultural context: holidays, customs, family dynamics, community values
4. Adapt metaphors and idioms to the target culture
5. Adjust tone for cultural expectations (e.g., more formal in Chinese, more warm in Spanish)
6. Include cultural notes explaining your adaptation choices

You must respond with valid JSON matching the requested output schema.`;

// =============================================================================
// USER PROMPT BUILDERS
// =============================================================================

/** Build the main creative generation prompt */
export function buildCreativePrompt(brief: CreativeBrief): string {
  const constraints = FORMAT_CONSTRAINTS[brief.format];

  return `Generate a ${formatLabel(brief.format)} for this campaign:

CAMPAIGN: ${brief.campaignName}
DESCRIPTION: ${brief.campaignDescription}
OBJECTIVES: ${brief.objectives.join('; ')}

TARGET AUDIENCE: ${brief.audienceDescription}
${brief.targetNeighborhoods?.length ? `NEIGHBORHOODS: ${brief.targetNeighborhoods.join(', ')}` : ''}
${brief.targetCommunities?.length ? `COMMUNITIES: ${brief.targetCommunities.join(', ')}` : ''}

TONE: ${brief.tone}
KEY MESSAGES: ${brief.keyMessages.join('; ')}
CALL TO ACTION: ${brief.callToAction}
${brief.constraints?.length ? `CONSTRAINTS: ${brief.constraints.join('; ')}` : ''}

${brief.publisherName ? `PUBLISHER: ${brief.publisherName}` : ''}
${brief.publisherVoice ? `PUBLISHER VOICE: ${brief.publisherVoice}` : ''}
${brief.publisherAudience ? `PUBLISHER AUDIENCE: ${brief.publisherAudience}` : ''}

FORMAT CONSTRAINTS:
- Max characters: ${constraints.maxCharacters}
${constraints.maxHashtags ? `- Max hashtags: ${constraints.maxHashtags}` : ''}
${constraints.maxLines ? `- Max lines: ${constraints.maxLines}` : ''}
${constraints.aspectRatio ? `- Aspect ratio: ${constraints.aspectRatio}` : ''}

PRIMARY LANGUAGE: ${languageLabel(brief.targetLanguages[0] || 'english')}

Respond with this JSON structure:
{
  "headline": "string or null",
  "body": "the main copy text",
  "callToAction": "CTA button/link text",
  "hashtags": ["array", "of", "hashtags"] or null,
  "imagePrompt": "description of ideal accompanying image",
  "subheadline": "string or null",
  "preheader": "string or null (for newsletters)",
  "culturalNotes": ["any notes about cultural choices made"],
  "scenes": null or [{"order": 1, "visual": "description", "text": "overlay text", "duration": 5}]
}`;
}

/** Build the multilingual variant prompt */
export function buildVariantPrompt(
  original: { headline?: string; body: string; callToAction?: string },
  targetLanguage: Language,
  brief: CreativeBrief
): string {
  return `Culturally adapt this creative for ${languageLabel(targetLanguage)}-speaking audiences:

ORIGINAL (${languageLabel(brief.targetLanguages[0] || 'english')}):
${original.headline ? `Headline: ${original.headline}` : ''}
Body: ${original.body}
${original.callToAction ? `CTA: ${original.callToAction}` : ''}

TARGET LANGUAGE: ${languageLabel(targetLanguage)}
CAMPAIGN CONTEXT: ${brief.campaignDescription}
TARGET AUDIENCE: ${brief.audienceDescription}
TONE: ${brief.tone}

Remember: culturally ADAPT, don't just translate. Use natural expressions, appropriate formality level, and culturally relevant references.

Respond with this JSON structure:
{
  "headline": "adapted headline or null",
  "body": "culturally adapted body text",
  "callToAction": "adapted CTA or null",
  "hashtags": ["adapted", "hashtags"] or null,
  "culturalNotes": ["explanation of adaptations made"],
  "culturalAdaptation": "brief summary of how this was adapted for the target culture"
}`;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatLabel(format: CreativeFormat): string {
  const labels: Record<CreativeFormat, string> = {
    social_post: 'social media post',
    display_ad: 'display advertisement (headline + body + CTA)',
    newsletter_copy: 'newsletter article or feature',
    text_ad: 'short text advertisement',
    story_script: 'Instagram/TikTok story script with scenes',
    reel_script: 'short-form video script with scenes',
  };
  return labels[format] || format;
}

function languageLabel(lang: Language): string {
  const labels: Record<Language, string> = {
    english: 'English',
    spanish: 'Spanish',
    chinese_cantonese: 'Cantonese Chinese',
    chinese_mandarin: 'Mandarin Chinese',
    tagalog: 'Tagalog/Filipino',
    vietnamese: 'Vietnamese',
    russian: 'Russian',
    korean: 'Korean',
    japanese: 'Japanese',
    arabic: 'Arabic',
    french: 'French',
    portuguese: 'Portuguese',
    hindi: 'Hindi',
    punjabi: 'Punjabi',
    thai: 'Thai',
    burmese: 'Burmese',
    samoan: 'Samoan',
    asl: 'American Sign Language',
    other: 'Other',
  };
  return labels[lang] || lang;
}

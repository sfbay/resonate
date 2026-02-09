/**
 * AI Creative Generation Service
 *
 * Generates ad creative using the configured AI provider.
 * Supports multilingual variants and format-specific generation.
 *
 * Uses the existing AI provider factory from src/lib/ai/index.ts.
 */

import { generateCompletion, generateCompletionSafe, isAIEnabled } from '@/lib/ai';
import { CREATIVE_SYSTEM_PROMPT, MULTILINGUAL_SYSTEM_PROMPT, buildCreativePrompt, buildVariantPrompt } from './prompts';
import type { CreativeBrief, CreativeOutput, LanguageVariant, CreativeSet, CreativeFormat, FORMAT_CONSTRAINTS } from './types';
import type { Language } from '@/types';

// =============================================================================
// MAIN GENERATION FUNCTION
// =============================================================================

export interface GenerateCreativeResult {
  success: boolean;
  creative?: CreativeOutput;
  error?: string;
  aiModel?: string;
  tokensUsed?: number;
}

/**
 * Generate a single creative output from a brief
 */
export async function generateCreative(brief: CreativeBrief): Promise<GenerateCreativeResult> {
  if (!isAIEnabled()) {
    return { success: false, error: 'AI provider not configured' };
  }

  try {
    const prompt = buildCreativePrompt(brief);
    const response = await generateCompletion({
      systemPrompt: CREATIVE_SYSTEM_PROMPT,
      userPrompt: prompt,
      maxTokens: 2048,
      temperature: 0.8, // Slightly higher for creative work
    });

    const parsed = parseCreativeResponse(response.content, brief);

    return {
      success: true,
      creative: parsed,
      aiModel: response.model,
      tokensUsed: (response.usage?.inputTokens || 0) + (response.usage?.outputTokens || 0),
    };
  } catch (error) {
    console.error('Creative generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Creative generation failed',
    };
  }
}

// =============================================================================
// MULTILINGUAL GENERATION
// =============================================================================

export interface GenerateVariantsResult {
  success: boolean;
  variants: LanguageVariant[];
  errors: { language: Language; error: string }[];
}

/**
 * Generate multilingual variants of a creative
 */
export async function generateLanguageVariants(
  brief: CreativeBrief,
  originalCreative: CreativeOutput,
  targetLanguages: Language[]
): Promise<GenerateVariantsResult> {
  const variants: LanguageVariant[] = [];
  const errors: { language: Language; error: string }[] = [];

  // Original language variant
  variants.push({
    language: brief.targetLanguages[0] || 'english',
    creative: originalCreative,
    isOriginal: true,
    culturalAdaptation: 'Original language — no adaptation needed',
  });

  // Generate variants for each additional language
  const additionalLanguages = targetLanguages.filter(
    lang => lang !== (brief.targetLanguages[0] || 'english')
  );

  // Generate in parallel (batch of 3 to avoid rate limits)
  const batchSize = 3;
  for (let i = 0; i < additionalLanguages.length; i += batchSize) {
    const batch = additionalLanguages.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(lang => generateVariant(brief, originalCreative, lang))
    );

    batchResults.forEach((result, idx) => {
      const lang = batch[idx];
      if (result.status === 'fulfilled' && result.value.success && result.value.variant) {
        variants.push(result.value.variant);
      } else {
        const errorMsg = result.status === 'rejected'
          ? result.reason?.message || 'Unknown error'
          : result.value.error || 'Generation failed';
        errors.push({ language: lang, error: errorMsg });
      }
    });
  }

  return {
    success: errors.length === 0,
    variants,
    errors,
  };
}

/**
 * Generate a single language variant
 */
async function generateVariant(
  brief: CreativeBrief,
  original: CreativeOutput,
  targetLanguage: Language
): Promise<{ success: boolean; variant?: LanguageVariant; error?: string }> {
  try {
    const prompt = buildVariantPrompt(
      { headline: original.headline, body: original.body, callToAction: original.callToAction },
      targetLanguage,
      brief
    );

    const response = await generateCompletion({
      systemPrompt: MULTILINGUAL_SYSTEM_PROMPT,
      userPrompt: prompt,
      maxTokens: 1536,
      temperature: 0.7,
    });

    const parsed = parseVariantResponse(response.content, brief, targetLanguage);

    return {
      success: true,
      variant: {
        language: targetLanguage,
        creative: parsed.creative,
        isOriginal: false,
        culturalAdaptation: parsed.culturalAdaptation,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Variant generation failed',
    };
  }
}

// =============================================================================
// FULL CREATIVE SET GENERATION
// =============================================================================

/**
 * Generate a complete creative set with all language variants
 */
export async function generateCreativeSet(brief: CreativeBrief): Promise<{
  success: boolean;
  creativeSet?: CreativeSet;
  error?: string;
}> {
  // Step 1: Generate primary creative
  const primaryResult = await generateCreative(brief);
  if (!primaryResult.success || !primaryResult.creative) {
    return { success: false, error: primaryResult.error || 'Primary creative generation failed' };
  }

  // Step 2: Generate language variants if multiple languages requested
  let variants: LanguageVariant[] = [{
    language: brief.targetLanguages[0] || 'english',
    creative: primaryResult.creative,
    isOriginal: true,
    culturalAdaptation: 'Original language',
  }];

  if (brief.targetLanguages.length > 1) {
    const variantResult = await generateLanguageVariants(
      brief,
      primaryResult.creative,
      brief.targetLanguages
    );
    variants = variantResult.variants;
  }

  // Build creative set
  const creativeSet: CreativeSet = {
    id: `cs-${Date.now()}`,
    brief,
    variants,
    primaryLanguage: brief.targetLanguages[0] || 'english',
    createdAt: new Date(),
  };

  return { success: true, creativeSet };
}

// =============================================================================
// RESPONSE PARSING
// =============================================================================

function parseCreativeResponse(content: string, brief: CreativeBrief): CreativeOutput {
  const json = extractJSON(content);

  return {
    id: `cr-${Date.now()}`,
    format: brief.format,
    language: brief.targetLanguages[0] || 'english',
    headline: json.headline || undefined,
    body: json.body || '',
    callToAction: json.callToAction || brief.callToAction,
    hashtags: Array.isArray(json.hashtags) ? json.hashtags : undefined,
    imagePrompt: json.imagePrompt || undefined,
    subheadline: json.subheadline || undefined,
    preheader: json.preheader || undefined,
    scenes: Array.isArray(json.scenes) ? json.scenes : undefined,
    characterCount: (json.body || '').length,
    wordCount: (json.body || '').split(/\s+/).length,
    culturalNotes: Array.isArray(json.culturalNotes) ? json.culturalNotes : undefined,
    generatedAt: new Date(),
  };
}

function parseVariantResponse(
  content: string,
  brief: CreativeBrief,
  language: Language
): { creative: CreativeOutput; culturalAdaptation: string } {
  const json = extractJSON(content);

  return {
    creative: {
      id: `cr-${language}-${Date.now()}`,
      format: brief.format,
      language,
      headline: json.headline || undefined,
      body: json.body || '',
      callToAction: json.callToAction || undefined,
      hashtags: Array.isArray(json.hashtags) ? json.hashtags : undefined,
      characterCount: (json.body || '').length,
      wordCount: (json.body || '').split(/\s+/).length,
      culturalNotes: Array.isArray(json.culturalNotes) ? json.culturalNotes : undefined,
      generatedAt: new Date(),
    },
    culturalAdaptation: json.culturalAdaptation || 'Adapted for target language and culture',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractJSON(content: string): any {
  let jsonStr = content.trim();

  // Handle markdown code blocks
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  // Find JSON object
  const objMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (objMatch) {
    jsonStr = objMatch[0];
  }

  try {
    return JSON.parse(jsonStr);
  } catch {
    console.error('Failed to parse creative AI response:', content.slice(0, 200));
    return { body: content }; // Fallback: use raw content as body
  }
}

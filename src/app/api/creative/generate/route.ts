/**
 * Creative Generation API
 *
 * POST /api/creative/generate
 *
 * Generates ad creative using the configured AI provider.
 * Falls back to demo data if AI is not configured.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAIEnabled } from '@/lib/ai';
import { generateCreativeSet } from '@/lib/ai/creative/service';
import type { CreativeBrief, CreativeTone, CreativeFormat } from '@/lib/ai/creative/types';
import type { Language } from '@/types';

interface GenerateRequest {
  campaignName: string;
  description: string;
  audience: string;
  keyMessages: string[];
  callToAction: string;
  tone: CreativeTone;
  format: CreativeFormat;
  languages: Language[];
  publisherName?: string;
  publisherVoice?: string;
  publisherAudience?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateRequest;

    if (!body.campaignName || !body.description || !body.format) {
      return NextResponse.json(
        { error: 'Campaign name, description, and format are required' },
        { status: 400 }
      );
    }

    // Check if AI is available
    if (!isAIEnabled()) {
      return NextResponse.json(
        { error: 'AI provider not configured', fallback: true },
        { status: 503 }
      );
    }

    // Build creative brief
    const brief: CreativeBrief = {
      campaignName: body.campaignName,
      campaignDescription: body.description,
      objectives: body.keyMessages.slice(0, 3),
      audienceDescription: body.audience,
      targetLanguages: body.languages.length > 0 ? body.languages : ['english'],
      tone: body.tone || 'informational',
      keyMessages: body.keyMessages,
      callToAction: body.callToAction,
      format: body.format,
      publisherName: body.publisherName,
      publisherVoice: body.publisherVoice,
      publisherAudience: body.publisherAudience,
    };

    // Generate creative set with variants
    const result = await generateCreativeSet(brief);

    if (!result.success || !result.creativeSet) {
      return NextResponse.json(
        { error: result.error || 'Creative generation failed' },
        { status: 500 }
      );
    }

    // Return the primary creative and all variants
    const primaryVariant = result.creativeSet.variants.find(v => v.isOriginal);

    return NextResponse.json({
      success: true,
      creative: primaryVariant?.creative || null,
      variants: result.creativeSet.variants,
      primaryLanguage: result.creativeSet.primaryLanguage,
    });
  } catch (error) {
    console.error('Creative generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

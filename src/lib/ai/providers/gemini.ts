/**
 * Gemini (Google) AI Provider
 *
 * Integrates with Google's Generative AI API for AI-powered recommendations.
 * Uses the generateContent endpoint with structured prompts.
 *
 * @see https://ai.google.dev/tutorials/rest_quickstart
 */

import type {
  AIProvider,
  AIProviderClient,
  AICompletionRequest,
  AICompletionResponse,
} from '../types';

// =============================================================================
// CONFIGURATION
// =============================================================================

const GOOGLE_AI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_MODEL = 'gemini-2.5-flash';

interface GeminiContent {
  parts: Array<{ text: string }>;
  role?: 'user' | 'model';
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
      role: string;
    };
    finishReason: string;
    safetyRatings?: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

interface GeminiError {
  error: {
    code: number;
    message: string;
    status: string;
  };
}

// =============================================================================
// GEMINI PROVIDER
// =============================================================================

export class GeminiProvider implements AIProviderClient {
  readonly provider: AIProvider = 'gemini';
  readonly model: string;
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_AI_API_KEY || '';
    this.model = process.env.AI_MODEL_GEMINI || DEFAULT_MODEL;
  }

  /**
   * Check if provider is properly configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Generate a completion using Gemini
   */
  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    if (!this.isConfigured()) {
      throw new Error('Gemini provider is not configured: missing GOOGLE_AI_API_KEY');
    }

    // Gemini combines system prompt into the user message
    const combinedPrompt = `${request.systemPrompt}\n\n---\n\n${request.userPrompt}`;

    const contents: GeminiContent[] = [
      {
        parts: [{ text: combinedPrompt }],
        role: 'user',
      },
    ];

    const generationConfig: Record<string, unknown> = {
      maxOutputTokens: request.maxTokens || 4096,
    };

    if (request.temperature !== undefined) {
      generationConfig.temperature = request.temperature;
    }

    const url = `${GOOGLE_AI_BASE_URL}/models/${this.model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig,
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as GeminiError;
      throw new Error(
        `Gemini API error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = (await response.json()) as GeminiResponse;

    // Extract text from response
    const candidate = data.candidates?.[0];
    if (!candidate?.content?.parts?.[0]?.text) {
      throw new Error('No text content in Gemini response');
    }

    const text = candidate.content.parts.map((p) => p.text).join('');

    return {
      content: text,
      model: this.model,
      usage: data.usageMetadata
        ? {
            inputTokens: data.usageMetadata.promptTokenCount,
            outputTokens: data.usageMetadata.candidatesTokenCount,
          }
        : undefined,
    };
  }
}

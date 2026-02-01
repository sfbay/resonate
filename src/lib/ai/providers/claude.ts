/**
 * Claude (Anthropic) AI Provider
 *
 * Integrates with Anthropic's Claude API for AI-powered recommendations.
 * Uses the Messages API with structured system/user prompts.
 *
 * @see https://docs.anthropic.com/en/api/messages
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

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-sonnet-4-20250514';
const API_VERSION = '2023-06-01';

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AnthropicResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: Array<{
    type: 'text';
    text: string;
  }>;
  model: string;
  stop_reason: string | null;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

interface AnthropicError {
  type: 'error';
  error: {
    type: string;
    message: string;
  };
}

// =============================================================================
// CLAUDE PROVIDER
// =============================================================================

export class ClaudeProvider implements AIProviderClient {
  readonly provider: AIProvider = 'claude';
  readonly model: string;
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
    this.model = process.env.AI_MODEL_CLAUDE || DEFAULT_MODEL;
  }

  /**
   * Check if provider is properly configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Generate a completion using Claude
   */
  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    if (!this.isConfigured()) {
      throw new Error('Claude provider is not configured: missing ANTHROPIC_API_KEY');
    }

    const messages: AnthropicMessage[] = [
      {
        role: 'user',
        content: request.userPrompt,
      },
    ];

    const body = {
      model: this.model,
      max_tokens: request.maxTokens || 4096,
      system: request.systemPrompt,
      messages,
      ...(request.temperature !== undefined && { temperature: request.temperature }),
    };

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': API_VERSION,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as AnthropicError;
      throw new Error(
        `Claude API error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = (await response.json()) as AnthropicResponse;

    // Extract text content from response
    const textContent = data.content.find((block) => block.type === 'text');
    if (!textContent) {
      throw new Error('No text content in Claude response');
    }

    return {
      content: textContent.text,
      model: data.model,
      usage: {
        inputTokens: data.usage.input_tokens,
        outputTokens: data.usage.output_tokens,
      },
    };
  }
}

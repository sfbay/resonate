/**
 * OpenAI AI Provider
 *
 * Integrates with OpenAI's Chat Completions API for AI-powered recommendations.
 * Uses the standard chat format with system/user messages.
 *
 * @see https://platform.openai.com/docs/api-reference/chat
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

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4.1';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenAIError {
  error: {
    message: string;
    type: string;
    param: string | null;
    code: string | null;
  };
}

// =============================================================================
// OPENAI PROVIDER
// =============================================================================

export class OpenAIProvider implements AIProviderClient {
  readonly provider: AIProvider = 'openai';
  readonly model: string;
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.model = process.env.AI_MODEL_OPENAI || DEFAULT_MODEL;
  }

  /**
   * Check if provider is properly configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Generate a completion using OpenAI
   */
  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI provider is not configured: missing OPENAI_API_KEY');
    }

    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: request.systemPrompt,
      },
      {
        role: 'user',
        content: request.userPrompt,
      },
    ];

    const body: Record<string, unknown> = {
      model: this.model,
      messages,
      max_tokens: request.maxTokens || 4096,
    };

    if (request.temperature !== undefined) {
      body.temperature = request.temperature;
    }

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as OpenAIError;
      throw new Error(
        `OpenAI API error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = (await response.json()) as OpenAIResponse;

    // Extract content from response
    const choice = data.choices?.[0];
    if (!choice?.message?.content) {
      throw new Error('No content in OpenAI response');
    }

    return {
      content: choice.message.content,
      model: data.model,
      usage: {
        inputTokens: data.usage.prompt_tokens,
        outputTokens: data.usage.completion_tokens,
      },
    };
  }
}

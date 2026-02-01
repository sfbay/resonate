/**
 * AI Provider Factory
 *
 * Central point for accessing AI providers. The provider is configured via
 * environment variables at the admin level:
 *
 * - AI_PROVIDER: 'claude' | 'gemini' | 'openai' (default: 'claude')
 * - ANTHROPIC_API_KEY: Required for Claude
 * - GOOGLE_AI_API_KEY: Required for Gemini
 * - OPENAI_API_KEY: Required for OpenAI
 *
 * Model selection can be overridden:
 * - AI_MODEL_CLAUDE: Default claude-sonnet-4-20250514
 * - AI_MODEL_GEMINI: Default gemini-2.5-flash
 * - AI_MODEL_OPENAI: Default gpt-4.1
 */

import type { AIProvider, AIProviderClient, AICompletionRequest, AICompletionResponse } from './types';
import { ClaudeProvider } from './providers/claude';
import { GeminiProvider } from './providers/gemini';
import { OpenAIProvider } from './providers/openai';

// =============================================================================
// PROVIDER REGISTRY
// =============================================================================

const providerFactories: Record<AIProvider, () => AIProviderClient> = {
  claude: () => new ClaudeProvider(),
  gemini: () => new GeminiProvider(),
  openai: () => new OpenAIProvider(),
};

/**
 * Get the configured AI provider
 *
 * @returns The AI provider client based on AI_PROVIDER env var
 * @throws Error if provider is unknown or not configured
 */
export function getAIProvider(): AIProviderClient {
  const providerName = (process.env.AI_PROVIDER || 'claude') as AIProvider;

  const factory = providerFactories[providerName];
  if (!factory) {
    throw new Error(
      `Unknown AI provider: ${providerName}. Supported: ${Object.keys(providerFactories).join(', ')}`
    );
  }

  const provider = factory();

  if (!provider.isConfigured()) {
    throw new Error(
      `AI provider '${providerName}' is not configured. Check API key environment variable.`
    );
  }

  return provider;
}

/**
 * Check if AI is enabled (provider configured with valid API key)
 */
export function isAIEnabled(): boolean {
  try {
    const provider = getAIProvider();
    return provider.isConfigured();
  } catch {
    return false;
  }
}

/**
 * Get the current AI provider name
 */
export function getAIProviderName(): AIProvider {
  return (process.env.AI_PROVIDER || 'claude') as AIProvider;
}

/**
 * Get the current AI model name
 */
export function getAIModelName(): string {
  const provider = (process.env.AI_PROVIDER || 'claude') as AIProvider;

  switch (provider) {
    case 'claude':
      return process.env.AI_MODEL_CLAUDE || 'claude-sonnet-4-20250514';
    case 'gemini':
      return process.env.AI_MODEL_GEMINI || 'gemini-2.5-flash';
    case 'openai':
      return process.env.AI_MODEL_OPENAI || 'gpt-4.1';
    default:
      return 'unknown';
  }
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Generate a completion using the configured AI provider
 *
 * @param request - The completion request
 * @returns The completion response
 * @throws Error if AI is not enabled or request fails
 */
export async function generateCompletion(
  request: AICompletionRequest
): Promise<AICompletionResponse> {
  const provider = getAIProvider();
  return provider.complete(request);
}

/**
 * Generate a completion with fallback handling
 *
 * @param request - The completion request
 * @returns The completion response or null if AI is unavailable
 */
export async function generateCompletionSafe(
  request: AICompletionRequest
): Promise<AICompletionResponse | null> {
  try {
    return await generateCompletion(request);
  } catch (error) {
    console.warn('AI completion failed:', error);
    return null;
  }
}

// Re-export types
export * from './types';

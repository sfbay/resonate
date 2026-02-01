/**
 * AI Provider Types
 *
 * Type definitions for the multi-provider AI abstraction layer.
 * Supports Claude (Anthropic), Gemini (Google), and OpenAI as admin-configurable providers.
 */

// =============================================================================
// PROVIDER TYPES
// =============================================================================

/**
 * Supported AI providers
 */
export type AIProvider = 'claude' | 'gemini' | 'openai';

/**
 * Configuration for an AI provider
 */
export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
}

// =============================================================================
// REQUEST/RESPONSE TYPES
// =============================================================================

/**
 * Request for AI completion
 */
export interface AICompletionRequest {
  /** System prompt setting the AI's role and context */
  systemPrompt: string;
  /** User prompt with the actual request/question */
  userPrompt: string;
  /** Maximum tokens in response (default varies by provider) */
  maxTokens?: number;
  /** Temperature for response randomness (0-1, default 0.7) */
  temperature?: number;
}

/**
 * Response from AI completion
 */
export interface AICompletionResponse {
  /** The generated text content */
  content: string;
  /** Model identifier used for generation */
  model: string;
  /** Token usage statistics (if available) */
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

// =============================================================================
// PROVIDER INTERFACE
// =============================================================================

/**
 * Interface that all AI providers must implement
 */
export interface AIProviderClient {
  /** Provider identifier */
  readonly provider: AIProvider;
  /** Model identifier */
  readonly model: string;

  /**
   * Generate a completion from the AI model
   */
  complete(request: AICompletionRequest): Promise<AICompletionResponse>;

  /**
   * Check if the provider is properly configured
   */
  isConfigured(): boolean;
}

// =============================================================================
// RECOMMENDATION TYPES (for AI-generated recommendations)
// =============================================================================

/**
 * Structured recommendation format expected from AI
 */
export interface AIRecommendationOutput {
  type: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  summary: string;
  actionItems: string[];
  basedOn: string;
  confidence: number;
}

/**
 * Response format from AI recommendation generation
 */
export interface AIRecommendationsResponse {
  recommendations: AIRecommendationOutput[];
  modelUsed: string;
  generatedAt: Date;
}

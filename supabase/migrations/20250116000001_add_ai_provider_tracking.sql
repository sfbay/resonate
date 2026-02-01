-- Migration: Add AI Provider Tracking
-- Description: Add columns to track AI provider details for multi-provider support

-- Add columns to track AI provider and token usage
ALTER TABLE ai_recommendations
ADD COLUMN IF NOT EXISTS ai_provider VARCHAR(20),
ADD COLUMN IF NOT EXISTS prompt_tokens INTEGER,
ADD COLUMN IF NOT EXISTS completion_tokens INTEGER;

-- Add index for ai_provider queries
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_provider
  ON ai_recommendations(ai_provider)
  WHERE ai_provider IS NOT NULL;

-- Update column comments
COMMENT ON COLUMN ai_recommendations.ai_model IS
  'Model identifier: claude-sonnet-4-20250514, gemini-2.5-flash, gpt-4.1, template-engine';

COMMENT ON COLUMN ai_recommendations.ai_provider IS
  'AI provider: claude, gemini, openai, or null for template-engine';

COMMENT ON COLUMN ai_recommendations.prompt_tokens IS
  'Number of input tokens used in AI generation (for cost tracking)';

COMMENT ON COLUMN ai_recommendations.completion_tokens IS
  'Number of output tokens used in AI generation (for cost tracking)';

-- Migration: Create AI Recommendations Table
-- Description: AI-generated insights and actionable recommendations for publishers

-- Recommendation type enum
CREATE TYPE recommendation_type AS ENUM (
  'content_timing',      -- Best times to post
  'content_format',      -- What content types perform best
  'hashtag_strategy',    -- Hashtag recommendations
  'audience_growth',     -- Tips for growing followers
  'engagement_boost',    -- How to improve engagement
  'cross_platform',      -- Cross-posting strategies
  'trending_topic',      -- Current trends to leverage
  'competitor_insight',  -- What similar publishers do well
  'web_traffic',         -- Driving traffic to website
  'monetization'         -- Revenue optimization
);

-- Recommendation priority
CREATE TYPE recommendation_priority AS ENUM (
  'high',
  'medium',
  'low'
);

-- AI recommendations table
CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_id UUID NOT NULL REFERENCES publishers(id) ON DELETE CASCADE,

  -- Recommendation details
  recommendation_type recommendation_type NOT NULL,
  priority recommendation_priority DEFAULT 'medium',
  title VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  detailed_explanation TEXT,

  -- Action items
  action_items JSONB,
  -- Expected structure:
  -- [
  --   { "text": "Post reels between 6-8pm", "completed": false },
  --   { "text": "Use trending audio in next 3 posts", "completed": false }
  -- ]

  -- Context and evidence
  context JSONB,
  -- Expected structure:
  -- {
  --   "basedOn": "Last 30 days of content performance",
  --   "dataPoints": 45,
  --   "confidenceScore": 0.85,
  --   "relatedMetrics": { "engagementIncrease": 23, "reachIncrease": 45 }
  -- }

  -- Target platform (null = applies to all)
  platform platform_type,

  -- Template vs AI generated
  is_ai_generated BOOLEAN DEFAULT false,
  ai_model VARCHAR(50), -- 'gpt-4o-mini', 'template-engine'

  -- Status tracking
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'dismissed', 'completed', 'expired'
  dismissed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Validity period
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ai_recommendations_publisher ON ai_recommendations(publisher_id);
CREATE INDEX idx_ai_recommendations_type ON ai_recommendations(recommendation_type);
CREATE INDEX idx_ai_recommendations_priority ON ai_recommendations(priority);
CREATE INDEX idx_ai_recommendations_active ON ai_recommendations(publisher_id, status)
  WHERE status = 'active';
CREATE INDEX idx_ai_recommendations_platform ON ai_recommendations(platform)
  WHERE platform IS NOT NULL;

-- Updated_at trigger
CREATE TRIGGER update_ai_recommendations_updated_at
  BEFORE UPDATE ON ai_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Publishers can view and manage their recommendations
CREATE POLICY "Publishers can view own recommendations"
  ON ai_recommendations FOR SELECT
  USING (
    publisher_id IN (
      SELECT id FROM publishers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Publishers can update own recommendations"
  ON ai_recommendations FOR UPDATE
  USING (
    publisher_id IN (
      SELECT id FROM publishers WHERE user_id = auth.uid()
    )
  );

-- Service role can manage all recommendations
CREATE POLICY "Service role can manage recommendations"
  ON ai_recommendations FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE ai_recommendations IS 'AI-generated and template-based recommendations for publishers';
COMMENT ON COLUMN ai_recommendations.action_items IS 'Actionable steps with completion tracking';

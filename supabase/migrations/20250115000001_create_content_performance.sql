-- Migration: Create Content Performance Table
-- Description: Individual post/content performance metrics from connected platforms

-- Content type enum
CREATE TYPE content_type AS ENUM (
  'post',
  'story',
  'reel',
  'video',
  'carousel',
  'article',
  'newsletter',
  'broadcast'
);

-- Content performance table
CREATE TABLE content_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_id UUID NOT NULL REFERENCES publishers(id) ON DELETE CASCADE,
  platform platform_type NOT NULL,

  -- Platform content identifier
  content_id VARCHAR(255) NOT NULL,
  content_type content_type,
  content_url VARCHAR(500),

  -- Publication info
  published_at TIMESTAMPTZ,
  caption_excerpt TEXT, -- First 280 chars for preview
  thumbnail_url VARCHAR(500),

  -- Performance metrics
  impressions INTEGER,
  reach INTEGER,
  likes INTEGER,
  comments INTEGER,
  shares INTEGER,
  saves INTEGER,
  clicks INTEGER,
  video_views INTEGER,
  watch_time_seconds INTEGER,

  -- Engagement calculation
  engagement_rate DECIMAL(5,2),
  engagement_score INTEGER GENERATED ALWAYS AS (
    COALESCE(likes, 0) +
    COALESCE(comments, 0) * 3 +
    COALESCE(shares, 0) * 5 +
    COALESCE(saves, 0) * 2
  ) STORED,

  -- Content metadata
  media_type VARCHAR(50), -- 'image', 'video', 'carousel', 'text'
  hashtags TEXT[],
  mentions TEXT[],

  -- UTM tracking for web attribution
  utm_campaign VARCHAR(255),
  utm_content VARCHAR(255),

  -- Timestamps
  recorded_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure one record per content item per snapshot
  UNIQUE(publisher_id, platform, content_id, recorded_at)
);

-- Indexes for common queries
CREATE INDEX idx_content_performance_publisher ON content_performance(publisher_id);
CREATE INDEX idx_content_performance_platform ON content_performance(platform);
CREATE INDEX idx_content_performance_published ON content_performance(published_at DESC);
CREATE INDEX idx_content_performance_engagement ON content_performance(engagement_score DESC);
CREATE INDEX idx_content_performance_publisher_time ON content_performance(publisher_id, published_at DESC);
CREATE INDEX idx_content_performance_utm ON content_performance(utm_campaign) WHERE utm_campaign IS NOT NULL;

-- Row Level Security
ALTER TABLE content_performance ENABLE ROW LEVEL SECURITY;

-- Publishers can view their own content performance
CREATE POLICY "Publishers can view own content"
  ON content_performance FOR SELECT
  USING (
    publisher_id IN (
      SELECT id FROM publishers WHERE user_id = auth.uid()
    )
  );

-- Only service role can insert content (from sync jobs)
CREATE POLICY "Service role can manage content performance"
  ON content_performance FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Advertisers can view content of active publishers
CREATE POLICY "Authenticated users can view publisher content"
  ON content_performance FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    publisher_id IN (
      SELECT id FROM publishers WHERE status = 'active'
    )
  );

COMMENT ON TABLE content_performance IS 'Individual post/content performance metrics';
COMMENT ON COLUMN content_performance.engagement_score IS 'Weighted engagement score: likes + comments*3 + shares*5 + saves*2';

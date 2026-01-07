-- Migration: Create Metrics Snapshots Table
-- Description: Point-in-time metrics fetched from connected platforms

-- Metrics snapshots table
CREATE TABLE metrics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_id UUID NOT NULL REFERENCES publishers(id) ON DELETE CASCADE,
  platform platform_type NOT NULL,

  -- Timestamp
  recorded_at TIMESTAMPTZ DEFAULT now(),

  -- Social metrics
  follower_count INTEGER,
  following_count INTEGER,
  post_count INTEGER,
  engagement_rate DECIMAL(5,2), -- Percentage (0.00 - 100.00)
  avg_likes INTEGER,
  avg_comments INTEGER,
  avg_shares INTEGER,

  -- Newsletter metrics
  subscriber_count INTEGER,
  open_rate DECIMAL(5,2),
  click_rate DECIMAL(5,2),
  bounce_rate DECIMAL(5,2),

  -- Messaging metrics (WhatsApp, Telegram, etc.)
  channel_subscribers INTEGER,
  broadcast_reach INTEGER,
  message_views INTEGER,

  -- Demographics (JSON for flexibility)
  demographics JSONB,
  -- Expected structure:
  -- {
  --   "ageRanges": { "18-24": 15, "25-34": 35, ... },
  --   "genderSplit": { "male": 45, "female": 52, "other": 3 },
  --   "topCities": [{ "name": "San Francisco", "percent": 45 }, ...],
  --   "topCountries": [{ "code": "US", "percent": 85 }, ...]
  -- }

  -- Content performance (JSON)
  top_content JSONB,
  -- Expected structure:
  -- [
  --   { "id": "...", "type": "post", "engagement": 1234, "reach": 5000 },
  --   ...
  -- ]

  -- Raw API response for debugging (optional)
  raw_response JSONB
);

-- Indexes
CREATE INDEX idx_metrics_snapshots_publisher ON metrics_snapshots(publisher_id);
CREATE INDEX idx_metrics_snapshots_platform ON metrics_snapshots(platform);
CREATE INDEX idx_metrics_snapshots_recorded_at ON metrics_snapshots(recorded_at DESC);
CREATE INDEX idx_metrics_snapshots_publisher_platform_time
  ON metrics_snapshots(publisher_id, platform, recorded_at DESC);

-- Row Level Security
ALTER TABLE metrics_snapshots ENABLE ROW LEVEL SECURITY;

-- Publishers can view their own metrics
CREATE POLICY "Publishers can view own metrics"
  ON metrics_snapshots FOR SELECT
  USING (
    publisher_id IN (
      SELECT id FROM publishers WHERE user_id = auth.uid()
    )
  );

-- Only service role can insert metrics (from sync jobs)
CREATE POLICY "Service role can insert metrics"
  ON metrics_snapshots FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Service role has full access
CREATE POLICY "Service role has full access to metrics"
  ON metrics_snapshots FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Advertisers can view metrics of active publishers (limited fields via views)
CREATE POLICY "Authenticated users can view publisher metrics"
  ON metrics_snapshots FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    publisher_id IN (
      SELECT id FROM publishers WHERE status = 'active'
    )
  );

-- Create a view for advertiser-facing metrics (hides sensitive data)
CREATE VIEW public_publisher_metrics AS
SELECT
  ms.publisher_id,
  ms.platform,
  ms.recorded_at,
  ms.follower_count,
  ms.engagement_rate,
  ms.subscriber_count,
  ms.channel_subscribers,
  -- Aggregated demographics without granular detail
  ms.demographics->'topCities' as top_cities
FROM metrics_snapshots ms
INNER JOIN publishers p ON ms.publisher_id = p.id
WHERE p.status = 'active'
  AND ms.recorded_at = (
    SELECT MAX(recorded_at)
    FROM metrics_snapshots
    WHERE publisher_id = ms.publisher_id AND platform = ms.platform
  );

COMMENT ON TABLE metrics_snapshots IS 'Point-in-time metrics from connected platforms';
COMMENT ON VIEW public_publisher_metrics IS 'Public view of latest metrics for active publishers';

-- Migration: Create Growth Snapshots Table
-- Description: Daily/weekly/monthly growth aggregates for trending analysis

-- Period type enum
CREATE TYPE growth_period_type AS ENUM (
  'daily',
  'weekly',
  'monthly'
);

-- Growth snapshots table
CREATE TABLE growth_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_id UUID NOT NULL REFERENCES publishers(id) ON DELETE CASCADE,
  platform platform_type,  -- NULL means aggregate across all platforms

  -- Period
  snapshot_date DATE NOT NULL,
  period_type growth_period_type NOT NULL,

  -- Follower growth
  followers_start INTEGER,
  followers_end INTEGER,
  net_growth INTEGER,
  growth_rate_percent DECIMAL(8,4), -- Can be negative

  -- Engagement trends
  engagement_start DECIMAL(5,2),
  engagement_end DECIMAL(5,2),
  engagement_change DECIMAL(6,4),

  -- Content activity
  posts_published INTEGER DEFAULT 0,
  total_reach INTEGER,
  total_impressions INTEGER,

  -- Calculated at insert time
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure unique snapshots per publisher/platform/date/period
  UNIQUE(publisher_id, platform, snapshot_date, period_type)
);

-- Indexes
CREATE INDEX idx_growth_snapshots_publisher ON growth_snapshots(publisher_id);
CREATE INDEX idx_growth_snapshots_date ON growth_snapshots(snapshot_date DESC);
CREATE INDEX idx_growth_snapshots_period ON growth_snapshots(period_type);
CREATE INDEX idx_growth_snapshots_growth_rate ON growth_snapshots(growth_rate_percent DESC)
  WHERE period_type = 'monthly';

-- Composite index for growth queries
CREATE INDEX idx_growth_snapshots_publisher_period_date
  ON growth_snapshots(publisher_id, period_type, snapshot_date DESC);

-- Row Level Security
ALTER TABLE growth_snapshots ENABLE ROW LEVEL SECURITY;

-- Publishers can view their own growth
CREATE POLICY "Publishers can view own growth"
  ON growth_snapshots FOR SELECT
  USING (
    publisher_id IN (
      SELECT id FROM publishers WHERE user_id = auth.uid()
    )
  );

-- Service role manages growth snapshots
CREATE POLICY "Service role has full access to growth"
  ON growth_snapshots FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Advertisers can view growth of active publishers
CREATE POLICY "Authenticated users can view publisher growth"
  ON growth_snapshots FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    publisher_id IN (
      SELECT id FROM publishers WHERE status = 'active'
    )
  );

-- Function to calculate growth rate
CREATE OR REPLACE FUNCTION calculate_growth_rate(
  start_value INTEGER,
  end_value INTEGER
) RETURNS DECIMAL(8,4) AS $$
BEGIN
  IF start_value IS NULL OR start_value = 0 THEN
    RETURN NULL;
  END IF;
  RETURN ((end_value - start_value)::DECIMAL / start_value) * 100;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- View for 30-day growth leaderboard
CREATE VIEW growth_leaderboard_30d AS
SELECT
  p.id as publisher_id,
  p.name as publisher_name,
  gs.platform,
  gs.followers_end as current_followers,
  gs.net_growth,
  gs.growth_rate_percent,
  gs.snapshot_date
FROM growth_snapshots gs
INNER JOIN publishers p ON gs.publisher_id = p.id
WHERE gs.period_type = 'monthly'
  AND gs.snapshot_date >= CURRENT_DATE - INTERVAL '30 days'
  AND p.status = 'active'
ORDER BY gs.growth_rate_percent DESC NULLS LAST;

COMMENT ON TABLE growth_snapshots IS 'Aggregated growth metrics by time period';
COMMENT ON VIEW growth_leaderboard_30d IS 'Top growing publishers in last 30 days';

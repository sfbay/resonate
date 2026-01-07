-- Migration: Create Growth Badges Table
-- Description: Achievement badges awarded to publishers based on growth/engagement

-- Badge type enum
CREATE TYPE badge_type AS ENUM (
  'rising_star',        -- 20%+ growth in 30 days
  'growth_champion',    -- 50%+ growth in 90 days
  'engagement_leader',  -- Top 10% engagement rate
  'verified_publisher', -- All platforms connected and verified
  'emerging_channel',   -- Active on messaging platforms
  'community_builder'   -- High community engagement metrics
);

-- Badge tier enum
CREATE TYPE badge_tier AS ENUM (
  'bronze',
  'silver',
  'gold'
);

-- Badge status enum
CREATE TYPE badge_status AS ENUM (
  'active',
  'expired',
  'revoked'
);

-- Growth badges table
CREATE TABLE growth_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_id UUID NOT NULL REFERENCES publishers(id) ON DELETE CASCADE,

  -- Badge info
  badge_type badge_type NOT NULL,
  tier badge_tier, -- NULL for non-tiered badges
  platform platform_type, -- NULL if badge applies across all platforms

  -- Lifecycle
  awarded_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ, -- NULL = never expires
  status badge_status DEFAULT 'active',

  -- Criteria that triggered the badge
  criteria_met JSONB
  -- Expected structure:
  -- {
  --   "metric": "growth_rate_30d",
  --   "value": 45.2,
  --   "threshold": 35,
  --   "followers": 5000
  -- }
);

-- Partial unique indexes to prevent duplicate active badges of same type
-- One for badges with a specific platform
CREATE UNIQUE INDEX idx_growth_badges_unique_active_platform
  ON growth_badges(publisher_id, badge_type, platform)
  WHERE status = 'active' AND platform IS NOT NULL;

-- One for badges without a platform (NULL)
CREATE UNIQUE INDEX idx_growth_badges_unique_active_no_platform
  ON growth_badges(publisher_id, badge_type)
  WHERE status = 'active' AND platform IS NULL;

-- Indexes
CREATE INDEX idx_growth_badges_publisher ON growth_badges(publisher_id);
CREATE INDEX idx_growth_badges_type ON growth_badges(badge_type);
CREATE INDEX idx_growth_badges_status ON growth_badges(status) WHERE status = 'active';
CREATE INDEX idx_growth_badges_tier ON growth_badges(tier) WHERE tier IS NOT NULL;
CREATE INDEX idx_growth_badges_expires ON growth_badges(expires_at)
  WHERE expires_at IS NOT NULL AND status = 'active';

-- Row Level Security
ALTER TABLE growth_badges ENABLE ROW LEVEL SECURITY;

-- Publishers can view their own badges
CREATE POLICY "Publishers can view own badges"
  ON growth_badges FOR SELECT
  USING (
    publisher_id IN (
      SELECT id FROM publishers WHERE user_id = auth.uid()
    )
  );

-- Service role manages badges
CREATE POLICY "Service role has full access to badges"
  ON growth_badges FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Advertisers can view active badges of active publishers
CREATE POLICY "Authenticated users can view publisher badges"
  ON growth_badges FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    status = 'active' AND
    publisher_id IN (
      SELECT id FROM publishers WHERE status = 'active'
    )
  );

-- Function to check and expire badges
CREATE OR REPLACE FUNCTION expire_badges()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE growth_badges
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at < now();

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- View for active badges with publisher info
CREATE VIEW active_publisher_badges AS
SELECT
  gb.id as badge_id,
  gb.publisher_id,
  p.name as publisher_name,
  gb.badge_type,
  gb.tier,
  gb.platform,
  gb.awarded_at,
  gb.expires_at,
  gb.criteria_met
FROM growth_badges gb
INNER JOIN publishers p ON gb.publisher_id = p.id
WHERE gb.status = 'active'
  AND p.status = 'active';

-- View for rising stars (most valuable for advertisers)
CREATE VIEW rising_star_publishers AS
SELECT
  p.id as publisher_id,
  p.name,
  p.description,
  gb.tier,
  gb.awarded_at,
  gb.criteria_met->>'value' as growth_rate,
  gb.criteria_met->>'followers' as follower_count
FROM growth_badges gb
INNER JOIN publishers p ON gb.publisher_id = p.id
WHERE gb.badge_type = 'rising_star'
  AND gb.status = 'active'
  AND p.status = 'active'
ORDER BY
  CASE gb.tier
    WHEN 'gold' THEN 1
    WHEN 'silver' THEN 2
    WHEN 'bronze' THEN 3
  END,
  gb.awarded_at DESC;

COMMENT ON TABLE growth_badges IS 'Achievement badges awarded based on growth/engagement';
COMMENT ON VIEW active_publisher_badges IS 'All active badges for active publishers';
COMMENT ON VIEW rising_star_publishers IS 'Publishers with Rising Star badge, ordered by tier';

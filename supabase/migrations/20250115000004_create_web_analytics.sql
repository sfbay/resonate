-- Migration: Create Web Analytics Tables
-- Description: GA4 integration for tracking website traffic and social attribution

-- Analytics provider enum
CREATE TYPE analytics_provider AS ENUM (
  'google_analytics', -- GA4
  'plausible',
  'fathom',
  'simple_analytics'
);

-- Web analytics connections table
CREATE TABLE web_analytics_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_id UUID NOT NULL REFERENCES publishers(id) ON DELETE CASCADE,
  provider analytics_provider NOT NULL,

  -- GA4 specific
  property_id VARCHAR(50), -- GA4 property ID (e.g., '123456789')
  property_name VARCHAR(255),
  website_url VARCHAR(500),

  -- OAuth tokens
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[],

  -- Connection status
  status connection_status DEFAULT 'active',
  last_synced_at TIMESTAMPTZ,
  last_sync_error TEXT,

  -- Timestamps
  connected_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(publisher_id, provider)
);

-- Web traffic snapshots (daily aggregates)
CREATE TABLE web_traffic_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_id UUID NOT NULL REFERENCES publishers(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES web_analytics_connections(id) ON DELETE SET NULL,

  -- Date range
  snapshot_date DATE NOT NULL,

  -- Traffic metrics
  total_users INTEGER,
  new_users INTEGER,
  returning_users INTEGER,
  sessions INTEGER,
  pageviews INTEGER,
  unique_pageviews INTEGER,

  -- Engagement metrics
  avg_session_duration_seconds DECIMAL(10,2),
  pages_per_session DECIMAL(5,2),
  bounce_rate DECIMAL(5,2),
  engagement_rate DECIMAL(5,2), -- GA4's engaged sessions / total sessions

  -- Traffic sources (JSONB for flexibility)
  traffic_sources JSONB,
  -- Expected structure:
  -- {
  --   "organic_search": { "users": 1500, "sessions": 2000, "percent": 35 },
  --   "direct": { "users": 800, "sessions": 1000, "percent": 20 },
  --   "social": { "users": 600, "sessions": 750, "percent": 15 },
  --   "referral": { "users": 300, "sessions": 400, "percent": 10 },
  --   "email": { "users": 200, "sessions": 250, "percent": 8 }
  -- }

  -- Social traffic breakdown (JSONB)
  social_traffic JSONB,
  -- Expected structure:
  -- {
  --   "instagram": { "users": 250, "sessions": 300 },
  --   "tiktok": { "users": 150, "sessions": 180 },
  --   "facebook": { "users": 100, "sessions": 120 },
  --   "twitter": { "users": 75, "sessions": 90 }
  -- }

  -- Geography (top 5 cities)
  top_cities JSONB,
  -- Expected structure:
  -- [
  --   { "city": "San Francisco", "users": 500, "percent": 25 },
  --   { "city": "Oakland", "users": 200, "percent": 10 },
  --   ...
  -- ]

  -- Device breakdown
  device_breakdown JSONB,
  -- Expected structure:
  -- { "mobile": 65, "desktop": 30, "tablet": 5 }

  -- Timestamps
  recorded_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(publisher_id, snapshot_date)
);

-- Web article performance (individual page stats)
CREATE TABLE web_article_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_id UUID NOT NULL REFERENCES publishers(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES web_analytics_connections(id) ON DELETE SET NULL,

  -- Article identification
  page_path VARCHAR(500) NOT NULL,
  page_title VARCHAR(500),
  published_date DATE,

  -- Date range for this snapshot
  snapshot_date DATE NOT NULL,

  -- Performance metrics
  pageviews INTEGER,
  unique_pageviews INTEGER,
  users INTEGER,
  avg_time_on_page_seconds DECIMAL(10,2),
  bounce_rate DECIMAL(5,2),
  exit_rate DECIMAL(5,2),

  -- Traffic sources for this article
  traffic_sources JSONB,

  -- Social traffic for this article
  social_traffic JSONB,

  -- Timestamps
  recorded_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(publisher_id, page_path, snapshot_date)
);

-- Social to web attribution (UTM tracking)
CREATE TABLE social_web_attribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_id UUID NOT NULL REFERENCES publishers(id) ON DELETE CASCADE,

  -- Social post reference
  content_id UUID REFERENCES content_performance(id) ON DELETE SET NULL,
  platform platform_type NOT NULL,
  post_id VARCHAR(255), -- Platform's post ID
  posted_at TIMESTAMPTZ,

  -- UTM parameters used
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(255),
  utm_content VARCHAR(255),
  utm_term VARCHAR(255),

  -- Attribution metrics
  attributed_users INTEGER DEFAULT 0,
  attributed_sessions INTEGER DEFAULT 0,
  attributed_pageviews INTEGER DEFAULT 0,
  attributed_conversions INTEGER DEFAULT 0,

  -- Engagement quality
  avg_session_duration_seconds DECIMAL(10,2),
  pages_per_session DECIMAL(5,2),
  bounce_rate DECIMAL(5,2),

  -- Date range
  attribution_date DATE NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(publisher_id, platform, post_id, attribution_date)
);

-- Indexes for web_analytics_connections
CREATE INDEX idx_web_analytics_publisher ON web_analytics_connections(publisher_id);
CREATE INDEX idx_web_analytics_status ON web_analytics_connections(status);

-- Indexes for web_traffic_snapshots
CREATE INDEX idx_web_traffic_publisher ON web_traffic_snapshots(publisher_id);
CREATE INDEX idx_web_traffic_date ON web_traffic_snapshots(snapshot_date DESC);
CREATE INDEX idx_web_traffic_publisher_date ON web_traffic_snapshots(publisher_id, snapshot_date DESC);

-- Indexes for web_article_performance
CREATE INDEX idx_web_article_publisher ON web_article_performance(publisher_id);
CREATE INDEX idx_web_article_date ON web_article_performance(snapshot_date DESC);
CREATE INDEX idx_web_article_pageviews ON web_article_performance(pageviews DESC);
CREATE INDEX idx_web_article_publisher_date ON web_article_performance(publisher_id, snapshot_date DESC);

-- Indexes for social_web_attribution
CREATE INDEX idx_attribution_publisher ON social_web_attribution(publisher_id);
CREATE INDEX idx_attribution_platform ON social_web_attribution(platform);
CREATE INDEX idx_attribution_date ON social_web_attribution(attribution_date DESC);
CREATE INDEX idx_attribution_content ON social_web_attribution(content_id) WHERE content_id IS NOT NULL;
CREATE INDEX idx_attribution_campaign ON social_web_attribution(utm_campaign) WHERE utm_campaign IS NOT NULL;

-- Updated_at triggers
CREATE TRIGGER update_web_analytics_connections_updated_at
  BEFORE UPDATE ON web_analytics_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_web_attribution_updated_at
  BEFORE UPDATE ON social_web_attribution
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security for all tables
ALTER TABLE web_analytics_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_traffic_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_article_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_web_attribution ENABLE ROW LEVEL SECURITY;

-- web_analytics_connections policies
CREATE POLICY "Publishers can view own web analytics connections"
  ON web_analytics_connections FOR SELECT
  USING (publisher_id IN (SELECT id FROM publishers WHERE user_id = auth.uid()));

CREATE POLICY "Publishers can manage own web analytics connections"
  ON web_analytics_connections FOR ALL
  USING (publisher_id IN (SELECT id FROM publishers WHERE user_id = auth.uid()));

CREATE POLICY "Service role can manage web analytics connections"
  ON web_analytics_connections FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- web_traffic_snapshots policies
CREATE POLICY "Publishers can view own web traffic"
  ON web_traffic_snapshots FOR SELECT
  USING (publisher_id IN (SELECT id FROM publishers WHERE user_id = auth.uid()));

CREATE POLICY "Service role can manage web traffic"
  ON web_traffic_snapshots FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- web_article_performance policies
CREATE POLICY "Publishers can view own article performance"
  ON web_article_performance FOR SELECT
  USING (publisher_id IN (SELECT id FROM publishers WHERE user_id = auth.uid()));

CREATE POLICY "Service role can manage article performance"
  ON web_article_performance FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Advertisers can view web traffic for active publishers who enabled it
CREATE POLICY "View web traffic for publishers with public media kits"
  ON web_traffic_snapshots FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    publisher_id IN (
      SELECT mks.publisher_id FROM media_kit_settings mks
      JOIN publishers p ON mks.publisher_id = p.id
      WHERE mks.show_web_traffic = true
        AND mks.visibility IN ('public', 'authenticated')
        AND p.status = 'active'
    )
  );

-- social_web_attribution policies
CREATE POLICY "Publishers can view own attribution"
  ON social_web_attribution FOR SELECT
  USING (publisher_id IN (SELECT id FROM publishers WHERE user_id = auth.uid()));

CREATE POLICY "Service role can manage attribution"
  ON social_web_attribution FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE web_analytics_connections IS 'OAuth connections to web analytics providers (GA4, etc.)';
COMMENT ON TABLE web_traffic_snapshots IS 'Daily aggregate web traffic metrics';
COMMENT ON TABLE web_article_performance IS 'Individual article/page performance metrics';
COMMENT ON TABLE social_web_attribution IS 'Tracks social post to website traffic attribution via UTM';

-- Migration: Create Campaigns Table
-- Description: Campaign and target audience tables for department outreach

-- =============================================================================
-- CAMPAIGN STATUS ENUM
-- =============================================================================

CREATE TYPE campaign_status AS ENUM (
  'draft',
  'pending_review',
  'active',
  'paused',
  'completed',
  'cancelled'
);

-- =============================================================================
-- CAMPAIGNS TABLE
-- =============================================================================

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership
  advertiser_id UUID, -- References future advertisers table
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Basic info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  department VARCHAR(255),

  -- Target audience
  target_neighborhoods TEXT[], -- Array of neighborhood slugs
  target_languages TEXT[],     -- Array of language codes
  target_communities TEXT[],   -- Array of community identifiers
  target_age_ranges TEXT[],    -- Array like ['18-24', '25-34']
  target_income_levels TEXT[], -- Array like ['low', 'moderate']

  -- Budget
  budget_min INTEGER,
  budget_max INTEGER,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Timeline
  start_date DATE,
  end_date DATE,

  -- Status
  status campaign_status DEFAULT 'draft',

  -- Matching preferences (weights for scoring)
  weight_geographic INTEGER DEFAULT 25,
  weight_demographic INTEGER DEFAULT 20,
  weight_economic INTEGER DEFAULT 20,
  weight_cultural INTEGER DEFAULT 20,
  weight_reach INTEGER DEFAULT 15,

  -- Metadata
  city_slug VARCHAR(20) DEFAULT 'sf',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_campaigns_user ON campaigns(user_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_city ON campaigns(city_slug);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Users can view their own campaigns
CREATE POLICY "Users can view own campaigns"
  ON campaigns FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create campaigns
CREATE POLICY "Users can create campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own campaigns
CREATE POLICY "Users can update own campaigns"
  ON campaigns FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role has full access
CREATE POLICY "Service role has full access to campaigns"
  ON campaigns FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- For demo: allow public read of draft campaigns
CREATE POLICY "Allow public read campaigns for demo"
  ON campaigns FOR SELECT
  USING (true);

-- For demo: allow public insert of campaigns
CREATE POLICY "Allow public insert campaigns for demo"
  ON campaigns FOR INSERT
  WITH CHECK (true);

-- =============================================================================
-- CAMPAIGN MATCHES TABLE
-- =============================================================================

CREATE TABLE campaign_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  publisher_id UUID NOT NULL REFERENCES publishers(id) ON DELETE CASCADE,

  -- Match score breakdown
  overall_score INTEGER NOT NULL, -- 0-100
  geographic_score INTEGER,
  demographic_score INTEGER,
  economic_score INTEGER,
  cultural_score INTEGER,
  reach_score INTEGER,

  -- Match details (JSON for flexibility)
  match_details JSONB,
  -- Expected structure:
  -- {
  --   "matchingNeighborhoods": ["mission", "soma"],
  --   "matchingLanguages": ["spanish", "english"],
  --   "estimatedReach": 15000,
  --   "reasons": ["Strong presence in target neighborhoods"]
  -- }

  -- Status
  is_selected BOOLEAN DEFAULT false,
  contacted_at TIMESTAMPTZ,
  response_status VARCHAR(50), -- 'pending', 'accepted', 'declined'

  -- Timestamps
  matched_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(campaign_id, publisher_id)
);

CREATE INDEX idx_campaign_matches_campaign ON campaign_matches(campaign_id);
CREATE INDEX idx_campaign_matches_publisher ON campaign_matches(publisher_id);
CREATE INDEX idx_campaign_matches_score ON campaign_matches(overall_score DESC);
CREATE INDEX idx_campaign_matches_selected ON campaign_matches(is_selected) WHERE is_selected = true;

ALTER TABLE campaign_matches ENABLE ROW LEVEL SECURITY;

-- Allow public read for demo
CREATE POLICY "Allow public read matches for demo"
  ON campaign_matches FOR SELECT
  USING (true);

-- Allow public insert for demo
CREATE POLICY "Allow public insert matches for demo"
  ON campaign_matches FOR INSERT
  WITH CHECK (true);

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE campaigns IS 'Department outreach campaigns with target audiences';
COMMENT ON TABLE campaign_matches IS 'Publisher matches for campaigns with scoring';
COMMENT ON COLUMN campaigns.weight_geographic IS 'Weight for geographic matching (0-100)';
COMMENT ON COLUMN campaign_matches.overall_score IS 'Aggregate match score (0-100)';

-- Migration: Create Audience Profiles Table
-- Description: Persisted audience demographics for matching algorithm

-- Verification level enum
CREATE TYPE verification_level AS ENUM (
  'self_reported',  -- Publisher-provided data only
  'partial',        -- Some platforms verified
  'verified'        -- All connected platforms verified via OAuth
);

-- Audience profiles table
CREATE TABLE audience_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_id UUID NOT NULL REFERENCES publishers(id) ON DELETE CASCADE UNIQUE,

  -- Geographic reach
  neighborhoods TEXT[],  -- Array of SF neighborhood names
  districts INTEGER[],   -- Supervisor districts (1-11)
  zip_codes TEXT[],
  citywide BOOLEAN DEFAULT false,

  -- Demographics
  languages TEXT[],      -- e.g., ['english', 'spanish', 'chinese']
  age_ranges TEXT[],     -- e.g., ['18-24', '25-34', '35-44']
  ethnicities TEXT[],    -- e.g., ['hispanic', 'asian', 'black']

  -- Economic
  income_levels TEXT[],  -- e.g., ['low', 'moderate', 'middle']
  housing_status TEXT[], -- e.g., ['renters', 'owners']

  -- Verification
  verification_level verification_level DEFAULT 'self_reported',
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),

  -- Source tracking
  self_reported_data JSONB,  -- Original publisher-provided data
  verified_data JSONB,       -- Data from OAuth platform APIs
  census_overlay_data JSONB, -- Inferred from census overlay

  -- Timestamps
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_audience_profiles_publisher ON audience_profiles(publisher_id);
CREATE INDEX idx_audience_profiles_verification ON audience_profiles(verification_level);
CREATE INDEX idx_audience_profiles_citywide ON audience_profiles(citywide) WHERE citywide = true;
CREATE INDEX idx_audience_profiles_neighborhoods ON audience_profiles USING GIN(neighborhoods);
CREATE INDEX idx_audience_profiles_languages ON audience_profiles USING GIN(languages);
CREATE INDEX idx_audience_profiles_ethnicities ON audience_profiles USING GIN(ethnicities);

-- Updated_at trigger
CREATE TRIGGER update_audience_profiles_updated_at
  BEFORE UPDATE ON audience_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE audience_profiles ENABLE ROW LEVEL SECURITY;

-- Publishers can view and manage their own profile
CREATE POLICY "Publishers can view own audience profile"
  ON audience_profiles FOR SELECT
  USING (
    publisher_id IN (
      SELECT id FROM publishers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Publishers can update own audience profile"
  ON audience_profiles FOR UPDATE
  USING (
    publisher_id IN (
      SELECT id FROM publishers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Publishers can insert own audience profile"
  ON audience_profiles FOR INSERT
  WITH CHECK (
    publisher_id IN (
      SELECT id FROM publishers WHERE user_id = auth.uid()
    )
  );

-- Service role has full access
CREATE POLICY "Service role has full access to audience profiles"
  ON audience_profiles FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Advertisers can view profiles of active publishers
CREATE POLICY "Authenticated users can view publisher audience profiles"
  ON audience_profiles FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    publisher_id IN (
      SELECT id FROM publishers WHERE status = 'active'
    )
  );

-- Function to merge self-reported and verified data
CREATE OR REPLACE FUNCTION merge_audience_data(
  self_reported JSONB,
  verified JSONB,
  census_overlay JSONB
) RETURNS JSONB AS $$
BEGIN
  -- Verified data takes precedence, then census overlay, then self-reported
  RETURN COALESCE(verified, '{}'::jsonb)
    || COALESCE(census_overlay, '{}'::jsonb)
    || COALESCE(self_reported, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- View for matching algorithm
CREATE VIEW matchable_publishers AS
SELECT
  p.id,
  p.name,
  p.description,
  p.status,
  ap.neighborhoods,
  ap.districts,
  ap.citywide,
  ap.languages,
  ap.age_ranges,
  ap.ethnicities,
  ap.income_levels,
  ap.verification_level,
  ap.confidence_score,
  -- Aggregate metrics from latest snapshots
  (
    SELECT jsonb_agg(jsonb_build_object(
      'platform', ms.platform,
      'followers', ms.follower_count,
      'engagement', ms.engagement_rate
    ))
    FROM metrics_snapshots ms
    WHERE ms.publisher_id = p.id
      AND ms.recorded_at = (
        SELECT MAX(recorded_at)
        FROM metrics_snapshots
        WHERE publisher_id = ms.publisher_id AND platform = ms.platform
      )
  ) as platform_metrics,
  -- Active badges
  (
    SELECT jsonb_agg(jsonb_build_object(
      'type', gb.badge_type,
      'tier', gb.tier
    ))
    FROM growth_badges gb
    WHERE gb.publisher_id = p.id AND gb.status = 'active'
  ) as badges
FROM publishers p
LEFT JOIN audience_profiles ap ON p.id = ap.publisher_id
WHERE p.status = 'active';

COMMENT ON TABLE audience_profiles IS 'Publisher audience demographics for matching';
COMMENT ON VIEW matchable_publishers IS 'Publishers with all data needed for matching algorithm';

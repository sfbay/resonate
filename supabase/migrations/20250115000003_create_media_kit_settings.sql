-- Migration: Create Media Kit Settings Table
-- Description: Publisher settings for their public-facing media kit shown to advertisers

-- Media kit visibility
CREATE TYPE media_kit_visibility AS ENUM (
  'public',       -- Anyone can view
  'authenticated', -- Only logged-in users
  'private'       -- Only publisher
);

-- Media kit settings table
CREATE TABLE media_kit_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_id UUID NOT NULL REFERENCES publishers(id) ON DELETE CASCADE,

  -- Basic settings
  visibility media_kit_visibility DEFAULT 'authenticated',
  custom_slug VARCHAR(100), -- e.g., /media-kit/el-tecolote

  -- Display preferences
  show_follower_counts BOOLEAN DEFAULT true,
  show_engagement_rates BOOLEAN DEFAULT true,
  show_growth_metrics BOOLEAN DEFAULT true,
  show_audience_demographics BOOLEAN DEFAULT true,
  show_top_content BOOLEAN DEFAULT true,
  show_badges BOOLEAN DEFAULT true,
  show_web_traffic BOOLEAN DEFAULT false, -- Opt-in for GA4 data

  -- Platforms to display (null = all connected)
  displayed_platforms platform_type[],

  -- Custom content
  headline TEXT, -- Custom tagline
  bio TEXT, -- About the publisher
  mission_statement TEXT,

  -- Branding
  accent_color VARCHAR(7), -- Hex color
  custom_logo_url VARCHAR(500),
  cover_image_url VARCHAR(500),

  -- Contact preferences
  show_contact_email BOOLEAN DEFAULT false,
  contact_email VARCHAR(255),
  booking_url VARCHAR(500), -- Calendly, etc.

  -- Social proof
  featured_campaigns JSONB,
  -- Expected structure:
  -- [
  --   { "name": "SFMTA Campaign", "date": "2024-06", "logo": "url", "testimonial": "..." },
  --   ...
  -- ]

  testimonials JSONB,
  -- Expected structure:
  -- [
  --   { "author": "Jane Doe", "org": "SF Health Dept", "quote": "...", "date": "2024-05" },
  --   ...
  -- ]

  -- Analytics
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(publisher_id),
  UNIQUE(custom_slug)
);

-- Indexes
CREATE INDEX idx_media_kit_publisher ON media_kit_settings(publisher_id);
CREATE INDEX idx_media_kit_slug ON media_kit_settings(custom_slug) WHERE custom_slug IS NOT NULL;
CREATE INDEX idx_media_kit_visibility ON media_kit_settings(visibility);

-- Updated_at trigger
CREATE TRIGGER update_media_kit_settings_updated_at
  BEFORE UPDATE ON media_kit_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE media_kit_settings ENABLE ROW LEVEL SECURITY;

-- Publishers can manage their own media kit
CREATE POLICY "Publishers can view own media kit settings"
  ON media_kit_settings FOR SELECT
  USING (
    publisher_id IN (
      SELECT id FROM publishers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Publishers can update own media kit settings"
  ON media_kit_settings FOR UPDATE
  USING (
    publisher_id IN (
      SELECT id FROM publishers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Publishers can insert own media kit settings"
  ON media_kit_settings FOR INSERT
  WITH CHECK (
    publisher_id IN (
      SELECT id FROM publishers WHERE user_id = auth.uid()
    )
  );

-- Public media kits can be viewed by anyone
CREATE POLICY "Public media kits are viewable"
  ON media_kit_settings FOR SELECT
  USING (visibility = 'public');

-- Authenticated media kits viewable by logged-in users
CREATE POLICY "Authenticated media kits viewable by users"
  ON media_kit_settings FOR SELECT
  USING (
    visibility = 'authenticated' AND
    auth.role() = 'authenticated'
  );

-- Service role has full access
CREATE POLICY "Service role has full access to media kit"
  ON media_kit_settings FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_media_kit_views(kit_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE media_kit_settings
  SET
    view_count = view_count + 1,
    last_viewed_at = now()
  WHERE id = kit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE media_kit_settings IS 'Publisher media kit configuration for advertisers';
COMMENT ON COLUMN media_kit_settings.custom_slug IS 'URL-friendly identifier for media kit';

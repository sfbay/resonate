-- Channel taxonomy for Resonate ad products
-- Three buyer-facing groups: social, display, audio_video

CREATE TYPE channel_group AS ENUM ('social', 'display', 'audio_video');

CREATE TABLE channel_formats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_group channel_group NOT NULL,
  format_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  platforms TEXT[] NOT NULL DEFAULT '{}',
  placements TEXT[] NOT NULL DEFAULT '{}',
  spec JSONB NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE market_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_slug TEXT NOT NULL,
  channel_group channel_group NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  disabled_formats TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (city_slug, channel_group)
);

ALTER TABLE channel_formats ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_channels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read channel_formats" ON channel_formats;
CREATE POLICY "Public read channel_formats" ON channel_formats FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read market_channels" ON market_channels;
CREATE POLICY "Public read market_channels" ON market_channels FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service manage channel_formats" ON channel_formats;
CREATE POLICY "Service manage channel_formats" ON channel_formats
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service manage market_channels" ON market_channels;
CREATE POLICY "Service manage market_channels" ON market_channels
  FOR ALL USING (auth.role() = 'service_role');

CREATE TYPE template_tier AS ENUM ('free', 'premium');

CREATE TABLE unit_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  channel_group channel_group NOT NULL,
  format_key TEXT NOT NULL REFERENCES channel_formats(format_key),
  tier template_tier NOT NULL DEFAULT 'free',
  category TEXT NOT NULL DEFAULT 'general',
  template_data JSONB NOT NULL DEFAULT '{}',
  thumbnail_url TEXT,
  preview_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_unit_templates_group ON unit_templates(channel_group);
CREATE INDEX idx_unit_templates_format ON unit_templates(format_key);
CREATE INDEX idx_unit_templates_tier ON unit_templates(tier);

ALTER TABLE unit_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read unit_templates" ON unit_templates;
CREATE POLICY "Public read unit_templates" ON unit_templates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service manage unit_templates" ON unit_templates;
CREATE POLICY "Service manage unit_templates" ON unit_templates
  FOR ALL USING (auth.role() = 'service_role');

CREATE TYPE unit_status AS ENUM (
  'draft', 'ready', 'sent', 'pending_publisher', 'accepted',
  'revision_requested', 'rejected', 'in_production', 'delivered'
);

CREATE TYPE creative_tier AS ENUM (
  'upload', 'free_template', 'premium_template', 'assisted'
);

CREATE TABLE campaign_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  publisher_id UUID NOT NULL REFERENCES publishers(id),
  channel_group channel_group NOT NULL,
  format_key TEXT NOT NULL REFERENCES channel_formats(format_key),
  platform TEXT NOT NULL,
  placement TEXT NOT NULL,
  status unit_status NOT NULL DEFAULT 'draft',
  tier creative_tier NOT NULL DEFAULT 'upload',
  creative_assets JSONB NOT NULL DEFAULT '{}',
  compliance_notes TEXT,
  revision_feedback TEXT,
  proof JSONB,
  deadline TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  payout_cents INT NOT NULL DEFAULT 0,
  template_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_campaign_units_campaign ON campaign_units(campaign_id);
CREATE INDEX idx_campaign_units_publisher ON campaign_units(publisher_id);
CREATE INDEX idx_campaign_units_status ON campaign_units(status);

ALTER TABLE campaign_units ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read campaign_units" ON campaign_units;
CREATE POLICY "Public read campaign_units" ON campaign_units FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert campaign_units" ON campaign_units;
CREATE POLICY "Public insert campaign_units" ON campaign_units FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update campaign_units" ON campaign_units;
CREATE POLICY "Public update campaign_units" ON campaign_units FOR UPDATE USING (true);

CREATE OR REPLACE FUNCTION update_campaign_units_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER campaign_units_updated_at
  BEFORE UPDATE ON campaign_units
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_units_updated_at();

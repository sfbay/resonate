-- Migration: Create user-org mapping table
-- Links Clerk identities to internal Supabase entities

CREATE TABLE user_org_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,
  clerk_org_id TEXT NOT NULL,
  org_type TEXT NOT NULL CHECK (org_type IN ('publisher', 'government', 'advertiser')),
  publisher_id UUID REFERENCES publishers(id) ON DELETE SET NULL,
  city_slug TEXT DEFAULT 'sf',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_approval', 'rejected', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (clerk_user_id, clerk_org_id)
);

-- Indexes
CREATE INDEX idx_user_org_mapping_clerk_user ON user_org_mapping(clerk_user_id);
CREATE INDEX idx_user_org_mapping_clerk_org ON user_org_mapping(clerk_org_id);
CREATE INDEX idx_user_org_mapping_publisher ON user_org_mapping(publisher_id) WHERE publisher_id IS NOT NULL;
CREATE INDEX idx_user_org_mapping_status ON user_org_mapping(status);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_user_org_mapping_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_user_org_mapping_updated_at
  BEFORE UPDATE ON user_org_mapping
  FOR EACH ROW
  EXECUTE FUNCTION update_user_org_mapping_updated_at();

-- RLS
ALTER TABLE user_org_mapping ENABLE ROW LEVEL SECURITY;

-- Users can read their own mapping
CREATE POLICY "Users can view own mapping"
  ON user_org_mapping FOR SELECT
  USING (clerk_user_id = auth.jwt()->>'sub');

-- Service role has full access (for webhooks)
CREATE POLICY "Service role has full access to user_org_mapping"
  ON user_org_mapping FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE user_org_mapping IS 'Maps Clerk user/org IDs to internal Supabase entities';

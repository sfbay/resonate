-- Migration: Create Platform Connections Table
-- Description: OAuth tokens and connection status for social/messaging platforms

-- Platform type enum
CREATE TYPE platform_type AS ENUM (
  -- Social platforms
  'instagram',
  'facebook',
  'tiktok',
  -- Newsletter platforms
  'mailchimp',
  'substack',
  -- Messaging platforms
  'whatsapp',
  'telegram',
  'signal',
  'sms',
  'weibo'
);

-- Connection status enum
CREATE TYPE connection_status AS ENUM (
  'active',
  'expired',
  'revoked',
  'error'
);

-- Platform connections table
CREATE TABLE platform_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_id UUID NOT NULL REFERENCES publishers(id) ON DELETE CASCADE,
  platform platform_type NOT NULL,

  -- Platform identifiers
  platform_user_id VARCHAR(255),
  handle VARCHAR(255),
  url VARCHAR(500),

  -- OAuth tokens (should be encrypted in production)
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[], -- Array of granted OAuth scopes

  -- Verification
  verified BOOLEAN DEFAULT false,
  verification_method VARCHAR(50), -- 'oauth', 'api_key', 'manual'

  -- Sync status
  last_synced_at TIMESTAMPTZ,
  last_sync_error TEXT,
  status connection_status DEFAULT 'active',

  -- Timestamps
  connected_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure one connection per platform per publisher
  UNIQUE(publisher_id, platform)
);

-- Indexes
CREATE INDEX idx_platform_connections_publisher ON platform_connections(publisher_id);
CREATE INDEX idx_platform_connections_platform ON platform_connections(platform);
CREATE INDEX idx_platform_connections_status ON platform_connections(status);
CREATE INDEX idx_platform_connections_verified ON platform_connections(verified) WHERE verified = true;

-- Updated_at trigger
CREATE TRIGGER update_platform_connections_updated_at
  BEFORE UPDATE ON platform_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE platform_connections ENABLE ROW LEVEL SECURITY;

-- Publishers can view their own connections
CREATE POLICY "Publishers can view own connections"
  ON platform_connections FOR SELECT
  USING (
    publisher_id IN (
      SELECT id FROM publishers WHERE user_id = auth.uid()
    )
  );

-- Publishers can manage their own connections
CREATE POLICY "Publishers can insert own connections"
  ON platform_connections FOR INSERT
  WITH CHECK (
    publisher_id IN (
      SELECT id FROM publishers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Publishers can update own connections"
  ON platform_connections FOR UPDATE
  USING (
    publisher_id IN (
      SELECT id FROM publishers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Publishers can delete own connections"
  ON platform_connections FOR DELETE
  USING (
    publisher_id IN (
      SELECT id FROM publishers WHERE user_id = auth.uid()
    )
  );

-- Service role has full access
CREATE POLICY "Service role has full access to connections"
  ON platform_connections FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE platform_connections IS 'OAuth connections to social/messaging platforms';
COMMENT ON COLUMN platform_connections.access_token IS 'OAuth access token - encrypt in production';
COMMENT ON COLUMN platform_connections.refresh_token IS 'OAuth refresh token - encrypt in production';

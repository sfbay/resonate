-- Migration: Create Publishers Table
-- Description: Core publisher entity for community media outlets

-- Create enum types for publisher status
CREATE TYPE publisher_status AS ENUM (
  'pending_review',
  'active',
  'suspended',
  'archived'
);

CREATE TYPE vendor_status AS ENUM (
  'not_registered',
  'pending',
  'registered',
  'expired'
);

-- Publishers table
CREATE TABLE publishers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  website VARCHAR(500),
  logo_url VARCHAR(500),

  -- Contact info
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),

  -- Vendor/procurement
  vendor_status vendor_status DEFAULT 'not_registered',
  vendor_id VARCHAR(50),

  -- Status
  status publisher_status DEFAULT 'pending_review',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_publishers_user_id ON publishers(user_id);
CREATE INDEX idx_publishers_status ON publishers(status);
CREATE INDEX idx_publishers_vendor_status ON publishers(vendor_status);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_publishers_updated_at
  BEFORE UPDATE ON publishers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE publishers ENABLE ROW LEVEL SECURITY;

-- Publishers can read their own data
CREATE POLICY "Users can view own publisher profile"
  ON publishers FOR SELECT
  USING (auth.uid() = user_id);

-- Publishers can update their own data
CREATE POLICY "Users can update own publisher profile"
  ON publishers FOR UPDATE
  USING (auth.uid() = user_id);

-- Publishers can insert their own profile
CREATE POLICY "Users can create own publisher profile"
  ON publishers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can do everything (for API routes)
CREATE POLICY "Service role has full access"
  ON publishers FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Authenticated users can view active publishers (for discovery)
CREATE POLICY "Authenticated users can view active publishers"
  ON publishers FOR SELECT
  USING (auth.role() = 'authenticated' AND status = 'active');

COMMENT ON TABLE publishers IS 'Community media publishers who can receive campaigns';

-- Migration: Add source, goal, and advertiser_profile to campaigns
-- Description: Supports the Advertise portal by distinguishing campaign origins
--   and storing goal-based matching presets + advertiser org info.

-- Source distinguishes which portal created the campaign
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'government';

-- Goal preset slug (e.g. 'reach_nearby_customers')
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS goal TEXT;

-- Source-specific org info as JSONB (business name, industry, mission, etc.)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS advertiser_profile JSONB DEFAULT '{}';

-- Index for filtering by source (dashboard queries)
CREATE INDEX IF NOT EXISTS idx_campaigns_source ON campaigns(source);

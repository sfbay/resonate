-- Add clerk_user_id for per-user campaign scoping.
-- The existing user_id UUID column references auth.users(id) which is
-- incompatible with Clerk's text-format user IDs. This column stores
-- the Clerk user ID directly for filtering.

ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;
CREATE INDEX IF NOT EXISTS idx_campaigns_clerk_user ON campaigns(clerk_user_id);

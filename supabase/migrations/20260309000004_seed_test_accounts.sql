-- Seed user_org_mapping for test stakeholder accounts
-- These link Clerk user/org IDs to internal Supabase entities

INSERT INTO user_org_mapping (clerk_user_id, clerk_org_id, org_type, publisher_id, city_slug, status)
VALUES
  -- Alicia Williams → The Bay View (publisher)
  ('user_3AiVE15hBrURivlvGzxOkrauIa7', 'org_3AiU71UO1fg7YGtNOAeb4WyitBs', 'publisher', '11111111-1111-1111-1111-111111111103', 'sf', 'active'),
  -- Wilma Flintstone → SF Department of Public Health (government)
  ('user_3AiV6JyZ0S08SOTBAjkmSwsPwFu', 'org_3AiUEXukBs1GinFsT8OpfZS7vLq', 'government', NULL, 'sf', 'active'),
  -- Eric Newton → Hogan, Newton & Sosumi (advertiser)
  ('user_3AiV2eZc8vVjCKiWuQ1PyeCTywx', 'org_3AiUQrs1lZH5AOyR9qpv87ptPhm', 'advertiser', NULL, 'sf', 'active')
ON CONFLICT (clerk_user_id, clerk_org_id) DO UPDATE SET
  status = 'active',
  updated_at = now();

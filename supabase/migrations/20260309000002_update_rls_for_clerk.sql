-- Migration: Update RLS policies for Clerk-authenticated users
-- Adds scoped policies while preserving anon access for public pages

-- =============================================================================
-- CAMPAIGNS: Scoped to org via user_org_mapping
-- =============================================================================

-- Allow authenticated users to see campaigns they created (via org mapping)
DROP POLICY IF EXISTS "Authenticated users can view own campaigns" ON campaigns;
CREATE POLICY "Authenticated users can view own campaigns"
  ON campaigns FOR SELECT
  USING (
    auth.jwt()->>'role' = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM user_org_mapping uom
      WHERE uom.clerk_user_id = auth.jwt()->>'sub'
      AND uom.status = 'active'
    )
  );

-- Allow authenticated users to create campaigns for their org
DROP POLICY IF EXISTS "Authenticated users can create campaigns" ON campaigns;
CREATE POLICY "Authenticated users can create campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (
    auth.jwt()->>'role' = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM user_org_mapping uom
      WHERE uom.clerk_user_id = auth.jwt()->>'sub'
      AND uom.org_type IN ('government', 'advertiser')
      AND uom.status = 'active'
    )
  );

-- =============================================================================
-- ORDERS: Visible to campaign advertiser org AND assigned publisher
-- =============================================================================

DROP POLICY IF EXISTS "Authenticated users can view own orders" ON orders;
CREATE POLICY "Authenticated users can view own orders"
  ON orders FOR SELECT
  USING (
    auth.jwt()->>'role' = 'authenticated'
    AND (
      -- Publisher can see orders assigned to them
      publisher_id IN (
        SELECT uom.publisher_id FROM user_org_mapping uom
        WHERE uom.clerk_user_id = auth.jwt()->>'sub'
        AND uom.org_type = 'publisher'
        AND uom.status = 'active'
      )
      -- Or advertiser/government can see orders for their campaigns
      OR campaign_id IN (
        SELECT c.id FROM campaigns c
        WHERE EXISTS (
          SELECT 1 FROM user_org_mapping uom
          WHERE uom.clerk_user_id = auth.jwt()->>'sub'
          AND uom.org_type IN ('government', 'advertiser')
          AND uom.status = 'active'
        )
      )
    )
  );

-- =============================================================================
-- CAMPAIGN UNITS: Scoped to campaign org or assigned publisher
-- =============================================================================

DROP POLICY IF EXISTS "Authenticated users can view own units" ON campaign_units;
CREATE POLICY "Authenticated users can view own units"
  ON campaign_units FOR SELECT
  USING (
    auth.jwt()->>'role' = 'authenticated'
    AND (
      -- Publisher can see units assigned to them
      publisher_id IN (
        SELECT uom.publisher_id FROM user_org_mapping uom
        WHERE uom.clerk_user_id = auth.jwt()->>'sub'
        AND uom.org_type = 'publisher'
        AND uom.status = 'active'
      )
      -- Or campaign owner can see all units for their campaigns
      OR campaign_id IN (
        SELECT c.id FROM campaigns c
        WHERE EXISTS (
          SELECT 1 FROM user_org_mapping uom
          WHERE uom.clerk_user_id = auth.jwt()->>'sub'
          AND uom.org_type IN ('government', 'advertiser')
          AND uom.status = 'active'
        )
      )
    )
  );

-- =============================================================================
-- REFERENCE DATA: Public read (channel_formats, market_channels, unit_templates)
-- These already have permissive SELECT policies — no changes needed
-- =============================================================================

-- =============================================================================
-- USER_ORG_MAPPING: Users see own mapping (already set in Task 5)
-- =============================================================================

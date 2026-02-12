-- Migration: Create Orders, Line Items, and Deliverables
-- Description: Full order lifecycle schema connecting campaigns to publishers
-- Depends on: campaigns, publishers, platform_type enum

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

CREATE TYPE order_status AS ENUM (
  'draft',
  'pending_publisher',
  'accepted',
  'rejected',
  'in_progress',
  'delivered',
  'completed',
  'disputed',
  'cancelled'
);

CREATE TYPE procurement_status AS ENUM (
  'not_submitted',
  'pending_approval',
  'approved',
  'po_generated',
  'invoiced',
  'paid'
);

CREATE TYPE deliverable_status AS ENUM (
  'pending',
  'submitted',
  'approved',
  'revision_requested'
);

-- =============================================================================
-- ORDERS TABLE
-- =============================================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  publisher_id UUID NOT NULL REFERENCES publishers(id) ON DELETE CASCADE,
  campaign_match_id UUID REFERENCES campaign_matches(id) ON DELETE SET NULL,

  -- Status
  status order_status NOT NULL DEFAULT 'draft',
  procurement_status procurement_status NOT NULL DEFAULT 'not_submitted',

  -- Pricing (all in cents)
  subtotal INTEGER NOT NULL DEFAULT 0,
  platform_fee INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,

  -- Details
  delivery_deadline DATE,
  purchase_order_number VARCHAR(50),
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- ORDER LINE ITEMS TABLE
-- =============================================================================

CREATE TABLE order_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parent order
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- What's being ordered
  deliverable_type VARCHAR(50) NOT NULL,
  platform platform_type NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,

  -- Pricing (in cents)
  unit_price INTEGER NOT NULL DEFAULT 0,
  total_price INTEGER NOT NULL DEFAULT 0,

  -- Details
  description TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- DELIVERABLES TABLE
-- =============================================================================

CREATE TABLE deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parent references
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_line_item_id UUID REFERENCES order_line_items(id) ON DELETE SET NULL,

  -- Content details
  platform platform_type NOT NULL,
  type VARCHAR(50) NOT NULL,
  url VARCHAR(500),
  screenshot_url VARCHAR(500),

  -- Performance metrics
  metrics JSONB,
  -- Expected structure: { impressions, reach, engagement, clicks }

  -- Status
  status deliverable_status NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_orders_campaign ON orders(campaign_id);
CREATE INDEX idx_orders_publisher ON orders(publisher_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_campaign_match ON orders(campaign_match_id) WHERE campaign_match_id IS NOT NULL;

CREATE INDEX idx_order_line_items_order ON order_line_items(order_id);

CREATE INDEX idx_deliverables_order ON deliverables(order_id);
CREATE INDEX idx_deliverables_line_item ON deliverables(order_line_item_id) WHERE order_line_item_id IS NOT NULL;
CREATE INDEX idx_deliverables_status ON deliverables(status);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;

-- Demo: allow public read access (same pattern as campaigns, matches)
DROP POLICY IF EXISTS "Allow public read orders for demo" ON orders;
CREATE POLICY "Allow public read orders for demo"
  ON orders FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public insert orders for demo" ON orders;
CREATE POLICY "Allow public insert orders for demo"
  ON orders FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update orders for demo" ON orders;
CREATE POLICY "Allow public update orders for demo"
  ON orders FOR UPDATE
  USING (true);

-- Line items
DROP POLICY IF EXISTS "Allow public read line items for demo" ON order_line_items;
CREATE POLICY "Allow public read line items for demo"
  ON order_line_items FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public insert line items for demo" ON order_line_items;
CREATE POLICY "Allow public insert line items for demo"
  ON order_line_items FOR INSERT
  WITH CHECK (true);

-- Deliverables
DROP POLICY IF EXISTS "Allow public read deliverables for demo" ON deliverables;
CREATE POLICY "Allow public read deliverables for demo"
  ON deliverables FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public insert deliverables for demo" ON deliverables;
CREATE POLICY "Allow public insert deliverables for demo"
  ON deliverables FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update deliverables for demo" ON deliverables;
CREATE POLICY "Allow public update deliverables for demo"
  ON deliverables FOR UPDATE
  USING (true);

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE orders IS 'Orders connecting campaigns to publishers with pricing and procurement status';
COMMENT ON TABLE order_line_items IS 'Individual deliverable line items within an order';
COMMENT ON TABLE deliverables IS 'Submitted deliverables tracking with metrics and approval status';
COMMENT ON COLUMN orders.subtotal IS 'Sum of line item prices in cents (publisher receives this amount)';
COMMENT ON COLUMN orders.platform_fee IS '15% service fee in cents (charged to advertiser, not deducted from publisher)';
COMMENT ON COLUMN orders.total IS 'subtotal + platform_fee in cents (total advertiser pays)';

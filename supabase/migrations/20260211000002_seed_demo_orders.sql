-- Migration: Seed Demo Orders
-- Description: Create demo campaigns, matches, and orders for The Bay View publisher
-- Seeds realistic order data across multiple lifecycle stages

-- =============================================================================
-- SEED DEMO CAMPAIGNS
-- =============================================================================

-- Campaign 1: Active health campaign from DPH
INSERT INTO campaigns (
  id, name, description, department, status,
  target_neighborhoods, target_languages, target_communities,
  budget_min, budget_max, start_date, end_date, city_slug
) VALUES (
  '22222222-2222-2222-2222-222222222201',
  'Flu Shot Awareness 2026',
  'Promote free flu vaccination clinics across SF neighborhoods, with focus on underserved communities and non-English-speaking populations.',
  'Department of Public Health',
  'active',
  ARRAY['mission', 'chinatown', 'bayview_hunters_point', 'tenderloin', 'excelsior'],
  ARRAY['english', 'spanish', 'chinese_cantonese', 'tagalog'],
  ARRAY['latino_mexican', 'chinese', 'filipino', 'black_african_american'],
  500000, 1000000,
  '2026-01-15', '2026-03-15', 'sf'
) ON CONFLICT (id) DO NOTHING;

-- Campaign 2: Pending summer programs
INSERT INTO campaigns (
  id, name, description, department, status,
  target_neighborhoods, target_languages, target_communities,
  budget_min, budget_max, start_date, end_date, city_slug
) VALUES (
  '22222222-2222-2222-2222-222222222202',
  'Summer Programs Enrollment',
  'Drive enrollment for summer youth programs in parks across the city. Focus on families with children ages 6-17.',
  'Recreation & Parks',
  'active',
  ARRAY['mission', 'bayview_hunters_point', 'excelsior', 'visitacion_valley'],
  ARRAY['english', 'spanish'],
  ARRAY['latino_mexican', 'black_african_american'],
  300000, 500000,
  '2026-04-01', '2026-06-15', 'sf'
) ON CONFLICT (id) DO NOTHING;

-- Campaign 3: Completed transit campaign
INSERT INTO campaigns (
  id, name, description, department, status,
  target_neighborhoods, target_languages, target_communities,
  budget_min, budget_max, start_date, end_date, city_slug
) VALUES (
  '22222222-2222-2222-2222-222222222203',
  'New Muni Routes — Bayview',
  'Inform Bayview-Hunters Point residents about new Muni route changes, stop relocations, and updated schedules.',
  'SFMTA',
  'completed',
  ARRAY['bayview_hunters_point', 'visitacion_valley'],
  ARRAY['english'],
  ARRAY['black_african_american'],
  200000, 400000,
  '2025-12-01', '2026-01-15', 'sf'
) ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- SEED CAMPAIGN MATCHES (The Bay View matched to each campaign)
-- =============================================================================

INSERT INTO campaign_matches (
  id, campaign_id, publisher_id,
  overall_score, geographic_score, demographic_score, economic_score, cultural_score, reach_score,
  match_details, is_selected
) VALUES
-- Bay View matched to Flu Shot campaign
(
  '33333333-3333-3333-3333-333333333301',
  '22222222-2222-2222-2222-222222222201',
  '11111111-1111-1111-1111-111111111103',
  78, 90, 70, 80, 75, 65,
  '{"matchingNeighborhoods": ["bayview_hunters_point", "visitacion_valley"], "matchingLanguages": ["english"], "reasons": ["Serves Bayview-Hunters Point", "Reaches Black community", "Strong neighborhood engagement"]}'::jsonb,
  true
),
-- Bay View matched to Summer Programs
(
  '33333333-3333-3333-3333-333333333302',
  '22222222-2222-2222-2222-222222222202',
  '11111111-1111-1111-1111-111111111103',
  72, 85, 65, 75, 70, 60,
  '{"matchingNeighborhoods": ["bayview_hunters_point", "visitacion_valley"], "matchingLanguages": ["english"], "reasons": ["Serves target neighborhoods", "Reaches families in Bayview"]}'::jsonb,
  true
),
-- Bay View matched to Muni Routes
(
  '33333333-3333-3333-3333-333333333303',
  '22222222-2222-2222-2222-222222222203',
  '11111111-1111-1111-1111-111111111103',
  85, 95, 80, 82, 80, 70,
  '{"matchingNeighborhoods": ["bayview_hunters_point", "visitacion_valley"], "matchingLanguages": ["english"], "reasons": ["Primary Bayview publisher", "Strong community trust"]}'::jsonb,
  true
)
ON CONFLICT (campaign_id, publisher_id) DO NOTHING;

-- Also match El Tecolote and Mission Local to Flu Shot campaign for variety
INSERT INTO campaign_matches (
  id, campaign_id, publisher_id,
  overall_score, geographic_score, demographic_score, economic_score, cultural_score, reach_score,
  match_details, is_selected
) VALUES
(
  '33333333-3333-3333-3333-333333333304',
  '22222222-2222-2222-2222-222222222201',
  '11111111-1111-1111-1111-111111111101',
  92, 95, 90, 85, 95, 78,
  '{"matchingNeighborhoods": ["mission", "outer_mission", "excelsior"], "matchingLanguages": ["spanish", "english"], "reasons": ["Serves Mission District", "Spanish & English content", "Strong cultural alignment with Latino community"]}'::jsonb,
  false
),
(
  '33333333-3333-3333-3333-333333333305',
  '22222222-2222-2222-2222-222222222201',
  '11111111-1111-1111-1111-111111111102',
  85, 92, 82, 78, 88, 82,
  '{"matchingNeighborhoods": ["mission", "bernal_heights"], "matchingLanguages": ["english", "spanish"], "reasons": ["Mission District hyperlocal", "Bilingual coverage", "High digital engagement"]}'::jsonb,
  false
)
ON CONFLICT (campaign_id, publisher_id) DO NOTHING;

-- =============================================================================
-- SEED ORDERS FOR THE BAY VIEW
-- =============================================================================

-- Order 1: In-progress order from DPH Flu Shot campaign
INSERT INTO orders (
  id, campaign_id, publisher_id, campaign_match_id,
  status, procurement_status,
  subtotal, platform_fee, total,
  delivery_deadline, purchase_order_number, notes,
  created_at
) VALUES (
  '44444444-4444-4444-4444-444444444401',
  '22222222-2222-2222-2222-222222222201',
  '11111111-1111-1111-1111-111111111103',
  '33333333-3333-3333-3333-333333333301',
  'in_progress', 'po_generated',
  40000, 6000, 46000,
  '2026-02-28', 'PO-DPH-26-0142',
  'Flu shot awareness posts for Bayview community — bilingual if possible',
  now() - interval '14 days'
) ON CONFLICT (id) DO NOTHING;

-- Order 1 line items
INSERT INTO order_line_items (id, order_id, deliverable_type, platform, quantity, unit_price, total_price, description) VALUES
  ('55555555-5555-5555-5555-555555555501', '44444444-4444-4444-4444-444444444401', 'sponsored_post', 'instagram', 2, 15000, 30000, 'Flu shot awareness posts — Bayview community'),
  ('55555555-5555-5555-5555-555555555502', '44444444-4444-4444-4444-444444444401', 'sponsored_post', 'facebook', 1, 10000, 10000, 'Facebook post for older demographic')
ON CONFLICT (id) DO NOTHING;

-- Order 1 deliverables (1 submitted, 2 pending)
INSERT INTO deliverables (id, order_id, order_line_item_id, platform, type, status, url, submitted_at, metrics) VALUES
  ('66666666-6666-6666-6666-666666666601', '44444444-4444-4444-4444-444444444401', '55555555-5555-5555-5555-555555555501', 'instagram', 'sponsored_post', 'submitted', 'https://instagram.com/p/bayview-flu-shot-1', now() - interval '2 days', '{"impressions": 2400, "reach": 2100, "engagement": 185, "clicks": 67}'::jsonb),
  ('66666666-6666-6666-6666-666666666602', '44444444-4444-4444-4444-444444444401', '55555555-5555-5555-5555-555555555501', 'instagram', 'sponsored_post', 'pending', NULL, NULL, NULL),
  ('66666666-6666-6666-6666-666666666603', '44444444-4444-4444-4444-444444444401', '55555555-5555-5555-5555-555555555502', 'facebook', 'sponsored_post', 'pending', NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Order 2: Pending acceptance from Recreation & Parks
INSERT INTO orders (
  id, campaign_id, publisher_id, campaign_match_id,
  status, procurement_status,
  subtotal, platform_fee, total,
  delivery_deadline, notes,
  created_at
) VALUES (
  '44444444-4444-4444-4444-444444444402',
  '22222222-2222-2222-2222-222222222202',
  '11111111-1111-1111-1111-111111111103',
  '33333333-3333-3333-3333-333333333302',
  'pending_publisher', 'approved',
  35000, 5250, 40250,
  '2026-03-31',
  'Summer programs enrollment posts for Bayview families',
  now() - interval '2 days'
) ON CONFLICT (id) DO NOTHING;

-- Order 2 line items
INSERT INTO order_line_items (id, order_id, deliverable_type, platform, quantity, unit_price, total_price, description) VALUES
  ('55555555-5555-5555-5555-555555555503', '44444444-4444-4444-4444-444444444402', 'sponsored_post', 'instagram', 1, 15000, 15000, 'Summer programs enrollment post'),
  ('55555555-5555-5555-5555-555555555504', '44444444-4444-4444-4444-444444444402', 'sponsored_post', 'facebook', 2, 10000, 20000, 'Facebook posts for parent audience')
ON CONFLICT (id) DO NOTHING;

-- Order 2 deliverables (all pending — not yet accepted)
INSERT INTO deliverables (id, order_id, order_line_item_id, platform, type, status) VALUES
  ('66666666-6666-6666-6666-666666666604', '44444444-4444-4444-4444-444444444402', '55555555-5555-5555-5555-555555555503', 'instagram', 'sponsored_post', 'pending'),
  ('66666666-6666-6666-6666-666666666605', '44444444-4444-4444-4444-444444444402', '55555555-5555-5555-5555-555555555504', 'facebook', 'sponsored_post', 'pending'),
  ('66666666-6666-6666-6666-666666666606', '44444444-4444-4444-4444-444444444402', '55555555-5555-5555-5555-555555555504', 'facebook', 'sponsored_post', 'pending')
ON CONFLICT (id) DO NOTHING;

-- Order 3: Completed order from SFMTA Muni Routes
INSERT INTO orders (
  id, campaign_id, publisher_id, campaign_match_id,
  status, procurement_status,
  subtotal, platform_fee, total,
  delivery_deadline, purchase_order_number,
  created_at
) VALUES (
  '44444444-4444-4444-4444-444444444403',
  '22222222-2222-2222-2222-222222222203',
  '11111111-1111-1111-1111-111111111103',
  '33333333-3333-3333-3333-333333333303',
  'completed', 'paid',
  25000, 3750, 28750,
  '2026-01-10', 'PO-SFMTA-25-0891',
  now() - interval '45 days'
) ON CONFLICT (id) DO NOTHING;

-- Order 3 line items
INSERT INTO order_line_items (id, order_id, deliverable_type, platform, quantity, unit_price, total_price, description) VALUES
  ('55555555-5555-5555-5555-555555555505', '44444444-4444-4444-4444-444444444403', 'sponsored_post', 'instagram', 1, 15000, 15000, 'New Muni routes announcement post'),
  ('55555555-5555-5555-5555-555555555506', '44444444-4444-4444-4444-444444444403', 'sponsored_post', 'facebook', 1, 10000, 10000, 'Facebook announcement for bus route changes')
ON CONFLICT (id) DO NOTHING;

-- Order 3 deliverables (all approved — order complete)
INSERT INTO deliverables (id, order_id, order_line_item_id, platform, type, status, url, submitted_at, approved_at, metrics) VALUES
  ('66666666-6666-6666-6666-666666666607', '44444444-4444-4444-4444-444444444403', '55555555-5555-5555-5555-555555555505', 'instagram', 'sponsored_post', 'approved', 'https://instagram.com/p/bayview-muni-routes', now() - interval '48 days', now() - interval '46 days', '{"impressions": 3100, "reach": 2700, "engagement": 234, "clicks": 112}'::jsonb),
  ('66666666-6666-6666-6666-666666666608', '44444444-4444-4444-4444-444444444403', '55555555-5555-5555-5555-555555555506', 'facebook', 'sponsored_post', 'approved', 'https://facebook.com/thebayview/posts/muni-routes', now() - interval '48 days', now() - interval '46 days', '{"impressions": 2200, "reach": 1800, "engagement": 156, "clicks": 78}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE orders IS 'Demo orders seeded for The Bay View publisher across 3 campaigns';

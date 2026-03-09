-- ============================================================
-- Campaign Matches (which publishers matched which campaigns)
-- ============================================================

-- Wilma's Vaccination campaign → Bay View + Mission Local + El Tecolote
INSERT INTO campaign_matches (id, campaign_id, publisher_id, overall_score, geographic_score, demographic_score, economic_score, cultural_score, reach_score, is_selected, match_details)
VALUES
  ('44444444-4444-4444-4444-444444444401', '22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111103', 89, 95, 85, 90, 88, 82, true, '{"matchingNeighborhoods": ["bayview-hunters-point"], "matchingLanguages": ["english"], "estimatedReach": 45000, "reasons": ["Strong Bayview coverage", "Health content track record"]}'),
  ('44444444-4444-4444-4444-444444444402', '22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111102', 82, 80, 88, 78, 85, 79, true, '{"matchingNeighborhoods": ["mission", "south-of-market"], "matchingLanguages": ["english", "spanish"], "estimatedReach": 65000, "reasons": ["Mission District expertise", "Bilingual content"]}'),
  ('44444444-4444-4444-4444-444444444403', '22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111101', 86, 88, 90, 82, 92, 75, true, '{"matchingNeighborhoods": ["mission", "excelsior"], "matchingLanguages": ["spanish"], "estimatedReach": 35000, "reasons": ["Longest-running Latino publication in SF", "Deep community trust"]}');

-- Wilma's Mental Health campaign → Bay View + 48 Hills
INSERT INTO campaign_matches (id, campaign_id, publisher_id, overall_score, geographic_score, demographic_score, economic_score, cultural_score, reach_score, is_selected, match_details)
VALUES
  ('44444444-4444-4444-4444-444444444404', '22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111103', 85, 92, 80, 88, 84, 78, true, '{"matchingNeighborhoods": ["bayview-hunters-point", "western-addition"], "matchingLanguages": ["english"], "estimatedReach": 45000, "reasons": ["Strong Black community coverage"]}'),
  ('44444444-4444-4444-4444-444444444405', '22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111111', 78, 75, 82, 72, 80, 85, true, '{"matchingNeighborhoods": ["tenderloin", "mission", "western-addition"], "matchingLanguages": ["english"], "estimatedReach": 120000, "reasons": ["Progressive audience", "Mental health advocacy coverage"]}');

-- Wilma's Nutrition campaign (completed) → Bay View + El Tecolote
INSERT INTO campaign_matches (id, campaign_id, publisher_id, overall_score, geographic_score, demographic_score, economic_score, cultural_score, reach_score, is_selected, match_details)
VALUES
  ('44444444-4444-4444-4444-444444444406', '22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111103', 91, 95, 88, 92, 90, 80, true, '{"matchingNeighborhoods": ["bayview-hunters-point", "visitacion-valley"], "matchingLanguages": ["english"], "estimatedReach": 45000, "reasons": ["Highest need community coverage"]}'),
  ('44444444-4444-4444-4444-444444444407', '22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111101', 87, 88, 92, 85, 90, 72, true, '{"matchingNeighborhoods": ["mission", "excelsior", "outer-mission"], "matchingLanguages": ["spanish"], "estimatedReach": 35000, "reasons": ["Trusted Spanish-language source"]}');

-- Eric's Tenant Rights campaign → Bay View + Mission Local
INSERT INTO campaign_matches (id, campaign_id, publisher_id, overall_score, geographic_score, demographic_score, economic_score, cultural_score, reach_score, is_selected, match_details)
VALUES
  ('44444444-4444-4444-4444-444444444408', '33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111103', 84, 90, 82, 88, 80, 78, true, '{"matchingNeighborhoods": ["bayview-hunters-point"], "matchingLanguages": ["english"], "estimatedReach": 45000, "reasons": ["High eviction rate area", "Community trust"]}'),
  ('44444444-4444-4444-4444-444444444409', '33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111102', 81, 85, 80, 82, 78, 80, true, '{"matchingNeighborhoods": ["mission", "south-of-market"], "matchingLanguages": ["english", "spanish"], "estimatedReach": 65000, "reasons": ["Housing coverage specialty"]}');

-- Eric's Immigration campaign (completed) → El Tecolote + Nichi Bei + Bay View
INSERT INTO campaign_matches (id, campaign_id, publisher_id, overall_score, geographic_score, demographic_score, economic_score, cultural_score, reach_score, is_selected, match_details)
VALUES
  ('44444444-4444-4444-4444-444444444410', '33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111101', 92, 90, 95, 88, 95, 78, true, '{"matchingNeighborhoods": ["mission", "excelsior"], "matchingLanguages": ["spanish"], "estimatedReach": 35000, "reasons": ["Primary Spanish-language outlet"]}'),
  ('44444444-4444-4444-4444-444444444411', '33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111106', 80, 75, 82, 78, 88, 72, true, '{"matchingNeighborhoods": ["western-addition", "japantown"], "matchingLanguages": ["english"], "estimatedReach": 20000, "reasons": ["AAPI immigrant community focus"]}'),
  ('44444444-4444-4444-4444-444444444412', '33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111103', 83, 88, 80, 85, 82, 76, true, '{"matchingNeighborhoods": ["bayview-hunters-point"], "matchingLanguages": ["english"], "estimatedReach": 45000, "reasons": ["Diverse immigrant readership"]}');

-- ============================================================
-- Orders
-- ============================================================

-- Wilma's Vaccination campaign orders (active → pending_publisher and accepted)
INSERT INTO orders (id, campaign_id, publisher_id, campaign_match_id, status, procurement_status, subtotal, platform_fee, total, delivery_deadline, notes, created_at)
VALUES
  ('55555555-5555-5555-5555-555555555501', '22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111103', '44444444-4444-4444-4444-444444444401', 'accepted', 'po_generated', 350000, 35000, 385000, '2026-04-15', 'Priority: Bayview community outreach', '2026-03-02 10:00:00+00'),
  ('55555555-5555-5555-5555-555555555502', '22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111102', '44444444-4444-4444-4444-444444444402', 'pending_publisher', 'not_submitted', 450000, 45000, 495000, '2026-04-15', 'Bilingual English/Spanish content needed', '2026-03-02 10:30:00+00'),
  ('55555555-5555-5555-5555-555555555503', '22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111101', '44444444-4444-4444-4444-444444444403', 'pending_publisher', 'not_submitted', 280000, 28000, 308000, '2026-04-15', 'Spanish-language vaccination messaging', '2026-03-02 11:00:00+00');

-- Wilma's Mental Health campaign orders (delivered with metrics)
INSERT INTO orders (id, campaign_id, publisher_id, campaign_match_id, status, procurement_status, subtotal, platform_fee, total, delivery_deadline, notes, created_at)
VALUES
  ('55555555-5555-5555-5555-555555555504', '22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111103', '44444444-4444-4444-4444-444444444404', 'delivered', 'invoiced', 500000, 50000, 550000, '2026-02-25', 'Mental health resources for Black community', '2026-02-05 09:00:00+00'),
  ('55555555-5555-5555-5555-555555555505', '22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444405', 'delivered', 'invoiced', 600000, 60000, 660000, '2026-02-25', 'Youth mental health focus', '2026-02-05 09:30:00+00');

-- Wilma's Nutrition campaign orders (completed)
INSERT INTO orders (id, campaign_id, publisher_id, campaign_match_id, status, procurement_status, subtotal, platform_fee, total, delivery_deadline, notes, created_at)
VALUES
  ('55555555-5555-5555-5555-555555555506', '22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111103', '44444444-4444-4444-4444-444444444406', 'delivered', 'paid', 400000, 40000, 440000, '2026-02-10', 'CalFresh enrollment outreach', '2026-01-05 10:00:00+00'),
  ('55555555-5555-5555-5555-555555555507', '22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111101', '44444444-4444-4444-4444-444444444407', 'delivered', 'paid', 300000, 30000, 330000, '2026-02-10', 'WIC program awareness in Spanish', '2026-01-05 10:30:00+00');

-- Eric's Tenant Rights campaign orders (active)
INSERT INTO orders (id, campaign_id, publisher_id, campaign_match_id, status, procurement_status, subtotal, platform_fee, total, delivery_deadline, notes, created_at)
VALUES
  ('55555555-5555-5555-5555-555555555508', '33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111103', '44444444-4444-4444-4444-444444444408', 'accepted', 'po_generated', 250000, 25000, 275000, '2026-04-15', 'Tenant rights awareness in Bayview', '2026-03-05 14:00:00+00'),
  ('55555555-5555-5555-5555-555555555509', '33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111102', '44444444-4444-4444-4444-444444444409', 'pending_publisher', 'not_submitted', 350000, 35000, 385000, '2026-04-15', 'Mission District renter outreach', '2026-03-05 14:30:00+00');

-- Eric's Immigration campaign orders (completed, delivered)
INSERT INTO orders (id, campaign_id, publisher_id, campaign_match_id, status, procurement_status, subtotal, platform_fee, total, delivery_deadline, notes, created_at)
VALUES
  ('55555555-5555-5555-5555-555555555510', '33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111101', '44444444-4444-4444-4444-444444444410', 'delivered', 'paid', 300000, 30000, 330000, '2026-02-20', 'Immigration legal aid in Spanish', '2026-01-20 11:00:00+00'),
  ('55555555-5555-5555-5555-555555555511', '33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111106', '44444444-4444-4444-4444-444444444411', 'delivered', 'paid', 200000, 20000, 220000, '2026-02-20', 'AAPI immigration resources', '2026-01-20 11:30:00+00'),
  ('55555555-5555-5555-5555-555555555512', '33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111103', '44444444-4444-4444-4444-444444444412', 'delivered', 'paid', 280000, 28000, 308000, '2026-02-20', 'Bayview immigrant community outreach', '2026-01-20 12:00:00+00');

-- ============================================================
-- Order Line Items
-- ============================================================

-- Bay View order for Vaccination campaign (accepted)
INSERT INTO order_line_items (id, order_id, deliverable_type, platform, quantity, unit_price, total_price, description)
VALUES
  ('66666666-6666-6666-6666-666666666601', '55555555-5555-5555-5555-555555555501', 'social_post', 'instagram', 3, 75000, 225000, 'Instagram feed posts — vaccination awareness'),
  ('66666666-6666-6666-6666-666666666602', '55555555-5555-5555-5555-555555555501', 'newsletter_mention', 'email', 2, 62500, 125000, 'Newsletter mentions with vaccination CTA');

-- Bay View order for Mental Health campaign (delivered)
INSERT INTO order_line_items (id, order_id, deliverable_type, platform, quantity, unit_price, total_price, description)
VALUES
  ('66666666-6666-6666-6666-666666666603', '55555555-5555-5555-5555-555555555504', 'social_post', 'instagram', 4, 75000, 300000, 'Instagram posts — mental health resources'),
  ('66666666-6666-6666-6666-666666666604', '55555555-5555-5555-5555-555555555504', 'sponsored_article', 'website', 1, 200000, 200000, 'Sponsored article on community mental health');

-- Bay View order for Nutrition campaign (completed/paid)
INSERT INTO order_line_items (id, order_id, deliverable_type, platform, quantity, unit_price, total_price, description)
VALUES
  ('66666666-6666-6666-6666-666666666605', '55555555-5555-5555-5555-555555555506', 'social_post', 'instagram', 3, 75000, 225000, 'CalFresh enrollment social posts'),
  ('66666666-6666-6666-6666-666666666606', '55555555-5555-5555-5555-555555555506', 'newsletter_mention', 'email', 2, 87500, 175000, 'Newsletter features on nutrition programs');

-- Bay View order for Tenant Rights (Eric, accepted)
INSERT INTO order_line_items (id, order_id, deliverable_type, platform, quantity, unit_price, total_price, description)
VALUES
  ('66666666-6666-6666-6666-666666666607', '55555555-5555-5555-5555-555555555508', 'social_post', 'instagram', 2, 75000, 150000, 'Tenant rights awareness posts'),
  ('66666666-6666-6666-6666-666666666608', '55555555-5555-5555-5555-555555555508', 'newsletter_mention', 'email', 1, 100000, 100000, 'Know your rights newsletter feature');

-- Bay View order for Immigration (Eric, delivered/paid)
INSERT INTO order_line_items (id, order_id, deliverable_type, platform, quantity, unit_price, total_price, description)
VALUES
  ('66666666-6666-6666-6666-666666666609', '55555555-5555-5555-5555-555555555512', 'social_post', 'instagram', 2, 75000, 150000, 'Immigration legal aid social posts'),
  ('66666666-6666-6666-6666-666666666610', '55555555-5555-5555-5555-555555555512', 'sponsored_article', 'website', 1, 130000, 130000, 'Immigration resources guide article');

-- ============================================================
-- Campaign Units (the Phase 3+ deliverable model)
-- ============================================================

-- Vaccination campaign units for Bay View (accepted)
INSERT INTO campaign_units (id, campaign_id, publisher_id, channel_group, format_key, platform, placement, status, creative_assets, compliance_notes, tier, deadline, payout_cents)
VALUES
  ('77777777-7777-7777-7777-777777777701', '22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111103', 'social', 'static_image', 'instagram', 'feed_post', 'accepted', '{"headline": "Protect Your Community", "bodyText": "Free vaccinations available at Bayview Community Health Center. Walk-ins welcome every Saturday.", "ctaText": "Find a location", "ctaUrl": "https://sf.gov/vaccinations", "hashtags": ["#SFHealth", "#BayviewStrong", "#VaxUp"]}', 'Instagram requires Paid Partnership tag for sponsored content', 'free_template', '2026-04-15', 75000),
  ('77777777-7777-7777-7777-777777777702', '22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111103', 'social', 'story', 'instagram', 'story', 'accepted', '{"headline": "Get Vaccinated Today", "bodyText": "No appointment needed. Free for all SF residents.", "ctaText": "Swipe up", "ctaUrl": "https://sf.gov/vaccinations", "hashtags": ["#SFHealth"]}', 'Story must include Paid Partnership label', 'free_template', '2026-04-15', 50000),
  ('77777777-7777-7777-7777-777777777703', '22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111103', 'social', 'newsletter_mention', 'mailchimp', 'mention', 'accepted', '{"headline": "Spring Vaccination Drive", "bodyText": "SF DPH is offering free vaccinations at community health centers across the Bayview. Walk-ins welcome every Saturday through April.", "ctaText": "Find your nearest center →", "ctaUrl": "https://sf.gov/vaccinations"}', 'Must include "Sponsored" disclosure', 'free_template', '2026-04-15', 62500);

-- Mental Health campaign units for Bay View (delivered with proof + metrics)
INSERT INTO campaign_units (id, campaign_id, publisher_id, channel_group, format_key, platform, placement, status, creative_assets, compliance_notes, tier, deadline, payout_cents, proof)
VALUES
  ('77777777-7777-7777-7777-777777777704', '22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111103', 'social', 'static_image', 'instagram', 'feed_post', 'delivered', '{"headline": "It''s OK to Not Be OK", "bodyText": "Free counseling available for Bayview residents. Confidential. Culturally competent. In your neighborhood.", "ctaText": "Get support", "ctaUrl": "https://sf.gov/mental-health", "hashtags": ["#MentalHealthMatters", "#BayviewCares"]}', 'Paid Partnership tag required', 'premium_template', '2026-02-25', 75000, '{"postUrl": "https://instagram.com/p/example1", "screenshot": "https://storage.example.com/proof/mh-post1.png", "publishedAt": "2026-02-18T10:00:00Z", "metrics": {"impressions": 12400, "reach": 8200, "engagement": 890, "clicks": 340}}'),
  ('77777777-7777-7777-7777-777777777705', '22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111103', 'social', 'static_image', 'instagram', 'feed_post', 'delivered', '{"headline": "Talk About It", "bodyText": "Mental health is health. Join the conversation. Free resources for youth and adults in the Bayview.", "ctaText": "Learn more", "ctaUrl": "https://sf.gov/mental-health", "hashtags": ["#MentalHealthMatters", "#SFYouth"]}', 'Paid Partnership tag required', 'free_template', '2026-02-25', 75000, '{"postUrl": "https://instagram.com/p/example2", "screenshot": "https://storage.example.com/proof/mh-post2.png", "publishedAt": "2026-02-20T14:00:00Z", "metrics": {"impressions": 9800, "reach": 6500, "engagement": 720, "clicks": 280}}'),
  ('77777777-7777-7777-7777-777777777706', '22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111103', 'display', 'sponsored_article', 'website', 'article', 'delivered', '{"headline": "Breaking the Silence: Mental Health in the Bayview", "bodyText": "A sponsored feature on community mental health resources, culturally competent care, and breaking stigma.", "ctaText": "Read the full story", "ctaUrl": "https://sf.gov/mental-health"}', 'Must include Sponsored Content disclosure', 'assisted', '2026-02-25', 200000, '{"postUrl": "https://bayviewpaper.com/mental-health-resources-2026", "publishedAt": "2026-02-22T08:00:00Z", "metrics": {"impressions": 4500, "reach": 3800, "engagement": 220, "clicks": 580}}');

-- Nutrition campaign units for Bay View (delivered, completed campaign)
INSERT INTO campaign_units (id, campaign_id, publisher_id, channel_group, format_key, platform, placement, status, creative_assets, compliance_notes, tier, deadline, payout_cents, proof)
VALUES
  ('77777777-7777-7777-7777-777777777707', '22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111103', 'social', 'static_image', 'instagram', 'feed_post', 'delivered', '{"headline": "Feed Your Family for Free", "bodyText": "You may qualify for CalFresh. $234/month average benefit for SF families. Apply today — we can help.", "ctaText": "Check eligibility", "ctaUrl": "https://sf.gov/calfresh", "hashtags": ["#CalFresh", "#FeedSF"]}', 'Paid Partnership tag required', 'free_template', '2026-02-10', 75000, '{"postUrl": "https://instagram.com/p/example3", "publishedAt": "2026-02-01T11:00:00Z", "metrics": {"impressions": 15200, "reach": 10100, "engagement": 1100, "clicks": 520}}'),
  ('77777777-7777-7777-7777-777777777708', '22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111103', 'social', 'newsletter_mention', 'mailchimp', 'mention', 'delivered', '{"headline": "CalFresh & WIC: Are You Eligible?", "bodyText": "Thousands of SF families qualify for nutrition assistance but haven''t applied. Check your eligibility in 5 minutes.", "ctaText": "Check now →", "ctaUrl": "https://sf.gov/calfresh"}', 'Sponsored disclosure required', 'free_template', '2026-02-10', 87500, '{"publishedAt": "2026-02-05T06:00:00Z", "metrics": {"impressions": 8900, "reach": 8900, "engagement": 450, "clicks": 380}}');

-- Eric's Tenant Rights units for Bay View (accepted, in production)
INSERT INTO campaign_units (id, campaign_id, publisher_id, channel_group, format_key, platform, placement, status, creative_assets, compliance_notes, tier, deadline, payout_cents)
VALUES
  ('77777777-7777-7777-7777-777777777709', '33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111103', 'social', 'static_image', 'instagram', 'feed_post', 'in_production', '{"headline": "Know Your Rights as a Renter", "bodyText": "SF has some of the strongest tenant protections in the country. Learn what your landlord can and can''t do.", "ctaText": "Know your rights", "ctaUrl": "https://hogannewton.com/tenant-rights", "hashtags": ["#TenantRights", "#SFRenters"]}', 'Paid Partnership tag required', 'free_template', '2026-04-15', 75000),
  ('77777777-7777-7777-7777-777777777710', '33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111103', 'social', 'newsletter_mention', 'mailchimp', 'mention', 'accepted', '{"headline": "Free Legal Help for SF Renters", "bodyText": "Hogan, Newton & Sosumi offers free monthly legal clinics for tenants facing eviction, rent increases, or habitability issues.", "ctaText": "Book a consultation →", "ctaUrl": "https://hogannewton.com/clinics"}', 'Sponsored disclosure required', 'free_template', '2026-04-15', 100000);

-- Eric's Immigration units for Bay View (delivered, completed)
INSERT INTO campaign_units (id, campaign_id, publisher_id, channel_group, format_key, platform, placement, status, creative_assets, compliance_notes, tier, deadline, payout_cents, proof)
VALUES
  ('77777777-7777-7777-7777-777777777711', '33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111103', 'social', 'static_image', 'instagram', 'feed_post', 'delivered', '{"headline": "Immigration Help is Here", "bodyText": "Free and low-cost immigration legal services available. Confidential consultations in English, Spanish, Chinese.", "ctaText": "Get help", "ctaUrl": "https://hogannewton.com/immigration", "hashtags": ["#ImmigrationHelp", "#SFImmigrants"]}', 'Paid Partnership tag required', 'free_template', '2026-02-20', 75000, '{"postUrl": "https://instagram.com/p/example4", "publishedAt": "2026-02-10T09:00:00Z", "metrics": {"impressions": 11000, "reach": 7200, "engagement": 650, "clicks": 290}}'),
  ('77777777-7777-7777-7777-777777777712', '33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111103', 'display', 'sponsored_article', 'website', 'article', 'delivered', '{"headline": "Your Guide to Immigration Legal Resources in SF", "bodyText": "Comprehensive guide to free immigration legal services, DACA renewals, and asylum support in San Francisco.", "ctaText": "Read the guide", "ctaUrl": "https://hogannewton.com/immigration-guide"}', 'Sponsored Content disclosure required', 'assisted', '2026-02-20', 130000, '{"postUrl": "https://bayviewpaper.com/immigration-legal-guide", "publishedAt": "2026-02-15T08:00:00Z", "metrics": {"impressions": 5200, "reach": 4400, "engagement": 310, "clicks": 620}}');

-- ============================================================
-- Wilma's Government Campaigns (SF Department of Public Health)
-- ============================================================

-- Campaign 1: Draft — Community Wellness Fair
INSERT INTO campaigns (
  id, name, description, department, status,
  target_neighborhoods, target_languages, target_communities,
  target_age_ranges, target_income_levels,
  budget_min, budget_max, start_date, end_date,
  city_slug, source
) VALUES (
  '22222222-2222-2222-2222-222222222201',
  'Community Wellness Fair 2026',
  'Promote the annual SF Community Wellness Fair with free health screenings, vaccination booths, and mental health resources. Target underserved neighborhoods with multilingual outreach.',
  'SF Department of Public Health',
  'draft',
  ARRAY['bayview-hunters-point', 'tenderloin', 'mission', 'excelsior', 'visitacion-valley'],
  ARRAY['english', 'spanish', 'chinese', 'tagalog'],
  ARRAY['low-income-families', 'seniors', 'immigrant-communities'],
  ARRAY['25-34', '35-44', '45-54', '55-64', '65+'],
  ARRAY['extremely-low', 'very-low', 'low'],
  5000, 15000,
  '2026-04-15', '2026-05-15',
  'sf', 'government'
)
ON CONFLICT (id) DO NOTHING;

-- Campaign 2: Active with orders — Vaccination Outreach
INSERT INTO campaigns (
  id, name, description, department, status,
  target_neighborhoods, target_languages, target_communities,
  target_age_ranges, target_income_levels,
  budget_min, budget_max, start_date, end_date,
  city_slug, source
) VALUES (
  '22222222-2222-2222-2222-222222222202',
  'Spring Vaccination Drive',
  'Multilingual vaccination awareness campaign targeting communities with low vaccination rates. Partner with trusted community media to deliver culturally relevant messaging.',
  'SF Department of Public Health',
  'active',
  ARRAY['bayview-hunters-point', 'chinatown', 'tenderloin', 'south-of-market'],
  ARRAY['english', 'spanish', 'chinese', 'vietnamese'],
  ARRAY['seniors', 'immigrant-communities', 'public-housing-residents'],
  ARRAY['45-54', '55-64', '65+'],
  ARRAY['extremely-low', 'very-low', 'low'],
  8000, 20000,
  '2026-03-01', '2026-04-30',
  'sf', 'government'
)
ON CONFLICT (id) DO NOTHING;

-- Campaign 3: Delivered with performance data — Mental Health Awareness
INSERT INTO campaigns (
  id, name, description, department, status,
  target_neighborhoods, target_languages, target_communities,
  target_age_ranges, target_income_levels,
  budget_min, budget_max, start_date, end_date,
  city_slug, source
) VALUES (
  '22222222-2222-2222-2222-222222222203',
  'Mental Health Awareness Month',
  'May is Mental Health Awareness Month. Campaign to destigmatize mental health conversations in communities of color and connect residents to free counseling resources.',
  'SF Department of Public Health',
  'active',
  ARRAY['bayview-hunters-point', 'mission', 'western-addition', 'tenderloin', 'excelsior'],
  ARRAY['english', 'spanish', 'chinese'],
  ARRAY['youth', 'communities-of-color', 'lgbtq'],
  ARRAY['18-24', '25-34', '35-44'],
  ARRAY['very-low', 'low', 'moderate'],
  10000, 25000,
  '2026-02-01', '2026-03-01',
  'sf', 'government'
)
ON CONFLICT (id) DO NOTHING;

-- Campaign 4: Completed — Nutrition Program Enrollment
INSERT INTO campaigns (
  id, name, description, department, status,
  target_neighborhoods, target_languages, target_communities,
  target_age_ranges, target_income_levels,
  budget_min, budget_max, start_date, end_date,
  city_slug, source
) VALUES (
  '22222222-2222-2222-2222-222222222204',
  'CalFresh & WIC Enrollment Drive',
  'Increase enrollment in CalFresh and WIC nutrition assistance programs. Target eligible families through community media in languages they trust.',
  'SF Department of Public Health',
  'completed',
  ARRAY['bayview-hunters-point', 'excelsior', 'visitacion-valley', 'outer-mission', 'mission'],
  ARRAY['english', 'spanish', 'chinese', 'tagalog'],
  ARRAY['low-income-families', 'immigrant-communities', 'single-parents'],
  ARRAY['25-34', '35-44'],
  ARRAY['extremely-low', 'very-low'],
  6000, 12000,
  '2026-01-01', '2026-02-15',
  'sf', 'government'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Eric's Advertiser Campaigns (Hogan, Newton & Sosumi)
-- ============================================================

-- Campaign 5: Draft — Pro Bono Legal Clinics
INSERT INTO campaigns (
  id, name, description, department, status,
  target_neighborhoods, target_languages, target_communities,
  target_age_ranges, target_income_levels,
  budget_min, budget_max, start_date, end_date,
  city_slug, source
) VALUES (
  '33333333-3333-3333-3333-333333333301',
  'Free Legal Clinics — Know Your Rights',
  'Promote free monthly legal clinics offering consultations on tenant rights, immigration, employment law, and family law. Reach communities most in need of legal aid.',
  'Hogan, Newton & Sosumi, Attorneys at Law',
  'draft',
  ARRAY['tenderloin', 'mission', 'chinatown', 'south-of-market', 'bayview-hunters-point'],
  ARRAY['english', 'spanish', 'chinese'],
  ARRAY['immigrant-communities', 'low-income-families', 'tenants'],
  ARRAY['25-34', '35-44', '45-54'],
  ARRAY['extremely-low', 'very-low', 'low'],
  3000, 8000,
  '2026-04-01', '2026-06-30',
  'sf', 'advertise'
)
ON CONFLICT (id) DO NOTHING;

-- Campaign 6: Active — Tenant Rights Campaign
INSERT INTO campaigns (
  id, name, description, department, status,
  target_neighborhoods, target_languages, target_communities,
  target_age_ranges, target_income_levels,
  budget_min, budget_max, start_date, end_date,
  city_slug, source
) VALUES (
  '33333333-3333-3333-3333-333333333302',
  'Tenant Rights Awareness — SF Renters',
  'Inform SF renters about their rights under local rent control and just cause eviction protections. Partner with community media serving neighborhoods with highest eviction rates.',
  'Hogan, Newton & Sosumi, Attorneys at Law',
  'active',
  ARRAY['mission', 'tenderloin', 'south-of-market', 'western-addition', 'bayview-hunters-point'],
  ARRAY['english', 'spanish'],
  ARRAY['tenants', 'low-income-families'],
  ARRAY['25-34', '35-44', '45-54', '55-64'],
  ARRAY['very-low', 'low', 'moderate'],
  5000, 12000,
  '2026-03-01', '2026-04-30',
  'sf', 'advertise'
)
ON CONFLICT (id) DO NOTHING;

-- Campaign 7: Delivered — Immigration Legal Aid
INSERT INTO campaigns (
  id, name, description, department, status,
  target_neighborhoods, target_languages, target_communities,
  target_age_ranges, target_income_levels,
  budget_min, budget_max, start_date, end_date,
  city_slug, source
) VALUES (
  '33333333-3333-3333-3333-333333333303',
  'Immigration Legal Aid Resources',
  'Connect immigrant communities with free and low-cost immigration legal services. Multilingual campaign through trusted community media outlets.',
  'Hogan, Newton & Sosumi, Attorneys at Law',
  'completed',
  ARRAY['mission', 'chinatown', 'excelsior', 'tenderloin', 'outer-sunset'],
  ARRAY['english', 'spanish', 'chinese', 'tagalog', 'vietnamese'],
  ARRAY['immigrant-communities', 'undocumented-residents', 'refugees'],
  ARRAY['18-24', '25-34', '35-44', '45-54'],
  ARRAY['extremely-low', 'very-low', 'low'],
  4000, 10000,
  '2026-01-15', '2026-03-01',
  'sf', 'advertise'
)
ON CONFLICT (id) DO NOTHING;

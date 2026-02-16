-- Migration: Seed Chicagoland audience profiles
-- Description: Inserts realistic, differentiated audience profiles for the 8 seeded
-- Chicagoland publishers. Uses community area IDs in the neighborhoods column
-- (the matching algorithm treats these as generic strings).

-- ─────────────────────────────────────────────────
-- Chicago Defender — South & West Side Black communities
-- ─────────────────────────────────────────────────
INSERT INTO audience_profiles (
  publisher_id, neighborhoods, languages, ethnicities,
  income_levels, age_ranges, citywide, verification_level, confidence_score
) VALUES (
  '22222222-2222-2222-2222-222222222101',
  ARRAY['englewood', 'south_shore', 'chatham', 'auburn_gresham', 'grand_boulevard', 'woodlawn', 'austin', 'west_garfield_park', 'roseland'],
  ARRAY['english'],
  ARRAY['black'],
  ARRAY['very_low', 'low', 'moderate'],
  ARRAY['35-44', '45-54', '55-64', '65+'],
  false,
  'partial',
  78
) ON CONFLICT (publisher_id) DO UPDATE SET
  neighborhoods = EXCLUDED.neighborhoods,
  languages = EXCLUDED.languages,
  ethnicities = EXCLUDED.ethnicities,
  income_levels = EXCLUDED.income_levels,
  age_ranges = EXCLUDED.age_ranges,
  citywide = EXCLUDED.citywide,
  verification_level = EXCLUDED.verification_level,
  confidence_score = EXCLUDED.confidence_score,
  last_updated = now();

-- ─────────────────────────────────────────────────
-- South Side Weekly — South Side diverse communities
-- ─────────────────────────────────────────────────
INSERT INTO audience_profiles (
  publisher_id, neighborhoods, languages, ethnicities,
  income_levels, age_ranges, citywide, verification_level, confidence_score
) VALUES (
  '22222222-2222-2222-2222-222222222102',
  ARRAY['hyde_park', 'woodlawn', 'south_shore', 'kenwood', 'grand_boulevard', 'washington_park', 'bridgeport', 'mckinley_park', 'pilsen'],
  ARRAY['english', 'spanish'],
  ARRAY['black', 'latino_mexican', 'white'],
  ARRAY['very_low', 'low', 'moderate'],
  ARRAY['18-24', '25-34', '35-44'],
  false,
  'verified',
  82
) ON CONFLICT (publisher_id) DO UPDATE SET
  neighborhoods = EXCLUDED.neighborhoods,
  languages = EXCLUDED.languages,
  ethnicities = EXCLUDED.ethnicities,
  income_levels = EXCLUDED.income_levels,
  age_ranges = EXCLUDED.age_ranges,
  citywide = EXCLUDED.citywide,
  verification_level = EXCLUDED.verification_level,
  confidence_score = EXCLUDED.confidence_score,
  last_updated = now();

-- ─────────────────────────────────────────────────
-- Block Club Chicago — Citywide neighborhood news
-- ─────────────────────────────────────────────────
INSERT INTO audience_profiles (
  publisher_id, neighborhoods, languages, ethnicities,
  income_levels, age_ranges, citywide, verification_level, confidence_score
) VALUES (
  '22222222-2222-2222-2222-222222222103',
  ARRAY[]::text[],
  ARRAY['english'],
  ARRAY['white', 'black', 'latino_mexican', 'asian_chinese', 'asian_korean'],
  ARRAY['low', 'moderate', 'above_moderate'],
  ARRAY['25-34', '35-44', '45-54'],
  true,
  'verified',
  90
) ON CONFLICT (publisher_id) DO UPDATE SET
  neighborhoods = EXCLUDED.neighborhoods,
  languages = EXCLUDED.languages,
  ethnicities = EXCLUDED.ethnicities,
  income_levels = EXCLUDED.income_levels,
  age_ranges = EXCLUDED.age_ranges,
  citywide = EXCLUDED.citywide,
  verification_level = EXCLUDED.verification_level,
  confidence_score = EXCLUDED.confidence_score,
  last_updated = now();

-- ─────────────────────────────────────────────────
-- La Raza — Pilsen/Little Village/Back of the Yards
-- Spanish-language, Latino community
-- ─────────────────────────────────────────────────
INSERT INTO audience_profiles (
  publisher_id, neighborhoods, languages, ethnicities,
  income_levels, age_ranges, citywide, verification_level, confidence_score
) VALUES (
  '22222222-2222-2222-2222-222222222104',
  ARRAY['south_lawndale', 'lower_west_side', 'new_city', 'brighton_park', 'gage_park', 'chicago_lawn', 'west_lawn', 'humboldt_park'],
  ARRAY['spanish', 'english'],
  ARRAY['latino_mexican', 'latino_central_american'],
  ARRAY['very_low', 'low', 'moderate'],
  ARRAY['25-34', '35-44', '45-54', '55-64'],
  false,
  'partial',
  76
) ON CONFLICT (publisher_id) DO UPDATE SET
  neighborhoods = EXCLUDED.neighborhoods,
  languages = EXCLUDED.languages,
  ethnicities = EXCLUDED.ethnicities,
  income_levels = EXCLUDED.income_levels,
  age_ranges = EXCLUDED.age_ranges,
  citywide = EXCLUDED.citywide,
  verification_level = EXCLUDED.verification_level,
  confidence_score = EXCLUDED.confidence_score,
  last_updated = now();

-- ─────────────────────────────────────────────────
-- Windy City Times — LGBTQ+, citywide
-- ─────────────────────────────────────────────────
INSERT INTO audience_profiles (
  publisher_id, neighborhoods, languages, ethnicities,
  income_levels, age_ranges, citywide, verification_level, confidence_score
) VALUES (
  '22222222-2222-2222-2222-222222222105',
  ARRAY['lake_view', 'lincoln_park', 'near_north_side', 'logan_square', 'uptown', 'edgewater', 'rogers_park', 'andersonville'],
  ARRAY['english'],
  ARRAY['white', 'black', 'latino_mexican'],
  ARRAY['moderate', 'above_moderate'],
  ARRAY['25-34', '35-44', '45-54'],
  true,
  'verified',
  84
) ON CONFLICT (publisher_id) DO UPDATE SET
  neighborhoods = EXCLUDED.neighborhoods,
  languages = EXCLUDED.languages,
  ethnicities = EXCLUDED.ethnicities,
  income_levels = EXCLUDED.income_levels,
  age_ranges = EXCLUDED.age_ranges,
  citywide = EXCLUDED.citywide,
  verification_level = EXCLUDED.verification_level,
  confidence_score = EXCLUDED.confidence_score,
  last_updated = now();

-- ─────────────────────────────────────────────────
-- Hyde Park Herald — Hyde Park/Kenwood/Woodlawn
-- ─────────────────────────────────────────────────
INSERT INTO audience_profiles (
  publisher_id, neighborhoods, languages, ethnicities,
  income_levels, age_ranges, citywide, verification_level, confidence_score
) VALUES (
  '22222222-2222-2222-2222-222222222106',
  ARRAY['hyde_park', 'kenwood', 'woodlawn', 'south_shore'],
  ARRAY['english'],
  ARRAY['white', 'black', 'asian_south_asian'],
  ARRAY['moderate', 'above_moderate'],
  ARRAY['35-44', '45-54', '55-64', '65+'],
  false,
  'verified',
  88
) ON CONFLICT (publisher_id) DO UPDATE SET
  neighborhoods = EXCLUDED.neighborhoods,
  languages = EXCLUDED.languages,
  ethnicities = EXCLUDED.ethnicities,
  income_levels = EXCLUDED.income_levels,
  age_ranges = EXCLUDED.age_ranges,
  citywide = EXCLUDED.citywide,
  verification_level = EXCLUDED.verification_level,
  confidence_score = EXCLUDED.confidence_score,
  last_updated = now();

-- ─────────────────────────────────────────────────
-- Daily Herald — Suburban: Cook, DuPage, Kane, Lake counties
-- ─────────────────────────────────────────────────
INSERT INTO audience_profiles (
  publisher_id, neighborhoods, languages, ethnicities,
  income_levels, age_ranges, citywide, verification_level, confidence_score
) VALUES (
  '22222222-2222-2222-2222-222222222107',
  ARRAY['naperville', 'aurora', 'elgin', 'schaumburg', 'arlington_heights', 'wheaton', 'downers_grove', 'palatine'],
  ARRAY['english'],
  ARRAY['white', 'asian_south_asian', 'latino_mexican'],
  ARRAY['moderate', 'above_moderate'],
  ARRAY['35-44', '45-54', '55-64'],
  true,
  'partial',
  70
) ON CONFLICT (publisher_id) DO UPDATE SET
  neighborhoods = EXCLUDED.neighborhoods,
  languages = EXCLUDED.languages,
  ethnicities = EXCLUDED.ethnicities,
  income_levels = EXCLUDED.income_levels,
  age_ranges = EXCLUDED.age_ranges,
  citywide = EXCLUDED.citywide,
  verification_level = EXCLUDED.verification_level,
  confidence_score = EXCLUDED.confidence_score,
  last_updated = now();

-- ─────────────────────────────────────────────────
-- Evanston RoundTable — Evanston, North Shore
-- ─────────────────────────────────────────────────
INSERT INTO audience_profiles (
  publisher_id, neighborhoods, languages, ethnicities,
  income_levels, age_ranges, citywide, verification_level, confidence_score
) VALUES (
  '22222222-2222-2222-2222-222222222108',
  ARRAY['evanston', 'rogers_park', 'west_ridge', 'edgewater'],
  ARRAY['english'],
  ARRAY['white', 'black'],
  ARRAY['moderate', 'above_moderate'],
  ARRAY['35-44', '45-54', '55-64', '65+'],
  false,
  'verified',
  86
) ON CONFLICT (publisher_id) DO UPDATE SET
  neighborhoods = EXCLUDED.neighborhoods,
  languages = EXCLUDED.languages,
  ethnicities = EXCLUDED.ethnicities,
  income_levels = EXCLUDED.income_levels,
  age_ranges = EXCLUDED.age_ranges,
  citywide = EXCLUDED.citywide,
  verification_level = EXCLUDED.verification_level,
  confidence_score = EXCLUDED.confidence_score,
  last_updated = now();

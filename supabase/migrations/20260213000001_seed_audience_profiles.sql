-- Migration: Seed audience profiles for demo publishers
-- Description: Inserts realistic, differentiated audience profiles for the 4 seeded
-- publishers so the matching algorithm produces meaningful geographic differentiation.
-- Also adds an anon-read RLS policy for demo mode (no auth).

-- ─────────────────────────────────────────────────
-- Anon RLS policy for demo mode
-- ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow anon read audience profiles for demo" ON audience_profiles;
CREATE POLICY "Allow anon read audience profiles for demo"
  ON audience_profiles FOR SELECT USING (true);

-- ─────────────────────────────────────────────────
-- El Tecolote — Mission/Excelsior/Outer Mission/Visitacion Valley
-- Bilingual Spanish-English, Latino community since 1970
-- ─────────────────────────────────────────────────
INSERT INTO audience_profiles (
  publisher_id, neighborhoods, languages, ethnicities,
  income_levels, age_ranges, citywide, verification_level, confidence_score
) VALUES (
  '11111111-1111-1111-1111-111111111101',
  ARRAY['mission', 'excelsior', 'outer_mission', 'visitacion_valley'],
  ARRAY['spanish', 'english'],
  ARRAY['latino_mexican', 'latino_central_american'],
  ARRAY['very_low', 'low', 'moderate'],
  ARRAY['35-44', '45-54', '55-64'],
  false,
  'partial',
  72
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
-- Mission Local — Mission/Bernal Heights/Excelsior/Outer Mission
-- English-first with Spanish, diverse Mission coverage
-- ─────────────────────────────────────────────────
INSERT INTO audience_profiles (
  publisher_id, neighborhoods, languages, ethnicities,
  income_levels, age_ranges, citywide, verification_level, confidence_score
) VALUES (
  '11111111-1111-1111-1111-111111111102',
  ARRAY['mission', 'bernal_heights', 'excelsior', 'outer_mission'],
  ARRAY['english', 'spanish'],
  ARRAY['latino_mexican', 'latino_central_american'],
  ARRAY['low', 'moderate'],
  ARRAY['25-34', '35-44', '45-54'],
  false,
  'verified',
  85
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
-- The Bay View — Bayview-Hunters Point/Visitacion Valley/Western Addition/Oceanview/Ingleside
-- English, Black African American community
-- ─────────────────────────────────────────────────
INSERT INTO audience_profiles (
  publisher_id, neighborhoods, languages, ethnicities,
  income_levels, age_ranges, citywide, verification_level, confidence_score
) VALUES (
  '11111111-1111-1111-1111-111111111103',
  ARRAY['bayview_hunters_point', 'visitacion_valley', 'western_addition', 'oceanview', 'ingleside'],
  ARRAY['english'],
  ARRAY['black_african_american'],
  ARRAY['very_low', 'low', 'moderate'],
  ARRAY['25-34', '35-44', '45-54', '55-64'],
  false,
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
-- 48 Hills — Mission/Haight-Ashbury/SoMa/Western Addition/Castro/Tenderloin
-- English, progressive citywide, arts & culture
-- ─────────────────────────────────────────────────
INSERT INTO audience_profiles (
  publisher_id, neighborhoods, languages, ethnicities,
  income_levels, age_ranges, citywide, verification_level, confidence_score
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  ARRAY['mission', 'haight_ashbury', 'soma', 'western_addition', 'castro', 'tenderloin'],
  ARRAY['english'],
  ARRAY['white_european', 'latino_mexican'],
  ARRAY['low', 'moderate'],
  ARRAY['25-34', '35-44', '45-54'],
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

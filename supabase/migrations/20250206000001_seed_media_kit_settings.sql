-- Migration: Seed Media Kit Settings for Demo Publishers
-- Description: Creates media_kit_settings rows for 3 showcase publishers
-- so that /media-kit/<slug> renders a branded page.

-- Allow anon/public to read media kit settings for demo
-- (Drop first in case it already exists from a previous run)
DROP POLICY IF EXISTS "Allow public read media kit for demo" ON media_kit_settings;
CREATE POLICY "Allow public read media kit for demo"
  ON media_kit_settings FOR SELECT
  USING (
    publisher_id IN (SELECT id FROM publishers WHERE status = 'active')
  );

-- El Tecolote
INSERT INTO media_kit_settings (
  publisher_id, custom_slug, visibility,
  show_follower_counts, show_engagement_rates, show_growth_metrics,
  show_audience_demographics, show_top_content, show_badges,
  headline, bio, mission_statement,
  accent_color, show_contact_email, contact_email
)
VALUES (
  '11111111-1111-1111-1111-111111111101',
  'el-tecolote',
  'public',
  true, true, true,
  true, true, true,
  'Bilingual Community Voice Since 1970',
  'El Tecolote is the longest-running bilingual newspaper in San Francisco, serving the Latino community with culturally relevant journalism since 1970. Published in partnership with SF State journalism students.',
  'Amplifying Latino voices and connecting communities through bilingual storytelling.',
  '#E8552D',
  true, 'editor@eltecolote.org'
)
ON CONFLICT (publisher_id) DO UPDATE SET
  custom_slug = EXCLUDED.custom_slug,
  visibility = EXCLUDED.visibility,
  headline = EXCLUDED.headline,
  bio = EXCLUDED.bio,
  mission_statement = EXCLUDED.mission_statement,
  accent_color = EXCLUDED.accent_color,
  show_contact_email = EXCLUDED.show_contact_email,
  contact_email = EXCLUDED.contact_email,
  updated_at = now();

-- Mission Local
INSERT INTO media_kit_settings (
  publisher_id, custom_slug, visibility,
  show_follower_counts, show_engagement_rates, show_growth_metrics,
  show_audience_demographics, show_top_content, show_badges,
  headline, bio, mission_statement,
  accent_color, show_contact_email, contact_email
)
VALUES (
  '11111111-1111-1111-1111-111111111102',
  'mission-local',
  'public',
  true, true, true,
  true, true, true,
  'In-Depth Mission District Journalism',
  'Mission Local is a nonprofit news site covering San Francisco''s Mission neighborhood. Our reporters deliver in-depth investigations, breaking news, and community stories that mainstream outlets miss.',
  'Keeping the Mission informed through dedicated local journalism.',
  '#2D8B7E',
  true, 'tips@missionlocal.org'
)
ON CONFLICT (publisher_id) DO UPDATE SET
  custom_slug = EXCLUDED.custom_slug,
  visibility = EXCLUDED.visibility,
  headline = EXCLUDED.headline,
  bio = EXCLUDED.bio,
  mission_statement = EXCLUDED.mission_statement,
  accent_color = EXCLUDED.accent_color,
  show_contact_email = EXCLUDED.show_contact_email,
  contact_email = EXCLUDED.contact_email,
  updated_at = now();

-- 48 Hills
INSERT INTO media_kit_settings (
  publisher_id, custom_slug, visibility,
  show_follower_counts, show_engagement_rates, show_growth_metrics,
  show_audience_demographics, show_top_content, show_badges,
  headline, bio, mission_statement,
  accent_color, show_contact_email, contact_email
)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '48-hills',
  'public',
  true, true, true,
  true, true, true,
  'Progressive News, Arts & Culture',
  '48 Hills is San Francisco''s progressive online magazine covering politics, arts, nightlife, and culture. We champion the creative and activist communities that make SF unique.',
  'Telling the stories that define San Francisco''s progressive identity.',
  '#6B4FA0',
  true, 'tips@48hills.org'
)
ON CONFLICT (publisher_id) DO UPDATE SET
  custom_slug = EXCLUDED.custom_slug,
  visibility = EXCLUDED.visibility,
  headline = EXCLUDED.headline,
  bio = EXCLUDED.bio,
  mission_statement = EXCLUDED.mission_statement,
  accent_color = EXCLUDED.accent_color,
  show_contact_email = EXCLUDED.show_contact_email,
  contact_email = EXCLUDED.contact_email,
  updated_at = now();

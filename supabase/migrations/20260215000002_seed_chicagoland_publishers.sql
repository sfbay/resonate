-- Migration: Seed Chicagoland Publisher Data
-- Description: Populates database with real Chicagoland community media publishers
-- spanning city and suburban outlets for Phase 1 launch.
-- UUIDs follow 22222222-2222-2222-2222-2222222221XX pattern

-- ============================================================================
-- PUBLISHERS: 8 Chicagoland community media outlets
-- ============================================================================

INSERT INTO publishers (id, name, description, website, logo_url, contact_email, status, created_at)
VALUES
  -- Chicago Defender (Black community, South Side)
  ('22222222-2222-2222-2222-222222222101',
   'Chicago Defender',
   'Historic Black newspaper covering Chicago''s South and West Side communities since 1905. America''s most influential Black newspaper.',
   'https://chicagodefender.com',
   '/images/publishers/chicago-defender.png',
   'editor@chicagodefender.com',
   'active',
   NOW() - INTERVAL '180 days'),

  -- South Side Weekly (South Side, diverse communities)
  ('22222222-2222-2222-2222-222222222102',
   'South Side Weekly',
   'Free alternative newspaper covering Chicago''s South Side neighborhoods with in-depth community journalism.',
   'https://southsideweekly.com',
   '/images/publishers/south-side-weekly.png',
   'editor@southsideweekly.com',
   'active',
   NOW() - INTERVAL '150 days'),

  -- Block Club Chicago (neighborhood news, citywide)
  ('22222222-2222-2222-2222-222222222103',
   'Block Club Chicago',
   'Nonprofit neighborhood news organization covering all 77 Chicago community areas with hyperlocal reporting.',
   'https://blockclubchicago.org',
   '/images/publishers/block-club-chicago.png',
   'tips@blockclubchicago.org',
   'active',
   NOW() - INTERVAL '200 days'),

  -- La Raza (Latino, Pilsen/Little Village/Back of the Yards)
  ('22222222-2222-2222-2222-222222222104',
   'La Raza',
   'Spanish-language newspaper serving Chicago''s Latino communities in Pilsen, Little Village, and Back of the Yards since 1970.',
   'https://laraza.com',
   '/images/publishers/la-raza.png',
   'redaccion@laraza.com',
   'active',
   NOW() - INTERVAL '160 days'),

  -- Windy City Times (LGBTQ+, citywide)
  ('22222222-2222-2222-2222-222222222105',
   'Windy City Times',
   'Chicago''s longest-running LGBTQ+ publication covering community news, politics, and culture since 1985.',
   'https://windycitytimes.com',
   '/images/publishers/windy-city-times.png',
   'editor@windycitytimes.com',
   'active',
   NOW() - INTERVAL '140 days'),

  -- Hyde Park Herald (Hyde Park/Kenwood)
  ('22222222-2222-2222-2222-222222222106',
   'Hyde Park Herald',
   'Community newspaper covering Hyde Park, Kenwood, and Woodlawn since 1882. Oldest continuously published community paper in Chicago.',
   'https://hpherald.com',
   '/images/publishers/hyde-park-herald.png',
   'editor@hpherald.com',
   'active',
   NOW() - INTERVAL '120 days'),

  -- Daily Herald (suburban Cook, DuPage, Kane, Lake counties)
  ('22222222-2222-2222-2222-222222222107',
   'Daily Herald',
   'Chicagoland''s largest suburban daily newspaper serving Cook, DuPage, Kane, and Lake counties since 1872.',
   'https://dailyherald.com',
   '/images/publishers/daily-herald.png',
   'newsroom@dailyherald.com',
   'active',
   NOW() - INTERVAL '190 days'),

  -- Evanston RoundTable (Evanston, North Shore)
  ('22222222-2222-2222-2222-222222222108',
   'Evanston RoundTable',
   'Independent community news covering Evanston and the North Shore with in-depth local government and education reporting.',
   'https://evanstonroundtable.com',
   '/images/publishers/evanston-roundtable.png',
   'editor@evanstonroundtable.com',
   'active',
   NOW() - INTERVAL '100 days')

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  status = EXCLUDED.status;

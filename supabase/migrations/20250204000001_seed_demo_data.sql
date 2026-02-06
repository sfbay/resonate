-- Migration: Seed Demo Data for Monday Coalition Meeting
-- Description: Populates database with real SF coalition publishers from SFIMC
-- This seed data enables the dashboard demo with authentic metrics

-- ============================================================================
-- PUBLISHERS: 13 real SF coalition members from SFIMC
-- ============================================================================

INSERT INTO publishers (id, name, description, website, logo_url, contact_email, status, created_at)
VALUES
  -- El Tecolote
  ('11111111-1111-1111-1111-111111111101',
   'El Tecolote',
   'Bilingual newspaper serving SF''s Latino community since 1970. Published with SF State journalism students.',
   'https://eltecolote.org',
   '/images/publishers/el-tecolote.png',
   'editor@eltecolote.org',
   'active',
   NOW() - INTERVAL '180 days'),

  -- Mission Local
  ('11111111-1111-1111-1111-111111111102',
   'Mission Local',
   'Nonprofit news covering SF''s Mission neighborhood with in-depth local reporting and investigations.',
   'https://missionlocal.org',
   '/images/publishers/mission-local.png',
   'tips@missionlocal.org',
   'active',
   NOW() - INTERVAL '150 days'),

  -- The Bay View
  ('11111111-1111-1111-1111-111111111103',
   'The Bay View',
   'San Francisco''s Black newspaper, covering Bayview-Hunters Point and Black communities since 1976.',
   'https://sfbayview.com',
   '/images/publishers/bay-view.png',
   'editor@sfbayview.com',
   'active',
   NOW() - INTERVAL '200 days'),

  -- SF Public Press
  ('11111111-1111-1111-1111-111111111104',
   'SF Public Press',
   'Nonprofit investigative newsroom producing deep-dive reporting on housing, government, and public safety.',
   'https://www.sfpublicpress.org',
   '/images/publishers/sf-public-press.png',
   'tips@sfpublicpress.org',
   'active',
   NOW() - INTERVAL '120 days'),

  -- Bay Area Reporter
  ('11111111-1111-1111-1111-111111111105',
   'Bay Area Reporter',
   'The nation''s oldest continuously published LGBTQ+ newspaper, serving the Bay Area since 1971.',
   'https://ebar.com',
   '/images/publishers/bay-area-reporter.png',
   'news@ebar.com',
   'active',
   NOW() - INTERVAL '90 days'),

  -- Nichi Bei
  ('11111111-1111-1111-1111-111111111106',
   'Nichi Bei',
   'Covering Japanese American news since 1899, with roots in SF''s historic Japantown community.',
   'https://nichibei.org',
   '/images/publishers/nichi-bei.png',
   'news@nichibei.org',
   'active',
   NOW() - INTERVAL '160 days'),

  -- J. Weekly
  ('11111111-1111-1111-1111-111111111107',
   'J. The Jewish News of Northern California',
   'The Jewish community''s news source for the Bay Area since 1895, covering culture, politics, and community life.',
   'https://jweekly.com',
   '/images/publishers/j-weekly.png',
   'editor@jweekly.com',
   'active',
   NOW() - INTERVAL '140 days'),

  -- Richmond Review
  ('11111111-1111-1111-1111-111111111108',
   'Richmond Review',
   'Neighborhood newspaper serving San Francisco''s Richmond District with local news and community coverage.',
   'https://sfrichmondreview.com',
   '/images/publishers/richmond-review.png',
   'editor@sfrichmondreview.com',
   'active',
   NOW() - INTERVAL '100 days'),

  -- Sunset Beacon
  ('11111111-1111-1111-1111-111111111109',
   'Sunset Beacon',
   'Neighborhood newspaper serving San Francisco''s Sunset District, sister publication to the Richmond Review.',
   'https://sfrichmondreview.com/sunset-beacon/',
   '/images/publishers/sunset-beacon.png',
   'editor@sfrichmondreview.com',
   'active',
   NOW() - INTERVAL '100 days'),

  -- Wind Newspaper
  ('11111111-1111-1111-1111-111111111110',
   'Wind Newspaper',
   'Community newspaper serving Visitacion Valley and the Filipino community in San Francisco.',
   'https://windnewspaper.com',
   '/images/publishers/wind-newspaper.png',
   'editor@windnewspaper.com',
   'active',
   NOW() - INTERVAL '80 days'),

  -- 48 Hills
  ('11111111-1111-1111-1111-111111111111',
   '48 Hills',
   'Progressive online news and culture magazine covering San Francisco politics, arts, and nightlife.',
   'https://48hills.org',
   '/images/publishers/48-hills.png',
   'tips@48hills.org',
   'active',
   NOW() - INTERVAL '130 days'),

  -- Broke-Ass Stuart
  ('11111111-1111-1111-1111-111111111112',
   'Broke-Ass Stuart',
   'Alternative culture and lifestyle site celebrating San Francisco''s creative, budget-conscious spirit.',
   'https://brokeassstuart.com',
   '/images/publishers/broke-ass-stuart.png',
   'stuart@brokeassstuart.com',
   'active',
   NOW() - INTERVAL '110 days'),

  -- Ingleside Light
  ('11111111-1111-1111-1111-111111111113',
   'Ingleside Light',
   'Hyperlocal news covering San Francisco''s Ingleside neighborhood and surrounding communities.',
   'https://www.inglesidelight.com',
   '/images/publishers/ingleside-light.png',
   'tips@inglesidelight.com',
   'active',
   NOW() - INTERVAL '70 days');

-- ============================================================================
-- PLATFORM CONNECTIONS: 3-4 connected platforms per publisher (demo as active)
-- ============================================================================

INSERT INTO platform_connections (id, publisher_id, platform, handle, url, status, verified, verification_method, connected_at, last_synced_at)
VALUES
  -- El Tecolote: Instagram, Facebook, Twitter (mapped to Facebook for demo)
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'instagram', '@eltecolote', 'https://instagram.com/eltecolote', 'active', true, 'oauth', NOW() - INTERVAL '45 days', NOW() - INTERVAL '2 hours'),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111101', 'facebook', 'eltecolote', 'https://facebook.com/eltecolote', 'active', true, 'oauth', NOW() - INTERVAL '45 days', NOW() - INTERVAL '2 hours'),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111101', 'mailchimp', 'El Tecolote Newsletter', NULL, 'active', true, 'oauth', NOW() - INTERVAL '30 days', NOW() - INTERVAL '6 hours'),

  -- Mission Local: Instagram, Facebook, Twitter, Newsletter
  ('22222222-2222-2222-2222-222222222211', '11111111-1111-1111-1111-111111111102', 'instagram', '@missionlocalsf', 'https://instagram.com/missionlocalsf', 'active', true, 'oauth', NOW() - INTERVAL '60 days', NOW() - INTERVAL '1 hour'),
  ('22222222-2222-2222-2222-222222222212', '11111111-1111-1111-1111-111111111102', 'facebook', 'missionlocal', 'https://facebook.com/missionlocal', 'active', true, 'oauth', NOW() - INTERVAL '60 days', NOW() - INTERVAL '1 hour'),
  ('22222222-2222-2222-2222-222222222213', '11111111-1111-1111-1111-111111111102', 'mailchimp', 'Mission Local Daily', NULL, 'active', true, 'oauth', NOW() - INTERVAL '50 days', NOW() - INTERVAL '4 hours'),
  ('22222222-2222-2222-2222-222222222214', '11111111-1111-1111-1111-111111111102', 'tiktok', '@missionlocal', 'https://tiktok.com/@missionlocal', 'active', true, 'oauth', NOW() - INTERVAL '20 days', NOW() - INTERVAL '3 hours'),

  -- The Bay View: Facebook, Instagram
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111103', 'facebook', 'sfbayview', 'https://facebook.com/sfbayview', 'active', true, 'oauth', NOW() - INTERVAL '90 days', NOW() - INTERVAL '3 hours'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111103', 'instagram', '@sfbayview', 'https://instagram.com/sfbayview', 'active', true, 'oauth', NOW() - INTERVAL '40 days', NOW() - INTERVAL '4 hours'),

  -- SF Public Press: Facebook, Instagram, Newsletter
  ('22222222-2222-2222-2222-222222222231', '11111111-1111-1111-1111-111111111104', 'facebook', 'sfpublicpress', 'https://facebook.com/sfpublicpress', 'active', true, 'oauth', NOW() - INTERVAL '55 days', NOW() - INTERVAL '2 hours'),
  ('22222222-2222-2222-2222-222222222232', '11111111-1111-1111-1111-111111111104', 'instagram', '@sfpublicpress', 'https://instagram.com/sfpublicpress', 'active', true, 'oauth', NOW() - INTERVAL '55 days', NOW() - INTERVAL '2 hours'),
  ('22222222-2222-2222-2222-222222222233', '11111111-1111-1111-1111-111111111104', 'mailchimp', 'SF Public Press Weekly', NULL, 'active', true, 'oauth', NOW() - INTERVAL '45 days', NOW() - INTERVAL '5 hours'),

  -- Bay Area Reporter: Instagram, Facebook, Newsletter
  ('22222222-2222-2222-2222-222222222241', '11111111-1111-1111-1111-111111111105', 'instagram', '@bayareareporter', 'https://instagram.com/bayareareporter', 'active', true, 'oauth', NOW() - INTERVAL '35 days', NOW() - INTERVAL '1 hour'),
  ('22222222-2222-2222-2222-222222222242', '11111111-1111-1111-1111-111111111105', 'facebook', 'bayareareporter', 'https://facebook.com/bayareareporter', 'active', true, 'oauth', NOW() - INTERVAL '35 days', NOW() - INTERVAL '1 hour'),
  ('22222222-2222-2222-2222-222222222243', '11111111-1111-1111-1111-111111111105', 'substack', 'B.A.R. Newsletter', NULL, 'active', true, 'oauth', NOW() - INTERVAL '25 days', NOW() - INTERVAL '4 hours'),

  -- Nichi Bei: Facebook, Instagram
  ('22222222-2222-2222-2222-222222222251', '11111111-1111-1111-1111-111111111106', 'facebook', 'nichibei', 'https://facebook.com/nichibei', 'active', true, 'oauth', NOW() - INTERVAL '65 days', NOW() - INTERVAL '5 hours'),
  ('22222222-2222-2222-2222-222222222252', '11111111-1111-1111-1111-111111111106', 'instagram', '@nichibei', 'https://instagram.com/nichibei', 'active', true, 'oauth', NOW() - INTERVAL '30 days', NOW() - INTERVAL '3 hours'),

  -- J. Weekly: Instagram, Facebook, Newsletter
  ('22222222-2222-2222-2222-222222222261', '11111111-1111-1111-1111-111111111107', 'instagram', '@jweeklysf', 'https://instagram.com/jweeklysf', 'active', true, 'oauth', NOW() - INTERVAL '40 days', NOW() - INTERVAL '2 hours'),
  ('22222222-2222-2222-2222-222222222262', '11111111-1111-1111-1111-111111111107', 'facebook', 'jweekly', 'https://facebook.com/jweekly', 'active', true, 'oauth', NOW() - INTERVAL '40 days', NOW() - INTERVAL '2 hours'),
  ('22222222-2222-2222-2222-222222222263', '11111111-1111-1111-1111-111111111107', 'mailchimp', 'J. Weekly Newsletter', NULL, 'active', true, 'oauth', NOW() - INTERVAL '30 days', NOW() - INTERVAL '6 hours'),

  -- Richmond Review: Facebook only
  ('22222222-2222-2222-2222-222222222271', '11111111-1111-1111-1111-111111111108', 'facebook', 'richmondreviewsf', 'https://facebook.com/richmondreviewsf', 'active', true, 'oauth', NOW() - INTERVAL '50 days', NOW() - INTERVAL '8 hours'),

  -- Sunset Beacon: Facebook only
  ('22222222-2222-2222-2222-222222222281', '11111111-1111-1111-1111-111111111109', 'facebook', 'sunsetbeaconsf', 'https://facebook.com/sunsetbeaconsf', 'active', true, 'oauth', NOW() - INTERVAL '50 days', NOW() - INTERVAL '8 hours'),

  -- Wind Newspaper: Facebook
  ('22222222-2222-2222-2222-222222222291', '11111111-1111-1111-1111-111111111110', 'facebook', 'windnewspaper', 'https://facebook.com/windnewspaper', 'active', true, 'oauth', NOW() - INTERVAL '25 days', NOW() - INTERVAL '6 hours'),

  -- 48 Hills: Instagram, Facebook, TikTok
  ('22222222-2222-2222-2222-222222222301', '11111111-1111-1111-1111-111111111111', 'instagram', '@48hillssf', 'https://instagram.com/48hillssf', 'active', true, 'oauth', NOW() - INTERVAL '45 days', NOW() - INTERVAL '1 hour'),
  ('22222222-2222-2222-2222-222222222302', '11111111-1111-1111-1111-111111111111', 'facebook', '48hillssf', 'https://facebook.com/48hillssf', 'active', true, 'oauth', NOW() - INTERVAL '45 days', NOW() - INTERVAL '1 hour'),
  ('22222222-2222-2222-2222-222222222303', '11111111-1111-1111-1111-111111111111', 'tiktok', '@48hills', 'https://tiktok.com/@48hills', 'active', true, 'oauth', NOW() - INTERVAL '15 days', NOW() - INTERVAL '2 hours'),

  -- Broke-Ass Stuart: Instagram, Facebook, TikTok
  ('22222222-2222-2222-2222-222222222311', '11111111-1111-1111-1111-111111111112', 'instagram', '@brokeassstuart', 'https://instagram.com/brokeassstuart', 'active', true, 'oauth', NOW() - INTERVAL '55 days', NOW() - INTERVAL '1 hour'),
  ('22222222-2222-2222-2222-222222222312', '11111111-1111-1111-1111-111111111112', 'facebook', 'brokeassstuart', 'https://facebook.com/brokeassstuart', 'active', true, 'oauth', NOW() - INTERVAL '55 days', NOW() - INTERVAL '1 hour'),
  ('22222222-2222-2222-2222-222222222313', '11111111-1111-1111-1111-111111111112', 'tiktok', '@brokeassstuart', 'https://tiktok.com/@brokeassstuart', 'active', true, 'oauth', NOW() - INTERVAL '30 days', NOW() - INTERVAL '3 hours'),

  -- Ingleside Light: Facebook, Instagram
  ('22222222-2222-2222-2222-222222222321', '11111111-1111-1111-1111-111111111113', 'facebook', 'inglesidelight', 'https://facebook.com/inglesidelight', 'active', true, 'oauth', NOW() - INTERVAL '35 days', NOW() - INTERVAL '4 hours'),
  ('22222222-2222-2222-2222-222222222322', '11111111-1111-1111-1111-111111111113', 'instagram', '@inglesidelight', 'https://instagram.com/inglesidelight', 'active', true, 'oauth', NOW() - INTERVAL '20 days', NOW() - INTERVAL '3 hours');


-- ============================================================================
-- METRICS SNAPSHOTS: 30 days of realistic data per platform
-- Using a function to generate time series data
-- ============================================================================

-- Helper function to generate metrics time series
CREATE OR REPLACE FUNCTION generate_demo_metrics() RETURNS void AS $$
DECLARE
  pub RECORD;
  conn RECORD;
  day_offset INT;
  base_followers INT;
  base_engagement DECIMAL;
  daily_growth DECIMAL;
  noise DECIMAL;
BEGIN
  -- Loop through each publisher connection
  FOR conn IN
    SELECT pc.*, p.name as publisher_name
    FROM platform_connections pc
    JOIN publishers p ON pc.publisher_id = p.id
  LOOP
    -- Set base metrics based on platform and publisher
    CASE conn.platform
      WHEN 'instagram' THEN
        base_followers := 5000 + (random() * 15000)::INT;
        base_engagement := 3.0 + random() * 5.0;
      WHEN 'facebook' THEN
        base_followers := 8000 + (random() * 25000)::INT;
        base_engagement := 1.5 + random() * 3.0;
      WHEN 'tiktok' THEN
        base_followers := 2000 + (random() * 10000)::INT;
        base_engagement := 5.0 + random() * 8.0;
      WHEN 'mailchimp' THEN
        base_followers := 3000 + (random() * 12000)::INT;
        base_engagement := 25.0 + random() * 15.0; -- open rate
      WHEN 'substack' THEN
        base_followers := 2000 + (random() * 8000)::INT;
        base_engagement := 30.0 + random() * 20.0; -- open rate
      ELSE
        base_followers := 1000 + (random() * 5000)::INT;
        base_engagement := 2.0 + random() * 3.0;
    END CASE;

    -- Generate 30 days of metrics
    FOR day_offset IN 0..30 LOOP
      -- Add some random daily variation
      daily_growth := 1 + (random() * 0.02 - 0.005); -- -0.5% to +1.5% daily
      noise := random() * 0.2 - 0.1; -- +/- 10% noise

      INSERT INTO metrics_snapshots (
        publisher_id, platform, recorded_at,
        follower_count, engagement_rate,
        avg_likes, avg_comments, avg_shares,
        subscriber_count, open_rate, click_rate
      )
      VALUES (
        conn.publisher_id,
        conn.platform,
        NOW() - (day_offset || ' days')::INTERVAL,
        (base_followers * (1 + day_offset * 0.003) * (1 + noise * 0.1))::INT,
        CASE WHEN conn.platform IN ('mailchimp', 'substack')
          THEN base_engagement * (1 + noise)
          ELSE base_engagement * (1 + noise)
        END,
        CASE WHEN conn.platform IN ('instagram', 'facebook', 'tiktok')
          THEN (base_followers * base_engagement / 100 * (1 + noise))::INT
          ELSE NULL
        END,
        CASE WHEN conn.platform IN ('instagram', 'facebook', 'tiktok')
          THEN (base_followers * base_engagement / 100 * 0.1 * (1 + noise))::INT
          ELSE NULL
        END,
        CASE WHEN conn.platform IN ('instagram', 'facebook', 'tiktok')
          THEN (base_followers * base_engagement / 100 * 0.02 * (1 + noise))::INT
          ELSE NULL
        END,
        CASE WHEN conn.platform IN ('mailchimp', 'substack')
          THEN (base_followers * (1 + day_offset * 0.002))::INT
          ELSE NULL
        END,
        CASE WHEN conn.platform IN ('mailchimp', 'substack')
          THEN base_engagement * (1 + noise)
          ELSE NULL
        END,
        CASE WHEN conn.platform IN ('mailchimp', 'substack')
          THEN base_engagement * 0.15 * (1 + noise)
          ELSE NULL
        END
      );

      -- Update base for next day
      base_followers := (base_followers * daily_growth)::INT;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT generate_demo_metrics();

-- Clean up the helper function
DROP FUNCTION generate_demo_metrics();


-- ============================================================================
-- GROWTH SNAPSHOTS: Monthly aggregates for growth charts
-- ============================================================================

INSERT INTO growth_snapshots (publisher_id, platform, snapshot_date, period_type, followers_start, followers_end, net_growth, growth_rate_percent, posts_published)
SELECT
  ms.publisher_id,
  ms.platform,
  DATE_TRUNC('day', NOW())::DATE,
  'monthly'::growth_period_type,
  (SELECT follower_count FROM metrics_snapshots m2
   WHERE m2.publisher_id = ms.publisher_id
   AND m2.platform = ms.platform
   ORDER BY recorded_at ASC LIMIT 1) as followers_start,
  (SELECT follower_count FROM metrics_snapshots m3
   WHERE m3.publisher_id = ms.publisher_id
   AND m3.platform = ms.platform
   ORDER BY recorded_at DESC LIMIT 1) as followers_end,
  (SELECT follower_count FROM metrics_snapshots m3
   WHERE m3.publisher_id = ms.publisher_id
   AND m3.platform = ms.platform
   ORDER BY recorded_at DESC LIMIT 1) -
  (SELECT follower_count FROM metrics_snapshots m2
   WHERE m2.publisher_id = ms.publisher_id
   AND m2.platform = ms.platform
   ORDER BY recorded_at ASC LIMIT 1) as net_growth,
  ROUND(
    ((SELECT follower_count FROM metrics_snapshots m3
      WHERE m3.publisher_id = ms.publisher_id
      AND m3.platform = ms.platform
      ORDER BY recorded_at DESC LIMIT 1)::DECIMAL -
     (SELECT follower_count FROM metrics_snapshots m2
      WHERE m2.publisher_id = ms.publisher_id
      AND m2.platform = ms.platform
      ORDER BY recorded_at ASC LIMIT 1)) /
    NULLIF((SELECT follower_count FROM metrics_snapshots m2
     WHERE m2.publisher_id = ms.publisher_id
     AND m2.platform = ms.platform
     ORDER BY recorded_at ASC LIMIT 1), 0) * 100, 2
  ) as growth_rate_percent,
  (15 + random() * 30)::INT as posts_published
FROM metrics_snapshots ms
GROUP BY ms.publisher_id, ms.platform;

-- Also insert weekly snapshots for 7-day growth
INSERT INTO growth_snapshots (publisher_id, platform, snapshot_date, period_type, followers_start, followers_end, net_growth, growth_rate_percent, posts_published)
SELECT
  ms.publisher_id,
  ms.platform,
  DATE_TRUNC('day', NOW())::DATE,
  'weekly'::growth_period_type,
  (SELECT follower_count FROM metrics_snapshots m2
   WHERE m2.publisher_id = ms.publisher_id
   AND m2.platform = ms.platform
   AND m2.recorded_at >= NOW() - INTERVAL '7 days'
   ORDER BY recorded_at ASC LIMIT 1) as followers_start,
  (SELECT follower_count FROM metrics_snapshots m3
   WHERE m3.publisher_id = ms.publisher_id
   AND m3.platform = ms.platform
   ORDER BY recorded_at DESC LIMIT 1) as followers_end,
  (SELECT follower_count FROM metrics_snapshots m3
   WHERE m3.publisher_id = ms.publisher_id
   AND m3.platform = ms.platform
   ORDER BY recorded_at DESC LIMIT 1) -
  COALESCE((SELECT follower_count FROM metrics_snapshots m2
   WHERE m2.publisher_id = ms.publisher_id
   AND m2.platform = ms.platform
   AND m2.recorded_at >= NOW() - INTERVAL '7 days'
   ORDER BY recorded_at ASC LIMIT 1), 0) as net_growth,
  ROUND(
    ((SELECT follower_count FROM metrics_snapshots m3
      WHERE m3.publisher_id = ms.publisher_id
      AND m3.platform = ms.platform
      ORDER BY recorded_at DESC LIMIT 1)::DECIMAL -
     COALESCE((SELECT follower_count FROM metrics_snapshots m2
      WHERE m2.publisher_id = ms.publisher_id
      AND m2.platform = ms.platform
      AND m2.recorded_at >= NOW() - INTERVAL '7 days'
      ORDER BY recorded_at ASC LIMIT 1), 0)) /
    NULLIF(COALESCE((SELECT follower_count FROM metrics_snapshots m2
     WHERE m2.publisher_id = ms.publisher_id
     AND m2.platform = ms.platform
     AND m2.recorded_at >= NOW() - INTERVAL '7 days'
     ORDER BY recorded_at ASC LIMIT 1), 1), 0) * 100, 2
  ) as growth_rate_percent,
  (5 + random() * 10)::INT as posts_published
FROM metrics_snapshots ms
GROUP BY ms.publisher_id, ms.platform;


-- ============================================================================
-- GROWTH BADGES: Award Rising Star badges to growing publishers
-- ============================================================================

-- Mission Local gets Gold Rising Star (daily news, high engagement)
INSERT INTO growth_badges (publisher_id, badge_type, tier, platform, status, criteria_met)
VALUES
  ('11111111-1111-1111-1111-111111111102', 'rising_star', 'gold', 'instagram', 'active',
   '{"metric": "growth_rate_30d", "value": 28.5, "threshold": 25, "followers": 12500}'::JSONB);

-- 48 Hills gets Silver Rising Star (progressive outlet with growing TikTok)
INSERT INTO growth_badges (publisher_id, badge_type, tier, platform, status, criteria_met)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'rising_star', 'silver', 'tiktok', 'active',
   '{"metric": "growth_rate_30d", "value": 22.3, "threshold": 20, "followers": 8500}'::JSONB);

-- Broke-Ass Stuart gets Bronze Rising Star
INSERT INTO growth_badges (publisher_id, badge_type, tier, platform, status, criteria_met)
VALUES
  ('11111111-1111-1111-1111-111111111112', 'rising_star', 'bronze', 'instagram', 'active',
   '{"metric": "growth_rate_30d", "value": 15.8, "threshold": 10, "followers": 15000}'::JSONB);

-- El Tecolote gets Engagement Leader (bilingual community engagement)
INSERT INTO growth_badges (publisher_id, badge_type, tier, platform, status, criteria_met)
VALUES
  ('11111111-1111-1111-1111-111111111101', 'engagement_leader', 'gold', NULL, 'active',
   '{"metric": "avg_engagement_rate", "value": 7.2, "threshold": 5.0, "top_percentile": 5}'::JSONB);

-- SF Public Press gets Verified Publisher (all platforms connected)
INSERT INTO growth_badges (publisher_id, badge_type, tier, platform, status, criteria_met)
VALUES
  ('11111111-1111-1111-1111-111111111104', 'verified_publisher', NULL, NULL, 'active',
   '{"platforms_connected": 3, "all_verified": true}'::JSONB);


-- ============================================================================
-- CONTENT PERFORMANCE: Sample posts with engagement data
-- ============================================================================

-- Helper function to generate content performance
CREATE OR REPLACE FUNCTION generate_demo_content() RETURNS void AS $$
DECLARE
  conn RECORD;
  post_num INT;
  post_date TIMESTAMPTZ;
  base_likes INT;
  base_comments INT;
  post_type content_type;
BEGIN
  FOR conn IN
    SELECT pc.publisher_id, pc.platform
    FROM platform_connections pc
    WHERE pc.platform IN ('instagram', 'facebook', 'tiktok')
  LOOP
    -- Generate 10-20 posts per platform connection
    FOR post_num IN 1..(10 + (random() * 10)::INT) LOOP
      post_date := NOW() - (random() * 30 || ' days')::INTERVAL;

      -- Vary post type by platform
      CASE conn.platform
        WHEN 'instagram' THEN
          post_type := (ARRAY['post', 'reel', 'story', 'carousel'])[1 + (random() * 3)::INT];
        WHEN 'tiktok' THEN
          post_type := 'video';
        ELSE
          post_type := 'post';
      END CASE;

      -- Base engagement varies by post type
      CASE post_type
        WHEN 'reel' THEN
          base_likes := 200 + (random() * 2000)::INT;
          base_comments := 10 + (random() * 100)::INT;
        WHEN 'video' THEN
          base_likes := 300 + (random() * 3000)::INT;
          base_comments := 20 + (random() * 150)::INT;
        ELSE
          base_likes := 50 + (random() * 500)::INT;
          base_comments := 5 + (random() * 50)::INT;
      END CASE;

      INSERT INTO content_performance (
        publisher_id, platform, content_id, content_type,
        published_at, caption_excerpt,
        impressions, reach, likes, comments, shares, saves,
        video_views, engagement_rate, media_type
      )
      VALUES (
        conn.publisher_id,
        conn.platform,
        'post_' || conn.publisher_id || '_' || post_num,
        post_type,
        post_date,
        'Sample post content about local community news and events...',
        base_likes * (8 + random() * 4)::INT,
        base_likes * (5 + random() * 3)::INT,
        base_likes,
        base_comments,
        (base_likes * 0.05 * random())::INT,
        (base_likes * 0.1 * random())::INT,
        CASE WHEN post_type IN ('reel', 'video') THEN base_likes * (3 + random() * 5)::INT ELSE NULL END,
        ROUND((base_likes + base_comments * 3)::DECIMAL / (base_likes * 5) * 100, 2),
        CASE post_type
          WHEN 'reel' THEN 'video'
          WHEN 'video' THEN 'video'
          WHEN 'carousel' THEN 'carousel'
          ELSE 'image'
        END
      );
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

SELECT generate_demo_content();
DROP FUNCTION generate_demo_content();


-- ============================================================================
-- Create an RLS policy bypass for demo mode (anonymous can read)
-- This allows the dashboard to display without auth during demo
-- ============================================================================

-- Allow anon/public to read active publishers for demo
CREATE POLICY "Allow public read for demo"
  ON publishers FOR SELECT
  USING (status = 'active');

-- Allow anon/public to read connections of active publishers
CREATE POLICY "Allow public read connections for demo"
  ON platform_connections FOR SELECT
  USING (
    publisher_id IN (SELECT id FROM publishers WHERE status = 'active')
  );

-- Allow anon/public to read metrics for demo
CREATE POLICY "Allow public read metrics for demo"
  ON metrics_snapshots FOR SELECT
  USING (
    publisher_id IN (SELECT id FROM publishers WHERE status = 'active')
  );

-- Allow anon/public to read growth snapshots for demo
CREATE POLICY "Allow public read growth for demo"
  ON growth_snapshots FOR SELECT
  USING (
    publisher_id IN (SELECT id FROM publishers WHERE status = 'active')
  );

-- Allow anon/public to read badges for demo
CREATE POLICY "Allow public read badges for demo"
  ON growth_badges FOR SELECT
  USING (
    status = 'active' AND
    publisher_id IN (SELECT id FROM publishers WHERE status = 'active')
  );

-- Allow anon/public to read content for demo
CREATE POLICY "Allow public read content for demo"
  ON content_performance FOR SELECT
  USING (
    publisher_id IN (SELECT id FROM publishers WHERE status = 'active')
  );


-- ============================================================================
-- VERIFICATION: Quick check that data was seeded correctly
-- ============================================================================

DO $$
DECLARE
  pub_count INT;
  conn_count INT;
  metric_count INT;
BEGIN
  SELECT COUNT(*) INTO pub_count FROM publishers WHERE status = 'active';
  SELECT COUNT(*) INTO conn_count FROM platform_connections WHERE status = 'active';
  SELECT COUNT(*) INTO metric_count FROM metrics_snapshots;

  RAISE NOTICE '=== Demo Data Seed Complete ===';
  RAISE NOTICE 'Publishers: %', pub_count;
  RAISE NOTICE 'Platform Connections: %', conn_count;
  RAISE NOTICE 'Metrics Snapshots: %', metric_count;
END;
$$;

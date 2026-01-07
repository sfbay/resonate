-- Migration: Create Badge Calculation Functions
-- Description: Database functions for calculating and awarding badges

-- Rising Star thresholds by audience size
-- Small (< 1K): 30% bronze, 50% silver, 75% gold
-- Medium (1K-10K): 20% bronze, 35% silver, 50% gold
-- Large (10K-100K): 15% bronze, 25% silver, 40% gold
-- Mega (100K+): 10% bronze, 20% silver, 30% gold

CREATE OR REPLACE FUNCTION calculate_rising_star_tier(
  follower_count INTEGER,
  growth_rate DECIMAL
) RETURNS badge_tier AS $$
BEGIN
  -- Determine tier based on follower count and growth rate
  IF follower_count < 1000 THEN
    -- Small accounts need higher growth
    IF growth_rate >= 75 THEN RETURN 'gold';
    ELSIF growth_rate >= 50 THEN RETURN 'silver';
    ELSIF growth_rate >= 30 THEN RETURN 'bronze';
    END IF;
  ELSIF follower_count < 10000 THEN
    -- Medium accounts
    IF growth_rate >= 50 THEN RETURN 'gold';
    ELSIF growth_rate >= 35 THEN RETURN 'silver';
    ELSIF growth_rate >= 20 THEN RETURN 'bronze';
    END IF;
  ELSIF follower_count < 100000 THEN
    -- Large accounts
    IF growth_rate >= 40 THEN RETURN 'gold';
    ELSIF growth_rate >= 25 THEN RETURN 'silver';
    ELSIF growth_rate >= 15 THEN RETURN 'bronze';
    END IF;
  ELSE
    -- Mega accounts (100K+)
    IF growth_rate >= 30 THEN RETURN 'gold';
    ELSIF growth_rate >= 20 THEN RETURN 'silver';
    ELSIF growth_rate >= 10 THEN RETURN 'bronze';
    END IF;
  END IF;

  RETURN NULL; -- Doesn't qualify
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to award Rising Star badge
CREATE OR REPLACE FUNCTION award_rising_star_badge(
  p_publisher_id UUID,
  p_platform platform_type
) RETURNS UUID AS $$
DECLARE
  v_growth_rate DECIMAL;
  v_followers INTEGER;
  v_tier badge_tier;
  v_badge_id UUID;
BEGIN
  -- Get 30-day growth rate
  SELECT growth_rate_percent, followers_end
  INTO v_growth_rate, v_followers
  FROM growth_snapshots
  WHERE publisher_id = p_publisher_id
    AND platform = p_platform
    AND period_type = 'monthly'
    AND snapshot_date >= CURRENT_DATE - INTERVAL '30 days'
  ORDER BY snapshot_date DESC
  LIMIT 1;

  IF v_growth_rate IS NULL THEN
    RETURN NULL;
  END IF;

  -- Calculate tier
  v_tier := calculate_rising_star_tier(v_followers, v_growth_rate);

  IF v_tier IS NULL THEN
    -- Growth not high enough, expire any existing badge
    UPDATE growth_badges
    SET status = 'expired'
    WHERE publisher_id = p_publisher_id
      AND badge_type = 'rising_star'
      AND platform = p_platform
      AND status = 'active';
    RETURN NULL;
  END IF;

  -- Expire existing badge if any
  UPDATE growth_badges
  SET status = 'expired'
  WHERE publisher_id = p_publisher_id
    AND badge_type = 'rising_star'
    AND platform = p_platform
    AND status = 'active';

  -- Insert new badge
  INSERT INTO growth_badges (
    publisher_id,
    badge_type,
    tier,
    platform,
    expires_at,
    criteria_met
  ) VALUES (
    p_publisher_id,
    'rising_star',
    v_tier,
    p_platform,
    CURRENT_DATE + INTERVAL '30 days',
    jsonb_build_object(
      'metric', 'growth_rate_30d',
      'value', v_growth_rate,
      'threshold', CASE v_tier
        WHEN 'gold' THEN 50
        WHEN 'silver' THEN 35
        ELSE 20
      END,
      'followers', v_followers
    )
  )
  RETURNING id INTO v_badge_id;

  RETURN v_badge_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check and award Verified Publisher badge
CREATE OR REPLACE FUNCTION award_verified_publisher_badge(
  p_publisher_id UUID
) RETURNS UUID AS $$
DECLARE
  v_connection_count INTEGER;
  v_verified_count INTEGER;
  v_badge_id UUID;
BEGIN
  -- Count connections and verified connections
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE verified = true)
  INTO v_connection_count, v_verified_count
  FROM platform_connections
  WHERE publisher_id = p_publisher_id
    AND status = 'active';

  -- Need at least 2 verified connections
  IF v_verified_count < 2 THEN
    RETURN NULL;
  END IF;

  -- Check if badge already exists
  SELECT id INTO v_badge_id
  FROM growth_badges
  WHERE publisher_id = p_publisher_id
    AND badge_type = 'verified_publisher'
    AND status = 'active';

  IF v_badge_id IS NOT NULL THEN
    -- Update existing badge
    UPDATE growth_badges
    SET criteria_met = jsonb_build_object(
          'total_connections', v_connection_count,
          'verified_connections', v_verified_count
        ),
        awarded_at = now()
    WHERE id = v_badge_id;
  ELSE
    -- Insert new badge
    INSERT INTO growth_badges (
      publisher_id,
      badge_type,
      criteria_met
    ) VALUES (
      p_publisher_id,
      'verified_publisher',
      jsonb_build_object(
        'total_connections', v_connection_count,
        'verified_connections', v_verified_count
      )
    )
    RETURNING id INTO v_badge_id;
  END IF;

  RETURN v_badge_id;
END;
$$ LANGUAGE plpgsql;

-- Function to award Emerging Channel badge
CREATE OR REPLACE FUNCTION award_emerging_channel_badge(
  p_publisher_id UUID
) RETURNS UUID AS $$
DECLARE
  v_messaging_count INTEGER;
  v_badge_id UUID;
BEGIN
  -- Count active messaging platform connections
  SELECT COUNT(*)
  INTO v_messaging_count
  FROM platform_connections
  WHERE publisher_id = p_publisher_id
    AND platform IN ('whatsapp', 'telegram', 'signal', 'sms', 'weibo')
    AND status = 'active';

  IF v_messaging_count = 0 THEN
    RETURN NULL;
  END IF;

  -- Check if badge already exists
  SELECT id INTO v_badge_id
  FROM growth_badges
  WHERE publisher_id = p_publisher_id
    AND badge_type = 'emerging_channel'
    AND status = 'active';

  IF v_badge_id IS NOT NULL THEN
    -- Update existing badge
    UPDATE growth_badges
    SET criteria_met = jsonb_build_object('messaging_platforms', v_messaging_count),
        awarded_at = now()
    WHERE id = v_badge_id;
  ELSE
    -- Insert new badge
    INSERT INTO growth_badges (
      publisher_id,
      badge_type,
      criteria_met
    ) VALUES (
      p_publisher_id,
      'emerging_channel',
      jsonb_build_object('messaging_platforms', v_messaging_count)
    )
    RETURNING id INTO v_badge_id;
  END IF;

  RETURN v_badge_id;
END;
$$ LANGUAGE plpgsql;

-- Master function to recalculate all badges for a publisher
CREATE OR REPLACE FUNCTION recalculate_publisher_badges(
  p_publisher_id UUID
) RETURNS TABLE(badge_type badge_type, badge_id UUID) AS $$
DECLARE
  v_platform platform_type;
BEGIN
  -- Expire old badges first
  PERFORM expire_badges();

  -- Check Rising Star for each platform
  FOR v_platform IN
    SELECT DISTINCT pc.platform
    FROM platform_connections pc
    WHERE pc.publisher_id = p_publisher_id AND pc.status = 'active'
  LOOP
    badge_type := 'rising_star';
    badge_id := award_rising_star_badge(p_publisher_id, v_platform);
    IF badge_id IS NOT NULL THEN
      RETURN NEXT;
    END IF;
  END LOOP;

  -- Check Verified Publisher
  badge_type := 'verified_publisher';
  badge_id := award_verified_publisher_badge(p_publisher_id);
  IF badge_id IS NOT NULL THEN
    RETURN NEXT;
  END IF;

  -- Check Emerging Channel
  badge_type := 'emerging_channel';
  badge_id := award_emerging_channel_badge(p_publisher_id);
  IF badge_id IS NOT NULL THEN
    RETURN NEXT;
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_rising_star_tier IS 'Determines Rising Star tier based on followers and growth';
COMMENT ON FUNCTION award_rising_star_badge IS 'Awards or updates Rising Star badge for a publisher/platform';
COMMENT ON FUNCTION recalculate_publisher_badges IS 'Recalculates all badges for a publisher';

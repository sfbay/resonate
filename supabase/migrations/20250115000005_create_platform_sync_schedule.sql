-- Migration: Create Platform Sync Schedule Table
-- Description: Manages scheduled background syncs for platform data

-- Sync frequency enum
CREATE TYPE sync_frequency AS ENUM (
  'hourly',
  'every_6_hours',
  'daily',
  'weekly'
);

-- Platform sync schedule table
CREATE TABLE platform_sync_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_id UUID NOT NULL REFERENCES publishers(id) ON DELETE CASCADE,
  platform platform_type NOT NULL,
  connection_id UUID REFERENCES platform_connections(id) ON DELETE CASCADE,

  -- Schedule settings
  frequency sync_frequency DEFAULT 'daily',
  is_enabled BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,

  -- Sync configuration
  sync_metrics BOOLEAN DEFAULT true,
  sync_content BOOLEAN DEFAULT true,
  sync_demographics BOOLEAN DEFAULT true,
  content_limit INTEGER DEFAULT 50, -- Max posts to sync per run

  -- Status tracking
  last_status VARCHAR(50), -- 'success', 'partial', 'failed'
  last_error TEXT,
  consecutive_failures INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(publisher_id, platform)
);

-- Indexes
CREATE INDEX idx_sync_schedule_publisher ON platform_sync_schedule(publisher_id);
CREATE INDEX idx_sync_schedule_platform ON platform_sync_schedule(platform);
CREATE INDEX idx_sync_schedule_next_run ON platform_sync_schedule(next_run_at)
  WHERE is_enabled = true;
CREATE INDEX idx_sync_schedule_enabled ON platform_sync_schedule(is_enabled, next_run_at)
  WHERE is_enabled = true;

-- Updated_at trigger
CREATE TRIGGER update_platform_sync_schedule_updated_at
  BEFORE UPDATE ON platform_sync_schedule
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE platform_sync_schedule ENABLE ROW LEVEL SECURITY;

-- Publishers can view their sync schedules
CREATE POLICY "Publishers can view own sync schedules"
  ON platform_sync_schedule FOR SELECT
  USING (
    publisher_id IN (
      SELECT id FROM publishers WHERE user_id = auth.uid()
    )
  );

-- Publishers can update their sync settings
CREATE POLICY "Publishers can update own sync schedules"
  ON platform_sync_schedule FOR UPDATE
  USING (
    publisher_id IN (
      SELECT id FROM publishers WHERE user_id = auth.uid()
    )
  );

-- Service role has full access (for sync jobs)
CREATE POLICY "Service role can manage sync schedules"
  ON platform_sync_schedule FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Function to calculate next run time based on frequency
CREATE OR REPLACE FUNCTION calculate_next_run_time(freq sync_frequency)
RETURNS TIMESTAMPTZ AS $$
BEGIN
  CASE freq
    WHEN 'hourly' THEN
      RETURN now() + INTERVAL '1 hour';
    WHEN 'every_6_hours' THEN
      RETURN now() + INTERVAL '6 hours';
    WHEN 'daily' THEN
      RETURN now() + INTERVAL '1 day';
    WHEN 'weekly' THEN
      RETURN now() + INTERVAL '7 days';
    ELSE
      RETURN now() + INTERVAL '1 day';
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get pending syncs (used by cron job)
CREATE OR REPLACE FUNCTION get_pending_syncs(batch_size INTEGER DEFAULT 50)
RETURNS TABLE (
  schedule_id UUID,
  publisher_id UUID,
  platform platform_type,
  connection_id UUID,
  sync_metrics BOOLEAN,
  sync_content BOOLEAN,
  sync_demographics BOOLEAN,
  content_limit INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pss.id as schedule_id,
    pss.publisher_id,
    pss.platform,
    pss.connection_id,
    pss.sync_metrics,
    pss.sync_content,
    pss.sync_demographics,
    pss.content_limit
  FROM platform_sync_schedule pss
  JOIN platform_connections pc ON pss.connection_id = pc.id
  WHERE pss.is_enabled = true
    AND pss.next_run_at <= now()
    AND pc.status = 'active'
    AND pss.consecutive_failures < 5 -- Disable after 5 failures
  ORDER BY pss.next_run_at ASC
  LIMIT batch_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update sync status after run
CREATE OR REPLACE FUNCTION update_sync_status(
  schedule_id UUID,
  new_status VARCHAR(50),
  error_message TEXT DEFAULT NULL
) RETURNS void AS $$
BEGIN
  UPDATE platform_sync_schedule
  SET
    last_run_at = now(),
    next_run_at = calculate_next_run_time(frequency),
    last_status = new_status,
    last_error = error_message,
    consecutive_failures = CASE
      WHEN new_status = 'success' THEN 0
      ELSE consecutive_failures + 1
    END,
    is_enabled = CASE
      WHEN new_status != 'success' AND consecutive_failures >= 4 THEN false
      ELSE is_enabled
    END,
    updated_at = now()
  WHERE id = schedule_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create sync schedule when platform is connected
CREATE OR REPLACE FUNCTION create_sync_schedule_on_connect()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO platform_sync_schedule (
    publisher_id,
    platform,
    connection_id,
    frequency,
    next_run_at
  ) VALUES (
    NEW.publisher_id,
    NEW.platform,
    NEW.id,
    'daily',
    now() + INTERVAL '1 hour' -- First sync 1 hour after connection
  )
  ON CONFLICT (publisher_id, platform)
  DO UPDATE SET
    connection_id = NEW.id,
    is_enabled = true,
    consecutive_failures = 0,
    next_run_at = now() + INTERVAL '1 hour';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_sync_schedule
  AFTER INSERT ON platform_connections
  FOR EACH ROW
  WHEN (NEW.status = 'active')
  EXECUTE FUNCTION create_sync_schedule_on_connect();

COMMENT ON TABLE platform_sync_schedule IS 'Manages scheduled background syncs for platform data';
COMMENT ON FUNCTION get_pending_syncs IS 'Returns batch of connections due for sync';
COMMENT ON FUNCTION update_sync_status IS 'Updates sync status and calculates next run time';

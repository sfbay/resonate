-- Migration: Create Scheduled Posts Table
-- Description: Infrastructure for post scheduling UI feature

-- ============================================================================
-- TABLE: scheduled_posts
-- ============================================================================

CREATE TABLE scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_id UUID NOT NULL REFERENCES publishers(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[],
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_scheduled_posts_publisher ON scheduled_posts(publisher_id);
CREATE INDEX idx_scheduled_posts_scheduled_for ON scheduled_posts(scheduled_for);
CREATE INDEX idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX idx_scheduled_posts_publisher_status ON scheduled_posts(publisher_id, status, scheduled_for);

-- Enable RLS
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;

-- RLS policies (demo: public read for active publishers)
CREATE POLICY "Allow public read scheduled posts for demo"
  ON scheduled_posts FOR SELECT
  USING (
    publisher_id IN (SELECT id FROM publishers WHERE status = 'active')
  );

-- Service role has full access
CREATE POLICY "Service role full access to scheduled posts"
  ON scheduled_posts FOR ALL
  USING (true)
  WITH CHECK (true);

-- Auto-update updated_at trigger
CREATE TRIGGER update_scheduled_posts_updated_at
  BEFORE UPDATE ON scheduled_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA: Sample scheduled posts for El Tecolote
-- ============================================================================

INSERT INTO scheduled_posts (publisher_id, platform, content, media_urls, scheduled_for, status)
VALUES
  -- Upcoming scheduled posts
  ('11111111-1111-1111-1111-111111111101', 'instagram',
   'Community spotlight: Meet the volunteers behind this year''s Carnaval SF preparations! Our photo essay captures the passion and artistry of Mission District muralists.',
   ARRAY['/images/sample/carnaval-prep.jpg'],
   NOW() + INTERVAL '2 days' + INTERVAL '10 hours',
   'scheduled'),

  ('11111111-1111-1111-1111-111111111101', 'facebook',
   'BREAKING: SF Board of Supervisors votes on Mission District affordable housing proposal. Full coverage in this week''s bilingual edition.',
   NULL,
   NOW() + INTERVAL '1 day' + INTERVAL '9 hours',
   'scheduled'),

  ('11111111-1111-1111-1111-111111111101', 'instagram',
   'Throwback Thursday: 50 years of El Tecolote covering the stories that matter to our community. Share your favorite memory in the comments!',
   ARRAY['/images/sample/throwback.jpg', '/images/sample/archive-1.jpg'],
   NOW() + INTERVAL '3 days' + INTERVAL '12 hours',
   'scheduled'),

  ('11111111-1111-1111-1111-111111111101', 'facebook',
   'New bilingual resource guide: Navigating SF city services for immigrant families. Available in print and online this Friday.',
   NULL,
   NOW() + INTERVAL '4 days' + INTERVAL '8 hours',
   'draft'),

  ('11111111-1111-1111-1111-111111111101', 'mailchimp',
   'Weekly Newsletter: Top stories from the Mission — housing update, cultural events, and community voices.',
   NULL,
   NOW() + INTERVAL '5 days' + INTERVAL '7 hours',
   'draft'),

  -- Recently published posts
  ('11111111-1111-1111-1111-111111111101', 'instagram',
   'Our latest investigation into rent stabilization impacts in the Mission is now live. Link in bio.',
   ARRAY['/images/sample/investigation.jpg'],
   NOW() - INTERVAL '1 day',
   'published'),

  ('11111111-1111-1111-1111-111111111101', 'facebook',
   'Weekend events roundup: Free community workshops, art openings, and family activities in the Mission and beyond.',
   NULL,
   NOW() - INTERVAL '3 days',
   'published'),

  -- A couple for Mission Local too
  ('11111111-1111-1111-1111-111111111102', 'instagram',
   'Photo essay: The changing face of 24th Street — small businesses adapting to a new era.',
   ARRAY['/images/sample/24th-street.jpg'],
   NOW() + INTERVAL '1 day' + INTERVAL '11 hours',
   'scheduled'),

  ('11111111-1111-1111-1111-111111111102', 'tiktok',
   'POV: Walking through the Mission on a Saturday morning. What''s your favorite spot?',
   ARRAY['/images/sample/mission-walk.mp4'],
   NOW() + INTERVAL '2 days' + INTERVAL '14 hours',
   'draft');

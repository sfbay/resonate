-- Migration: Seed scheduled posts for The Bay View
-- The Bay View is the oldest publisher (created_at - 200 days),
-- so it comes first with ORDER BY created_at ASC.
-- This ensures the schedule page demo shows data.

INSERT INTO scheduled_posts (publisher_id, platform, content, media_urls, scheduled_for, status)
VALUES
  ('11111111-1111-1111-1111-111111111103', 'facebook',
   'Community report: New development proposal for Bayview-Hunters Point waterfront. What residents need to know about the environmental review process.',
   NULL,
   NOW() + INTERVAL '1 day' + INTERVAL '9 hours',
   'scheduled'),

  ('11111111-1111-1111-1111-111111111103', 'instagram',
   'Photo story: Youth artists from the Bayview transform vacant lot into community garden mural. Their message: "This land is our canvas."',
   ARRAY['/images/sample/mural-project.jpg'],
   NOW() + INTERVAL '2 days' + INTERVAL '11 hours',
   'scheduled'),

  ('11111111-1111-1111-1111-111111111103', 'facebook',
   'ICYMI: Our investigation into displaced Black-owned businesses in Bayview. Read the full series on sfbayview.com.',
   NULL,
   NOW() + INTERVAL '3 days' + INTERVAL '10 hours',
   'scheduled'),

  ('11111111-1111-1111-1111-111111111103', 'instagram',
   'This Saturday: Free health screening event at Southeast Community Center. Spread the word! Details in our latest newsletter.',
   ARRAY['/images/sample/health-event.jpg'],
   NOW() + INTERVAL '4 days' + INTERVAL '8 hours',
   'draft'),

  ('11111111-1111-1111-1111-111111111103', 'facebook',
   'Weekly editorial: Reflecting on 50 years of community journalism in Hunters Point. What the next generation needs to know.',
   NULL,
   NOW() + INTERVAL '5 days' + INTERVAL '7 hours',
   'draft'),

  ('11111111-1111-1111-1111-111111111103', 'instagram',
   'Behind the scenes: Our reporters at yesterday''s Board of Supervisors hearing on affordable housing. Full report dropping tomorrow.',
   ARRAY['/images/sample/bos-hearing.jpg'],
   NOW() - INTERVAL '1 day',
   'published'),

  ('11111111-1111-1111-1111-111111111103', 'facebook',
   'Weekend roundup: Community events, local business spotlights, and neighborhood news from Bayview-Hunters Point.',
   NULL,
   NOW() - INTERVAL '3 days',
   'published');

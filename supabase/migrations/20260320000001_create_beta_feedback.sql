-- Beta testing layer: feedback, tasks, and profiles table
-- Supports: bug reports, ideas, general feedback, task completions
-- Gamification: points, levels (Newcomer -> Explorer -> Power Tester -> MVP)

-- Lightweight profiles table for beta (links Clerk users to beta features)
CREATE TABLE IF NOT EXISTS profiles (
  id BIGSERIAL PRIMARY KEY,
  clerk_id TEXT NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_beta_tester BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_clerk_id ON profiles(clerk_id);
CREATE INDEX IF NOT EXISTS idx_profiles_beta ON profiles(is_beta_tester) WHERE is_beta_tester = TRUE;

-- Beta testing tasks (admin-created challenges for testers)
CREATE TABLE IF NOT EXISTS beta_tasks (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'feature_test'
    CHECK (category IN ('bug_hunt', 'feature_test', 'exploration', 'feedback')),
  target_url TEXT,
  points INTEGER NOT NULL DEFAULT 10,
  difficulty TEXT NOT NULL DEFAULT 'medium'
    CHECK (difficulty IN ('easy', 'medium', 'hard')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Beta feedback submissions
CREATE TABLE IF NOT EXISTS beta_feedback (
  id BIGSERIAL PRIMARY KEY,
  feedback_type TEXT NOT NULL DEFAULT 'bug'
    CHECK (feedback_type IN ('bug', 'task_completion', 'general', 'idea')),
  title TEXT NOT NULL,
  description TEXT,
  page_url TEXT,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'acknowledged', 'in_progress', 'fixed', 'wont_fix')),
  submitter_id BIGINT REFERENCES profiles(id),
  clerk_user_id TEXT NOT NULL,
  task_id BIGINT REFERENCES beta_tasks(id),
  user_agent TEXT,
  priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_beta_feedback_clerk ON beta_feedback(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_status ON beta_feedback(status);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_type ON beta_feedback(feedback_type);

-- RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_feedback ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read own, service role has full access
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  USING (clerk_id = auth.jwt()->>'sub');

DROP POLICY IF EXISTS "profiles_service_all" ON profiles;
CREATE POLICY "profiles_service_all" ON profiles FOR ALL
  USING (auth.role() = 'service_role');

-- Beta tasks: readable by all authenticated users
DROP POLICY IF EXISTS "beta_tasks_select_authenticated" ON beta_tasks;
CREATE POLICY "beta_tasks_select_authenticated" ON beta_tasks FOR SELECT
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "beta_tasks_service_all" ON beta_tasks;
CREATE POLICY "beta_tasks_service_all" ON beta_tasks FOR ALL
  USING (auth.role() = 'service_role');

-- Beta feedback: users can read own, service role has full access
DROP POLICY IF EXISTS "beta_feedback_select_own" ON beta_feedback;
CREATE POLICY "beta_feedback_select_own" ON beta_feedback FOR SELECT
  USING (clerk_user_id = auth.jwt()->>'sub' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "beta_feedback_insert_own" ON beta_feedback;
CREATE POLICY "beta_feedback_insert_own" ON beta_feedback FOR INSERT
  WITH CHECK (clerk_user_id = auth.jwt()->>'sub' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "beta_feedback_service_all" ON beta_feedback;
CREATE POLICY "beta_feedback_service_all" ON beta_feedback FOR ALL
  USING (auth.role() = 'service_role');

-- Seed initial beta tasks for Resonate demo testing
INSERT INTO beta_tasks (title, description, category, target_url, points, difficulty, sort_order) VALUES
  ('Sign in as a publisher', 'Use Alicia Williams (alicia@resonatelocal.org) to sign in and explore the publisher dashboard.', 'feature_test', '/sf/publisher/dashboard', 10, 'easy', 1),
  ('Create a government campaign', 'Sign in as Wilma Flintstone and create a new campaign through the government onboarding wizard.', 'feature_test', '/sf/government/onboarding', 20, 'medium', 2),
  ('Discover publishers', 'Use the government Discover page to browse publishers and add them to your cart.', 'exploration', '/sf/government/discover', 15, 'easy', 3),
  ('Review the advertise landing', 'Visit the advertise portal landing page and provide feedback on the puzzle hero and sections.', 'feedback', '/sf/advertise', 10, 'easy', 4),
  ('Test the order flow', 'As a government user, create a campaign, match publishers, and place an order.', 'feature_test', '/sf/government/campaigns', 30, 'hard', 5),
  ('Find a bug', 'Explore any part of the platform and report any bugs you find.', 'bug_hunt', '/sf', 25, 'medium', 6)
ON CONFLICT DO NOTHING;

-- Seed test user profiles (matching existing Clerk test accounts)
INSERT INTO profiles (clerk_id, display_name, email, role, is_beta_tester) VALUES
  ('user_3AiVE15hBrURivlvGzxOkrauIa7', 'Alicia Williams', 'alicia@resonatelocal.org', 'user', TRUE),
  ('user_3AiV6JyZ0S08SOTBAjkmSwsPwFu', 'Wilma Flintstone', 'wilma@resonatelocal.org', 'user', TRUE),
  ('user_3AiV2eZc8vVjCKiWuQ1PyeCTywx', 'Eric Newton', 'jesse@resonatelocal.org', 'admin', TRUE)
ON CONFLICT (clerk_id) DO UPDATE SET
  is_beta_tester = TRUE,
  updated_at = NOW();

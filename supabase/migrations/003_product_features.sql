-- Phase 5 product features: leaderboard, achievements, gallery, PYQ tracker

-- Achievement badges
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🏆',
  xp_threshold INTEGER,
  streak_threshold INTEGER,
  category TEXT
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, achievement_id)
);

-- Community gallery (opt-in public submissions)
CREATE TABLE IF NOT EXISTS gallery_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  challenge_slug TEXT NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  likes_count INTEGER NOT NULL DEFAULT 0,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- UCEED PYQ tracker
CREATE TABLE IF NOT EXISTS pyq_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exam_year INTEGER NOT NULL,
  exam_name TEXT NOT NULL DEFAULT 'UCEED',
  question_slug TEXT NOT NULL,
  score NUMERIC(5,2),
  max_score NUMERIC(5,2) NOT NULL DEFAULT 100,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, question_slug)
);

-- Leaderboard view (materialized for performance)
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  p.id AS user_id,
  p.full_name,
  p.avatar_url,
  p.xp_total,
  p.level,
  s.current_streak,
  RANK() OVER (ORDER BY p.xp_total DESC) AS rank
FROM profiles p
LEFT JOIN streaks s ON s.user_id = p.id
WHERE p.xp_total > 0
ORDER BY p.xp_total DESC;

-- RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pyq_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements readable by all authenticated"
  ON achievements FOR SELECT TO authenticated USING (true);

CREATE POLICY "User achievements viewable by owner"
  ON user_achievements FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "User achievements insertable by owner"
  ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Gallery public posts readable"
  ON gallery_posts FOR SELECT USING (is_public = TRUE OR auth.uid() = user_id);

CREATE POLICY "Gallery insertable by owner"
  ON gallery_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "PYQ attempts viewable by owner"
  ON pyq_attempts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "PYQ attempts insertable by owner"
  ON pyq_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "PYQ attempts updatable by owner"
  ON pyq_attempts FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_gallery_created ON gallery_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pyq_user ON pyq_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);

-- Seed achievements
INSERT INTO achievements (id, title, description, icon, xp_threshold, streak_threshold) VALUES
  ('first_mock', 'First Mock', 'Complete your first design mock', '🎨', NULL, NULL),
  ('streak_3', 'On Fire', '3-day practice streak', '🔥', NULL, 3),
  ('streak_7', 'Unstoppable', '7-day practice streak', '⚡', NULL, 7),
  ('xp_500', 'Rising Designer', 'Earn 500 XP', '⭐', 500, NULL),
  ('xp_2000', 'Exam Ready', 'Earn 2000 XP', '🏆', 2000, NULL)
ON CONFLICT (id) DO NOTHING;

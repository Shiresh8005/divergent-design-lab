-- Divergent Design Lab — Phase 1 Schema
-- Run in Supabase SQL Editor or via CLI

-- Enums
CREATE TYPE challenge_category AS ENUM (
  'UCEED Part B',
  'NID DAT Mains',
  'NIFT Situation Test',
  'CEED',
  'NID M.Des'
);

CREATE TYPE challenge_difficulty AS ENUM ('easy', 'medium', 'hard');

CREATE TYPE submission_status AS ENUM ('draft', 'submitted', 'completed');

CREATE TYPE ai_review_status AS ENUM (
  'not_requested',
  'queued',
  'processing',
  'completed',
  'failed'
);

CREATE TYPE xp_source AS ENUM (
  'challenge_complete',
  'streak_bonus',
  'daily_login',
  'manual_adjustment'
);

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  xp_total INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Daily challenges
CREATE TABLE daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  category challenge_category NOT NULL,
  difficulty challenge_difficulty NOT NULL DEFAULT 'medium',
  xp_reward INTEGER NOT NULL DEFAULT 50,
  time_limit_minutes INTEGER NOT NULL DEFAULT 45,
  challenge_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (challenge_date, category)
);

-- Streaks (one row per user)
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  weekly_progress JSONB NOT NULL DEFAULT '[
    {"day":"Mon","completed":false,"xp":0},
    {"day":"Tue","completed":false,"xp":0},
    {"day":"Wed","completed":false,"xp":0},
    {"day":"Thu","completed":false,"xp":0},
    {"day":"Fri","completed":false,"xp":0},
    {"day":"Sat","completed":false,"xp":0},
    {"day":"Sun","completed":false,"xp":0}
  ]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- XP transaction log
CREATE TABLE xp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source xp_source NOT NULL,
  reference_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Challenge submissions
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
  image_url TEXT,
  notes TEXT,
  status submission_status NOT NULL DEFAULT 'draft',
  -- AI review architecture (Phase 2+)
  ai_review_status ai_review_status NOT NULL DEFAULT 'not_requested',
  ai_review_result JSONB,
  ai_review_requested_at TIMESTAMPTZ,
  ai_review_completed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, challenge_id)
);

-- Indexes
CREATE INDEX idx_daily_challenges_date ON daily_challenges(challenge_date);
CREATE INDEX idx_daily_challenges_category ON daily_challenges(category);
CREATE INDEX idx_submissions_user ON submissions(user_id);
CREATE INDEX idx_submissions_challenge ON submissions(challenge_id);
CREATE INDEX idx_xp_logs_user ON xp_logs(user_id);
CREATE INDEX idx_xp_logs_created ON xp_logs(created_at DESC);

-- Auto-create profile + streak on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.id::text || '@users.local'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email, 'user'), '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);

  INSERT INTO public.streaks (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER streaks_updated_at
  BEFORE UPDATE ON streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by owner"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Profiles updatable by owner"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Challenges readable by authenticated"
  ON daily_challenges FOR SELECT TO authenticated USING (is_active = TRUE);

CREATE POLICY "Streaks viewable by owner"
  ON streaks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Streaks updatable by owner"
  ON streaks FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "XP logs viewable by owner"
  ON xp_logs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Submissions viewable by owner"
  ON submissions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Submissions insertable by owner"
  ON submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Submissions updatable by owner"
  ON submissions FOR UPDATE USING (auth.uid() = user_id);

-- Storage bucket for drawings (create via dashboard or CLI)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('submissions', 'submissions', true);

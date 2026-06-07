-- Production fixes: slug-based challenges, secure XP, RLS hardening

-- 1. Challenge slugs (app uses string IDs like "uceed-2024-garage")
ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS exam_source TEXT;
ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS exam_marks INTEGER;

CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_challenges_slug ON daily_challenges(slug);

-- 2. Submissions: reference challenges by slug
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS challenge_slug TEXT;

-- Backfill slug from id if needed (fresh installs skip)
UPDATE submissions s
SET challenge_slug = dc.slug
FROM daily_challenges dc
WHERE s.challenge_id = dc.id AND s.challenge_slug IS NULL;

ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_challenge_id_fkey;
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_user_id_challenge_id_key;

ALTER TABLE submissions DROP COLUMN IF EXISTS challenge_id;

ALTER TABLE submissions
  ADD CONSTRAINT submissions_challenge_slug_fkey
  FOREIGN KEY (challenge_slug) REFERENCES daily_challenges(slug) ON DELETE CASCADE;

ALTER TABLE submissions ADD CONSTRAINT submissions_user_challenge_slug_key
  UNIQUE (user_id, challenge_slug);

-- 3. XP logs: reference_id stores challenge slug (text)
ALTER TABLE xp_logs ALTER COLUMN reference_id TYPE TEXT USING reference_id::TEXT;

-- 4. Harden trigger function
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

-- 5. XP logs INSERT policy
CREATE POLICY "XP logs insertable by owner"
  ON xp_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. Restrict profile updates to safe columns via RPC pattern
-- Revoke direct XP/level updates — route through award_challenge_xp
DROP POLICY IF EXISTS "Profiles updatable by owner" ON profiles;

CREATE POLICY "Profiles updatable by owner"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 7. Revoke direct streak manipulation — only via RPC
DROP POLICY IF EXISTS "Streaks updatable by owner" ON streaks;

-- 8. Atomic, idempotent XP award
CREATE OR REPLACE FUNCTION award_challenge_xp(
  p_challenge_slug TEXT,
  p_base_xp INTEGER,
  p_difficulty challenge_difficulty
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_streak streaks%ROWTYPE;
  v_profile profiles%ROWTYPE;
  v_xp_earned INTEGER;
  v_new_total INTEGER;
  v_new_level INTEGER;
  v_streak_mult NUMERIC := 1;
  v_updated streaks%ROWTYPE;
  v_today DATE := (NOW() AT TIME ZONE 'Asia/Kolkata')::DATE;
  v_already_awarded BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Idempotency: one XP award per challenge
  SELECT EXISTS (
    SELECT 1 FROM xp_logs
    WHERE user_id = v_user_id
      AND source = 'challenge_complete'
      AND reference_id = p_challenge_slug
  ) INTO v_already_awarded;

  IF v_already_awarded THEN
    SELECT * INTO v_profile FROM profiles WHERE id = v_user_id;
    RETURN jsonb_build_object(
      'xpEarned', 0,
      'newTotal', v_profile.xp_total,
      'newLevel', v_profile.level,
      'alreadyAwarded', true
    );
  END IF;

  SELECT * INTO v_streak FROM streaks WHERE user_id = v_user_id;
  SELECT * INTO v_profile FROM profiles WHERE id = v_user_id;

  IF v_streak.current_streak >= 7 THEN v_streak_mult := 1.5;
  ELSIF v_streak.current_streak >= 3 THEN v_streak_mult := 1.25;
  END IF;

  v_xp_earned := ROUND(p_base_xp * v_streak_mult *
    CASE p_difficulty
      WHEN 'hard' THEN 1.5
      WHEN 'medium' THEN 1.2
      ELSE 1.0
    END
  );

  v_new_total := v_profile.xp_total + v_xp_earned;
  v_new_level := GREATEST(1, FLOOR(v_new_total / 500) + 1);

  UPDATE profiles SET xp_total = v_new_total, level = v_new_level WHERE id = v_user_id;

  INSERT INTO xp_logs (user_id, amount, source, reference_id, description)
  VALUES (v_user_id, v_xp_earned, 'challenge_complete', p_challenge_slug,
    'Completed daily challenge');

  -- Update streak
  IF v_streak.last_activity_date IS NULL OR v_streak.last_activity_date < v_today THEN
    IF v_streak.last_activity_date = v_today - 1 THEN
      v_streak.current_streak := v_streak.current_streak + 1;
    ELSIF v_streak.last_activity_date IS DISTINCT FROM v_today THEN
      v_streak.current_streak := 1;
    END IF;
    v_streak.longest_streak := GREATEST(v_streak.longest_streak, v_streak.current_streak);
    v_streak.last_activity_date := v_today;
  END IF;

  UPDATE streaks SET
    current_streak = v_streak.current_streak,
    longest_streak = v_streak.longest_streak,
    last_activity_date = v_streak.last_activity_date,
    weekly_progress = v_streak.weekly_progress
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'xpEarned', v_xp_earned,
    'newTotal', v_new_total,
    'newLevel', v_new_level,
    'alreadyAwarded', false
  );
END;
$$;

GRANT EXECUTE ON FUNCTION award_challenge_xp TO authenticated;

-- 9. Composite indexes
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date_active
  ON daily_challenges(challenge_date, is_active);
CREATE INDEX IF NOT EXISTS idx_submissions_user_status
  ON submissions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_xp_logs_user_created
  ON xp_logs(user_id, created_at DESC);

-- 10. Storage bucket for submission images
INSERT INTO storage.buckets (id, name, public)
VALUES ('submissions', 'submissions', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own submissions"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'submissions'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "Users can read own submissions"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'submissions'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "Public read submission images"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'submissions');

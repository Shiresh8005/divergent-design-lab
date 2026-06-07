import { createClient } from "@/lib/supabase/server";
import { useDemoAuth } from "@/lib/auth/config";
import { getTodaysChallenges } from "@/lib/challenges/daily-rotation";
import { SEED_CHALLENGES, getTodaysChallenge } from "@/lib/challenges/seed-data";
import { getLevelProgress } from "@/lib/gamification/xp";
import { createDefaultWeeklyProgress } from "@/lib/gamification/streak";
import { getDemoDefaultStats } from "@/lib/demo/store";
import type { DashboardStats } from "@/lib/types/database";

export async function getDashboardData(userId?: string) {
  if (useDemoAuth() || !userId) {
    const stats = getDemoDefaultStats();
    return {
      stats,
      todaysChallenge: getTodaysChallenge(),
      userName: "Designer",
      completedChallengeIds: [] as string[],
    };
  }

  const supabase = await createClient();

  const [profileRes, streakRes, submissionsRes] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("streaks").select("*").eq("user_id", userId).single(),
      supabase
        .from("submissions")
        .select("challenge_slug, status")
        .eq("user_id", userId)
        .eq("status", "completed"),
    ]);

  const profile = profileRes.data;
  const streak = streakRes.data;
  const xp = profile?.xp_total ?? 0;
  const { level, xpToNextLevel, progress } = getLevelProgress(xp);

  const stats: DashboardStats = {
    streak: streak?.current_streak ?? 0,
    xp,
    level: profile?.level ?? level,
    levelProgress: progress,
    xpToNextLevel,
    weeklyProgress:
      streak?.weekly_progress ?? createDefaultWeeklyProgress(),
  };

  const todaysChallenge = getTodaysChallenges(SEED_CHALLENGES)[0] ?? getTodaysChallenge();

  const completedChallengeIds =
    submissionsRes.data?.map((s) => s.challenge_slug) ?? [];

  return {
    stats,
    todaysChallenge,
    userName: profile?.full_name ?? "Designer",
    completedChallengeIds,
  };
}

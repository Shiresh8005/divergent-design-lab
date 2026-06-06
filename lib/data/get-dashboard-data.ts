import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { SEED_CHALLENGES, getTodaysChallenge } from "@/lib/challenges/seed-data";
import { getLevelProgress } from "@/lib/gamification/xp";
import { createDefaultWeeklyProgress } from "@/lib/gamification/streak";
import { getDemoDefaultStats } from "@/lib/demo/store";
import type { DashboardStats } from "@/lib/types/database";

export async function getDashboardData(userId?: string) {
  if (!isSupabaseConfigured() || !userId) {
    const stats = getDemoDefaultStats();
    return {
      stats,
      todaysChallenge: getTodaysChallenge(),
      userName: "Designer",
      completedChallengeIds: [] as string[],
    };
  }

  const supabase = await createClient();

  const [profileRes, streakRes, challengesRes, submissionsRes] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("streaks").select("*").eq("user_id", userId).single(),
      supabase
        .from("daily_challenges")
        .select("*")
        .eq("is_active", true)
        .eq("challenge_date", new Date().toISOString().split("T")[0])
        .limit(1),
      supabase
        .from("submissions")
        .select("challenge_id, status")
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

  const todaysChallenge =
    challengesRes.data?.[0] ?? getTodaysChallenge();

  const completedChallengeIds =
    submissionsRes.data?.map((s) => s.challenge_id) ?? [];

  return {
    stats,
    todaysChallenge,
    userName: profile?.full_name ?? "Designer",
    completedChallengeIds,
  };
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { calculateChallengeXp, getLevelFromXp } from "@/lib/gamification/xp";
import { updateStreakOnCompletion } from "@/lib/gamification/streak";
import type { ChallengeDifficulty } from "@/lib/types/database";
import { isSupabaseConfigured } from "@/lib/auth/config";

export async function awardXpForChallenge(
  challengeSlug: string,
  baseXp: number,
  difficulty: ChallengeDifficulty
) {
  if (!isSupabaseConfigured()) return { xpEarned: 0, newTotal: 0, newLevel: 1 };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { xpEarned: 0, newTotal: 0, newLevel: 1, error: "Not authenticated" };

  const { data, error } = await supabase.rpc("award_challenge_xp", {
    p_challenge_slug: challengeSlug,
    p_base_xp: baseXp,
    p_difficulty: difficulty,
  });

  if (error) {
    // Fallback for pre-migration databases
    return awardXpForChallengeLegacy(user.id, challengeSlug, baseXp, difficulty);
  }

  const result = data as {
    xpEarned: number;
    newTotal: number;
    newLevel: number;
    alreadyAwarded?: boolean;
  };

  return {
    xpEarned: result.xpEarned,
    newTotal: result.newTotal,
    newLevel: result.newLevel,
  };
}

async function awardXpForChallengeLegacy(
  userId: string,
  challengeSlug: string,
  baseXp: number,
  difficulty: ChallengeDifficulty
) {
  const supabase = await createClient();

  const { data: streak } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", userId)
    .single();

  const xpEarned = calculateChallengeXp(
    baseXp,
    difficulty,
    streak?.current_streak ?? 0
  );

  const { data: profile } = await supabase
    .from("profiles")
    .select("xp_total")
    .eq("id", userId)
    .single();

  const newTotal = (profile?.xp_total ?? 0) + xpEarned;
  const newLevel = getLevelFromXp(newTotal);

  await supabase
    .from("profiles")
    .update({ xp_total: newTotal, level: newLevel })
    .eq("id", userId);

  await supabase.from("xp_logs").insert({
    user_id: userId,
    amount: xpEarned,
    source: "challenge_complete",
    reference_id: challengeSlug,
    description: `Completed daily challenge`,
  });

  if (streak) {
    const updated = updateStreakOnCompletion(
      streak.current_streak,
      streak.longest_streak,
      streak.last_activity_date,
      streak.weekly_progress,
      xpEarned
    );

    await supabase
      .from("streaks")
      .update(updated)
      .eq("user_id", userId);
  }

  return { xpEarned, newTotal, newLevel };
}

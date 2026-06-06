"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { awardXpForChallenge } from "./gamification";
import { getChallengeById } from "@/lib/challenges/seed-data";

export async function createSubmission(
  challengeId: string,
  imageUrl: string | null,
  notes: string | null
) {
  if (!isSupabaseConfigured()) {
    return { success: true, demo: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("submissions")
    .upsert(
      {
        user_id: user.id,
        challenge_id: challengeId,
        image_url: imageUrl,
        notes,
        status: "submitted",
        submitted_at: new Date().toISOString(),
      },
      { onConflict: "user_id,challenge_id" }
    )
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, submission: data };
}

export async function completeSubmission(challengeId: string) {
  if (!isSupabaseConfigured()) {
    return { success: true, demo: true, xpEarned: 50 };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { data: challenge } = await supabase
    .from("daily_challenges")
    .select("*")
    .eq("id", challengeId)
    .single();

  const challengeData = challenge ?? getChallengeById(challengeId);
  if (!challengeData) return { success: false, error: "Challenge not found" };

  await supabase
    .from("submissions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("challenge_id", challengeId);

  const { xpEarned, newTotal, newLevel } = await awardXpForChallenge(
    user.id,
    challengeId,
    challengeData.xp_reward,
    challengeData.difficulty
  );

  return { success: true, xpEarned, newTotal, newLevel };
}

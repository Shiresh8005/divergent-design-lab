"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/auth/config";
import type { GradingResult } from "@/lib/grading/analyze";
import { awardXpForChallenge } from "./gamification";
import { getChallengeById } from "@/lib/challenges/seed-data";

export async function uploadSubmissionImage(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Storage requires Supabase" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: "No file provided" };

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("submissions")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) return { success: false, error: error.message };

  const { data } = supabase.storage.from("submissions").getPublicUrl(path);
  return { success: true, url: data.publicUrl };
}

export async function createSubmission(
  challengeSlug: string,
  imageUrl: string | null,
  notes: string | null,
  gradingResult?: GradingResult | null
) {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
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
        challenge_slug: challengeSlug,
        image_url: imageUrl,
        notes,
        status: "submitted",
        submitted_at: new Date().toISOString(),
        ai_review_status: gradingResult ? "completed" : "not_requested",
        ai_review_result: gradingResult ?? null,
        ai_review_completed_at: gradingResult
          ? new Date().toISOString()
          : null,
      },
      { onConflict: "user_id,challenge_slug" }
    )
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, submission: data };
}

export async function completeSubmission(challengeSlug: string) {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const challengeData = getChallengeById(challengeSlug);
  if (!challengeData) return { success: false, error: "Challenge not found" };

  const { data: existing } = await supabase
    .from("submissions")
    .select("status")
    .eq("user_id", user.id)
    .eq("challenge_slug", challengeSlug)
    .maybeSingle();

  if (existing?.status === "completed") {
    return { success: true, xpEarned: 0, alreadyCompleted: true };
  }

  await supabase
    .from("submissions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("challenge_slug", challengeSlug);

  const { xpEarned, newTotal, newLevel } = await awardXpForChallenge(
    challengeSlug,
    challengeData.xp_reward,
    challengeData.difficulty
  );

  return { success: true, xpEarned, newTotal, newLevel };
}

export async function getUserSubmissions() {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("submissions")
    .select("challenge_slug, status, ai_review_result, image_url")
    .eq("user_id", user.id);

  return data ?? [];
}

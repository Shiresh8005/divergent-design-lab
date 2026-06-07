import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/auth/config";
import { ProfileClient } from "@/components/profile/profile-client";
import { getLevelProgress } from "@/lib/gamification/xp";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Profile — Design Lab",
};

export default async function ProfilePage() {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileRes, streakRes, submissionsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("streaks").select("*").eq("user_id", user.id).single(),
    supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "completed"),
  ]);

  const profile = profileRes.data;
  const streak = streakRes.data;
  const xp = profile?.xp_total ?? 0;
  const { level, progress, xpToNextLevel } = getLevelProgress(xp);

  return (
    <ProfileClient
      fullName={profile?.full_name ?? "Designer"}
      email={profile?.email ?? user.email ?? ""}
      xp={xp}
      level={profile?.level ?? level}
      levelProgress={progress}
      xpToNextLevel={xpToNextLevel}
      streak={streak?.current_streak ?? 0}
      longestStreak={streak?.longest_streak ?? 0}
      completedMocks={submissionsRes.count ?? 0}
    />
  );
}

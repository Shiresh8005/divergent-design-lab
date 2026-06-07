import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/auth/config";

export async function getAppContext() {
  if (!isSupabaseConfigured()) {
    return { streak: 0, userName: null as string | null, userId: null as string | null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { streak: 0, userName: null, userId: null };
  }

  const [streakRes, profileRes] = await Promise.all([
    supabase
      .from("streaks")
      .select("current_streak")
      .eq("user_id", user.id)
      .single(),
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
  ]);

  return {
    streak: streakRes.data?.current_streak ?? 0,
    userName: profileRes.data?.full_name ?? null,
    userId: user.id,
  };
}

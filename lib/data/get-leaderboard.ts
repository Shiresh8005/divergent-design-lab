import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/auth/config";

export interface LeaderboardEntry {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  xp_total: number;
  level: number;
  current_streak: number;
  rank: number;
}

export async function getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, xp_total, level, streaks(current_streak)")
    .gt("xp_total", 0)
    .order("xp_total", { ascending: false })
    .limit(limit);

  if (!data) return [];

  return data.map((row, i) => ({
    user_id: row.id,
    full_name: row.full_name,
    avatar_url: row.avatar_url,
    xp_total: row.xp_total,
    level: row.level,
    current_streak: (() => {
      const s = row.streaks;
      if (Array.isArray(s)) return s[0]?.current_streak ?? 0;
      return (s as { current_streak: number } | null)?.current_streak ?? 0;
    })(),
    rank: i + 1,
  }));
}

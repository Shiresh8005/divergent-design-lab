import { getLeaderboard } from "@/lib/data/get-leaderboard";
import { getAppContext } from "@/lib/data/get-app-context";
import { LeaderboardClient } from "@/components/leaderboard/leaderboard-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard — Design Lab",
  description: "Top design exam practitioners ranked by XP",
};

export default async function LeaderboardPage() {
  const [entries, context] = await Promise.all([
    getLeaderboard(25),
    getAppContext(),
  ]);

  return (
    <LeaderboardClient entries={entries} currentUserId={context.userId} />
  );
}

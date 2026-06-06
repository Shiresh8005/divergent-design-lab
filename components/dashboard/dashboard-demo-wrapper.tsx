"use client";

import { useDemoStore } from "@/lib/demo/store";
import { DashboardClient } from "./dashboard-client";
import { getTodaysChallenge } from "@/lib/challenges/seed-data";
import { getDemoDefaultStats } from "@/lib/demo/store";

export function DashboardDemoWrapper() {
  const user = useDemoStore((s) => s.user);
  const getStats = useDemoStore((s) => s.getStats);
  const submissions = useDemoStore((s) => s.submissions);

  const stats = user ? getStats() : getDemoDefaultStats();
  const completedChallengeIds = Object.keys(submissions);

  return (
    <DashboardClient
      stats={stats}
      todaysChallenge={getTodaysChallenge()}
      userName={user?.full_name ?? "Designer"}
      completedChallengeIds={completedChallengeIds}
    />
  );
}

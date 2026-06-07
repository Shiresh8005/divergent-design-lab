"use client";

import { motion } from "framer-motion";
import { Trophy, Flame } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import type { LeaderboardEntry } from "@/lib/data/get-leaderboard";

interface LeaderboardClientProps {
  entries: LeaderboardEntry[];
  currentUserId: string | null;
}

export function LeaderboardClient({
  entries,
  currentUserId,
}: LeaderboardClientProps) {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-[var(--brand-yellow)]" />
          <h1 className="text-2xl font-bold">Leaderboard</h1>
        </div>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Ranked by total XP — complete mocks to climb
        </p>
      </div>

      {entries.length === 0 ? (
        <GlassCard className="p-8 text-center" hover={false}>
          <p className="text-sm text-[var(--muted)]">
            No rankings yet. Be the first to complete a mock!
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => {
            const isYou = entry.user_id === currentUserId;
            return (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <GlassCard
                  className={`flex items-center gap-3 p-4 ${isYou ? "ring-1 ring-[var(--brand-blue)]" : ""}`}
                  hover={false}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      entry.rank <= 3
                        ? "bg-[var(--brand-yellow)]/20 text-[var(--brand-yellow)]"
                        : "bg-[var(--surface-hover)] text-[var(--muted)]"
                    }`}
                  >
                    {entry.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {entry.full_name ?? "Designer"}
                      {isYou && (
                        <span className="ml-2 text-xs text-[var(--brand-blue)]">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      Level {entry.level}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[var(--brand-blue)]">
                      {entry.xp_total} XP
                    </p>
                    {entry.current_streak > 0 && (
                      <p className="flex items-center justify-end gap-0.5 text-xs text-[var(--brand-yellow)]">
                        <Flame className="h-3 w-3" aria-hidden />
                        {entry.current_streak}
                      </p>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

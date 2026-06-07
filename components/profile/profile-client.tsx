"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { Progress } from "@/components/ui/progress";
import { StatPill } from "@/components/gamification/stat-pill";

interface ProfileClientProps {
  fullName: string;
  email: string;
  xp: number;
  level: number;
  levelProgress: number;
  xpToNextLevel: number;
  streak: number;
  longestStreak: number;
  completedMocks: number;
}

export function ProfileClient({
  fullName,
  email,
  xp,
  level,
  levelProgress,
  xpToNextLevel,
  streak,
  longestStreak,
  completedMocks,
}: ProfileClientProps) {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold">{fullName}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{email}</p>
      </div>

      <GlassCard className="p-5" hover={false}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--muted)]">Level {level}</span>
          <span className="text-sm font-medium">{xp} XP</span>
        </div>
        <Progress value={levelProgress * 100} className="mt-3 h-2" />
        <p className="mt-2 text-xs text-[var(--muted)]">
          {xpToNextLevel} XP to next level
        </p>
      </GlassCard>

      <div className="grid grid-cols-3 gap-3">
        <StatPill label="Streak" value={streak} icon="🔥" />
        <StatPill label="Best" value={longestStreak} icon="⚡" />
        <StatPill label="Mocks" value={completedMocks} icon="✅" />
      </div>

      <GlassCard className="p-5" hover={false}>
        <h2 className="font-semibold">Progress analytics</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Complete daily mocks across UCEED, NID, NIFT and CEED to build your
          streak and unlock achievement badges.
        </p>
      </GlassCard>
    </div>
  );
}

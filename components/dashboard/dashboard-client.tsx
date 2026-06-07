"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Images, Trophy, Zap } from "lucide-react";
import { StatPill } from "@/components/gamification/stat-pill";
import { WeeklyProgressChart } from "@/components/gamification/weekly-progress";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { ChallengeCard } from "@/components/challenges/challenge-card";
import { LogoMarkOnly } from "@/components/brand/logo";
import { getLevelTitle } from "@/lib/gamification/xp";
import type { DailyChallenge, DashboardStats } from "@/lib/types/database";
import {
  SEED_CHALLENGES,
  getTodaysChallenges,
  getTodayDateString,
} from "@/lib/challenges/seed-data";
import { useMemo } from "react";
import { fadeUp, staggerContainer } from "@/components/motion/fade-in";
import { Progress } from "@/components/ui/progress";
import { BRAND } from "@/lib/constants";

interface DashboardClientProps {
  stats: DashboardStats;
  todaysChallenge: DailyChallenge | null;
  userName: string;
  completedChallengeIds: string[];
}

export function DashboardClient({
  stats,
  todaysChallenge,
  userName,
  completedChallengeIds,
}: DashboardClientProps) {
  const levelTitle = getLevelTitle(stats.level);
  const firstName = userName.split(" ")[0];
  const todaysMocks = useMemo(() => getTodaysChallenges(SEED_CHALLENGES), []);
  const otherMocks = todaysMocks.filter((c) => c.id !== todaysChallenge?.id);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={fadeUp} className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <LogoMarkOnly size={28} />
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-blue)]">
              {BRAND.product}
            </p>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              {firstName}
            </h1>
            <p className="mt-0.5 text-xs text-[var(--muted)]">
              {levelTitle} · Level {stats.level}
              {stats.streak > 0 && (
                <span className="ml-2 text-[var(--brand-yellow)]">
                  🔥 {stats.streak} day streak
                </span>
              )}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
        <StatPill icon="🔥" label="Streak" value={stats.streak} accent="var(--brand-yellow)" />
        <StatPill icon="⭐" label="XP" value={stats.xp.toLocaleString()} accent="var(--brand-yellow)" />
        <StatPill icon="🏆" label="Level" value={stats.level} accent="var(--brand-blue)" />
        <StatPill
          icon="📈"
          label="To next"
          value={`${stats.xpToNextLevel} XP`}
          accent="var(--brand-blue)"
        />
      </motion.div>

      <motion.div variants={fadeUp}>
        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-semibold">Level progress</p>
            <span className="font-display text-sm font-bold text-[var(--brand-blue)]">
              {Math.round(stats.levelProgress)}%
            </span>
          </div>
          <Progress
            value={stats.levelProgress}
            className="mt-3 h-2 bg-[var(--surface-hover)]"
          />
        </GlassCard>
      </motion.div>

      <motion.div variants={fadeUp}>
        <GlassCard className="p-5">
          <h2 className="font-display mb-4 text-sm font-semibold">Weekly progress</h2>
          <WeeklyProgressChart days={stats.weeklyProgress} />
        </GlassCard>
      </motion.div>

      {todaysChallenge && (
        <motion.div variants={fadeUp} className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-sm font-semibold">
                Today&apos;s featured mock
              </h2>
              <p className="text-[10px] text-[var(--muted)]">
                {getTodayDateString()} · 5 exams rotate daily
              </p>
            </div>
            <Link
              href="/challenges"
              className="flex items-center gap-1 text-xs font-medium text-[var(--brand-blue)] hover:underline"
            >
              All 5 <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ChallengeCard
            challenge={todaysChallenge}
            completed={completedChallengeIds.includes(todaysChallenge.id)}
            isTodaysPick
          />
          {!completedChallengeIds.includes(todaysChallenge.id) && (
            <Button asChild className="h-12 w-full rounded-xl btn-brand font-display text-base font-semibold">
              <Link href={`/challenges/${todaysChallenge.id}`}>
                <Zap className="mr-2 h-4 w-4" />
                Start featured mock
              </Link>
            </Button>
          )}

          {otherMocks.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-xs font-medium text-[var(--muted)]">
                Also live today
              </p>
              {otherMocks.map((c, i) => (
                <ChallengeCard
                  key={c.id}
                  challenge={c}
                  completed={completedChallengeIds.includes(c.id)}
                  isTodaysPick
                  index={i}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
        <Link href="/leaderboard">
          <GlassCard className="flex items-center gap-3 p-4" hover>
            <Trophy className="h-5 w-5 text-[var(--brand-yellow)]" />
            <span className="text-sm font-medium">Leaderboard</span>
          </GlassCard>
        </Link>
        <Link href="/gallery">
          <GlassCard className="flex items-center gap-3 p-4" hover>
            <Images className="h-5 w-5 text-[var(--brand-blue)]" />
            <span className="text-sm font-medium">Gallery</span>
          </GlassCard>
        </Link>
      </motion.div>
    </motion.div>
  );
}

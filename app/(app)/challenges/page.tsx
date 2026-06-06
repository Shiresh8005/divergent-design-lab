"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { ChallengeCard } from "@/components/challenges/challenge-card";
import {
  SEED_CHALLENGES,
  getTodaysChallenges,
  getTodayDateString,
} from "@/lib/challenges/seed-data";
import { CHALLENGE_CATEGORIES, CATEGORY_META } from "@/lib/constants";
import type { ChallengeCategory } from "@/lib/types/database";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/lib/demo/store";
import { fadeUp, staggerContainer } from "@/components/motion/fade-in";
import { GlassCard } from "@/components/ui/glass-card";

export default function ChallengesPage() {
  const [filter, setFilter] = useState<ChallengeCategory | "all" | "today">(
    "today"
  );
  const submissions = useDemoStore((s) => s.submissions);
  const completedIds = Object.keys(submissions);

  const todaysMocks = useMemo(() => getTodaysChallenges(SEED_CHALLENGES), []);
  const todaysIds = useMemo(
    () => new Set(todaysMocks.map((c) => c.id)),
    [todaysMocks]
  );

  const filtered = useMemo(() => {
    if (filter === "today") return todaysMocks;
    if (filter === "all") return SEED_CHALLENGES;
    return SEED_CHALLENGES.filter((c) => c.category === filter);
  }, [filter, todaysMocks]);

  const todayLabel = getTodayDateString();

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={fadeUp}>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Mock bank
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Five fresh mocks daily — one per exam. Full PYQ archive below.
        </p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <GlassCard className="flex items-center gap-3 p-4" hover={false}>
          <Calendar className="h-5 w-5 shrink-0 text-[var(--brand-blue)]" />
          <div>
            <p className="font-display text-sm font-semibold">
              Today&apos;s set · {todayLabel}
            </p>
            <p className="text-xs text-[var(--muted)]">
              {todaysMocks.map((c) => CATEGORY_META[c.category].short).join(" · ")}
              — changes at midnight
            </p>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none"
      >
        <button
          onClick={() => setFilter("today")}
          className={cn(
            "shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
            filter === "today"
              ? "bg-[var(--brand-yellow)]/20 text-[var(--brand-yellow)]"
              : "bg-[var(--surface-elevated)] text-[var(--muted)] hover:text-foreground"
          )}
        >
          Today
        </button>
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
            filter === "all"
              ? "bg-[var(--brand-blue)]/20 text-[var(--brand-blue)]"
              : "bg-[var(--surface-elevated)] text-[var(--muted)] hover:text-foreground"
          )}
        >
          Full bank
        </button>
        {CHALLENGE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
              filter === cat
                ? "bg-[var(--surface-hover)] text-foreground"
                : "bg-[var(--surface-elevated)] text-[var(--muted)] hover:text-foreground"
            )}
            style={filter === cat ? { color: CATEGORY_META[cat].color } : undefined}
          >
            {CATEGORY_META[cat].icon} {CATEGORY_META[cat].short}
          </button>
        ))}
      </motion.div>

      <div className="space-y-4">
        {filtered.map((challenge, i) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            completed={completedIds.includes(challenge.id)}
            isTodaysPick={todaysIds.has(challenge.id)}
            index={i}
          />
        ))}
      </div>
    </motion.div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Star, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import type { DailyChallenge } from "@/lib/types/database";
import { CATEGORY_META, DIFFICULTY_COLORS } from "@/lib/constants";
import {
  EXAM_TIER,
  getDifficultyLabel,
} from "@/lib/challenges/exam-difficulty";

function getQuestionPreview(prompt: string): string {
  const body = prompt
    .split("\n\n")
    .slice(1)
    .join(" ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return body.length > 0 ? body : prompt.replace(/\n/g, " ").trim();
}

interface ChallengeCardProps {
  challenge: DailyChallenge;
  completed?: boolean;
  isTodaysPick?: boolean;
  index?: number;
}

export function ChallengeCard({
  challenge,
  completed,
  isTodaysPick,
  index = 0,
}: ChallengeCardProps) {
  const meta = CATEGORY_META[challenge.category];
  const examTier = EXAM_TIER[challenge.category];
  const diffLabel = getDifficultyLabel(challenge.difficulty);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
    >
      <Link href={`/challenges/${challenge.id}`}>
        <GlassCard className="p-5" glow={!completed}>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-[var(--border-subtle)] text-[10px] font-semibold"
              style={{ color: meta.color, borderColor: `${meta.color}35` }}
            >
              {meta.short}
            </Badge>
            {challenge.exam_source && (
              <Badge
                variant="outline"
                className="border-[var(--border-subtle)] text-[10px] text-[var(--muted)]"
              >
                {challenge.exam_source}
              </Badge>
            )}
            {isTodaysPick && (
              <Badge className="bg-[var(--brand-yellow)]/15 text-[var(--brand-yellow)] text-[10px]">
                Today
              </Badge>
            )}
            {challenge.exam_marks && (
              <span className="text-[10px] font-medium text-[var(--muted)]">
                {challenge.exam_marks} marks
              </span>
            )}
            {completed && (
              <Badge className="ml-auto bg-emerald-500/15 text-emerald-500 text-[10px]">
                Done
              </Badge>
            )}
            {!completed && (
              <span
                className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                style={{
                  color: DIFFICULTY_COLORS[challenge.difficulty],
                  backgroundColor: `${DIFFICULTY_COLORS[challenge.difficulty]}18`,
                }}
              >
                {diffLabel}
              </span>
            )}
          </div>

          <p className="mt-2 text-[10px] text-[var(--muted)]">{examTier.label}</p>

          <h3 className="font-display mt-1 text-base font-semibold leading-snug tracking-tight">
            {challenge.title}
          </h3>
          <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-[var(--muted)]">
            {getQuestionPreview(challenge.prompt_text)}
          </p>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {challenge.time_limit_minutes}m
              </span>
              <span className="flex items-center gap-1 font-medium text-[var(--brand-yellow)]">
                <Star className="h-3.5 w-3.5" />
                +{challenge.xp_reward} XP
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-[var(--brand-blue)]" />
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  );
}

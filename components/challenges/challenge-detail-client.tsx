"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, Star, CheckCircle2, Upload, Zap } from "lucide-react";
import type { DailyChallenge } from "@/lib/types/database";
import { CATEGORY_META, DIFFICULTY_COLORS } from "@/lib/constants";
import {
  EXAM_TIER,
  getDifficultyLabel,
} from "@/lib/challenges/exam-difficulty";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuestionPaper } from "@/components/challenges/question-paper";
import { ExamTimer, type TimerPreset } from "@/components/timer/exam-timer";
import { GradedDrawing } from "@/components/submit/graded-drawing";
import { GradingFeedback } from "@/components/submit/grading-feedback";
import { useDemoStore } from "@/lib/demo/store";
import { completeSubmission } from "@/lib/actions/submissions";
import { calculateChallengeXp } from "@/lib/gamification/xp";
import { isSupabaseConfigured } from "@/lib/supabase/client";

interface ChallengeDetailClientProps {
  challenge: DailyChallenge;
}

const timerMap: Record<number, TimerPreset> = {
  10: 10, 20: 20, 30: 30, 40: 40, 50: 50, 60: 60,
};

export function ChallengeDetailClient({ challenge }: ChallengeDetailClientProps) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showXpBurst, setShowXpBurst] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  const submissions = useDemoStore((s) => s.submissions);
  const gradingResults = useDemoStore((s) => s.gradingResults);
  const completeChallenge = useDemoStore((s) => s.completeChallenge);
  const streak = useDemoStore((s) => s.streak);

  const submission = submissions[challenge.id];
  const grading = gradingResults[challenge.id];
  const isCompleted = submission?.status === "completed";
  const isSubmitted = !!submission && !isCompleted;

  const meta = CATEGORY_META[challenge.category];
  const defaultTimer =
    timerMap[challenge.time_limit_minutes] ?? (30 as TimerPreset);

  async function handleComplete() {
    setCompleting(true);
    const earned = calculateChallengeXp(
      challenge.xp_reward,
      challenge.difficulty,
      streak
    );

    if (!isSupabaseConfigured()) {
      completeChallenge(
        challenge.id,
        earned,
        submission?.image_url ?? undefined,
        grading ?? undefined
      );
      setXpEarned(earned);
      setShowXpBurst(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } else {
      const result = await completeSubmission(challenge.id);
      if (result.success) {
        setXpEarned(result.xpEarned ?? earned);
        setShowXpBurst(true);
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    }
    setCompleting(false);
  }

  return (
    <div className="space-y-6">
      {started && !isCompleted && <ExamTimer defaultMinutes={defaultTimer} />}

      <Link
        href="/challenges"
        className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All mocks
      </Link>

      <GlassCard className="p-6" glow>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            className="text-[10px] font-semibold"
            style={{ color: meta.color, backgroundColor: `${meta.color}15` }}
          >
            {challenge.category}
          </Badge>
          {challenge.exam_source && (
            <Badge variant="outline" className="text-[10px] text-[var(--muted)]">
              {challenge.exam_source}
            </Badge>
          )}
          {challenge.exam_marks && (
            <span className="text-[10px] font-medium text-[var(--muted)]">
              {challenge.exam_marks} marks
            </span>
          )}
          <span
            className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
            style={{
              color: DIFFICULTY_COLORS[challenge.difficulty],
              backgroundColor: `${DIFFICULTY_COLORS[challenge.difficulty]}18`,
            }}
          >
            {getDifficultyLabel(challenge.difficulty)}
          </span>
        </div>

        <p className="mt-2 text-xs text-[var(--muted)]">
          {EXAM_TIER[challenge.category].label}
        </p>

        <h1 className="font-display mt-3 text-2xl font-bold leading-tight tracking-tight">
          {challenge.title}
        </h1>

        <div className="mt-4 flex gap-4 text-sm text-[var(--muted)]">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {challenge.time_limit_minutes} min
          </span>
          <span className="flex items-center gap-1 font-medium text-[var(--brand-yellow)]">
            <Star className="h-4 w-4" />
            +{challenge.xp_reward} XP
          </span>
        </div>
      </GlassCard>

      {/* Full question always visible — never hidden behind "Begin mock" */}
      <QuestionPaper challenge={challenge} />

      {grading && submission?.image_url && (
        <div className="space-y-4">
          <h2 className="font-display text-sm font-semibold">Graded sheet</h2>
          <GradedDrawing imageUrl={submission.image_url} result={grading} />
          <GradingFeedback result={grading} />
        </div>
      )}

      <AnimatePresence>
        {showXpBurst && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="text-center">
              <p className="font-display text-3xl font-bold text-[var(--brand-yellow)]">
                +{xpEarned} XP
              </p>
              <p className="mt-2 text-white/60">Mock complete</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="sticky bottom-20 z-40 space-y-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--background)]/95 p-4 backdrop-blur-md md:bottom-4">
        {!started && !isCompleted && (
          <Button
            onClick={() => setStarted(true)}
            className="h-12 w-full rounded-xl btn-brand font-display text-base font-semibold"
          >
            <Zap className="mr-2 h-4 w-4" />
            Start timer &amp; begin mock
          </Button>
        )}

        {started && !isCompleted && (
          <>
            <Button
              asChild
              variant="outline"
              className="h-12 w-full rounded-xl border-[var(--border-subtle)]"
            >
              <Link href={`/submit?challenge=${challenge.id}`}>
                <Upload className="mr-2 h-4 w-4" />
                Submit sheet for grading
              </Link>
            </Button>
            {isSubmitted && (
              <Button
                onClick={handleComplete}
                disabled={completing}
                className="h-12 w-full rounded-xl bg-emerald-600 font-display font-semibold hover:bg-emerald-500"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark mock complete
              </Button>
            )}
          </>
        )}

        {isCompleted && (
          <div className="flex items-center gap-3 text-sm font-medium text-emerald-500">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            Done — {grading ? `${grading.totalMarks}/${grading.maxMarks} marks` : "nice work"}
          </div>
        )}
      </div>
    </div>
  );
}

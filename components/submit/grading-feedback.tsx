"use client";

import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, MessageSquare } from "lucide-react";
import type { GradingResult } from "@/lib/grading/analyze";
import { GlassCard } from "@/components/ui/glass-card";
import { Progress } from "@/components/ui/progress";

interface GradingFeedbackProps {
  result: GradingResult;
}

export function GradingFeedback({ result }: GradingFeedbackProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      <GlassCard className="p-5">
        <div className="flex items-start gap-3">
          <MessageSquare className="h-5 w-5 shrink-0 text-[var(--brand-blue)]" />
          <div>
            <h3 className="font-semibold">Examiner Feedback</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              {result.feedback}
            </p>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Composition", value: result.composition_score },
          { label: "Creativity", value: result.creativity_score },
          { label: "Technique", value: result.technique_score },
        ].map((item) => (
          <GlassCard key={item.label} className="p-4" hover={false}>
            <p className="text-xs text-[var(--muted)]">{item.label}</p>
            <p className="mt-1 text-xl font-bold text-[var(--brand-blue)]">
              {item.value}%
            </p>
            <Progress value={item.value} className="mt-2 h-1.5" />
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-500">
          <CheckCircle2 className="h-4 w-4" />
          What you did well
        </h3>
        <ul className="mt-3 space-y-2">
          {result.strengths.map((s, i) => (
            <li key={i} className="text-sm leading-relaxed text-[var(--muted)]">
              • {s}
            </li>
          ))}
        </ul>
      </GlassCard>

      <GlassCard className="p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--brand-yellow)]">
          <AlertCircle className="h-4 w-4" />
          Where to improve
        </h3>
        <ul className="mt-3 space-y-2">
          {result.improvements.map((s, i) => (
            <li key={i} className="text-sm leading-relaxed text-[var(--muted)]">
              • {s}
            </li>
          ))}
        </ul>
      </GlassCard>
    </motion.div>
  );
}

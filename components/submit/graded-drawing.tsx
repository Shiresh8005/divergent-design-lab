"use client";

import { motion } from "framer-motion";
import type { GradingResult } from "@/lib/grading/analyze";
import { cn } from "@/lib/utils";

interface GradedDrawingProps {
  imageUrl: string;
  result: GradingResult;
}

export function GradedDrawing({ imageUrl, result }: GradedDrawingProps) {
  const pct = result.overall_score;

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Graded submission"
          className="aspect-[4/3] w-full object-contain bg-[var(--surface-hover)]"
        />

        {/* Total marks overlay */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
          className="absolute right-3 top-3 flex flex-col items-center rounded-xl border border-[var(--brand-blue)]/30 bg-[var(--surface-elevated)]/95 px-3 py-2 backdrop-blur-md shadow-lg"
        >
          <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted)]">
            Score
          </span>
          <span className="text-2xl font-bold text-[var(--brand-blue)]">
            {result.totalMarks}
            <span className="text-sm font-normal text-[var(--muted)]">
              /{result.maxMarks}
            </span>
          </span>
          <span
            className={cn(
              "mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold",
              pct >= 70
                ? "bg-emerald-500/20 text-emerald-500"
                : pct >= 50
                  ? "bg-[var(--brand-yellow)]/20 text-[var(--brand-yellow)]"
                  : "bg-red-500/20 text-red-400"
            )}
          >
            Grade {result.grade}
          </span>
        </motion.div>

        {/* Improvement pins on drawing */}
        {result.annotations.map((ann, i) => (
          <motion.div
            key={ann.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="absolute"
            style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
          >
            <div className="relative -translate-x-1/2 -translate-y-1/2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-red-400 bg-red-500/90 text-[10px] font-bold text-white shadow-md">
                !
              </div>
              <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--surface-elevated)]/95 px-2 py-1 text-[10px] font-medium text-red-400 backdrop-blur-sm border border-red-500/20">
                {ann.label}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Criterion marks along bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-wrap gap-1 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
          {result.criterionScores.map((c) => (
            <span
              key={c.id}
              className="rounded-md bg-[var(--surface-elevated)]/90 px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm border border-[var(--border-subtle)]"
            >
              <span className="text-[var(--muted)]">{c.name}: </span>
              <span className="text-[var(--brand-yellow)]">
                {c.score}/{c.maxMarks}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

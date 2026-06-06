"use client";

import { GlassCard } from "@/components/ui/glass-card";
import type { DailyChallenge } from "@/lib/types/database";

interface QuestionPaperProps {
  challenge: DailyChallenge;
  compact?: boolean;
}

/** Renders the full exam question — never truncated */
export function QuestionPaper({ challenge, compact = false }: QuestionPaperProps) {
  const sections = challenge.prompt_text.split(/\n\n+/);

  return (
    <GlassCard className="p-5 md:p-6" hover={false} glow>
      <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-[var(--border-subtle)] pb-4">
        <span className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-blue)]">
          Question paper
        </span>
        {challenge.exam_source && (
          <span className="text-xs text-[var(--muted)]">· {challenge.exam_source}</span>
        )}
        {challenge.exam_marks && (
          <span className="text-xs font-medium text-[var(--brand-yellow)]">
            · {challenge.exam_marks} marks
          </span>
        )}
        <span className="text-xs text-[var(--muted)]">
          · {challenge.time_limit_minutes} minutes
        </span>
      </div>

      <div className={compact ? "space-y-3" : "space-y-4"}>
        {sections.map((block, i) => {
          const lines = block.split("\n");
          const first = lines[0]?.trim() ?? "";
          const isHeader =
            first.startsWith("Q.") ||
            first.includes("[") ||
            first.endsWith(":") ||
            /^Step \d/.test(first) ||
            /^(Note|Evaluation|Materials|Rules|Submit|Show|Draw|Design|Sketch|Make|Illustrate|Inspired|Complete|Redesign)/i.test(
              first
            );

          if (isHeader && lines.length > 1) {
            return (
              <section key={i}>
                <h3 className="font-display text-sm font-semibold text-foreground">
                  {first}
                </h3>
                <div className="mt-2 space-y-1.5 text-sm leading-relaxed text-[var(--muted)]">
                  {lines.slice(1).map((line, j) => (
                    <p key={j} className={line.startsWith("•") ? "pl-1" : ""}>
                      {line}
                    </p>
                  ))}
                </div>
              </section>
            );
          }

          return (
            <p
              key={i}
              className="text-sm leading-relaxed text-foreground whitespace-pre-wrap"
            >
              {block}
            </p>
          );
        })}
      </div>
    </GlassCard>
  );
}

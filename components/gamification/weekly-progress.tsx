"use client";

import { motion } from "framer-motion";
import type { WeeklyDayProgress } from "@/lib/types/database";
import { cn } from "@/lib/utils";

interface WeeklyProgressProps {
  days: WeeklyDayProgress[];
}

export function WeeklyProgressChart({ days }: WeeklyProgressProps) {
  const maxXp = Math.max(...days.map((d) => d.xp), 50);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-2 h-28">
        {days.map((day, i) => {
          const height = day.xp > 0 ? (day.xp / maxXp) * 100 : day.completed ? 20 : 8;
          return (
            <div key={day.day} className="flex flex-1 flex-col items-center gap-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "w-full min-h-[8px] rounded-t-lg rounded-b-sm",
                  day.completed
                    ? "bg-gradient-to-t from-[var(--brand-blue)] to-[#5cb8f0] shadow-[0_0_20px_-4px_rgba(43,159,232,0.5)]"
                    : "bg-[var(--surface-hover)]"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium",
                  day.completed ? "text-[var(--brand-blue)]" : "text-[var(--muted)]"
                )}
              >
                {day.day}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-[var(--muted)]">
        <span>Weekly activity</span>
        <span>{days.filter((d) => d.completed).length}/7 days</span>
      </div>
    </div>
  );
}

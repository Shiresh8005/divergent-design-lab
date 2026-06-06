"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Pause, Play, RotateCcw, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const TIMER_PRESETS = [10, 20, 30, 40, 50, 60] as const;
export type TimerPreset = (typeof TIMER_PRESETS)[number];

interface ExamTimerProps {
  defaultMinutes?: TimerPreset;
  onComplete?: () => void;
  className?: string;
}

export function ExamTimer({
  defaultMinutes = 30,
  onComplete,
  className,
}: ExamTimerProps) {
  const [minutes, setMinutes] = useState<TimerPreset>(defaultMinutes);
  const [secondsLeft, setSecondsLeft] = useState(defaultMinutes * 60);
  const [running, setRunning] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [finished, setFinished] = useState(false);

  const totalSeconds = minutes * 60;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  const reset = useCallback(
    (m: TimerPreset) => {
      setMinutes(m);
      setSecondsLeft(m * 60);
      setRunning(false);
      setFinished(false);
    },
    []
  );

  useEffect(() => {
    if (!running || secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          setFinished(true);
          onComplete?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, secondsLeft, onComplete]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const urgent = secondsLeft <= 60 && running;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "fixed left-4 top-4 z-[60] md:left-auto md:right-6 md:top-[4.5rem]",
        className
      )}
    >
      <div
        className={cn(
          "overflow-hidden rounded-2xl border backdrop-blur-xl shadow-lg transition-colors",
          "border-[var(--border-subtle)] bg-[var(--surface-elevated)]",
          urgent && "border-red-500/40 shadow-red-500/20",
          finished && "border-[var(--brand-yellow)]/50"
        )}
      >
        <div className="flex items-center gap-2 px-3 py-2">
          <Clock
            className={cn(
              "h-4 w-4 shrink-0",
              urgent ? "text-red-400 animate-pulse" : "text-[var(--brand-blue)]"
            )}
          />
          <span
            className={cn(
              "min-w-[4.5rem] font-mono text-lg font-bold tabular-nums",
              urgent ? "text-red-400" : "text-[var(--foreground)]"
            )}
          >
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </span>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setRunning((r) => !r)}
              disabled={finished}
              className="rounded-lg p-1.5 hover:bg-[var(--surface-hover)]"
              aria-label={running ? "Pause" : "Start"}
            >
              {running ? (
                <Pause className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => reset(minutes)}
              className="rounded-lg p-1.5 hover:bg-[var(--surface-hover)]"
              aria-label="Reset"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="rounded-lg p-1.5 hover:bg-[var(--surface-hover)]"
              aria-label="Change duration"
            >
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  expanded && "rotate-180"
                )}
              />
            </button>
          </div>
        </div>

        <div className="h-1 bg-[var(--surface-hover)]">
          <motion.div
            className={cn(
              "h-full",
              urgent
                ? "bg-red-500"
                : "bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-yellow)]"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-[var(--border-subtle)]"
            >
              <div className="grid grid-cols-3 gap-1 p-2">
                {TIMER_PRESETS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      reset(m);
                      setExpanded(false);
                    }}
                    className={cn(
                      "rounded-lg py-1.5 text-xs font-medium transition-colors",
                      minutes === m
                        ? "bg-[var(--brand-blue)]/20 text-[var(--brand-blue)]"
                        : "text-[var(--muted)] hover:bg-[var(--surface-hover)]"
                    )}
                  >
                    {m === 60 ? "1 hr" : `${m}m`}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {finished && (
          <p className="px-3 pb-2 text-center text-[10px] font-medium text-[var(--brand-yellow)]">
            Time&apos;s up — submit now
          </p>
        )}
      </div>
    </motion.div>
  );
}

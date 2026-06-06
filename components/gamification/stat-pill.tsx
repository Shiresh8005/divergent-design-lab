"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatPillProps {
  icon: string;
  label: string;
  value: string | number;
  accent?: string;
  className?: string;
}

export function StatPill({
  icon,
  label,
  value,
  accent = "var(--brand-blue)",
  className,
}: StatPillProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      className={cn(
        "flex flex-col gap-1 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 backdrop-blur-xl",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          {label}
        </span>
      </div>
      <motion.span
        key={String(value)}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-2xl font-bold tracking-tight"
        style={{ color: accent }}
      >
        {value}
      </motion.span>
    </motion.div>
  );
}

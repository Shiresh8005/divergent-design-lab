"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  className?: string;
  children?: React.ReactNode;
  glow?: boolean;
  hover?: boolean;
}

export function GlassCard({
  className,
  children,
  glow = false,
  hover = true,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -2, scale: 1.01 } : undefined}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative overflow-visible rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] backdrop-blur-xl",
        glow && "shadow-[0_0_40px_-12px_rgba(43,159,232,0.35)]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--brand-blue)]/[0.03] via-transparent to-transparent" />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

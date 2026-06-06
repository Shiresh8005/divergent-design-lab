"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const BLUE = "#2B9FE8";
const YELLOW = "#F5C518";

const CIRCLES: [number, number, string][] = [
  [0, 0, BLUE],
  [1, 0, YELLOW],
  [0, 1, YELLOW],
  [1, 1, BLUE],
  [0, 2, BLUE],
  [1, 2, YELLOW],
];

function LogoMark({ size = 32, animate = false }: { size?: number; animate?: boolean }) {
  const cell = size * 0.44;
  const gap = size * 0.1;
  const r = cell * 0.38;
  const w = cell * 2 + gap;
  const h = cell * 3 + gap * 2;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden
      className="shrink-0"
    >
      {CIRCLES.map(([col, row, fill], i) => {
        const cx = col * (cell + gap) + cell / 2;
        const cy = row * (cell + gap) + cell / 2;
        const circle = (
          <circle key={i} cx={cx} cy={cy} r={r} fill={fill} />
        );
        if (!animate) return circle;
        return (
          <motion.circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill={fill}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: i * 0.05,
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        );
      })}
    </svg>
  );
}

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showPill?: boolean;
  showWordmark?: boolean;
  animated?: boolean;
  className?: string;
}

const sizes = {
  sm: { mark: 20, word: "text-[10px] leading-[1]" },
  md: { mark: 26, word: "text-[12px] leading-[1.05]" },
  lg: { mark: 34, word: "text-[15px] leading-[1.05]" },
};

export function Logo({
  size = "md",
  showPill = true,
  showWordmark = true,
  animated = false,
  className,
}: LogoProps) {
  const s = sizes[size];

  const inner = (
    <>
      <LogoMark size={s.mark} animate={animated} />
      {showWordmark && (
        <div
          className={cn(
            "font-display font-bold tracking-[-0.02em] text-[var(--logo-text)]",
            s.word
          )}
        >
          <span className="block">Divergent</span>
          <span className="block">Classes</span>
        </div>
      )}
    </>
  );

  const classes = cn(
    "inline-flex items-center gap-2.5",
    showPill &&
      showWordmark &&
      "rounded-2xl border border-[var(--logo-pill-border)] bg-[var(--logo-pill-bg)] px-3 py-2 shadow-[var(--logo-pill-shadow)]",
    !showWordmark && "rounded-xl p-1",
    className
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={classes}
      >
        {inner}
      </motion.div>
    );
  }

  return <div className={classes}>{inner}</div>;
}

export function LogoMarkOnly({
  size = 26,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex", className)}>
      <LogoMark size={size} />
    </div>
  );
}

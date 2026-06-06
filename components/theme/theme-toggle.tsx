"use client";

import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] transition-colors hover:bg-[var(--surface-hover)]",
        className
      )}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4 text-[var(--brand-yellow)]" />
        ) : (
          <Moon className="h-4 w-4 text-[var(--brand-blue)]" />
        )}
      </motion.div>
    </button>
  );
}

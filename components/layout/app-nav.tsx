"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, PenLine, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useDemoStore } from "@/lib/demo/store";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/challenges", label: "Challenges", icon: PenLine },
  { href: "/submit", label: "Submit", icon: Upload },
];

export function AppNav() {
  const pathname = usePathname();
  const streak = useDemoStore((s) => s.streak);

  return (
    <>
      <header className="sticky top-0 z-50 hidden border-b border-[var(--border-subtle)] bg-[var(--background)]/80 backdrop-blur-xl md:block">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/dashboard">
            <Logo size="sm" showPill={false} />
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    active ? "text-foreground" : "text-[var(--muted)] hover:text-foreground"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-lg bg-[var(--surface-hover)]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            {streak > 0 && (
              <span className="text-sm font-semibold text-[var(--brand-yellow)]">
                🔥 {streak}
              </span>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border-subtle)] bg-[var(--background)]/90 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-medium transition-colors",
                  active ? "text-[var(--brand-blue)]" : "text-[var(--muted)]"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="mobile-nav"
                    className="absolute inset-0 rounded-xl bg-[var(--brand-blue)]/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <Icon className="relative h-5 w-5" />
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

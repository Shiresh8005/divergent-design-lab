"use client";

import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";
import { useDemoAuth } from "@/lib/auth/config";
import { useDemoStore } from "@/lib/demo/store";

interface UserMenuProps {
  streak?: number;
  userName?: string | null;
}

export function UserMenu({ streak = 0, userName }: UserMenuProps) {
  const demoLogout = useDemoStore((s) => s.logout);
  const isDemo = useDemoAuth();

  function handleDemoLogout() {
    demoLogout();
    window.location.href = "/login";
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        href="/profile"
        className="hidden rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-foreground sm:block"
        aria-label="Profile"
      >
        <User className="h-4 w-4" />
      </Link>
      {streak > 0 && (
        <span className="text-sm font-semibold text-[var(--brand-yellow)]" aria-hidden>
          🔥 {streak}
        </span>
      )}
      {userName && (
        <span className="hidden max-w-[120px] truncate text-xs text-[var(--muted)] lg:inline">
          {userName}
        </span>
      )}
      {isDemo ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleDemoLogout}
          className="h-8 gap-1.5 text-xs text-[var(--muted)]"
          aria-label="Sign out"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      ) : (
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-[var(--muted)]"
            aria-label="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </form>
      )}
    </div>
  );
}

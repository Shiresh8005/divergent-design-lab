import Link from "next/link";
import { LandingHero } from "@/components/landing/hero";
import { LandingFeatures } from "@/components/landing/features";
import { LandingCta } from "@/components/landing/cta";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[var(--background)] bg-grid">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--background)]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 md:px-8">
          <Link href="/">
            <Logo size="md" showPill={false} animated />
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-sm text-[var(--muted)] transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-[var(--brand-blue)] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:brightness-110"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingCta />
      </main>

      <footer className="border-t border-[var(--border-subtle)] px-4 py-8 text-center text-xs text-[var(--muted)]">
        © {new Date().getFullYear()} Divergent Classes
      </footer>
    </div>
  );
}

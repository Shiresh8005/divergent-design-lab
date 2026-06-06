"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useDemoStore } from "@/lib/demo/store";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const demoLogin = useDemoStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLogin = mode === "login";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured()) {
        demoLogin(email || "student@demo.com", name || undefined);
        router.push(redirect);
        return;
      }

      const supabase = createClient();

      if (isLogin) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
      } else {
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (authError) throw authError;
      }

      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col items-center">
          <Link href="/">
            <Logo size="lg" />
          </Link>
          <h1 className="mt-6 text-2xl font-bold">
            {isLogin ? "Welcome back" : "Start practising"}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Exam-format mocks with instant grading
          </p>
        </div>

        <GlassCard className="p-6" hover={false}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
                  Full name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="h-11 border-[var(--border-subtle)] bg-[var(--surface-elevated)]"
                />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                className="h-11 border-[var(--border-subtle)] bg-[var(--surface-elevated)]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="h-11 border-[var(--border-subtle)] bg-[var(--surface-elevated)]"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            {!isSupabaseConfigured() && (
              <p className="rounded-lg bg-[var(--brand-blue)]/10 px-3 py-2 text-xs text-[var(--brand-blue)]">
                Demo mode — any email works.
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl btn-brand"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--muted)]">
            {isLogin ? "New here?" : "Already have an account?"}{" "}
            <Link
              href={isLogin ? "/signup" : "/login"}
              className="font-medium text-[var(--brand-blue)] hover:underline"
            >
              {isLogin ? "Create account" : "Sign in"}
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}

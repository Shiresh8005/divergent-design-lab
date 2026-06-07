"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import { formatAuthError, getErrorMessage } from "@/lib/auth/errors";
import { isSupabaseConfigured } from "@/lib/auth/config";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    async function checkSession() {
      if (!isSupabaseConfigured()) {
        setError("Password reset requires Supabase configuration.");
        setCheckingSession(false);
        return;
      }
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setError(
          "Reset link expired or invalid. Request a new link from forgot password."
        );
      } else {
        setSessionReady(true);
      }
      setCheckingSession(false);
    }
    checkSession();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.updateUser({
        password,
      });
      if (authError) throw authError;
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err) {
      setError(formatAuthError(getErrorMessage(err)));
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
          <h1 className="mt-6 text-2xl font-bold">New password</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Choose a password for your account
          </p>
        </div>

        <GlassCard className="p-6" hover={false}>
          {done ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
              <p className="mt-4 text-sm">Password updated. Redirecting…</p>
            </div>
          ) : checkingSession ? (
            <p className="text-center text-sm text-[var(--muted)]">
              Verifying reset link…
            </p>
          ) : !sessionReady ? (
            <div className="text-center">
              <p role="alert" className="text-sm text-red-400">
                {error}
              </p>
              <Button asChild className="mt-4 w-full rounded-xl btn-brand">
                <Link href="/forgot-password">Request new link</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
                  New password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-11 border-[var(--border-subtle)] bg-[var(--surface-elevated)]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
                  Confirm password
                </label>
                <Input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={6}
                  className="h-11 border-[var(--border-subtle)] bg-[var(--surface-elevated)]"
                />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-xl btn-brand"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update password
              </Button>
            </form>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}

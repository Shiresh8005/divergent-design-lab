"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import { formatAuthError, getErrorMessage } from "@/lib/auth/errors";
import { isSupabaseConfigured } from "@/lib/auth/config";
import { getAuthCallbackUrl } from "@/lib/auth/redirect-url";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured()) {
        setError("Password reset requires Supabase — connect your project first.");
        return;
      }

      const supabase = createClient();
      const redirectTo = getAuthCallbackUrl("/reset-password");

      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo }
      );

      if (authError) throw authError;
      setSent(true);
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
          <h1 className="mt-6 text-2xl font-bold">Reset password</h1>
          <p className="mt-2 text-center text-sm text-[var(--muted)]">
            We&apos;ll email you a link to set a new password
          </p>
        </div>

        <GlassCard className="p-6" hover={false}>
          {sent ? (
            <div className="text-center">
              <Mail className="mx-auto h-10 w-10 text-[var(--brand-blue)]" />
              <p className="mt-4 text-sm leading-relaxed text-foreground">
                If <strong>{email}</strong> has an account, you&apos;ll get a reset
                link shortly. Check spam too.
              </p>
              <Button asChild className="mt-6 w-full rounded-xl btn-brand">
                <Link href="/login">Back to sign in</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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

              {error && <p className="text-sm text-red-400">{error}</p>}

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-xl btn-brand"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send reset link
              </Button>
            </form>
          )}

          <Link
            href="/login"
            className="mt-6 flex items-center justify-center gap-1 text-sm text-[var(--muted)] hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </GlassCard>
      </motion.div>
    </div>
  );
}

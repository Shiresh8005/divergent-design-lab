"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import { useDemoStore } from "@/lib/demo/store";
import {
  formatAuthError,
  getErrorMessage,
  isEmailRateLimitError,
  isDatabaseSignupError,
  isEmailNotConfirmedError,
} from "@/lib/auth/errors";
import { useDemoAuth } from "@/lib/auth/config";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { getAuthCallbackUrl } from "@/lib/auth/redirect-url";
import {
  autoConfirmUser,
  autoConfirmUserByEmail,
} from "@/lib/actions/auth";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = safeRedirectPath(searchParams.get("redirect"));
  const configError = searchParams.get("error");
  const demoLogin = useDemoStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [dbError, setDbError] = useState(false);
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const isLogin = mode === "login";

  async function handleResendConfirmation() {
    if (!email) return;
    setResending(true);
    setResendSent(false);
    try {
      const supabase = createClient();
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: getAuthCallbackUrl(redirect),
        },
      });
      if (resendError) throw resendError;
      setResendSent(true);
      setError(null);
    } catch (err) {
      setError(formatAuthError(getErrorMessage(err)));
    } finally {
      setResending(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRateLimited(false);
    setDbError(false);
    setEmailNotConfirmed(false);
    setResendSent(false);
    setCheckEmail(false);

    try {
      if (useDemoAuth()) {
        demoLogin(email || "student@demo.com", name || undefined);
        router.push(redirect);
        return;
      }

      const supabase = createClient();

      if (isLogin) {
        let { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        // Auto-confirm unverified users (requires SUPABASE_SERVICE_ROLE_KEY on Vercel)
        if (authError && isEmailNotConfirmedError(getErrorMessage(authError))) {
          const confirmed = await autoConfirmUserByEmail(email);
          if (confirmed.success) {
            const retry = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            authError = retry.error;
          } else {
            throw new Error(
              confirmed.error === "Auto-confirm not configured"
                ? "Email not confirmed. Add SUPABASE_SERVICE_ROLE_KEY to Vercel env vars and redeploy — or disable Confirm email in Supabase → Authentication → Providers → Email."
                : `Could not confirm email: ${confirmed.error}. Try the confirmation link again or contact support.`
            );
          }
        }

        if (authError) throw authError;
        router.push(redirect);
        router.refresh();
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: getAuthCallbackUrl(redirect),
          },
        });
        if (authError) throw authError;

        // No session yet — auto-confirm and sign in immediately
        if (data.user && !data.session) {
          const confirmed = await autoConfirmUser(data.user.id);
          if (confirmed.success) {
            const { error: signInError } =
              await supabase.auth.signInWithPassword({ email, password });
            if (!signInError) {
              router.push(redirect);
              router.refresh();
              return;
            }
          }
          setCheckEmail(true);
          return;
        }

        router.push(redirect);
        router.refresh();
      }
    } catch (err) {
      const raw = getErrorMessage(err);
      setRateLimited(isEmailRateLimitError(raw));
      setDbError(isDatabaseSignupError(raw));
      setEmailNotConfirmed(isEmailNotConfirmedError(raw));
      setError(formatAuthError(raw));
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
          {checkEmail ? (
            <div className="text-center">
              <Mail className="mx-auto h-10 w-10 text-[var(--brand-blue)]" />
              <p className="mt-4 text-sm leading-relaxed">
                Check your inbox at <strong>{email}</strong> to confirm your
                account, then sign in.
              </p>
              <Button asChild className="mt-6 w-full rounded-xl btn-brand">
                <Link href="/login">Go to sign in</Link>
              </Button>
            </div>
          ) : (
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
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-medium text-[var(--muted)]">
                    Password
                  </label>
                  {isLogin && (
                    <Link
                      href="/forgot-password"
                      className="text-xs font-medium text-[var(--brand-blue)] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
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

              {configError === "auth_not_configured" && (
                <div
                  role="alert"
                  className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-400"
                >
                  Authentication is not configured. Set Supabase environment
                  variables or enable demo mode for local development.
                </div>
              )}

              {configError === "auth_callback_failed" && (
                <div
                  role="alert"
                  className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400"
                >
                  Email verification link expired or invalid. Try signing in or
                  request a new link.
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="rounded-lg bg-red-500/10 px-3 py-2 text-sm leading-relaxed text-red-400"
                >
                  <p>{error}</p>
                  {emailNotConfirmed && (
                    <div className="mt-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={resending || !email}
                        onClick={handleResendConfirmation}
                        className="w-full rounded-lg border-[var(--border-subtle)] text-xs"
                      >
                        {resending && (
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        )}
                        Resend confirmation email
                      </Button>
                    </div>
                  )}
                  {resendSent && (
                    <p className="mt-2 text-xs text-emerald-400">
                      Confirmation email sent — check inbox and spam.
                    </p>
                  )}
                  {(rateLimited ||
                    dbError ||
                    error.includes("already has an account")) && (
                    <p className="mt-2 text-xs text-red-300/90">
                      <Link href="/login" className="font-medium underline">
                        Sign in
                      </Link>
                      {" · "}
                      <Link href="/forgot-password" className="font-medium underline">
                        Forgot password
                      </Link>
                      {rateLimited && (
                        <span>
                          {" · "}
                          Try again in ~1 hour
                        </span>
                      )}
                    </p>
                  )}
                </div>
              )}

              {useDemoAuth() && (
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
          )}

          {!checkEmail && (
            <p className="mt-6 text-center text-sm text-[var(--muted)]">
              {isLogin ? "New here?" : "Already have an account?"}{" "}
              <Link
                href={
                  isLogin
                    ? `/signup?redirect=${encodeURIComponent(redirect)}`
                    : `/login?redirect=${encodeURIComponent(redirect)}`
                }
                className="font-medium text-[var(--brand-blue)] hover:underline"
              >
                {isLogin ? "Create account" : "Sign in"}
              </Link>
            </p>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}

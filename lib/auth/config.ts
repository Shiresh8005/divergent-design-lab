/** Central auth/runtime configuration — single source of truth */

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && url.length > 0 && key.length > 0);
}

/** Demo auth only when explicitly opted in. Never auto-bypass auth in production. */
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

export function useDemoAuth(): boolean {
  return isDemoMode() && !isSupabaseConfigured();
}

/** Auto-confirm emails on signup/login — requires SUPABASE_SERVICE_ROLE_KEY on server */
export function shouldAutoConfirmEmail(): boolean {
  return Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.SUPABASE_AUTO_CONFIRM_EMAIL !== "false"
  );
}

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "http://localhost:3000";
}

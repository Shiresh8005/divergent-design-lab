import { getSiteUrl } from "@/lib/auth/config";
import { safeRedirectPath } from "@/lib/auth/redirect";

/** Auth callback URL on the same host the user is browsing (fixes preview vs production) */
export function getAuthCallbackUrl(redirectPath?: string): string {
  const next = safeRedirectPath(redirectPath);
  const origin =
    typeof window !== "undefined" ? window.location.origin : getSiteUrl();
  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

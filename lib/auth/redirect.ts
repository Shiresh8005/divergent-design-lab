const DEFAULT_REDIRECT = "/dashboard";

/** Allow only same-origin relative paths — blocks open redirects */
export function safeRedirectPath(
  path: string | null | undefined,
  fallback = DEFAULT_REDIRECT
): string {
  if (!path) return fallback;

  const trimmed = path.trim();
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("://")) return fallback;
  if (trimmed.includes("\\")) return fallback;

  // Strip query/hash for validation, then re-attach safely
  try {
    const url = new URL(trimmed, "http://localhost");
    if (url.hostname !== "localhost") return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}

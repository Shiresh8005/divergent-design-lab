export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return "Something went wrong";
}

export function isEmailRateLimitError(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes("rate limit") || lower.includes("email rate limit");
}

/** Map raw Supabase Auth errors to student-friendly copy */
export function formatAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (isEmailRateLimitError(message)) {
    return "Too many confirmation emails were sent from our auth server. Wait about an hour, or sign in if you already registered.";
  }
  if (lower.includes("already registered") || lower.includes("already been registered")) {
    return "This email already has an account. Try signing in or reset your password.";
  }
  if (lower.includes("invalid login credentials")) {
    return "Wrong email or password. Try again or use Forgot password.";
  }
  if (lower.includes("email not confirmed")) {
    return "Please confirm your email first — check your inbox (and spam) for the link from Divergent Classes.";
  }
  if (lower.includes("password") && lower.includes("weak")) {
    return "Choose a stronger password — at least 6 characters.";
  }
  if (lower.includes("database error saving new user")) {
    return "Account setup failed on our database. If you already signed up before, try Sign in. Otherwise contact support — the database may need to be configured.";
  }

  return message;
}

export function isDatabaseSignupError(message: string): boolean {
  return message.toLowerCase().includes("database error saving new user");
}

export function isEmailNotConfirmedError(message: string): boolean {
  return message.toLowerCase().includes("email not confirmed");
}

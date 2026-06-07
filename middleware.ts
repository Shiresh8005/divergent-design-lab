import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isDemoMode, isSupabaseConfigured } from "@/lib/auth/config";

const protectedPaths = ["/dashboard", "/challenges", "/submit", "/profile", "/leaderboard", "/gallery"];

export async function middleware(request: NextRequest) {
  if (isSupabaseConfigured()) {
    return updateSession(request);
  }

  // Without Supabase: block protected routes unless demo mode is explicitly enabled
  if (!isDemoMode()) {
    const isProtected = protectedPaths.some((p) =>
      request.nextUrl.pathname.startsWith(p)
    );
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "auth_not_configured");
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/challenges/:path*",
    "/submit/:path*",
    "/profile/:path*",
    "/leaderboard/:path*",
    "/gallery/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ],
};

import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function middleware(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.next();
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/challenges/:path*",
    "/submit/:path*",
    "/login",
    "/signup",
  ],
};

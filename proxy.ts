import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/studio/:path*",
    "/auth/callback",
    /*
     * Refresh session for all non-static, non-api routes too so that
     * Server Components see a fresh user. Excludes:
     *   - _next/static, _next/image, favicon, image extensions
     *   - api/webhooks/* and api/cron/* (those auth via signatures / cron secret)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|api/webhooks|api/cron|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

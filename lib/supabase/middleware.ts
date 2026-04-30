import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/db";
import { publicEnv, studioGuestModeEnabled, supabaseConfigured } from "@/lib/env";

/**
 * Refresh the Supabase session cookie on each matched request.
 *
 * Returns the response to send back. If the user is hitting a `/studio/*`
 * route without a session, redirects to `/sign-in?next=...`.
 *
 * If Supabase is not configured (M0 before keys exist), no-ops cleanly so
 * the dev server still boots.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  if (!supabaseConfigured()) {
    return response;
  }

  const env = publicEnv();
  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const { data } = await supabase.auth.getUser();
  const user = data.user;

  const path = request.nextUrl.pathname;
  const isStudio = path === "/studio" || path.startsWith("/studio/");

  if (isStudio && !user && !studioGuestModeEnabled()) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/sign-in";
    redirect.searchParams.set("next", path);
    return NextResponse.redirect(redirect);
  }

  return response;
}

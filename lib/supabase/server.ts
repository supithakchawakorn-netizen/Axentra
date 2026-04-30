import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/db";
import { publicEnv } from "@/lib/env";

/**
 * Server-side Supabase client backed by the Next.js cookie store. RLS-bound;
 * uses the user's session cookies if present.
 *
 * Use from Server Components, Server Actions, and Route Handlers (except
 * webhook/cron handlers, which use the admin client).
 */
export async function createClient() {
  const env = publicEnv();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
    );
  }
  const cookieStore = await cookies();
  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // The `setAll` call may fail when invoked from a Server Component.
            // Middleware handles session refresh; ignore here.
          }
        },
      },
    },
  );
}

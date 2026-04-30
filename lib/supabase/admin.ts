import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/db";
import { publicEnv, serverEnv } from "@/lib/env";

/**
 * Service-role Supabase client. Bypasses RLS.
 *
 * AGENTS.md §8: only use from `app/api/webhooks/*`, `app/api/cron/*`, and
 * trusted server scripts. Never from a Server Component, Server Action, or
 * page render path.
 */
export function createAdminClient() {
  const pub = publicEnv();
  const srv = serverEnv();
  if (!pub.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  }
  if (!srv.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY. Required for admin client.");
  }
  return createSupabaseClient<Database>(
    pub.NEXT_PUBLIC_SUPABASE_URL,
    srv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

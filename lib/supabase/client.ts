"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/db";
import { publicEnv } from "@/lib/env";

/**
 * Browser-side Supabase client. RLS-bound; uses the anon key. Safe to call
 * from client components.
 */
export function createClient() {
  const env = publicEnv();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
    );
  }
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

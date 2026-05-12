/**
 * Environment variable surface. Validated lazily on first access so that the
 * dev server can boot even when external services are not yet provisioned.
 *
 * AGENTS.md §3a: secrets never live behind NEXT_PUBLIC_*. Anything in
 * `serverEnv` is server-only.
 */

import { z } from "zod";

const optionalUrlFromEnv = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().url().optional(),
);

const optionalStringFromEnv = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().optional(),
);

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: optionalUrlFromEnv,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalStringFromEnv,
  NEXT_PUBLIC_POSTHOG_KEY: optionalStringFromEnv,
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().default("https://eu.i.posthog.com"),
  NEXT_PUBLIC_SENTRY_DSN: optionalStringFromEnv,
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  CRON_SECRET: z.string().optional(),
});

export type PublicEnv = z.infer<typeof publicSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;

let _publicEnv: PublicEnv | null = null;
let _serverEnv: ServerEnv | null = null;

export function publicEnv(): PublicEnv {
  if (_publicEnv) return _publicEnv;
  const parsed = publicSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  });
  if (!parsed.success) {
    throw new Error(`Invalid public env: ${parsed.error.message}`);
  }
  _publicEnv = parsed.data;
  return _publicEnv;
}

export function serverEnv(): ServerEnv {
  if (_serverEnv) return _serverEnv;
  const parsed = serverSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    CRON_SECRET: process.env.CRON_SECRET,
  });
  if (!parsed.success) {
    throw new Error(`Invalid server env: ${parsed.error.message}`);
  }
  _serverEnv = parsed.data;
  return _serverEnv;
}

/** Whether Supabase is configured. False in M0 before keys are pasted in. */
export function supabaseConfigured(): boolean {
  const env = publicEnv();
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Studio guest mode for local UX iteration without auth friction.
 * Defaults to enabled outside production.
 */
export function studioGuestModeEnabled(): boolean {
  const raw = process.env.NEXT_PUBLIC_STUDIO_GUEST_MODE?.toLowerCase().trim();
  if (raw === "1" || raw === "true") return true;
  if (raw === "0" || raw === "false") return false;
  return process.env.NODE_ENV !== "production";
}

/**
 * Temporary kill-switch to pause creation/start of new live rooms while
 * retaining visibility and end controls for existing rooms.
 */
export function liveBuildingPaused(): boolean {
  const raw = process.env.NEXT_PUBLIC_LIVE_BUILD_PAUSED?.toLowerCase().trim();
  if (raw === "1" || raw === "true") return true;
  if (raw === "0" || raw === "false") return false;
  return true;
}


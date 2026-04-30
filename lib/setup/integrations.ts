import "server-only";

export interface IntegrationItem {
  id: string;
  name: string;
  requiredFor: string;
  docsUrl: string;
  install?: string;
  keys: string[];
  configured: boolean;
  optional?: boolean;
  partial?: boolean;
  notes?: string;
}

function has(...values: Array<string | undefined>) {
  return values.every((v) => Boolean(v && v.trim().length > 0));
}

export function getIntegrationChecklist(): IntegrationItem[] {
  return [
    {
      id: "supabase",
      name: "Supabase",
      requiredFor: "Real auth, profiles, videos, live metadata, and tickers",
      docsUrl: "https://supabase.com/dashboard",
      install: "scoop install supabase",
      keys: [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
      ],
      configured: has(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
      ),
    },
    {
      id: "mux",
      name: "Mux",
      requiredFor: "Actual video upload and playback processing",
      docsUrl: "https://dashboard.mux.com/",
      keys: ["MUX_TOKEN_ID", "MUX_TOKEN_SECRET", "MUX_WEBHOOK_SECRET"],
      partial: has(process.env.MUX_TOKEN_ID, process.env.MUX_TOKEN_SECRET),
      notes:
        "Without MUX_WEBHOOK_SECRET, uploads still start, but status updates to ready/errored are delayed.",
      configured: has(
        process.env.MUX_TOKEN_ID,
        process.env.MUX_TOKEN_SECRET,
        process.env.MUX_WEBHOOK_SECRET,
      ),
    },
    {
      id: "livekit",
      name: "LiveKit",
      requiredFor: "Real live streaming rooms",
      docsUrl: "https://cloud.livekit.io/",
      keys: ["LIVEKIT_API_KEY", "LIVEKIT_API_SECRET", "LIVEKIT_URL", "LIVEKIT_WEBHOOK_SECRET"],
      partial: has(
        process.env.LIVEKIT_API_KEY,
        process.env.LIVEKIT_API_SECRET,
        process.env.LIVEKIT_URL,
      ),
      notes:
        "Without LIVEKIT_WEBHOOK_SECRET, live start/watch works, but webhook-driven room/recording sync is limited.",
      configured: has(
        process.env.LIVEKIT_API_KEY,
        process.env.LIVEKIT_API_SECRET,
        process.env.LIVEKIT_URL,
        process.env.LIVEKIT_WEBHOOK_SECRET,
      ),
    },
    {
      id: "openai",
      name: "OpenAI",
      requiredFor: "Ticker and news AI summaries",
      docsUrl: "https://platform.openai.com/api-keys",
      keys: ["OPENAI_API_KEY"],
      configured: has(process.env.OPENAI_API_KEY),
    },
    {
      id: "market_data",
      name: "Market data provider",
      requiredFor: "Realtime quote tape on viewer and creator surfaces",
      docsUrl: "https://polygon.io/docs",
      keys: [
        "NEXT_PUBLIC_MARKET_DATA_MODE",
        "MARKET_DATA_BASE_URL",
        "MARKET_DATA_API_KEY",
      ],
      partial: has(process.env.NEXT_PUBLIC_MARKET_DATA_MODE),
      notes:
        "Use demo mode by default. Switch NEXT_PUBLIC_MARKET_DATA_MODE=provider only after MARKET_DATA_BASE_URL and MARKET_DATA_API_KEY are set.",
      configured: has(
        process.env.NEXT_PUBLIC_MARKET_DATA_MODE,
        process.env.MARKET_DATA_BASE_URL,
        process.env.MARKET_DATA_API_KEY,
      ),
      optional: true,
    },
    {
      id: "posthog",
      name: "PostHog (EU)",
      requiredFor: "Analytics and experiment reporting",
      docsUrl: "https://eu.posthog.com/",
      keys: ["NEXT_PUBLIC_POSTHOG_KEY", "NEXT_PUBLIC_POSTHOG_HOST"],
      configured: has(
        process.env.NEXT_PUBLIC_POSTHOG_KEY,
        process.env.NEXT_PUBLIC_POSTHOG_HOST,
      ),
      optional: true,
    },
    {
      id: "sentry",
      name: "Sentry",
      requiredFor: "Error monitoring",
      docsUrl: "https://sentry.io/settings/auth-tokens/",
      keys: ["NEXT_PUBLIC_SENTRY_DSN", "SENTRY_AUTH_TOKEN", "SENTRY_ORG", "SENTRY_PROJECT"],
      configured: has(
        process.env.NEXT_PUBLIC_SENTRY_DSN,
        process.env.SENTRY_AUTH_TOKEN,
        process.env.SENTRY_ORG,
        process.env.SENTRY_PROJECT,
      ),
      optional: true,
    },
    {
      id: "resend",
      name: "Resend",
      requiredFor: "Transactional email",
      docsUrl: "https://resend.com/api-keys",
      keys: ["RESEND_API_KEY", "RESEND_FROM_EMAIL"],
      configured: has(process.env.RESEND_API_KEY, process.env.RESEND_FROM_EMAIL),
      optional: true,
    },
  ];
}

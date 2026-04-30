import "server-only";
import { PostHog } from "posthog-node";
import { publicEnv } from "@/lib/env";

let _client: PostHog | null = null;

/**
 * Server-side PostHog client. Returns null if no key is configured so callers
 * can no-op cleanly without breaking dev.
 *
 * AGENTS.md: EU cloud only. Keys come from publicEnv (the public key is safe
 * to expose; this client uses it server-side too).
 */
export function getPostHogServer(): PostHog | null {
  const env = publicEnv();
  if (!env.NEXT_PUBLIC_POSTHOG_KEY) {
    return null;
  }
  if (!_client) {
    _client = new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: env.NEXT_PUBLIC_POSTHOG_HOST,
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return _client;
}

/**
 * Capture a server-side event. No-ops cleanly when PostHog is not configured.
 */
export async function captureServerEvent(params: {
  distinctId: string;
  event: string;
  properties?: Record<string, unknown>;
}): Promise<void> {
  const client = getPostHogServer();
  if (!client) return;
  client.capture({
    distinctId: params.distinctId,
    event: params.event,
    properties: params.properties,
  });
  await client.shutdown();
}

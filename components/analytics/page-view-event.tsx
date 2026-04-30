"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

/**
 * Fires a single PostHog event when the component mounts. Used to record
 * dedicated `*_view` events (e.g. `ticker_view`, `home_view`, `explore_view`)
 * on top of PostHog's automatic pageviews, since the doc enumerates them
 * separately in docs/frontend/frontend-rules.md §11.
 *
 * No-ops if PostHog isn't configured.
 */
export function PageViewEvent({
  event,
  properties,
}: {
  event: string;
  properties?: Record<string, string | number | boolean | null>;
}) {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    if (typeof window === "undefined") return;
    posthog.capture(event, properties);
  }, [event, properties]);
  return null;
}

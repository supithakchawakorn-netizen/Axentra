"use client";

import posthog from "posthog-js";
import { PostHogProvider as Provider } from "posthog-js/react";
import { type ReactNode, useEffect } from "react";

/**
 * Client-side PostHog provider. No-ops cleanly when no key is set, so that
 * the dev server boots with a blank slate during M0.
 *
 * Anonymous distinct IDs by default (AGENTS.md §3): we never identify a
 * viewer in V1 (viewer accounts are out of scope).
 */
export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;
    if (typeof window === "undefined") return;
    if (posthog.__loaded) return;
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: false,
    });
  }, []);

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>;
  }

  return <Provider client={posthog}>{children}</Provider>;
}

"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { Events } from "@/lib/posthog/events";

const LAST_CLICK_KEY = "ax-exp-last-click";
const SESSION_DEPTH_KEY = "ax-session-depth";
const MAX_AGE_MS = 1000 * 60 * 30;

export function ExperimentQualitySignal({
  signal,
  path,
}: {
  signal: "watch_page_entry" | "route_continuation";
  path: string;
}) {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    const raw = window.localStorage.getItem(LAST_CLICK_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as {
        experiment_key?: string;
        variant?: string;
        surface?: string;
        cta?: string;
        ts?: number;
      };
      if (!parsed.ts || Date.now() - parsed.ts > MAX_AGE_MS) return;

      const previousDepth = Number(
        window.sessionStorage.getItem(SESSION_DEPTH_KEY) ?? "0",
      );
      const sessionDepth = Number.isFinite(previousDepth) ? previousDepth + 1 : 1;
      window.sessionStorage.setItem(SESSION_DEPTH_KEY, String(sessionDepth));

      posthog.capture(Events.ExperimentQualitySignal, {
        experiment_key: parsed.experiment_key ?? "unknown",
        variant: parsed.variant ?? "unknown",
        surface: parsed.surface ?? "unknown",
        cta: parsed.cta ?? "unknown",
        signal,
        path,
        session_depth: String(sessionDepth),
      });
    } catch {
      // no-op for malformed local storage payload
    }
  }, [path, signal]);

  return null;
}

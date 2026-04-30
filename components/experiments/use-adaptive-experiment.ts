"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import posthog from "posthog-js";
import { Events } from "@/lib/posthog/events";

type VariantStats = Record<string, { impressions: number; clicks: number }>;

const MIN_IMPRESSIONS_PER_VARIANT = 20;
const MIN_TOTAL_IMPRESSIONS_FOR_CONFIDENCE = 80;
const MIN_CTR_DELTA_FOR_CONFIDENCE = 0.03;
const EXPLOIT_PROBABILITY = 0.85;
const LOW_CONFIDENCE_EXPLOIT_PROBABILITY = 0.6;

function statsKey(experimentKey: string) {
  return `ax-exp-stats:${experimentKey}`;
}

function loadStats(experimentKey: string, variants: readonly string[]): VariantStats {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(statsKey(experimentKey));
  if (!raw) {
    return Object.fromEntries(variants.map((v) => [v, { impressions: 0, clicks: 0 }]));
  }
  try {
    const parsed = JSON.parse(raw) as VariantStats;
    return Object.fromEntries(
      variants.map((v) => [v, parsed[v] ?? { impressions: 0, clicks: 0 }]),
    );
  } catch {
    return Object.fromEntries(variants.map((v) => [v, { impressions: 0, clicks: 0 }]));
  }
}

function saveStats(experimentKey: string, stats: VariantStats) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(statsKey(experimentKey), JSON.stringify(stats));
}

function pickVariant(variants: readonly string[], stats: VariantStats): string {
  const allReady = variants.every(
    (v) => (stats[v]?.impressions ?? 0) >= MIN_IMPRESSIONS_PER_VARIANT,
  );
  if (!allReady) {
    return variants[Math.floor(Math.random() * variants.length)] ?? variants[0]!;
  }

  const ranked = [...variants].sort((a, b) => {
    const aImpressions = stats[a]?.impressions ?? 0;
    const bImpressions = stats[b]?.impressions ?? 0;
    const aCtr = aImpressions > 0 ? (stats[a]?.clicks ?? 0) / aImpressions : 0;
    const bCtr = bImpressions > 0 ? (stats[b]?.clicks ?? 0) / bImpressions : 0;
    return bCtr - aCtr;
  });

  const best = ranked[0] ?? variants[0]!;
  const second = ranked[1];
  const totalImpressions = variants.reduce(
    (acc, v) => acc + (stats[v]?.impressions ?? 0),
    0,
  );
  const bestImpressions = stats[best]?.impressions ?? 0;
  const bestCtr = bestImpressions > 0 ? (stats[best]?.clicks ?? 0) / bestImpressions : 0;
  const secondImpressions = second ? stats[second]?.impressions ?? 0 : 0;
  const secondCtr =
    second && secondImpressions > 0 ? (stats[second]?.clicks ?? 0) / secondImpressions : 0;
  const ctrDelta = bestCtr - secondCtr;
  const confident =
    totalImpressions >= MIN_TOTAL_IMPRESSIONS_FOR_CONFIDENCE &&
    ctrDelta >= MIN_CTR_DELTA_FOR_CONFIDENCE;
  const exploitProbability = confident
    ? EXPLOIT_PROBABILITY
    : LOW_CONFIDENCE_EXPLOIT_PROBABILITY;

  if (Math.random() < exploitProbability) return best;
  return variants[Math.floor(Math.random() * variants.length)] ?? best;
}

function capture(event: string, properties: Record<string, string>) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  if (typeof window === "undefined") return;
  posthog.capture(event, properties);
}

export function useAdaptiveExperiment<T extends string>(params: {
  experimentKey: string;
  surface: string;
  variants: readonly T[];
}) {
  const clickMemoryKey = "ax-exp-last-click";

  const { experimentKey, surface, variants } = params;
  const [variant] = useState<T>(() => {
    if (typeof window === "undefined") return variants[0]!;
    const stats = loadStats(experimentKey, variants);
    return pickVariant(variants, stats) as T;
  });

  useEffect(() => {
    const stats = loadStats(experimentKey, variants);
    const nextStats = {
      ...stats,
      [variant]: {
        impressions: (stats[variant]?.impressions ?? 0) + 1,
        clicks: stats[variant]?.clicks ?? 0,
      },
    };
    saveStats(experimentKey, nextStats);

    capture(Events.ExperimentImpression, {
      experiment_key: experimentKey,
      variant,
      surface,
    });
  }, [experimentKey, surface, variant, variants]);

  const common = useMemo(
    () =>
      ({
        experiment_key: experimentKey,
        variant,
        surface,
      }) as const,
    [experimentKey, surface, variant],
  );

  const trackClick = useCallback((cta: string) => {
    const stats = loadStats(experimentKey, variants);
    const nextStats = {
      ...stats,
      [variant]: {
        impressions: stats[variant]?.impressions ?? 0,
        clicks: (stats[variant]?.clicks ?? 0) + 1,
      },
    };
    saveStats(experimentKey, nextStats);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        clickMemoryKey,
        JSON.stringify({
          experiment_key: experimentKey,
          variant,
          surface,
          cta,
          ts: Date.now(),
        }),
      );
    }

    capture(Events.ExperimentClick, { ...common, cta });
  }, [clickMemoryKey, common, experimentKey, surface, variants, variant]);

  const trackSignal = useCallback((signal: string, extra: Record<string, string> = {}) => {
    capture(Events.ExperimentQualitySignal, {
      ...common,
      signal,
      ...extra,
    });
  }, [common]);

  return { variant, trackClick, trackSignal };
}

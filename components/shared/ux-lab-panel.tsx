"use client";

import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  applyViewMode,
  parseViewMode,
  VIEW_MODE_KEY,
  VIEW_MODE_MANUAL_KEY,
} from "@/lib/ui/view-mode";

type VariantStats = Record<string, { impressions: number; clicks: number }>;

interface ExperimentConfig {
  key: string;
  label: string;
  variants: readonly string[];
}

interface ExperimentRow {
  variant: string;
  impressions: number;
  clicks: number;
  ctr: number;
}

interface ExperimentSnapshot {
  key: string;
  label: string;
  rows: ExperimentRow[];
  totalImpressions: number;
  bestVariant: string | null;
}

const EXPERIMENTS: readonly ExperimentConfig[] = [
  {
    key: "public_view_mode_v1",
    label: "Public view mode",
    variants: ["standard", "luxury"],
  },
  {
    key: "home_growth_v1",
    label: "Home growth",
    variants: ["clarity", "momentum"],
  },
  {
    key: "explore_growth_v1",
    label: "Explore growth",
    variants: ["discovery", "filter_first"],
  },
];

function statsStorageKey(experimentKey: string) {
  return `ax-exp-stats:${experimentKey}`;
}

function normalizeStats(
  raw: unknown,
  variants: readonly string[],
): VariantStats {
  const safe: VariantStats = {};
  for (const variant of variants) {
    safe[variant] = { impressions: 0, clicks: 0 };
  }
  if (!raw || typeof raw !== "object") return safe;
  for (const variant of variants) {
    const candidate = (raw as Record<string, unknown>)[variant];
    if (!candidate || typeof candidate !== "object") continue;
    const impressions = Number(
      (candidate as Record<string, unknown>).impressions ?? 0,
    );
    const clicks = Number((candidate as Record<string, unknown>).clicks ?? 0);
    safe[variant] = {
      impressions: Number.isFinite(impressions) ? Math.max(0, impressions) : 0,
      clicks: Number.isFinite(clicks) ? Math.max(0, clicks) : 0,
    };
  }
  return safe;
}

function readExperiment(config: ExperimentConfig): ExperimentSnapshot {
  const raw = window.localStorage.getItem(statsStorageKey(config.key));
  let parsed = normalizeStats(null, config.variants);
  if (raw) {
    try {
      parsed = normalizeStats(JSON.parse(raw), config.variants);
    } catch {
      parsed = normalizeStats(null, config.variants);
    }
  }
  const rows = config.variants.map((variant) => {
    const impressions = parsed[variant]?.impressions ?? 0;
    const clicks = parsed[variant]?.clicks ?? 0;
    const ctr = impressions > 0 ? clicks / impressions : 0;
    return { variant, impressions, clicks, ctr };
  });
  const totalImpressions = rows.reduce((acc, row) => acc + row.impressions, 0);
  const ranked = [...rows].sort((a, b) => b.ctr - a.ctr);
  const bestVariant = ranked[0]?.impressions ? ranked[0].variant : null;
  return {
    key: config.key,
    label: config.label,
    rows,
    totalImpressions,
    bestVariant,
  };
}

export function UxLabPanel() {
  const [currentViewMode, setCurrentViewMode] = useState<"standard" | "luxury">(
    () =>
      typeof window === "undefined"
        ? "standard"
        : parseViewMode(window.localStorage.getItem(VIEW_MODE_KEY)),
  );
  const [manualOverride, setManualOverride] = useState(
    () =>
      typeof window !== "undefined" &&
      window.localStorage.getItem(VIEW_MODE_MANUAL_KEY) === "1",
  );
  const [snapshots, setSnapshots] = useState<ExperimentSnapshot[]>(() =>
    typeof window === "undefined"
      ? []
      : EXPERIMENTS.map((experiment) => readExperiment(experiment)),
  );
  const [lastResetAt, setLastResetAt] = useState<string | null>(null);

  const totalImpressions = useMemo(
    () =>
      snapshots.reduce((acc, snapshot) => acc + snapshot.totalImpressions, 0),
    [snapshots],
  );

  function refreshSnapshots() {
    setSnapshots(EXPERIMENTS.map((experiment) => readExperiment(experiment)));
  }

  function forceViewMode(mode: "standard" | "luxury") {
    window.localStorage.setItem(VIEW_MODE_KEY, mode);
    window.localStorage.setItem(VIEW_MODE_MANUAL_KEY, "1");
    applyViewMode(mode);
    setCurrentViewMode(mode);
    setManualOverride(true);
    refreshSnapshots();
  }

  function setAutoViewMode() {
    window.localStorage.removeItem(VIEW_MODE_MANUAL_KEY);
    setManualOverride(false);
    refreshSnapshots();
  }

  function onReset() {
    for (const experiment of EXPERIMENTS) {
      window.localStorage.removeItem(statsStorageKey(experiment.key));
    }
    window.localStorage.removeItem(VIEW_MODE_MANUAL_KEY);
    window.localStorage.removeItem(VIEW_MODE_KEY);
    applyViewMode("standard");
    setCurrentViewMode("standard");
    setManualOverride(false);
    refreshSnapshots();
    setLastResetAt(new Date().toLocaleTimeString());
  }

  return (
    <section className="glass-panel rounded-xl border p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">UX Lab</h2>
          <p className="text-muted-foreground text-xs">
            Local A/B diagnostics for your current browser profile.
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="bg-secondary hover:bg-accent inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
        >
          <RotateCcw className="size-3.5" />
          Reset experiment data
        </button>
      </div>

      <div className="grid gap-2 text-xs sm:grid-cols-3">
        <div className="rounded-lg border bg-muted/35 px-3 py-2">
          <p className="text-muted-foreground">Current view mode</p>
          <p className="mt-0.5 font-medium capitalize">{currentViewMode}</p>
        </div>
        <div className="rounded-lg border bg-muted/35 px-3 py-2">
          <p className="text-muted-foreground">Manual override</p>
          <p className="mt-0.5 font-medium">
            {manualOverride ? "Enabled" : "Auto experiment"}
          </p>
        </div>
        <div className="rounded-lg border bg-muted/35 px-3 py-2">
          <p className="text-muted-foreground">Total impressions</p>
          <p className="mt-0.5 font-medium">{totalImpressions}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/25 p-3 text-xs">
        <p className="mb-2 text-muted-foreground">Quick mode testing</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => forceViewMode("standard")}
            className="bg-secondary hover:bg-accent rounded-full px-3 py-1.5 font-medium"
          >
            Force standard
          </button>
          <button
            type="button"
            onClick={() => forceViewMode("luxury")}
            className="bg-secondary hover:bg-accent rounded-full px-3 py-1.5 font-medium"
          >
            Force luxury
          </button>
          <button
            type="button"
            onClick={setAutoViewMode}
            className="bg-secondary hover:bg-accent rounded-full px-3 py-1.5 font-medium"
          >
            Resume auto experiment
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {snapshots.map((snapshot) => (
          <article key={snapshot.key} className="rounded-lg border bg-muted/25 p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">{snapshot.label}</p>
              <p className="text-muted-foreground text-xs">
                Best variant:{" "}
                <span className="text-foreground font-medium">
                  {snapshot.bestVariant ?? "Not enough data"}
                </span>
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {snapshot.rows.map((row) => (
                <div key={`${snapshot.key}-${row.variant}`} className="rounded-md border px-2 py-1.5 text-xs">
                  <p className="font-medium capitalize">
                    {row.variant.replaceAll("_", " ")}
                  </p>
                  <p className="text-muted-foreground">
                    {row.impressions} impressions · {row.clicks} clicks ·{" "}
                    {(row.ctr * 100).toFixed(1)}% CTR
                  </p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>

      {lastResetAt ? (
        <p className="text-muted-foreground text-xs">
          Reset completed at {lastResetAt}.
        </p>
      ) : null}
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";

type VariantStats = Record<string, { impressions: number; clicks: number }>;

interface ExperimentConfig {
  key: string;
  label: string;
  variants: readonly string[];
}

interface RankedVariant {
  experiment: string;
  variant: string;
  impressions: number;
  clicks: number;
  ctr: number;
}

const EXPERIMENTS: readonly ExperimentConfig[] = [
  { key: "public_view_mode_v1", label: "Public view mode", variants: ["standard", "luxury"] },
  { key: "home_growth_v1", label: "Home growth", variants: ["clarity", "momentum"] },
  { key: "explore_growth_v1", label: "Explore growth", variants: ["discovery", "filter_first"] },
];

function readStats(key: string): VariantStats {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(`ax-exp-stats:${key}`);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as VariantStats;
  } catch {
    return {};
  }
}

export function ExperimentLeaderboard() {
  const [version, setVersion] = useState(0);

  const ranked = useMemo(() => {
    void version;
    if (typeof window === "undefined") return [];
    const rows: RankedVariant[] = [];
    for (const exp of EXPERIMENTS) {
      const stats = readStats(exp.key);
      for (const variant of exp.variants) {
        const impressions = stats[variant]?.impressions ?? 0;
        const clicks = stats[variant]?.clicks ?? 0;
        const ctr = impressions > 0 ? clicks / impressions : 0;
        rows.push({
          experiment: exp.label,
          variant,
          impressions,
          clicks,
          ctr,
        });
      }
    }
    return rows.sort((a, b) => b.ctr - a.ctr).slice(0, 6);
  }, [version]);

  return (
    <section className="glass-panel rounded-xl border p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Experiment leaderboard</h3>
        <button
          type="button"
          onClick={() => setVersion((v) => v + 1)}
          className="bg-secondary hover:bg-accent rounded-full px-3 py-1 text-xs"
        >
          Refresh
        </button>
      </div>
      {ranked.length === 0 ? (
        <p className="text-muted-foreground text-xs">
          No local experiment data yet. Browse the app to accumulate impressions.
        </p>
      ) : (
        <ul className="space-y-2 text-xs">
          {ranked.map((row) => (
            <li key={`${row.experiment}:${row.variant}`} className="rounded-md border bg-muted/25 px-2 py-1.5">
              <p className="font-medium">
                {row.experiment} · {row.variant.replaceAll("_", " ")}
              </p>
              <p className="text-muted-foreground">
                {(row.ctr * 100).toFixed(1)}% CTR · {row.clicks} clicks / {row.impressions} impressions
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

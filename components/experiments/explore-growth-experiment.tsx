"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Filter, Flame, Layers3 } from "lucide-react";
import { useAdaptiveExperiment } from "@/components/experiments/use-adaptive-experiment";

type Variant = "discovery" | "filter_first";

export function ExploreGrowthExperiment() {
  const { variant, trackClick, trackSignal } = useAdaptiveExperiment<Variant>({
    experimentKey: "explore_growth_v1",
    surface: "explore",
    variants: ["discovery", "filter_first"],
  });

  useEffect(() => {
    trackSignal("surface_engaged");
  }, [trackSignal]);

  if (variant === "filter_first") {
    return (
      <section className="glass-panel rounded-xl border p-4 space-y-3">
        <p className="text-sm font-semibold">Filter first for faster relevance</p>
        <p className="text-muted-foreground text-sm">
          Choose a ticker lane before you browse to cut decision fatigue.
        </p>
        <div className="flex flex-wrap gap-2">
          {["SPY", "QQQ", "NVDA", "AAPL"].map((ticker) => (
            <Link
              key={ticker}
              href={`/explore?ticker=${ticker}`}
              onClick={() => {
                trackClick(`filter_${ticker.toLowerCase()}`);
                trackSignal("route_intent", { destination: `ticker_${ticker.toLowerCase()}` });
              }}
              className="bg-secondary hover:bg-accent inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium"
            >
              <Filter className="size-3.5" />
              ${ticker}
            </Link>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="glass-panel rounded-xl border p-4 space-y-3">
      <p className="text-sm font-semibold">Discover what is moving now</p>
      <p className="text-muted-foreground text-sm">
        Start broad, then narrow with ticker tags as you find creators you like.
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        <Link
          href="/live"
          onClick={() => {
            trackClick("discover_live");
            trackSignal("route_intent", { destination: "live" });
          }}
          className="bg-secondary hover:bg-accent inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium"
        >
          <Flame className="size-3.5" />
          Live now
        </Link>
        <Link
          href="/explore"
          onClick={() => {
            trackClick("discover_recent");
            trackSignal("route_intent", { destination: "explore_recent" });
          }}
          className="bg-secondary hover:bg-accent inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium"
        >
          <Layers3 className="size-3.5" />
          Recent uploads
        </Link>
        <Link
          href="/pricing"
          onClick={() => {
            trackClick("discover_pricing");
            trackSignal("route_intent", { destination: "pricing" });
          }}
          className="bg-secondary hover:bg-accent inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium"
        >
          Creator plans
        </Link>
      </div>
    </section>
  );
}

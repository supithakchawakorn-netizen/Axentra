"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, Radio, Sparkles, Video } from "lucide-react";
import { useAdaptiveExperiment } from "@/components/experiments/use-adaptive-experiment";

type Variant = "clarity" | "momentum";

export function HomeGrowthExperiment() {
  const { variant, trackClick, trackSignal } = useAdaptiveExperiment<Variant>({
    experimentKey: "home_growth_v1",
    surface: "home",
    variants: ["clarity", "momentum"],
  });

  useEffect(() => {
    trackSignal("surface_engaged");
  }, [trackSignal]);

  return (
    <section className="glass-panel rounded-2xl border p-4 sm:p-5">
      {variant === "clarity" ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold">Start in under 30 seconds</p>
          <p className="text-muted-foreground text-sm">
            Jump straight to what you want: live streams, fresh videos, or creator tools.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/live"
              onClick={() => {
                trackClick("live_now");
                trackSignal("route_intent", { destination: "live" });
              }}
              className="bg-primary text-primary-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium"
            >
              <Radio className="size-3.5" />
              Watch live
            </Link>
            <Link
              href="/explore"
              onClick={() => {
                trackClick("explore_feed");
                trackSignal("route_intent", { destination: "explore" });
              }}
              className="bg-secondary text-secondary-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium"
            >
              <Video className="size-3.5" />
              Explore videos
            </Link>
            <Link
              href="/sign-in?next=/studio"
              onClick={() => {
                trackClick("start_creating");
                trackSignal("route_intent", { destination: "studio_signin" });
              }}
              className="bg-secondary text-secondary-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium"
            >
              Start creating
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="size-4 text-primary" />
            Market momentum is happening now
          </p>
          <p className="text-muted-foreground text-sm">
            People stay longer when they can immediately choose a path. Pick one lane and go.
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            <Link
              href="/live"
              onClick={() => {
                trackClick("momentum_live");
                trackSignal("route_intent", { destination: "live" });
              }}
              className="bg-secondary hover:bg-accent rounded-xl border px-3 py-2 text-sm font-medium"
            >
              I want live coverage
            </Link>
            <Link
              href="/explore"
              onClick={() => {
                trackClick("momentum_explore");
                trackSignal("route_intent", { destination: "explore" });
              }}
              className="bg-secondary hover:bg-accent rounded-xl border px-3 py-2 text-sm font-medium"
            >
              I want quick recaps
            </Link>
            <Link
              href="/sign-in?next=/studio"
              onClick={() => {
                trackClick("momentum_creator");
                trackSignal("route_intent", { destination: "studio_signin" });
              }}
              className="bg-secondary hover:bg-accent rounded-xl border px-3 py-2 text-sm font-medium"
            >
              I want to publish
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

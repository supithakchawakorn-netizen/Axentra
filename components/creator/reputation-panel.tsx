"use client";

import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";
import { Events } from "@/lib/posthog/events";

interface ReputationPanelProps {
  creatorId: string;
  insightQuality: number;
  consistency: number;
  transparency: number;
  communityTrust: number;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const score = clampScore(value);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{score}</span>
      </div>
      <div className="bg-muted h-2 rounded-full">
        <div
          className="bg-primary h-2 rounded-full transition-all"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function ReputationPanel({
  creatorId,
  insightQuality,
  consistency,
  transparency,
  communityTrust,
}: ReputationPanelProps) {
  const posthog = usePostHog();

  useEffect(() => {
    posthog?.capture(Events.ReputationPanelView, { creator_id: creatorId });
    posthog?.capture(Events.ReputationComponentView, {
      creator_id: creatorId,
      components: ["insight_quality", "consistency", "transparency", "community_trust"],
    });
  }, [creatorId, posthog]);

  return (
    <section className="glass-panel mt-8 rounded-xl border p-4 space-y-3">
      <h2 className="text-sm font-semibold">Reputation</h2>
      <p className="text-muted-foreground text-xs">
        Reputation = proven insight + consistency + integrity over time.
      </p>
      <ScoreBar label="Insight quality" value={insightQuality} />
      <ScoreBar label="Consistency" value={consistency} />
      <ScoreBar label="Transparency" value={transparency} />
      <ScoreBar label="Community trust" value={communityTrust} />
    </section>
  );
}


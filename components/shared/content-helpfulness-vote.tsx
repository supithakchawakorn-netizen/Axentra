"use client";

import { useState } from "react";
import { usePostHog } from "posthog-js/react";
import { Events } from "@/lib/posthog/events";

type ContentType = "video" | "live";
type MarketCategory = "stock" | "forex" | "crypto" | "mixed";

interface ContentHelpfulnessVoteProps {
  contentId: string;
  contentType: ContentType;
  marketCategory?: MarketCategory;
}

export function ContentHelpfulnessVote({
  contentId,
  contentType,
  marketCategory = "mixed",
}: ContentHelpfulnessVoteProps) {
  const posthog = usePostHog();
  const [vote, setVote] = useState<"helpful" | "not_helpful" | null>(null);

  function submit(nextVote: "helpful" | "not_helpful") {
    setVote(nextVote);
    posthog?.capture(
      nextVote === "helpful" ? Events.ContentHelpfulVote : Events.ContentNotHelpfulVote,
      {
        content_id: contentId,
        content_type: contentType,
        market_category: marketCategory,
      },
    );
  }

  return (
    <section className="glass-panel rounded-xl border p-3">
      <p className="text-sm font-medium">Was this useful?</p>
      <p className="text-muted-foreground mt-1 text-xs">
        Your feedback helps rank creators by trust and contribution.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => submit("helpful")}
          className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
            vote === "helpful"
              ? "border-primary bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          }`}
        >
          Helpful
        </button>
        <button
          type="button"
          onClick={() => submit("not_helpful")}
          className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
            vote === "not_helpful"
              ? "border-primary bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          }`}
        >
          Not helpful
        </button>
        {vote ? (
          <span className="text-muted-foreground text-xs">
            Feedback saved
          </span>
        ) : null}
      </div>
    </section>
  );
}


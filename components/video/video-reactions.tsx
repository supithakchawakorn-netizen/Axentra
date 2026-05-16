"use client";

import { useMemo, useState } from "react";
import { Share2, ThumbsDown, ThumbsUp } from "lucide-react";

type Reaction = "like" | "dislike" | null;

interface VideoReactionsProps {
  videoId: string;
  initialLikes: number;
  initialDislikes: number;
}

function compactCount(value: number): string {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(Math.max(0, value));
}

export function VideoReactions({
  videoId,
  initialLikes,
  initialDislikes,
}: VideoReactionsProps) {
  const [reaction, setReaction] = useState<Reaction>(null);
  const [copied, setCopied] = useState(false);

  const counts = useMemo(() => {
    let likes = initialLikes;
    let dislikes = initialDislikes;
    if (reaction === "like") likes += 1;
    if (reaction === "dislike") dislikes += 1;
    return { likes, dislikes };
  }, [initialLikes, initialDislikes, reaction]);

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/v/${videoId}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="bg-secondary inline-flex items-center rounded-full">
        <button
          type="button"
          onClick={() => setReaction((prev) => (prev === "like" ? null : "like"))}
          className={`inline-flex min-h-10 items-center gap-1.5 rounded-l-full px-3 py-2 text-sm font-medium transition-colors ${
            reaction === "like" ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"
          }`}
          aria-pressed={reaction === "like"}
        >
          <ThumbsUp className="size-3.5" />
          {compactCount(counts.likes)}
        </button>
        <div className="bg-border h-5 w-px" />
        <button
          type="button"
          onClick={() => setReaction((prev) => (prev === "dislike" ? null : "dislike"))}
          className={`inline-flex min-h-10 items-center gap-1.5 rounded-r-full px-3 py-2 text-sm font-medium transition-colors ${
            reaction === "dislike" ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"
          }`}
          aria-pressed={reaction === "dislike"}
        >
          <ThumbsDown className="size-3.5" />
          {compactCount(counts.dislikes)}
        </button>
      </div>
      <button
        type="button"
        onClick={handleShare}
        className="bg-secondary hover:bg-accent inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors"
      >
        <Share2 className="size-3.5" />
        {copied ? "Copied" : "Share"}
      </button>
    </div>
  );
}

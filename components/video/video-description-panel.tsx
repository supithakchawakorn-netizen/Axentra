"use client";

import { useMemo, useState } from "react";
import { formatDate, formatRelativeDate } from "@/lib/utils/format";

interface VideoDescriptionPanelProps {
  description: string;
  publishedAt?: string | null;
  commentCount: number;
}

export function VideoDescriptionPanel({
  description,
  publishedAt,
  commentCount,
}: VideoDescriptionPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = description.length > 220 || description.includes("\n");

  const publishedLabel = useMemo(() => {
    if (!publishedAt) return null;
    return `${formatRelativeDate(publishedAt)} (${formatDate(publishedAt)})`;
  }, [publishedAt]);

  return (
    <section className="bg-muted/50 rounded-xl border p-4">
      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {publishedLabel ? <span>Published {publishedLabel}</span> : null}
        <span>{commentCount.toLocaleString("en")} comments</span>
      </div>
      <p
        className={`readable-copy whitespace-pre-wrap text-sm ${
          expanded ? "text-foreground" : "line-clamp-4 text-muted-foreground"
        }`}
      >
        {description}
      </p>
      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      ) : null}
    </section>
  );
}

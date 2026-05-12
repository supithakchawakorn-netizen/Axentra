"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getWatchSessions, type WatchSessionItem } from "@/lib/utils/watch-session";

interface ContinueWatchingStripProps {
  title?: string;
  subtitle?: string;
  maxItems?: number;
  excludeVideoId?: string;
  creatorHandle?: string;
}

function formatProgress(progressPct: number): string {
  if (progressPct >= 95) return "Almost done";
  if (progressPct <= 5) return "Just started";
  return `${Math.round(progressPct)}% watched`;
}

export function ContinueWatchingStrip({
  title = "Continue watching",
  subtitle = "Pick up your last sessions.",
  maxItems = 8,
  excludeVideoId,
  creatorHandle,
}: ContinueWatchingStripProps) {
  const [items, setItems] = useState<WatchSessionItem[]>(() =>
    typeof window === "undefined" ? [] : getWatchSessions(),
  );

  useEffect(() => {
    function refreshFromStorage() {
      setItems(getWatchSessions());
    }
    window.addEventListener("storage", refreshFromStorage);
    window.addEventListener("focus", refreshFromStorage);
    return () => {
      window.removeEventListener("storage", refreshFromStorage);
      window.removeEventListener("focus", refreshFromStorage);
    };
  }, []);

  const filtered = useMemo(
    () =>
      items
        .filter(
          (item) =>
            item.videoId !== excludeVideoId &&
            (!creatorHandle || item.creatorHandle === creatorHandle),
        )
        .slice(0, maxItems),
    [creatorHandle, excludeVideoId, items, maxItems],
  );

  if (filtered.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="border-b pb-2">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="text-muted-foreground text-xs sm:text-sm">{subtitle}</p>
      </div>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
        {filtered.map((item) => (
          <Link
            key={item.videoId}
            href={
              item.lastPositionSeconds && item.lastPositionSeconds > 0
                ? `${item.href}?t=${item.lastPositionSeconds}`
                : item.href
            }
            prefetch={false}
            className="glass-panel w-[82%] min-w-[82%] snap-start rounded-xl border p-3 hover:bg-muted/40"
          >
            <p className="line-clamp-2 text-sm font-medium">{item.title}</p>
            {item.creatorLabel ? (
              <p className="text-muted-foreground mt-1 truncate text-xs">{item.creatorLabel}</p>
            ) : null}
            <div className="mt-2 space-y-1">
              <div className="bg-muted h-1.5 rounded-full">
                <div
                  className="bg-primary h-full rounded-full transition-all"
                  style={{ width: `${Math.max(4, item.progressPct)}%` }}
                />
              </div>
              <p className="text-muted-foreground text-[11px]">
                {formatProgress(item.progressPct)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}


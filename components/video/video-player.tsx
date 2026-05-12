"use client";

import { useEffect, useRef } from "react";
import { usePostHog } from "posthog-js/react";
import { Events } from "@/lib/posthog/events";
import { saveWatchSession } from "@/lib/utils/watch-session";

interface VideoPlayerProps {
  playbackId?: string | null;
  playbackUrl?: string | null;
  title: string;
  videoId: string;
  poster?: string;
  creatorLabel?: string;
  creatorHandle?: string;
  durationSeconds?: number | null;
  startAtSeconds?: number;
  status?: "pending" | "processing" | "ready" | "errored";
}

export function VideoPlayer({
  playbackId,
  playbackUrl,
  title,
  videoId,
  poster,
  creatorLabel,
  creatorHandle,
  durationSeconds,
  startAtSeconds,
  status,
}: VideoPlayerProps) {
  const posthog = usePostHog();
  const firedMilestones = useRef<Set<number>>(new Set());
  const lastPersistedSecond = useRef<number>(-1);
  const hasAppliedDeepLinkSeek = useRef<boolean>(false);

  useEffect(() => {
    posthog?.capture(Events.VideoView, { video_id: videoId });
  }, [posthog, videoId]);

  useEffect(() => {
    firedMilestones.current.clear();
    lastPersistedSecond.current = -1;
    hasAppliedDeepLinkSeek.current = false;
  }, [videoId]);

  function persistSession(currentTime: number, duration: number) {
    const rounded = Math.max(0, Math.floor(currentTime));
    if (
      rounded !== 0 &&
      rounded !== Math.floor(duration) &&
      Math.abs(rounded - lastPersistedSecond.current) < 8
    ) {
      return;
    }
    lastPersistedSecond.current = rounded;
    saveWatchSession({
      videoId,
      title,
      href: `/v/${videoId}`,
      creatorLabel,
      creatorHandle,
      thumbnailUrl: poster,
      progressPct: (currentTime / duration) * 100,
      durationSeconds: durationSeconds ?? duration,
      lastPositionSeconds: rounded,
    });
  }

  function trackQuartiles(progressPercent: number) {
    const milestones = [
      { pct: 25, event: Events.Video25 },
      { pct: 50, event: Events.Video50 },
      { pct: 75, event: Events.Video75 },
      { pct: 100, event: Events.Video100 },
    ] as const;

    for (const milestone of milestones) {
      if (
        progressPercent >= milestone.pct &&
        !firedMilestones.current.has(milestone.pct)
      ) {
        firedMilestones.current.add(milestone.pct);
        posthog?.capture(milestone.event, { video_id: videoId });
      }
    }
  }

  function applyStartOffset(target: { currentTime?: number; duration?: number }) {
    if (!startAtSeconds || startAtSeconds <= 0 || hasAppliedDeepLinkSeek.current) {
      return;
    }
    if (!target.duration || target.duration <= 0) {
      return;
    }
    target.currentTime = Math.min(startAtSeconds, Math.max(0, target.duration - 1));
    hasAppliedDeepLinkSeek.current = true;
  }

  function handleProgress(target: { currentTime?: number; duration?: number }) {
    if (!target.duration || target.duration <= 0 || !target.currentTime) {
      return;
    }
    const progressPct = (target.currentTime / target.duration) * 100;
    trackQuartiles(progressPct);
    persistSession(target.currentTime, target.duration);
  }

  function handleNativeLoadedMetadata(event: { currentTarget: EventTarget & HTMLVideoElement }) {
    applyStartOffset(event.currentTarget);
  }

  function handleNativeTimeUpdate(event: { currentTarget: EventTarget & HTMLVideoElement }) {
    handleProgress(event.currentTarget);
  }

  const src: string | null = playbackId
    ? `https://stream.mux.com/${playbackId}.m3u8`
    : (playbackUrl ?? null);

  if (!src) {
    return (
      <div className="bg-muted flex aspect-video items-center justify-center rounded-lg">
        <p className="text-muted-foreground text-sm">
          {status === "processing" ? "Still processing…" : "Video unavailable."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-muted overflow-hidden rounded-lg border">
      <video
        src={src}
        controls
        playsInline
        preload="metadata"
        poster={poster}
        onPlay={() => posthog?.capture(Events.VideoPlay, { video_id: videoId })}
        onLoadedMetadata={handleNativeLoadedMetadata}
        onTimeUpdate={handleNativeTimeUpdate}
        className="aspect-video w-full rounded-lg"
      />
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import MuxPlayer from "@mux/mux-player-react";
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

  function handleMuxLoadedMetadata(event: unknown) {
    const target = (event as { currentTarget?: { currentTime?: number; duration?: number } })
      .currentTarget;
    if (!target) return;
    applyStartOffset(target);
  }

  function handleMuxTimeUpdate(event: unknown) {
    const target = (event as { currentTarget?: { currentTime?: number; duration?: number } })
      .currentTarget;
    if (!target) return;
    handleProgress(target);
  }

  if (!playbackId && !playbackUrl) {
    return (
      <p className="text-muted-foreground px-3 py-2 text-sm">
        Video not available yet.
      </p>
    );
  }

  return (
    <div className="bg-muted overflow-hidden rounded-lg border">
      {playbackId ? (
        <MuxPlayer
          playbackId={playbackId}
          metadata={{ video_id: videoId, video_title: title }}
          poster={poster}
          onPlay={() => posthog?.capture(Events.VideoPlay, { video_id: videoId })}
          onLoadedMetadata={handleMuxLoadedMetadata}
          onTimeUpdate={handleMuxTimeUpdate}
          accentColor="#fafafa"
          style={{ width: "100%", aspectRatio: "16 / 9" }}
        />
      ) : (
        <video
          controls
          playsInline
          preload="metadata"
          poster={poster}
          src={playbackUrl ?? undefined}
          onPlay={() => posthog?.capture(Events.VideoPlay, { video_id: videoId })}
          onLoadedMetadata={handleNativeLoadedMetadata}
          onTimeUpdate={handleNativeTimeUpdate}
          className="w-full"
          style={{ aspectRatio: "16 / 9" }}
        />
      )}
    </div>
  );
}

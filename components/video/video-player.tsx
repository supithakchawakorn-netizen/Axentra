"use client";

import { useEffect } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { usePostHog } from "posthog-js/react";
import { Events } from "@/lib/posthog/events";

interface VideoPlayerProps {
  playbackId: string;
  title: string;
  videoId: string;
  poster?: string;
}

export function VideoPlayer({ playbackId, title, videoId, poster }: VideoPlayerProps) {
  const posthog = usePostHog();

  useEffect(() => {
    posthog?.capture(Events.VideoView, { video_id: videoId });
  }, [posthog, videoId]);

  return (
    <div className="bg-muted overflow-hidden rounded-lg border">
      <MuxPlayer
        playbackId={playbackId}
        metadata={{ video_id: videoId, video_title: title }}
        poster={poster}
        onPlay={() => posthog?.capture(Events.VideoPlay, { video_id: videoId })}
        accentColor="#fafafa"
        style={{ width: "100%", aspectRatio: "16 / 9" }}
      />
    </div>
  );
}

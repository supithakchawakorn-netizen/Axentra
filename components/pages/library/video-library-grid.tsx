"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { PublicVideoSummary } from "@/lib/data/videos";
import { VideoCard } from "@/components/video/video-card";
import { getWatchSessions, type WatchSessionItem } from "@/lib/utils/watch-session";
import { getVideoPlatformLibraryState } from "@/lib/utils/video-platform-library";

interface VideoLibraryGridProps {
  videos: PublicVideoSummary[];
  mode: "subscriptions" | "liked" | "history" | "watch-later";
  emptyTitle: string;
  emptyDescription: string;
}

export function VideoLibraryGrid({
  videos,
  mode,
  emptyTitle,
  emptyDescription,
}: VideoLibraryGridProps) {
  const initialState = useMemo(() => {
    const state = getVideoPlatformLibraryState();
    return {
      watchHistory: getWatchSessions(),
      subscribedCreatorIds: state.subscribedCreatorIds,
      likedVideoIds: state.likedVideoIds,
      watchLaterVideoIds: state.watchLaterVideoIds,
    };
  }, []);

  const [watchHistory] = useState<WatchSessionItem[]>(initialState.watchHistory);
  const [subscribedCreatorIds] = useState<string[]>(initialState.subscribedCreatorIds);
  const [likedVideoIds] = useState<string[]>(initialState.likedVideoIds);
  const [watchLaterVideoIds] = useState<string[]>(initialState.watchLaterVideoIds);

  const filteredVideos = useMemo(() => {
    if (mode === "subscriptions") {
      const ids = new Set(subscribedCreatorIds);
      return videos.filter((video) => (video.creator?.id ? ids.has(video.creator.id) : false));
    }
    if (mode === "liked") {
      const ids = new Set(likedVideoIds);
      return videos.filter((video) => ids.has(video.id));
    }
    if (mode === "watch-later") {
      const ids = new Set(watchLaterVideoIds);
      return videos.filter((video) => ids.has(video.id));
    }
    if (mode === "history") {
      const byId = new Map(videos.map((video) => [video.id, video]));
      return watchHistory
        .map((session) => byId.get(session.videoId))
        .filter((video): video is PublicVideoSummary => !!video);
    }
    return [];
  }, [videos, mode, subscribedCreatorIds, likedVideoIds, watchLaterVideoIds, watchHistory]);

  if (filteredVideos.length === 0) {
    return (
      <div className="glass-panel rounded-xl border p-6">
        <h2 className="text-base font-semibold">{emptyTitle}</h2>
        <p className="text-muted-foreground mt-1 text-sm">{emptyDescription}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link href="/explore" className="rounded-full border px-3 py-1.5 text-sm hover:bg-muted/60">
            Explore videos
          </Link>
          <Link href="/feed/trending" className="rounded-full border px-3 py-1.5 text-sm hover:bg-muted/60">
            Open trending
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filteredVideos.map((video) => (
        <VideoCard key={`${mode}-${video.id}`} video={video} />
      ))}
    </div>
  );
}

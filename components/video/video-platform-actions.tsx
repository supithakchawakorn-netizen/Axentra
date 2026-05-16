"use client";

import { useState } from "react";
import { Bell, BellOff, Bookmark, BookmarkCheck, Heart } from "lucide-react";
import {
  getVideoPlatformLibraryState,
  toggleLikedVideo,
  toggleSubscribedCreator,
  toggleWatchLaterVideo,
} from "@/lib/utils/video-platform-library";

interface VideoPlatformActionsProps {
  videoId: string;
  creatorId?: string | null;
}

export function VideoPlatformActions({ videoId, creatorId }: VideoPlatformActionsProps) {
  const [state, setState] = useState(() => {
    const state = getVideoPlatformLibraryState();
    return {
      liked: state.likedVideoIds.includes(videoId),
      saved: state.watchLaterVideoIds.includes(videoId),
      subscribed: creatorId ? state.subscribedCreatorIds.includes(creatorId) : false,
    };
  });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => {
          const next = toggleLikedVideo(videoId);
          setState((current) => ({ ...current, liked: next.likedVideoIds.includes(videoId) }));
        }}
        className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
          state.liked ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"
        }`}
      >
        <Heart className="size-3.5" />
        {state.liked ? "Liked" : "Like"}
      </button>
      <button
        type="button"
        onClick={() => {
          const next = toggleWatchLaterVideo(videoId);
          setState((current) => ({
            ...current,
            saved: next.watchLaterVideoIds.includes(videoId),
          }));
        }}
        className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
          state.saved ? "bg-secondary" : "hover:bg-muted"
        }`}
      >
        {state.saved ? <BookmarkCheck className="size-3.5" /> : <Bookmark className="size-3.5" />}
        {state.saved ? "Saved" : "Watch later"}
      </button>
      {creatorId ? (
        <button
          type="button"
          onClick={() => {
            const next = toggleSubscribedCreator(creatorId);
            setState((current) => ({
              ...current,
              subscribed: next.subscribedCreatorIds.includes(creatorId),
            }));
          }}
          className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
            state.subscribed ? "bg-secondary" : "hover:bg-muted"
          }`}
        >
          {state.subscribed ? <BellOff className="size-3.5" /> : <Bell className="size-3.5" />}
          {state.subscribed ? "Subscribed" : "Subscribe"}
        </button>
      ) : null}
    </div>
  );
}

import "server-only";

import { DEMO_LIVE_ROOMS, DEMO_VIDEOS } from "@/lib/data/demo-content";

export const DEMO_STUDIO_PROFILE = {
  id: "demo-creator-1",
  handle: "marketpulse",
  display_name: "Market Pulse",
  avatar_url:
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
  banner_url:
    "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&w=1600&q=80",
  bio: "Macro + intraday creator. Read-only broker verified in full mode.",
  verified_broker: true,
} as const;

export function listDemoStudioVideos() {
  return DEMO_VIDEOS.map((video, index) => ({
    id: video.id,
    title: video.title,
    description: video.description,
    status: "ready" as const,
    visibility: index % 4 === 0 ? ("unlisted" as const) : ("public" as const),
    duration_seconds: video.duration_seconds,
    thumbnail_url: video.thumbnail_url,
    mux_playback_id: video.mux_playback_id,
    published_at: video.published_at,
    created_at: video.published_at,
    updated_at: video.published_at,
    ticker_ids: [],
  }));
}

export function listDemoStudioRooms() {
  const endedRoom = {
    ...DEMO_LIVE_ROOMS[0],
    id: "demo-room-ended-1",
    status: "ended" as const,
    viewer_count: 0,
    ended_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    started_at: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    recording_video_id: DEMO_VIDEOS[0]?.id ?? null,
  };
  return [...DEMO_LIVE_ROOMS, endedRoom];
}

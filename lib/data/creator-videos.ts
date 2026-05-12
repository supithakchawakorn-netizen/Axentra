import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";

export interface CreatorVideoRow {
  id: string;
  title: string;
  description: string;
  status: "pending" | "processing" | "ready" | "errored";
  visibility: "public" | "unlisted";
  duration_seconds: number | null;
  thumbnail_url: string | null;
  mux_playback_id: string | null;
  playback_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  ticker_ids: string[];
}

export async function listOwnVideos(): Promise<CreatorVideoRow[]> {
  if (!supabaseConfigured()) return [];
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("videos")
    .select(
      "id, title, description, status, visibility, duration_seconds, thumbnail_url, mux_playback_id, playback_url, published_at, created_at, updated_at, video_tickers(ticker_id)",
    )
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[listOwnVideos]", error.message);
    return [];
  }
  type Raw = Omit<CreatorVideoRow, "ticker_ids"> & {
    video_tickers: { ticker_id: string }[] | null;
  };
  const rows = (data ?? []) as unknown as Raw[];
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    status: r.status,
    visibility: r.visibility,
    duration_seconds: r.duration_seconds,
    thumbnail_url: r.thumbnail_url,
    mux_playback_id: r.mux_playback_id,
    playback_url: r.playback_url,
    published_at: r.published_at,
    created_at: r.created_at,
    updated_at: r.updated_at,
    ticker_ids: (r.video_tickers ?? []).map((vt) => vt.ticker_id),
  }));
}

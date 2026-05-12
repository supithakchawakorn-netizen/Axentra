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

type RawVideoRow = Omit<CreatorVideoRow, "ticker_ids"> & {
  video_tickers: { ticker_id: string }[] | null;
};

function mapRow(row: RawVideoRow): CreatorVideoRow {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    visibility: row.visibility,
    duration_seconds: row.duration_seconds,
    thumbnail_url: row.thumbnail_url,
    mux_playback_id: row.mux_playback_id,
    playback_url: row.playback_url,
    published_at: row.published_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    ticker_ids: (row.video_tickers ?? []).map((vt) => vt.ticker_id),
  };
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
  const rows = (data ?? []) as unknown as RawVideoRow[];
  return rows.map(mapRow);
}

export async function getOwnVideo(videoId: string): Promise<CreatorVideoRow | null> {
  if (!supabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("videos")
    .select(
      "id, title, description, status, visibility, duration_seconds, thumbnail_url, mux_playback_id, playback_url, published_at, created_at, updated_at, video_tickers(ticker_id)",
    )
    .eq("id", videoId)
    .eq("creator_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[getOwnVideo]", error.message);
    return null;
  }
  if (!data) return null;
  return mapRow(data as unknown as RawVideoRow);
}

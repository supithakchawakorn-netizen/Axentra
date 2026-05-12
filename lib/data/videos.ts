import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";
import {
  getDemoVideo,
  getDemoRoom,
  getDemoTickerBySymbol,
  listDemoVideos,
} from "@/lib/data/demo-content";

export interface PublicVideoSummary {
  id: string;
  title: string;
  description: string;
  duration_seconds: number | null;
  thumbnail_url: string | null;
  mux_playback_id: string | null;
  playback_url: string | null;
  published_at: string | null;
  creator: {
    id: string;
    handle: string;
    display_name: string | null;
    avatar_url: string | null;
    verified_broker?: boolean;
  } | null;
}

export interface PublicVideoDetail extends PublicVideoSummary {
  visibility: "public" | "unlisted";
  status: "pending" | "processing" | "ready" | "errored";
}

interface VideoRow {
  id: string;
  title: string;
  description: string;
  duration_seconds: number | null;
  thumbnail_url: string | null;
  mux_playback_id: string | null;
  playback_url: string | null;
  published_at: string | null;
  creator_id: string;
  status: "pending" | "processing" | "ready" | "errored";
  visibility: "public" | "unlisted";
  profiles: {
    id: string;
    handle: string;
    display_name: string | null;
    avatar_url: string | null;
    verified_broker?: boolean;
  } | null;
}

const SELECT_PUBLIC = `
  id, title, description, duration_seconds, thumbnail_url, mux_playback_id, playback_url,
  published_at, creator_id, status, visibility,
  profiles:creator_id ( id, handle, display_name, avatar_url, verified_broker )
`;

function rowToSummary(row: VideoRow): PublicVideoSummary {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    duration_seconds: row.duration_seconds,
    thumbnail_url: row.thumbnail_url,
    mux_playback_id: row.mux_playback_id,
    playback_url: row.playback_url,
    published_at: row.published_at,
    creator: row.profiles,
  };
}

export async function listRecentPublishedVideos(params: {
  limit: number;
}): Promise<PublicVideoSummary[]> {
  if (!supabaseConfigured()) {
    return listDemoVideos(params.limit) as unknown as PublicVideoSummary[];
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("videos")
    .select(SELECT_PUBLIC)
    .eq("status", "ready")
    .eq("visibility", "public")
    .order("published_at", { ascending: false })
    .limit(params.limit);
  if (error) {
    console.error("[listRecentPublishedVideos]", error.message);
    return listDemoVideos(params.limit) as unknown as PublicVideoSummary[];
  }
  const mapped = ((data ?? []) as unknown as VideoRow[]).map(rowToSummary);
  return mapped.length > 0
    ? mapped
    : (listDemoVideos(params.limit) as unknown as PublicVideoSummary[]);
}

export async function listVideosByCreator(params: {
  creatorId: string;
  includeUnpublished: boolean;
}): Promise<PublicVideoSummary[]> {
  if (!supabaseConfigured()) return [];
  const supabase = await createClient();
  let query = supabase
    .from("videos")
    .select(SELECT_PUBLIC)
    .eq("creator_id", params.creatorId);
  if (!params.includeUnpublished) {
    query = query.eq("status", "ready").eq("visibility", "public");
  }
  const { data, error } = await query.order("published_at", {
    ascending: false,
  });
  if (error) {
    console.error("[listVideosByCreator]", error.message);
    return [];
  }
  return ((data ?? []) as unknown as VideoRow[]).map(rowToSummary);
}

export async function listVideoTickers(
  videoId: string,
): Promise<{ id: string; symbol: string; name: string }[]> {
  const demoVideo = getDemoVideo(videoId);
  if (demoVideo) {
    return demoVideo.tickers
      .map((symbol) => getDemoTickerBySymbol(symbol))
      .filter((ticker): ticker is NonNullable<ReturnType<typeof getDemoTickerBySymbol>> => !!ticker)
      .map((ticker) => ({ id: ticker.id, symbol: ticker.symbol, name: ticker.name }));
  }
  if (!supabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("video_tickers")
    .select("ticker:tickers(id, symbol, name)")
    .eq("video_id", videoId);
  type Row = { ticker: { id: string; symbol: string; name: string } | null };
  const rows = (data as Row[] | null) ?? [];
  return rows.map((r) => r.ticker).filter(
    (t): t is NonNullable<Row["ticker"]> => !!t,
  );
}

export async function listRoomTickers(
  roomId: string,
): Promise<{ id: string; symbol: string; name: string }[]> {
  const demoRoom = getDemoRoom(roomId);
  if (demoRoom) {
    return demoRoom.tickers
      .map((symbol) => getDemoTickerBySymbol(symbol))
      .filter((ticker): ticker is NonNullable<ReturnType<typeof getDemoTickerBySymbol>> => !!ticker)
      .map((ticker) => ({ id: ticker.id, symbol: ticker.symbol, name: ticker.name }));
  }
  if (!supabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("room_tickers")
    .select("ticker:tickers(id, symbol, name)")
    .eq("room_id", roomId);
  type Row = { ticker: { id: string; symbol: string; name: string } | null };
  const rows = (data as Row[] | null) ?? [];
  return rows.map((r) => r.ticker).filter(
    (t): t is NonNullable<Row["ticker"]> => !!t,
  );
}

export async function getPublicVideo(id: string): Promise<PublicVideoDetail | null> {
  const demo = getDemoVideo(id);
  if (demo) {
    return {
      ...(demo as unknown as PublicVideoSummary),
      visibility: "public",
      status: "ready",
    };
  }
  if (!supabaseConfigured()) {
    return null;
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("videos")
    .select(SELECT_PUBLIC)
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[getPublicVideo]", error.message);
    return null;
  }
  if (!data) return null;
  const row = data as unknown as VideoRow;
  if (row.status !== "ready" || row.visibility !== "public") return null;
  return {
    ...rowToSummary(row),
    status: row.status,
    visibility: row.visibility,
  };
}

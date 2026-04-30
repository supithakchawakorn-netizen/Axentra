import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";
import { TICKER_PROMPT_VERSION } from "@/lib/openai/prompts/ticker";
import {
  getDemoTickerBySymbol,
  listDemoLiveRoomsForTicker,
  listDemoTopTickers,
  listDemoVideosForTicker,
} from "@/lib/data/demo-content";

export interface TickerRow {
  id: string;
  symbol: string;
  name: string;
  exchange: string | null;
  country: string | null;
}

export interface TickerSummaryRow {
  body: string;
  generated_at: string;
  expires_at: string;
}

export interface TickerNewsSummaryRow {
  body: string;
  as_of_date: string;
  generated_at: string;
}

export async function getTickerBySymbol(symbol: string): Promise<TickerRow | null> {
  const demo = getDemoTickerBySymbol(symbol);
  if (demo) {
    return demo as unknown as TickerRow;
  }
  if (!supabaseConfigured()) {
    return null;
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("tickers")
    .select("id, symbol, name, exchange, country")
    .eq("symbol", symbol.toUpperCase())
    .maybeSingle();
  return (data as TickerRow | null) ?? null;
}

export async function searchTickers(query: string, limit = 10): Promise<TickerRow[]> {
  if (!supabaseConfigured()) return [];
  const q = query.trim();
  if (!q) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("tickers")
    .select("id, symbol, name, exchange, country")
    .or(`symbol.ilike.${q}%,name.ilike.%${q}%`)
    .limit(limit);
  return (data as TickerRow[] | null) ?? [];
}

export async function listTickersByIds(ids: string[]): Promise<TickerRow[]> {
  if (!supabaseConfigured()) return [];
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("tickers")
    .select("id, symbol, name, exchange, country")
    .in("id", ids);
  return (data as TickerRow[] | null) ?? [];
}

export async function getTickerSummary(tickerId: string): Promise<TickerSummaryRow | null> {
  if (!supabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("ticker_summaries")
    .select("body, generated_at, expires_at")
    .eq("ticker_id", tickerId)
    .eq("prompt_version", TICKER_PROMPT_VERSION)
    .maybeSingle();
  return (data as TickerSummaryRow | null) ?? null;
}

export async function getLatestNewsSummary(
  tickerId: string,
): Promise<TickerNewsSummaryRow | null> {
  if (!supabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("ticker_news_summaries")
    .select("body, as_of_date, generated_at")
    .eq("ticker_id", tickerId)
    .order("as_of_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as TickerNewsSummaryRow | null) ?? null;
}

export async function listVideosForTicker(tickerId: string, limit = 24) {
  if (!supabaseConfigured()) {
    const ticker = listDemoTopTickers(100).find((t) => t.id === tickerId);
    if (!ticker) return [];
    return listDemoVideosForTicker(ticker.symbol).slice(0, limit).map((video) => ({
      id: video.id,
      title: video.title,
      description: video.description,
      mux_playback_id: video.mux_playback_id,
      duration_seconds: video.duration_seconds,
      published_at: video.published_at,
      visibility: "public",
      status: "ready",
      creator_id: video.creator?.id ?? "demo-creator",
      profiles: video.creator
        ? {
            handle: video.creator.handle,
            display_name: video.creator.display_name,
            avatar_url: video.creator.avatar_url,
          }
        : null,
    }));
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("video_tickers")
    .select(
      "video:videos!inner(id, title, description, mux_playback_id, duration_seconds, published_at, visibility, status, creator_id, profiles:creator_id(handle, display_name, avatar_url))",
    )
    .eq("ticker_id", tickerId)
    .limit(limit);
  type Row = {
    video: {
      id: string;
      title: string;
      description: string | null;
      mux_playback_id: string | null;
      duration_seconds: number | null;
      published_at: string | null;
      visibility: string;
      status: string;
      creator_id: string;
      profiles: {
        handle: string;
        display_name: string | null;
        avatar_url: string | null;
      } | null;
    } | null;
  };
  const rows = (data as Row[] | null) ?? [];
  return rows
    .map((r) => r.video)
    .filter(
      (v): v is NonNullable<Row["video"]> =>
        !!v && v.visibility === "public" && v.status === "ready",
    );
}

export async function listLiveRoomsForTicker(tickerId: string, limit = 12) {
  if (!supabaseConfigured()) {
    const ticker = listDemoTopTickers(100).find((t) => t.id === tickerId);
    if (!ticker) return [];
    return listDemoLiveRoomsForTicker(ticker.symbol).slice(0, limit).map((room) => ({
      id: room.id,
      title: room.title,
      description: room.description,
      status: room.status,
      started_at: room.started_at,
      viewer_count: room.viewer_count,
      creator_id: room.creator?.id ?? "demo-creator",
      profiles: room.creator
        ? {
            handle: room.creator.handle,
            display_name: room.creator.display_name,
            avatar_url: room.creator.avatar_url,
          }
        : null,
    }));
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("room_tickers")
    .select(
      "room:live_rooms!inner(id, title, description, status, started_at, viewer_count, creator_id, profiles:creator_id(handle, display_name, avatar_url))",
    )
    .eq("ticker_id", tickerId)
    .limit(limit);
  type Row = {
    room: {
      id: string;
      title: string;
      description: string | null;
      status: string;
      started_at: string | null;
      viewer_count: number | null;
      creator_id: string;
      profiles: {
        handle: string;
        display_name: string | null;
        avatar_url: string | null;
      } | null;
    } | null;
  };
  const rows = (data as Row[] | null) ?? [];
  return rows
    .map((r) => r.room)
    .filter((r): r is NonNullable<Row["room"]> => !!r && r.status === "live");
}

export async function listTopTickers(limit = 12): Promise<TickerRow[]> {
  if (!supabaseConfigured()) {
    return listDemoTopTickers(limit) as unknown as TickerRow[];
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("tickers")
    .select("id, symbol, name, exchange, country")
    .order("symbol", { ascending: true })
    .limit(limit);
  const rows = (data as TickerRow[] | null) ?? [];
  return rows.length > 0 ? rows : (listDemoTopTickers(limit) as unknown as TickerRow[]);
}

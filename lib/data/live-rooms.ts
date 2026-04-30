import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";
import {
  getDemoRoom,
  listDemoLiveRooms,
} from "@/lib/data/demo-content";

export interface PublicLiveRoom {
  id: string;
  title: string;
  description: string;
  status: "scheduled" | "live" | "ended";
  livekit_room_name: string;
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  viewer_count: number;
  recording_video_id: string | null;
  creator: {
    id: string;
    handle: string;
    display_name: string | null;
    avatar_url: string | null;
    verified_broker: boolean;
  } | null;
}

interface RoomRow {
  id: string;
  title: string;
  description: string;
  status: "scheduled" | "live" | "ended";
  livekit_room_name: string;
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  viewer_count: number;
  recording_video_id: string | null;
  creator_id: string;
  profiles: {
    id: string;
    handle: string;
    display_name: string | null;
    avatar_url: string | null;
    verified_broker: boolean;
  } | null;
}

const SELECT_PUBLIC = `
  id, title, description, status, livekit_room_name, scheduled_at, started_at,
  ended_at, viewer_count, recording_video_id, creator_id,
  profiles:creator_id ( id, handle, display_name, avatar_url, verified_broker )
`;

function rowToRoom(row: RoomRow): PublicLiveRoom {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    livekit_room_name: row.livekit_room_name,
    scheduled_at: row.scheduled_at,
    started_at: row.started_at,
    ended_at: row.ended_at,
    viewer_count: row.viewer_count,
    recording_video_id: row.recording_video_id,
    creator: row.profiles,
  };
}

export async function listLiveRooms(): Promise<PublicLiveRoom[]> {
  if (!supabaseConfigured()) {
    return listDemoLiveRooms() as unknown as PublicLiveRoom[];
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("live_rooms")
    .select(SELECT_PUBLIC)
    .eq("status", "live")
    .order("viewer_count", { ascending: false });
  if (error) {
    console.error("[listLiveRooms]", error.message);
    return listDemoLiveRooms() as unknown as PublicLiveRoom[];
  }
  const mapped = ((data ?? []) as unknown as RoomRow[]).map(rowToRoom);
  return mapped.length > 0
    ? mapped
    : (listDemoLiveRooms() as unknown as PublicLiveRoom[]);
}

export async function getRoom(id: string): Promise<PublicLiveRoom | null> {
  const demo = getDemoRoom(id);
  if (demo) {
    return demo as unknown as PublicLiveRoom;
  }
  if (!supabaseConfigured()) {
    return null;
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("live_rooms")
    .select(SELECT_PUBLIC)
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[getRoom]", error.message);
    return null;
  }
  if (!data) return null;
  return rowToRoom(data as unknown as RoomRow);
}

export async function listRoomsByCreator(params: {
  creatorId: string;
}): Promise<PublicLiveRoom[]> {
  if (!supabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("live_rooms")
    .select(SELECT_PUBLIC)
    .eq("creator_id", params.creatorId)
    .in("status", ["scheduled", "live", "ended"])
    .order("started_at", { ascending: false, nullsFirst: false });
  if (error) {
    console.error("[listRoomsByCreator]", error.message);
    return [];
  }
  return ((data ?? []) as unknown as RoomRow[]).map(rowToRoom);
}

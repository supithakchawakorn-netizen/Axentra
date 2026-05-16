"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  CreateLiveRoomInputZ,
  EndLiveRoomInputZ,
  InviteCoHostInputZ,
  type CreateLiveRoomInput,
  type EndLiveRoomInput,
  type InviteCoHostInput,
} from "@/types/live";
import { mintCoHostToken, mintCreatorToken } from "@/lib/livekit";
import { captureServerEvent } from "@/lib/posthog/server";
import { Events } from "@/lib/posthog/events";
import { liveBuildingPaused, studioGuestModeEnabled } from "@/lib/env";

export interface CreateRoomResult {
  ok: true;
  roomId: string;
  livekitToken: string;
  livekitUrl: string;
  livekitRoomName: string;
}

export interface ActionError {
  ok: false;
  error: string;
}

export async function createLiveRoom(
  input: CreateLiveRoomInput,
): Promise<CreateRoomResult | ActionError> {
  if (liveBuildingPaused()) {
    return {
      ok: false,
      error: "Live creation is temporarily paused.",
    };
  }
  const parsed = CreateLiveRoomInputZ.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    if (studioGuestModeEnabled()) {
      return {
        ok: true,
        roomId: "demo-room-1",
        livekitToken: "guest-preview-token",
        livekitUrl: process.env.LIVEKIT_URL ?? "wss://guest-preview.invalid",
        livekitRoomName: "guest-preview-room",
      };
    }
    return { ok: false, error: "Not signed in." };
  }

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("display_name, handle")
    .eq("id", user.id)
    .maybeSingle();
  const profile = profileRow as { display_name: string | null; handle: string } | null;

  const livekitRoomName = `room-${crypto.randomUUID()}`;

  const { data: row, error } = await supabase
    .from("live_rooms")
    .insert({
      creator_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      status: "live",
      livekit_room_name: livekitRoomName,
      scheduled_at: parsed.data.scheduledAt ?? null,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error || !row) {
    return { ok: false, error: error?.message ?? "Could not create room." };
  }

  const roomId = (row as { id: string }).id;
  if (parsed.data.tickerIds.length > 0) {
    const tagRows = parsed.data.tickerIds.map((tid) => ({
      room_id: roomId,
      ticker_id: tid,
    }));
    const { error: tagErr } = await supabase
      .from("room_tickers")
      .insert(tagRows);
    if (tagErr) {
      await supabase.from("live_rooms").delete().eq("id", roomId).eq("creator_id", user.id);
      return { ok: false, error: `Could not attach topics: ${tagErr.message}` };
    }
  }

  let token;
  try {
    token = await mintCreatorToken({
      roomName: livekitRoomName,
      userId: user.id,
      displayName: profile?.display_name ?? `@${profile?.handle ?? "creator"}`,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not mint LiveKit token.";
    // Roll the room back since we can't broadcast.
    await supabase.from("live_rooms").delete().eq("id", roomId);
    return { ok: false, error: message };
  }

  await captureServerEvent({
    distinctId: user.id,
    event: Events.LiveRoomStart,
    properties: { room_id: roomId },
  });

  revalidatePath("/live");
  revalidatePath("/explore");
  revalidatePath("/");

  return {
    ok: true,
    roomId,
    livekitToken: token.token,
    livekitUrl: token.url,
    livekitRoomName,
  };
}

export async function endLiveRoom(
  input: EndLiveRoomInput,
): Promise<{ ok: boolean; error?: string }> {
  if (studioGuestModeEnabled()) {
    return { ok: true };
  }
  const parsed = EndLiveRoomInputZ.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    if (studioGuestModeEnabled()) return { ok: true };
    return { ok: false, error: "Not signed in." };
  }

  const { error } = await supabase
    .from("live_rooms")
    .update({ status: "ended", ended_at: new Date().toISOString() })
    .eq("id", parsed.data.roomId)
    .eq("creator_id", user.id);
  if (error) return { ok: false, error: error.message };

  await captureServerEvent({
    distinctId: user.id,
    event: Events.LiveRoomEnd,
    properties: { room_id: parsed.data.roomId },
  });

  revalidatePath("/live");
  revalidatePath("/explore");
  revalidatePath("/");
  revalidatePath(`/room/${parsed.data.roomId}`);
  return { ok: true };
}

/**
 * Re-mint a publisher token for the room owner. Called from the studio room
 * page on each load (tokens expire). Verifies ownership server-side.
 */
export async function getCreatorPublishToken(
  roomId: string,
): Promise<
  | { ok: true; livekitToken: string; livekitUrl: string; livekitRoomName: string; status: "scheduled" | "live" | "ended" }
  | ActionError
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    if (studioGuestModeEnabled()) {
      return {
        ok: true,
        livekitToken: "guest-preview-token",
        livekitUrl: process.env.LIVEKIT_URL ?? "wss://guest-preview.invalid",
        livekitRoomName: "guest-preview-room",
        status: "live",
      };
    }
    return { ok: false, error: "Not signed in." };
  }

  const { data: roomRow, error } = await supabase
    .from("live_rooms")
    .select("livekit_room_name, status, creator_id")
    .eq("id", roomId)
    .maybeSingle();
  if (error || !roomRow) {
    return { ok: false, error: "Room not found." };
  }
  const room = roomRow as {
    livekit_room_name: string;
    status: "scheduled" | "live" | "ended";
    creator_id: string;
  };
  if (room.creator_id !== user.id) {
    return { ok: false, error: "Not your room." };
  }
  if (room.status !== "live") {
    return { ok: false, error: "Room is not live." };
  }

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("display_name, handle")
    .eq("id", user.id)
    .maybeSingle();
  const profile = profileRow as { display_name: string | null; handle: string } | null;

  try {
    const token = await mintCreatorToken({
      roomName: room.livekit_room_name,
      userId: user.id,
      displayName: profile?.display_name ?? `@${profile?.handle ?? "creator"}`,
    });
    return {
      ok: true,
      livekitToken: token.token,
      livekitUrl: token.url,
      livekitRoomName: room.livekit_room_name,
      status: room.status,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not mint LiveKit token.";
    return { ok: false, error: message };
  }
}

export async function inviteCoHost(
  input: InviteCoHostInput,
): Promise<
  | { ok: true; livekitToken: string; livekitUrl: string }
  | ActionError
> {
  if (liveBuildingPaused()) {
    return { ok: false, error: "Live co-host invites are temporarily paused." };
  }
  const parsed = InviteCoHostInputZ.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    if (studioGuestModeEnabled()) {
      return {
        ok: true,
        livekitToken: "guest-cohost-token",
        livekitUrl: process.env.LIVEKIT_URL ?? "wss://guest-preview.invalid",
      };
    }
    return { ok: false, error: "Not signed in." };
  }

  const { data: roomRow, error } = await supabase
    .from("live_rooms")
    .select("livekit_room_name, status, creator_id")
    .eq("id", parsed.data.roomId)
    .maybeSingle();
  if (error || !roomRow) {
    return { ok: false, error: "Room not found." };
  }
  const room = roomRow as {
    livekit_room_name: string;
    status: string;
    creator_id: string;
  };
  if (room.creator_id !== user.id) {
    return { ok: false, error: "Not your room." };
  }
  if (room.status !== "live") {
    return { ok: false, error: "Room is not live." };
  }

  try {
    const token = await mintCoHostToken({
      roomName: room.livekit_room_name,
      inviteId: crypto.randomUUID(),
      displayName: parsed.data.displayName,
    });
    return { ok: true, livekitToken: token.token, livekitUrl: token.url };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not mint co-host token.";
    return { ok: false, error: message };
  }
}

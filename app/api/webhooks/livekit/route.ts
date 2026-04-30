import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { receiveWebhook, startRoomEgress } from "@/lib/livekit";
import { createAssetFromUrl } from "@/lib/mux";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * LiveKit webhook handler.
 *
 * Order of operations (AGENTS.md §10):
 *   1. Read raw body
 *   2. Verify signature (LiveKit puts a signed JWT in the Authorization header)
 *   3. Service-role write
 *
 * Events handled:
 *   - room_started   -> set status='live', kick off egress recording
 *   - room_finished  -> set status='ended'
 *   - egress_ended   -> create Mux asset from URL, link to live_rooms.recording_video_id
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const auth = request.headers.get("authorization");

  const event = await receiveWebhook(rawBody, auth);
  if (!event) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const supabase = createAdminClient();

  switch (event.event) {
    case "room_started": {
      const name = event.room?.name;
      if (!name) break;
      await supabase
        .from("live_rooms")
        .update({ status: "live" })
        .eq("livekit_room_name", name);
      try {
        await startRoomEgress({ roomName: name });
      } catch (e) {
        console.error("[livekit webhook] egress start failed:", e);
      }
      break;
    }
    case "room_finished": {
      const name = event.room?.name;
      if (!name) break;
      await supabase
        .from("live_rooms")
        .update({ status: "ended", ended_at: new Date().toISOString() })
        .eq("livekit_room_name", name);
      break;
    }
    case "egress_ended": {
      const info = event.egressInfo as
        | {
            roomName?: string;
            file?: { location?: string };
            fileResults?: Array<{ location?: string }>;
          }
        | undefined;
      const roomName = info?.roomName;
      const fileUrl =
        info?.file?.location ?? info?.fileResults?.[0]?.location ?? null;
      if (!roomName || !fileUrl) break;

      // Find the room's owner so we can write a `videos` row owned by them.
      const { data: roomRow } = await supabase
        .from("live_rooms")
        .select("id, creator_id, title")
        .eq("livekit_room_name", roomName)
        .maybeSingle();
      const room = roomRow as
        | { id: string; creator_id: string; title: string }
        | null;
      if (!room) break;

      let asset;
      try {
        asset = await createAssetFromUrl({ url: fileUrl, visibility: "public" });
      } catch (e) {
        console.error("[livekit webhook] mux ingest failed:", e);
        break;
      }

      const { data: videoRow } = await supabase
        .from("videos")
        .insert({
          creator_id: room.creator_id,
          title: room.title,
          description: "",
          visibility: "public",
          status: "processing",
          mux_asset_id: asset.id,
        })
        .select("id")
        .single();
      const video = videoRow as { id: string } | null;
      if (!video) break;

      await supabase
        .from("live_rooms")
        .update({ recording_video_id: video.id })
        .eq("id", room.id);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ ok: true });
}

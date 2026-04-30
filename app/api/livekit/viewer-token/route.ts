import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { ViewerTokenRequestZ } from "@/types/live";
import { getRoom } from "@/lib/data/live-rooms";
import { mintViewerToken } from "@/lib/livekit";
import { clientIpFrom, rateLimit } from "@/lib/utils/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/livekit/viewer-token
 *
 * Anonymous, subscribe-only LiveKit token for `/room/[roomId]`.
 *
 * AGENTS.md §8: every unauthenticated POST is rate-limited.
 *   - 60 requests / 5 minutes per IP
 *   - returns 429 + Retry-After when bucket is empty
 */
export async function POST(request: NextRequest) {
  const ip = clientIpFrom(request.headers);
  const limit = rateLimit(`viewer-token:${ip}`, {
    capacity: 60,
    refillPerSecond: 60 / 300,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded." },
      {
        status: 429,
        headers: { "Retry-After": Math.ceil(limit.resetMs / 1000).toString() },
      },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const parsed = ViewerTokenRequestZ.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const room = await getRoom(parsed.data.roomId);
  if (!room) {
    return NextResponse.json({ error: "Room not found." }, { status: 404 });
  }
  if (room.status !== "live") {
    return NextResponse.json(
      { error: "Room is not live." },
      { status: 409 },
    );
  }

  try {
    const token = await mintViewerToken({ roomName: room.livekit_room_name });
    return NextResponse.json(token);
  } catch (e) {
    const message = e instanceof Error ? e.message : "LiveKit not configured.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Re-export to silence unused imports if we add CSRF or schema reuse later.
void z;

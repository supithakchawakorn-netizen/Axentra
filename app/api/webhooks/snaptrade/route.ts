import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SnapTradeWebhookEventZ } from "@/types/snaptrade";
import { verifyHmacSha256Hex } from "@/lib/utils/webhook-signature";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function verifySignature(raw: string, signature: string | null): boolean {
  return verifyHmacSha256Hex({
    payload: raw,
    secret: process.env.SNAPTRADE_WEBHOOK_SECRET,
    signature,
  });
}

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-snaptrade-signature");
  if (!verifySignature(raw, signature)) {
    return NextResponse.json({ ok: false, error: "Invalid signature." }, { status: 401 });
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = SnapTradeWebhookEventZ.safeParse(parsedBody);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload." }, { status: 400 });
  }

  const event = parsed.data;
  const supabase = createAdminClient();

  if (event.userId) {
    // Scaffold mapping: in production we map SnapTrade user IDs to app users.
    await supabase
      .from("broker_connections")
      .update({
        status: event.status === "connected" ? "connected" : undefined,
        connected_at: event.status === "connected" ? new Date().toISOString() : undefined,
      })
      .eq("snaptrade_user_id", event.userId);
  }

  return NextResponse.json({ ok: true });
}

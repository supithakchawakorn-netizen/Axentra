import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("x-cron-secret") === secret;
}

export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: rows, error } = await supabase
    .from("broker_connections")
    .select("id")
    .eq("provider", "snaptrade")
    .eq("status", "connected")
    .limit(100);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const ids = ((rows ?? []) as { id: string }[]).map((r) => r.id);
  if (ids.length > 0) {
    await supabase
      .from("broker_connections")
      .update({ last_sync_at: now })
      .in("id", ids);
  }

  return NextResponse.json({ ok: true, syncedConnections: ids.length, at: now });
}

export async function GET(req: Request) {
  return POST(req);
}

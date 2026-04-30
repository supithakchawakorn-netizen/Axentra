import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { clientIpFrom, rateLimit } from "@/lib/utils/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WaitlistInputZ = z.object({
  email: z.string().trim().email(),
  source: z.string().trim().max(64).default("pricing"),
});

export async function POST(req: Request) {
  if (!supabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Waitlist is not configured yet." },
      { status: 503 },
    );
  }

  const ip = clientIpFrom(req.headers);
  const rl = rateLimit(`waitlist:${ip}`, { capacity: 10, refillPerSecond: 0.1 });
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetMs / 1000)) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }
  const parsed = WaitlistInputZ.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid input." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("waitlist").upsert(
    {
      email: parsed.data.email,
      source: parsed.data.source,
    },
    { onConflict: "email" },
  );
  if (error) {
    // Return success-shaped response to avoid email existence leaks.
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}

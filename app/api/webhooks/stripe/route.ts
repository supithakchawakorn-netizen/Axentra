import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const StripeWebhookPayloadZ = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({ object: z.record(z.string(), z.unknown()) }),
});

function verifyStripeSignature(raw: string, signature: string | null): boolean {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  // Scaffold verifier: HMAC(raw) comparison. Replace with Stripe SDK constructEvent
  // when live products are activated post-V1.
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyStripeSignature(raw, req.headers.get("stripe-signature"))) {
    return NextResponse.json({ ok: false, error: "Invalid signature." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }
  const parsed = StripeWebhookPayloadZ.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload." }, { status: 400 });
  }

  // V1 scaffold only: signature + schema validation + no-op.
  return NextResponse.json({ ok: true, received: parsed.data.type });
}

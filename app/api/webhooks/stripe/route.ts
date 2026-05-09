import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyHmacSha256Hex } from "@/lib/utils/webhook-signature";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const StripeWebhookPayloadZ = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({ object: z.record(z.string(), z.unknown()) }),
});

function verifyStripeSignature(raw: string, signature: string | null): boolean {
  // Scaffold verifier: HMAC(raw) comparison. Replace with Stripe SDK constructEvent
  // when live products are activated post-V1.
  return verifyHmacSha256Hex({
    payload: raw,
    secret: process.env.STRIPE_WEBHOOK_SECRET,
    signature,
  });
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

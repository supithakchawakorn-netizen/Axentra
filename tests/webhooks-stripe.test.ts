import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";

function signatureFor(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

describe("stripe webhook route", () => {
  beforeEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = "stripe_secret";
  });

  it("returns 401 on invalid signature", async () => {
    const { POST } = await import("@/app/api/webhooks/stripe/route");
    const response = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: "{}",
        headers: { "stripe-signature": "invalid" },
      }),
    );
    expect(response.status).toBe(401);
  });

  it("returns 400 on invalid payload schema", async () => {
    const payload = JSON.stringify({ id: "evt_1", type: "invoice.paid" });
    const signature = signatureFor(payload, "stripe_secret");
    const { POST } = await import("@/app/api/webhooks/stripe/route");
    const response = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: payload,
        headers: { "stripe-signature": signature },
      }),
    );
    expect(response.status).toBe(400);
  });

  it("handles valid events idempotently", async () => {
    const payload = JSON.stringify({
      id: "evt_2",
      type: "invoice.paid",
      data: { object: { customer: "cus_1" } },
    });
    const signature = signatureFor(payload, "stripe_secret");
    const { POST } = await import("@/app/api/webhooks/stripe/route");
    const first = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: payload,
        headers: { "stripe-signature": signature },
      }),
    );
    const second = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: payload,
        headers: { "stripe-signature": signature },
      }),
    );

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
  });
});

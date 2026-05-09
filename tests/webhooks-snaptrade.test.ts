import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createAdminClientMock = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => createAdminClientMock(),
}));

function signatureFor(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

function createSupabaseMock() {
  const operations: Array<{ payload: Record<string, unknown>; column: string; value: string }> =
    [];

  return {
    client: {
      from: vi.fn(() => ({
        update: (payload: Record<string, unknown>) => ({
          eq: (column: string, value: string) => {
            operations.push({ payload, column, value });
            return { data: [], error: null };
          },
        }),
      })),
    },
    operations,
  };
}

describe("snaptrade webhook route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SNAPTRADE_WEBHOOK_SECRET = "snap_secret";
  });

  it("returns 401 on invalid signature", async () => {
    const { POST } = await import("@/app/api/webhooks/snaptrade/route");
    const response = await POST(
      new Request("http://localhost/api/webhooks/snaptrade", {
        method: "POST",
        body: "{}",
        headers: { "x-snaptrade-signature": "invalid" },
      }),
    );
    expect(response.status).toBe(401);
  });

  it("handles connected events idempotently", async () => {
    const payload = JSON.stringify({
      type: "connection.updated",
      userId: "snap_user_1",
      status: "connected",
    });
    const signature = signatureFor(payload, "snap_secret");
    const supabase = createSupabaseMock();
    createAdminClientMock.mockReturnValue(supabase.client);
    const { POST } = await import("@/app/api/webhooks/snaptrade/route");

    const first = await POST(
      new Request("http://localhost/api/webhooks/snaptrade", {
        method: "POST",
        body: payload,
        headers: { "x-snaptrade-signature": signature },
      }),
    );
    const second = await POST(
      new Request("http://localhost/api/webhooks/snaptrade", {
        method: "POST",
        body: payload,
        headers: { "x-snaptrade-signature": signature },
      }),
    );

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(supabase.operations).toHaveLength(2);
    expect(
      supabase.operations.every(
        (operation) =>
          operation.column === "snaptrade_user_id" &&
          operation.value === "snap_user_1",
      ),
    ).toBe(true);
  });
});

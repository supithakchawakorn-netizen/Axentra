import { beforeEach, describe, expect, it, vi } from "vitest";

const verifyWebhookMock = vi.fn();
const createAdminClientMock = vi.fn();

vi.mock("@/lib/mux", () => ({
  verifyWebhook: (...args: unknown[]) => verifyWebhookMock(...args),
  getUpload: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => createAdminClientMock(),
}));

function createSupabaseMock() {
  const operations: Array<{ update: Record<string, unknown>; column: string; value: string }> =
    [];

  const eq = vi.fn((column: string, value: string) => {
    return {
      data: [],
      error: null,
      select: vi.fn(async () => ({ data: [], error: null })),
      column,
      value,
    };
  });

  const update = vi.fn((payload: Record<string, unknown>) => {
    return {
      eq: (column: string, value: string) => {
        operations.push({ update: payload, column, value });
        return eq(column, value);
      },
    };
  });

  return {
    client: {
      from: vi.fn(() => ({
        update,
      })),
    },
    operations,
  };
}

describe("mux webhook route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when signature is invalid", async () => {
    verifyWebhookMock.mockResolvedValue(false);
    const { POST } = await import("@/app/api/webhooks/mux/route");
    const response = await POST(
      new Request("http://localhost/api/webhooks/mux", {
        method: "POST",
        body: "{}",
        headers: { "mux-signature": "invalid" },
      }) as never,
    );

    expect(response.status).toBe(401);
    expect(createAdminClientMock).not.toHaveBeenCalled();
  });

  it("handles ready event idempotently", async () => {
    verifyWebhookMock.mockResolvedValue(true);
    const supabase = createSupabaseMock();
    createAdminClientMock.mockReturnValue(supabase.client);
    const { POST } = await import("@/app/api/webhooks/mux/route");

    const body = JSON.stringify({
      type: "video.asset.ready",
      data: {
        id: "asset_1",
        upload_id: "upload_1",
        duration: 12.5,
        playback_ids: [{ id: "playback_1" }],
      },
    });

    const first = await POST(
      new Request("http://localhost/api/webhooks/mux", {
        method: "POST",
        body,
        headers: { "mux-signature": "valid" },
      }) as never,
    );
    const second = await POST(
      new Request("http://localhost/api/webhooks/mux", {
        method: "POST",
        body,
        headers: { "mux-signature": "valid" },
      }) as never,
    );

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(supabase.operations).toHaveLength(4);
    expect(
      supabase.operations.every(
        (operation) =>
          operation.column === "mux_asset_id" ||
          operation.column === "mux_upload_id",
      ),
    ).toBe(true);
  });
});

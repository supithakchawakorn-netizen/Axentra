import { beforeEach, describe, expect, it, vi } from "vitest";

const receiveWebhookMock = vi.fn();
const startRoomEgressMock = vi.fn();
const createAdminClientMock = vi.fn();

vi.mock("@/lib/livekit", () => ({
  receiveWebhook: (...args: unknown[]) => receiveWebhookMock(...args),
  startRoomEgress: (...args: unknown[]) => startRoomEgressMock(...args),
}));

vi.mock("@/lib/mux", () => ({
  createAssetFromUrl: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => createAdminClientMock(),
}));

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

describe("livekit webhook route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when signature is invalid", async () => {
    receiveWebhookMock.mockResolvedValue(null);
    const { POST } = await import("@/app/api/webhooks/livekit/route");
    const response = await POST(
      new Request("http://localhost/api/webhooks/livekit", {
        method: "POST",
        body: "{}",
      }) as never,
    );
    expect(response.status).toBe(401);
  });

  it("handles room_started idempotently", async () => {
    receiveWebhookMock.mockResolvedValue({
      event: "room_started",
      room: { name: "room-alpha" },
    });
    startRoomEgressMock.mockResolvedValue({ egressId: "eg_1" });
    const supabase = createSupabaseMock();
    createAdminClientMock.mockReturnValue(supabase.client);

    const { POST } = await import("@/app/api/webhooks/livekit/route");
    const first = await POST(
      new Request("http://localhost/api/webhooks/livekit", {
        method: "POST",
        body: "{}",
        headers: { authorization: "Bearer test" },
      }) as never,
    );
    const second = await POST(
      new Request("http://localhost/api/webhooks/livekit", {
        method: "POST",
        body: "{}",
        headers: { authorization: "Bearer test" },
      }) as never,
    );

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(supabase.operations).toHaveLength(2);
    expect(
      supabase.operations.every(
        (operation) =>
          operation.column === "livekit_room_name" &&
          operation.value === "room-alpha",
      ),
    ).toBe(true);
  });
});

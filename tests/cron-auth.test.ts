import { beforeEach, describe, expect, it } from "vitest";

describe("cron routes auth", () => {
  beforeEach(() => {
    delete process.env.CRON_SECRET;
  });

  it("snaptrade sync rejects invalid secret and missing secret", async () => {
    const { POST } = await import("@/app/api/cron/snaptrade-sync/route");
    const missingSecret = await POST(
      new Request("http://localhost/api/cron/snaptrade-sync", {
        method: "POST",
      }),
    );
    expect(missingSecret.status).toBe(401);

    process.env.CRON_SECRET = "expected";
    const response = await POST(
      new Request("http://localhost/api/cron/snaptrade-sync", {
        method: "POST",
        headers: { "x-cron-secret": "wrong" },
      }),
    );
    expect(response.status).toBe(401);
  });
});

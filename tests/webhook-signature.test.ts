import { describe, expect, it } from "vitest";
import { signHmacSha256Hex, verifyHmacSha256Hex } from "@/lib/utils/webhook-signature";

describe("webhook signature helpers", () => {
  it("creates stable sha256 signatures", () => {
    const signature = signHmacSha256Hex("payload", "secret");
    expect(signature).toHaveLength(64);
    expect(signature).toMatch(/^[a-f0-9]+$/);
  });

  it("verifies matching signatures", () => {
    const payload = JSON.stringify({ hello: "world" });
    const secret = "local_secret";
    const signature = signHmacSha256Hex(payload, secret);

    expect(
      verifyHmacSha256Hex({
        payload,
        secret,
        signature,
      }),
    ).toBe(true);
  });

  it("rejects invalid signatures and missing secrets", () => {
    const payload = JSON.stringify({ hello: "world" });
    const signature = signHmacSha256Hex(payload, "correct");

    expect(
      verifyHmacSha256Hex({
        payload,
        secret: "wrong",
        signature,
      }),
    ).toBe(false);

    expect(
      verifyHmacSha256Hex({
        payload,
        secret: undefined,
        signature,
      }),
    ).toBe(false);
  });
});

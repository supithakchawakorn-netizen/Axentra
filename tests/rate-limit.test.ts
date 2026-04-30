import { beforeEach, describe, expect, it } from "vitest";
import {
  _resetRateLimitBucketsForTests,
  clientIpFrom,
  rateLimit,
} from "@/lib/utils/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    _resetRateLimitBucketsForTests();
  });

  it("allows up to capacity requests in a burst", () => {
    const opts = { capacity: 3, refillPerSecond: 1 };
    const t = 1_000_000;
    expect(rateLimit("k", opts, t).ok).toBe(true);
    expect(rateLimit("k", opts, t).ok).toBe(true);
    expect(rateLimit("k", opts, t).ok).toBe(true);
    expect(rateLimit("k", opts, t).ok).toBe(false);
  });

  it("refills tokens linearly", () => {
    const opts = { capacity: 2, refillPerSecond: 1 };
    const t0 = 1_000_000;
    rateLimit("k", opts, t0);
    rateLimit("k", opts, t0);
    expect(rateLimit("k", opts, t0).ok).toBe(false);
    expect(rateLimit("k", opts, t0 + 1000).ok).toBe(true);
  });

  it("isolates per key", () => {
    const opts = { capacity: 1, refillPerSecond: 1 };
    const t = 1_000_000;
    expect(rateLimit("a", opts, t).ok).toBe(true);
    expect(rateLimit("b", opts, t).ok).toBe(true);
    expect(rateLimit("a", opts, t).ok).toBe(false);
    expect(rateLimit("b", opts, t).ok).toBe(false);
  });

  it("rejects bad options", () => {
    expect(() => rateLimit("k", { capacity: 0, refillPerSecond: 1 })).toThrow();
    expect(() => rateLimit("k", { capacity: 1, refillPerSecond: 0 })).toThrow();
  });

  it("returns positive resetMs when blocked", () => {
    const opts = { capacity: 1, refillPerSecond: 2 };
    const t = 1_000_000;
    rateLimit("k", opts, t);
    const blocked = rateLimit("k", opts, t);
    expect(blocked.ok).toBe(false);
    expect(blocked.resetMs).toBeGreaterThan(0);
  });
});

describe("clientIpFrom", () => {
  it("uses the first x-forwarded-for entry", () => {
    const headers = new Headers({ "x-forwarded-for": "1.1.1.1, 2.2.2.2" });
    expect(clientIpFrom(headers)).toBe("1.1.1.1");
  });

  it("falls back to x-real-ip", () => {
    const headers = new Headers({ "x-real-ip": "3.3.3.3" });
    expect(clientIpFrom(headers)).toBe("3.3.3.3");
  });

  it("returns 'unknown' when no header is present", () => {
    expect(clientIpFrom(new Headers())).toBe("unknown");
  });
});

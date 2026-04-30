/**
 * In-memory token-bucket rate limiter.
 *
 * Used by every unauthenticated POST endpoint (`/api/livekit/viewer-token`,
 * `/api/waitlist`) per AGENTS.md §8. Keyed by `${route}:${ip}`.
 *
 * Caveats:
 *   - Process-local. For multi-region prod, swap in a Redis/Upstash backend
 *     behind the same `RateLimiter` interface.
 *   - Buckets refill linearly. A burst of `capacity` requests is allowed,
 *     then `refillPerSecond` requests/second sustained thereafter.
 */

export interface RateLimitOptions {
  capacity: number;
  refillPerSecond: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetMs: number;
}

interface Bucket {
  tokens: number;
  lastRefillMs: number;
}

const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  options: RateLimitOptions,
  nowMs: number = Date.now(),
): RateLimitResult {
  const { capacity, refillPerSecond } = options;
  if (capacity <= 0 || refillPerSecond <= 0) {
    throw new Error("rateLimit: capacity and refillPerSecond must be positive");
  }

  const existing = buckets.get(key);
  let tokens: number;
  let lastRefillMs: number;

  if (!existing) {
    tokens = capacity;
    lastRefillMs = nowMs;
  } else {
    const elapsedSeconds = Math.max(0, (nowMs - existing.lastRefillMs) / 1000);
    tokens = Math.min(capacity, existing.tokens + elapsedSeconds * refillPerSecond);
    lastRefillMs = nowMs;
  }

  if (tokens < 1) {
    const deficit = 1 - tokens;
    const resetMs = Math.ceil((deficit / refillPerSecond) * 1000);
    buckets.set(key, { tokens, lastRefillMs });
    return { ok: false, remaining: 0, resetMs };
  }

  tokens -= 1;
  buckets.set(key, { tokens, lastRefillMs });
  return { ok: true, remaining: Math.floor(tokens), resetMs: 0 };
}

/** Test-only: drop all stored buckets. */
export function _resetRateLimitBucketsForTests(): void {
  buckets.clear();
}

/** Resolve a best-effort client IP from request headers. */
export function clientIpFrom(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}

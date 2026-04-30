import "server-only";

const SNAPTRADE_BASE_URL =
  process.env.SNAPTRADE_BASE_URL ?? "https://api.snaptrade.com/api/v1";

function assertConfigured() {
  if (!process.env.SNAPTRADE_CLIENT_ID || !process.env.SNAPTRADE_CONSUMER_KEY) {
    throw new Error("SnapTrade not configured. Missing SNAPTRADE_CLIENT_ID or SNAPTRADE_CONSUMER_KEY.");
  }
}

async function snaptradeFetch(path: string, init?: RequestInit) {
  assertConfigured();
  const res = await fetch(`${SNAPTRADE_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "clientId": process.env.SNAPTRADE_CLIENT_ID!,
      "consumerKey": process.env.SNAPTRADE_CONSUMER_KEY!,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`SnapTrade request failed (${res.status}): ${path}`);
  }
  return res.json();
}

/**
 * Read-only SnapTrade surface for V1.
 * Order/trade placement endpoints are intentionally excluded.
 */
export const snaptrade = {
  isConfigured(): boolean {
    return Boolean(process.env.SNAPTRADE_CLIENT_ID && process.env.SNAPTRADE_CONSUMER_KEY);
  },
  listAccounts(userId: string, userSecret: string) {
    return snaptradeFetch(`/accounts?userId=${encodeURIComponent(userId)}&userSecret=${encodeURIComponent(userSecret)}`);
  },
  listBalances(accountId: string, userId: string, userSecret: string) {
    return snaptradeFetch(`/accounts/${encodeURIComponent(accountId)}/balances?userId=${encodeURIComponent(userId)}&userSecret=${encodeURIComponent(userSecret)}`);
  },
  listPositions(accountId: string, userId: string, userSecret: string) {
    return snaptradeFetch(`/accounts/${encodeURIComponent(accountId)}/positions?userId=${encodeURIComponent(userId)}&userSecret=${encodeURIComponent(userSecret)}`);
  },
  listActivities(accountId: string, userId: string, userSecret: string) {
    return snaptradeFetch(`/accounts/${encodeURIComponent(accountId)}/activities?userId=${encodeURIComponent(userId)}&userSecret=${encodeURIComponent(userSecret)}`);
  },
  // Non-order lifecycle endpoint used by account deletion flow.
  deleteSnapTradeUser(userId: string, userSecret: string) {
    return snaptradeFetch(
      `/snapTrade/deleteUser?userId=${encodeURIComponent(userId)}&userSecret=${encodeURIComponent(userSecret)}`,
      { method: "POST" },
    );
  },
};

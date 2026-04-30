import type { MarketDataProvider, MarketQuote } from "@/lib/market-data/types";

async function retry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let attempt = 0;
  let lastError: unknown;
  while (attempt <= retries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const backoffMs = 300 * (attempt + 1) * (attempt + 1);
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
      attempt += 1;
    }
  }
  throw lastError;
}

export class HttpPollingMarketDataProvider implements MarketDataProvider {
  async getSnapshot(symbols: string[]) {
    const params = new URLSearchParams();
    params.set("symbols", symbols.join(","));
    return retry(async () => {
      const res = await fetch(`/api/market/quotes?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error(`Market quote request failed with ${res.status}`);
      }
      const json = (await res.json()) as { quotes: MarketQuote[] };
      return json.quotes;
    });
  }

  subscribe(symbols: string[], onUpdate: (quotes: MarketQuote[]) => void) {
    let cancelled = false;
    let intervalMs = 2500;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async (): Promise<void> => {
      try {
        const quotes = await this.getSnapshot(symbols);
        if (cancelled) return;
        onUpdate(quotes);
        intervalMs = 2500;
      } catch {
        intervalMs = Math.min(10000, intervalMs * 1.6);
      } finally {
        if (!cancelled) {
          timer = setTimeout(() => {
            void tick();
          }, intervalMs);
        }
      }
    };

    void tick();

    return () => {
      cancelled = true;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }
}

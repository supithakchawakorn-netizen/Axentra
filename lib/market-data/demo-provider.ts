import type { MarketDataProvider, MarketQuote } from "@/lib/market-data/types";

const BASE_PRICES: Record<string, number> = {
  SPY: 527.12,
  QQQ: 452.84,
  NVDA: 910.77,
  AAPL: 196.32,
  MSFT: 424.11,
};

function createSeed(symbol: string) {
  const raw = symbol
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return (raw % 17) / 100;
}

function nextQuote(previous: MarketQuote): MarketQuote {
  const drift = (Math.random() - 0.5) * 0.35;
  const nextPrice = Math.max(1, previous.price + drift);
  const changePercent =
    ((nextPrice - (BASE_PRICES[previous.symbol] ?? previous.price)) /
      (BASE_PRICES[previous.symbol] ?? previous.price)) *
    100;
  return {
    ...previous,
    price: Number(nextPrice.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    updatedAt: Date.now(),
  };
}

function initQuotes(symbols: string[]): MarketQuote[] {
  return symbols.map((symbol) => {
    const base = BASE_PRICES[symbol] ?? 100 + symbol.length * 10;
    const seeded = base + createSeed(symbol);
    return {
      symbol,
      price: Number(seeded.toFixed(2)),
      changePercent: 0,
      updatedAt: Date.now(),
    };
  });
}

export class DemoMarketDataProvider implements MarketDataProvider {
  async getSnapshot(symbols: string[]) {
    return initQuotes(symbols);
  }

  subscribe(symbols: string[], onUpdate: (quotes: MarketQuote[]) => void) {
    let quotes = initQuotes(symbols);
    onUpdate(quotes);
    const id = window.setInterval(() => {
      quotes = quotes.map(nextQuote);
      onUpdate(quotes);
    }, 1800);
    return () => window.clearInterval(id);
  }
}

export const demoMarketDataProvider = new DemoMarketDataProvider();

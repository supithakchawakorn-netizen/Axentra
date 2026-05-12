export type MarketCategory = "stock" | "forex" | "crypto" | "mixed";

const FOREX_PREFIXES = ["EUR", "GBP", "USD", "AUD", "NZD", "CAD", "CHF", "JPY"];
const CRYPTO_PREFIXES = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE", "ADA", "AVAX", "DOT"];

export function inferMarketCategoryFromSymbols(symbols: string[]): MarketCategory {
  if (symbols.length === 0) return "mixed";
  const normalized = symbols.map((symbol) => symbol.toUpperCase());

  const forexHits = normalized.filter((symbol) => {
    if (symbol.length !== 6) return false;
    const base = symbol.slice(0, 3);
    const quote = symbol.slice(3, 6);
    return FOREX_PREFIXES.includes(base) && FOREX_PREFIXES.includes(quote);
  }).length;

  const cryptoHits = normalized.filter((symbol) =>
    CRYPTO_PREFIXES.some((prefix) => symbol.startsWith(prefix)),
  ).length;

  if (forexHits === normalized.length) return "forex";
  if (cryptoHits === normalized.length) return "crypto";
  if (forexHits === 0 && cryptoHits === 0) return "stock";
  return "mixed";
}


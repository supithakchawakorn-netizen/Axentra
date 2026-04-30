import Link from "next/link";

const SYMBOLS = [
  "SPY",
  "QQQ",
  "NVDA",
  "AAPL",
  "MSFT",
  "TSLA",
  "AMZN",
  "META",
] as const;

export function MarketTape() {
  return (
    <div className="border-b">
      <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-4 py-2">
        <span className="text-muted-foreground shrink-0 text-[10px] font-semibold tracking-[0.16em] uppercase">
          Market
        </span>
        {SYMBOLS.map((symbol) => (
          <Link
            key={symbol}
            href={`/explore?ticker=${symbol}`}
            className="glass-panel hover:bg-accent/70 inline-flex shrink-0 items-center rounded-full border px-2 py-1 font-mono text-[11px] transition-colors"
          >
            ${symbol}
          </Link>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";

export function TickerChips({
  tickers,
}: {
  tickers: { id: string; symbol: string; name: string }[];
}) {
  if (tickers.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {tickers.map((ticker) => (
        <li key={ticker.id}>
          <Link
            href={`/explore?q=${encodeURIComponent(ticker.symbol)}`}
            className="bg-secondary text-secondary-foreground inline-flex items-center rounded-full px-3 py-1.5 text-xs"
            title={ticker.name}
          >
            #{ticker.symbol}
          </Link>
        </li>
      ))}
    </ul>
  );
}


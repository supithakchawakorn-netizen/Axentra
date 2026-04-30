import Link from "next/link";

export interface TickerChip {
  id: string;
  symbol: string;
  name?: string;
}

export function TickerChips({
  tickers,
  className,
}: {
  tickers: TickerChip[];
  className?: string;
}) {
  if (tickers.length === 0) return null;
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className ?? ""}`}>
      {tickers.map((t) => (
        <li key={t.id}>
          <Link
            href={`/t/${t.symbol}`}
            className="bg-secondary text-secondary-foreground hover:bg-accent inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
            title={t.name}
          >
            ${t.symbol}
          </Link>
        </li>
      ))}
    </ul>
  );
}

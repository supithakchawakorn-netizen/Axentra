import "server-only";

export interface NewsHeadline {
  title: string;
  source: string;
  publishedAt: string;
  snippet: string;
}

/**
 * Deterministic mock news provider used when no real provider is configured.
 *
 * Returns a small set of stable, benign headlines per ticker so cron output
 * is reproducible end-to-end without paying for a news API. Replace with a
 * real provider (e.g. Polygon, Tiingo, Marketaux) by adding `lib/news/real.ts`
 * and routing through it from the cron handler.
 */
export function mockHeadlinesFor(params: {
  symbol: string;
  name: string;
  asOf: Date;
}): NewsHeadline[] {
  const isoDay = params.asOf.toISOString().slice(0, 10);
  return [
    {
      title: `${params.name}: analysts review near-term outlook`,
      source: "Mock Wire",
      publishedAt: isoDay,
      snippet: `Coverage notes around ${params.symbol} discuss trading dynamics and recent disclosures.`,
    },
    {
      title: `${params.name} reiterates strategy at investor event`,
      source: "Mock Newsroom",
      publishedAt: isoDay,
      snippet:
        "Management addressed margin trajectory and capital allocation priorities.",
    },
    {
      title: `Sector roundup mentions ${params.symbol}`,
      source: "Mock Sector Daily",
      publishedAt: isoDay,
      snippet:
        "Peer comparisons and macro context referenced in coverage of the broader sector.",
    },
  ];
}

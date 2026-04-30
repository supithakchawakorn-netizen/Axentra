import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getTickerBySymbol,
  getTickerSummary,
  getLatestNewsSummary,
  listVideosForTicker,
  listLiveRoomsForTicker,
} from "@/lib/data/tickers";
import { APP_NAME, siteUrl } from "@/lib/utils/site";
import { formatDate, formatDuration } from "@/lib/utils/format";
import { PageViewEvent } from "@/components/analytics/page-view-event";
import { Events } from "@/lib/posthog/events";
import { SectionHeader } from "@/components/shared/section-header";

export const revalidate = 300;

interface Props {
  params: Promise<{ ticker: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params;
  const t = await getTickerBySymbol(ticker);
  if (!t) return { title: "Ticker not found" };
  const title = `${t.symbol} — ${t.name}`;
  return {
    title,
    description: `${t.name} (${t.symbol}) on ${APP_NAME}: AI-generated company summary, daily news roll-up, and creator coverage.`,
    alternates: { canonical: `${siteUrl()}/t/${t.symbol}` },
    openGraph: { title, type: "website" },
  };
}

export default async function TickerPage({ params }: Props) {
  const { ticker } = await params;
  const symbol = ticker.toUpperCase();
  const t = await getTickerBySymbol(symbol);
  if (!t) notFound();

  const [summary, news, videos, liveRooms] = await Promise.all([
    getTickerSummary(t.id),
    getLatestNewsSummary(t.id),
    listVideosForTicker(t.id, 24),
    listLiveRoomsForTicker(t.id, 12),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-10">
      <PageViewEvent
        event={Events.TickerView}
        properties={{ ticker_id: t.id, symbol: t.symbol }}
      />
      <header className="glass-panel rounded-2xl border p-5 space-y-2 sm:p-6">
        <p className="text-muted-foreground text-xs uppercase tracking-widest">
          Ticker
        </p>
        <h1 className="flex items-baseline gap-3 text-4xl font-semibold tracking-tight">
          <span className="font-mono">{t.symbol}</span>
          <span className="text-muted-foreground text-lg font-normal">
            {t.name}
          </span>
        </h1>
        <p className="text-muted-foreground text-xs">
          {t.exchange ?? "—"}
          {t.country ? ` · ${t.country}` : ""}
        </p>
      </header>

      <section aria-labelledby="company-summary" className="glass-panel rounded-xl border p-4 space-y-3">
        <div id="company-summary">
          <SectionHeader title={`About ${t.symbol}`} />
        </div>
        {summary ? (
          <p className="text-muted-foreground max-w-prose whitespace-pre-wrap text-sm leading-relaxed">
            {summary.body}
          </p>
        ) : (
          <p className="text-muted-foreground max-w-prose text-sm">
            A summary for {t.symbol} hasn&apos;t been generated yet. Check back
            shortly — summaries refresh on a schedule.
          </p>
        )}
      </section>

      <section aria-labelledby="news-summary" className="glass-panel rounded-xl border p-4 space-y-3">
        <div id="news-summary">
          <SectionHeader title={`Today in ${t.symbol}`} />
        </div>
        {news ? (
          <>
            <p className="text-muted-foreground text-xs">
              {formatDate(news.as_of_date)}
            </p>
            <p className="text-muted-foreground max-w-prose whitespace-pre-wrap text-sm leading-relaxed">
              {news.body}
            </p>
          </>
        ) : (
          <p className="text-muted-foreground max-w-prose text-sm">
            No daily roll-up yet for {t.symbol}.
          </p>
        )}
      </section>

      {liveRooms.length > 0 ? (
        <section aria-labelledby="live-rooms" className="space-y-3">
          <div id="live-rooms">
            <SectionHeader title="Live now" />
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {liveRooms.map((r) => (
              <li
                key={r.id}
                className="glass-panel hover:border-foreground/20 rounded-xl border p-3 transition-colors"
              >
                <Link href={`/room/${r.id}`} className="block space-y-1">
                  <p className="font-medium leading-snug">{r.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {r.profiles?.display_name ?? `@${r.profiles?.handle ?? ""}`}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="videos" className="space-y-3">
        <div id="videos">
          <SectionHeader title="Recent videos" />
        </div>
        {videos.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No public videos tagged with {t.symbol} yet.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <li key={v.id}>
                <Link href={`/v/${v.id}`} className="group block space-y-2">
                  <div className="bg-muted relative aspect-video overflow-hidden rounded-md border">
                    {v.mux_playback_id ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`https://image.mux.com/${v.mux_playback_id}/thumbnail.jpg?width=640&height=360&fit_mode=smartcrop`}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    ) : null}
                    {v.duration_seconds ? (
                      <span className="absolute right-1.5 bottom-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        {formatDuration(v.duration_seconds)}
                      </span>
                    ) : null}
                  </div>
                  <p className="line-clamp-2 text-sm font-medium leading-snug">
                    {v.title}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {v.profiles?.display_name ?? `@${v.profiles?.handle ?? ""}`}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

import Link from "next/link";
import type { PublicLiveRoom } from "@/lib/data/live-rooms";
import type { PublicVideoSummary } from "@/lib/data/videos";
import type { TickerRow } from "@/lib/data/tickers";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeader } from "@/components/shared/section-header";
import { LiveRoomCard } from "@/components/live/live-room-card";
import { VideoCard } from "@/components/video/video-card";
import { ExploreGrowthLazy } from "@/components/experiments/explore-growth-lazy";
import { ContinueWatchingStrip } from "@/components/video/continue-watching-strip";
import { WolfpackHeroStrip } from "@/components/shared/wolfpack-hero-strip";

interface ExploreMobileProps {
  query: string;
  normalizedQuery: string;
  tickerSymbol?: string;
  tickerRow: TickerRow | null;
  rankedLive: PublicLiveRoom[];
  rankedVideos: PublicVideoSummary[];
  topTickers: TickerRow[];
}

export function ExploreMobile({
  query,
  normalizedQuery,
  tickerSymbol,
  tickerRow,
  rankedLive,
  rankedVideos,
  topTickers,
}: ExploreMobileProps) {
  const nextDive = rankedVideos[0] ?? null;
  const feedPrimary = rankedVideos.slice(0, 12);
  const keepScrolling = rankedVideos.slice(12, 32);

  return (
    <main className="yt-page-shell w-full space-y-6 px-1 py-5">
      <PageHeader
        title="Explore feed"
        description={
          normalizedQuery
            ? `Showing results for "${query}".`
            : "Swipe wolfpack uploads and live market streams."
        }
      />
      <WolfpackHeroStrip caption="Sharper feeds. Faster market context." />
      {nextDive ? (
        <section className="glass-panel rounded-xl border p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Next dive
          </p>
          <p className="mt-1 text-sm">
            Keep momentum with a top-ranked clip from this session.
          </p>
          <Link
            href={`/v/${nextDive.id}`}
            prefetch={false}
            className="mt-3 inline-flex rounded-full border px-3 py-1.5 text-sm hover:bg-muted/50"
          >
            Watch next →
          </Link>
        </section>
      ) : null}
      <ExploreGrowthLazy />
      <ContinueWatchingStrip
        title="Continue from your session"
        subtitle="Resume past videos before diving deeper."
      />

      {rankedLive.length > 0 ? (
        <section className="space-y-3">
          <SectionHeader title={`Live now (${rankedLive.length})`} />
          <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
            {rankedLive.slice(0, 8).map((room) => (
              <li key={room.id} className="w-[88%] min-w-[88%] snap-start">
                <LiveRoomCard room={room} prefetch={false} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-3">
        <SectionHeader
          title={tickerRow ? `Videos tagged $${tickerRow.symbol}` : "Recent videos"}
        />
        {tickerRow || normalizedQuery ? (
          <p className="text-muted-foreground text-sm">
            <Link href="/explore" prefetch={false} className="hover:text-foreground transition-colors">
              ← Clear filters
            </Link>
          </p>
        ) : null}
        {rankedVideos.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {tickerRow
              ? `No videos tagged ${tickerRow.symbol} yet.`
              : "No videos yet. Check back soon."}
          </p>
        ) : (
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
            {feedPrimary.map((video) => (
              <div key={video.id} className="w-[85%] min-w-[85%] snap-start">
                <VideoCard video={video} prefetch={false} />
              </div>
            ))}
          </div>
        )}
      </section>

      {keepScrolling.length > 0 ? (
        <section className="space-y-3">
          <SectionHeader
            title="Keep scrolling"
            subtitle="More from the same ranking context."
          />
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
            {keepScrolling.map((video) => (
              <div key={video.id} className="w-[85%] min-w-[85%] snap-start">
                <VideoCard video={video} prefetch={false} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="glass-panel rounded-xl border p-4 space-y-3">
        <SectionHeader title="By ticker" subtitle="Tap one symbol to filter." />
        {topTickers.length === 0 ? (
          <p className="text-muted-foreground text-sm">No tickers seeded yet.</p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {topTickers.map((ticker) => (
              <li key={ticker.id}>
                <Link
                  href={`/explore?ticker=${ticker.symbol}`}
                  prefetch={false}
                  className={`bg-secondary text-secondary-foreground hover:bg-accent inline-flex items-center rounded-md px-2.5 py-1 font-mono text-xs ${
                    tickerSymbol === ticker.symbol ? "ring-2 ring-foreground/30" : ""
                  }`}
                  title={ticker.name}
                >
                  ${ticker.symbol}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}


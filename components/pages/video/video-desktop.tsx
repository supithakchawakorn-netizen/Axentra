import Link from "next/link";
import Image from "next/image";
import type { PublicVideoDetail, PublicVideoSummary } from "@/lib/data/videos";
import { VideoPlayer } from "@/components/video/video-player";
import { formatDate } from "@/lib/utils/format";
import { TickerChips } from "@/components/ticker/ticker-chips";
import { VerifiedBrokerBadge } from "@/components/creator/verified-broker-badge";
import { Share2, ThumbsUp } from "lucide-react";
import { CommentsSection } from "@/components/shared/comments-section";
import type { DemoComment } from "@/lib/data/comments";
import { ContinueWatchingStrip } from "@/components/video/continue-watching-strip";
import { ContentHelpfulnessVote } from "@/components/shared/content-helpfulness-vote";
import { inferMarketCategoryFromSymbols } from "@/lib/utils/market-category";

interface VideoDesktopProps {
  video: PublicVideoDetail;
  tickers: { id: string; symbol: string; name: string }[];
  recommended: PublicVideoSummary[];
  demoMode: boolean;
  comments: DemoComment[];
  startAtSeconds?: number;
}

export function VideoDesktop({
  video,
  tickers,
  recommended,
  demoMode,
  comments,
  startAtSeconds,
}: VideoDesktopProps) {
  const nextVideo = recommended[0] ?? null;
  const marketCategory = inferMarketCategoryFromSymbols(tickers.map((ticker) => ticker.symbol));

  return (
    <main className="w-full px-1 py-6 sm:px-2">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          {demoMode ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              Demo mode: this is sample video content.
            </div>
          ) : null}
          {video.mux_playback_id ? (
            <VideoPlayer
              playbackId={video.mux_playback_id}
              title={video.title}
              videoId={video.id}
              poster={video.thumbnail_url ?? undefined}
              creatorLabel={
                video.creator ? video.creator.display_name ?? `@${video.creator.handle}` : undefined
              }
              creatorHandle={video.creator?.handle}
              durationSeconds={video.duration_seconds}
              startAtSeconds={startAtSeconds}
            />
          ) : (
            <div className="bg-muted flex aspect-video items-center justify-center rounded-xl border">
              <p className="text-muted-foreground text-sm">
                Demo video preview. Connect Mux assets to enable playback.
              </p>
            </div>
          )}
          <header className="space-y-3">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{video.title}</h1>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-muted-foreground flex items-center gap-3 text-sm">
                {video.creator ? (
                  <>
                    <Link href={`/@${video.creator.handle}`} className="hover:text-foreground transition-colors">
                      {video.creator.display_name ?? `@${video.creator.handle}`}
                    </Link>
                    {video.creator.verified_broker ? <VerifiedBrokerBadge /> : null}
                  </>
                ) : null}
                {video.published_at ? <span>· Published {formatDate(video.published_at)}</span> : null}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="bg-secondary hover:bg-accent inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium"
                >
                  <ThumbsUp className="size-3.5" />
                  Like
                </button>
                <button
                  type="button"
                  className="bg-secondary hover:bg-accent inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium"
                >
                  <Share2 className="size-3.5" />
                  Share
                </button>
              </div>
            </div>
            <TickerChips tickers={tickers} />
          </header>

          {video.description ? (
            <section className="bg-muted/50 rounded-xl border p-4">
              <p className="readable-copy text-muted-foreground whitespace-pre-wrap text-sm">
                {video.description}
              </p>
            </section>
          ) : null}

          <ContentHelpfulnessVote
            contentId={video.id}
            contentType="video"
            marketCategory={marketCategory}
          />

          {nextVideo ? (
            <section className="glass-panel rounded-xl border p-4 space-y-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Continue watching
              </p>
              <p className="text-sm">
                Jump straight into the next ranked video to keep your market context warm.
              </p>
              <Link
                href={`/v/${nextVideo.id}`}
                className="inline-flex rounded-full border px-3 py-1.5 text-sm hover:bg-muted/50"
              >
                Play next: {nextVideo.title} →
              </Link>
            </section>
          ) : null}
          <ContinueWatchingStrip
            excludeVideoId={video.id}
            creatorHandle={video.creator?.handle}
            maxItems={6}
            subtitle={
              video.creator?.handle
                ? `Resume your recent sessions from @${video.creator.handle}.`
                : "Pick up your last sessions."
            }
          />

          <CommentsSection
            title="Comments"
            comments={comments}
            inputLabel="Join the discussion"
            helperText={
              demoMode
                ? "Demo mode: posting is disabled until full auth/comment backend is enabled."
                : "Comment posting is currently limited in V1."
            }
          />
        </section>

        <aside className="space-y-3">
          <h2 className="text-sm font-semibold">Up next</h2>
          {recommended.length === 0 ? (
            <div className="glass-panel rounded-xl border p-3 text-xs text-muted-foreground">
              Not enough recommendations yet. Explore the latest feed while we gather more activity.
              <div className="mt-2">
                <Link href="/explore" className="text-primary hover:underline underline-offset-4">
                  Open explore →
                </Link>
              </div>
            </div>
          ) : (
            recommended.map((item) => {
              const thumb = item.thumbnail_url
                ? item.thumbnail_url
                : item.mux_playback_id
                  ? `https://image.mux.com/${item.mux_playback_id}/thumbnail.jpg?width=480&height=270&fit_mode=smartcrop`
                  : null;
              return (
                <Link
                  key={item.id}
                  href={`/v/${item.id}`}
                  className="group flex gap-3 rounded-xl p-1 transition-colors hover:bg-muted/50"
                >
                  <div className="bg-muted relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg border">
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt=""
                        fill
                        sizes="160px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="line-clamp-2 text-sm font-medium leading-snug">{item.title}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {item.creator?.display_name ?? `@${item.creator?.handle ?? ""}`}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {item.published_at ? formatDate(item.published_at) : "Recently"}
                    </p>
                  </div>
                </Link>
              );
            })
          )}
        </aside>
      </div>
    </main>
  );
}


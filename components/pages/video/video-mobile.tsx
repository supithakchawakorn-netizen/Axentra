import Link from "next/link";
import type { PublicVideoDetail, PublicVideoSummary } from "@/lib/data/videos";
import { VideoPlayer } from "@/components/video/video-player";
import { formatDate } from "@/lib/utils/format";
import { TickerChips } from "@/components/ticker/ticker-chips";
import { VerifiedBrokerBadge } from "@/components/creator/verified-broker-badge";
import { Share2, ThumbsUp } from "lucide-react";
import { CommentsSection } from "@/components/shared/comments-section";
import type { DemoComment } from "@/lib/data/comments";
import { ContinueWatchingStrip } from "@/components/video/continue-watching-strip";

interface VideoMobileProps {
  video: PublicVideoDetail;
  tickers: { id: string; symbol: string; name: string }[];
  recommended: PublicVideoSummary[];
  demoMode: boolean;
  comments: DemoComment[];
  startAtSeconds?: number;
}

export function VideoMobile({
  video,
  tickers,
  recommended,
  demoMode,
  comments,
  startAtSeconds,
}: VideoMobileProps) {
  const nextVideo = recommended[0] ?? null;

  return (
    <main className="w-full space-y-4 px-1 py-5">
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
        <h1 className="text-lg font-semibold tracking-tight">{video.title}</h1>
        <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
          {video.creator ? (
            <>
              <Link href={`/@${video.creator.handle}`} className="hover:text-foreground transition-colors">
                {video.creator.display_name ?? `@${video.creator.handle}`}
              </Link>
              {video.creator.verified_broker ? <VerifiedBrokerBadge /> : null}
            </>
          ) : null}
          {video.published_at ? <span>· {formatDate(video.published_at)}</span> : null}
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
        <TickerChips tickers={tickers} />
      </header>

      {video.description ? (
        <section className="bg-muted/50 rounded-xl border p-4">
          <p className="readable-copy text-muted-foreground whitespace-pre-wrap text-sm">
            {video.description}
          </p>
        </section>
      ) : null}

      {nextVideo ? (
        <section className="glass-panel rounded-xl border p-4 space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Continue watching
          </p>
          <Link
            href={`/v/${nextVideo.id}`}
            prefetch={false}
            className="inline-flex rounded-full border px-3 py-1.5 text-sm hover:bg-muted/50"
          >
            Play next: {nextVideo.title} →
          </Link>
        </section>
      ) : null}
      <ContinueWatchingStrip
        excludeVideoId={video.id}
        creatorHandle={video.creator?.handle}
        title="Keep your streak"
        subtitle={
          video.creator?.handle
            ? `Resume your recent sessions from @${video.creator.handle}.`
            : "Jump back into your recent watch sessions."
        }
      />

      {recommended.length > 0 ? (
        <section className="space-y-3">
          <p className="text-sm font-semibold">Up next</p>
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
            {recommended.map((item) => (
              <Link
                key={item.id}
                href={`/v/${item.id}`}
                prefetch={false}
                className="glass-panel w-[88%] min-w-[88%] snap-start rounded-xl border p-3 text-sm hover:bg-muted/40"
              >
                <p className="line-clamp-2 font-medium">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.creator?.display_name ?? `@${item.creator?.handle ?? ""}`}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

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
    </main>
  );
}


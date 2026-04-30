import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { listRecentPublishedVideos, getPublicVideo, listVideoTickers } from "@/lib/data/videos";
import { VideoPlayer } from "@/components/video/video-player";
import { formatDate } from "@/lib/utils/format";
import { APP_NAME, siteUrl } from "@/lib/utils/site";
import { TickerChips } from "@/components/ticker/ticker-chips";
import { VerifiedBrokerBadge } from "@/components/creator/verified-broker-badge";
import { Share2, ThumbsUp } from "lucide-react";
import { supabaseConfigured } from "@/lib/env";
import { listCommentsForVideo } from "@/lib/data/comments";
import { CommentsSection } from "@/components/shared/comments-section";
import { ExperimentQualitySignal } from "@/components/experiments/experiment-quality-signal";

export const revalidate = 60;

interface VideoPageProps {
  params: Promise<{ videoId: string }>;
}

export async function generateMetadata({
  params,
}: VideoPageProps): Promise<Metadata> {
  const { videoId } = await params;
  const video = await getPublicVideo(videoId);
  if (!video) return { title: "Video not found" };
  const creatorName =
    video.creator?.display_name ?? `@${video.creator?.handle ?? ""}`;
  return {
    title: video.title,
    description: video.description?.slice(0, 200) || `${creatorName} on ${APP_NAME}.`,
    alternates: { canonical: `${siteUrl()}/v/${video.id}` },
    openGraph: {
      title: video.title,
      description: video.description?.slice(0, 200),
      type: "video.other",
    },
  };
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { videoId } = await params;
  const [video, tickers, recent] = await Promise.all([
    getPublicVideo(videoId),
    listVideoTickers(videoId),
    listRecentPublishedVideos({ limit: 14 }),
  ]);
  if (!video) {
    notFound();
  }
  const recommended = recent.filter((v) => v.id !== video.id).slice(0, 10);
  const demoMode = !supabaseConfigured();
  const comments = listCommentsForVideo(video.id);

  return (
    <main className="w-full px-1 py-6 sm:px-2">
      <ExperimentQualitySignal signal="watch_page_entry" path={`/v/${video.id}`} />
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
                    <Link
                      href={`/@${video.creator.handle}`}
                      className="hover:text-foreground transition-colors"
                    >
                      {video.creator.display_name ?? `@${video.creator.handle}`}
                    </Link>
                    {video.creator.verified_broker ? <VerifiedBrokerBadge /> : null}
                  </>
                ) : null}
                {video.published_at ? (
                  <span>· Published {formatDate(video.published_at)}</span>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="bg-secondary hover:bg-accent inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                >
                  <ThumbsUp className="size-3.5" />
                  Like
                </button>
                <button
                  type="button"
                  className="bg-secondary hover:bg-accent inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
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
          <div className="glass-panel rounded-xl border p-3 space-y-2">
            <p className="text-xs font-medium">Quick actions</p>
            <Link href="/live" className="block text-xs text-primary hover:underline underline-offset-4">
              Jump to live coverage
            </Link>
            <Link href="/explore" className="block text-xs text-primary hover:underline underline-offset-4">
              Browse more videos
            </Link>
            {video.creator ? (
              <Link
                href={`/@${video.creator.handle}`}
                className="block text-xs text-primary hover:underline underline-offset-4"
              >
                More from @{video.creator.handle}
              </Link>
            ) : null}
          </div>
        </aside>
      </div>
    </main>
  );
}

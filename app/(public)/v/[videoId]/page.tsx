import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { listRecentPublishedVideos, getPublicVideo, listVideoTickers } from "@/lib/data/videos";
import { APP_NAME, siteUrl } from "@/lib/utils/site";
import { supabaseConfigured } from "@/lib/env";
import { listCommentsForVideo } from "@/lib/data/comments";
import { ExperimentQualitySignal } from "@/components/experiments/experiment-quality-signal";
import { VideoMobile } from "@/components/pages/video/video-mobile";
import { VideoDesktop } from "@/components/pages/video/video-desktop";

export const revalidate = 60;

interface VideoPageProps {
  params: Promise<{ videoId: string }>;
  searchParams: Promise<{ t?: string }>;
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

export default async function VideoPage({ params, searchParams }: VideoPageProps) {
  const { videoId } = await params;
  const resolvedSearch = await searchParams;
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
  const parsedStartAt = Number(resolvedSearch.t);
  const startAtSeconds =
    Number.isFinite(parsedStartAt) && parsedStartAt > 0 ? Math.floor(parsedStartAt) : undefined;

  return (
    <>
      <ExperimentQualitySignal signal="watch_page_entry" path={`/v/${video.id}`} />
      <div className="sm:hidden">
        <VideoMobile
          video={video}
          tickers={tickers}
          recommended={recommended}
          demoMode={demoMode}
          comments={comments}
          startAtSeconds={startAtSeconds}
        />
      </div>
      <div className="hidden sm:block">
        <VideoDesktop
          video={video}
          tickers={tickers}
          recommended={recommended}
          demoMode={demoMode}
          comments={comments}
          startAtSeconds={startAtSeconds}
        />
      </div>
    </>
  );
}

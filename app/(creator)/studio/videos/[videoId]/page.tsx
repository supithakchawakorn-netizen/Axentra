import Link from "next/link";
import { notFound } from "next/navigation";
import { getOwnVideo } from "@/lib/data/creator-videos";
import { PageHeader } from "@/components/shared/page-header";
import { StudioVideoDetailShell } from "@/components/creator/studio-video-detail-shell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage video",
};

interface PageProps {
  params: Promise<{ videoId: string }>;
}

export default async function StudioVideoDetailPage({ params }: PageProps) {
  const { videoId } = await params;
  const video = await getOwnVideo(videoId);

  if (!video) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage video"
        description="Edit metadata, tags, visibility, or delete this video."
        actions={
          <Link
            href="/studio/videos"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Back to videos
          </Link>
        }
      />
      <StudioVideoDetailShell initialVideo={video} />
    </div>
  );
}

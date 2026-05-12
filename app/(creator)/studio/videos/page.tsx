import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listOwnVideos } from "@/lib/data/creator-videos";
import { listDemoStudioVideos } from "@/lib/data/demo-studio";
import { Button } from "@/components/ui/button";
import { VideosTable } from "@/components/creator/videos-table";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your videos",
};

export default async function VideosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const previewMode = !user;
  const videos = previewMode ? listDemoStudioVideos() : await listOwnVideos();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your videos"
        description={
          previewMode
            ? "Preview library with sample rows. Sign in to manage your real videos."
            : "Edit metadata, visibility, and ticker tags. Public-ready videos appear on your profile and feed."
        }
        actions={
          <Button asChild size="sm">
            <Link href="/studio/upload">Upload</Link>
          </Button>
        }
      />
      {previewMode ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          Guest mode enabled: actions run in simulation mode for preview videos.
        </div>
      ) : null}

      {videos.length === 0 ? (
        <EmptyState
          title="No videos yet."
          description="Upload your first video to start building your public library."
          action={
            <Link
              href="/studio/upload"
              className="text-primary hover:underline underline-offset-4"
            >
              Upload your first one →
            </Link>
          }
        />
      ) : (
        <VideosTable initialVideos={videos} />
      )}
    </div>
  );
}

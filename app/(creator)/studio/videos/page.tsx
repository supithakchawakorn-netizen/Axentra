import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listOwnVideos } from "@/lib/data/creator-videos";
import { listDemoStudioVideos } from "@/lib/data/demo-studio";
import { Button } from "@/components/ui/button";
import { VideoRowActions } from "@/components/creator/video-row-actions";
import { formatDate, formatDuration } from "@/lib/utils/format";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusPill } from "@/components/shared/status-pill";

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
        <div className="overflow-x-auto rounded-md border">
          <table className="min-w-[720px] w-full text-sm">
            <thead className="bg-muted text-muted-foreground text-left text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2 font-medium">Title</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Visibility</th>
                <th className="px-4 py-2 font-medium">Length</th>
                <th className="px-4 py-2 font-medium">Created</th>
                <th className="px-4 py-2 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {videos.map((v) => (
                <tr key={v.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/v/${v.id}`}
                      className="hover:underline underline-offset-4"
                    >
                      {v.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill label={v.status} tone={statusTone(v.status)} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill
                      label={v.visibility}
                      tone={v.visibility === "public" ? "success" : "warning"}
                    />
                  </td>
                  <td className="px-4 py-3">
                    {v.duration_seconds != null
                      ? formatDuration(v.duration_seconds)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(v.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <VideoRowActions
                      videoId={v.id}
                      title={v.title}
                      description={v.description}
                      visibility={v.visibility}
                      tickerIds={v.ticker_ids}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function statusTone(status: string): "neutral" | "success" | "warning" | "danger" {
  if (status === "ready") return "success";
  if (status === "errored") return "danger";
  if (status === "processing") return "warning";
  return "neutral";
}

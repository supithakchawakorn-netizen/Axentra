"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { VideoPlayer } from "@/components/video/video-player";
import { StatusPill } from "@/components/shared/status-pill";
import { VideoRowActions } from "@/components/creator/video-row-actions";
import { Button } from "@/components/ui/button";
import { formatDate, formatDuration } from "@/lib/utils/format";

type Visibility = "public" | "unlisted";
type Status = "pending" | "processing" | "ready" | "errored";

interface ManageVideo {
  id: string;
  title: string;
  description: string;
  visibility: Visibility;
  status: Status;
  duration_seconds: number | null;
  created_at: string;
  updated_at: string;
  thumbnail_url: string | null;
  mux_playback_id: string | null;
  playback_url: string | null;
  ticker_ids: string[];
}

export function StudioVideoDetailShell({ initialVideo }: { initialVideo: ManageVideo }) {
  const router = useRouter();
  const [video, setVideo] = useState<ManageVideo>(initialVideo);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {notice ? (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          {notice}
        </div>
      ) : null}
      {error ? (
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-4">
          <VideoPlayer
            playbackId={video.mux_playback_id}
            playbackUrl={video.playback_url}
            title={video.title}
            status={video.status}
            videoId={video.id}
            poster={video.thumbnail_url ?? undefined}
            durationSeconds={video.duration_seconds}
          />

          <div className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold">{video.title}</h2>
            {video.description ? (
              <p className="text-muted-foreground mt-2 whitespace-pre-wrap text-sm">{video.description}</p>
            ) : (
              <p className="text-muted-foreground mt-2 text-sm">No description.</p>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="space-y-3 rounded-lg border p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <StatusPill label={video.status} tone={statusTone(video.status)} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Visibility</span>
              <StatusPill
                label={video.visibility}
                tone={video.visibility === "public" ? "success" : "warning"}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Length</span>
              <span>{video.duration_seconds != null ? formatDuration(video.duration_seconds) : "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{formatDate(video.created_at)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Updated</span>
              <span>{formatDate(video.updated_at)}</span>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border p-4">
            <p className="text-sm font-medium">Manage this video</p>
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild size="sm" variant="secondary">
                <Link href="/studio/videos">Back to library</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/v/${video.id}`}>View public page</Link>
              </Button>
              <VideoRowActions
                videoId={video.id}
                title={video.title}
                description={video.description}
                visibility={video.visibility}
                tickerIds={video.ticker_ids}
                showEditButton
                editButtonLabel="Edit details"
                onDeleted={() => {
                  router.push("/studio/videos");
                }}
                onUpdated={(_, patch) => {
                  setVideo((prev) => ({
                    ...prev,
                    title: patch.title ?? prev.title,
                    description: patch.description ?? prev.description,
                    visibility: patch.visibility ?? prev.visibility,
                    ticker_ids: patch.ticker_ids ?? prev.ticker_ids,
                  }));
                  setError(null);
                  setNotice("Video updated.");
                }}
                onError={(message) => {
                  setNotice(null);
                  setError(message);
                }}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function statusTone(status: Status): "neutral" | "success" | "warning" | "danger" {
  if (status === "ready") return "success";
  if (status === "errored") return "danger";
  if (status === "processing") return "warning";
  return "neutral";
}

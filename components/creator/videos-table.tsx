"use client";

import Link from "next/link";
import { useState } from "react";
import { VideoRowActions } from "@/components/creator/video-row-actions";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/shared/status-pill";
import { formatDate, formatDuration } from "@/lib/utils/format";

type Visibility = "public" | "unlisted";
type Status = "pending" | "processing" | "ready" | "errored";

export interface VideoListItem {
  id: string;
  title: string;
  description: string;
  visibility: Visibility;
  status: Status;
  duration_seconds: number | null;
  created_at: string;
  ticker_ids: string[];
}

type Notice = {
  tone: "success" | "error";
  message: string;
} | null;

export function VideosTable({ initialVideos }: { initialVideos: VideoListItem[] }) {
  const [videos, setVideos] = useState<VideoListItem[]>(initialVideos);
  const [notice, setNotice] = useState<Notice>(null);

  function setSuccess(message: string) {
    setNotice({ tone: "success", message });
  }

  function setError(message: string) {
    setNotice({ tone: "error", message });
  }

  function onDelete(videoId: string) {
    setVideos((prev) => prev.filter((video) => video.id !== videoId));
    setSuccess("Video deleted.");
  }

  function onUpdate(videoId: string, patch: Partial<VideoListItem>) {
    setVideos((prev) =>
      prev.map((video) => (video.id === videoId ? { ...video, ...patch } : video)),
    );
    setSuccess("Video updated.");
  }

  if (videos.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {notice ? (
        <div
          className={
            notice.tone === "success"
              ? "rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200"
              : "border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
          }
        >
          {notice.message}
        </div>
      ) : null}
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
            {videos.map((video) => (
              <tr key={video.id} className="hover:bg-muted/40">
                <td className="px-4 py-3 font-medium">
                  <Link
                    href={`/studio/videos/${video.id}`}
                    className="hover:underline underline-offset-4"
                  >
                    {video.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <StatusPill label={video.status} tone={statusTone(video.status)} />
                </td>
                <td className="px-4 py-3">
                  <StatusPill
                    label={video.visibility}
                    tone={video.visibility === "public" ? "success" : "warning"}
                  />
                </td>
                <td className="px-4 py-3">
                  {video.duration_seconds != null ? formatDuration(video.duration_seconds) : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(video.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button asChild size="sm">
                      <Link href={`/studio/videos/${video.id}`}>Edit</Link>
                    </Button>
                    <VideoRowActions
                      videoId={video.id}
                      title={video.title}
                      description={video.description}
                      visibility={video.visibility}
                      tickerIds={video.ticker_ids}
                      showEditButton
                      editButtonLabel="Quick edit"
                      onDeleted={onDelete}
                      onUpdated={onUpdate}
                      onError={setError}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

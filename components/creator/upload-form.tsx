"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { studioGuestModeEnabled } from "@/lib/env";
import { TickerPicker } from "@/components/creator/ticker-picker";
import type { TickerRow } from "@/lib/data/tickers";

type Status =
  | { tag: "idle" }
  | { tag: "creating" }
  | { tag: "uploading"; pct: number }
  | { tag: "done"; videoId: string }
  | { tag: "error"; message: string };

export function UploadForm() {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState<Status>({ tag: "idle" });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "unlisted">("public");
  const [tickers, setTickers] = useState<TickerRow[]>([]);
  const [file, setFile] = useState<File | null>(null);

  async function ensureStudioGuestUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (user && !error) return user;
    if (!studioGuestModeEnabled()) return null;

    const displayName = `Guest ${Math.random().toString(36).slice(2, 8)}`;
    const { data, error: signInError } = await supabase.auth.signInAnonymously({
      options: {
        data: { full_name: displayName },
      },
    });
    if (signInError) {
      console.error("[upload-form] guest anonymous sign-in failed", signInError);
      return null;
    }
    return data.user;
  }

  async function insertTopicTags(videoId: string) {
    if (tickers.length === 0) return;
    const rows = tickers.map((topic) => ({
      video_id: videoId,
      ticker_id: topic.id,
    }));
    const { error: tagError } = await supabase.from("video_tickers").insert(rows);
    if (tagError) {
      console.error("[upload-form] video_tickers insert error", tagError);
    }
  }

  async function uploadViaSupabaseStorage(params: {
    userId: string;
    fileToUpload: File;
  }): Promise<{ videoId: string }> {
    const extension = params.fileToUpload.name.split(".").pop()?.toLowerCase() || "mp4";
    const objectPath = `${params.userId}/${crypto.randomUUID()}.${extension}`;

    const { error: storageError } = await supabase.storage
      .from("videos")
      .upload(objectPath, params.fileToUpload, {
        cacheControl: "3600",
        upsert: false,
      });
    if (storageError) {
      throw new Error(storageError.message);
    }

    const { data: publicUrlData } = supabase.storage.from("videos").getPublicUrl(objectPath);
    const publicUrl = publicUrlData.publicUrl;

    const { data: inserted, error: insertError } = await supabase
      .from("videos")
      .insert({
        creator_id: params.userId,
        title,
        description: description || "",
        visibility,
        status: "ready",
        mux_upload_id: objectPath,
        storage_path: objectPath,
        playback_url: publicUrl,
        thumbnail_url: null,
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      throw new Error(insertError?.message || "Could not save video metadata.");
    }

    await insertTopicTags(inserted.id);
    return { videoId: inserted.id };
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      setStatus({ tag: "error", message: "Pick a file first." });
      return;
    }

    setStatus({ tag: "uploading", pct: 5 });

    const user = await ensureStudioGuestUser();
    if (!user) {
      setStatus({ tag: "error", message: "You must sign in to upload." });
      return;
    }

    try {
      const uploadUrlResponse = await fetch("/api/mux/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility }),
      });
      const uploadUrlPayload = (await uploadUrlResponse.json()) as
        | { uploadId: string; url: string }
        | { error: string };
      if (!uploadUrlResponse.ok || !("uploadId" in uploadUrlPayload) || !("url" in uploadUrlPayload)) {
        // Fallback for local launch testing when Mux keys are not configured.
        const fallback = await uploadViaSupabaseStorage({
          userId: user.id,
          fileToUpload: file,
        });
        setStatus({ tag: "uploading", pct: 100 });
        await new Promise((resolve) => setTimeout(resolve, 400));
        setStatus({ tag: "done", videoId: fallback.videoId });
        router.push("/studio/videos");
        return;
      }

      setStatus({ tag: "uploading", pct: 35 });

      const uploadResponse = await fetch(uploadUrlPayload.url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });
      if (!uploadResponse.ok) {
        setStatus({ tag: "error", message: "Upload to Mux failed." });
        return;
      }

      setStatus({ tag: "uploading", pct: 75 });
      const { data: inserted, error: insertError } = await supabase
        .from("videos")
        .insert({
          creator_id: user.id,
          title,
          description: description || "",
          visibility,
          status: "processing",
          mux_upload_id: uploadUrlPayload.uploadId,
          thumbnail_url: null,
        })
        .select("id")
        .single();
      if (insertError || !inserted) {
        console.error("[upload-form] videos insert error", insertError);
        setStatus({ tag: "error", message: insertError?.message || "Could not save video metadata." });
        return;
      }

      await insertTopicTags(inserted.id);

      setStatus({ tag: "uploading", pct: 100 });
      await new Promise((resolve) => setTimeout(resolve, 400));
      setStatus({ tag: "done", videoId: inserted.id });
      router.push("/studio/videos");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      console.error("[upload-form] unexpected upload error", err);
      setStatus({ tag: "error", message });
    }
  }

  const busy = status.tag === "uploading";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="glass-panel rounded-lg border p-4 space-y-1.5">
        <p className="text-sm font-medium">Time-to-publish guide</p>
        <ul className="text-muted-foreground space-y-1 text-xs">
          <li>1) Keep title clear and audience-focused for discovery.</li>
          <li>2) Add 1-3 topics so your video appears in the right communities.</li>
          <li>3) Leave this tab open until upload reaches 100%.</li>
        </ul>
      </section>
      <div className="space-y-1.5 rounded-lg border p-4">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={140}
          placeholder="Today's market open"
          disabled={busy}
        />
      </div>

      <div className="space-y-1.5 rounded-lg border p-4">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          maxLength={2000}
          disabled={busy}
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 placeholder:text-muted-foreground w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:opacity-50"
          placeholder="Optional. Short summary of what's covered."
        />
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <p className="text-sm font-medium">Related topics</p>
        <TickerPicker value={tickers} onChange={setTickers} disabled={busy} />
      </div>

      <div className="space-y-1.5 rounded-lg border p-4">
        <Label htmlFor="visibility">Visibility</Label>
        <select
          id="visibility"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as "public" | "unlisted")}
          disabled={busy}
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:opacity-50"
        >
          <option value="public">Public — listed on your profile and feed</option>
          <option value="unlisted">Unlisted — anyone with the link</option>
        </select>
      </div>

      <div className="space-y-1.5 rounded-lg border p-4">
        <Label htmlFor="file">Video file</Label>
        <input
          id="file"
          type="file"
          accept="video/*"
          required
          disabled={busy}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-foreground block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-secondary/80 disabled:opacity-50"
        />
        <p className="text-muted-foreground text-xs">
          Recommended: MP4 (H.264), under 20 minutes for faster processing feedback in V1.
        </p>
      </div>

      {status.tag === "error" ? (
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
          {status.message}
        </div>
      ) : null}

      {status.tag === "uploading" ? (
        <div className="bg-muted h-2 w-full overflow-hidden rounded">
          <div
            className="bg-primary h-full transition-all"
            style={{ width: `${status.pct}%` }}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={busy}>
          {busy
            ? status.tag === "uploading"
              ? `Uploading… ${Math.round(status.pct)}%`
              : "Preparing..."
            : "Upload"}
        </Button>
        <p className="text-muted-foreground text-xs">
          Upload continues in this tab. Keep it open until complete.
        </p>
      </div>
    </form>
  );
}

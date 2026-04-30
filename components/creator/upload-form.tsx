"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createVideoUpload } from "@/app/(creator)/studio/upload/_actions";
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
  const [status, setStatus] = useState<Status>({ tag: "idle" });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "unlisted">("public");
  const [tickers, setTickers] = useState<TickerRow[]>([]);
  const [file, setFile] = useState<File | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      setStatus({ tag: "error", message: "Pick a file first." });
      return;
    }

    setStatus({ tag: "creating" });
    const result = await createVideoUpload({
      title,
      description,
      visibility,
      tickerIds: tickers.map((t) => t.id),
    });
    if (!result.ok) {
      setStatus({ tag: "error", message: result.error });
      return;
    }

    try {
      await uploadToMux(result.uploadUrl, file, (pct) =>
        setStatus({ tag: "uploading", pct }),
      );
      setStatus({ tag: "done", videoId: result.videoId });
      router.push("/studio/videos");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      setStatus({ tag: "error", message });
    }
  }

  const busy = status.tag === "creating" || status.tag === "uploading";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="glass-panel rounded-lg border p-4 space-y-1.5">
        <p className="text-sm font-medium">Time-to-publish guide</p>
        <ul className="text-muted-foreground space-y-1 text-xs">
          <li>1) Keep title clear and ticker-first for feed discovery.</li>
          <li>2) Add 1-3 tickers so your video appears on ticker pages.</li>
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
        <p className="text-sm font-medium">Related tickers</p>
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
              : "Preparing…"
            : "Upload"}
        </Button>
        <p className="text-muted-foreground text-xs">
          Upload continues in this tab. Keep it open until complete.
        </p>
      </div>
    </form>
  );
}

function uploadToMux(
  url: string,
  file: File,
  onProgress: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress((e.loaded / e.total) * 100);
      }
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Mux upload failed with status ${xhr.status}.`));
      }
    });
    xhr.addEventListener("error", () =>
      reject(new Error("Network error during upload.")),
    );
    xhr.addEventListener("abort", () =>
      reject(new Error("Upload aborted.")),
    );
    xhr.send(file);
  });
}

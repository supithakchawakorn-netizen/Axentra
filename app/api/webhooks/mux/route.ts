import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUpload, verifyWebhook } from "@/lib/mux";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Mux webhook handler.
 *
 * Order of operations (AGENTS.md §10):
 *   1. Read raw body
 *   2. Verify signature
 *   3. Parse with zod
 *   4. Service-role write
 *
 * Idempotency: every write is keyed by `mux_asset_id` or `mux_upload_id`. A
 * retried webhook flips the row to the same terminal state without
 * duplicating data.
 *
 * Events handled in M1:
 *   - video.upload.asset_created  -> link upload_id to asset_id
 *   - video.asset.ready           -> set status='ready', playback_id, etc.
 *   - video.asset.errored         -> set status='errored'
 */

const ReadyDataZ = z.object({
  id: z.string(),
  upload_id: z.string().optional(),
  duration: z.number().optional(),
  playback_ids: z
    .array(z.object({ id: z.string(), policy: z.string().optional() }))
    .optional(),
});

const ErroredDataZ = z.object({
  id: z.string(),
  upload_id: z.string().optional(),
});

const UploadAssetCreatedDataZ = z.object({
  id: z.string(),
  upload_id: z.string().optional(),
});

const EnvelopeZ = z.object({
  type: z.string(),
  data: z.unknown(),
});

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("mux-signature");

  let valid: boolean;
  try {
    valid = await verifyWebhook(rawBody, signature);
  } catch (e) {
    console.error("[mux webhook] config error:", e);
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let envelope;
  try {
    envelope = EnvelopeZ.parse(JSON.parse(rawBody));
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (envelope.type) {
    case "video.upload.asset_created": {
      const data = UploadAssetCreatedDataZ.parse(envelope.data);
      if (!data.upload_id) break;
      await supabase
        .from("videos")
        .update({ mux_asset_id: data.id, status: "processing" })
        .eq("mux_upload_id", data.upload_id);
      break;
    }
    case "video.asset.ready": {
      const data = ReadyDataZ.parse(envelope.data);
      const playbackId = data.playback_ids?.[0]?.id ?? null;
      const update: {
        status: "ready";
        mux_playback_id: string | null;
        playback_url: string | null;
        duration_seconds: number | null;
        thumbnail_url: string | null;
      } = {
        status: "ready",
        mux_playback_id: playbackId,
        playback_url: playbackId
          ? `https://stream.mux.com/${playbackId}.m3u8`
          : null,
        duration_seconds: data.duration ? Math.round(data.duration) : null,
        thumbnail_url: playbackId
          ? `https://image.mux.com/${playbackId}/thumbnail.jpg?width=1280&height=720&fit_mode=smartcrop`
          : null,
      };
      // Match by asset_id first; fall back to upload_id if asset_id isn't
      // populated yet (upload.asset_created race).
      const matched = await supabase
        .from("videos")
        .update(update)
        .eq("mux_asset_id", data.id)
        .select("id");
      if ((matched.data ?? []).length === 0 && data.upload_id) {
        await supabase
          .from("videos")
          .update({ ...update, mux_asset_id: data.id })
          .eq("mux_upload_id", data.upload_id);
      }
      break;
    }
    case "video.asset.errored": {
      const data = ErroredDataZ.parse(envelope.data);
      await supabase
        .from("videos")
        .update({ status: "errored" })
        .eq("mux_asset_id", data.id);
      if (data.upload_id) {
        await supabase
          .from("videos")
          .update({ status: "errored" })
          .eq("mux_upload_id", data.upload_id);
      }
      break;
    }
    case "video.upload.errored": {
      const data = ErroredDataZ.parse(envelope.data);
      if (data.upload_id) {
        await supabase
          .from("videos")
          .update({ status: "errored" })
          .eq("mux_upload_id", data.upload_id);
      }
      break;
    }
    case "video.asset.deleted": {
      const data = ErroredDataZ.parse(envelope.data);
      // We don't auto-delete the row here — leaving as best-effort marker so
      // creators see the video in studio with status 'errored' if Mux drops it.
      await supabase
        .from("videos")
        .update({ status: "errored" })
        .eq("mux_asset_id", data.id);
      break;
    }
    default:
      // Ignore other Mux events. Idempotent no-op.
      break;
  }

  return NextResponse.json({ ok: true });
}

// Used by `video.upload.asset_created` reconciliation when needed. Currently
// unused but kept exported for future cron jobs that resolve orphaned uploads.
export const _resolveAssetByUpload = async (uploadId: string) => {
  return getUpload(uploadId);
};

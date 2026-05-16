"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createDirectUpload } from "@/lib/mux";
import { CreateUploadInputZ, type CreateUploadInput } from "@/types/video";
import { siteUrl } from "@/lib/utils/site";
import { captureServerEvent } from "@/lib/posthog/server";
import { Events } from "@/lib/posthog/events";
import { studioGuestModeEnabled } from "@/lib/env";

export interface CreateUploadResult {
  ok: true;
  videoId: string;
  uploadUrl: string;
}
export interface CreateUploadError {
  ok: false;
  error: string;
}

/**
 * Server Action: create a Mux Direct Upload for the current creator.
 *
 * Returns the upload URL the browser will PUT the file to. A `videos` row is
 * inserted with `status = pending`. Status is flipped to `processing` when
 * the upload finishes (Mux upload webhook) and to `ready` when the asset is
 * processed (Mux asset webhook).
 */
export async function createVideoUpload(
  input: CreateUploadInput,
): Promise<CreateUploadResult | CreateUploadError> {
  const parsed = CreateUploadInputZ.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    if (studioGuestModeEnabled()) {
      return {
        ok: true,
        videoId: `guest-video-${crypto.randomUUID()}`,
        uploadUrl: "guest://skip-upload",
      };
    }
    return { ok: false, error: "Not signed in." };
  }

  let upload;
  try {
    upload = await createDirectUpload({
      corsOrigin: siteUrl(),
      visibility: parsed.data.visibility,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Mux upload failed.";
    return { ok: false, error: message };
  }

  const { data: row, error } = await supabase
    .from("videos")
    .insert({
      creator_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      visibility: parsed.data.visibility,
      status: "pending",
      mux_upload_id: upload.uploadId,
    })
    .select("id")
    .single();
  if (error || !row) {
    return {
      ok: false,
      error: error?.message ?? "Could not create video row.",
    };
  }

  const videoId = (row as { id: string }).id;

  if (parsed.data.tickerIds.length > 0) {
    const tickerRows = parsed.data.tickerIds.map((tid) => ({
      video_id: videoId,
      ticker_id: tid,
    }));
    const { error: tagErr } = await supabase
      .from("video_tickers")
      .insert(tickerRows);
    if (tagErr) {
      await supabase.from("videos").delete().eq("id", videoId).eq("creator_id", user.id);
      return { ok: false, error: `Could not attach topics: ${tagErr.message}` };
    }
  }

  await captureServerEvent({
    distinctId: user.id,
    event: Events.VideoUploadStart,
    properties: { video_id: videoId },
  });

  revalidatePath("/studio/videos");
  return {
    ok: true,
    videoId,
    uploadUrl: upload.uploadUrl,
  };
}

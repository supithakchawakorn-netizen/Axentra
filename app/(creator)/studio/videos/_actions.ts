"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  DeleteVideoInputZ,
  EditVideoInputZ,
  SetVisibilityInputZ,
  type DeleteVideoInput,
  type EditVideoInput,
  type SetVisibilityInput,
} from "@/types/video";
import { studioGuestModeEnabled } from "@/lib/env";

export async function editVideo(input: EditVideoInput): Promise<{ ok: boolean; error?: string }> {
  if (studioGuestModeEnabled()) {
    return { ok: true };
  }
  const parsed = EditVideoInputZ.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    if (studioGuestModeEnabled()) return { ok: true };
    return { ok: false, error: "Not signed in." };
  }

  const videoUpdates: {
    title?: string;
    description?: string;
    visibility?: "public" | "unlisted";
  } = {};
  if (parsed.data.title !== undefined) {
    videoUpdates.title = parsed.data.title;
  }
  if (parsed.data.description !== undefined) {
    videoUpdates.description = parsed.data.description;
  }
  if (parsed.data.visibility !== undefined) {
    videoUpdates.visibility = parsed.data.visibility;
  }
  if (Object.keys(videoUpdates).length > 0) {
    const { error } = await supabase
      .from("videos")
      .update(videoUpdates)
      .eq("id", parsed.data.videoId)
      .eq("creator_id", user.id);
    if (error) return { ok: false, error: error.message };
  }

  // Replace ticker tags. Cheap delete-then-insert. RLS gates by creator.
  if (parsed.data.tickerIds !== undefined) {
    const { error: delErr } = await supabase
      .from("video_tickers")
      .delete()
      .eq("video_id", parsed.data.videoId);
    if (delErr) {
      return { ok: false, error: delErr.message };
    }
    if (parsed.data.tickerIds.length > 0) {
      const rows = parsed.data.tickerIds.map((tid) => ({
        video_id: parsed.data.videoId,
        ticker_id: tid,
      }));
      const { error: insErr } = await supabase.from("video_tickers").insert(rows);
      if (insErr) {
        return { ok: false, error: insErr.message };
      }
    }
  }

  revalidatePath("/studio/videos");
  revalidatePath(`/v/${parsed.data.videoId}`);
  return { ok: true };
}

export async function setVisibility(
  input: SetVisibilityInput,
): Promise<{ ok: boolean; error?: string }> {
  if (studioGuestModeEnabled()) {
    return { ok: true };
  }
  const parsed = SetVisibilityInputZ.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    if (studioGuestModeEnabled()) return { ok: true };
    return { ok: false, error: "Not signed in." };
  }

  const { error } = await supabase
    .from("videos")
    .update({ visibility: parsed.data.visibility })
    .eq("id", parsed.data.videoId)
    .eq("creator_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/studio/videos");
  revalidatePath(`/v/${parsed.data.videoId}`);
  return { ok: true };
}

export async function deleteVideo(
  input: DeleteVideoInput,
): Promise<{ ok: boolean; error?: string }> {
  if (studioGuestModeEnabled()) {
    return { ok: true };
  }
  const parsed = DeleteVideoInputZ.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    if (studioGuestModeEnabled()) return { ok: true };
    return { ok: false, error: "Not signed in." };
  }

  const { error } = await supabase
    .from("videos")
    .delete()
    .eq("id", parsed.data.videoId)
    .eq("creator_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/studio/videos");
  return { ok: true };
}

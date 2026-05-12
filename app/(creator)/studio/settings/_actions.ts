"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { UpdateProfileInputZ, type UpdateProfileInput } from "@/types/profile";
import { studioGuestModeEnabled } from "@/lib/env";

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<{ ok: boolean; error?: string }> {
  const parsed = UpdateProfileInputZ.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
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
    .from("profiles")
    .update({
      handle: parsed.data.handle,
      display_name: parsed.data.displayName,
      bio: parsed.data.bio,
      avatar_url: parsed.data.avatarUrl || null,
    })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "That handle is already taken." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/studio/settings");
  revalidatePath(`/@${parsed.data.handle}`);
  return { ok: true };
}

export async function deleteAccount(): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    if (studioGuestModeEnabled()) return { ok: true };
    return { ok: false, error: "Not signed in." };
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not delete account.",
    };
  }
}

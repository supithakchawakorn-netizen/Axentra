import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";

export interface PublicProfile {
  id: string;
  handle: string;
  display_name: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  verified_broker: boolean;
}

export async function getProfileByHandle(
  handle: string,
): Promise<PublicProfile | null> {
  if (!supabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, handle, display_name, avatar_url, banner_url, bio, verified_broker",
    )
    .eq("handle", handle.toLowerCase())
    .maybeSingle();
  if (error) {
    console.error("[getProfileByHandle]", error.message);
    return null;
  }
  return (data as unknown as PublicProfile) ?? null;
}

export async function getCurrentProfile(): Promise<PublicProfile | null> {
  if (!supabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, handle, display_name, avatar_url, banner_url, bio, verified_broker",
    )
    .eq("id", user.id)
    .maybeSingle();
  if (error) {
    console.error("[getCurrentProfile]", error.message);
    return null;
  }
  return (data as unknown as PublicProfile) ?? null;
}

export async function getProfileById(id: string): Promise<PublicProfile | null> {
  if (!supabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, handle, display_name, avatar_url, banner_url, bio, verified_broker",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[getProfileById]", error.message);
    return null;
  }
  return (data as unknown as PublicProfile) ?? null;
}

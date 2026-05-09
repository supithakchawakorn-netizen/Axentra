"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/utils/site";

const EmailZ = z.object({
  email: z.string().email(),
  next: z.string().default("/studio"),
});

const PROVIDER_NEXT_KEY = "next";

function normalizeNext(next: string): string {
  if (!next.startsWith("/") || next.startsWith("//")) {
    return "/studio";
  }
  return next;
}

async function requestOrigin(): Promise<string> {
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  if (origin) {
    try {
      return new URL(origin).origin;
    } catch {
      // Ignore malformed origin and continue with host/proto inference.
    }
  }

  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  if (host) {
    const proto =
      headerStore.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }

  return siteUrl();
}

function callbackUrl(next: string, base: string): string {
  const url = new URL("/auth/callback", base);
  url.searchParams.set(PROVIDER_NEXT_KEY, next);
  return url.toString();
}

export async function signInWithEmail(formData: FormData): Promise<void> {
  const next = normalizeNext(String(formData.get("next") ?? "/studio"));
  const parsed = EmailZ.safeParse({
    email: formData.get("email"),
    next,
  });
  if (!parsed.success) {
    const params = new URLSearchParams({
      error: "Please enter a valid email.",
      next,
    });
    redirect(`/sign-in?${params.toString()}`);
  }

  const supabase = await createClient();
  const base = await requestOrigin();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: callbackUrl(parsed.data.next, base) },
  });
  if (error) {
    const params = new URLSearchParams({
      error: error.message,
      next: parsed.data.next,
    });
    redirect(`/sign-in?${params.toString()}`);
  }
  const params = new URLSearchParams({ sent: "1", next: parsed.data.next });
  redirect(`/sign-in?${params.toString()}`);
}

export async function signInWithGoogle(formData: FormData): Promise<void> {
  const next = normalizeNext(String(formData.get("next") ?? "/studio"));
  const supabase = await createClient();
  const base = await requestOrigin();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl(next, base) },
  });
  if (error || !data.url) {
    const params = new URLSearchParams({
      error: error?.message ?? "Could not start Google sign-in.",
      next,
    });
    redirect(`/sign-in?${params.toString()}`);
  }
  redirect(data.url);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

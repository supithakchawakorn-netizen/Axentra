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

function callbackUrl(next: string): string {
  const base = siteUrl();
  const url = new URL("/auth/callback", base);
  url.searchParams.set(PROVIDER_NEXT_KEY, next);
  return url.toString();
}

export async function signInWithEmail(formData: FormData): Promise<void> {
  const parsed = EmailZ.safeParse({
    email: formData.get("email"),
    next: formData.get("next") ?? "/studio",
  });
  if (!parsed.success) {
    const params = new URLSearchParams({
      error: "Please enter a valid email.",
      next: String(formData.get("next") ?? "/studio"),
    });
    redirect(`/sign-in?${params.toString()}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: callbackUrl(parsed.data.next) },
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
  const next = String(formData.get("next") ?? "/studio");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl(next) },
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

// Mark `headers` as referenced to silence unused warnings if we add IP-based
// rate limiting here later. (Sign-in OTP is rate-limited by Supabase itself.)
void headers;

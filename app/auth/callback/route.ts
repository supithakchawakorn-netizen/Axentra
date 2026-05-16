import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function normalizeNext(next: string | null): string {
  if (!next) {
    return "/";
  }
  let decoded = next;
  try {
    decoded = decodeURIComponent(next);
  } catch {
    return "/";
  }
  if (!decoded.startsWith("/") || decoded.startsWith("//") || decoded.includes("\\")) {
    return "/";
  }
  return decoded;
}

/**
 * OAuth + magic-link callback. Exchanges the `code` query parameter for a
 * session, then redirects to `next` (defaults to /).
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = normalizeNext(url.searchParams.get("next"));
  const errorDescription = url.searchParams.get("error_description");

  if (errorDescription) {
    const redirect = new URL("/sign-in", url);
    redirect.searchParams.set("error", errorDescription);
    redirect.searchParams.set("next", next);
    return NextResponse.redirect(redirect);
  }

  if (!code) {
    const redirect = new URL("/sign-in", url);
    redirect.searchParams.set("error", "Missing auth code.");
    redirect.searchParams.set("next", next);
    return NextResponse.redirect(redirect);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const redirect = new URL("/sign-in", url);
    redirect.searchParams.set("error", error.message);
    redirect.searchParams.set("next", next);
    return NextResponse.redirect(redirect);
  }

  return NextResponse.redirect(new URL(next, url));
}

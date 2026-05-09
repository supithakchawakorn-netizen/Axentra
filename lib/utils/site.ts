/**
 * Canonical site URL. Falls back to localhost in dev. Always returns a string
 * with no trailing slash.
 */
export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export const APP_NAME = "Varg Packs";

export const APP_DESCRIPTION =
  "Wolfpack-themed market commentary, live and on demand, with creator brokerage links shown read-only.";

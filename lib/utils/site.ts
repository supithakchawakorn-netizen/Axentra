/**
 * Canonical site URL. Falls back to localhost in dev. Always returns a string
 * with no trailing slash.
 */
export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export const APP_NAME = "Axentra";

export const APP_DESCRIPTION =
  "Watch market commentary on demand or live. Follow creators who link their brokerage read-only.";

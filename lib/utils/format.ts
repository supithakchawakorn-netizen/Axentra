/**
 * Format a duration in seconds as `m:ss` (or `h:mm:ss` for >= 1 hour).
 */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${minutes}:${pad(seconds)}`;
}

/** Format a date string as a short relative-friendly absolute (e.g. "Apr 29, 2026"). */
export function formatDate(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Format a date string as relative time (e.g. "3 days ago"). */
export function formatRelativeDate(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const deltaMs = Date.now() - date.getTime();
  const absSeconds = Math.floor(Math.abs(deltaMs) / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absSeconds < 60) {
    return rtf.format(-Math.floor(deltaMs / 1000), "second");
  }
  const absMinutes = Math.floor(absSeconds / 60);
  if (absMinutes < 60) {
    return rtf.format(-Math.floor(deltaMs / (60 * 1000)), "minute");
  }
  const absHours = Math.floor(absMinutes / 60);
  if (absHours < 24) {
    return rtf.format(-Math.floor(deltaMs / (60 * 60 * 1000)), "hour");
  }
  const absDays = Math.floor(absHours / 24);
  if (absDays < 30) {
    return rtf.format(-Math.floor(deltaMs / (24 * 60 * 60 * 1000)), "day");
  }
  const absMonths = Math.floor(absDays / 30);
  if (absMonths < 12) {
    return rtf.format(-Math.floor(deltaMs / (30 * 24 * 60 * 60 * 1000)), "month");
  }
  return rtf.format(-Math.floor(deltaMs / (365 * 24 * 60 * 60 * 1000)), "year");
}

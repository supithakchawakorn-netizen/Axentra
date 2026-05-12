export interface WatchSessionItem {
  videoId: string;
  title: string;
  href: string;
  creatorLabel?: string;
  creatorHandle?: string;
  thumbnailUrl?: string | null;
  progressPct: number;
  durationSeconds?: number | null;
  lastPositionSeconds?: number;
  updatedAt: number;
}

const STORAGE_KEY = "vargpacks.watch.sessions.v1";
const MAX_ITEMS = 30;

function clampPercent(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function parseStored(raw: string | null): WatchSessionItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry): entry is WatchSessionItem => {
        if (!entry || typeof entry !== "object") return false;
        const candidate = entry as Partial<WatchSessionItem>;
        return (
          typeof candidate.videoId === "string" &&
          typeof candidate.title === "string" &&
          typeof candidate.href === "string" &&
          typeof candidate.progressPct === "number" &&
          typeof candidate.updatedAt === "number"
        );
      })
      .map((entry) => ({
        ...entry,
        progressPct: clampPercent(entry.progressPct),
      }));
  } catch {
    return [];
  }
}

export function getWatchSessions(): WatchSessionItem[] {
  if (typeof window === "undefined") return [];
  return parseStored(window.localStorage.getItem(STORAGE_KEY));
}

export function saveWatchSession(item: Omit<WatchSessionItem, "updatedAt">): void {
  if (typeof window === "undefined") return;
  const current = getWatchSessions().filter((entry) => entry.videoId !== item.videoId);
  const next: WatchSessionItem = {
    ...item,
    progressPct: clampPercent(item.progressPct),
    updatedAt: Date.now(),
  };
  const merged = [next, ...current].slice(0, MAX_ITEMS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
}


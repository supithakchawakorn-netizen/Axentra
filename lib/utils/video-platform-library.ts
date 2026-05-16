"use client";

export interface VideoPlatformLibraryState {
  subscribedCreatorIds: string[];
  likedVideoIds: string[];
  watchLaterVideoIds: string[];
}

const STORAGE_KEY = "vargpacks.video.platform.library.v1";

const EMPTY_STATE: VideoPlatformLibraryState = {
  subscribedCreatorIds: [],
  likedVideoIds: [],
  watchLaterVideoIds: [],
};

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string");
}

function sanitizeState(value: unknown): VideoPlatformLibraryState {
  if (!value || typeof value !== "object") return EMPTY_STATE;
  const candidate = value as Partial<VideoPlatformLibraryState>;
  return {
    subscribedCreatorIds: normalizeStringList(candidate.subscribedCreatorIds),
    likedVideoIds: normalizeStringList(candidate.likedVideoIds),
    watchLaterVideoIds: normalizeStringList(candidate.watchLaterVideoIds),
  };
}

export function getVideoPlatformLibraryState(): VideoPlatformLibraryState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    return sanitizeState(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null"));
  } catch {
    return EMPTY_STATE;
  }
}

function saveVideoPlatformLibraryState(state: VideoPlatformLibraryState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function toggleInList(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((entry) => entry !== id) : [id, ...list];
}

export function toggleSubscribedCreator(creatorId: string): VideoPlatformLibraryState {
  const current = getVideoPlatformLibraryState();
  const next = {
    ...current,
    subscribedCreatorIds: toggleInList(current.subscribedCreatorIds, creatorId),
  };
  saveVideoPlatformLibraryState(next);
  return next;
}

export function toggleLikedVideo(videoId: string): VideoPlatformLibraryState {
  const current = getVideoPlatformLibraryState();
  const next = {
    ...current,
    likedVideoIds: toggleInList(current.likedVideoIds, videoId),
  };
  saveVideoPlatformLibraryState(next);
  return next;
}

export function toggleWatchLaterVideo(videoId: string): VideoPlatformLibraryState {
  const current = getVideoPlatformLibraryState();
  const next = {
    ...current,
    watchLaterVideoIds: toggleInList(current.watchLaterVideoIds, videoId),
  };
  saveVideoPlatformLibraryState(next);
  return next;
}

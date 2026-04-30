export const VIEW_MODE_KEY = "axentra-view-mode";
export const VIEW_MODE_MANUAL_KEY = "axentra-view-mode-manual";

export type ViewMode = "standard" | "luxury";

export function applyViewMode(mode: ViewMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("view-luxury-terminal", mode === "luxury");
}

export function parseViewMode(value: string | null): ViewMode {
  return value === "luxury" ? "luxury" : "standard";
}

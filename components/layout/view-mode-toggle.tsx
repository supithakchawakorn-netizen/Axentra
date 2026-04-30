"use client";

import { useEffect, useState } from "react";
import { Monitor, TerminalSquare } from "lucide-react";
import {
  applyViewMode,
  parseViewMode,
  VIEW_MODE_KEY,
  VIEW_MODE_MANUAL_KEY,
  type ViewMode,
} from "@/lib/ui/view-mode";

export function ViewModeToggle() {
  const [mode, setMode] = useState<ViewMode>("standard");

  useEffect(() => {
    const saved = localStorage.getItem(VIEW_MODE_KEY);
    const next = parseViewMode(saved);
    applyViewMode(next);
    queueMicrotask(() => setMode(next));
  }, []);

  useEffect(() => {
    applyViewMode(mode);
  }, [mode]);

  function onToggle() {
    const next: ViewMode = mode === "standard" ? "luxury" : "standard";
    setMode(next);
    localStorage.setItem(VIEW_MODE_KEY, next);
    localStorage.setItem(VIEW_MODE_MANUAL_KEY, "1");
    applyViewMode(next);
  }

  const luxury = mode === "luxury";
  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-muted-foreground hover:text-foreground hover:bg-muted inline-flex size-8 items-center justify-center rounded-full transition-colors"
      aria-label={luxury ? "Switch to standard view mode" : "Switch to luxury dark terminal mode"}
      title={luxury ? "Standard view mode" : "Luxury dark terminal mode"}
    >
      {luxury ? <Monitor className="size-4" /> : <TerminalSquare className="size-4" />}
    </button>
  );
}

"use client";

import { useEffect } from "react";
import { useAdaptiveExperiment } from "@/components/experiments/use-adaptive-experiment";
import {
  applyViewMode,
  VIEW_MODE_KEY,
  VIEW_MODE_MANUAL_KEY,
  type ViewMode,
} from "@/lib/ui/view-mode";

type Variant = "standard" | "luxury";

export function ViewModeExperiment() {
  const { variant } = useAdaptiveExperiment<Variant>({
    experimentKey: "public_view_mode_v1",
    surface: "public_shell",
    variants: ["standard", "luxury"],
  });

  useEffect(() => {
    const manual = localStorage.getItem(VIEW_MODE_MANUAL_KEY) === "1";
    if (manual) return;
    const mode = variant as ViewMode;
    localStorage.setItem(VIEW_MODE_KEY, mode);
    applyViewMode(mode);
  }, [variant]);

  return null;
}

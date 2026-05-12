"use client";

import { useEffect, useState } from "react";
import { Rows2, Rows3 } from "lucide-react";

const KEY = "vargpacks-density";

type Density = "default" | "compact";

function applyDensity(value: Density) {
  const root = document.documentElement;
  root.classList.toggle("density-compact", value === "compact");
}

export function DisplayDensityToggle() {
  const [density, setDensity] = useState<Density>("default");

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    const next: Density = saved === "compact" ? "compact" : "default";
    applyDensity(next);
    queueMicrotask(() => setDensity(next));
  }, []);

  useEffect(() => {
    applyDensity(density);
  }, [density]);

  function onToggle() {
    const next: Density = density === "default" ? "compact" : "default";
    setDensity(next);
    localStorage.setItem(KEY, next);
    applyDensity(next);
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-muted-foreground hover:text-foreground hover:bg-muted inline-flex size-8 items-center justify-center rounded-full transition-colors"
      aria-label={`Switch to ${density === "default" ? "compact" : "default"} density`}
      title={density === "default" ? "Compact mode" : "Default mode"}
    >
      {density === "default" ? (
        <Rows3 className="size-4" />
      ) : (
        <Rows2 className="size-4" />
      )}
    </button>
  );
}

"use client";

import { useMemo } from "react";

const DEFAULT_METRICS = [
  { label: "New posts", value: "128" },
  { label: "Helpful votes", value: "2.3k" },
  { label: "Live rooms", value: "14" },
  { label: "Active communities", value: "52" },
];

export function MarketTape({
  compact = false,
}: {
  symbols?: string[];
  compact?: boolean;
}) {
  const metrics = useMemo(() => DEFAULT_METRICS, []);

  return (
    <section className="glass-panel rounded-xl border px-3 py-2">
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Realtime community pulse
        </p>
      </div>
      <ul className={`flex flex-wrap items-center gap-2 ${compact ? "text-xs" : "text-sm"}`}>
        {metrics.map((metric) => (
          <li key={metric.label} className="rounded-full border bg-muted/30 px-2.5 py-1">
            <span className="mr-1 text-muted-foreground">{metric.label}:</span>
            <span className="font-medium">{metric.value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

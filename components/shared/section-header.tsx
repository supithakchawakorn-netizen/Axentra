import type { ReactNode } from "react";

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3 border-b pb-2">
      <div className="space-y-0.5">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {subtitle ? (
          <p className="text-muted-foreground text-xs sm:text-sm">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

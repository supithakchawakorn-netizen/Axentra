import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="glass-panel premium-surface soft-enter ambient-glow rounded-2xl border p-5 space-y-2 sm:p-6">
      {eyebrow ? (
        <p className="text-muted-foreground text-xs uppercase tracking-widest">
          {eyebrow}
        </p>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {actions ? <div>{actions}</div> : null}
      </div>
      {description ? (
        <p className="text-muted-foreground max-w-prose text-sm sm:text-base">
          {description}
        </p>
      ) : null}
    </header>
  );
}

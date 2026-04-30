import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="glass-panel rounded-xl border p-8 text-sm">
      <p className="text-foreground font-medium">{title}</p>
      <p className="text-muted-foreground mt-1">{description}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

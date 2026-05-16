import type { IntegrationItem } from "@/lib/setup/integrations";
import { cn } from "@/lib/utils/cn";

interface StatusChipProps {
  label: string;
  tone: "success" | "warning" | "danger";
}

function StatusChip({ label, tone }: StatusChipProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider",
        tone === "success" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
        tone === "warning" && "border-amber-500/30 bg-amber-500/10 text-amber-200",
        tone === "danger" && "border-red-500/30 bg-red-500/10 text-red-300",
      )}
    >
      {label}
    </span>
  );
}

export function AdminControlCenter({ checklist }: { checklist: IntegrationItem[] }) {
  const configured = checklist.filter((item) => item.configured).length;
  const partial = checklist.filter((item) => item.partial && !item.configured).length;
  const missing = checklist.length - configured - partial;
  const cronSecret = Boolean(process.env.CRON_SECRET);
  const webhookRows = [
    {
      name: "Mux webhook",
      configured: Boolean(process.env.MUX_WEBHOOK_SECRET),
    },
    {
      name: "LiveKit webhook",
      configured: Boolean(process.env.LIVEKIT_WEBHOOK_SECRET),
    },
  ];

  const cronRows = [
    { name: "community digest", ready: cronSecret && Boolean(process.env.OPENAI_API_KEY) },
    { name: "reputation maintenance", ready: cronSecret },
  ];

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold">Admin control center</h2>
      <div className="grid gap-3 lg:grid-cols-4">
        <article className="glass-panel rounded-xl border p-4 space-y-2">
          <p className="text-sm font-medium">Service health</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-md border bg-muted/30 px-2 py-1.5">
              <p className="text-muted-foreground">Configured</p>
              <p className="font-semibold">{configured}</p>
            </div>
            <div className="rounded-md border bg-muted/30 px-2 py-1.5">
              <p className="text-muted-foreground">Partial</p>
              <p className="font-semibold">{partial}</p>
            </div>
            <div className="rounded-md border bg-muted/30 px-2 py-1.5">
              <p className="text-muted-foreground">Missing</p>
              <p className="font-semibold">{missing}</p>
            </div>
          </div>
          <ul className="space-y-1.5 text-xs">
            {checklist.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-2 rounded-md border px-2 py-1.5">
                <span className="truncate">{item.name}</span>
                {item.configured ? (
                  <StatusChip label="healthy" tone="success" />
                ) : item.partial ? (
                  <StatusChip label="partial" tone="warning" />
                ) : (
                  <StatusChip label="missing" tone="danger" />
                )}
              </li>
            ))}
          </ul>
        </article>

        <article className="glass-panel rounded-xl border p-4 space-y-2">
          <p className="text-sm font-medium">Cron readiness</p>
          <p className="text-muted-foreground text-xs">
            Depends on <code>CRON_SECRET</code> and downstream integration keys.
          </p>
          <ul className="space-y-1.5 text-xs">
            {cronRows.map((row) => (
              <li key={row.name} className="flex items-center justify-between gap-2 rounded-md border px-2 py-1.5">
                <span>{row.name}</span>
                {row.ready ? (
                  <StatusChip label="ready" tone="success" />
                ) : (
                  <StatusChip label="blocked" tone="warning" />
                )}
              </li>
            ))}
          </ul>
        </article>

        <article className="glass-panel rounded-xl border p-4 space-y-2">
          <p className="text-sm font-medium">Webhook sync status</p>
          <p className="text-muted-foreground text-xs">
            Signature secrets must be set for reliable lifecycle sync.
          </p>
          <ul className="space-y-1.5 text-xs">
            {webhookRows.map((row) => (
              <li key={row.name} className="flex items-center justify-between gap-2 rounded-md border px-2 py-1.5">
                <span>{row.name}</span>
                {row.configured ? (
                  <StatusChip label="armed" tone="success" />
                ) : (
                  <StatusChip label="not set" tone="warning" />
                )}
              </li>
            ))}
          </ul>
        </article>

        <article className="glass-panel rounded-xl border p-4 space-y-2">
          <p className="text-sm font-medium">Community trust readiness</p>
          <p className="text-muted-foreground text-xs">
            Verify identity, reputation, and feedback instrumentation are configured.
          </p>
          <ul className="space-y-1.5 text-xs">
            <li className="flex items-center justify-between gap-2 rounded-md border px-2 py-1.5">
              <span>PostHog key</span>
              {process.env.NEXT_PUBLIC_POSTHOG_KEY ? (
                <StatusChip label="ready" tone="success" />
              ) : (
                <StatusChip label="missing" tone="warning" />
              )}
            </li>
            <li className="flex items-center justify-between gap-2 rounded-md border px-2 py-1.5">
              <span>Sentry DSN</span>
              {process.env.NEXT_PUBLIC_SENTRY_DSN ? (
                <StatusChip label="ready" tone="success" />
              ) : (
                <StatusChip label="optional" tone="warning" />
              )}
            </li>
          </ul>
        </article>
      </div>
    </section>
  );
}

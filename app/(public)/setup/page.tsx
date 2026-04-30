import Link from "next/link";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { UxLabPanel } from "@/components/shared/ux-lab-panel";
import { AdminControlCenter } from "@/components/shared/admin-control-center";
import { ExperimentLeaderboard } from "@/components/shared/experiment-leaderboard";
import { getIntegrationChecklist } from "@/lib/setup/integrations";

export const metadata = {
  title: "Setup assistant",
  description: "Connect external services to switch from Demo Mode to real data.",
};

export default function SetupPage() {
  const checklist = getIntegrationChecklist();
  const mustHave = checklist.filter((i) => !i.optional);
  const nextNeeded = mustHave.find((i) => !i.configured) ?? null;
  const configuredCount = checklist.filter((i) => i.configured).length;
  const completion = Math.round((configuredCount / checklist.length) * 100);
  const recommendedNextAction = getRecommendedNextAction(checklist);

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-2 py-6">
      <PageHeader
        title="Setup assistant"
        description="Follow this checklist to move from Demo Mode to fully live integrations."
      />

      <section className="glass-panel rounded-xl border p-4 space-y-2">
        <p className="text-sm font-semibold">What I need from you next</p>
        {nextNeeded ? (
          <p className="readable-copy text-muted-foreground text-sm">
            Please provide the API keys for <span className="text-foreground font-medium">{nextNeeded.name}</span>.
            You can create them here:{" "}
            <a href={nextNeeded.docsUrl} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-4">
              {nextNeeded.docsUrl}
            </a>
          </p>
        ) : (
          <p className="readable-copy text-muted-foreground text-sm">
            Core integrations are configured. You can continue with optional services below.
          </p>
        )}
      </section>

      <section className="glass-panel rounded-xl border p-4 space-y-2">
        <p className="text-sm font-semibold">Recommended next action</p>
        <p className="readable-copy text-sm text-muted-foreground">{recommendedNextAction.title}</p>
        <div className="text-xs text-muted-foreground">
          <p className="readable-copy">{recommendedNextAction.description}</p>
          {recommendedNextAction.keyHint ? (
            <code className="mt-2 inline-flex rounded-full border px-2 py-0.5">
              {recommendedNextAction.keyHint}
            </code>
          ) : null}
        </div>
        <div className="pt-1">
          <a
            href={recommendedNextAction.href}
            target="_blank"
            rel="noreferrer"
            className="text-primary text-xs hover:underline underline-offset-4"
          >
            Open runbook →
          </a>
        </div>
      </section>

      <section className="glass-panel rounded-xl border p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Operations cockpit</h2>
          <span className="text-xs text-muted-foreground">{completion}% complete</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${completion}%` }}
          />
        </div>
        <div className="grid gap-2 text-xs sm:grid-cols-3">
          <Link href="/" className="rounded-md border px-3 py-2 hover:bg-muted/50">
            Viewer surface
          </Link>
          <Link href="/studio" className="rounded-md border px-3 py-2 hover:bg-muted/50">
            Creator studio
          </Link>
          <Link href="/setup" className="rounded-md border px-3 py-2 hover:bg-muted/50">
            Admin diagnostics
          </Link>
        </div>
      </section>

      <AdminControlCenter checklist={checklist} />
      <ExperimentLeaderboard />
      <UxLabPanel />

      <section className="space-y-3">
        {checklist.map((item) => (
          <article key={item.id} className="glass-panel rounded-xl border p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {item.configured ? (
                  <CheckCircle2 className="size-4 text-emerald-400" />
                ) : (
                  <CircleDashed className="size-4 text-amber-300" />
                )}
                <h2 className="text-sm font-semibold">{item.name}</h2>
                {item.optional ? (
                  <span className="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    Optional
                  </span>
                ) : null}
              </div>
              <span className="text-xs text-muted-foreground">
                {item.configured
                  ? "Configured"
                  : item.partial
                    ? "Partially configured"
                    : "Missing"}
              </span>
            </div>

            <p className="text-sm text-muted-foreground">{item.requiredFor}</p>
            {item.notes ? (
              <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs text-amber-200">
                {item.notes}
              </p>
            ) : null}

            <div className="text-xs">
              <p className="mb-1 font-medium">Required env vars</p>
              <code className="block whitespace-pre-wrap rounded-md border bg-muted/40 px-2 py-1">
                {item.keys.join("\n")}
              </code>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <a
                href={item.docsUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-secondary hover:bg-accent rounded-full px-3 py-1.5"
              >
                Open official setup
              </a>
              {INTERNAL_RUNBOOKS[item.id] ? (
                <a
                  href={INTERNAL_RUNBOOKS[item.id]}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-secondary hover:bg-accent rounded-full px-3 py-1.5"
                >
                  Open Axentra runbook
                </a>
              ) : null}
              {item.install ? (
                <code className="rounded-full border px-3 py-1.5">{item.install}</code>
              ) : null}
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-xl border p-4 text-sm text-muted-foreground">
        After adding keys to <code>.env.local</code>, restart dev server with <code>pnpm dev</code>.
        Then run <code>pnpm check</code> to verify everything.
        <div className="mt-2">
          <Link href="/" className="text-primary underline underline-offset-4">
            Back to app
          </Link>
        </div>
      </section>
    </main>
  );
}

const INTERNAL_RUNBOOKS: Record<string, string> = {
  supabase: "https://supabase.com/docs/guides/getting-started/quickstarts/nextjs",
  mux: "https://docs.mux.com/guides/video/get-started-with-mux-video",
  livekit: "https://docs.livekit.io/home/quickstarts/nextjs/",
  openai: "https://platform.openai.com/docs/quickstart",
  market_data: "https://polygon.io/docs/stocks/getting-started",
  posthog: "https://posthog.com/docs/libraries/next-js",
  sentry: "https://docs.sentry.io/platforms/javascript/guides/nextjs/",
  resend: "https://resend.com/docs/send-with-nextjs",
};

function getRecommendedNextAction(
  checklist: ReturnType<typeof getIntegrationChecklist>,
) {
  if (!process.env.CRON_SECRET) {
    return {
      title: "Set CRON security first",
      description:
        "Cron endpoints are part of platform safety. Configure the shared secret before enabling periodic jobs.",
      keyHint: "CRON_SECRET",
      href: "https://vercel.com/docs/cron-jobs/manage-cron-jobs",
    };
  }

  const coreOrder = ["supabase", "mux", "livekit", "openai"];
  const missingCore = coreOrder
    .map((id) => checklist.find((item) => item.id === id))
    .find((item) => item && !item.configured);
  if (missingCore) {
    return {
      title: `Finish ${missingCore.name} integration`,
      description:
        "This unlocks the next major product surface and reduces demo-mode fallbacks.",
      keyHint: missingCore.keys[0],
      href: missingCore.docsUrl,
    };
  }

  const marketData = checklist.find((item) => item.id === "market_data");
  if (marketData && !marketData.configured) {
    return {
      title: "Activate realtime market provider",
      description:
        "Set provider mode and API credentials to replace the demo tape with live exchange data.",
      keyHint: "NEXT_PUBLIC_MARKET_DATA_MODE=provider",
      href: marketData.docsUrl,
    };
  }

  const partial = checklist.find(
    (item) => item.id !== "market_data" && item.partial && !item.configured,
  );
  if (partial) {
    return {
      title: `Complete ${partial.name} webhook sync`,
      description: partial.notes ?? "Add the remaining keys to remove degraded sync behavior.",
      keyHint: partial.keys.at(-1),
      href: partial.docsUrl,
    };
  }

  return {
    title: "Turn on observability",
    description:
      "Core services are ready. Next leverage PostHog and Sentry for confidence in real traffic.",
    keyHint: "NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_SENTRY_DSN",
    href: "https://posthog.com/docs/libraries/next-js",
  };
}

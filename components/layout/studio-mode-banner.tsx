import Link from "next/link";

export function StudioModeBanner({ previewMode }: { previewMode: boolean }) {
  return (
    <section className="mx-auto mt-3 w-full max-w-6xl px-4">
      <div className="glass-panel rounded-xl border p-3 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold">
            {previewMode ? "Creator preview mode" : "Creator live mode"}
          </p>
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${
              previewMode
                ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
            }`}
          >
            {previewMode ? "No auth required" : "Authenticated"}
          </span>
        </div>
        <div className="grid gap-2 text-xs sm:grid-cols-3">
          <div className="rounded-md border px-2 py-1.5">
            <p className="font-medium">Viewer</p>
            <p className="text-muted-foreground">Public routes, watch pages, and live directory are fully browsable.</p>
          </div>
          <div className="rounded-md border px-2 py-1.5">
            <p className="font-medium">Creator</p>
            <p className="text-muted-foreground">
              {previewMode
                ? "Studio UX is explorable, while publish/mutation actions stay guarded."
                : "Upload, live, profile, and broker controls are active."}
            </p>
          </div>
          <div className="rounded-md border px-2 py-1.5">
            <p className="font-medium">Ops</p>
            <p className="text-muted-foreground">
              Use <Link href="/setup" className="text-primary hover:underline underline-offset-4">/setup</Link> for integration diagnostics and experiment controls.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

import { PageHeader } from "@/components/shared/page-header";

export const metadata = {
  title: "Community principles",
  description: "Build reputation, not followers.",
};

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <PageHeader
        title="Community principles"
        description="This platform is designed for identity, trust, contribution, and belonging."
      />
      <div className="glass-panel rounded-xl border px-4 py-3 text-xs text-muted-foreground">
        Reputation is earned through consistent, meaningful contributions to communities.
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="glass-panel rounded-xl border p-5 space-y-2">
          <h2 className="text-lg font-semibold">Identity and trust</h2>
          <p className="text-muted-foreground text-sm">
            Build a profile that reflects your work, consistency, and community behavior.
          </p>
        </article>
        <article className="glass-panel rounded-xl border p-5 space-y-3">
          <h2 className="text-lg font-semibold">Contribution and belonging</h2>
          <p className="text-muted-foreground text-sm">
            Communities grow when members share useful content, participate in discussions, and help others.
          </p>
        </article>
      </section>
    </main>
  );
}

import { WaitlistForm } from "@/components/pricing/waitlist-form";
import { PageHeader } from "@/components/shared/page-header";

export const metadata = {
  title: "Pricing",
  description: "Free and Premium plans. Premium is waitlist-only in V1.",
};

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <PageHeader
        title="Pricing"
        description="V1 ships with free public watch and creator studio. Premium is waitlist-only for now."
      />
      <div className="glass-panel rounded-xl border px-4 py-3 text-xs text-muted-foreground">
        Built for market creators and serious viewers. Premium remains gated until V1 stabilization.
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="glass-panel rounded-xl border p-5 space-y-2">
          <h2 className="text-lg font-semibold">Free</h2>
          <p className="text-muted-foreground text-sm">
            Public watch, creator uploads, live rooms, and ticker pages.
          </p>
        </article>
        <article className="glass-panel rounded-xl border p-5 space-y-3">
          <h2 className="text-lg font-semibold">Premium (coming soon)</h2>
          <p className="text-muted-foreground text-sm">
            Join the waitlist to get notified when Premium opens.
          </p>
          <WaitlistForm />
          <button
            type="button"
            disabled
            className="bg-secondary text-secondary-foreground inline-flex h-9 items-center rounded-md px-4 text-sm font-medium opacity-50"
          >
            Stripe checkout (disabled in V1)
          </button>
        </article>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Varg Packs privacy notice.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 space-y-6">
      <PageHeader
        title="Privacy"
        description="We collect only what is needed to run Varg Packs and improve product quality."
      />
      <section className="glass-panel rounded-xl border p-5 text-sm text-muted-foreground space-y-3">
        <p>
          Varg Packs stores creator account data, published content metadata, and
          operational analytics required for service reliability.
        </p>
        <p>
          Viewer traffic is measured anonymously. We do not provide trade
          execution and do not sell user data.
        </p>
      </section>
    </main>
  );
}

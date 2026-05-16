import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Terms",
  description: "Varg Packs terms of service.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 space-y-6">
      <PageHeader
        title="Terms"
        description="Platform terms for creators and viewers."
      />
      <section className="glass-panel rounded-xl border p-5 text-sm text-muted-foreground space-y-3">
        <p>
          Varg Packs is a media platform for market commentary. It is not a
          brokerage and does not execute trades.
        </p>
        <p>
          Creators are responsible for published content and must comply with
          applicable law and broker policies.
        </p>
      </section>
    </main>
  );
}

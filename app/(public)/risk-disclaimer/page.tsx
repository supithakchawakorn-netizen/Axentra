import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Risk Disclaimer",
  description: "Varg Packs investment risk disclaimer.",
};

export default function RiskDisclaimerPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 space-y-6">
      <PageHeader
        title="Risk Disclaimer"
        description="All market content carries risk and is for education and commentary."
      />
      <section className="glass-panel rounded-xl border p-5 text-sm text-muted-foreground space-y-3">
        <p>
          Market prices are volatile. Past performance does not guarantee future
          results.
        </p>
        <p>
          Varg Packs content is not investment advice. Always perform independent
          research or consult a licensed advisor.
        </p>
      </section>
    </main>
  );
}

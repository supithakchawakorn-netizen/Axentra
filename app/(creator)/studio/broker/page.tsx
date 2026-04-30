import { createClient } from "@/lib/supabase/server";
import { BrokerSettingsForm } from "@/components/creator/broker-settings-form";
import { PageHeader } from "@/components/shared/page-header";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Broker",
};

export default async function BrokerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const previewMode = !user;

  const [connectionRes, visibilityRes] = user
    ? await Promise.all([
        supabase
          .from("broker_connections")
          .select("id, status")
          .eq("user_id", user.id)
          .eq("provider", "snaptrade")
          .maybeSingle(),
        supabase
          .from("broker_visibility")
          .select("show_positions, show_balances, show_activity, show_broker_name")
          .eq("user_id", user.id)
          .maybeSingle(),
      ])
    : [{ data: null }, { data: null }];

  const connection = (connectionRes.data as { id: string; status: string } | null) ?? null;
  const visibility =
    (visibilityRes.data as {
      show_positions: boolean;
      show_balances: boolean;
      show_activity: boolean;
      show_broker_name: boolean;
    } | null) ?? null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Broker"
        description={
          previewMode
            ? "Preview broker visibility controls. Sign in to connect SnapTrade read-only."
            : "Connect a brokerage read-only to verify your profile and choose what to show publicly."
        }
      />
      {previewMode ? (
        <section className="glass-panel rounded-xl border p-4 space-y-3">
          <p className="text-xs text-amber-200 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1">
            Guest preview mode: connection actions are disabled.
          </p>
          <ul className="text-sm space-y-2">
            <li className="rounded-md border px-3 py-2">Show positions: On</li>
            <li className="rounded-md border px-3 py-2">Show balances: On</li>
            <li className="rounded-md border px-3 py-2">Show activity: Off</li>
            <li className="rounded-md border px-3 py-2">Show broker name: On</li>
          </ul>
        </section>
      ) : (
        <BrokerSettingsForm
          connectionId={connection?.id ?? null}
          status={connection?.status ?? null}
          initialVisibility={{
            showPositions: visibility?.show_positions ?? false,
            showBalances: visibility?.show_balances ?? false,
            showActivity: visibility?.show_activity ?? false,
            showBrokerName: visibility?.show_broker_name ?? false,
          }}
        />
      )}
    </div>
  );
}

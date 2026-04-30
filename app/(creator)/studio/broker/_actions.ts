"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  BrokerVisibilityInputZ,
  DisconnectBrokerInputZ,
  RefreshBrokerInputZ,
  type BrokerVisibilityInput,
  type DisconnectBrokerInput,
  type RefreshBrokerInput,
} from "@/types/broker";

function snapTradeConfigured() {
  return Boolean(process.env.SNAPTRADE_CLIENT_ID && process.env.SNAPTRADE_CONSUMER_KEY);
}

async function revalidateOwnerPublicPaths() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { data: profile } = await supabase
    .from("profiles")
    .select("handle")
    .eq("id", user.id)
    .maybeSingle();
  const handle = (profile as { handle: string } | null)?.handle;
  if (handle) {
    revalidatePath(`/@${handle}`);
  }
}

export async function connectBrokerage(): Promise<
  { ok: true; connectUrl?: string } | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: conn, error } = await supabase
    .from("broker_connections")
    .upsert(
      {
        user_id: user.id,
        provider: "snaptrade",
        status: snapTradeConfigured() ? "pending" : "error",
      },
      { onConflict: "user_id,provider" },
    )
    .select("id")
    .single();
  if (error || !conn) return { ok: false, error: error?.message ?? "Could not create connection." };

  await supabase
    .from("broker_visibility")
    .upsert({ user_id: user.id }, { onConflict: "user_id" });

  revalidatePath("/studio/broker");
  await revalidateOwnerPublicPaths();

  if (!snapTradeConfigured()) {
    return {
      ok: false,
      error: "SnapTrade is not configured yet. Add SNAPTRADE_* env vars first.",
    };
  }

  return { ok: true, connectUrl: "/studio/broker" };
}

export async function refreshBrokerage(
  input: RefreshBrokerInput,
): Promise<{ ok: boolean; error?: string }> {
  const parsed = RefreshBrokerInputZ.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase
    .from("broker_connections")
    .update({ last_sync_at: new Date().toISOString() })
    .eq("id", parsed.data.connectionId)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/studio/broker");
  await revalidateOwnerPublicPaths();
  return { ok: true };
}

export async function setBrokerVisibility(
  input: BrokerVisibilityInput,
): Promise<{ ok: boolean; error?: string }> {
  const parsed = BrokerVisibilityInputZ.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase.from("broker_visibility").upsert(
    {
      user_id: user.id,
      show_positions: parsed.data.showPositions,
      show_balances: parsed.data.showBalances,
      show_activity: parsed.data.showActivity,
      show_broker_name: parsed.data.showBrokerName,
    },
    { onConflict: "user_id" },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/studio/broker");
  await revalidateOwnerPublicPaths();
  return { ok: true };
}

export async function disconnectBrokerage(
  input: DisconnectBrokerInput,
): Promise<{ ok: boolean; error?: string }> {
  const parsed = DisconnectBrokerInputZ.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: conn, error: connErr } = await supabase
    .from("broker_connections")
    .select("id")
    .eq("id", parsed.data.connectionId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (connErr || !conn) return { ok: false, error: "Connection not found." };
  const connectionId = (conn as { id: string }).id;

  await supabase.from("broker_connections").update({ status: "disconnected" }).eq("id", connectionId);
  await supabase.from("broker_accounts").delete().eq("connection_id", connectionId);

  revalidatePath("/studio/broker");
  await revalidateOwnerPublicPaths();
  return { ok: true };
}

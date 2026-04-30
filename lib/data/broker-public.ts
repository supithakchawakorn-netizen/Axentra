import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";

export interface PublicBrokerAccount {
  id: string;
  user_id: string;
  account_name: string;
  broker_name: string | null;
  currency: string | null;
  cached_balance: number | null;
}

export interface PublicBrokerPosition {
  id: string;
  user_id: string;
  symbol: string;
  quantity: number;
  market_value: number | null;
}

export interface PublicBrokerActivity {
  id: string;
  user_id: string;
  type: string;
  symbol: string | null;
  quantity: number | null;
  price: number | null;
  occurred_at: string;
}

export async function getPublicBrokerSnapshot(userId: string): Promise<{
  accounts: PublicBrokerAccount[];
  positions: PublicBrokerPosition[];
  activities: PublicBrokerActivity[];
}> {
  if (!supabaseConfigured()) return { accounts: [], positions: [], activities: [] };
  const supabase = await createClient();
  const [accountsRes, positionsRes, activitiesRes] = await Promise.all([
    supabase
      .from("public_broker_accounts")
      .select("id, user_id, account_name, broker_name, currency, cached_balance")
      .eq("user_id", userId)
      .limit(20),
    supabase
      .from("public_broker_positions")
      .select("id, user_id, symbol, quantity, market_value")
      .eq("user_id", userId)
      .limit(50),
    supabase
      .from("public_broker_activities")
      .select("id, user_id, type, symbol, quantity, price, occurred_at")
      .eq("user_id", userId)
      .order("occurred_at", { ascending: false })
      .limit(30),
  ]);

  return {
    accounts: (accountsRes.data as PublicBrokerAccount[] | null) ?? [],
    positions: (positionsRes.data as PublicBrokerPosition[] | null) ?? [],
    activities: (activitiesRes.data as PublicBrokerActivity[] | null) ?? [],
  };
}

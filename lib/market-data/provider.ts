import { demoMarketDataProvider } from "@/lib/market-data/demo-provider";
import { HttpPollingMarketDataProvider } from "@/lib/market-data/http-provider";
import type { MarketDataProvider } from "@/lib/market-data/types";
import { publicEnv } from "@/lib/env";

/**
 * Runtime provider selector.
 * Keep this contract stable so production market data can be plugged later
 * (Polygon/IEX/etc) without touching UI components.
 */
export function getMarketDataProvider(): MarketDataProvider {
  const env = publicEnv();
  if (env.NEXT_PUBLIC_MARKET_DATA_MODE === "provider") {
    return new HttpPollingMarketDataProvider();
  }
  return demoMarketDataProvider;
}

import { ImageResponse } from "next/og";
import { getTickerBySymbol } from "@/lib/data/tickers";
import { APP_NAME } from "@/lib/utils/site";

export const runtime = "nodejs";
export const alt = "Ticker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({
  params,
}: {
  params: { ticker: string };
}) {
  const t = await getTickerBySymbol(params.ticker);
  const symbol = t?.symbol ?? params.ticker.toUpperCase();
  const name = t?.name ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          color: "#fafafa",
          padding: 80,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.7, letterSpacing: 4 }}>
          {APP_NAME.toUpperCase()}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 144,
              fontWeight: 700,
              lineHeight: 1,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            {symbol}
          </div>
          <div style={{ fontSize: 40, opacity: 0.8 }}>{name}</div>
        </div>
        <div style={{ fontSize: 24, opacity: 0.5 }}>
          AI ticker summary · creator coverage
        </div>
      </div>
    ),
    { ...size },
  );
}

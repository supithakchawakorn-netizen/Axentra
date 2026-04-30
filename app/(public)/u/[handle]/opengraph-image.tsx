import { ImageResponse } from "next/og";
import { getProfileByHandle } from "@/lib/data/profiles";
import { APP_NAME } from "@/lib/utils/site";

export const runtime = "nodejs";
export const alt = "Creator profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({
  params,
}: {
  params: { handle: string };
}) {
  const profile = await getProfileByHandle(params.handle);
  const display = profile?.display_name ?? `@${profile?.handle ?? params.handle}`;
  const handle = profile?.handle ?? params.handle;

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
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 72, fontWeight: 600 }}>{display}</div>
          <div style={{ fontSize: 36, opacity: 0.7 }}>@{handle}</div>
        </div>
        <div style={{ fontSize: 24, opacity: 0.5 }}>
          Market commentary, on demand and live.
        </div>
      </div>
    ),
    { ...size },
  );
}

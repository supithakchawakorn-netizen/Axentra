import { ImageResponse } from "next/og";
import { getPublicVideo } from "@/lib/data/videos";
import { APP_NAME } from "@/lib/utils/site";

export const runtime = "nodejs";
export const alt = "Video";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({
  params,
}: {
  params: { videoId: string };
}) {
  const video = await getPublicVideo(params.videoId);
  const title = video?.title ?? "Video";
  const creator =
    video?.creator?.display_name ?? video?.creator?.handle ?? "";

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
        <div style={{ fontSize: 64, fontWeight: 600, lineHeight: 1.1 }}>
          {title}
        </div>
        <div style={{ fontSize: 32, opacity: 0.7 }}>{creator}</div>
      </div>
    ),
    { ...size },
  );
}

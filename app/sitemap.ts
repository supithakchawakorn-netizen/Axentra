import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/utils/site";
import { listLiveRooms } from "@/lib/data/live-rooms";
import { listTopTickers } from "@/lib/data/tickers";
import { listRecentPublishedVideos } from "@/lib/data/videos";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();
  const [videos, rooms, tickers] = await Promise.all([
    listRecentPublishedVideos({ limit: 100 }),
    listLiveRooms(),
    listTopTickers(100),
  ]);

  const creatorHandles = new Set<string>();
  for (const item of [...videos, ...rooms]) {
    if (item.creator?.handle) {
      creatorHandles.add(item.creator.handle);
    }
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/explore`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/live`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${base}/pricing`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  const videoRoutes: MetadataRoute.Sitemap = videos.map((video) => ({
    url: `${base}/v/${video.id}`,
    lastModified: video.published_at ? new Date(video.published_at) : now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const roomRoutes: MetadataRoute.Sitemap = rooms.map((room) => ({
    url: `${base}/room/${room.id}`,
    lastModified: room.started_at ? new Date(room.started_at) : now,
    changeFrequency: room.status === "live" ? "hourly" : "daily",
    priority: 0.75,
  }));

  const tickerRoutes: MetadataRoute.Sitemap = tickers.map((ticker) => ({
    url: `${base}/t/${ticker.symbol.toLowerCase()}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const creatorRoutes: MetadataRoute.Sitemap = Array.from(creatorHandles).map(
    (handle) => ({
      url: `${base}/u/${handle}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.65,
    }),
  );

  return [
    ...staticRoutes,
    ...videoRoutes,
    ...roomRoutes,
    ...tickerRoutes,
    ...creatorRoutes,
  ];
}

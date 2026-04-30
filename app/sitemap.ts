import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/utils/site";

/**
 * Static sitemap for M0. Dynamic entries for /v/[videoId], /u/[handle], and
 * /t/[ticker] are added in their respective milestones.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();
  return [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}

import type { PublicVideoSummary } from "@/lib/data/videos";

export type MarketCategory = "builders" | "creators" | "community";

export const HOME_MARKET_CATEGORIES: {
  key: MarketCategory;
  label: string;
  symbols: string[];
  description: string;
  examples: { title: string; category: string }[];
}[] = [
  {
    key: "builders",
    label: "Builders",
    symbols: [],
    description: "Realtime builder community pulse",
    examples: [
      { title: "How I shipped version 1 this week", category: "Builders" },
      { title: "What changed after daily shipping", category: "Builders" },
      { title: "Founder systems for consistency", category: "Builders" },
    ],
  },
  {
    key: "creators",
    label: "Creators",
    symbols: [],
    description: "Realtime creator community pulse",
    examples: [
      { title: "My audience trust framework", category: "Creators" },
      { title: "How to produce better short videos", category: "Creators" },
      { title: "Creator workflow critique session", category: "Creators" },
    ],
  },
  {
    key: "community",
    label: "Community",
    symbols: [],
    description: "Realtime community discussions",
    examples: [
      { title: "Welcome thread and house rules", category: "Community" },
      { title: "Weekly contribution highlights", category: "Community" },
      { title: "Community feedback roundtable", category: "Community" },
    ],
  },
];

const CREATOR_KEYWORDS = [
  "creator",
  "content",
  "video",
  "editing",
  "audience",
  "channel",
  "story",
  "publish",
];

const COMMUNITY_KEYWORDS = [
  "community",
  "discussion",
  "moderation",
  "tribe",
  "belong",
  "culture",
  "trust",
  "identity",
];

function hasKeyword(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function classifyVideo(video: PublicVideoSummary): MarketCategory {
  const text = `${video.title} ${video.description}`.toLowerCase();
  if (hasKeyword(text, COMMUNITY_KEYWORDS)) return "community";
  if (hasKeyword(text, CREATOR_KEYWORDS)) return "creators";
  return "builders";
}

export function filterVideosByCategory(
  videos: PublicVideoSummary[],
  category: MarketCategory,
) {
  return videos.filter((video) => classifyVideo(video) === category);
}

export function normalizeMarketCategory(input?: string): MarketCategory {
  if (input === "builders" || input === "creators" || input === "community") return input;
  return "builders";
}

export function getHomeMarketCategory(category: MarketCategory) {
  return (
    HOME_MARKET_CATEGORIES.find((item) => item.key === category)
    ?? HOME_MARKET_CATEGORIES[0]!
  );
}


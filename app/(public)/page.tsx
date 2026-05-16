import { listRecentPublishedVideos } from "@/lib/data/videos";
import { APP_NAME } from "@/lib/utils/site";
import { PageViewEvent } from "@/components/analytics/page-view-event";
import { Events } from "@/lib/posthog/events";
import { defaultFeedRanker } from "@/lib/feed/ranker";
import { HomeDesktop } from "@/components/pages/home/home-desktop";
import { HomeMobile } from "@/components/pages/home/home-mobile";
import { MobileDesktopSwitch } from "@/components/layout/mobile-desktop-switch";
import { normalizeMarketCategory } from "@/components/pages/home/market-categories";

export const revalidate = 60;

export const metadata = {
  title: `${APP_NAME} — Build reputation through community.`,
  description:
    "Community-first video and live platform focused on identity, trust, contribution, and belonging.",
};

export default async function HomePage(props: {
  searchParams?: Promise<{ market?: string }> | { market?: string };
}) {
  const searchParams = await Promise.resolve(props.searchParams ?? {});
  const selectedCategory = normalizeMarketCategory(searchParams.market);
  const videos = await listRecentPublishedVideos({ limit: 12 });
  const rankedVideos = defaultFeedRanker.rankVideos(videos);

  return (
    <>
      <PageViewEvent event={Events.HomeView} />
      <MobileDesktopSwitch
        mobile={<HomeMobile videos={rankedVideos} initialCategory={selectedCategory} />}
        desktop={<HomeDesktop videos={rankedVideos} initialCategory={selectedCategory} />}
      />
    </>
  );
}

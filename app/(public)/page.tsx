import { listRecentPublishedVideos } from "@/lib/data/videos";
import { listLiveRooms } from "@/lib/data/live-rooms";
import { listTopTickers } from "@/lib/data/tickers";
import { APP_NAME } from "@/lib/utils/site";
import { PageViewEvent } from "@/components/analytics/page-view-event";
import { Events } from "@/lib/posthog/events";
import { defaultFeedRanker } from "@/lib/feed/ranker";
import { HomeDesktop } from "@/components/pages/home/home-desktop";
import { HomeMobile } from "@/components/pages/home/home-mobile";
import { MobileDesktopSwitch } from "@/components/layout/mobile-desktop-switch";

export const revalidate = 60;

export const metadata = {
  title: `${APP_NAME} — Watch the market, live and on demand.`,
  description:
    "Video and live platform for retail market commentary. Creators link their brokerage read-only so viewers can verify positions and performance.",
};

export default async function HomePage() {
  const [videos, live, topTickers] = await Promise.all([
    listRecentPublishedVideos({ limit: 12 }),
    listLiveRooms(),
    listTopTickers(12),
  ]);
  const rankedVideos = defaultFeedRanker.rankVideos(videos);
  const rankedLive = defaultFeedRanker.rankLiveRooms(live);

  return (
    <>
      <PageViewEvent event={Events.HomeView} />
      <MobileDesktopSwitch
        mobile={<HomeMobile videos={rankedVideos} live={rankedLive} topTickers={topTickers} />}
        desktop={<HomeDesktop videos={rankedVideos} live={rankedLive} topTickers={topTickers} />}
      />
    </>
  );
}

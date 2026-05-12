import { listRecentPublishedVideos } from "@/lib/data/videos";
import { listLiveRooms } from "@/lib/data/live-rooms";
import { PageViewEvent } from "@/components/analytics/page-view-event";
import { Events } from "@/lib/posthog/events";
import { ExperimentQualitySignal } from "@/components/experiments/experiment-quality-signal";
import { defaultFeedRanker } from "@/lib/feed/ranker";
import { ExploreMobile } from "@/components/pages/explore/explore-mobile";
import { ExploreDesktop } from "@/components/pages/explore/explore-desktop";
import { MobileDesktopSwitch } from "@/components/layout/mobile-desktop-switch";

export const revalidate = 60;

export const metadata = {
  title: "Explore",
  description: "Recent videos and live rooms across creators on Varg Packs.",
};

interface ExploreSearchParams {
  q?: string;
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<ExploreSearchParams>;
}) {
  const sp = await searchParams;
  const query = sp.q?.trim() ?? "";
  const normalizedQuery = query.toLowerCase();
  const [allCandidateVideos, live] = await Promise.all([
    listRecentPublishedVideos({ limit: 24 }),
    listLiveRooms(),
  ]);
  const videos = normalizedQuery
    ? allCandidateVideos.filter((v) => {
        const haystack = [
          v.title,
          v.description ?? "",
          v.creator?.display_name ?? "",
          v.creator?.handle ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      })
    : allCandidateVideos;
  const filteredLive = normalizedQuery
    ? live.filter((room) => {
        const haystack = [
          room.title,
          room.description ?? "",
          room.creator?.display_name ?? "",
          room.creator?.handle ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      })
    : live;
  const rankedLive = defaultFeedRanker.rankLiveRooms(filteredLive, {
    query: query || undefined,
  });
  const rankedVideos = defaultFeedRanker.rankVideos(videos, {
    query: query || undefined,
  });
  return (
    <>
      <ExperimentQualitySignal signal="route_continuation" path="/explore" />
      <PageViewEvent
        event={Events.ExploreView}
        properties={undefined}
      />
      <MobileDesktopSwitch
        mobile={
          <ExploreMobile
            query={query}
            normalizedQuery={normalizedQuery}
            rankedLive={rankedLive}
            rankedVideos={rankedVideos}
          />
        }
        desktop={
          <ExploreDesktop
            query={query}
            normalizedQuery={normalizedQuery}
            rankedLive={rankedLive}
            rankedVideos={rankedVideos}
          />
        }
      />
    </>
  );
}

import { listRecentPublishedVideos } from "@/lib/data/videos";
import { listLiveRooms } from "@/lib/data/live-rooms";
import { defaultFeedRanker } from "@/lib/feed/ranker";
import { ExploreMobile } from "@/components/pages/explore/explore-mobile";
import { ExploreDesktop } from "@/components/pages/explore/explore-desktop";
import { MobileDesktopSwitch } from "@/components/layout/mobile-desktop-switch";

export const revalidate = 60;

export const metadata = {
  title: "Search",
  description: "Search videos, creators, and live rooms.",
};

interface SearchPageParams {
  q?: string;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchPageParams>;
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
  );
}

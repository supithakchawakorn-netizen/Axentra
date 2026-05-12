import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getProfileByHandle } from "@/lib/data/profiles";
import { listVideosByCreator } from "@/lib/data/videos";
import { listRoomsByCreator } from "@/lib/data/live-rooms";
import { VideoCard } from "@/components/video/video-card";
import { APP_NAME, siteUrl } from "@/lib/utils/site";
import { formatDate } from "@/lib/utils/format";
import { VerifiedBrokerBadge } from "@/components/creator/verified-broker-badge";
import { ReputationPanel } from "@/components/creator/reputation-panel";

export const revalidate = 60;

interface ProfilePageProps {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { handle } = await params;
  const profile = await getProfileByHandle(handle);
  if (!profile) return { title: "Profile not found" };
  const display = profile.display_name ?? `@${profile.handle}`;
  return {
    title: display,
    description: profile.bio?.slice(0, 200) || `${display} on ${APP_NAME}.`,
    alternates: { canonical: `${siteUrl()}/@${profile.handle}` },
  };
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
  const { handle } = await params;
  const { tab } = await searchParams;
  const activeTab = tab === "activity" ? "activity" : "videos";
  const profile = await getProfileByHandle(handle);
  if (!profile) notFound();

  const [videos, rooms] = await Promise.all([
    listVideosByCreator({
      creatorId: profile.id,
      includeUnpublished: false,
    }),
    listRoomsByCreator({ creatorId: profile.id }),
  ]);
  const liveNow = rooms.filter((r) => r.status === "live");
  const scheduled = rooms.filter((r) => r.status === "scheduled");
  const past = rooms
    .filter((r) => r.status === "ended" && !r.recording_video_id)
    .slice(0, 8);
  const totalStreams = liveNow.length + scheduled.length + past.length;
  const insightQuality = Math.min(100, 35 + videos.length * 5);
  const consistency = Math.min(100, 25 + (videos.length + totalStreams) * 4);
  const transparency = profile.bio ? 86 : 62;
  const communityTrust = Math.min(100, 45 + videos.length * 2 + liveNow.length * 4);

  return (
    <main className="yt-page-shell mx-auto max-w-6xl px-2 py-8">
      <header className="overflow-hidden rounded-2xl border">
        <div className="relative h-28 bg-gradient-to-r from-primary/40 via-accent/30 to-muted/40 sm:h-36">
          <div className="absolute inset-0 market-grid-bg opacity-40" />
        </div>
        <div className="bg-background px-4 pb-5 sm:px-6">
          <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end sm:gap-6">
            <div className="bg-muted relative size-20 shrink-0 overflow-hidden rounded-full border-2 border-background sm:size-24">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.display_name ?? profile.handle}
                  fill
                  sizes="96px"
                  className="object-cover"
                  unoptimized
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {profile.display_name ?? `@${profile.handle}`}
                </h1>
                <VerifiedBrokerBadge />
              </div>
              <p className="text-muted-foreground text-sm">@{profile.handle}</p>
              <p className="text-muted-foreground text-sm">
                {videos.length} videos · {totalStreams} streams
              </p>
            </div>
          </div>
          {profile.bio ? (
            <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm">
              {profile.bio}
            </p>
          ) : null}
        </div>
      </header>

      {liveNow.length > 0 || scheduled.length > 0 || past.length > 0 ? (
        <section className="glass-panel mt-10 rounded-xl border p-4 space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Live</h2>
          {liveNow.length > 0 ? (
            <ul className="space-y-2">
              {liveNow.map((r) => (
                <li
                  key={r.id}
                  className="hover:bg-muted/50 flex items-center justify-between gap-3 rounded-md border p-3"
                >
                  <div>
                    <span className="bg-destructive mr-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      Live
                    </span>
                    <Link
                      href={`/room/${r.id}`}
                      className="text-sm font-medium hover:underline underline-offset-4"
                    >
                      {r.title}
                    </Link>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {r.viewer_count} watching
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          {scheduled.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-muted-foreground text-xs uppercase tracking-wider">
                Scheduled
              </h3>
              <ul className="space-y-1 text-sm">
                {scheduled.map((r) => (
                  <li key={r.id} className="flex items-baseline justify-between gap-3">
                    <span>{r.title}</span>
                    {r.scheduled_at ? (
                      <span className="text-muted-foreground text-xs">
                        {formatDate(r.scheduled_at)}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {past.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-muted-foreground text-xs uppercase tracking-wider">
                Past streams
              </h3>
              <ul className="space-y-1 text-sm">
                {past.map((r) => (
                  <li key={r.id} className="flex items-baseline justify-between gap-3">
                    <span>{r.title}</span>
                    {r.ended_at ? (
                      <span className="text-muted-foreground text-xs">
                        {formatDate(r.ended_at)}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      <ReputationPanel
        creatorId={profile.id}
        insightQuality={insightQuality}
        consistency={consistency}
        transparency={transparency}
        communityTrust={communityTrust}
      />

      <section className="mt-10 space-y-4">
        <div className="flex items-center gap-2 border-b pb-2">
          <Link
            href={`/@${profile.handle}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${activeTab === "videos" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Videos
          </Link>
          <Link
            href={`/@${profile.handle}?tab=activity`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${activeTab === "activity" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Activity
          </Link>
        </div>
        {activeTab === "videos" ? (
          videos.length === 0 ? (
            <p className="text-muted-foreground text-sm">No videos published yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          )
        ) : (
          <div className="space-y-5">
            <div>
              <h2 className="text-sm font-semibold">Contribution highlights</h2>
              {videos.length === 0 ? (
                <p className="text-muted-foreground mt-1 text-sm">No published contribution highlights yet.</p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm">
                  {videos.slice(0, 5).map((v) => (
                    <li key={v.id} className="flex items-center justify-between gap-3">
                      <span className="truncate">{v.title}</span>
                      <span className="text-muted-foreground text-xs">
                        {v.published_at ? formatDate(v.published_at) : "Recently"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold">Live session history</h2>
              {rooms.length === 0 ? (
                <p className="text-muted-foreground mt-1 text-sm">No public live sessions yet.</p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm">
                  {rooms.slice(0, 10).map((room) => (
                    <li key={room.id} className="flex items-center justify-between gap-3">
                      <span>{room.title}</span>
                      <span className="text-muted-foreground text-xs">{room.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { getCurrentProfile } from "@/lib/data/profiles";
import { listOwnVideos } from "@/lib/data/creator-videos";
import { listRoomsByCreator } from "@/lib/data/live-rooms";
import { DEMO_STUDIO_PROFILE, listDemoStudioRooms, listDemoStudioVideos } from "@/lib/data/demo-studio";
import { formatDate, formatDuration } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Studio analytics",
};

export default async function StudioAnalyticsPage() {
  const profile = await getCurrentProfile();
  const previewMode = !profile;
  const videos = profile ? await listOwnVideos() : listDemoStudioVideos();
  const rooms = profile ? await listRoomsByCreator({ creatorId: profile.id }) : listDemoStudioRooms();
  const activeProfile = profile ?? DEMO_STUDIO_PROFILE;

  const publishedVideos = videos.filter((video) => Boolean(video.published_at));
  const latestCreatedAt = videos.reduce((acc, video) => {
    const ts = new Date(video.created_at).getTime();
    return ts > acc ? ts : acc;
  }, 0);
  const latestPublishedAt = publishedVideos.reduce((acc, video) => {
    const ts = video.published_at ? new Date(video.published_at).getTime() : 0;
    return ts > acc ? ts : acc;
  }, 0);
  const avgDuration =
    publishedVideos.length > 0
      ? Math.round(
          publishedVideos.reduce((acc, video) => acc + (video.duration_seconds ?? 0), 0) /
            publishedVideos.length,
        )
      : 0;
  const liveRooms = rooms.filter((room) => room.status === "live");
  const endedRooms = rooms.filter((room) => room.status === "ended");
  const peakViewers = rooms.reduce((acc, room) => Math.max(acc, room.viewer_count), 0);
  const totalLiveViewers = rooms.reduce((acc, room) => acc + room.viewer_count, 0);
  const publishingVelocity = videos.filter((video) => {
    const created = new Date(video.created_at).getTime();
    return latestCreatedAt - created <= 1000 * 60 * 60 * 24 * 7;
  }).length;

  const topVideos = [...publishedVideos]
    .sort((a, b) => {
      const aScore = scoreVideoForAnalytics(a, latestPublishedAt);
      const bScore = scoreVideoForAnalytics(b, latestPublishedAt);
      return bScore - aScore;
    })
    .slice(0, 5);

  const slotCounts = getPublishingSlots(videos.map((video) => video.created_at));
  const strongestSlot = [...slotCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${activeProfile.display_name ?? activeProfile.handle} analytics`}
        description={
          previewMode
            ? "Creator analytics preview with production-ready report layout."
            : "Performance report for your content, audience behavior, and growth actions."
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Published videos" value={String(publishedVideos.length)} hint={`${videos.length} total assets`} />
        <MetricCard
          label="Avg video duration"
          value={avgDuration > 0 ? formatDuration(avgDuration) : "—"}
          hint="Based on published content"
        />
        <MetricCard label="Peak live viewers" value={String(peakViewers)} hint={`${liveRooms.length} live now`} />
        <MetricCard label="7-day publishing velocity" value={String(publishingVelocity)} hint="Assets created in the last week" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="glass-panel lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Top content report</CardTitle>
            <CardDescription>
              Ranked by recency, duration quality, and live replay readiness.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topVideos.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Publish your first videos to unlock content ranking diagnostics.
              </p>
            ) : (
              <ul className="space-y-2">
                {topVideos.map((video) => (
                  <li key={video.id} className="rounded-md border bg-muted/25 px-3 py-2 text-sm">
                    <p className="font-medium">{video.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Published {video.published_at ? formatDate(video.published_at) : "recently"} ·{" "}
                      {video.duration_seconds ? formatDuration(video.duration_seconds) : "unknown length"} · score{" "}
                      {scoreVideoForAnalytics(video, latestPublishedAt).toFixed(1)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-base">Audience behavior</CardTitle>
            <CardDescription>Distribution by your publishing time windows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              Strongest slot: <span className="text-foreground font-medium">{strongestSlot}</span>
            </p>
            <ul className="space-y-1 text-xs">
              {Array.from(slotCounts.entries()).map(([slot, count]) => (
                <li key={slot} className="flex items-center justify-between rounded border px-2 py-1">
                  <span>{slot}</span>
                  <span className="text-muted-foreground">{count} uploads</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-base">Live performance report</CardTitle>
            <CardDescription>Snapshot of room activity and replay pipeline.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">Total viewer touches: <span className="text-foreground">{totalLiveViewers}</span></p>
            <p className="text-muted-foreground">Ended sessions: <span className="text-foreground">{endedRooms.length}</span></p>
            <p className="text-muted-foreground">
              Recording handoff readiness:{" "}
              <span className="text-foreground">
                {endedRooms.some((room) => room.recording_video_id) ? "Healthy" : "Needs more ended sessions"}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-base">Action recommendations</CardTitle>
            <CardDescription>Auto-generated next steps based on your current report.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="rounded-md border bg-muted/25 px-3 py-2">
                Publish at least <strong>2 videos/week</strong> to keep discovery momentum.
              </li>
              <li className="rounded-md border bg-muted/25 px-3 py-2">
                Start live sessions near <strong>{strongestSlot}</strong> to reinforce audience expectation loops.
              </li>
              <li className="rounded-md border bg-muted/25 px-3 py-2">
                Keep average runtime near <strong>8-14 minutes</strong> for higher completion likelihood.
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function scoreVideoForAnalytics(
  video: { published_at: string | null; duration_seconds: number | null },
  latestPublishedAt: number,
) {
  const recencyHours = video.published_at
    ? Math.max(
        0,
        (latestPublishedAt - new Date(video.published_at).getTime()) / 3_600_000,
      )
    : 72;
  const recency = Math.max(0, 100 - recencyHours * 1.5);
  const duration = video.duration_seconds ?? 0;
  const durationQuality = duration >= 360 && duration <= 1200 ? 25 : 10;
  return recency + durationQuality;
}

function getPublishingSlots(timestamps: string[]) {
  const slots = new Map<string, number>([
    ["Pre-market", 0],
    ["Market hours", 0],
    ["Post-close", 0],
    ["Late session", 0],
  ]);
  for (const ts of timestamps) {
    const hour = new Date(ts).getHours();
    const slot =
      hour >= 5 && hour < 9
        ? "Pre-market"
        : hour >= 9 && hour < 16
          ? "Market hours"
          : hour >= 16 && hour < 20
            ? "Post-close"
            : "Late session";
    slots.set(slot, (slots.get(slot) ?? 0) + 1);
  }
  return slots;
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle>{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

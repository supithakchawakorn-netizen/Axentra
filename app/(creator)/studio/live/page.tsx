import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/profiles";
import { listRoomsByCreator } from "@/lib/data/live-rooms";
import { listDemoStudioRooms } from "@/lib/data/demo-studio";
import { CreateLiveForm } from "@/components/creator/create-live-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/format";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusPill } from "@/components/shared/status-pill";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Go live",
};

export default async function StudioLivePage() {
  const livekitWebhookConfigured = Boolean(process.env.LIVEKIT_WEBHOOK_SECRET);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const previewMode = !user;
  const profile = await getCurrentProfile();
  const rooms = profile
    ? await listRoomsByCreator({ creatorId: profile.id })
    : listDemoStudioRooms();
  const live = rooms.filter((r) => r.status === "live");
  const past = rooms.filter((r) => r.status === "ended").slice(0, 8);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_3fr]">
      <section className="space-y-4">
        <PageHeader
          title="Go live"
          description="Open a LiveKit room. Anonymous viewers join from /live. When you end a room, the recording lands as a video on your profile."
          actions={
            <Link
              href="/live"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Open /live
            </Link>
          }
        />
        {!livekitWebhookConfigured ? (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            LiveKit webhook secret is not set yet. Going live can work, but
            webhook-driven room/recording sync will be limited until configured.
          </div>
        ) : null}
        {previewMode ? (
          <Card className="glass-panel border-amber-500/30 bg-amber-500/10">
            <CardHeader>
              <CardTitle className="text-base text-amber-100">Live control preview</CardTitle>
              <CardDescription className="text-amber-200/90">
                Guest mode enabled. You can run live flow actions in preview mode.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-amber-100/90">
              Actions run with simulated backend responses unless you sign in.
            </CardContent>
          </Card>
        ) : null}
        <CreateLiveForm />
      </section>

      <section className="space-y-6">
        <div className="space-y-3">
          <SectionHeader title="Live now" />
          {live.length === 0 ? (
            <EmptyState
              title="You are not live."
              description="Start a room from the left panel to begin broadcasting."
            />
          ) : (
            <ul className="space-y-2">
              {live.map((r) => (
                <li key={r.id}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">{r.title}</CardTitle>
                      <CardDescription>
                        <span className="inline-flex items-center gap-2">
                          <StatusPill label="Live" tone="live" className="uppercase tracking-wider" />
                          <span>{r.viewer_count} viewer{r.viewer_count === 1 ? "" : "s"}</span>
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link
                        href={`/room/${r.id}`}
                        className="text-primary text-sm hover:underline underline-offset-4"
                      >
                        Open room →
                      </Link>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-3">
          <SectionHeader title="Recent rooms" />
          {past.length === 0 ? (
            <EmptyState
              title="No past rooms yet."
              description="Ended streams will appear here with recording links once processed."
            />
          ) : (
            <ul className="space-y-2 rounded-lg border p-3 text-sm">
              {past.map((r) => (
                <li
                  key={r.id}
                  className="hover:bg-muted/50 flex items-baseline justify-between gap-3 rounded-md px-2 py-1.5"
                >
                  <Link
                    href={
                      r.recording_video_id
                        ? `/v/${r.recording_video_id}`
                        : `/room/${r.id}`
                    }
                    className="hover:underline underline-offset-4"
                  >
                    {r.title}
                  </Link>
                  <span className="text-muted-foreground text-xs">
                    {r.ended_at ? formatDate(r.ended_at) : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

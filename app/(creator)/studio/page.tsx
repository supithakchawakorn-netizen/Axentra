import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/data/profiles";
import { listVideosByCreator } from "@/lib/data/videos";
import { PageHeader } from "@/components/shared/page-header";
import { listDemoStudioVideos, DEMO_STUDIO_PROFILE } from "@/lib/data/demo-studio";
import { StudioMobileQuickActions } from "@/components/pages/studio/studio-mobile-quick-actions";
import { StatusPill } from "@/components/shared/status-pill";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Studio overview",
};

export default async function StudioOverviewPage() {
  const profile = await getCurrentProfile();
  const previewMode = !profile;
  const videos = profile
    ? await listVideosByCreator({
        creatorId: profile.id,
        includeUnpublished: true,
      })
    : listDemoStudioVideos();
  const activeProfile = profile ?? DEMO_STUDIO_PROFILE;

  const ready = videos.filter((v) => v.published_at).length;
  const draft = videos.length - ready;
  const recentVideos = videos.slice(0, 5);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome, ${activeProfile.display_name ?? activeProfile.handle}.`}
        description={
          previewMode
            ? "Creator preview mode: polished studio UX without auth friction."
            : "Quick actions and a snapshot of your library."
        }
      />
      {previewMode ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          Preview mode is active. You can explore all creator surfaces now and sign in later to publish live data.
        </div>
      ) : null}
      <StudioMobileQuickActions />

      <section className="rounded-xl border p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">Creator hub quick actions</h2>
            <p className="text-muted-foreground text-sm">
              Upload new videos, edit your existing library, and open analytics from one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href="/studio/upload">Upload video</Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link href="/studio/videos">Manage videos</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/studio/analytics">Analytics</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>{videos.length}</CardTitle>
            <CardDescription>Total videos</CardDescription>
          </CardHeader>
        </Card>
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>{ready}</CardTitle>
            <CardDescription>Published</CardDescription>
          </CardHeader>
        </Card>
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>{draft}</CardTitle>
            <CardDescription>Processing or unlisted</CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="glass-panel premium-surface">
          <CardHeader>
            <CardTitle className="text-base">Viewer polish</CardTitle>
            <CardDescription>Validate public feed, watch pages, and live discovery flow.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/" className="text-primary text-sm hover:underline underline-offset-4">
              Open viewer experience →
            </Link>
          </CardContent>
        </Card>
        <Card className="glass-panel premium-surface">
          <CardHeader>
            <CardTitle className="text-base">Creator workflow</CardTitle>
            <CardDescription>Run upload, live, settings, and analytics with no auth blockers in preview.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <Link href="/studio/upload" className="block text-primary text-sm hover:underline underline-offset-4">
                Test creator flow →
              </Link>
              <Link href="/studio/analytics" className="block text-primary text-sm hover:underline underline-offset-4">
                Open analytics report →
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel premium-surface">
          <CardHeader>
            <CardTitle className="text-base">Admin operations</CardTitle>
            <CardDescription>Check integrations, UX experiments, and ops diagnostics.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/setup" className="text-primary text-sm hover:underline underline-offset-4">
              Open ops cockpit →
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Upload a video</CardTitle>
            <CardDescription>
              Mux processes and serves the playback. Visible publicly when
              status flips to &quot;ready&quot;.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/studio/upload"
              className="text-primary text-sm hover:underline underline-offset-4"
            >
              Go to upload →
            </Link>
            <Link
              href="/studio/videos"
              className="text-primary mt-2 block text-sm hover:underline underline-offset-4"
            >
              Manage existing videos →
            </Link>
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Your public profile</CardTitle>
            <CardDescription>
              {profile
                ? `Public profile at /@${profile.handle}`
                : "Set up your profile in settings."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile ? (
              <Link
                href={`/@${profile.handle}`}
                className="text-primary text-sm hover:underline underline-offset-4"
              >
                View public profile →
              </Link>
            ) : (
              <Link
                href="/studio/settings"
                className="text-primary text-sm hover:underline underline-offset-4"
              >
                Edit settings →
              </Link>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Recent videos to manage</CardTitle>
            <CardDescription>
              Open any video directly for editing metadata, visibility, or deletion.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentVideos.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No uploads yet. Start by publishing your first video.
              </p>
            ) : (
              <ul className="space-y-2">
                {recentVideos.map((video) => (
                  <li
                    key={video.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{video.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {video.published_at
                          ? `Published ${new Date(video.published_at).toLocaleDateString()}`
                          : "Not published yet"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusPill
                        label={video.published_at ? "ready" : "processing"}
                        tone={video.published_at ? "success" : "warning"}
                      />
                      <Button asChild size="sm" variant="secondary" className="h-7 px-2 text-xs">
                        <Link href={`/studio/videos/${video.id}`}>Edit</Link>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Creator management</CardTitle>
            <CardDescription>
              One-click access to upload, edit library, and analytics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild size="sm" className="w-full justify-start">
              <Link href="/studio/upload">Upload new video</Link>
            </Button>
            <Button asChild size="sm" variant="secondary" className="w-full justify-start">
              <Link href="/studio/videos">Edit existing videos</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="w-full justify-start">
              <Link href="/studio/analytics">Open analytics</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

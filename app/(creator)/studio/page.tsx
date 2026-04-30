import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/data/profiles";
import { listVideosByCreator } from "@/lib/data/videos";
import { PageHeader } from "@/components/shared/page-header";
import { listDemoStudioVideos, DEMO_STUDIO_PROFILE } from "@/lib/data/demo-studio";

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
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Your public profile</CardTitle>
            <CardDescription>
              {profile
                ? `axentra at /@${profile.handle}`
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
    </div>
  );
}

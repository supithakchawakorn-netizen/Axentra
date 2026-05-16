import { getCurrentProfile } from "@/lib/data/profiles";
import { SettingsForm } from "@/components/creator/settings-form";
import { PageHeader } from "@/components/shared/page-header";
import { DEMO_STUDIO_PROFILE } from "@/lib/data/demo-studio";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const profile = await getCurrentProfile();
  const previewMode = !profile;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Settings"
        description={
          previewMode
            ? "Guest mode enabled. Save actions run in simulation mode."
            : "Edit your handle, display name, bio, and avatar."
        }
      />
      {previewMode ? (
        <section className="glass-panel rounded-xl border p-4 space-y-3">
          <p className="text-xs text-amber-200 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1">
            Guest mode: settings save/delete use safe simulation responses.
          </p>
        </section>
      ) : null}
      <SettingsForm
        initial={{
          handle: profile?.handle ?? DEMO_STUDIO_PROFILE.handle,
          displayName: profile?.display_name ?? DEMO_STUDIO_PROFILE.display_name ?? "",
          bio: profile?.bio ?? DEMO_STUDIO_PROFILE.bio ?? "",
          avatarUrl: profile?.avatar_url ?? DEMO_STUDIO_PROFILE.avatar_url ?? "",
        }}
      />
    </div>
  );
}

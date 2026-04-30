import { getCurrentProfile } from "@/lib/data/profiles";
import { SettingsForm } from "@/components/creator/settings-form";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";

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
            ? "Preview your creator settings layout without auth."
            : "Edit your handle, display name, bio, and avatar."
        }
      />
      {previewMode ? (
        <section className="glass-panel rounded-xl border p-4 space-y-3">
          <p className="text-xs text-amber-200 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1">
            Guest preview mode: form inputs are view-only until sign-in.
          </p>
          <div className="grid gap-3">
            <Input value="marketpulse" disabled />
            <Input value="Market Pulse" disabled />
            <textarea
              className="border-input text-muted-foreground min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm"
              value="Macro + intraday creator profile preview."
              disabled
            />
            <Input value="https://images.unsplash.com/..." disabled />
          </div>
        </section>
      ) : (
        <SettingsForm
          initial={{
            handle: profile.handle,
            displayName: profile.display_name ?? "",
            bio: profile.bio ?? "",
            avatarUrl: profile.avatar_url ?? "",
          }}
        />
      )}
    </div>
  );
}

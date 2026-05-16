import { UploadForm } from "@/components/creator/upload-form";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Upload",
};

export default async function UploadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const previewMode = !user;
  const muxWebhookConfigured = Boolean(process.env.MUX_WEBHOOK_SECRET);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Upload a video"
        description={
          previewMode
            ? "Guest mode enabled: uploads simulate success so you can test end-to-end UX."
            : "Files are uploaded directly to Mux. You'll see processing status on your videos page."
        }
        actions={
          <Link
            href="/studio/videos"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Open videos
          </Link>
        }
      />
      {!muxWebhookConfigured ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          Mux webhook secret is not set yet. Upload can start, but automatic
          processing status updates may lag until webhook setup is completed.
        </div>
      ) : null}
      {previewMode ? (
        <section className="glass-panel rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          Guest mode: upload flow runs in simulation mode and will forward you to videos after submit.
        </section>
      ) : null}
      <UploadForm allowGuestMode={previewMode} />
    </div>
  );
}

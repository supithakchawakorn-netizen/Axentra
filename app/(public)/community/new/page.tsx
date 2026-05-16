import Link from "next/link";
import { CommunityCreatePostForm } from "@/components/community/community-create-post-form";
import { CommunityDemoPill } from "@/components/community/community-demo-pill";
import { listCommunitiesForPicker } from "@/lib/data/community";
import { communityDemoPostingEnabled } from "@/lib/env";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Write a Post",
};

export default async function NewCommunityPostPage() {
  const communities = await listCommunitiesForPicker();
  const allowGuestDemoPosting = communityDemoPostingEnabled();

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6">
      <header className="space-y-2">
        <Link href="/community" className="text-muted-foreground text-sm hover:underline">
          Back to Community
        </Link>
        <h1 className="text-3xl font-bold">Write a Post</h1>
        <p className="text-muted-foreground text-base">
          Share something useful for the community with clear context and next steps.
        </p>
      </header>
      {communities.length === 0 ? (
        <div className="bg-card border-border rounded-lg border px-4 py-3 text-sm">
          <p className="font-medium">Community list unavailable</p>
          <p className="text-muted-foreground mt-1">
            We could not load communities right now. Refresh and try again.
          </p>
        </div>
      ) : null}
      <CommunityCreatePostForm communities={communities} allowGuestDemoPosting={allowGuestDemoPosting} />
      {communities.some((community) => community.id.startsWith("demo-community-")) ? (
        <CommunityDemoPill message="Demo community options are shown in the picker." />
      ) : null}
      {allowGuestDemoPosting ? (
        <CommunityDemoPill message="Demo mode enabled: unsigned local users can publish guest posts." />
      ) : null}
    </main>
  );
}

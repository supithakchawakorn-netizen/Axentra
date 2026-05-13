"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PostEditor } from "@/components/community/post-editor";
import { createCommunityPost, updateCommunityPost } from "@/app/(public)/community/_actions";
import type { CommunityCategory } from "@/types/community";

const categories: CommunityCategory[] = [
  "discussion",
  "tutorial",
  "question",
  "announcement",
  "other",
];

export function CommunityCreatePostForm({
  communities,
  initialPost,
  allowGuestDemoPosting = false,
}: {
  communities: Array<{ id: string; name: string }>;
  initialPost?: {
    id: string;
    community_id: string;
    title: string;
    body: string;
    category: CommunityCategory;
    tags: string[];
    cover_image_url: string | null;
    status: "draft" | "published";
  };
  allowGuestDemoPosting?: boolean;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [editorJson, setEditorJson] = useState(initialPost?.body ?? "");
  const [plainBody, setPlainBody] = useState("");
  const [category, setCategory] = useState<CommunityCategory>(initialPost?.category ?? "discussion");
  const [tags, setTags] = useState(initialPost?.tags.join(", ") ?? "");
  const [communityId, setCommunityId] = useState(initialPost?.community_id ?? communities[0]?.id ?? "");
  const [coverUrl, setCoverUrl] = useState<string>(initialPost?.cover_image_url ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function uploadCover(file: File) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Sign in required for cover uploads.");
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/community-covers/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("videos").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (uploadError) throw new Error(uploadError.message);
    const { data } = supabase.storage.from("videos").getPublicUrl(path);
    setCoverUrl(data.publicUrl);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    startTransition(async () => {
      try {
        await uploadCover(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not upload cover image.");
      }
    });
  }

  function onSubmit(status: "draft" | "published") {
    setError(null);
    if (!communityId && !initialPost) {
      setError("No community is available right now. Please try again shortly.");
      return;
    }
    const parsedTags = tags
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);
    startTransition(async () => {
      const updateRes =
        initialPost
          ? await updateCommunityPost({
              postId: initialPost.id,
              title,
              body: editorJson,
              excerpt: plainBody.slice(0, 220),
              category,
              tags: parsedTags,
              coverImageUrl: coverUrl || null,
              status,
            })
          : null;
      if (initialPost) {
        if (!updateRes?.ok) {
          setError(updateRes?.error ?? "Could not update post.");
          return;
        }
        router.push(`/community/${initialPost.id}`);
        return;
      }
      const res = await createCommunityPost({
        communityId,
        title,
        body: editorJson,
        excerpt: plainBody.slice(0, 220),
        category,
        tags: parsedTags,
        coverImageUrl: coverUrl || undefined,
        status,
      });
      if (!res.ok || !res.data) {
        setError(res.error ?? "Could not save post.");
        return;
      }
      if (allowGuestDemoPosting && res.data.postId.startsWith("demo-guest-post-")) {
        router.push("/community");
        return;
      }
      router.push(`/community/${res.data.postId}`);
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your post a title..."
          className="h-12 text-lg"
        />
      </div>

      <div className="space-y-2">
        <Label>Body</Label>
        <PostEditor
          value={editorJson}
          onChange={(json, text) => {
            setEditorJson(json);
            setPlainBody(text);
          }}
          placeholder="Write your community post..."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="community">Community</Label>
          <select
            id="community"
            value={communityId}
            onChange={(e) => setCommunityId(e.target.value)}
            disabled={Boolean(initialPost)}
            className="border-input h-12 w-full rounded-md border px-3 text-base"
          >
            {communities.map((community) => (
              <option key={community.id} value={community.id}>
                {community.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as CommunityCategory)}
            className="border-input h-12 w-full rounded-md border px-3 text-base capitalize"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="example: growth, onboarding, trust"
          className="h-12 text-base"
        />
      </div>

      <div className="space-y-2">
        <Label>Cover image</Label>
        {allowGuestDemoPosting ? (
          <p className="text-muted-foreground text-xs">
            Guest demo posts can publish without sign-in. Cover upload still needs auth.
          </p>
        ) : null}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="rounded-xl border-2 border-dashed p-6 text-center"
        >
          <p className="text-base font-medium">Drag and drop a cover image here</p>
          <p className="text-muted-foreground mt-1 text-sm">or upload from your computer</p>
          <input
            type="file"
            accept="image/*"
            className="mt-3 block w-full text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              startTransition(async () => {
                try {
                  await uploadCover(file);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Could not upload cover image.");
                }
              });
            }}
          />
          {coverUrl ? (
            <p className="mt-2 text-xs">Cover ready: {coverUrl}</p>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="text-destructive rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="secondary" className="h-12 min-w-40" disabled={isPending} onClick={() => onSubmit("draft")}>
          {isPending ? "Saving…" : "Save Draft"}
        </Button>
        <Button type="button" className="h-12 min-w-40" disabled={isPending} onClick={() => onSubmit("published")}>
          {isPending ? "Publishing…" : "Publish Post"}
        </Button>
      </div>
    </div>
  );
}

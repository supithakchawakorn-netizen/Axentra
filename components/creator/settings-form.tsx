"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteAccount,
  updateProfile,
} from "@/app/(creator)/studio/settings/_actions";
import { StatusPill } from "@/components/shared/status-pill";

interface Props {
  initial: {
    handle: string;
    displayName: string;
    bio: string;
    avatarUrl: string;
  };
}

export function SettingsForm({ initial }: Props) {
  const router = useRouter();
  const [handle, setHandle] = useState(initial.handle);
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [bio, setBio] = useState(initial.bio);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateProfile({
        handle: handle.toLowerCase(),
        displayName,
        bio,
        avatarUrl: avatarUrl || undefined,
      });
      if (!res.ok) {
        setError(res.error ?? "Could not save.");
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-1.5 rounded-lg border p-4">
        <Label htmlFor="handle">Handle</Label>
        <Input
          id="handle"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          required
          minLength={3}
          maxLength={32}
          pattern="[a-z0-9_]+"
        />
        <p className="text-muted-foreground text-xs">
          Public URL: /@{handle || "your-handle"}
        </p>
      </div>

      <div className="space-y-1.5 rounded-lg border p-4">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          maxLength={64}
        />
      </div>

      <div className="space-y-1.5 rounded-lg border p-4">
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          maxLength={500}
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 placeholder:text-muted-foreground w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
        />
      </div>

      <div className="space-y-1.5 rounded-lg border p-4">
        <Label htmlFor="avatarUrl">Avatar URL</Label>
        <Input
          id="avatarUrl"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          type="url"
          placeholder="https://…"
        />
      </div>

      {error ? (
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
          {error}
        </div>
      ) : null}
      {saved ? (
        <div className="flex items-center gap-2">
          <StatusPill label="Saved" tone="success" />
        </div>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save"}
      </Button>

      <div className="space-y-2 rounded-md border border-destructive/30 p-4">
        <h2 className="text-sm font-semibold">Danger zone</h2>
        <p className="text-muted-foreground text-xs">
          Permanently delete your account and all associated data.
        </p>
        <Button
          type="button"
          variant="destructive"
          disabled={isPending}
          onClick={() => {
            if (!confirm("Delete your account permanently? This cannot be undone.")) {
              return;
            }
            startTransition(async () => {
              const res = await deleteAccount();
              if (!res.ok) {
                setError(res.error ?? "Could not delete account.");
                return;
              }
              window.location.href = "/";
            });
          }}
        >
          Delete account
        </Button>
      </div>
    </form>
  );
}

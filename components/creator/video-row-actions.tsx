"use client";

import { useState, useTransition } from "react";
import { MoreHorizontalIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteVideo,
  editVideo,
  setVisibility,
} from "@/app/(creator)/studio/videos/_actions";
import { useRouter } from "next/navigation";
import { TickerPicker } from "@/components/creator/ticker-picker";
import type { TickerRow } from "@/lib/data/tickers";

type Visibility = "public" | "unlisted";

interface Props {
  videoId: string;
  title: string;
  description: string;
  visibility: Visibility;
  tickerIds: string[];
  showEditButton?: boolean;
  editButtonLabel?: string;
  onDeleted?: (videoId: string) => void;
  onUpdated?: (
    videoId: string,
    patch: {
      title?: string;
      description?: string;
      visibility?: Visibility;
      ticker_ids?: string[];
    },
  ) => void;
  onError?: (message: string) => void;
}

export function VideoRowActions({
  videoId,
  title,
  description,
  visibility,
  tickerIds,
  showEditButton = false,
  editButtonLabel = "Edit",
  onDeleted,
  onUpdated,
  onError,
}: Props) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editDescription, setEditDescription] = useState(description);
  const [editVisibility, setEditVisibility] = useState<Visibility>(visibility);
  const [editTickers, setEditTickers] = useState<TickerRow[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onToggleVisibility() {
    const next: Visibility = visibility === "public" ? "unlisted" : "public";
    startTransition(async () => {
      const res = await setVisibility({ videoId, visibility: next });
      if (!res.ok) {
        onError?.(res.error ?? "Could not update visibility.");
        return;
      }
      onUpdated?.(videoId, { visibility: next });
    });
  }

  function onDeleteConfirm() {
    setFormError(null);
    startTransition(async () => {
      const res = await deleteVideo({ videoId });
      if (!res.ok) {
        const message = res.error ?? "Could not delete video.";
        setFormError(message);
        onError?.(message);
        return;
      }
      setDeleteOpen(false);
      onDeleted?.(videoId);
      if (!onDeleted) {
        router.refresh();
      }
    });
  }

  function onEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const nextTitle = editTitle.trim();
    const nextDescription = editDescription.trim();
    if (!nextTitle) {
      setFormError("Title is required.");
      return;
    }

    const initialTickerIds = [...tickerIds].sort();
    const nextTickerIds = editTickers.map((t) => t.id).sort();
    const tickersChanged =
      initialTickerIds.length !== nextTickerIds.length ||
      initialTickerIds.some((id, index) => id !== nextTickerIds[index]);

    const payload: {
      videoId: string;
      title?: string;
      description?: string;
      visibility?: Visibility;
      tickerIds?: string[];
    } = { videoId };

    if (nextTitle !== title) payload.title = nextTitle;
    if (nextDescription !== description.trim()) payload.description = nextDescription;
    if (editVisibility !== visibility) payload.visibility = editVisibility;
    if (tickersChanged) payload.tickerIds = nextTickerIds;

    if (
      payload.title === undefined &&
      payload.description === undefined &&
      payload.visibility === undefined &&
      payload.tickerIds === undefined
    ) {
      setEditOpen(false);
      return;
    }

    startTransition(async () => {
      const res = await editVideo(payload);
      if (!res.ok) {
        const message = res.error ?? "Could not save video changes.";
        setFormError(message);
        onError?.(message);
        return;
      }
      setEditOpen(false);
      onUpdated?.(videoId, {
        title: payload.title,
        description: payload.description,
        visibility: payload.visibility,
        ticker_ids: payload.tickerIds,
      });
      if (!onUpdated) {
        router.refresh();
      }
    });
  }

  return (
    <>
      <div className="inline-flex items-center gap-1">
        {showEditButton ? (
          <Button type="button" size="sm" onClick={() => setEditOpen(true)} disabled={isPending}>
            {editButtonLabel}
          </Button>
        ) : null}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isPending}>
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setEditOpen(true)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onToggleVisibility}>
              Make {visibility === "public" ? "unlisted" : "public"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => {
                setDeleteOpen(true);
                setFormError(null);
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit video</DialogTitle>
            <DialogDescription>
              Update the title and description shown on the watch page.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onEditSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
                maxLength={140}
                disabled={isPending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-description">Description</Label>
              <textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
                maxLength={2000}
                disabled={isPending}
                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 placeholder:text-muted-foreground w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-visibility">Visibility</Label>
              <select
                id="edit-visibility"
                value={editVisibility}
                onChange={(e) => setEditVisibility(e.target.value as Visibility)}
                disabled={isPending}
                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:opacity-50"
              >
                <option value="public">Public — listed on your profile and feed</option>
                <option value="unlisted">Unlisted — anyone with the link</option>
              </select>
            </div>
            <TickerPicker
              value={editTickers}
              onChange={setEditTickers}
              initialIds={tickerIds}
              disabled={isPending}
            />
            {formError ? (
              <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
                {formError}
              </div>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete video</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this video? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {formError ? (
            <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
              {formError}
            </div>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeleteOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={onDeleteConfirm} disabled={isPending}>
              {isPending ? "Deleting…" : "Delete video"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

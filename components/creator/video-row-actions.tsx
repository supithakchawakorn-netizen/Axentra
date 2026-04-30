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
}

export function VideoRowActions({
  videoId,
  title,
  description,
  visibility,
  tickerIds,
}: Props) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editDescription, setEditDescription] = useState(description);
  const [editTickers, setEditTickers] = useState<TickerRow[]>([]);
  const [isPending, startTransition] = useTransition();

  function onToggleVisibility() {
    startTransition(async () => {
      const next: Visibility = visibility === "public" ? "unlisted" : "public";
      await setVisibility({ videoId, visibility: next });
      router.refresh();
    });
  }

  function onDelete() {
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    startTransition(async () => {
      await deleteVideo({ videoId });
      router.refresh();
    });
  }

  function onEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      await editVideo({
        videoId,
        title: editTitle,
        description: editDescription,
        tickerIds: editTickers.map((t) => t.id),
      });
      setEditOpen(false);
      router.refresh();
    });
  }

  return (
    <>
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
          <DropdownMenuItem variant="destructive" onSelect={onDelete}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 placeholder:text-muted-foreground w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
              />
            </div>
            <TickerPicker
              value={editTickers}
              onChange={setEditTickers}
              initialIds={tickerIds}
              disabled={isPending}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

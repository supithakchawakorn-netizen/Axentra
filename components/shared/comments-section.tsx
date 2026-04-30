import type { DemoComment } from "@/lib/data/comments";

export function CommentsSection({
  title,
  comments,
  inputLabel,
  helperText,
}: {
  title: string;
  comments: DemoComment[];
  inputLabel: string;
  helperText: string;
}) {
  return (
    <section className="glass-panel rounded-xl border p-4 space-y-4">
      <h2 className="text-sm font-semibold">{title}</h2>

      <div className="space-y-3">
        {comments.map((comment) => (
          <article key={comment.id} className="rounded-lg border bg-muted/35 p-3">
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{comment.author}</p>
              <p className="text-muted-foreground text-xs">{comment.postedAt}</p>
            </div>
            <p className="text-sm">{comment.text}</p>
            <p className="text-muted-foreground mt-2 text-xs">{comment.likes} likes</p>
          </article>
        ))}
      </div>

      <div className="space-y-2 rounded-lg border p-3">
        <label className="text-xs font-medium">{inputLabel}</label>
        <textarea
          rows={3}
          disabled
          placeholder="Write a comment..."
          className="border-input text-muted-foreground w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm opacity-80"
        />
        <p className="text-muted-foreground text-xs">{helperText}</p>
      </div>
    </section>
  );
}

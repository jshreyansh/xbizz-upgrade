"use client";

import { useState } from "react";
import { Check, Clock, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { AssetComment } from "@/features/workspace/asset-comments";

/**
 * The comments surface a reviewer sees on a published link.
 *
 * The same records the owner works in the editor, read from the other side.
 * A reviewer cannot see the canvas, the plan or the chat — this panel is the
 * whole of what they know, which is why a closed comment has to carry the
 * reason it was closed. "Resolved" on its own tells a reviewer nothing about
 * whether their point was taken.
 */
export function ReviewComments({
  comments,
  stampLabel,
  medicalReviewDone,
  regulatoryReviewDone,
  onPost,
}: {
  comments: AssetComment[];
  /** Where the reviewer is — the playhead on a video, the page on a deck —
   *  so a new comment is stamped with its own location. */
  stampLabel: string;
  medicalReviewDone: boolean;
  regulatoryReviewDone: boolean;
  onPost: (text: string) => void;
}) {
  const [draft, setDraft] = useState("");

  const open = comments.filter((c) => c.status === "open");
  const resolved = comments.filter((c) => c.status === "resolved");
  const discarded = comments.filter((c) => c.status === "rejected");
  const closed = [...resolved, ...discarded];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="space-y-2.5 border-b border-hair bg-canvas p-3.5">
        {/* Where the asset stands, before anything about individual comments:
            a reviewer's first question is whether this is still in review at
            all, not what the comment count is. */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: "Medical review", done: medicalReviewDone },
            { label: "Regulatory review", done: regulatoryReviewDone },
          ].map((gate) => (
            <span
              key={gate.label}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-chip border px-2.5 py-1 text-caption font-bold",
                gate.done
                  ? "border-ok-line bg-ok-bg text-ok"
                  : "border-warn-line bg-warn-bg text-warn"
              )}
            >
              {gate.done ? <Check className="size-3" /> : <Clock className="size-3" />}
              {gate.label} {gate.done ? "complete" : "pending"}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-control border border-hair bg-card px-3 py-2 text-caption">
          {[
            { label: "open", value: open.length, tone: "text-brand" },
            { label: "resolved", value: resolved.length, tone: "text-ok" },
            { label: "discarded", value: discarded.length, tone: "text-ink-3" },
          ].map((stat) => (
            <span key={stat.label} className="inline-flex items-baseline gap-1">
              <strong className={cn("text-body-lg font-[850] tabular-nums", stat.tone)}>{stat.value}</strong>
              <span className="text-ink-3">{stat.label}</span>
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <span className="text-label font-extrabold text-ink">Add Reviewer Comment</span>
          <span className="rounded-glyph border border-tint-line bg-tint px-2 py-0.5 text-caption font-bold tabular-nums text-brand-deep">
            {stampLabel}
          </span>
        </div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="Provide compliance or marketing feedback at current timestamp..."
          className="w-full resize-none rounded-control border border-hair-2 bg-card p-2.5 text-body text-ink transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="primary"
            disabled={!draft.trim()}
            onClick={() => { onPost(draft.trim()); setDraft(""); }}
            className="gap-1.5 text-label font-bold cursor-pointer disabled:opacity-40"
          >
            <Send className="size-3" /> Post Comment
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3.5">
        <Group title="Open" count={open.length} items={open} emptyLabel="Nothing open — every comment has been answered." />
        <Group
          title="Closed"
          count={closed.length}
          items={closed}
          emptyLabel="Nothing closed yet."
        />
      </div>
    </div>
  );
}

function Group({
  title,
  count,
  items,
  emptyLabel,
}: {
  title: string;
  count: number;
  items: AssetComment[];
  emptyLabel: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <span className="text-caption font-extrabold uppercase tracking-wider text-ink-3">{title}</span>
        <span className="rounded-full bg-subtle px-1.5 text-micro font-bold tabular-nums text-ink-3">{count}</span>
      </div>

      {items.length === 0 ? (
        <p className="text-caption italic text-ink-4">{emptyLabel}</p>
      ) : (
        items.map((comment) => {
          const rejected = comment.status === "rejected";
          const closed = comment.status !== "open";
          return (
            <div
              key={comment.id}
              className={cn(
                "rounded-panel border p-3",
                closed ? "border-hair bg-canvas" : "border-hair-2 bg-card"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="min-w-0">
                  <span className="block text-caption font-extrabold uppercase tracking-wider text-brand">
                    {comment.containerLabel} · {comment.elementLabel}
                  </span>
                  <span className="mt-0.5 block text-body leading-snug text-ink">{comment.text}</span>
                  <span className="mt-1 block text-caption text-ink-4">
                    {comment.author} · {comment.at}
                  </span>
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-glyph border px-2 py-0.5 text-caption font-bold",
                    comment.status === "open"
                      ? "border-brand/25 bg-tint text-brand-deep"
                      : rejected
                      ? "border-hair-2 bg-subtle text-ink-3"
                      : "border-ok-line bg-ok-bg text-ok"
                  )}
                >
                  {comment.status === "open" ? "Open" : rejected ? "Discarded" : "Resolved"}
                </span>
              </div>

              {closed && (
                <div className="mt-2 border-t border-hair pt-2">
                  {/* The reason, always. A reviewer sees only this panel, so a
                      close without one is a decision they cannot read. */}
                  <p className="flex items-start gap-1.5 text-caption leading-snug text-ink-2">
                    {rejected ? (
                      <X className="mt-0.5 size-3 shrink-0 text-ink-3" />
                    ) : (
                      <Check className="mt-0.5 size-3 shrink-0 text-ok" />
                    )}
                    <span>
                      {comment.closedReason ?? "Closed without a reason recorded."}
                      {comment.closedBy === "agent" && (
                        <span className="ml-1 font-bold text-ink-3">— SwishX</span>
                      )}
                    </span>
                  </p>
                  {/* No reply affordance: a closed point is answered, and a
                      thread hanging off it turns one decision into a
                      conversation nobody closes. Raise it again as its own
                      comment instead. */}
                  <p className="mt-1.5 text-micro italic text-ink-4">
                    Still not right? Add a new comment above rather than replying here.
                  </p>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

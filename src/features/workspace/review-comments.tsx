"use client";

import { useState } from "react";
import { Check, Clock, MessageSquarePlus, Send, X } from "lucide-react";
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
  canClose = false,
  onResolve,
  onReject,
  onAddToChat,
}: {
  comments: AssetComment[];
  /** Where the reviewer is — the playhead on a video, the page on a deck —
   *  so a new comment is stamped with its own location. */
  stampLabel: string;
  medicalReviewDone: boolean;
  regulatoryReviewDone: boolean;
  onPost: (text: string) => void;
  /**
   * Whether this viewer may close a comment. True in the editor, where the
   * owner works; false on the shared link, where a reviewer can raise a point
   * but not decide it has been answered.
   */
  canClose?: boolean;
  onResolve?: (id: string, note: string) => void;
  onReject?: (id: string, note: string) => void;
  /**
   * Hand this comment to the agent. Absent on the shared link: a reviewer's
   * words are outside input, and reaching the agent with them is the owner's
   * act, taken deliberately, one comment at a time.
   */
  onAddToChat?: (id: string) => void;
}) {
  const [draft, setDraft] = useState("");
  /* Which card is asking for its closing note, and what it will be closed as. */
  const [closing, setClosing] = useState<{ id: string; as: "resolved" | "rejected" } | null>(null);
  const [reason, setReason] = useState("");

  /* Reviewers only. What you write on the canvas is a suggestion and lives in
     the chat — it is an instruction about your own draft. A comment is
     somebody else's words on a published link, which is why this list exists:
     to be answered, not to be a second inbox for your own notes. */
  const fromTeam = comments.filter((c) => c.source === "team");
  const open = fromTeam.filter((c) => c.status === "open");
  const resolved = fromTeam.filter((c) => c.status === "resolved");
  const discarded = fromTeam.filter((c) => c.status === "rejected");
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
        <Group
          title="Open"
          count={open.length}
          items={open}
          emptyLabel="Nothing open — every comment has been answered."
          canClose={canClose}
          onAddToChat={onAddToChat}
          closing={closing}
          reason={reason}
          onReason={setReason}
          onBeginClose={(id, as) => { setClosing({ id, as }); setReason(""); }}
          onCancelClose={() => { setClosing(null); setReason(""); }}
          onConfirmClose={(id, as, note) => {
            if (as === "resolved") onResolve?.(id, note);
            else onReject?.(id, note);
            setClosing(null);
            setReason("");
          }}
        />
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
  canClose = false,
  onAddToChat,
  closing,
  reason = "",
  onReason,
  onBeginClose,
  onCancelClose,
  onConfirmClose,
}: {
  title: string;
  count: number;
  items: AssetComment[];
  emptyLabel: string;
  canClose?: boolean;
  onAddToChat?: (id: string) => void;
  closing?: { id: string; as: "resolved" | "rejected" } | null;
  reason?: string;
  onReason?: (next: string) => void;
  onBeginClose?: (id: string, as: "resolved" | "rejected") => void;
  onCancelClose?: () => void;
  onConfirmClose?: (id: string, as: "resolved" | "rejected", note: string) => void;
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

              {/* Closing a comment is the owner's act, in the editor. On the
                  shared link a reviewer can raise a point but not decide it
                  has been answered — which is the whole reason the point is
                  worth raising.

                  A teammate's comment needs BOTH doors, Resolve and Discard,
                  and a note either way: the person who wrote it sees only the
                  shared link, and a bare "Resolved" tells them nothing about
                  whether their point was taken. Your own comment closes in one
                  click — you already know why — and the agent may close those
                  too, which is what lets you ask it for a change and have the
                  note close itself. It may never close a teammate's. */}
              {!closed && canClose && (
                closing?.id === comment.id ? (
                  <div className="mt-2.5 space-y-1.5 border-t border-hair pt-2.5">
                    <label className="block text-caption font-bold text-ink-2">
                      {closing.as === "resolved" ? "What did you change?" : "Why is this being discarded?"}
                      <span className="ml-1 text-danger">required</span>
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => onReason?.(e.target.value)}
                      rows={2}
                      autoFocus
                      placeholder={
                        closing.as === "resolved"
                          ? "e.g. Reordered the line so Week 16 leads."
                          : "e.g. The label wording cannot change without a new MLR pass."
                      }
                      className="w-full resize-none rounded-control border border-hair-2 bg-canvas p-2 text-body text-ink focus:border-brand focus:bg-card focus:outline-none focus:ring-2 focus:ring-brand/15"
                    />
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={onCancelClose}
                        className="cursor-pointer rounded-glyph px-2 py-1 text-caption font-bold text-ink-3 hover:text-ink"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!reason.trim()}
                        onClick={() => onConfirmClose?.(comment.id, closing.as, reason.trim())}
                        className="cursor-pointer rounded-glyph bg-brand px-2.5 py-1 text-caption font-bold text-white transition hover:bg-brand-deep disabled:pointer-events-none disabled:opacity-40"
                      >
                        {closing.as === "resolved" ? "Resolve" : "Discard"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-hair pt-2.5">
                    <button
                      type="button"
                      onClick={() => onBeginClose?.(comment.id, "resolved")}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-glyph border border-ok-line bg-ok-bg px-2 py-1 text-caption font-bold text-ok transition hover:brightness-95"
                    >
                      <Check className="size-3" /> Resolve
                    </button>
                    <button
                        type="button"
                        onClick={() => onBeginClose?.(comment.id, "rejected")}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-glyph border border-hair-2 bg-card px-2 py-1 text-caption font-bold text-ink-3 transition hover:border-danger-line hover:text-danger"
                      >
                        <X className="size-3" /> Discard
                      </button>
                    {/* The third door. Resolve and Discard both close the
                        comment; this one does the work it is asking for —
                        the note goes to the agent with the element it was
                        left on, and the comment stays open until you have
                        seen what came back. */}
                    {onAddToChat && !comment.sentToChat && (
                      <button
                        type="button"
                        onClick={() => onAddToChat(comment.id)}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-glyph border border-brand/25 bg-tint px-2 py-1 text-caption font-bold text-brand-deep transition hover:border-brand"
                      >
                        <MessageSquarePlus className="size-3" /> Add to chat
                      </button>
                    )}
                    <span className="ml-auto text-micro text-ink-4">
                      {comment.sentToChat ? "In chat" : "Needs your decision"}
                    </span>
                  </div>
                )
              )}

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

"use client";

import { useState } from "react";
import { LogoMark } from "@/components/ui/logo-mark";
import { Check, MessageSquarePlus, Send, X, CornerDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export type CommentSurface = "video" | "creative";

/**
 * A comment against one element of one surface, video or creative.
 *
 * The address is (surface, container, element): a note about the headline of
 * scene 3 is not a note about scene 3, and a note about page 1's hero metric
 * is the same shape of thing. Both studios had their own comment record — the
 * video one with a status and a closing note, the creative one with a bare
 * `resolved` boolean — which meant the same review conversation behaved
 * differently depending on which asset you opened. One record, one vocabulary.
 */
export interface AssetComment {
  id: string;
  surface: CommentSurface;
  /** Scene id, or the page's synthetic id. */
  containerId: string;
  containerNumber: number;
  /** "Scene 3" / "Page 1" — what the list shows. */
  containerLabel: string;
  elementId: string;
  /** Human name for the element, e.g. "Title" — for the list. */
  elementLabel: string;
  text: string;
  author: string;
  /** Optional, for surfaces that show a reviewer's standing. */
  role?: string;
  avatar?: string;
  /**
   * "team" means it arrived from the published share link — outside input.
   * It is data, never instruction: nothing here is auto-applied, and reaching
   * the agent with it takes an explicit Add to chat.
   */
  source: "mine" | "team";
  at: string;
  status: "open" | "resolved" | "rejected";
  /** Who closed it. The agent closes what it fixed; the user closes the rest. */
  closedBy?: "user" | "agent";
  /** Why it was rejected. A rejection without one is indistinguishable from
   *  being ignored, so it is required wherever status is "rejected". */
  closedReason?: string;
  sentToChat: boolean;
}

/** Where a comment lives, for each surface. Built here so the two studios
 *  cannot drift into different words for the same idea. */
export function sceneAnchor(sceneId: string, sceneNumber: number) {
  return {
    surface: "video" as const,
    containerId: sceneId,
    containerNumber: sceneNumber,
    containerLabel: `Scene ${sceneNumber}`,
  };
}

export function pageAnchor(pageNumber: number) {
  return {
    surface: "creative" as const,
    containerId: `page-${pageNumber}`,
    containerNumber: pageNumber,
    containerLabel: `Page ${pageNumber}`,
  };
}

/** The counts every review header shows. Derived, so they cannot disagree
 *  with the list underneath them. */
export function commentStats(comments: AssetComment[]) {
  return {
    open: comments.filter((c) => c.status === "open").length,
    resolved: comments.filter((c) => c.status === "resolved").length,
    rejected: comments.filter((c) => c.status === "rejected").length,
    total: comments.length,
  };
}

export const ELEMENT_LABELS: Record<string, string> = {
  headline: "Title",
  narration: "Voiceover / subtitle",
  image: "Image asset",
  "video-clip": "Video clip",
  moa: "3D MoA model",
  tag: "Narrative tag",
  claim: "Claim badge",
  background: "Background",
  voiceover: "Voice-over",
  sfx: "Sound effects",
  "bg-video": "Background footage",
  graph: "Chart",
  avatar: "Presenter",
  logo: "Brand mark",
  // Creative surface
  "header.badge": "Eyebrow",
  "header.title": "Headline",
  "header.subtitle": "Subhead",
  "header.approvalTag": "Reference",
  "heroStat.category": "Stat label",
  "heroStat.metric": "Hero metric",
  "heroStat.comparison": "Comparator",
  "heroStat.detail": "Supporting copy",
  "moa.title": "Section title",
  "moa.detail": "Section copy",
  "isi.title": "Safety heading",
  "isi.content": "Safety copy",
  page: "Whole page",
};

/**
 * The actions offered on a selected canvas element, anchored to where the
 * click landed. Two, deliberately: send it to the agent now, or leave a note
 * for later. The composer opens in place rather than in a dialog, because a
 * note about a thing should be written next to the thing.
 */
export function ElementActionBar({
  at,
  elementLabel,
  onAddToChat,
  onComment,
  onDismiss,
}: {
  at: { x: number; y: number };
  elementLabel: string;
  onAddToChat: () => void;
  onComment: (text: string, alsoSendToChat: boolean) => void;
  onDismiss: () => void;
}) {
  const [composing, setComposing] = useState(false);
  const [text, setText] = useState("");

  const width = composing ? 320 : 232;
  const left = Math.max(12, Math.min(at.x - width / 2, window.innerWidth - width - 12));
  const top = Math.min(at.y + 14, window.innerHeight - (composing ? 190 : 60));

  const submit = (alsoSendToChat: boolean) => {
    const value = text.trim();
    if (!value) return;
    onComment(value, alsoSendToChat);
    setText("");
    setComposing(false);
    onDismiss();
  };

  return (
    <div
      style={{ left, top, width }}
      onClick={(e) => e.stopPropagation()}
      data-element-actions
      className="fixed z-[9998] rounded-panel border border-hair-2 bg-card p-1.5 shadow-float"
    >
      <div className="flex items-center gap-1.5 px-1.5 pb-1 pt-0.5">
        <span className="size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
        <span className="truncate text-caption font-extrabold uppercase tracking-wider text-ink-3">
          {elementLabel}
        </span>
      </div>

      {!composing ? (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onAddToChat}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-control px-2.5 py-1.5 text-body font-bold text-ink transition hover:bg-tint hover:text-brand-deep cursor-pointer"
          >
            {/* The agent's own mark on the action that reaches the agent. */}
            <LogoMark size={13} className="shrink-0 text-brand" />
            <span>Add to chat</span>
          </button>
          <button
            type="button"
            onClick={() => setComposing(true)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-control px-2.5 py-1.5 text-body font-bold text-ink transition hover:bg-tint hover:text-brand-deep cursor-pointer"
          >
            <MessageSquarePlus className="size-3.5 text-brand" />
            <span>Add comment</span>
          </button>
        </div>
      ) : (
        <div className="space-y-1.5 p-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            autoFocus
            placeholder={`What should change about the ${elementLabel.toLowerCase()}?`}
            className="w-full resize-none rounded-control border border-hair-2 bg-canvas p-2.5 text-body leading-relaxed text-ink transition focus:border-brand focus:bg-card focus:outline-none focus:ring-2 focus:ring-brand/15"
          />
          <div className="flex flex-col gap-1.5">
            <Button
              size="sm"
              variant="primary"
              disabled={!text.trim()}
              onClick={() => submit(true)}
              className="w-full gap-1.5 text-label font-bold cursor-pointer disabled:opacity-40"
            >
              <Send className="size-3" />
              <span>Send to chat &amp; add comment</span>
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={!text.trim()}
              onClick={() => submit(false)}
              className="w-full text-label font-bold cursor-pointer disabled:opacity-40"
            >
              Add comment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusChip({ comment }: { comment: AssetComment }) {
  if (comment.status === "open") {
    return <span className="shrink-0 rounded-glyph border border-hair-2 bg-card px-2 py-0.5 text-caption font-bold text-ink-3">Open</span>;
  }
  const resolved = comment.status === "resolved";
  return (
    <span
      title={comment.closedReason}
      className={cn(
        "shrink-0 rounded-glyph border px-2 py-0.5 text-caption font-bold",
        resolved ? "border-ok-line bg-ok-bg text-ok" : "border-hair-2 bg-subtle text-ink-3"
      )}
    >
      {resolved ? "Resolved" : "Rejected"}
      {comment.closedBy === "agent" && " by SwishX"}
    </span>
  );
}

/**
 * Every comment on this asset, split by where it came from.
 *
 * Team comments arrive from the published share link, so they are somebody
 * else's words: they get an explicit "Add to chat" rather than being fed to
 * the agent on arrival. Anyone with the link would otherwise be able to drive
 * the generator.
 */
export function CommentsModal({
  comments,
  teamUnlocked,
  onResolve,
  onReject,
  onSendToChat,
  onJump,
  onClose,
}: {
  comments: AssetComment[];
  /** Team comments only exist once a version has been published. */
  teamUnlocked: boolean;
  onResolve: (id: string, reason: string) => void;
  onReject: (id: string, reason: string) => void;
  onSendToChat: (id: string) => void;
  onJump: (comment: AssetComment) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"mine" | "team">("mine");
  /** The comment being closed, and the note that has to come with it. */
  const [closing, setClosing] = useState<{ id: string; as: "resolved" | "rejected" } | null>(null);
  const [reason, setReason] = useState("");
  const mine = comments.filter((c) => c.source === "mine");
  const team = comments.filter((c) => c.source === "team");
  const list = tab === "mine" ? mine : team;
  const openCount = (items: AssetComment[]) => items.filter((c) => c.status === "open").length;

  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-ink/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Comments">
      <div className="rise-in flex max-h-[80vh] w-full max-w-[620px] flex-col overflow-hidden rounded-card border border-hair-2 bg-card shadow-float">
        <div className="flex items-start justify-between gap-3 border-b border-hair-2 bg-canvas px-6 py-4">
          <div>
            <div className="text-caption font-extrabold uppercase tracking-[0.14em] text-brand">Review</div>
            <h2 className="mt-0.5 text-display font-[850] tracking-tight text-ink">Comments</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 place-items-center rounded-full text-ink-3 transition-colors hover:bg-black/5 hover:text-ink cursor-pointer"
          >
            <X className="size-4.5" />
          </button>
        </div>

        <div className="flex gap-1 border-b border-hair px-4 pt-3">
          {([
            { id: "mine" as const, label: "My comments", items: mine, enabled: true },
            { id: "team" as const, label: "Team comments", items: team, enabled: teamUnlocked },
          ]).map((t) => (
            <button
              key={t.id}
              type="button"
              disabled={!t.enabled}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-t-control px-3.5 py-2 text-body font-bold transition",
                !t.enabled
                  ? "text-ink-4 cursor-not-allowed"
                  : tab === t.id
                  ? "border-b-2 border-brand text-brand cursor-pointer"
                  : "text-ink-3 hover:text-ink cursor-pointer"
              )}
            >
              <span>{t.label}</span>
              {t.enabled && openCount(t.items) > 0 && (
                <span className="rounded-full bg-brand px-1.5 text-micro font-bold text-white tabular-nums">
                  {openCount(t.items)}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {!teamUnlocked && tab === "team" ? null : list.length === 0 ? (
            <div className="rounded-panel border border-dashed border-hair-2 bg-canvas px-4 py-10 text-center">
              <p className="text-body font-bold text-ink-2">
                {tab === "mine" ? "No comments yet" : "No comments from the team yet"}
              </p>
              <p className="mt-0.5 text-label text-ink-4">
                {tab === "mine"
                  ? "Click any element on the canvas and choose Add comment."
                  : "Comments left on the shared link will appear here."}
              </p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {list.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  closing={closing?.id === comment.id ? closing.as : null}
                  reason={reason}
                  onReason={setReason}
                  onBeginClose={(as) => { setClosing({ id: comment.id, as }); setReason(""); }}
                  onCancelClose={() => { setClosing(null); setReason(""); }}
                  onConfirmClose={(as, note) => {
                    if (as === "resolved") onResolve(comment.id, note);
                    else onReject(comment.id, note);
                    setClosing(null);
                    setReason("");
                  }}
                  onSendToChat={() => onSendToChat(comment.id)}
                  onJump={() => onJump(comment)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * One comment, wherever it is shown.
 *
 * Both studios render the list — the video editor in a modal, the creative
 * editor in its inspector, the reviewer on a share link — so the card is the
 * piece that has to be shared. If it were not, "Resolve" would mean three
 * slightly different things depending on which panel you were looking at,
 * which is how the two flows drifted apart in the first place.
 */
export function CommentCard({
  comment,
  closing,
  reason,
  onReason,
  onBeginClose,
  onCancelClose,
  onConfirmClose,
  onSendToChat,
  onJump,
}: {
  comment: AssetComment;
  /** Non-null while this card is asking for a closing note. */
  closing: "resolved" | "rejected" | null;
  reason: string;
  onReason: (next: string) => void;
  onBeginClose: (as: "resolved" | "rejected") => void;
  onCancelClose: () => void;
  onConfirmClose: (as: "resolved" | "rejected", note: string) => void;
  onSendToChat: () => void;
  onJump: () => void;
}) {
  return (
    <li
      className={cn(
        "rounded-panel border p-3",
        comment.status === "open" ? "border-hair-2 bg-card" : "border-hair bg-canvas"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <button type="button" onClick={onJump} className="group min-w-0 cursor-pointer text-left">
          <span className="block text-caption font-extrabold uppercase tracking-wider text-brand group-hover:underline">
            {comment.containerLabel} · {comment.elementLabel}
          </span>
          <span className="mt-0.5 block text-body leading-snug text-ink">{comment.text}</span>
          <span className="mt-1 block text-caption text-ink-4">
            {comment.author} · {comment.at}
            {comment.sentToChat && " · sent to chat"}
          </span>
        </button>
        <StatusChip comment={comment} />
      </div>

      {comment.status !== "open" && comment.closedReason && (
        <p className="mt-2 border-t border-hair pt-2 text-caption leading-snug text-ink-3">
          {comment.closedReason}
        </p>
      )}

      {comment.status === "open" && closing && (
        /**
         * A note is required to close a TEAM comment, because the person who
         * wrote it can only see the shared link — a bare "Resolved" tells them
         * nothing about whether their point was taken. Own comments close
         * without one: you already know why.
         */
        <div className="mt-2.5 space-y-1.5 border-t border-hair pt-2.5">
          <label className="block text-caption font-bold text-ink-2">
            {closing === "resolved" ? "What did you change?" : "Why is this being discarded?"}
            {comment.source === "team" && <span className="ml-1 text-danger">required</span>}
          </label>
          <textarea
            value={reason}
            onChange={(e) => onReason(e.target.value)}
            rows={2}
            autoFocus
            placeholder={
              closing === "resolved"
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
              disabled={comment.source === "team" && !reason.trim()}
              onClick={() => onConfirmClose(closing, reason.trim())}
              className="cursor-pointer rounded-glyph bg-brand px-2.5 py-1 text-caption font-bold text-white transition hover:bg-brand-deep disabled:pointer-events-none disabled:opacity-40"
            >
              {closing === "resolved" ? "Resolve" : "Discard"}
            </button>
          </div>
        </div>
      )}

      {comment.status === "open" && !closing && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-hair pt-2.5">
          <button
            type="button"
            onClick={() => onBeginClose("resolved")}
            className="inline-flex cursor-pointer items-center gap-1 rounded-glyph border border-ok-line bg-ok-bg px-2 py-1 text-caption font-bold text-ok transition hover:brightness-95"
          >
            <Check className="size-3" /> Resolve
          </button>
          <button
            type="button"
            onClick={() => onBeginClose("rejected")}
            className="inline-flex cursor-pointer items-center gap-1 rounded-glyph border border-hair-2 bg-card px-2 py-1 text-caption font-bold text-ink-3 transition hover:border-danger-line hover:text-danger"
          >
            <X className="size-3" /> Discard
          </button>
          {!comment.sentToChat && (
            <button
              type="button"
              onClick={onSendToChat}
              className="ml-auto inline-flex cursor-pointer items-center gap-1 rounded-glyph px-2 py-1 text-caption font-bold text-brand transition hover:bg-tint"
            >
              <Send className="size-3" /> Add to chat
            </button>
          )}
        </div>
      )}
    </li>
  );
}

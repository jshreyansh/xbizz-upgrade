"use client";

import { useState } from "react";
import { Check, MessageSquarePlus, Send, X, CornerDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/**
 * A comment against one element of one scene.
 *
 * The address is (sceneId, elementId): a note about the headline of scene 3 is
 * not a note about scene 3. Without that the modal cannot say where a comment
 * lives or take you to it, which is most of what a comment list is for.
 */
export interface SceneComment {
  id: string;
  sceneId: string;
  sceneNumber: number;
  elementId: string;
  /** Human name for the element, e.g. "Title" — for the list. */
  elementLabel: string;
  text: string;
  author: string;
  /** "team" means it arrived from the published share link. */
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

export const ELEMENT_LABELS: Record<string, string> = {
  headline: "Title",
  narration: "Voiceover / subtitle",
  image: "Image asset",
  "video-clip": "Video clip",
  moa: "3D MoA model",
  tag: "Narrative tag",
  claim: "Claim badge",
  background: "Background",
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
            <CornerDownRight className="size-3.5 text-brand" />
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

function StatusChip({ comment }: { comment: SceneComment }) {
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
  comments: SceneComment[];
  /** Team comments only exist once a version has been published. */
  teamUnlocked: boolean;
  onResolve: (id: string) => void;
  onReject: (id: string) => void;
  onSendToChat: (id: string) => void;
  onJump: (comment: SceneComment) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"mine" | "team">("mine");
  const mine = comments.filter((c) => c.source === "mine");
  const team = comments.filter((c) => c.source === "team");
  const list = tab === "mine" ? mine : team;
  const openCount = (items: SceneComment[]) => items.filter((c) => c.status === "open").length;

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
                <li
                  key={comment.id}
                  className={cn(
                    "rounded-panel border p-3",
                    comment.status === "open" ? "border-hair-2 bg-card" : "border-hair bg-canvas"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onJump(comment)}
                      className="min-w-0 text-left cursor-pointer group"
                    >
                      <span className="block text-caption font-extrabold uppercase tracking-wider text-brand group-hover:underline">
                        Scene {comment.sceneNumber} · {comment.elementLabel}
                      </span>
                      <span className="mt-0.5 block text-body leading-snug text-ink">{comment.text}</span>
                      <span className="mt-1 block text-caption text-ink-4">
                        {comment.author} · {comment.at}
                        {comment.sentToChat && " · sent to chat"}
                      </span>
                    </button>
                    <StatusChip comment={comment} />
                  </div>

                  {comment.status === "rejected" && comment.closedReason && (
                    <p className="mt-2 border-t border-hair pt-2 text-caption leading-snug text-ink-3">
                      {comment.closedReason}
                    </p>
                  )}

                  {comment.status === "open" && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-hair pt-2.5">
                      <button
                        type="button"
                        onClick={() => onResolve(comment.id)}
                        className="inline-flex items-center gap-1 rounded-glyph border border-ok-line bg-ok-bg px-2 py-1 text-caption font-bold text-ok transition hover:brightness-95 cursor-pointer"
                      >
                        <Check className="size-3" /> Resolve
                      </button>
                      <button
                        type="button"
                        onClick={() => onReject(comment.id)}
                        className="inline-flex items-center gap-1 rounded-glyph border border-hair-2 bg-card px-2 py-1 text-caption font-bold text-ink-3 transition hover:text-danger hover:border-danger-line cursor-pointer"
                      >
                        <X className="size-3" /> Reject
                      </button>
                      {!comment.sentToChat && (
                        <button
                          type="button"
                          onClick={() => onSendToChat(comment.id)}
                          className="ml-auto inline-flex items-center gap-1 rounded-glyph px-2 py-1 text-caption font-bold text-brand transition hover:bg-tint cursor-pointer"
                        >
                          <Send className="size-3" /> Add to chat
                        </button>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

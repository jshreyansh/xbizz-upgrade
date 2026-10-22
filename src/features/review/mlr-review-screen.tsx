"use client";

import { PageHeading } from "@/components/patterns/page-heading";
import { useState } from "react";
import { Check, Circle, Clapperboard, FileText, MessageSquare, RotateCcw, ShieldCheck, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { Chip } from "@/components/ui/chip";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Segmented, SegmentedButton } from "@/components/patterns/segmented";
import { useCan } from "@/features/settings/view-as";
import { useSettingsStore } from "@/features/settings/settings-store";
import type { Member } from "@/features/settings/settings-types";
import {
  canDecide,
  stageReviewers,
  stepLabel,
  useReviewStore,
  useWorkspaceReviewItems,
  type ReviewItem,
} from "@/features/review/review-store";
import { cn } from "@/lib/cn";

/**
 * MLR Review: where a reviewer finds what is waiting on them, and decides it.
 *
 * A queue first, because the reviewer's question is "what do I owe?", then
 * the item: the asset itself, where it is in its chain and who decided what,
 * what SwishX's automated check found, the discussion, and the decision.
 * Approving moves it to the next stage, or publishes it after the last one;
 * requesting changes sends it back to the creator with the reason.
 *
 * Who sees what: reviewers (Approve) see the whole queue and decide what
 * waits on them; creators without Approve see only their own submissions;
 * anyone else (Field Force, Read only) has no reason to be here and gets no
 * page. "Viewing as" in the header switches the person.
 */

type Tab = "mine" | "in_review" | "changes" | "approved";

export function MlrReviewScreen() {
  const items = useWorkspaceReviewItems();
  const reset = useReviewStore((s) => s.reset);
  const members = useSettingsStore((s) => s.members);
  const me = useSettingsStore((s) => s.currentUserId);
  const { me: viewer, can } = useCan();
  const reviewer = can("approve");
  const creator = can("create");
  /* A reviewer sees the whole queue; a creator only what they submitted. */
  const visible = reviewer ? items : items.filter((i) => i.ownerId === me);
  const mine = reviewer ? items.filter((i) => canDecide(i, me, members)) : [];
  const [tab, setTab] = useState<Tab | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  /* Open on what's owed when something is; otherwise on everything in review. */
  const preferred: Tab = mine.length ? "mine" : "in_review";
  const activeTab: Tab = tab && (reviewer || tab !== "mine") ? tab : preferred;

  const lists: Record<Tab, ReviewItem[]> = {
    mine,
    in_review: visible.filter((i) => i.status === "in_review"),
    changes: visible.filter((i) => i.status === "changes"),
    approved: visible.filter((i) => i.status === "approved"),
  };
  const tabs: Array<{ id: Tab; label: string }> = [
    ...(reviewer ? [{ id: "mine" as const, label: "Waiting for me" }] : []),
    { id: "in_review", label: reviewer ? "In review" : "My submissions in review" },
    { id: "changes", label: "Changes requested" },
    { id: "approved", label: "Approved" },
  ];
  const list = lists[activeTab];

  /* Nothing to review and nothing submitted: no page for this role. */
  if (!reviewer && !creator) {
    return (
      <div className="mx-auto flex w-full max-w-[640px] flex-col items-center gap-2 px-4 py-20 text-center">
        <ShieldCheck className="size-7 text-ink-4" />
        <h1 className="text-title font-[850] text-ink">MLR Review isn&rsquo;t part of your role</h1>
        <Text size="body" tone="muted" className="block">
          It&rsquo;s for reviewers who approve content and for people who create it. {viewer?.name} is {viewer?.role}, which has neither.
          An admin can change that in Settings → Team.
        </Text>
      </div>
    );
  }
  const open = items.find((i) => i.id === openId) ?? null;
  const nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? "Someone";

  return (
    <div className="page-enter space-y-6">
      <PageHeading
        title="MLR Review"
        description={reviewer
          ? "Assets waiting on medical, legal and regulatory sign-off, in the order each creator’s chain sets."
          : "Where your submitted content is in its review, and what reviewers have asked to change."}
        actions={
          /* The decisions can be played again from the start. */
          <Button size="sm" variant="ghost" onClick={() => { reset(); setOpenId(null); }} className="gap-1.5" title="Put every sample back where it started">
            <RotateCcw className="size-3.5" /> Reset samples
          </Button>
        }
      />

      <Segmented role="tablist" aria-label="Review queue" className="w-fit bg-card">
        {tabs.map((t) => (
          <SegmentedButton
            key={t.id}
            active={activeTab === t.id}
            onClick={() => setTab(t.id)}
            className={cn("gap-1.5 px-3 py-1.5", activeTab === t.id && "bg-ink text-white shadow-none")}
          >
            {t.label}
            <span className={cn("rounded-chip px-1.5 text-caption font-bold tabular-nums", activeTab === t.id ? "bg-white/20" : "bg-subtle text-ink-3")}>
              {lists[t.id].length}
            </span>
          </SegmentedButton>
        ))}
      </Segmented>

      {list.length === 0 ? (
        <div className="rounded-panel border border-dashed border-hair-2 bg-card px-6 py-12 text-center">
          <ShieldCheck className="mx-auto size-6 text-ok" />
          <Text size="body-lg" weight="bold" className="mt-2 block">
            {activeTab === "mine" ? "Nothing is waiting on you" : "Nothing here"}
          </Text>
          {activeTab === "mine" && (
            <Text size="label" tone="muted" className="mt-1 block">
              Items arrive here when they reach a stage you approve. Switch &ldquo;Viewing as&rdquo; to a reviewer to see their queue.
            </Text>
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {list.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setOpenId(item.id)}
                className="flex w-full cursor-pointer items-center gap-3.5 rounded-panel border border-hair bg-card p-3 text-left transition-colors hover:border-hair-3 hover:bg-canvas"
              >
                <Thumb item={item} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Text size="body-lg" weight="bold" className="truncate text-ink">{item.title}</Text>
                    <StatusChip item={item} />
                  </div>
                  <Text size="caption" tone="muted" className="mt-0.5 block truncate">
                    {item.kind === "video" ? "Video" : "Document"} · {item.spec} · {item.version} · by {nameOf(item.ownerId)}
                  </Text>
                  <Text size="label" className="mt-1 block truncate text-ink-2">{waitingLine(item, members, me)}</Text>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <Text size="caption" tone="muted" className="block">{item.events[item.events.length - 1]?.at}</Text>
                  <Text size="caption" className={cn("mt-0.5 block font-semibold", item.check.flags ? "text-warn" : "text-ok")}>
                    {item.check.flags ? `${item.check.flags} SwishX ${item.check.flags === 1 ? "flag" : "flags"}` : "SwishX check passed"}
                  </Text>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && <ReviewItemModal item={open} onClose={() => setOpenId(null)} />}
    </div>
  );
}

/** Who it is waiting on, in a line. */
function waitingLine(item: ReviewItem, members: Member[], me: string) {
  const nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? "the creator";
  if (item.status === "approved") return "Approved and published.";
  if (item.status === "changes") return `Back with ${nameOf(item.ownerId)} for changes.`;
  const who = stageReviewers(item.stages[item.stageIndex], members);
  const names = who.map((m) => (m.id === me ? "you" : m.name));
  return `${stepLabel(item)} · waiting on ${names.length ? names.join(", ") : "nobody yet (no one qualifies)"}`;
}

function StatusChip({ item }: { item: ReviewItem }) {
  if (item.status === "approved") return <Chip size="xs" tone="ok">Approved</Chip>;
  if (item.status === "changes") return <Chip size="xs" tone="warn">Changes requested</Chip>;
  return <Chip size="xs" tone="brand">In review · {item.stageIndex + 1}/{item.stages.length}</Chip>;
}

function Thumb({ item, large }: { item: ReviewItem; large?: boolean }) {
  const { preview } = item;
  return (
    <span
      className={cn("relative grid shrink-0 overflow-hidden rounded-control text-white", large ? "aspect-video w-full" : "h-14 w-24")}
      style={{ background: preview.gradient }}
    >
      {preview.videoSrc ? (
        large ? (
          <video src={preview.videoSrc} controls playsInline preload="metadata" className="absolute inset-0 size-full object-cover" />
        ) : (
          <video src={`${preview.videoSrc}#t=0.5`} muted playsInline preload="metadata" className="absolute inset-0 size-full object-cover opacity-90" />
        )
      ) : (
        <span className={cn("flex flex-col justify-end", large ? "gap-1 p-5" : "p-1.5")}>
          {large && preview.badge && <span className="w-fit rounded-glyph bg-black/25 px-1.5 py-0.5 text-micro font-extrabold uppercase tracking-wider">{preview.badge}</span>}
          <span className={cn("font-[850] leading-tight", large ? "text-display-lg" : "truncate text-caption")}>{preview.metric}</span>
          {large && <span className="text-label text-white/75">{preview.metricLabel}</span>}
        </span>
      )}
      {!large && (
        <span className="absolute left-1 top-1 grid size-4 place-items-center rounded-glyph bg-black/40">
          {item.kind === "video" ? <Clapperboard className="size-2.5" /> : <FileText className="size-2.5" />}
        </span>
      )}
    </span>
  );
}

/* ─────────────────────────────── The item ─────────────────────────────── */

function ReviewItemModal({ item, onClose }: { item: ReviewItem; onClose: () => void }) {
  const members = useSettingsStore((s) => s.members);
  const me = useSettingsStore((s) => s.currentUserId);
  const { approve, requestChanges, comment } = useReviewStore();
  const [deciding, setDeciding] = useState<"approve" | "changes" | null>(null);
  const [note, setNote] = useState("");
  const [reply, setReply] = useState("");
  const nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? "Someone";
  const mayDecide = canDecide(item, me, members);
  const stage = item.stages[item.stageIndex];
  const last = item.stageIndex >= item.stages.length - 1;

  /* Per stage: who decided it (latest decision wins), or who it waits on. */
  const decisionAt = (index: number) =>
    [...item.events].reverse().find((e) => e.stageIndex === index && (e.kind === "approved" || e.kind === "changes"));
  const talk = item.events.filter((e) => e.kind === "comment" || e.kind === "changes" || e.kind === "resubmitted" || (e.kind === "approved" && e.note));

  const decide = () => {
    if (deciding === "approve") approve(item.id, me, note);
    if (deciding === "changes" && note.trim()) requestChanges(item.id, me, note.trim());
    setDeciding(null);
    setNote("");
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title={item.title}
      description={`${item.kind === "video" ? "Video" : "Document"} · ${item.spec} · ${item.version} · submitted by ${nameOf(item.ownerId)}`}
      footer={
        <div className="flex w-full flex-wrap items-center justify-end gap-2">
          {!mayDecide && (
            <Text size="label" tone="muted" className="mr-auto">{waitingLine(item, members, me)}</Text>
          )}
          {mayDecide && !deciding && (
            <>
              <Text size="label" tone="muted" className="mr-auto">You&rsquo;re the reviewer for {stage?.name}.</Text>
              <Button size="sm" variant="secondary" onClick={() => setDeciding("changes")} className="gap-1.5">
                <RotateCcw className="size-3.5" /> Request changes
              </Button>
              <Button size="sm" onClick={() => setDeciding("approve")} className="gap-1.5 font-bold">
                <Check className="size-3.5" /> Approve
              </Button>
            </>
          )}
          {mayDecide && deciding && (
            <>
              <Button size="sm" variant="ghost" onClick={() => { setDeciding(null); setNote(""); }}>Cancel</Button>
              <Button
                size="sm"
                variant={deciding === "changes" ? "danger" : "primary"}
                disabled={deciding === "changes" && !note.trim()}
                onClick={decide}
                className="font-bold"
              >
                {deciding === "changes" ? "Send back for changes" : last ? "Approve and publish" : `Approve, send to ${item.stages[item.stageIndex + 1]?.name}`}
              </Button>
            </>
          )}
        </div>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* The asset, and what the automated check found. */}
        <div className="flex min-w-0 flex-col gap-3">
          <Thumb item={item} large />
          <div className={cn("rounded-control border p-3", item.check.flags ? "border-warn-line bg-warn-bg" : "border-ok-line bg-ok-bg")}>
            <p className="flex items-center gap-1.5 text-body font-bold text-ink">
              <ShieldCheck className={cn("size-4", item.check.flags ? "text-warn" : "text-ok")} />
              SwishX MLR check {item.check.flags ? `· ${item.check.flags} ${item.check.flags === 1 ? "flag" : "flags"}` : "· passed"}
            </p>
            <Text size="label" tone="muted" className="mt-0.5 block">{item.check.summary}</Text>
          </div>
          {deciding && (
            <Field
              multiline
              rows={3}
              autoFocus
              label={deciding === "changes" ? "What needs to change? (required)" : "Note for the record (optional)"}
              hint={deciding === "changes" ? `It goes back to ${nameOf(item.ownerId)} with this.` : undefined}
              placeholder={deciding === "changes" ? "e.g. Page 1 makes a superiority claim with no reference." : "e.g. Claims match the label."}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          )}
        </div>

        {/* Where it is, and what's been said. */}
        <div className="flex min-w-0 flex-col gap-4">
          <div>
            <Text size="label" tone="muted" weight="semibold" className="mb-2 block">Approval chain</Text>
            <ol className="flex flex-col">
              <ChainRow tone="done" title="Submitted" detail={`${nameOf(item.ownerId)} · ${item.events[0]?.at ?? ""}`} />
              {item.stages.map((st, i) => {
                const d = decisionAt(i);
                const current = item.status === "in_review" && i === item.stageIndex;
                const rejected = item.status === "changes" && item.rejectedAt === i;
                const done = !current && !rejected && (i < item.stageIndex || item.status === "approved") && d?.kind === "approved";
                const who = stageReviewers(st, members).map((m) => (m.id === me ? "you" : m.name)).join(", ");
                return (
                  <ChainRow
                    key={st.id}
                    tone={rejected ? "rejected" : done ? "done" : current ? "current" : "upcoming"}
                    title={st.name}
                    detail={
                      rejected ? `Changes requested by ${nameOf(d?.by ?? "")}`
                        : done ? `Approved by ${nameOf(d?.by ?? "")}`
                        : current ? `Waiting on ${who || "nobody yet"}`
                        : who ? `Then ${who}` : st.role
                    }
                  />
                );
              })}
              <ChainRow
                tone={item.status === "approved" ? "done" : "upcoming"}
                title="Published"
                detail={item.status === "approved" ? "Shareable and downloadable" : "After the last approval"}
                last
              />
            </ol>
          </div>

          <div className="flex min-h-0 flex-col gap-2">
            <Text size="label" tone="muted" weight="semibold" className="block">Discussion</Text>
            {talk.length === 0 && <Text size="label" tone="subtle">No comments yet.</Text>}
            <ul className="flex flex-col gap-2">
              {talk.map((e) => (
                <li
                  key={e.id}
                  className={cn(
                    "rounded-control border px-3 py-2",
                    e.kind === "changes" ? "border-warn-line bg-warn-bg" : "border-hair bg-canvas"
                  )}
                >
                  <Text size="caption" tone="muted" className="block">
                    <span className="font-bold text-ink">{nameOf(e.by)}</span> ·{" "}
                    {e.kind === "changes" ? "requested changes" : e.kind === "resubmitted" ? "resubmitted after changes" : e.kind === "approved" ? "approved" : "commented"} · {e.at}
                  </Text>
                  {e.note && <Text size="label" className="mt-0.5 block text-ink-2">{e.note}</Text>}
                </li>
              ))}
            </ul>
            <div className="flex items-end gap-2">
              <Field
                size="sm"
                aria-label="Comment"
                placeholder="Add a comment"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && reply.trim()) {
                    comment(item.id, me, reply.trim());
                    setReply("");
                  }
                }}
              />
              <Button
                size="sm"
                variant="secondary"
                disabled={!reply.trim()}
                onClick={() => { comment(item.id, me, reply.trim()); setReply(""); }}
                className="gap-1.5"
              >
                <MessageSquare className="size-3.5" /> Post
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function ChainRow({
  tone,
  title,
  detail,
  last,
}: {
  tone: "done" | "current" | "rejected" | "upcoming";
  title: string;
  detail: string;
  last?: boolean;
}) {
  return (
    <li className="relative flex gap-3 pb-3 last:pb-0">
      {!last && <span aria-hidden className="absolute left-[9px] top-6 bottom-0 w-px bg-hair-2" />}
      <span
        className={cn(
          "relative z-[1] mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
          tone === "done" && "bg-ok text-white",
          tone === "current" && "bg-brand text-white ring-4 ring-brand/15",
          tone === "rejected" && "bg-warn text-white",
          tone === "upcoming" && "border border-hair-3 bg-card text-ink-4"
        )}
      >
        {tone === "done" ? <Check className="size-3" strokeWidth={3} /> : tone === "rejected" ? <X className="size-3" strokeWidth={3} /> : <Circle className="size-1.5 fill-current" />}
      </span>
      <span className="min-w-0">
        <Text size="body" weight="semibold" className={cn("block", tone === "upcoming" ? "text-ink-3" : "text-ink")}>{title}</Text>
        <Text size="caption" tone="muted" className="block">{detail}</Text>
      </span>
    </li>
  );
}

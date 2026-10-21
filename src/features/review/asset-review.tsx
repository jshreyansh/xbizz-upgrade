"use client";

import Link from "next/link";
import { ArrowRight, Check, Clock, RotateCcw } from "lucide-react";
import { chainStagesFor, useSettingsStore } from "@/features/settings/settings-store";
import { stageReviewers, stepLabel, useReviewStore, useWorkspaceReviewItems, type ReviewItem } from "@/features/review/review-store";
import { useCan } from "@/features/settings/view-as";
import { cn } from "@/lib/cn";

/**
 * The review funnel as a studio sees it: the creator's chain, the item for
 * this asset if it has been submitted, and a way to submit it.
 *
 * The creator is whoever you are "Viewing as" (Settings), so the funnel can
 * be walked end to end in the prototype by switching between creator and
 * reviewers.
 */
export function useAssetReview(key: string) {
  const me = useSettingsStore((s) => s.currentUserId);
  const chains = useSettingsStore((s) => s.chains);
  const stages = chainStagesFor({ chains }, me);
  const item = useWorkspaceReviewItems().find((i) => i.key === key);
  const submit = useReviewStore((s) => s.submit);
  /* Share and download wait for the last approval; an asset that never went
     through the funnel (opened from the library as published) is not held. */
  /* Sharing, downloading and editing come with Create, edit & publish. */
  const { can } = useCan();
  const canEdit = can("create");
  const shareLocked = !canEdit || (!!item && item.status !== "approved");
  const shareNote = !canEdit
    ? "Sharing comes with Create, edit & publish"
    : shareLocked ? "Opens once the review chain approves it" : undefined;
  return { me, stages, item, submit, shareLocked, shareNote, canEdit };
}

/** Where a submitted asset is, in a strip across the top of its published view. */
export function ReviewStatusBanner({ item, onEdit }: { item: ReviewItem; onEdit: () => void }) {
  const members = useSettingsStore((s) => s.members);
  const nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? "a reviewer";
  const lastChange = [...item.events].reverse().find((e) => e.kind === "changes");
  const lastApproval = [...item.events].reverse().find((e) => e.kind === "approved");
  const waitingOn = item.status === "in_review"
    ? stageReviewers(item.stages[item.stageIndex], members).map((m) => m.name).join(", ")
    : "";

  return (
    <div
      role="status"
      className={cn(
        "flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b px-4 py-2.5",
        item.status === "approved" && "border-ok-line bg-ok-bg",
        item.status === "changes" && "border-warn-line bg-warn-bg",
        item.status === "in_review" && "border-tint-line bg-tint"
      )}
    >
      <span
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-full text-white",
          item.status === "approved" ? "bg-ok" : item.status === "changes" ? "bg-warn" : "bg-brand"
        )}
      >
        {item.status === "approved" ? <Check className="size-3.5" strokeWidth={3} /> : item.status === "changes" ? <RotateCcw className="size-3.5" /> : <Clock className="size-3.5" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-body font-bold text-ink">
          {item.status === "approved"
            ? `Approved and published as ${item.version}`
            : item.status === "changes"
              ? `Changes requested by ${nameOf(lastChange?.by ?? "")}`
              : `In review · ${stepLabel(item)}`}
        </p>
        <p className="text-label text-ink-2 [overflow-wrap:anywhere]">
          {item.status === "approved"
            ? `Last approved by ${nameOf(lastApproval?.by ?? "")}. Sharing and download are open.`
            : item.status === "changes"
              ? `“${lastChange?.note ?? ""}” Edit it, then resubmit from Preview and Publish.`
              : `Waiting on ${waitingOn || "nobody yet (no one qualifies for this stage)"}. Sharing and download open once it's approved.`}
        </p>
      </div>
      {item.status === "changes" ? (
        <button
          type="button"
          onClick={onEdit}
          className="focus-ring inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-control bg-ink px-3 text-label font-bold text-card transition-opacity hover:opacity-90"
        >
          <RotateCcw className="size-3.5" /> Edit and resubmit
        </button>
      ) : (
        <Link
          href="/mlr-review"
          className="focus-ring inline-flex h-8 shrink-0 items-center gap-1.5 rounded-control border border-hair-2 bg-card px-3 text-label font-bold text-ink transition-colors hover:border-brand"
        >
          Open in MLR Review <ArrowRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}

"use client";

import { useState, type ReactNode } from "react";
import { ShieldCheck, Lock, X } from "lucide-react";
import { Button, IconButton } from "@/components/ui/button";
import { Portal } from "@/components/ui/portal";
import { LogoMark } from "@/components/ui/logo-mark";
import { cn } from "@/lib/cn";
import { PreflightPanel, type PreflightCheck } from "@/features/workspace/preflight-panel";
import { timeAgo, type MlrReview } from "@/features/workspace/mlr-review";

/**
 * Preview and Publish — the last look before an asset goes out.
 *
 * The asset on the left, as the people receiving it will see it: the film
 * with its chapters, or the document page by page. On the right, the quality
 * and regulatory check, with when it last ran and whether anything has
 * changed since, and the MLR review that refreshes it.
 *
 * An MLR review is a checkpoint, and every opening of this window starts
 * one fresh: earlier findings are of an earlier version, so they are not
 * shown. One button runs it; while it runs the preview is frozen and nothing
 * here can be pressed — not even the close — because the review is of
 * exactly this version. It survives a refresh; see mlr-review.ts. When it
 * finishes, its findings show and the button goes, until the next opening.
 *
 * There is no cost card. The credits were agreed when the asset was created;
 * this window is about whether it is ready to go, not what it cost.
 */
export function PreviewPublishModal({
  title,
  version,
  kind,
  preview,
  checks,
  review,
  onClose,
  onPublish,
  submit,
}: {
  title: string;
  /** "Version 1" — what publishing creates. */
  version: string;
  kind: "video" | "document" | "ad";
  /** The asset itself, frozen by the caller while the review runs. */
  preview: ReactNode;
  /** What the last review found. Shown only once a review has run. */
  checks: PreflightCheck[];
  review: MlrReview;
  onClose: () => void;
  onPublish: () => void;
  /**
   * The creator has an approval chain: the button submits into it instead of
   * publishing, and says where it goes. Absent, it publishes straight away.
   */
  submit?: { label: string; route: string[] };
}) {
  const running = review.status === "running";
  const flagged = checks.filter((c) => c.severity).length;
  /* Run in this opening of the window — or already running when it opened,
     after a refresh — so its findings are of this version. */
  const [ranHere, setRanHere] = useState(running);
  const showFindings = ranHere && review.status === "done";

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 grid place-items-center bg-ink/55 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label="Preview and Publish"
      >
        <div className="rise-in flex h-[min(720px,90vh)] w-full max-w-[1120px] flex-col overflow-hidden rounded-card border border-white/50 bg-card shadow-float">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-hair bg-canvas px-5 py-3.5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-caption font-extrabold uppercase tracking-[0.14em] text-brand">
                <LogoMark size={13} /> Preview and Publish
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <h2 className="truncate text-title font-[850] tracking-tight text-ink">{title}</h2>
                <span className="rounded-chip border border-tint-line bg-tint px-2 py-0.5 text-caption font-bold text-brand-deep">
                  {submit ? `Submitting ${version} for review` : `Publishing as ${version}`}
                </span>
              </div>
            </div>
            {!running && (
              <IconButton aria-label="Close" onClick={onClose}>
                <X className="size-4" />
              </IconButton>
            )}
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
            {/* The asset */}
            <div className={cn("relative min-h-[280px] overflow-hidden", kind === "video" ? "bg-[#0d1411]" : "bg-subtle")}>
              {preview}
              {running && (
                <div className="absolute inset-0 z-50 grid place-items-center bg-ink/45 backdrop-blur-[1px]">
                  <span className="inline-flex items-center gap-2 rounded-full bg-ink/80 px-3.5 py-1.5 text-label font-bold text-white ring-1 ring-white/15">
                    <Lock className="size-3.5" />
                    Frozen while MLR review runs
                  </span>
                </div>
              )}
            </div>

            {/* The check, and what to do */}
            <div className="flex min-h-0 flex-col border-t border-hair md:border-l md:border-t-0">
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                <div className="flex items-start gap-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-control bg-ok-bg text-ok">
                    <ShieldCheck className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-body-lg font-extrabold text-ink">Quality and regulatory check</div>
                    <div className="text-label text-ink-3">
                      {running
                        ? "Running now"
                        : showFindings
                        ? `Run ${timeAgo(review.lastRunAt ?? 0)} on this version`
                        : "Not run on this version yet"}
                    </div>
                  </div>
                </div>

                {running ? (
                  /* The run itself, in place of the findings it will replace. */
                  <div className="space-y-2.5 rounded-panel border border-tint-line bg-tint p-3.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-body font-extrabold text-brand-deep">MLR review in progress</span>
                      <span className="text-title font-[850] tabular-nums text-brand-deep">{review.progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-card">
                      <div
                        className="h-full rounded-full bg-brand transition-[width] duration-200 ease-linear"
                        style={{ width: `${review.progress}%` }}
                      />
                    </div>
                    <p className="text-label leading-snug text-ink-2">
                      {`${reviewStep(review.progress)}. The ${kind === "ad" ? "campaign" : kind} is frozen until it finishes, and leaving or refreshing won't stop it.`}
                    </p>
                  </div>
                ) : showFindings ? (
                  <PreflightPanel checks={checks} />
                ) : (
                  <>
                    <div className="rounded-panel border border-dashed border-hair-3 p-3.5 text-label leading-snug text-ink-3">
                      SwishX checks every claim against its source, the fair balance and the ISI, and reads for
                      promotional tone, before this goes out.
                    </div>
                    <Button
                      type="button"
                      onClick={() => {
                        setRanHere(true);
                        review.start();
                      }}
                      className="w-full gap-1.5 font-bold"
                    >
                      <ShieldCheck className="size-4" />
                      Run SwishX MLR review
                    </Button>
                  </>
                )}
              </div>

              {/* What to do with it */}
              <div className="space-y-2 border-t border-hair bg-canvas p-4">
                {showFindings && flagged > 0 && (
                  <p className="text-label font-semibold text-warn">
                    {flagged} {flagged === 1 ? "item" : "items"} flagged. You can still publish.
                  </p>
                )}
                {/* Where it goes after this, when it goes to people before publishing. */}
                {submit && (
                  <p className="text-label text-ink-2">
                    Goes to {submit.route.join(" → ")} → <span className="font-semibold">published</span>. Sharing opens once it&rsquo;s approved.
                  </p>
                )}
                {/* No Cancel: the close in the header is the way out. */}
                <div className="flex items-center justify-end gap-2">
                  <Button type="button" onClick={onPublish} disabled={running} className="gap-1.5 px-6 font-bold">
                    <LogoMark size={14} />
                    {submit ? submit.label : "Publish"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}

/** What the review is doing, so the wait reads as work. */
function reviewStep(progress: number) {
  if (progress < 25) return "Matching every claim to its approved source";
  if (progress < 50) return "Checking fair balance and the ISI";
  if (progress < 75) return "Reading for promotional tone and off-label language";
  return "Checking references and required statements";
}

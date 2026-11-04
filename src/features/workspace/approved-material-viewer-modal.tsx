"use client";

import { useEffect, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Film,
  Megaphone,
  Plus,
  ShieldCheck,
  X,
} from "lucide-react";
import { Portal } from "@/components/ui/portal";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/features/content-library/asset-preview";
import { AD_PLACEMENTS, type AdPlacement } from "@/features/workspace/ad-options";
import type { EmailPiece } from "@/features/workspace/email-options";
import { cn } from "@/lib/cn";

export interface ApprovedMaterialViewerModalProps {
  piece: EmailPiece | null;
  onClose: () => void;
  isAttached?: boolean;
  onToggleAttach?: (id: string) => void;
}

/** Mock multi-page deck data for Clinical Documents & Infographics */
const DOC_PAGES = [
  {
    role: "Pivotal Endpoints",
    title: "Primary Efficacy Analysis · AFFIRM-3 Phase III Trial",
    headline: "Superior Response Rates vs Standard of Care",
    metric: "52% Response",
    metricSub: "Complete response (CR) vs 18% standard of care (p < 0.001)",
    keyPoints: [
      "Significant improvement in overall survival at 24 months (HR 0.62, 95% CI 0.49–0.78)",
      "Consistent clinical benefit demonstrated across all pre-specified patient subgroups",
      "Median duration of response was 18.4 months compared to 9.2 months for active comparator",
    ],
    footnote: "AFFIRM-3: Randomized, double-blind, multicenter trial in adult patients (N=1,248).",
  },
  {
    role: "Durability & QoL",
    title: "Durability of Response & Patient-Reported Outcomes",
    headline: "Sustained Maintenance Through Week 52",
    metric: "78% Maintained",
    metricSub: "Patients maintained therapeutic response at 1-year landmark analysis",
    keyPoints: [
      "Rapid onset of clinical benefit observed as early as Week 4 post-initiation",
      "+6.4 mean improvement from baseline on FACT-G functional well-being scale (MCID: 3.0)",
      "Subgroup analysis confirmed durability regardless of prior biologic exposure history",
    ],
    footnote: "LTE-301 Open-label extension cohort. Data lock August 2026.",
  },
  {
    role: "Safety & ISI",
    title: "Safety Profile, Adverse Reactions & Contraindications",
    headline: "Well-Tolerated with Low Discontinuation Rates",
    metric: "1.8% Discontinuation",
    metricSub: "Treatment discontinuations due to adverse events (vs 4.2% for comparator)",
    keyPoints: [
      "Most frequent adverse reactions (≥5%): Nasopharyngitis (6.2%), Headache (5.1%), Fatigue (4.8%)",
      "Serious adverse events reported in 3.1% of patients with no new safety signals detected",
      "Boxed Warning: Review Prescribing Information for full monitoring and risk mitigation guidance",
    ],
    footnote: "Safety population analysis across pooled Phase II/III clinical database (N=2,180).",
  },
  {
    role: "Dosing & Access",
    title: "Administration Guidelines & Patient Support Programs",
    headline: "Convenient Dosing Schedule with Direct Support",
    metric: "Once Monthly",
    metricSub: "Subcutaneous self-injection following initial loading phase",
    keyPoints: [
      "Initiation: 200 mg subcutaneous loading dose at Weeks 0 and 2, followed by 100 mg Q4W",
      "Pre-filled autoinjector designed for simplified at-home administration",
      "Co-pay savings program: eligible commercially insured patients may pay as little as $0/month",
    ],
    footnote: "See section 2.1 of Full Prescribing Information for detailed reconstitution instructions.",
  },
];

export function ApprovedMaterialViewerModal({
  piece,
  onClose,
  isAttached = false,
  onToggleAttach,
}: ApprovedMaterialViewerModalProps) {
  const [activePageIndex, setActivePageIndex] = useState(0);

  // Close on Escape key, Left/Right arrow page navigation
  useEffect(() => {
    if (!piece) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") {
        setActivePageIndex((i) => Math.min(DOC_PAGES.length - 1, i + 1));
      }
      if (e.key === "ArrowLeft") {
        setActivePageIndex((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [piece, onClose]);

  if (!piece) return null;

  const isVideo =
    piece.kind === "Video" ||
    (piece.kind === "Ad" &&
      (piece.adPlacementId === "youtube" ||
        piece.adPlacementId === "meta-reels-stories" ||
        /video|reel|shorts/i.test(piece.title)));

  const isAd = piece.kind === "Ad";
  const placementId = piece.adPlacementId as AdPlacement | undefined;
  const placement = AD_PLACEMENTS.find((p) => p.id === placementId);

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 p-3 backdrop-blur-sm sm:p-5"
        role="dialog"
        aria-modal="true"
        aria-label={`${piece.title} Full Preview`}
        onClick={onClose}
      >
        <div
          className="flex h-full max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-panel border border-hair bg-card shadow-float text-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between gap-3 border-b border-hair px-5 py-3.5 bg-card">
            <div className="flex items-center gap-3 min-w-0">
              <div className="grid size-9 shrink-0 place-items-center rounded-control bg-tint text-brand-deep">
                {isVideo ? (
                  <Film className="size-4" />
                ) : isAd ? (
                  <Megaphone className="size-4" />
                ) : (
                  <FileText className="size-4" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-body-lg font-[850] text-ink">{piece.title}</h3>
                  <StatusChip status={piece.asset.status} />
                </div>
                <p className="truncate text-label text-ink-3">
                  {piece.kind === "Video"
                    ? "Full Video Material"
                    : piece.kind === "Docs"
                    ? "Clinical Document & Slide Deck"
                    : `Ad Creative Cutdown · ${piece.spec}`}
                  {" · "}
                  {piece.asset.brand}
                  {" · "}
                  {piece.approval}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onToggleAttach && (
                <Button
                  size="sm"
                  variant={isAttached ? "secondary" : "primary"}
                  onClick={() => onToggleAttach(piece.id)}
                  className="gap-1.5 font-bold cursor-pointer"
                >
                  {isAttached ? (
                    <>
                      <Check className="size-3.5 stroke-[3] text-ok" />
                      <span>Attached to email</span>
                    </>
                  ) : (
                    <>
                      <Plus className="size-3.5" />
                      <span>Attach to email</span>
                    </>
                  )}
                </Button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="grid size-8 cursor-pointer place-items-center rounded-control text-ink-3 transition hover:bg-black/5 hover:text-ink"
                aria-label="Close full preview"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Body: Different visual viewers based on material type */}
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-canvas">
            {isVideo ? (
              <VideoPlayerViewer piece={piece} />
            ) : isAd ? (
              <AdCreativeViewer piece={piece} placement={placement} />
            ) : (
              <DocDeckViewer
                piece={piece}
                pageIndex={activePageIndex}
                onSelectPage={setActivePageIndex}
              />
            )}
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between border-t border-hair bg-card px-5 py-3">
            <div className="flex items-center gap-2 text-label text-ink-3">
              <ShieldCheck className="size-4 text-ok" />
              <span>Veeva PromoMats approved for promotional and medical exchange</span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={onClose} className="px-4 font-bold cursor-pointer">
                Back to materials
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}

/** 1. High-Fidelity Video Player Viewer */
function VideoPlayerViewer({ piece }: { piece: EmailPiece }) {
  const videoSrc = piece.asset.videoSrc || "/reel-moa.mp4";

  return (
    <div className="flex flex-1 flex-col p-4 sm:p-6">
      <div className="relative mx-auto flex w-full max-w-4xl flex-col overflow-hidden rounded-panel border border-hair bg-black shadow-lg">
        <video
          src={videoSrc}
          controls
          autoPlay
          playsInline
          className="aspect-video w-full object-contain"
        />
      </div>

      <div className="mx-auto mt-4 w-full max-w-4xl grid gap-4 rounded-panel border border-hair bg-card p-4 sm:grid-cols-3">
        <div className="sm:col-span-2 space-y-2">
          <div className="flex items-center gap-2 text-micro font-extrabold uppercase tracking-wider text-ink-3">
            <Film className="size-3.5 text-brand" />
            <span>Lead Clinical Claim Grounding</span>
          </div>
          <p className="text-body font-bold text-ink">
            {piece.asset.metric
              ? `${piece.asset.metric}: ${piece.asset.metricLabel ?? ""}`
              : "Demonstrated significant clinical efficacy over standard of care in primary endpoint clearing."}
          </p>
          <p className="text-label text-ink-3">
            This video will be inserted as an interactive video card at the core of the email. HCPs and patients can view the clinical animation directly with verified tracking.
          </p>
        </div>

        <div className="rounded-control border border-hair-2 bg-subtle/50 p-3 space-y-1.5 text-label">
          <div className="text-caption font-bold uppercase tracking-wider text-ink-4">Video Specifications</div>
          <div className="flex justify-between text-ink-3">
            <span>Aspect Ratio</span>
            <span className="font-bold text-ink">{piece.spec.split("·")[0]?.trim() || "16:9"}</span>
          </div>
          <div className="flex justify-between text-ink-3">
            <span>Duration</span>
            <span className="font-bold text-ink">{piece.spec.split("·")[1]?.trim() || "45 sec"}</span>
          </div>
          <div className="flex justify-between text-ink-3">
            <span>Resolution</span>
            <span className="font-bold text-ink">1080p Full HD</span>
          </div>
          <div className="flex justify-between text-ink-3">
            <span>MLR Asset ID</span>
            <span className="font-mono text-micro text-ink-2 font-bold">{`APV-${piece.id.slice(0, 8).toUpperCase()}`}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 2. Interactive Multi-Page Document & Deck Viewer */
function DocDeckViewer({
  piece,
  pageIndex,
  onSelectPage,
}: {
  piece: EmailPiece;
  pageIndex: number;
  onSelectPage: (index: number) => void;
}) {
  const page = DOC_PAGES[pageIndex] || DOC_PAGES[0];
  const total = DOC_PAGES.length;

  return (
    <div className="flex flex-1 flex-col p-4 sm:p-6 space-y-4">
      {/* Page Tabs / Navigation Bar */}
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {DOC_PAGES.map((p, idx) => (
            <button
              key={p.role}
              type="button"
              onClick={() => onSelectPage(idx)}
              className={cn(
                "flex items-center gap-1.5 rounded-chip px-3 py-1 text-label font-bold transition cursor-pointer shrink-0 border",
                idx === pageIndex
                  ? "border-brand bg-tint text-brand-deep shadow-2xs"
                  : "border-hair bg-card text-ink-3 hover:text-ink hover:border-hair-3"
              )}
            >
              <span>Page {idx + 1}:</span>
              <span className="font-medium">{p.role}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            disabled={pageIndex === 0}
            onClick={() => onSelectPage(pageIndex - 1)}
            className="grid size-7 cursor-pointer place-items-center rounded-chip border border-hair bg-card text-ink-3 hover:text-ink hover:border-hair-3 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="px-2 text-label font-bold tabular-nums text-ink-2">
            {pageIndex + 1} / {total}
          </span>
          <button
            type="button"
            disabled={pageIndex === total - 1}
            onClick={() => onSelectPage(pageIndex + 1)}
            className="grid size-7 cursor-pointer place-items-center rounded-chip border border-hair bg-card text-ink-3 hover:text-ink hover:border-hair-3 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Main Page Slide Stage */}
      <div className="relative mx-auto flex w-full max-w-4xl flex-col overflow-hidden rounded-panel border border-hair bg-card shadow-md">
        {/* Slide Header */}
        <div
          className="p-6 text-white"
          style={{ background: piece.asset.gradient || "linear-gradient(150deg,#111827,#1f2937 55%,#334155)" }}
        >
          <div className="flex items-center justify-between text-micro font-bold uppercase tracking-wider text-white/70">
            <span>{piece.asset.brand} · Clinical Documentation</span>
            <span>{page.role}</span>
          </div>
          <h4 className="mt-2 text-title font-extrabold tracking-tight text-white">{page.title}</h4>
          <p className="mt-1 text-body text-white/80">{page.headline}</p>

          <div className="mt-5 inline-flex flex-col rounded-control border border-white/20 bg-black/25 px-4 py-2.5 backdrop-blur-sm">
            <span className="text-display font-black tracking-tight text-white">{page.metric}</span>
            <span className="text-caption font-medium text-white/80">{page.metricSub}</span>
          </div>
        </div>

        {/* Slide Content Points */}
        <div className="p-6 space-y-4 bg-card">
          <div className="text-label font-bold uppercase tracking-wider text-ink-4">Key Clinical Evidence</div>
          <div className="space-y-2.5">
            {page.keyPoints.map((pt, i) => (
              <div key={i} className="flex items-start gap-2.5 text-body text-ink-2">
                <div className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                <span className="leading-snug">{pt}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-hair-2 pt-3 text-caption text-ink-4">
            <p><strong>Methodology &amp; Source:</strong> {page.footnote}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 3. Platform-Accurate Ad Cutdown Viewer */
function AdCreativeViewer({
  piece,
}: {
  piece: EmailPiece;
  placement?: (typeof AD_PLACEMENTS)[number];
}) {
  const isYoutube = piece.adPlacementId === "youtube";
  const isDisplay = piece.adPlacementId === "google-display";
  const isFeed = !isYoutube && !isDisplay;

  return (
    <div className="flex flex-1 flex-col p-4 sm:p-6 space-y-4">
      <div className="mx-auto flex w-full max-w-4xl justify-center">
        {/* Mobile / Social Feed Mockup */}
        {isFeed && (
          <div className="w-full max-w-md overflow-hidden rounded-card border border-hair-3 bg-card shadow-float">
            {/* Social Header */}
            <div className="flex items-center justify-between border-b border-hair-2 p-3">
              <div className="flex items-center gap-2.5">
                <div className="grid size-8 place-items-center rounded-full bg-tint text-brand-deep font-extrabold text-caption">
                  {piece.asset.brand.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-body font-bold text-ink">
                    <span>{piece.asset.brand} Official</span>
                    <span className="rounded-chip bg-tint px-1 py-0.2 text-micro text-brand font-bold">✓</span>
                  </div>
                  <span className="text-caption text-ink-3">Sponsored · Medical Affairs</span>
                </div>
              </div>
              <span className="text-ink-3 text-body font-bold">•••</span>
            </div>

            {/* Creative Canvas */}
            <div
              className="relative aspect-square w-full flex flex-col justify-end p-5 text-white"
              style={{ background: piece.asset.gradient || "linear-gradient(150deg,#7c2d12,#c2410c 55%,#f97316)" }}
            >
              <div className="inline-block rounded-chip bg-black/60 px-2 py-0.5 text-micro font-bold uppercase tracking-wider text-white backdrop-blur-sm w-fit mb-2">
                {piece.cutdownName || "1:1 Feed Post"}
              </div>
              <h4 className="text-subhead font-black tracking-tight leading-tight">
                {piece.asset.metric
                  ? `${piece.asset.metric}: ${piece.asset.metricLabel ?? ""}`
                  : `Clinical advancements with ${piece.asset.brand}.`}
              </h4>
            </div>

            {/* Social CTA Bar */}
            <div className="flex items-center justify-between border-t border-hair-2 bg-subtle/30 px-3 py-2.5">
              <div className="min-w-0">
                <span className="block truncate text-caption font-bold text-ink">Learn More About Clinical Evidence</span>
                <span className="block truncate text-micro text-ink-3">prescribing-info.{piece.asset.brand.toLowerCase()}.com</span>
              </div>
              <Button size="sm" variant="secondary" className="h-7 text-caption font-bold cursor-pointer">
                Learn more ↗
              </Button>
            </div>

            {/* ISI / Fair Balance Safety Band */}
            <div className="border-t border-hair-2 bg-hair-1 p-2.5 text-micro leading-tight text-ink-3">
              <p className="font-semibold text-ink-2">Important Safety Information &amp; Indication:</p>
              <p className="mt-0.5 line-clamp-2">
                {piece.asset.brand} is indicated for eligible adult patients. Please review full Prescribing Information including Boxed Warning for detailed risk evaluations.
              </p>
            </div>
          </div>
        )}

        {/* YouTube In-Stream / Shorts Mockup */}
        {isYoutube && (
          <div className="w-full max-w-2xl overflow-hidden rounded-panel border border-hair-3 bg-black shadow-float text-white">
            <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
              <video
                src={piece.asset.videoSrc || "/reel-moa.mp4"}
                controls
                autoPlay
                playsInline
                className="h-full w-full object-contain"
              />
              <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-chip bg-black/75 px-2.5 py-1 text-caption font-bold text-white backdrop-blur-sm">
                <span className="rounded-[2px] bg-warn px-1 py-0.2 text-micro font-black text-black">Ad</span>
                <span>0:15 / 0:30</span>
              </div>
              <div className="absolute right-3 bottom-3 rounded-control border border-white/20 bg-black/60 px-3 py-1.5 text-caption font-bold text-white backdrop-blur-sm">
                Skip Ad in 5s
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 bg-black/90 p-3 text-label">
              <div className="min-w-0">
                <span className="block truncate font-bold text-white">{piece.title}</span>
                <span className="block truncate text-caption text-white/60">{piece.asset.brand} · In-stream Placement</span>
              </div>
              <Button size="sm" className="h-7 bg-card text-ink font-bold hover:bg-card/90 border border-hair-2">
                Visit site
              </Button>
            </div>
          </div>
        )}

        {/* Display Banner Mockup */}
        {isDisplay && (
          <div className="flex flex-col items-center gap-4">
            <div
              className="relative w-[300px] h-[250px] overflow-hidden rounded-control border border-hair-3 shadow-md flex flex-col justify-between p-3.5 text-white text-left"
              style={{ background: piece.asset.gradient || "linear-gradient(150deg,#7c2d12,#c2410c 55%,#f97316)" }}
            >
              <div>
                <span className="rounded-chip bg-black/60 px-2 py-0.5 text-micro font-bold uppercase tracking-wider text-white">
                  300 × 250 MPU
                </span>
                <h4 className="mt-2 text-subhead font-black tracking-tight leading-snug">
                  {piece.asset.brand} Efficacy Profile
                </h4>
                <p className="mt-1 text-caption text-white/80 line-clamp-2">
                  {piece.asset.metric ? `${piece.asset.metric}: ${piece.asset.metricLabel}` : "Explore pivotal Phase III trial endpoints."}
                </p>
              </div>

              <div>
                <div className="inline-block rounded-chip bg-card px-3 py-1 text-caption font-extrabold text-ink shadow-sm">
                  Explore Data ↗
                </div>
                <div className="mt-2 border-t border-white/20 pt-1 text-micro text-white/65 line-clamp-1">
                  Click for Full Prescribing Information &amp; Boxed Warning.
                </div>
              </div>
            </div>
            <span className="text-label text-ink-3">Standard Display IAB Ad Placement (300×250 Medium Rectangle)</span>
          </div>
        )}
      </div>
    </div>
  );
}

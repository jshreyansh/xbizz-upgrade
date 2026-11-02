"use client";

import React, { useState } from "react";
import {
  Share2,
  Copy,
  Check,
  X,
  Download,
  ShieldCheck,
  Cloud,
  FileCheck2,
  Lock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { Portal } from "@/components/ui/portal";
import { Segmented, SegmentedButton } from "@/components/patterns/segmented";
import { captionLabel, type CaptionStyle } from "@/features/workspace/subtitle-sync";

interface ShareReviewModalProps {
  open: boolean;
  onClose: () => void;
  assetType: "video" | "infographic" | "deck" | "ad" | "email";
  /** For ads: "6 ads in 9 sizes", shown under the title. */
  assetSummary?: string;
  assetTitle: string;
  brandName?: string;
  durationSeconds?: number;
  onExportDirect?: () => void;
  onShowToast?: (message: string) => void;
  /** Video: the captions burned into the published video, which decides what Download offers. */
  captions?: CaptionStyle;
}

type VideoDownload = "with" | "without";

export function ShareReviewModal({
  open,
  onClose,
  assetType,
  assetSummary,
  assetTitle,
  brandName = "Brand",
  durationSeconds,
  onExportDirect,
  onShowToast,
  captions = "off",
}: ShareReviewModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [creativeFormat, setCreativeFormat] = useState<"pdf" | "png" | "jpg">("pdf");
  const hasCaptions = captions !== "off";
  const [videoDownload, setVideoDownload] = useState<VideoDownload>(hasCaptions ? "with" : "without");
  /* What each download is, said the way the button and the toast say it. */
  const VIDEO_DOWNLOADS: Array<{ id: VideoDownload; label: string; detail: string; file: string }> = [
    ...(hasCaptions
      ? [{ id: "with" as const, label: "With captions", detail: `1080p MP4 with ${captionLabel(captions).toLowerCase()} captions burned into the picture. Plays anywhere, captions always on.`, file: "MP4 with captions" }]
      : []),
    {
      id: "without",
      label: hasCaptions ? "Without captions" : "MP4",
      detail: "1080p MP4 with the voiceover and no captions.",
      file: hasCaptions ? "MP4 without captions" : "MP4",
    },
  ];
  const chosenDownload = VIDEO_DOWNLOADS.find((d) => d.id === videoDownload) ?? VIDEO_DOWNLOADS[0];

  if (!open) return null;

  const slug = `${brandName.toLowerCase()}-${assetType === "video" ? "hcp-launch" : assetType === "ad" ? "campaign" : "hcp-infographic"}-v1`;
  const reviewUrl = `https://swishx.biz/review/${assetType}/${slug}`;

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(reviewUrl);
    }
    setCopied(true);
    onShowToast?.("✓ Shareable review link copied to clipboard");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOneDrive = () => {
    setActiveAction("onedrive");
    onShowToast?.("Connecting to Microsoft OneDrive / SharePoint...");
    setTimeout(() => {
      setActiveAction(null);
      onShowToast?.("✓ Asset & MLR metadata successfully saved to OneDrive: /Medical-Affairs/2026-Launches");
      onClose();
    }, 1400);
  };

  const handleVeeva = () => {
    setActiveAction("veeva");
    onShowToast?.("Packaging Veeva Vault PromoMats binder with 24 verified claims...");
    setTimeout(() => {
      setActiveAction(null);
      onShowToast?.("✓ Document submitted to Veeva PromoMats (Ref #PRM-8842-US) with claim annotations.");
      onClose();
    }, 1600);
  };

  const handleExport = () => {
    if (assetType === "ad") {
      onShowToast?.(`✓ Starting download: ${assetTitle} · every ad, in every size, named by placement`);
    } else if (assetType === "video") {
      if (onExportDirect) onExportDirect();
      onShowToast?.(`✓ Starting download: ${assetTitle} · ${chosenDownload.file}`);
    } else {
      const formatLabel =
        creativeFormat === "pdf"
          ? "PDF (300 DPI CMYK Print)"
          : creativeFormat === "png"
          ? "PNG (4K Lossless Image)"
          : "JPG (High-Quality RGB)";
      onShowToast?.(`✓ Starting download: ${assetTitle} · ${formatLabel}`);
    }
    onClose();
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-150 text-left"
        role="dialog"
        aria-modal="true"
        onClick={onClose}
      >
        <div
          className="w-full max-w-[560px] rounded-card bg-card shadow-2xl border border-hair-2 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 px-6 border-b border-hair bg-canvas">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-control bg-tint text-brand border border-tint-line grid place-items-center">
                <Share2 className="size-5" />
              </div>
              <div>
                <h2 className="text-title font-[850] text-ink tracking-tight">
                  Share &amp; Distribute Asset
                </h2>
                <p className="text-body text-ink-3">
                  {assetTitle} · {assetType === "video" ? `Video (${durationSeconds || 50}s)` : assetType === "ad" ? `Ad campaign${assetSummary ? ` (${assetSummary})` : ""}` : "Infographic (Print-Ready)"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="size-8 rounded-full hover:bg-black/5 grid place-items-center text-ink-3 hover:text-ink transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="size-4.5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 1. Share Review Link Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-label font-extrabold uppercase tracking-wider text-ink-3 flex items-center gap-1.5">
                  <Lock className="size-3 text-brand" />
                  <span>Shareable Review Link</span>
                </label>
                <span className="text-caption font-semibold text-ok bg-ok-bg border border-ok-line px-2 py-0.5 rounded-chip">
                  Comments &amp; MLR Audit Enabled
                </span>
              </div>

              <p className="text-body text-ink-2 leading-relaxed">
                Anyone with this link can inspect clinical claims, leave pinned reviewer comments, and export proofs.
              </p>

              <div className="flex items-center gap-2 p-1.5 pl-3 rounded-control bg-subtle border border-hair-2 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10 transition-all">
                <input
                  type="text"
                  readOnly
                  value={reviewUrl}
                  className="flex-1 bg-transparent text-body font-mono text-ink outline-none select-all truncate"
                />
                <Button
                  size="sm"
                  onClick={handleCopyLink}
                  className={cn(
                    "h-8 px-3.5 rounded-chip text-label font-bold transition-all cursor-pointer shadow-xs shrink-0 gap-1.5",
                    copied
                      ? "bg-ok hover:bg-emerald-700 text-white"
                      : "bg-brand hover:bg-brand-deep text-white"
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="size-3.5 stroke-[3]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* 2. Enterprise Pharma & Cloud Destinations (ACTIVE) */}
            <div className="space-y-2.5">
              <div className="text-label font-extrabold uppercase tracking-wider text-ink-3">
                Enterprise &amp; Compliance Destinations
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {/* Option A: Save to OneDrive */}
                <button
                  type="button"
                  onClick={handleOneDrive}
                  disabled={activeAction === "onedrive"}
                  className="w-full flex items-center justify-between p-3 rounded-panel border border-hair-2 bg-card hover:border-[#0078d4] hover:bg-[#f3f9fd] transition-all text-left shadow-2xs group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-control bg-[#0078d4]/10 text-[#0078d4] grid place-items-center shrink-0 border border-[#0078d4]/20">
                      {/* Microsoft OneDrive Cloud SVG */}
                      <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-body-lg font-bold text-ink flex items-center gap-1.5">
                        <span>Save in OneDrive / SharePoint</span>
                      </h4>
                      <p className="text-label text-ink-3">
                        Sync master file directly to Enterprise Medical Affairs OneDrive library
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-label font-bold text-[#0078d4] opacity-80 group-hover:opacity-100 shrink-0 ml-2">
                    <span>{activeAction === "onedrive" ? "Saving..." : "Save"}</span>
                    <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* Option B: Send to Veeva PromoMats */}
                <button
                  type="button"
                  onClick={handleVeeva}
                  disabled={activeAction === "veeva"}
                  className="w-full flex items-center justify-between p-3 rounded-panel border border-hair-2 bg-card hover:border-amber-600 hover:bg-[#fffcf5] transition-all text-left shadow-2xs group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-control bg-warn/10 text-warn grid place-items-center shrink-0 border border-amber-500/20">
                      <ShieldCheck className="size-5 text-warn" />
                    </div>
                    <div>
                      <h4 className="text-body-lg font-bold text-ink flex items-center gap-1.5">
                        <span>Send to Veeva PromoMats</span>
                        <span className="rounded-glyph bg-warn-bg/70 text-warn text-caption font-bold px-1.5 py-0.2 border border-warn-line/60">
                          MLR Binder
                        </span>
                      </h4>
                      <p className="text-label text-ink-3">
                        Submit document package with claim citations &amp; audit log to Veeva Vault
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-label font-bold text-warn opacity-80 group-hover:opacity-100 shrink-0 ml-2">
                    <span>{activeAction === "veeva" ? "Packaging..." : "Send"}</span>
                    <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* Option C: Export Master File (Video MP4 or Creative PDF/PNG/JPG) */}
                {assetType === "ad" ? (
                  <button
                    type="button"
                    onClick={handleExport}
                    className="w-full flex items-center justify-between p-3 rounded-panel border border-hair-2 bg-card hover:border-brand hover:bg-tint transition-all text-left shadow-2xs group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-9 rounded-control bg-tint text-brand grid place-items-center shrink-0 border border-tint-line">
                        <Download className="size-5" />
                      </div>
                      <div>
                        <h4 className="text-body-lg font-bold text-ink flex items-center gap-1.5">
                          <span>Export the ad package</span>
                          <span className="rounded-glyph bg-tint text-brand-deep text-caption font-bold px-1.5 py-0.2 border border-tint-line">ZIP</span>
                        </h4>
                        <p className="text-label text-ink-3">Every ad in every size, named by placement, ready to upload to each platform</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-label font-bold text-brand opacity-80 group-hover:opacity-100 shrink-0 ml-2">
                      <span>Download</span>
                      <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ) : assetType === "video" ? (
                  /* The same card as a document's export: pick the file, then download it. */
                  <div className="w-full flex flex-col p-3.5 rounded-panel border border-hair-2 bg-card shadow-2xs space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="size-8 rounded-control bg-tint text-brand grid place-items-center shrink-0 border border-tint-line">
                          <Download className="size-4.5" />
                        </div>
                        <h4 className="text-body-lg font-bold text-ink">Download the video</h4>
                      </div>
                      {/* A choice only when there is one to make: without captions, there is just the MP4. */}
                      {VIDEO_DOWNLOADS.length > 1 && (
                      <Segmented className="shrink-0">
                        {VIDEO_DOWNLOADS.map((d) => (
                          <SegmentedButton key={d.id} active={chosenDownload.id === d.id} onClick={() => setVideoDownload(d.id)}>
                            {d.label}
                          </SegmentedButton>
                        ))}
                      </Segmented>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-hair">
                      <p className="text-label text-ink-3 pr-3 leading-snug">{chosenDownload.detail}</p>
                      <Button size="sm" onClick={handleExport} className="h-8 shrink-0 gap-1 px-4 text-label font-bold">
                        <Download className="size-3.5" />
                        <span>Download</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex flex-col p-3.5 rounded-panel border border-hair-2 bg-card shadow-2xs space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="size-8 rounded-control bg-tint text-brand grid place-items-center shrink-0 border border-tint-line">
                          <Download className="size-4.5" />
                        </div>
                        <div>
                          <h4 className="text-body-lg font-bold text-ink flex items-center gap-1.5">
                            <span>Export Master Graphic</span>
                            <span className="rounded-glyph bg-tint text-brand-deep text-caption font-bold px-1.5 py-0.2 border border-tint-line uppercase">
                              {creativeFormat} format
                            </span>
                          </h4>
                        </div>
                      </div>

                      {/* Format Selector Pills (PDF / PNG / JPG) */}
                      <div className="flex items-center gap-1 p-0.5 bg-[#f0f2ef] rounded-control border border-hair shrink-0">
                        {(
                          [
                            { id: "pdf", label: "PDF" },
                            { id: "png", label: "PNG" },
                            { id: "jpg", label: "JPG" },
                          ] as const
                        ).map((fmt) => (
                          <button
                            key={fmt.id}
                            type="button"
                            onClick={() => setCreativeFormat(fmt.id)}
                            className={cn(
                              "px-2.5 py-1 rounded-chip text-label font-bold transition-all cursor-pointer",
                              creativeFormat === fmt.id
                                ? "bg-card text-brand shadow-2xs border border-hair-2"
                                : "text-ink-3 hover:text-ink"
                            )}
                          >
                            {fmt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-hair">
                      <p className="text-label text-ink-3 pr-3 leading-snug">
                        {creativeFormat === "pdf" &&
                          "Print-ready vector PDF proof with complete ISI fair balance tables & 3mm bleed."}
                        {creativeFormat === "png" &&
                          "Lossless 4K transparent/solid image asset (2400×3200px) for slides & displays."}
                        {creativeFormat === "jpg" &&
                          "Standard compressed high-quality RGB image optimized for web portals & emails."}
                      </p>

                      <Button
                        size="sm"
                        onClick={handleExport}
                        className="h-8 px-4 rounded-control bg-brand hover:bg-brand-deep text-white text-label font-bold shrink-0 cursor-pointer shadow-xs gap-1"
                      >
                        <Download className="size-3.5" />
                        <span>Export {creativeFormat.toUpperCase()}</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 px-6 border-t border-hair bg-canvas flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-label text-ink-3">
              <ShieldCheck className="size-3.5 text-ok" />
              <span>21 CFR Part 11 &amp; Veeva Audit Trail Verified</span>
            </div>
            <Button size="sm" variant="secondary" onClick={onClose} className="px-4">
              Done
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

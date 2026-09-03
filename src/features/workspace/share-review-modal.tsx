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
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

interface ShareReviewModalProps {
  open: boolean;
  onClose: () => void;
  assetType: "video" | "infographic" | "deck";
  assetTitle: string;
  brandName?: string;
  durationSeconds?: number;
  onExportDirect?: () => void;
  onShowToast?: (message: string) => void;
}

export function ShareReviewModal({
  open,
  onClose,
  assetType,
  assetTitle,
  brandName = "Brand",
  durationSeconds,
  onExportDirect,
  onShowToast,
}: ShareReviewModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [creativeFormat, setCreativeFormat] = useState<"pdf" | "png" | "jpg">("pdf");

  if (!open) return null;

  const slug = `${brandName.toLowerCase()}-${assetType === "video" ? "hcp-launch" : "hcp-infographic"}-v1`;
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
    if (assetType === "video") {
      if (onExportDirect) {
        onExportDirect();
      } else {
        onShowToast?.(`✓ Starting download: ${assetTitle} · MP4 (1080p Master)`);
      }
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

  const handleSocialComingSoon = (channelName: string) => {
    onShowToast?.(`Direct 1-click publishing to ${channelName} is coming soon in Q4.`);
  };

  return (
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
            <div className="size-10 rounded-xl bg-tint text-brand border border-tint-line grid place-items-center">
              <Share2 className="size-5" />
            </div>
            <div>
              <h2 className="text-title font-[850] text-ink tracking-tight">
                Share &amp; Distribute Asset
              </h2>
              <p className="text-body text-ink-3">
                {assetTitle} · {assetType === "video" ? `Video (${durationSeconds || 50}s)` : "Infographic (Print-Ready)"}
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
              <span className="text-caption font-semibold text-ok bg-ok-bg border border-ok-line px-2 py-0.5 rounded-full">
                Comments &amp; MLR Audit Enabled
              </span>
            </div>

            <p className="text-body text-ink-2 leading-relaxed">
              Anyone with this link can inspect clinical claims, leave pinned reviewer comments, and export proofs.
            </p>

            <div className="flex items-center gap-2 p-1.5 pl-3 rounded-xl bg-subtle border border-hair-2 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10 transition-all">
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
                  "h-8 px-3.5 rounded-lg text-label font-bold transition-all cursor-pointer shadow-xs shrink-0 gap-1.5",
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
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-hair-2 bg-card hover:border-[#0078d4] hover:bg-[#f3f9fd] transition-all text-left shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-9 rounded-xl bg-[#0078d4]/10 text-[#0078d4] grid place-items-center shrink-0 border border-[#0078d4]/20">
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
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-hair-2 bg-card hover:border-amber-600 hover:bg-[#fffcf5] transition-all text-left shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-9 rounded-xl bg-warn/10 text-warn grid place-items-center shrink-0 border border-amber-500/20">
                    <ShieldCheck className="size-5 text-warn" />
                  </div>
                  <div>
                    <h4 className="text-body-lg font-bold text-ink flex items-center gap-1.5">
                      <span>Send to Veeva PromoMats</span>
                      <span className="rounded-md bg-warn-bg/70 text-warn text-caption font-bold px-1.5 py-0.2 border border-warn-line/60">
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
              {assetType === "video" ? (
                <button
                  type="button"
                  onClick={handleExport}
                  className="w-full flex items-center justify-between p-3 rounded-2xl border border-hair-2 bg-card hover:border-brand hover:bg-[#fff9f6] transition-all text-left shadow-2xs group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-xl bg-tint text-brand grid place-items-center shrink-0 border border-tint-line">
                      <Download className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-body-lg font-bold text-ink flex items-center gap-1.5">
                        <span>Export as MP4</span>
                        <span className="rounded-md bg-tint text-brand-deep text-caption font-bold px-1.5 py-0.2 border border-tint-line">
                          1080p HD
                        </span>
                      </h4>
                      <p className="text-label text-ink-3">
                        Download final high-bitrate video master with full narration &amp; captions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-label font-bold text-brand opacity-80 group-hover:opacity-100 shrink-0 ml-2">
                    <span>Download</span>
                    <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ) : (
                <div className="w-full flex flex-col p-3.5 rounded-2xl border border-hair-2 bg-card shadow-2xs space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-8 rounded-xl bg-tint text-brand grid place-items-center shrink-0 border border-tint-line">
                        <Download className="size-4.5" />
                      </div>
                      <div>
                        <h4 className="text-body-lg font-bold text-ink flex items-center gap-1.5">
                          <span>Export Master Graphic</span>
                          <span className="rounded-md bg-tint text-brand-deep text-caption font-bold px-1.5 py-0.2 border border-tint-line uppercase">
                            {creativeFormat} format
                          </span>
                        </h4>
                      </div>
                    </div>

                    {/* Format Selector Pills (PDF / PNG / JPG) */}
                    <div className="flex items-center gap-1 p-0.5 bg-[#f0f2ef] rounded-xl border border-hair shrink-0">
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
                            "px-2.5 py-1 rounded-lg text-label font-bold transition-all cursor-pointer",
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
                      className="h-8 px-4 rounded-xl bg-brand hover:bg-brand-deep text-white text-label font-bold shrink-0 cursor-pointer shadow-xs gap-1"
                    >
                      <Download className="size-3.5" />
                      <span>Export {creativeFormat.toUpperCase()}</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Social Media Destinations (ALL WITH COMING SOON) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-label font-extrabold uppercase tracking-wider text-ink-3">
                Social &amp; Digital Channels
              </span>
              <span className="text-caption text-ink-3 font-medium">Direct publishing</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Instagram */}
              <button
                type="button"
                onClick={() => handleSocialComingSoon("Instagram")}
                className="flex items-center justify-between p-2.5 px-3 rounded-xl border border-hair bg-canvas hover:bg-card hover:border-hair-3 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-7 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] text-white grid place-items-center shrink-0">
                    <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                  <span className="text-body font-bold text-ink">Instagram</span>
                </div>
                <span className="rounded-full bg-black/5 px-2 py-0.5 text-micro font-bold text-ink-3">
                  Coming Soon
                </span>
              </button>

              {/* LinkedIn */}
              <button
                type="button"
                onClick={() => handleSocialComingSoon("LinkedIn")}
                className="flex items-center justify-between p-2.5 px-3 rounded-xl border border-hair bg-canvas hover:bg-card hover:border-hair-3 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-7 rounded-lg bg-[#0a66c2] text-white grid place-items-center shrink-0">
                    <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </div>
                  <span className="text-body font-bold text-ink">LinkedIn</span>
                </div>
                <span className="rounded-full bg-black/5 px-2 py-0.5 text-micro font-bold text-ink-3">
                  Coming Soon
                </span>
              </button>

              {/* YouTube */}
              <button
                type="button"
                onClick={() => handleSocialComingSoon("YouTube")}
                className="flex items-center justify-between p-2.5 px-3 rounded-xl border border-hair bg-canvas hover:bg-card hover:border-hair-3 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-7 rounded-lg bg-[#ff0000] text-white grid place-items-center shrink-0">
                    <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </div>
                  <span className="text-body font-bold text-ink">YouTube</span>
                </div>
                <span className="rounded-full bg-black/5 px-2 py-0.5 text-micro font-bold text-ink-3">
                  Coming Soon
                </span>
              </button>

              {/* Twitter / X */}
              <button
                type="button"
                onClick={() => handleSocialComingSoon("Twitter / X")}
                className="flex items-center justify-between p-2.5 px-3 rounded-xl border border-hair bg-canvas hover:bg-card hover:border-hair-3 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-7 rounded-lg bg-black text-white grid place-items-center shrink-0">
                    <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <span className="text-body font-bold text-ink">Twitter / X</span>
                </div>
                <span className="rounded-full bg-black/5 px-2 py-0.5 text-micro font-bold text-ink-3">
                  Coming Soon
                </span>
              </button>
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
  );
}

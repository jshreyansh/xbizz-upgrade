"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Video, Image as ImageIcon, LayoutGrid, ArrowRight } from "lucide-react";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { PERSONA, SAMPLE_VIDEOS, SAMPLE_CANVAS } from "@/features/workspace/mock-personas";
import type { SampleAsset } from "@/features/workspace/mock-personas";

/* ── Core USP strip ───────────────────────────────────────────────────
   The footer of the unified creation panel. No CTA, no progress —
   just the platform's core value props, quiet and consistent for
   every visitor. */
const CORE_USPS: [string, string][] = [
  ["40+", "regulatory markets"],
  ["5", "AI co-workers"],
  ["32", "content formats"],
  ["0", "uncited claims"],
];

function CoreUspStrip() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
      {CORE_USPS.map(([val, label]) => (
        <span key={label} style={{ fontSize: 13, color: "var(--ink-2)" }}>
          <b style={{ fontWeight: 800, color: "var(--ink)" }}>{val}</b> {label}
        </span>
      ))}
    </div>
  );
}

/* ── Reel card ──────────────────────────────────────────────────── */
function ReelCard({ asset, onOpen, compact = false }: { asset: SampleAsset; onOpen: () => void; compact?: boolean }) {
  const width = compact ? 108 : asset.type === "video" ? 172 : 188;
  return (
    <button
      onClick={onOpen}
      style={{
        position: "relative",
        borderRadius: compact ? "var(--r)" : "var(--r-l)",
        overflow: "hidden",
        aspectRatio: asset.type === "video" ? "9/16" : "4/5",
        background: asset.gradient,
        border: "none",
        cursor: "pointer",
        flex: "0 0 auto",
        width,
        boxShadow: compact ? "none" : "0 14px 28px -14px rgba(10,13,20,.35)",
        transition: "transform .2s var(--e), box-shadow .2s var(--e)",
      }}
      className={compact ? "" : "hover:-translate-y-1 hover:shadow-[0_20px_36px_-16px_rgba(10,13,20,.45)]"}
    >
      {/* Shade */}
      <span style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 45%,rgba(0,0,0,.7))" }} />
      {!compact && (
        <>
          {/* Engine tag */}
          <span style={{ position: "absolute", top: 10, right: 10, fontSize: 9.5, fontWeight: 800, background: "rgba(0,0,0,.5)", color: "rgba(255,255,255,.85)", padding: "3px 7px", borderRadius: 5 }}>{asset.engine}</span>
          {/* Duration */}
          <span style={{ position: "absolute", bottom: 46, right: 10, fontSize: 10, fontWeight: 700, background: "rgba(0,0,0,.55)", color: "#fff", padding: "3px 7px", borderRadius: 5 }}>{asset.duration}</span>
        </>
      )}
      {/* Play button for videos */}
      {asset.type === "video" && (
        <span style={{ position: "absolute", top: compact ? "42%" : "38%", left: "50%", transform: "translate(-50%,-50%)", width: compact ? 28 : 36, height: compact ? 28 : 36, borderRadius: "50%", background: "rgba(255,255,255,.9)", display: "grid", placeItems: "center" }}>
          <svg viewBox="0 0 24 24" fill="#0d1017" width={compact ? 11 : 14} height={compact ? 11 : 14}><path d="M6 4l14 8-14 8z" /></svg>
        </span>
      )}
      {/* Meta */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: compact ? "8px 9px" : "10px 12px" }}>
        <b style={{ display: "block", fontSize: compact ? 10.5 : 12.5, color: "#fff", fontWeight: 750, marginBottom: compact ? 1 : 3, letterSpacing: "-.2px", textAlign: "left", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {asset.title.split(" — ")[0]}
        </b>
        {!compact && (
          <span style={{ fontSize: 10.5, color: "rgba(255,255,255,.65)", display: "block", textAlign: "left" }}>{asset.audience} · {asset.market}</span>
        )}
      </div>
    </button>
  );
}

/* ── Creation option card ──────────────────────────────────────────
   Quick-start entry points shown below the hero. */
interface CreationOption {
  icon: typeof Sparkles;
  title: string;
  description: string;
  cta: string;
  href: string;
  soon?: boolean;
}

const CREATION_OPTIONS: CreationOption[] = [
  {
    icon: Sparkles,
    title: "Start creating",
    description: "Bring a brand or a brief — SwishX picks the right format.",
    cta: "Get started",
    href: "/dossiers",
  },
  {
    icon: Video,
    title: "Video",
    description: "Cited, narrated reels built from your dossier.",
    cta: "Open",
    href: "/create",
  },
  {
    icon: ImageIcon,
    title: "Infographic",
    description: "One-page visual aids for reps, congress, or the field.",
    cta: "Open",
    href: "#",
    soon: true,
  },
  {
    icon: LayoutGrid,
    title: "Canvas",
    description: "Print and digital layouts — ads, leave-behinds, banners.",
    cta: "Open",
    href: "#",
    soon: true,
  },
];

/* Every option gets the same quiet treatment — no flagship, no CTA
   button competing for attention. The core USPs do the selling. */
function CreationOptionCard({ option, onOpen }: { option: CreationOption; onOpen: () => void }) {
  const Icon = option.icon;
  return (
    <button
      onClick={onOpen}
      disabled={option.soon}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 10,
        padding: 20,
        borderRadius: "var(--r-l)",
        textAlign: "left",
        cursor: option.soon ? "default" : "pointer",
        opacity: option.soon ? 0.6 : 1,
        transition: "background .18s var(--e)",
      }}
      className={option.soon ? "" : "hover:bg-[var(--surface-subtle)]"}
    >
      <span
        style={{
          display: "grid",
          placeItems: "center",
          width: 36,
          height: 36,
          borderRadius: 10,
          flexShrink: 0,
          background: "var(--tint)",
          color: "var(--brand)",
        }}
      >
        <Icon size={17} />
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <b style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-.3px" }}>{option.title}</b>
        {option.soon && (
          <span style={{ fontSize: 9, letterSpacing: ".07em", background: "rgba(10,13,20,.06)", color: "var(--ink-4)", padding: "2px 6px", borderRadius: 5, fontWeight: 800 }}>SOON</span>
        )}
      </div>
      <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{option.description}</p>
      {!option.soon && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 700, color: "var(--brand)" }}>
          {option.cta} <ArrowRight size={13} />
        </span>
      )}
    </button>
  );
}

/* ── Asset lightbox ─────────────────────────────────────────────── */
function AssetLightbox({ asset, onClose }: { asset: SampleAsset; onClose: () => void }) {
  const router = useRouter();
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(6,7,10,.78)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 99, backdropFilter: "blur(6px)", animation: "modal-backdrop-in 200ms both",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex", gap: 0, borderRadius: "var(--r-xl)",
          overflow: "hidden", background: "#fff", boxShadow: "var(--sh-4)",
          maxWidth: 820, width: "90vw",
        }}
      >
        {/* Player side */}
        <div
          style={{
            position: "relative",
            flex: asset.type === "video" ? "0 0 340px" : "0 0 280px",
            background: asset.gradient,
            minHeight: 440,
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 42%,rgba(6,7,10,.75))" }} />
          <div style={{ position: "absolute", top: 14, right: 14, padding: "6px 10px", background: "#fff", borderRadius: 7, fontSize: 9, fontWeight: 800, color: "#243b6b", textAlign: "center", lineHeight: 1.3 }}>Meridian<br />Tx</div>
          <div style={{ position: "absolute", inset: "0 0 80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {asset.type === "video" && (
              <div style={{ width: 54, height: 54, borderRadius: "50%", background: "rgba(255,255,255,.9)", display: "grid", placeItems: "center" }}>
                <svg viewBox="0 0 24 24" fill="#0d1017" width={20} height={20}><path d="M6 4l14 8-14 8z" /></svg>
              </div>
            )}
          </div>
        </div>
        {/* Detail side */}
        <div style={{ flex: 1, padding: "32px 28px", overflowY: "auto" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 18, right: 18, width: 36, height: 36, borderRadius: "50%", background: "rgba(10,13,20,.08)", display: "grid", placeItems: "center" }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
          <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-4)", fontWeight: 750, marginBottom: 8 }}>{asset.engine} · {asset.market}</div>
          <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, letterSpacing: "-.6px" }}>{asset.title}</h3>
          <p style={{ margin: "0 0 20px", fontSize: 13.5, color: "var(--ink-3)", lineHeight: 1.6 }}>{asset.description}</p>
          {[
            ["Audience", asset.audience],
            [asset.type === "video" ? "Runtime" : "Format", asset.duration],
            ["Regulatory anchor", asset.market],
            ["On-screen citations", "Yes"],
            ["Claims cited", "Every line"],
            ["Status", "Approved · live"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--hair)", fontSize: 13.5 }}>
              <span style={{ color: "var(--ink-3)" }}>{k}</span>
              <b>{v}</b>
            </div>
          ))}
          <button
            onClick={() => {
              onClose();
              useWorkspaceStore.getState().setView("create");
              useWorkspaceStore.getState().setVideoSubStage("mode-select");
              router.push("/create");
            }}
            style={{ display: "inline-flex", alignItems: "center", gap: 9, marginTop: 22, width: "100%", justifyContent: "center", padding: "13px", borderRadius: "var(--r)", fontWeight: 680, fontSize: 14.5, background: "linear-gradient(180deg,#ff5b2d,var(--brand))", color: "#fff", boxShadow: "0 12px 26px -14px rgba(253,72,22,.9)", cursor: "pointer" }}
          >
            Make one like this
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Home Screen ────────────────────────────────────────────────── */
export function HomeScreen() {
  const router = useRouter();
  const [lightboxAsset, setLightboxAsset] = useState<SampleAsset | null>(null);

  const openOption = (option: CreationOption) => {
    if (option.soon) return;
    if (option.href === "/create") {
      useWorkspaceStore.getState().setView("create");
      useWorkspaceStore.getState().setVideoSubStage("mode-select");
    }
    router.push(option.href);
  };

  return (
    <div className="page-enter">
      {/* ── Hero ────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 640, marginBottom: 30 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: "var(--ink-3)" }}>
            <i style={{ width: 6, height: 6, borderRadius: "50%", background: "#0d9488", boxShadow: "0 0 8px rgba(13,148,136,.5)", display: "block", animation: "blink 2s infinite" }} />
            Workspace live
          </span>
          <span style={{ fontSize: 12.5, color: "var(--ink-4)", fontWeight: 500 }}>
            Tuesday, 18 August · {PERSONA.org}
          </span>
        </div>

        <h1
          style={{
            fontSize: "clamp(28px,2.8vw,38px)",
            lineHeight: 1.15,
            fontWeight: 800,
            letterSpacing: "-1.4px",
            margin: "0 0 12px",
            background: "linear-gradient(96deg, var(--ink) 0%, var(--brand-deep) 55%, var(--brand) 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Welcome back, welcome {PERSONA.firstName}, and let’s create something.
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink-3)", margin: 0, maxWidth: "50ch" }}>
          Your team wrote, checked and shipped from your dossiers overnight — <b style={{ color: "var(--ink)" }}>zero uncited claims</b>. Pick up where they left off, or{" "}
          <button style={{ color: "var(--ink)", fontWeight: 700, textDecoration: "underline", textDecorationColor: "var(--hair-3)", textUnderlineOffset: 3 }}>
            take the 90s tour
          </button>.
        </p>
      </div>

      {/* ── Unified creation panel — equal options, one surface ─── */}
      <div style={{ background: "#fff", borderRadius: "var(--r-xl)", border: "1px solid var(--hair)", boxShadow: "var(--sh-1)", marginBottom: 24, overflow: "hidden" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1" style={{ padding: 22 }}>
          {CREATION_OPTIONS.map((option) => (
            <CreationOptionCard key={option.title} option={option} onOpen={() => openOption(option)} />
          ))}
        </div>
        <div style={{ borderTop: "1px solid var(--hair)", background: "var(--surface-subtle)", padding: "14px 22px" }}>
          <CoreUspStrip />
        </div>
      </div>

      {/* ── Magic Video · Magic Canvas showcase ─────────────────── */}
      <div style={{ background: "#fff", borderRadius: "var(--r-xl)", border: "1px solid var(--hair)", boxShadow: "var(--sh-1)", padding: 22 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
          <div>
            <span style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 800, color: "var(--brand)" }}>
              Magic Video · Magic Canvas
            </span>
            <b style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-.3px", display: "block", marginTop: 3 }}>See what your team already shipped</b>
            <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "var(--ink-3)" }}>Every reel and layout below is cited, MLR-cleared, and ready to reuse.</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {[...SAMPLE_VIDEOS.slice(0, 3), ...SAMPLE_CANVAS.slice(0, 2)].map((asset, i) => (
            <ReelCard key={i} asset={asset} onOpen={() => setLightboxAsset(asset)} />
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxAsset && (
        <AssetLightbox asset={lightboxAsset} onClose={() => setLightboxAsset(null)} />
      )}
    </div>
  );
}

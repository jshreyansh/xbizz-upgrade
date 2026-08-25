"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { PERSONA, MESSAGES, SAMPLE_VIDEOS, SAMPLE_CANVAS, TEAM } from "@/features/workspace/mock-personas";
import type { SampleAsset } from "@/features/workspace/mock-personas";

/* ── Hero Banner (hb3) ──────────────────────────────────────────── */
function HeroAurora() {
  return (
    <div className="pointer-events-none absolute inset-[-40%]" style={{ filter: "blur(70px)", opacity: 0.75 }}>
      {[
        { size: "60vw", left: "-8%", top: "-18%", bg: "radial-gradient(circle,rgba(253,72,22,.2),transparent 58%)" },
        { size: "40vw", left: "42%", top: "12%",  bg: "radial-gradient(circle,rgba(255,142,76,.16),transparent 60%)", delay: "-7s" },
        { size: "30vw", left: "14%", top: "52%",  bg: "radial-gradient(circle,rgba(139,30,10,.16),transparent 62%)", delay: "-13s" },
      ].map((b, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            width: b.size, height: b.size, left: b.left, top: b.top,
            background: b.bg, mixBlendMode: "multiply",
            animation: `float 20s ease-in-out infinite alternate${b.delay ? ` ${b.delay}` : ""}`,
          }}
        />
      ))}
    </div>
  );
}

function HeroMesh() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          "radial-gradient(circle,rgba(253,72,22,.12) 1px,transparent 1px)",
        backgroundSize: "28px 28px",
        opacity: 0.7,
      }}
    />
  );
}

/* ── Messages panel ─────────────────────────────────────────────── */
function MessagesPanel() {
  const toggleTeamDock = useWorkspaceStore((s) => s.toggleTeamDock);
  const unreadCount = MESSAGES.filter((m) => m.unread).length;
  return (
    <div
      style={{
        background: "rgba(255,255,255,.7)",
        backdropFilter: "blur(22px)",
        borderRadius: "var(--r-l)",
        border: "1px solid var(--hair)",
        overflow: "hidden",
        boxShadow: "var(--sh-2)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "15px 18px 12px", borderBottom: "1px solid var(--hair)" }}>
        <b style={{ fontSize: 14.5, fontWeight: 720 }}>Messages</b>
        {unreadCount > 0 && (
          <span style={{ fontSize: 11.5, fontWeight: 750, background: "var(--brand)", color: "#fff", padding: "2px 8px", borderRadius: 99 }}>
            {unreadCount} new
          </span>
        )}
        <button
          onClick={toggleTeamDock}
          style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--brand)", fontWeight: 650, cursor: "pointer" }}
        >
          Open session →
        </button>
      </div>

      <div>
        {MESSAGES.map((msg, i) => {
          const member = TEAM.find((t) => t.key === msg.memberKey)!;
          return (
            <div
              key={i}
              onClick={toggleTeamDock}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 11,
                padding: "13px 18px",
                borderBottom: i < MESSAGES.length - 1 ? "1px solid var(--hair)" : "none",
                background: msg.unread ? "rgba(253,72,22,.03)" : "transparent",
                cursor: "pointer",
              }}
              className="hover:bg-black/[0.02]"
            >
              <span
                style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: member.gradient, display: "grid", placeItems: "center",
                  color: "#fff", fontSize: 11, fontWeight: 800,
                }}
              >
                {member.initials}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  {msg.unread && (
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--brand)", display: "block", flexShrink: 0 }} />
                  )}
                  <b style={{ fontSize: 13, flex: 1 }}>{msg.memberName}</b>
                  <span style={{ fontSize: 11.5, color: "var(--ink-4)", flexShrink: 0 }}>{msg.time}</span>
                </div>
                <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  {msg.text}
                </p>
              </div>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" strokeWidth={2.4} strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M9 6l6 6-6 6" /></svg>
            </div>
          );
        })}
      </div>

      <div style={{ padding: "11px 16px", borderTop: "1px solid var(--hair)" }}>
        <button
          onClick={toggleTeamDock}
          style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "11px 14px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", background: "#fff", color: "var(--ink-3)", fontSize: 13.5, cursor: "pointer" }}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.6-.7L3 21l1.9-5a8.3 8.3 0 0 1-.9-3.8A8.4 8.4 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5z" /></svg>
          Message your team…
          <span style={{ marginLeft: "auto", fontSize: 10.5, fontWeight: 700, color: "var(--ink-4)", padding: "2px 6px", border: "1px solid var(--hair-2)", borderRadius: 5 }}>⌘J</span>
        </button>
      </div>
    </div>
  );
}

/* ── Getting-started rail ────────────────────────────────────────── */
function GettingStarted() {
  const router = useRouter();
  const steps = [
    { label: "Build your first dossier", href: "/dossiers", done: false },
    { label: "Create a Magic Video", href: "/create", done: false },
    { label: "Send for review", href: "/create", done: false },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 24 }}>
      {steps.map((step, i) => (
        <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <button
            onClick={() => router.push(step.href)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "9px 14px",
              borderRadius: "var(--r)",
              border: "1px solid rgba(255,255,255,.35)",
              background: step.done ? "rgba(255,255,255,.3)" : "rgba(255,255,255,.14)",
              backdropFilter: "blur(10px)",
              fontSize: 13,
              fontWeight: 650,
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                width: 20, height: 20, borderRadius: "50%",
                background: step.done ? "var(--ok)" : "rgba(255,255,255,.25)",
                display: "grid", placeItems: "center",
                fontSize: 10, fontWeight: 800, color: "#fff",
              }}
            >
              {step.done ? (
                <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l6 6L20 5" /></svg>
              ) : i + 1}
            </span>
            {step.label.replace("Build your ", "").replace("Create a ", "").replace("Send for ", "")}
          </button>
          {i < 2 && <span style={{ width: 18, height: 1, background: "rgba(255,255,255,.3)", display: "block" }} />}
        </div>
      ))}
      <span style={{ fontSize: 12, color: "rgba(255,255,255,.54)", marginLeft: 4 }}>0 of 3</span>
    </div>
  );
}

/* ── Reel card ──────────────────────────────────────────────────── */
function ReelCard({ asset, onOpen }: { asset: SampleAsset; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      style={{
        position: "relative",
        borderRadius: "var(--r-l)",
        overflow: "hidden",
        aspectRatio: asset.type === "video" ? "9/16" : "4/5",
        background: asset.gradient,
        border: "none",
        cursor: "pointer",
        flex: "0 0 auto",
        width: asset.type === "video" ? 160 : 175,
      }}
    >
      {/* Shade */}
      <span style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 45%,rgba(0,0,0,.7))" }} />
      {/* Engine tag */}
      <span style={{ position: "absolute", top: 10, right: 10, fontSize: 9.5, fontWeight: 800, background: "rgba(0,0,0,.5)", color: "rgba(255,255,255,.85)", padding: "3px 7px", borderRadius: 5 }}>{asset.engine}</span>
      {/* Duration */}
      <span style={{ position: "absolute", bottom: 46, right: 10, fontSize: 10, fontWeight: 700, background: "rgba(0,0,0,.55)", color: "#fff", padding: "3px 7px", borderRadius: 5 }}>{asset.duration}</span>
      {/* Play button for videos */}
      {asset.type === "video" && (
        <span style={{ position: "absolute", top: "38%", left: "50%", transform: "translate(-50%,-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.9)", display: "grid", placeItems: "center" }}>
          <svg viewBox="0 0 24 24" fill="#0d1017" width={14} height={14}><path d="M6 4l14 8-14 8z" /></svg>
        </span>
      )}
      {/* Meta */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 12px" }}>
        <b style={{ display: "block", fontSize: 12.5, color: "#fff", fontWeight: 750, marginBottom: 3, letterSpacing: "-.2px", textAlign: "left", lineHeight: 1.3 }}>
          {asset.title.split(" — ")[0]}
        </b>
        <span style={{ fontSize: 10.5, color: "rgba(255,255,255,.65)", display: "block", textAlign: "left" }}>{asset.audience} · {asset.market}</span>
      </div>
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
type GalTab = "all" | "video" | "canvas";

export function HomeScreen() {
  const router = useRouter();
  const isFirstRun = useWorkspaceStore((s) => s.isFirstRun);
  const [galTab, setGalTab] = useState<GalTab>("all");
  const [lightboxAsset, setLightboxAsset] = useState<SampleAsset | null>(null);

  const galVideos = SAMPLE_VIDEOS;
  const galCanvas = SAMPLE_CANVAS;
  const galAll = [...galVideos, ...galCanvas];
  const displayAssets = galTab === "video" ? galVideos : galTab === "canvas" ? galCanvas : galAll;

  return (
    <div className="page-enter">
      {/* ── hb3 Hero ────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          borderRadius: "var(--r-xl)",
          overflow: "hidden",
          background: "linear-gradient(155deg,#0e1219 0%,#18121c 38%,#1a1008 72%,#0d1217 100%)",
          padding: "38px 38px 40px",
          marginBottom: 22,
        }}
      >
        <HeroAurora />
        <HeroMesh />

        {/* 2-col grid */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: 28,
            alignItems: "start",
          }}
        >
          {/* Left */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,.7)" }}>
                <i style={{ width: 6, height: 6, borderRadius: "50%", background: "#5eead4", boxShadow: "0 0 8px #5eead4", display: "block", animation: "blink 2s infinite" }} />
                Workspace live
              </span>
              <span style={{ fontSize: 12.5, color: "rgba(255,255,255,.38)", fontWeight: 500 }}>
                Tuesday, 18 August · {PERSONA.org}
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(28px,2.8vw,38px)",
                lineHeight: 1.1,
                fontWeight: 800,
                letterSpacing: "-1.4px",
                margin: "0 0 10px",
                color: "#fff",
              }}
            >
              Good morning, {PERSONA.firstName}.<br />
              <span
                style={{
                  background: "linear-gradient(96deg,#ffd9c7,#ff8a5c 46%,#ffcfb8)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Your team has been busy.
              </span>
            </h1>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,.68)", margin: "0 0 22px", maxWidth: "50ch" }}>
              Five co-workers wrote, checked and shipped from your dossiers overnight — <b style={{ color: "#fff" }}>zero uncited claims</b>.
            </p>

            {/* CTA row */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  if (isFirstRun) {
                    router.push("/dossiers");
                  } else {
                    useWorkspaceStore.getState().setView("create");
                    router.push("/create");
                  }
                }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 9,
                  padding: "12px 22px", borderRadius: "var(--r)", fontWeight: 680, fontSize: 14.5,
                  background: "linear-gradient(180deg,#ff5b2d,var(--brand))", color: "#fff",
                  boxShadow: "0 12px 26px -14px rgba(253,72,22,.9),inset 0 1px 0 rgba(255,255,255,.28)",
                  cursor: "pointer",
                }}
              >
                {isFirstRun ? "Build my first dossier" : "Create a Magic Video"}
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
              <button style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 18px", borderRadius: "var(--r)", fontWeight: 650, fontSize: 14, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", backdropFilter: "blur(8px)" }}>
                Take the tour
                <kbd style={{ fontSize: 11, background: "rgba(255,255,255,.15)", padding: "2px 6px", borderRadius: 5 }}>90s</kbd>
              </button>
            </div>

            {isFirstRun ? <GettingStarted /> : (
              <div style={{ display: "flex", gap: 28, marginTop: 24 }}>
                {[["4", "markets live"], ["32", "formats"], ["0", "uncited claims"]].map(([val, label]) => (
                  <div key={label}>
                    <b style={{ display: "block", fontSize: 22, fontWeight: 800, letterSpacing: "-.8px", color: "#fff" }}>{val}</b>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,.45)" }}>{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: messages */}
          <MessagesPanel />
        </div>
      </div>

      {/* ── Demo Library ────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderRadius: "var(--r-xl)", border: "1px solid var(--hair)", overflow: "hidden", boxShadow: "var(--sh-1)" }}>
        {/* Card header */}
        <div style={{ padding: "24px 26px 0", display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-4)", fontWeight: 800, marginBottom: 5 }}>Demo library</div>
            <b style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-.6px", display: "block" }}>See what SwishX ships</b>
            <p style={{ margin: "5px 0 0", fontSize: 13.5, color: "var(--ink-3)", lineHeight: 1.55, maxWidth: "58ch" }}>Open one to see the brief, voice and citations behind it.</p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 9, alignItems: "center" }}>
            {/* Tab chips */}
            <div style={{ display: "flex", gap: 6 }}>
              {(["all", "video", "canvas"] as GalTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setGalTab(tab)}
                  style={{
                    padding: "8px 14px", borderRadius: 99, fontSize: 13, fontWeight: 650,
                    background: galTab === tab ? "var(--ink)" : "#fff",
                    color: galTab === tab ? "#fff" : "var(--ink-2)",
                    border: `1px solid ${galTab === tab ? "var(--ink)" : "var(--hair-2)"}`,
                    transition: ".18s var(--e)",
                  }}
                >
                  {tab === "all" ? "All 8" : tab === "video" ? "AI video 4" : "Canvas 4"}
                </button>
              ))}
            </div>
            <button style={{ padding: "8px 16px", borderRadius: "var(--r)", fontSize: 13, fontWeight: 650, background: "#fff", border: "1px solid var(--hair-2)", color: "var(--ink-2)" }}>View all 24</button>
          </div>
        </div>

        {/* Gallery */}
        <div style={{ padding: "16px 26px 26px", display: "flex", flexWrap: "wrap", gap: 12 }}>
          {displayAssets.map((asset, i) => (
            <ReelCard key={`${asset.type}-${i}`} asset={asset} onOpen={() => setLightboxAsset(asset)} />
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

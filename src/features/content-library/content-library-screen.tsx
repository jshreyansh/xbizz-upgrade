"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Grid3x3, List, Film, Image as ImageIcon, MessageSquare, Eye, Play } from "lucide-react";
import { LIBRARY_ASSETS, type LibraryAsset } from "@/features/content-library/content-library-data";
import { demoScenarios } from "@/features/workspace/demo-scenarios";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";

/**
 * Published work, and the way back into it.
 *
 * Built to read like the Product Library because it is the same kind of
 * screen — a shelf of things you own — and two shelves that look different
 * teach the same person two layouts for one idea. No stat tiles and no create
 * button: nothing is authored here, and a count of assets is not a decision.
 *
 * Opening a row does not show a picture of the asset. It rebuilds that
 * project's real state from the brief it was made with and lands on its shared
 * review — the same screen the link in the email opens.
 */

const STATUS_STYLE: Record<LibraryAsset["status"], { bg: string; fg: string; line: string }> = {
  Published: { bg: "var(--ok-bg)", fg: "var(--ok)", line: "var(--ok-line)" },
  Approved: { bg: "var(--tint-2)", fg: "var(--brand-deep)", line: "var(--tint-line)" },
  "In MLR review": { bg: "#fff4e5", fg: "#b45309", line: "#fcd9a4" },
};

type KindFilter = "all" | "video" | "infographic";

export function ContentLibraryScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [kind, setKind] = useState<KindFilter>("all");

  const setAssetType = useWorkspaceStore((s) => s.setAssetType);
  const setDemoScenarioId = useWorkspaceStore((s) => s.setDemoScenarioId);
  const setStudioEntry = useWorkspaceStore((s) => s.setStudioEntry);
  const setView_ = useWorkspaceStore((s) => s.setView);
  const setVideoSubStage = useWorkspaceStore((s) => s.setVideoSubStage);
  const setBrief = useWorkspaceStore((s) => s.setBrief);
  const setAudience = useWorkspaceStore((s) => s.setAudience);
  const setMarket = useWorkspaceStore((s) => s.setMarket);
  const setIntendedUse = useWorkspaceStore((s) => s.setIntendedUse);
  const setSelectedSourceIds = useWorkspaceStore((s) => s.setSelectedSourceIds);
  const setProjectName = useWorkspaceStore((s) => s.setProjectName);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LIBRARY_ASSETS.filter((a) => {
      if (kind !== "all" && a.kind !== kind) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.brand.toLowerCase().includes(q) ||
        a.audience.toLowerCase().includes(q)
      );
    });
  }, [query, kind]);

  /* Rebuild the project this asset was made from, then open its review. */
  const openReview = (asset: LibraryAsset) => {
    const scenario = demoScenarios.find((s) => s.id === asset.scenarioId);
    if (scenario) {
      setBrief(scenario.inputs.brief);
      setAudience(scenario.inputs.audience);
      setMarket(scenario.inputs.market);
      setIntendedUse(scenario.inputs.intendedUse);
      setSelectedSourceIds(scenario.inputs.selectedSourceIds);
      setDemoScenarioId(scenario.id);
    }
    setProjectName(asset.title);
    setAssetType(asset.kind);
    setStudioEntry("review");
    setVideoSubStage("studio");
    setView_("studio");
    router.push("/create");
  };

  return (
    <div className="page-enter space-y-6">
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-1px", margin: "0 0 8px" }}>
          Content Library
        </h1>
        <p style={{ margin: 0, fontSize: 14.5, color: "var(--ink-3)", lineHeight: 1.6, maxWidth: "62ch" }}>
          Every asset you have published — open one to see exactly what the shared link shows, with
          the comments your reviewers left on it.
        </p>
      </div>

      {/* Search, kind filter, view toggle */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220, maxWidth: 420 }}>
          <Search size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--ink-4)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assets, brands or audiences…"
            style={{ width: "100%", padding: "10px 13px 10px 36px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", fontSize: 13.5, color: "var(--ink)", background: "#fff" }}
          />
        </div>

        <div style={{ display: "flex", border: "1px solid var(--hair-2)", borderRadius: "var(--r)", padding: 3, background: "var(--surface-subtle)", gap: 2 }}>
          {([
            { id: "all" as const, label: "All" },
            { id: "video" as const, label: "Video" },
            { id: "infographic" as const, label: "Doc & image" },
          ]).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setKind(opt.id)}
              style={{
                padding: "6px 12px",
                borderRadius: "calc(var(--r) - 3px)",
                border: "none",
                cursor: "pointer",
                fontSize: 12.5,
                fontWeight: 700,
                background: kind === opt.id ? "#fff" : "transparent",
                color: kind === opt.id ? "var(--brand-deep)" : "var(--ink-3)",
                boxShadow: kind === opt.id ? "var(--sh-1)" : "none",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", border: "1px solid var(--hair-2)", borderRadius: "var(--r)", padding: 3, background: "var(--surface-subtle)" }}>
          {([
            { id: "grid" as const, Icon: Grid3x3, label: "Grid view" },
            { id: "list" as const, Icon: List, label: "List view" },
          ]).map(({ id, Icon, label }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              aria-label={label}
              aria-pressed={view === id}
              style={{
                display: "grid",
                placeItems: "center",
                width: 32,
                height: 30,
                borderRadius: "calc(var(--r) - 3px)",
                border: "none",
                cursor: "pointer",
                background: view === id ? "#fff" : "transparent",
                color: view === id ? "var(--brand-deep)" : "var(--ink-4)",
                boxShadow: view === id ? "var(--sh-1)" : "none",
              }}
            >
              <Icon size={15} />
            </button>
          ))}
        </div>
      </div>

      <div
        style={
          view === "grid"
            ? { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }
            : { display: "flex", flexDirection: "column", gap: 10 }
        }
      >
        {filtered.map((a, i) => {
          const status = STATUS_STYLE[a.status];
          const KindIcon = a.kind === "video" ? Film : ImageIcon;
          return (
            <div
              key={a.id}
              onClick={() => openReview(a)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") openReview(a);
              }}
              className="group rise-in-stagger hover:-translate-y-1 transition-all duration-200"
              style={{
                background: "#fff",
                borderRadius: "var(--r-xl)",
                border: "1px solid var(--hair)",
                boxShadow: "var(--sh-1)",
                overflow: "hidden",
                cursor: "pointer",
                animationDelay: `${80 + i * 45}ms`,
                display: view === "list" ? "flex" : "block",
                alignItems: view === "list" ? "center" : undefined,
              }}
            >
              {/* The asset itself, not a coloured rectangle standing in for it.
                  A film plays its own reel and a deck shows the figure it leads
                  on — which is the only thing that tells two of these apart at
                  a glance. */}
              <div
                className="relative overflow-hidden"
                style={{
                  background: a.gradient,
                  height: view === "list" ? 64 : 168,
                  width: view === "list" ? 104 : "100%",
                  flexShrink: 0,
                }}
              >
                {a.videoSrc && <AssetVideo src={a.videoSrc} />}
                <span
                  aria-hidden
                  className="pointer-events-none absolute rounded-full"
                  style={{ width: "70%", height: "70%", right: "-10%", top: "-10%", background: "radial-gradient(circle,rgba(255,255,255,.22),transparent 70%)" }}
                />

                {/* A deck's own composition, at card size. */}
                {!a.videoSrc && a.metric && view !== "list" && (
                  <div className="pointer-events-none absolute inset-0 z-[1] flex flex-col justify-end p-3.5">
                    <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "rgba(255,255,255,.62)" }}>
                      {a.badge}
                    </span>
                    <span style={{ fontSize: 21, fontWeight: 900, letterSpacing: "-.6px", lineHeight: 1.1, color: "#fff", marginTop: 2 }}>
                      {a.metric}
                    </span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,.66)", marginTop: 3 }}>
                      {a.metricLabel}
                    </span>
                  </div>
                )}

                <span
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 12,
                    zIndex: 2,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                    color: "rgba(255,255,255,.9)",
                    background: "rgba(0,0,0,.4)",
                    backdropFilter: "blur(6px)",
                    padding: "3px 8px",
                    borderRadius: 99,
                  }}
                >
                  <KindIcon size={10} />
                  {a.kind === "video" ? "Video" : "Doc / image"}
                </span>

                <span
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 12,
                    zIndex: 2,
                    fontSize: 10,
                    fontWeight: 800,
                    color: "var(--ink)",
                    background: "rgba(255,255,255,.9)",
                    padding: "3px 8px",
                    borderRadius: 99,
                    display: view === "list" ? "none" : "block",
                  }}
                >
                  {a.spec}
                </span>

                {/* Preview is the whole point of the card, so the affordance
                    sits on the frame rather than in a menu. */}
                <span
                  className="pointer-events-none absolute inset-0 z-[3] grid place-items-center opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={{ background: "rgba(0,0,0,.34)" }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: view === "list" ? "5px 10px" : "8px 14px",
                      borderRadius: 99,
                      background: "#fff",
                      color: "var(--brand-deep)",
                      fontWeight: 800,
                      fontSize: view === "list" ? 11 : 12.5,
                      boxShadow: "0 8px 22px -10px rgba(0,0,0,.6)",
                    }}
                  >
                    <Play size={view === "list" ? 11 : 13} fill="currentColor" />
                    Preview
                  </span>
                </span>
              </div>

              <div
                style={{
                  padding: view === "list" ? "10px 16px" : "13px 16px 15px",
                  flex: view === "list" ? 1 : undefined,
                  display: view === "list" ? "flex" : "block",
                  alignItems: view === "list" ? "center" : undefined,
                  justifyContent: view === "list" ? "space-between" : undefined,
                  gap: 16,
                  minWidth: 0,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <b style={{ display: "block", fontSize: 15, fontWeight: 800, color: "var(--ink)", letterSpacing: "-.2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {a.title}
                  </b>
                  <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>
                    {a.brand} · {a.audience}
                  </span>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: view === "list" ? 0 : "10px 0" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: status.bg, color: status.fg, border: `1px solid ${status.line}` }}>
                    {a.status}
                  </span>
                  {/* In grid the spec rides on the frame; here is where it
                      lives when there is no frame to ride on. */}
                  {view === "list" && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: "var(--surface-subtle)", color: "var(--ink-3)", border: "1px solid var(--hair)" }}>
                      {a.spec}
                    </span>
                  )}
                </div>

                {view !== "list" && <div style={{ height: 1, background: "var(--hair)", margin: "10px 0" }} />}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, fontSize: 12, color: "var(--ink-4)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 10, whiteSpace: "nowrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Eye size={12} /> {a.views}
                    </span>
                    {a.comments > 0 && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--brand)" , fontWeight: 700 }}>
                        <MessageSquare size={12} /> {a.comments}
                      </span>
                    )}
                    {view !== "list" && <span>{a.updated}</span>}
                  </span>
                  <span
                    className="group-hover:gap-2"
                    style={{ color: "var(--brand)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4, transition: "gap .2s var(--e)", whiteSpace: "nowrap" }}
                  >
                    Open review →
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--ink-4)", fontSize: 14 }}>
          No assets match &ldquo;{query}&rdquo;.
        </div>
      )}
    </div>
  );
}

/**
 * A still that moves when you point at it.
 *
 * Eight reels looping at once is a noisy wall and a lot of decoding for a
 * screen people scan — and the browser pauses background video anyway, so the
 * motion was never dependable. The first frame is what identifies the asset;
 * the motion is what confirms it, and that is worth exactly the moment you
 * hover.
 */
function AssetVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  // The hover lives on a wrapper, not on the video: the Preview scrim sits
  // over the frame, and a pointer that lands on it is still a pointer on this
  // card.
  return (
    <span
      className="absolute inset-0"
      onMouseEnter={() => void ref.current?.play().catch(() => {})}
      onMouseLeave={() => ref.current?.pause()}
    >
      <video
        ref={ref}
        src={src}
        loop
        muted
        playsInline
        preload="auto"
        // Nudged off zero so a frame is decoded and painted: a video parked at
        // 0 with no poster renders as an empty box in some browsers.
        onLoadedData={(e) => {
          if (e.currentTarget.currentTime === 0) e.currentTarget.currentTime = 0.1;
        }}
        className="pointer-events-none h-full w-full object-cover opacity-85"
      />
    </span>
  );
}

"use client";

/**
 * Home Screen — Next (experimental)
 * ──────────────────────────────────────────────────────────────────
 * A separate, from-scratch pass at the home experience. Deliberately
 * NOT wired into the production Home route or shared mock data — it
 * lives at /home-next so it can be reviewed on its own and merged
 * into home-screen.tsx later, once it's settled.
 *
 * What's different from the current Home:
 *  - Much shorter hero copy, no "take the tour" link.
 *  - Creation options renamed to match the sidebar's Magic branding,
 *    each with its own colored gradient icon instead of one flat tint.
 *  - A showcase strip spanning Magic Video · Magic Canvas · Magic
 *    Website (a new sample category, local to this file).
 *  - A first-time / returning toggle so both experiences can be
 *    compared side by side before deciding what ships.
 *  - Small entrance + hover micro-animations throughout.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WandSparkles, Clapperboard, LayoutTemplate, BarChart3, ArrowRight, Play } from "lucide-react";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { PERSONA } from "@/features/workspace/mock-personas";

/* ── Local demo data — intentionally not shared with the production
   home screen, so this stays a genuinely separate experience. ───── */
interface ShowcaseAsset {
  type: "video" | "canvas" | "website";
  title: string;
  brand: string;
  engine: string;
  meta: string;
  audience: string;
  gradient: string;
}

const SHOWCASE: ShowcaseAsset[] = [
  { type: "video", title: "MOA in 45 seconds", brand: "Velmora", engine: "Video", meta: "0:45", audience: "Cardiologists · US", gradient: "linear-gradient(160deg,#1b2a4a,#2f4a7d 45%,#5b7fb8)" },
  { type: "video", title: "Digital twin explainer", brand: "Dr. Alvarez", engine: "Avatar Video", meta: "0:58", audience: "Patients · US", gradient: "linear-gradient(160deg,#4a2a1b,#7d4c2f 46%,#b8865b)" },
  { type: "canvas", title: "Journal advert", brand: "Velmora", engine: "Infographic", meta: "A4 · print", audience: "Cardiologists · US", gradient: "linear-gradient(150deg,#16233f,#2c4573 50%,#5b7fb8)" },
  { type: "website", title: "HCP microsite", brand: "Nirvexa", engine: "Web Experience", meta: "6 pages", audience: "Payers · UK", gradient: "linear-gradient(150deg,#12332c,#1d5a4a 50%,#3f9c7f)" },
  { type: "canvas", title: "Congress booth panel", brand: "Onkavia", engine: "Infographic", meta: "2×1m", audience: "Oncologists · EU", gradient: "linear-gradient(150deg,#33193f,#5b2c70 50%,#9a63bc)" },
];

interface CreationOption {
  icon: typeof WandSparkles;
  title: string;
  description: string;
  href: string;
  gradient: string;
  soon?: boolean;
}

const CREATION_OPTIONS: CreationOption[] = [
  {
    icon: WandSparkles,
    title: "Start Creating",
    description: "Bring a brand or a brief — SwishX picks the right format.",
    href: "/dossiers",
    gradient: "linear-gradient(140deg,#ff7a3d,var(--brand) 55%,#d8320c)",
  },
  {
    icon: Clapperboard,
    title: "Video",
    description: "Cited, narrated reels built from your dossier.",
    href: "/create",
    gradient: "linear-gradient(140deg,#4f83ff,#1d4ed8)",
  },
  {
    icon: LayoutTemplate,
    title: "Canvas & Creatives",
    description: "Print and digital layouts — ads, leave-behinds, banners.",
    href: "#",
    gradient: "linear-gradient(140deg,#9b6bff,#5b21b6)",
    soon: true,
  },
  {
    icon: BarChart3,
    title: "Infographic",
    description: "One-page visual aids for reps, congress, or the field.",
    href: "#",
    gradient: "linear-gradient(140deg,#22c07a,#12784a)",
    soon: true,
  },
];

/* ── Creation card — gradient icon, unified CTA, small hover lift
   and icon micro-bounce, staggered fade-in on mount. ───────────── */
function CreationCard({ option, index, onOpen }: { option: CreationOption; index: number; onOpen: () => void }) {
  const Icon = option.icon;
  return (
    <button
      onClick={onOpen}
      disabled={option.soon}
      className={[
        "group flex flex-col items-start gap-3 text-left rise-in-stagger",
        option.soon ? "cursor-default opacity-60" : "cursor-pointer hover:-translate-y-0.5",
      ].join(" ")}
      style={{
        padding: 20,
        borderRadius: "var(--r-l)",
        border: "1px solid var(--hair)",
        background: "#fff",
        transition: "transform .22s var(--e), box-shadow .22s var(--e), border-color .22s var(--e)",
        animationDelay: `${index * 60}ms`,
      }}
      onMouseEnter={(e) => {
        if (option.soon) return;
        e.currentTarget.style.boxShadow = "var(--sh-2)";
        e.currentTarget.style.borderColor = "var(--hair-2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "var(--hair)";
      }}
    >
      <span
        className="grid place-items-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
        style={{
          width: 42, height: 42, borderRadius: 13, flexShrink: 0,
          background: option.gradient, color: "#fff",
          boxShadow: "0 10px 20px -10px rgba(10,13,20,.45)",
        }}
      >
        <Icon size={19} />
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <b style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-.3px" }}>{option.title}</b>
        {option.soon && (
          <span style={{ fontSize: 9, letterSpacing: ".07em", background: "rgba(10,13,20,.06)", color: "var(--ink-4)", padding: "2px 6px", borderRadius: 5, fontWeight: 800 }}>SOON</span>
        )}
      </div>
      <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.5 }}>{option.description}</p>
      {!option.soon && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 700, color: "var(--brand)" }}>
          Get started
          <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      )}
    </button>
  );
}

/* ── Showcase card — video / canvas / website, each with its own
   chrome. Website gets a browser-bar treatment instead of a poster. */
function ShowcaseCard({ asset, index, onOpen }: { asset: ShowcaseAsset; index: number; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="rise-in-stagger group relative overflow-hidden flex-shrink-0"
      style={{
        width: 190,
        aspectRatio: asset.type === "video" ? "9/16" : asset.type === "website" ? "4/3" : "4/5",
        borderRadius: "var(--r-l)",
        background: asset.gradient,
        border: "none",
        cursor: "pointer",
        boxShadow: "0 14px 28px -14px rgba(10,13,20,.35)",
        transition: "transform .25s var(--e), box-shadow .25s var(--e)",
        animationDelay: `${index * 70}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 22px 38px -16px rgba(10,13,20,.48)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 14px 28px -14px rgba(10,13,20,.35)";
      }}
    >
      {/* Website chrome bar */}
      {asset.type === "website" && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 26, background: "rgba(6,7,10,.35)", display: "flex", alignItems: "center", gap: 5, padding: "0 9px" }}>
          {["#ff6159", "#ffbd2e", "#28c840"].map((c) => (
            <span key={c} style={{ width: 6, height: 6, borderRadius: "50%", background: c, opacity: 0.85 }} />
          ))}
        </div>
      )}
      {/* Shade */}
      <span style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 40%,rgba(0,0,0,.72))" }} />
      {/* Engine tag */}
      <span style={{ position: "absolute", top: asset.type === "website" ? 34 : 10, right: 10, fontSize: 9.5, fontWeight: 800, background: "rgba(0,0,0,.5)", color: "rgba(255,255,255,.9)", padding: "3px 7px", borderRadius: 5 }}>
        {asset.engine}
      </span>
      {/* Play affordance for video */}
      {asset.type === "video" && (
        <span
          className="transition-transform duration-300 group-hover:scale-110"
          style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,.92)", display: "grid", placeItems: "center" }}
        >
          <Play size={14} fill="#0d1017" color="#0d1017" style={{ marginLeft: 2 }} />
        </span>
      )}
      {/* Meta */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 12px", textAlign: "left" }}>
        <b style={{ display: "block", fontSize: 12.5, color: "#fff", fontWeight: 750, letterSpacing: "-.2px", marginBottom: 2 }}>{asset.brand}</b>
        <span style={{ fontSize: 10.5, color: "rgba(255,255,255,.7)", display: "block" }}>{asset.title}</span>
        <span style={{ fontSize: 9.5, color: "rgba(255,255,255,.5)", display: "block", marginTop: 2 }}>{asset.meta} · {asset.audience}</span>
      </div>
    </button>
  );
}

/* ── Section shell — every section shares the same panel language:
   border, radius, shadow, eyebrow/heading pattern, fade-in on load. */
function Panel({ eyebrow, title, subtitle, children, delay = 0 }: { eyebrow: string; title: string; subtitle: string; children: React.ReactNode; delay?: number }) {
  return (
    <div
      className="rise-in-stagger"
      style={{ background: "#fff", borderRadius: "var(--r-xl)", border: "1px solid var(--hair)", boxShadow: "var(--sh-1)", overflow: "hidden", marginBottom: 28, animationDelay: `${delay}ms` }}
    >
      <div style={{ padding: "22px 22px 0" }}>
        <span style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 800, color: "var(--brand)" }}>{eyebrow}</span>
        <b style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-.3px", display: "block", marginTop: 3 }}>{title}</b>
        <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "var(--ink-3)" }}>{subtitle}</p>
      </div>
      <div style={{ padding: 22 }}>{children}</div>
    </div>
  );
}

/* ── Home Screen Next ─────────────────────────────────────────────── */
export function HomeScreenNext() {
  const router = useRouter();
  const [audience, setAudience] = useState<"first" | "returning">("first");

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
      {/* ── Preview-only control — compares both experiences ──────── */}
      <div style={{ display: "inline-flex", padding: 3, borderRadius: 99, background: "var(--surface-subtle)", border: "1px solid var(--hair)", marginBottom: 22 }}>
        {(["first", "returning"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setAudience(mode)}
            style={{
              padding: "6px 14px", borderRadius: 99, fontSize: 12.5, fontWeight: 700,
              background: audience === mode ? "var(--ink)" : "transparent",
              color: audience === mode ? "#fff" : "var(--ink-3)",
              transition: "background .18s var(--e), color .18s var(--e)",
            }}
          >
            {mode === "first" ? "First visit" : "Returning"}
          </button>
        ))}
      </div>

      {/* ── Hero — short, no tour link, no team-chat mention ──────── */}
      <div key={audience} style={{ maxWidth: 620, marginBottom: 28 }} className="rise-in-stagger">
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, fontSize: 12.5, fontWeight: 700, color: "var(--ink-3)" }}>
          <i style={{ width: 6, height: 6, borderRadius: "50%", background: "#0d9488", boxShadow: "0 0 8px rgba(13,148,136,.5)", display: "block", animation: "blink 2s infinite" }} />
          Workspace live · {PERSONA.org}
        </div>

        <h1
          style={{
            fontSize: "clamp(26px,2.6vw,34px)", lineHeight: 1.15, fontWeight: 800, letterSpacing: "-1.2px", margin: "0 0 8px",
            background: "linear-gradient(96deg, var(--ink) 0%, var(--brand-deep) 55%, var(--brand) 100%)",
            WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
          }}
        >
          {audience === "first" ? `Welcome, ${PERSONA.firstName}.` : `Welcome back, ${PERSONA.firstName}.`}
        </h1>
        <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "var(--ink-3)", margin: 0 }}>
          {audience === "first"
            ? "Everything you make here is grounded, cited, and MLR-ready."
            : "Zero uncited claims, every time. Pick up where you left off."}
        </p>
      </div>

      {/* ── Creation panel ─────────────────────────────────────────── */}
      <Panel eyebrow="Content Studio" title="What would you like to make?" subtitle="Every format is grounded in your brand dossier." delay={40}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CREATION_OPTIONS.map((option, i) => (
            <CreationCard key={option.title} option={option} index={i} onOpen={() => openOption(option)} />
          ))}
        </div>
      </Panel>

      {/* ── First-time: guided steps · Returning: quick stats ─────── */}
      <div key={`aux-${audience}`} className="rise-in-stagger" style={{ marginBottom: 28 }}>
        {audience === "first" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "14px 20px", borderRadius: "var(--r-l)", background: "var(--tint-2)", border: "1px solid var(--tint-line)" }}>
            <span style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 750, color: "var(--brand-deep)", marginRight: 4 }}>Your path</span>
            {["Brand dossier", "Video & Creatives", "Send for review"].map((step, i, arr) => (
              <div key={step} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 650, color: "var(--ink-2)" }}>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", border: "1px solid var(--hair-2)", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 800, color: "var(--ink-3)" }}>{i + 1}</span>
                  {step}
                </span>
                {i < arr.length - 1 && <span style={{ width: 20, height: 1, background: "var(--tint-line)" }} />}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap", padding: "14px 20px", borderRadius: "var(--r-l)", background: "var(--surface-subtle)", border: "1px solid var(--hair)" }}>
            {[["40+", "regulatory markets"], ["5", "AI co-workers"], ["32", "content formats"], ["0", "uncited claims"]].map(([val, label]) => (
              <span key={label} style={{ fontSize: 13, color: "var(--ink-2)" }}>
                <b style={{ fontWeight: 800, color: "var(--ink)" }}>{val}</b> {label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Showcase — Video · Creatives · Web ─── */}
      <Panel eyebrow="Video · Creatives · Web" title="See what your team already shipped" subtitle="Every piece below is cited, MLR-cleared, and ready to reuse." delay={90}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {SHOWCASE.map((asset, i) => (
            <ShowcaseCard
              key={`${asset.type}-${i}`}
              asset={asset}
              index={i}
              onOpen={() => {
                if (asset.type !== "video") return;
                useWorkspaceStore.getState().setView("create");
                useWorkspaceStore.getState().setVideoSubStage("mode-select");
                router.push("/create");
              }}
            />
          ))}
        </div>
      </Panel>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Video, Image as ImageIcon, Globe, ArrowRight, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { BrandDossierModal } from "@/features/workspace/brand-dossier-modal";
import { cn } from "@/lib/cn";
import { MOCK_DOSSIERS } from "@/features/dossiers/mock-dossiers";
import type { BrandDossier } from "@/features/dossiers/dossier-types";

/* ─── Types ─────────────────────────────────────────────────────────────────── */
interface TileOption {
  icon: typeof Video;
  title: string;
  subtitle: string;
  accent: string;
  description: string;
  href: string;
  gradient: string;
}

interface ShowcaseItem {
  title: string;
  subtitle: string;
  meta: string;
  aspect: string;
  gradient: string;
  hasPlay: boolean;
  tag: string;
  videoSrc?: string;
}

interface ShowcaseLane {
  label: string;
  title: string;
  subtitle: string;
  items: ShowcaseItem[];
}

interface RecentProject {
  studio: string;
  status: "In MLR" | "Draft" | "Approved";
  title: string;
  meta: string;
  progress: number;
  updated: string;
  action: string;
}

/* ─── Data ───────────────────────────────────────────────────────────────────── */
const CREATION_TILES: TileOption[] = [
  {
    icon: Video,
    title: "Video",
    subtitle: "Explainer, Avatar",
    accent: "var(--brand-deep)",
    description: "Drug explainers and lip-synced doctor presenters, MLR-ready in minutes.",
    href: "/create",
    gradient: "linear-gradient(145deg,#6ea2ff,#3d6bff 55%,#1d3fd6)",
  },
  {
    icon: ImageIcon,
    title: "Creatives",
    subtitle: "Infographics, Detail Aid",
    accent: "var(--brand-deep)",
    description: "Leave-behinds, journal ads and banners from your approved claims.",
    href: "#",
    gradient: "linear-gradient(145deg,#c199ff,#9b5bff 55%,#6d1fd8)",
  },
  {
    icon: Globe,
    title: "Web",
    subtitle: "Interactive Web for your Brand",
    accent: "#0a8556",
    description: "On-label microsites and HCP portals, signed off before publish.",
    href: "/create",
    gradient: "linear-gradient(145deg,#4fdb9c,#16b878 55%,#0a8556)",
  },
];

const RECENT_PROJECTS: RecentProject[] = [
  { studio: "Reel", status: "In MLR", title: "Velmora — MoA explainer", meta: "Cardiologists · US · 60s", progress: 85, updated: "Today, 09:15", action: "Open" },
  { studio: "Avatar", status: "Draft", title: "Dr. Rao — dosing update", meta: "HCP · EU · 45s", progress: 35, updated: "Yesterday", action: "Resume" },
  { studio: "Creatives", status: "Approved", title: "Onkavia detail aid", meta: "Field team · 8 panels", progress: 100, updated: "2 days ago", action: "Export" },
  { studio: "Web", status: "Draft", title: "Nirvexa launch microsite", meta: "HCP portal · 6 sections", progress: 55, updated: "3 days ago", action: "Resume" },
];

const SHOWCASE_LANES: ShowcaseLane[] = [
  {
    label: "Video Samples",
    title: "Reels and avatars your team already shipped",
    subtitle: "Real videos made on SwishX — two Reel cuts, two Avatar presenters. Play one before you build.",
    items: [
      {
        title: "Mechanism of action — cardiology",
        subtitle: "Cardiologists · US · FDA",
        meta: "1:00",
        aspect: "16/9",
        gradient: "linear-gradient(160deg,#16233f,#2c4573 50%,#5b7fb8)",
        hasPlay: true,
        tag: "Reel",
        videoSrc: "/reel-moa.mp4",
      },
      {
        title: "Dosing & titration explainer",
        subtitle: "Endocrinology · EU · EMA",
        meta: "0:30",
        aspect: "16/9",
        gradient: "linear-gradient(160deg,#2a1b0f,#5c3515 48%,#9e6130)",
        hasPlay: true,
        tag: "Reel",
        videoSrc: "/21617-319452308_medium.mp4",
      },
      {
        title: "Dr. Anita Rao on first-line use",
        subtitle: "HCP · UK · MHRA",
        meta: "1:00",
        aspect: "16/9",
        gradient: "linear-gradient(160deg,#0a1f18,#13382c 48%,#1d5442)",
        hasPlay: true,
        tag: "Avatar",
        videoSrc: "/avatar-showcase.mp4",
      },
      {
        title: "Patient counselling in clinic",
        subtitle: "Patients · Global",
        meta: "0:30",
        aspect: "16/9",
        gradient: "linear-gradient(160deg,#1f1329,#381d4a 48%,#572c73)",
        hasPlay: true,
        tag: "Avatar",
        videoSrc: "/46621-448480587_medium.mp4",
      },
    ],
  },
  {
    label: "Web Samples",
    title: "Microsites, live in a day",
    subtitle: "Microsites and HCP portals your field team can ship the same day.",
    items: [
      {
        title: "Velmora HCP portal",
        subtitle: "FDA Anchor · Cardiology",
        meta: "5 pages",
        aspect: "16/9",
        gradient: "linear-gradient(160deg,#1b2a4a,#2f4a7d 48%,#5b7fb8)",
        hasPlay: false,
        tag: "Web",
      },
      {
        title: "Onkavia patient landing page",
        subtitle: "EMA Anchor · NSCLC",
        meta: "3 pages",
        aspect: "16/9",
        gradient: "linear-gradient(160deg,#3a1e4d,#63307a 48%,#a06bc4)",
        hasPlay: false,
        tag: "Web",
      },
      {
        title: "Nirvexa congress microsite",
        subtitle: "MHRA Anchor · Immunology",
        meta: "4 pages",
        aspect: "16/9",
        gradient: "linear-gradient(160deg,#12332c,#1d5a4a 48%,#3f9c7f)",
        hasPlay: false,
        tag: "Web",
      },
      {
        title: "Brevanta sample rep site",
        subtitle: "Sample · FDA Anchor",
        meta: "6 pages",
        aspect: "16/9",
        gradient: "linear-gradient(160deg,#2a1b0f,#5c3515 48%,#9e6130)",
        hasPlay: false,
        tag: "Sample",
      },
    ],
  },
  {
    label: "Creatives Samples",
    title: "Print and digital, done right",
    subtitle: "Layouts your reps actually use — journal ads, booth panels, and payer infographics.",
    items: [
      {
        title: "Velmora journal ad",
        subtitle: "FDA · Full-page · A4",
        meta: "A4",
        aspect: "16/9",
        gradient: "linear-gradient(150deg,#16233f,#2c4573 50%,#5b7fb8)",
        hasPlay: true,
        tag: "Creatives",
        videoSrc: "/326638_medium.mp4",
      },
      {
        title: "Onkavia congress panel",
        subtitle: "EMA · 2×1m booth stand",
        meta: "2x1m",
        aspect: "16/9",
        gradient: "linear-gradient(150deg,#33193f,#5b2c70 50%,#9a63bc)",
        hasPlay: true,
        tag: "Creatives",
        videoSrc: "/21617-319452308_medium.mp4",
      },
      {
        title: "Nirvexa payer infographic",
        subtitle: "HEOR summary · UK",
        meta: "1:1",
        aspect: "16/9",
        gradient: "linear-gradient(150deg,#0f2e28,#1b5546 50%,#3d9880)",
        hasPlay: true,
        tag: "Creatives",
        videoSrc: "/46621-448480587_medium.mp4",
      },
    ],
  },
];

/* ─── Top Creation Flow Tile Component ─────────────────────────────────────── */
function CreationCard({ tile, onOpen }: { tile: TileOption; onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);
  const Icon = tile.icon;

  return (
    <button
      type="button"
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        padding: "34px 28px 28px",
        borderRadius: "var(--r-xl)",
        background: hovered ? "#fdfefe" : "#fff",
        border: hovered ? "1px solid var(--hair-2)" : "1px solid var(--hair)",
        boxShadow: hovered ? "0 16px 32px -18px rgba(16,24,40,.16)" : "0 1px 3px rgba(16,24,40,.03)",
        cursor: "pointer",
        textAlign: "center",
        transition: "all .28s cubic-bezier(0.16, 1, 0.3, 1)",
        position: "relative",
        minHeight: 250,
        overflow: "hidden",
      }}
      className="hover:-translate-y-1 group"
    >
      {/* Gradient icon badge — refined, premium finish with a soft glass sheen */}
      <span
        style={{
          position: "relative",
          display: "grid",
          placeItems: "center",
          width: 60,
          height: 60,
          borderRadius: 18,
          flexShrink: 0,
          marginBottom: 4,
          background: tile.gradient,
          color: "#fff",
          boxShadow: "0 8px 16px -8px rgba(16,24,40,.28), inset 0 1px 0 rgba(255,255,255,.45), inset 0 -8px 14px -6px rgba(0,0,0,.14)",
          transition: "transform .32s cubic-bezier(0.16, 1, 0.3, 1)",
          transform: hovered ? "scale(1.06)" : "scale(1)",
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 18,
            background: "linear-gradient(155deg,rgba(255,255,255,.4),transparent 45%)",
            pointerEvents: "none",
          }}
        />
        <Icon size={26} strokeWidth={1.75} style={{ position: "relative" }} />
      </span>

      {/* Title */}
      <h3
        style={{
          position: "relative",
          fontSize: 19,
          fontWeight: 800,
          color: "var(--ink)",
          letterSpacing: "-.4px",
          margin: 0,
          lineHeight: 1.2,
        }}
      >
        {tile.title}
      </h3>

      {/* Colored subtitle */}
      <span
        style={{
          position: "relative",
          fontSize: 12.5,
          fontWeight: 750,
          color: tile.accent,
        }}
      >
        {tile.subtitle}
      </span>

      {/* Description */}
      <p
        style={{
          position: "relative",
          fontSize: 13.5,
          color: "var(--ink-3)",
          margin: "4px 0 0",
          lineHeight: 1.55,
          fontWeight: 450,
          maxWidth: "30ch",
        }}
      >
        {tile.description}
      </p>

      {/* Get started — clickable pill CTA */}
      <span
        style={{
          position: "relative",
          marginTop: "auto",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12.5,
          fontWeight: 750,
          padding: "8px 16px",
          borderRadius: 99,
          color: hovered ? "#fff" : "var(--brand-deep)",
          background: hovered ? tile.gradient : "var(--tint)",
          border: hovered ? "1px solid transparent" : "1px solid var(--tint-line)",
          boxShadow: hovered ? "0 6px 14px -8px rgba(16,24,40,.22)" : "none",
          transition: "all .24s ease",
        }}
      >
        Get started
        <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
      </span>
    </button>
  );
}

/* ─── Recent project card ────────────────────────────────────────────────────── */
const STATUS_STYLE: Record<RecentProject["status"], { bg: string; color: string; bar: string }> = {
  "In MLR": { bg: "var(--tint)", color: "var(--brand-deep)", bar: "var(--brand)" },
  Draft: { bg: "var(--surface-subtle)", color: "var(--ink-3)", bar: "var(--brand)" },
  Approved: { bg: "var(--ok-bg)", color: "var(--ok)", bar: "var(--ok)" },
};

function RecentProjectCard({ project }: { project: RecentProject }) {
  const style = STATUS_STYLE[project.status];
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid var(--hair)",
        borderRadius: "var(--r-l)",
        padding: "16px 16px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        transition: "all .2s var(--e)",
      }}
      className="hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-16px_rgba(16,24,40,.2)]"
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-4)" }}>
          {project.studio}
        </span>
        <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: ".03em", textTransform: "uppercase", color: style.color, background: style.bg, padding: "2px 8px", borderRadius: 99 }}>
          {project.status}
        </span>
      </div>

      <div>
        <b style={{ display: "block", fontSize: 14.5, fontWeight: 750, color: "var(--ink)", letterSpacing: "-.2px", marginBottom: 3 }}>
          {project.title}
        </b>
        <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{project.meta}</span>
      </div>

      <div style={{ height: 4, borderRadius: 99, background: "var(--surface-subtle)", overflow: "hidden" }}>
        <span style={{ display: "block", height: "100%", width: `${project.progress}%`, background: style.bar, borderRadius: 99 }} />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11.5, color: "var(--ink-4)" }}>{project.updated}</span>
        <span style={{ fontSize: 12, fontWeight: 750, color: "var(--brand)" }}>{project.action}</span>
      </div>
    </div>
  );
}

/* ─── Showcase Item Card ─────────────────────────────────────────────────────── */
function ShowcaseCard({ item, onPlay }: { item: ShowcaseItem; onPlay: (item: ShowcaseItem) => void }) {
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (hovered && item.videoSrc && videoRef.current) {
      videoRef.current.play().catch(() => {});
    } else if (!hovered && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [hovered, item.videoSrc]);

  return (
    <div
      onClick={() => onPlay(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 268,
        height: 210,
        borderRadius: "var(--r-l)",
        position: "relative",
        flexShrink: 0,
        overflow: "hidden",
        background: item.gradient,
        cursor: "pointer",
        transition: "transform .2s var(--e), box-shadow .2s var(--e)",
      }}
      className="hover:-translate-y-1 hover:shadow-[0_16px_32px_-12px_rgba(10,13,20,.42)]"
    >
      {/* Real Video Element (Plays smoothly on hover) */}
      {item.videoSrc && (
        <video
          ref={videoRef}
          src={item.videoSrc}
          loop
          muted
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: hovered ? 0.95 : 0.65,
            transition: "opacity .3s ease",
          }}
        />
      )}

      {/* Dark gradient overlay for legibility */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,.15) 0%, transparent 40%, rgba(0,0,0,.75) 100%)",
        }}
      />

      {/* Sample pill, top-left */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: 9.5,
          fontWeight: 800,
          letterSpacing: ".04em",
          textTransform: "uppercase",
          background: "rgba(10,13,20,.68)",
          color: "#fff",
          padding: "3px 8px 3px 6px",
          borderRadius: 6,
          backdropFilter: "blur(6px)",
        }}
      >
        <Play size={8} fill="#fff" color="#fff" />
        Sample
      </div>

      {/* Meta (duration / format) */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          fontSize: 9.5,
          fontWeight: 700,
          background: "rgba(0,0,0,.5)",
          color: "#fff",
          padding: "3px 8px",
          borderRadius: 6,
          backdropFilter: "blur(4px)",
        }}
      >
        {item.meta}
      </div>

      {/* Standard Neutral Center Play button without glow */}
      {item.hasPlay && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(255,255,255,.92)",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,.25)",
            transition: "transform .2s ease",
            transformOrigin: "center",
          }}
          className={hovered ? "scale-110" : "scale-100"}
        >
          <svg viewBox="0 0 24 24" fill="#0d1017" width={13} height={13} style={{ marginLeft: 1.5 }}>
            <path d="M6 4l14 8-14 8z" />
          </svg>
        </div>
      )}

      {/* Bottom meta */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 12px", zIndex: 10 }}>
        <span
          style={{
            display: "block",
            fontSize: 9.5,
            fontWeight: 800,
            letterSpacing: ".04em",
            textTransform: "uppercase",
            color: "#ff9a5e",
            marginBottom: 2,
          }}
        >
          {item.tag}
        </span>
        <b
          style={{
            display: "block",
            fontSize: 13,
            color: "#fff",
            fontWeight: 750,
            letterSpacing: "-.2px",
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.title}
        </b>
        <span
          style={{
            display: "block",
            fontSize: 10.5,
            color: "rgba(255,255,255,.8)",
            marginTop: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.subtitle}
        </span>
      </div>
    </div>
  );
}

/* ─── Horizontal lane row ────────────────────────────────────────────────────── */
function ShowcaseLaneRow({
  lane,
  isLast,
  onPlayVideo,
}: {
  lane: ShowcaseLane;
  isLast: boolean;
  onPlayVideo: (item: ShowcaseItem) => void;
}) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
  }

  const isDossierLane = (lane.label as string) === "Brand Dossiers";

  return (
    <div style={{ marginBottom: isLast ? 0 : 32 }}>
      {/* Lane header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14, gap: 16 }}>
        <div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: "var(--brand)",
              display: "block",
              marginBottom: 4,
            }}
          >
            {lane.label}
          </span>
          <h3
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "-.5px",
              color: "var(--ink)",
              margin: "0 0 4px",
            }}
          >
            {lane.title}
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: "var(--ink-3)", maxWidth: "58ch" }}>{lane.subtitle}</p>
        </div>

        {/* Scroll arrows */}
        <div style={{ display: "flex", gap: 6, flexShrink: 0, marginTop: 4 }}>
          <button
            onClick={() => scroll("left")}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "1px solid var(--hair)",
              background: "#fff",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              color: "var(--ink-3)",
            }}
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => scroll("right")}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "1px solid var(--hair)",
              background: "#fff",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              color: "var(--ink-3)",
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Horizontal scrolling strip with top and bottom breathing padding */}
      <div
        ref={scrollRef}
        style={{
          display: "flex",
          gap: 14,
          overflowX: "auto",
          padding: "8px 4px 12px",
          scrollbarWidth: "none",
        }}
      >
        {isDossierLane
          ? MOCK_DOSSIERS.map((dossier) => (
              <HomeDossierCard
                key={dossier.id}
                dossier={dossier}
                onSelect={() => router.push(`/dossiers?open=${dossier.id}`)}
              />
            ))
          : lane.items.map((item, idx) => (
              <ShowcaseCard key={idx} item={item} onPlay={onPlayVideo} />
            ))}
      </div>
    </div>
  );
}

/* ─── Dedicated Clinical Brand Dossier Card for Showcase Lane ─────────────────── */
function HomeDossierCard({ dossier, onSelect }: { dossier: BrandDossier; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 290,
        height: 200,
        flexShrink: 0,
        borderRadius: "var(--r-xl)",
        background: "#fff",
        border: hovered ? "1.5px solid var(--brand)" : "1px solid var(--hair)",
        boxShadow: hovered ? "0 12px 28px -8px rgba(0,0,0,0.08)" : "var(--sh-1)",
        padding: "16px 18px",
        cursor: "pointer",
        transition: "all .2s var(--e)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
      }}
      className="hover:-translate-y-1"
    >
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
            <b style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", letterSpacing: "-.4px" }}>
              {dossier.brandName}
            </b>
            {dossier.isSample && (
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  padding: "1.5px 6px",
                  borderRadius: 99,
                  background: "#fef3c7",
                  color: "#b45309",
                  border: "1px solid #fde68a",
                }}
              >
                Sample
              </span>
            )}
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 800,
                padding: "1.5px 6px",
                borderRadius: 99,
                background: "var(--ok-bg)",
                color: "var(--ok)",
                border: "1px solid var(--ok-line)",
              }}
            >
              {dossier.regulatoryAnchor} Anchor
            </span>
          </div>
        </div>

        <span
          style={{
            fontSize: 11.5,
            color: "var(--ink-4)",
            fontStyle: "italic",
            display: "block",
            marginTop: 1.5,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {dossier.genericName}
        </span>

        {/* Indication */}
        <p
          style={{
            fontSize: 11.5,
            color: "var(--ink-3)",
            lineHeight: 1.35,
            margin: "8px 0 0",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {dossier.indication}
        </p>
      </div>

      {/* Stats row & Footer */}
      <div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 4,
            padding: "6px 8px",
            background:
              dossier.healthStatus === "critical"
                ? "#fff5f5"
                : dossier.healthStatus === "warning"
                ? "#fefce8"
                : "var(--tint-2)",
            borderRadius: "var(--r)",
            border:
              dossier.healthStatus === "critical"
                ? "1px solid #fed7d7"
                : dossier.healthStatus === "warning"
                ? "1px solid #fef08a"
                : "1px solid var(--tint-line)",
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          <div>
            <b style={{ display: "block", fontSize: 13, fontWeight: 800, color: "var(--ink)" }}>
              {dossier.sectionsCount}
            </b>
            <span style={{ fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", color: "var(--ink-4)" }}>
              Sections
            </span>
          </div>
          <div>
            <b
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 800,
                color:
                  dossier.healthStatus === "critical"
                    ? "#ef4444"
                    : dossier.healthStatus === "warning"
                    ? "#eab308"
                    : "var(--ok)",
              }}
            >
              {dossier.healthStatus === "critical"
                ? `${dossier.verifiedClaimsCount}/${dossier.totalClaimsCount}`
                : dossier.healthStatus === "warning"
                ? "50%"
                : dossier.totalClaimsCount}
            </b>
            <span
              style={{
                fontSize: 8.5,
                fontWeight: 700,
                textTransform: "uppercase",
                color:
                  dossier.healthStatus === "critical"
                    ? "#ef4444"
                    : dossier.healthStatus === "warning"
                    ? "#eab308"
                    : "var(--ok)",
              }}
            >
              {dossier.healthStatus === "critical"
                ? "Verified"
                : dossier.healthStatus === "warning"
                ? "Pending"
                : "Claims"}
            </span>
          </div>
          <div>
            <b style={{ display: "block", fontSize: 13, fontWeight: 800, color: "var(--ink)" }}>
              {dossier.sourcesCount}
            </b>
            <span style={{ fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", color: "var(--ink-4)" }}>
              Sources
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10, color: "var(--ink-4)" }}>{dossier.lastUpdated}</span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "var(--brand)",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            Inspect dossier →
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── HomeScreen Component ───────────────────────────────────────────────────── */
const EXAMPLE_DOSSIERS = MOCK_DOSSIERS.filter((d) => d.isSample);

const EXAMPLE_STARTERS: ShowcaseItem[] = [
  {
    title: "Mechanism of action — cardiology",
    subtitle: "Example Video · Cardiologists",
    meta: "1:00",
    aspect: "16/9",
    gradient: "linear-gradient(160deg,#16233f,#2c4573 50%,#5b7fb8)",
    hasPlay: true,
    tag: "Example",
    videoSrc: "/reel-moa.mp4",
  },
  {
    title: "Velmora HCP portal",
    subtitle: "Example microsite · FDA Anchor",
    meta: "5 pages",
    aspect: "16/9",
    gradient: "linear-gradient(160deg,#1b2a4a,#2f4a7d 48%,#5b7fb8)",
    hasPlay: false,
    tag: "Example",
  },
];

export function HomeScreen() {
  const router = useRouter();
  const [playingVideoItem, setPlayingVideoItem] = useState<ShowcaseItem | null>(null);
  const [isNewUser, setIsNewUser] = useState(true);
  const [dossierModalOpen, setDossierModalOpen] = useState(false);

  function openTile(tile: TileOption) {
    if (tile.title === "Video") {
      useWorkspaceStore.getState().setAssetType("video");
      useWorkspaceStore.getState().setVideoSubStage("mode-select");
      useWorkspaceStore.getState().setView("create");
      router.push("/create");
    } else if (tile.title === "Creatives") {
      useWorkspaceStore.getState().setAssetType("infographic");
      useWorkspaceStore.getState().setCreationMode("magic-chart");
      useWorkspaceStore.getState().setVideoSubStage("mode-select");
      useWorkspaceStore.getState().setView("create");
      router.push("/create");
    } else if (tile.href !== "#") {
      router.push(tile.href);
    }
  }

  const handleSelectDossier = (dossierId: string) => {
    useWorkspaceStore.getState().setSourcePayload({ dossierId });
    useWorkspaceStore.getState().setVideoSubStage("intake");
    useWorkspaceStore.getState().setView("create");
    setDossierModalOpen(false);
    router.push("/create");
  };

  return (
    <div className="page-enter space-y-9 max-w-[1180px] pb-12">
      {/* Eyebrow pill */}
      <div className="pt-1">
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "6px 13px",
            border: "1px solid var(--tint-line)",
            background: "var(--tint)",
            color: "var(--brand-deep)",
            borderRadius: 99,
            fontSize: 11.5,
            fontWeight: 800,
            letterSpacing: ".05em",
            textTransform: "uppercase",
          }}
        >
          <i style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--brand)", display: "block" }} />
          MLR-ready. In minutes.
        </span>

        <h1
          style={{
            fontSize: "clamp(30px, 3.4vw, 42px)",
            lineHeight: 1.1,
            fontWeight: 800,
            letterSpacing: "-1.2px",
            margin: "14px 0 0",
            color: "var(--ink)",
          }}
        >
          What do you want to create today?
        </h1>
        <p className="mt-2.5 text-[14.5px] text-[var(--ink-3)] font-medium">
          Pick a studio. Every asset is written from your Brand Dossier, with a source behind each claim.
        </p>
      </div>

      {/* Creation tiles — bordered cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${CREATION_TILES.length}, 1fr)`,
          gap: 16,
        }}
      >
        {CREATION_TILES.map((tile) => (
          <CreationCard key={tile.title} tile={tile} onOpen={() => openTile(tile)} />
        ))}
      </div>

      {/* Recent projects — new-user empty state vs returning-user activity.
          The toggle below is a preview control for this demo (no backend
          to detect account age from), not a real user-facing setting. */}
      <div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--brand)", display: "block", marginBottom: 4 }}>
              {isNewUser ? "New here? Start with an example" : "Pick up where you left off"}
            </span>
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.5px", color: "var(--ink)", margin: 0 }}>
              {isNewUser ? "Try a finished example first" : "Recent projects"}
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {!isNewUser && <span style={{ fontSize: 13, fontWeight: 750, color: "var(--brand)", cursor: "pointer" }}>All projects →</span>}
            <div style={{ display: "inline-flex", padding: 3, borderRadius: 99, background: "var(--surface-subtle)", border: "1px solid var(--hair)" }}>
              {([true, false] as const).map((val) => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => setIsNewUser(val)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 99,
                    fontSize: 11.5,
                    fontWeight: 700,
                    background: isNewUser === val ? "var(--ink)" : "transparent",
                    color: isNewUser === val ? "#fff" : "var(--ink-3)",
                    transition: "background .18s var(--e), color .18s var(--e)",
                  }}
                >
                  {val ? "New user" : "Returning user"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isNewUser ? (
          <>
            <p style={{ margin: "0 0 16px", fontSize: 13.5, color: "var(--ink-3)" }}>
              You haven&rsquo;t created anything yet. Preview a sample dossier or a finished asset, then build your own the same way.
            </p>
            <div style={{ display: "flex", gap: 14, overflowX: "auto", padding: "2px 2px 8px" }}>
              {EXAMPLE_DOSSIERS.map((dossier) => (
                <HomeDossierCard
                  key={dossier.id}
                  dossier={dossier}
                  onSelect={() => router.push(`/dossiers?open=${dossier.id}`)}
                />
              ))}
              {EXAMPLE_STARTERS.map((item, idx) => (
                <ShowcaseCard key={idx} item={item} onPlay={(i) => setPlayingVideoItem(i)} />
              ))}
            </div>
            <button
              type="button"
              onClick={() => router.push("/dossiers")}
              style={{
                marginTop: 16,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "11px 20px",
                borderRadius: "var(--r)",
                fontWeight: 750,
                fontSize: 14,
                color: "#fff",
                background: "linear-gradient(180deg,#ff5b2d,var(--brand))",
                boxShadow: "0 12px 24px -12px rgba(253,72,22,.6)",
              }}
            >
              Create your first dossier
              <ArrowRight size={15} />
            </button>
          </>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {RECENT_PROJECTS.map((project) => (
              <RecentProjectCard key={project.title} project={project} />
            ))}
          </div>
        )}
      </div>

      {/* Showcase lanes */}
      <div
        style={{
          background: "#fff",
          borderRadius: "var(--r-xl)",
          border: "1px solid var(--hair)",
          boxShadow: "var(--sh-1)",
          padding: "26px 24px 22px",
        }}
      >
        {SHOWCASE_LANES.map((lane, i) => (
          <ShowcaseLaneRow
            key={lane.label}
            lane={lane}
            isLast={i === SHOWCASE_LANES.length - 1}
            onPlayVideo={(item) => setPlayingVideoItem(item)}
          />
        ))}
      </div>

      {/* Video Playback Lightbox Modal */}
      {playingVideoItem && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setPlayingVideoItem(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={cn(
              "w-full overflow-hidden rounded-[24px] border border-white/20 bg-[#0d1017] shadow-2xl text-white select-none transition-all flex flex-col max-h-[90vh]",
              playingVideoItem.aspect === "9/16" ? "max-w-[380px]" : "max-w-[820px]"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-black/40 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="rounded-md bg-[var(--brand)] px-2 py-0.5 text-[10px] font-extrabold uppercase text-white shrink-0">
                  {playingVideoItem.tag}
                </span>
                <span className="text-[13.5px] font-bold text-white truncate">
                  {playingVideoItem.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPlayingVideoItem(null)}
                className="grid size-8 place-items-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition cursor-pointer shrink-0 ml-2"
              >
                ✕
              </button>
            </div>

            {/* Video Player (Aspect-Aware Sizing) */}
            <div
              className={cn(
                "relative bg-black flex items-center justify-center overflow-hidden min-h-0 flex-1",
                playingVideoItem.aspect === "9/16"
                  ? "aspect-[9/16] max-h-[62vh]"
                  : "aspect-video max-h-[65vh]"
              )}
            >
              {playingVideoItem.videoSrc ? (
                <video
                  src={playingVideoItem.videoSrc}
                  controls
                  autoPlay
                  playsInline
                  className="size-full object-contain"
                />
              ) : (
                <div className="text-center p-8 space-y-2">
                  <p className="text-[14px] font-semibold text-white/70">Sample Showreel Preview</p>
                  <p className="text-[12px] text-white/40">Grounded in verified regulatory trial anchors.</p>
                </div>
              )}
            </div>

            {/* Footer Controls / Details */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-white/[0.03] border-t border-white/10 text-[12px] shrink-0">
              <div className="min-w-0 pr-3">
                <p className="font-semibold text-white/90 truncate">{playingVideoItem.subtitle}</p>
                <p className="text-[11px] text-white/50">{playingVideoItem.meta} · Verified Prescribing Info</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPlayingVideoItem(null);
                  router.push("/create");
                }}
                className="rounded-xl bg-[var(--brand)] px-4 py-2 text-[12px] font-bold text-white shadow-lg hover:bg-[var(--brand-deep)] transition cursor-pointer shrink-0"
              >
                Create with this style →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brand & Dossier Starter Modal */}
      <BrandDossierModal
        open={dossierModalOpen}
        onClose={() => setDossierModalOpen(false)}
        onSelectDossier={handleSelectDossier}
      />
    </div>
  );
}

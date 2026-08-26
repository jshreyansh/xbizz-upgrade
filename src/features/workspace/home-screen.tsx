"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Video, Image as ImageIcon, Globe, ArrowRight } from "lucide-react";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { PERSONA } from "@/features/workspace/mock-personas";
import { cn } from "@/lib/cn";

/* ─── Types ─────────────────────────────────────────────────────────────────── */
interface TileOption {
  icon: typeof Sparkles;
  title: string;
  badge: string;
  tag: string;
  description: string;
  href: string;
  gradient: string;
  glow: string;
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
  items: ShowcaseItem[];
}

/* ─── Data ───────────────────────────────────────────────────────────────────── */
const CREATION_TILES: TileOption[] = [
  {
    icon: Video,
    title: "Magic Video",
    badge: "Cinema & 3D",
    tag: "16:9 & 9:16 Reels",
    description: "Source-backed MoA reels & clinical evidence videos, in minutes.",
    href: "/create",
    gradient: "linear-gradient(145deg,#6ea2ff,#3d6bff 55%,#1d3fd6)",
    glow: "rgba(61,107,255,.38)",
  },
  {
    icon: ImageIcon,
    title: "Magic Canvas",
    badge: "Visuals",
    tag: "Congress & Infographics",
    description: "Compliant leave-behinds, booth banners & journal ads.",
    href: "#",
    gradient: "linear-gradient(145deg,#c199ff,#9b5bff 55%,#6d1fd8)",
    glow: "rgba(155,91,255,.38)",
  },
  {
    icon: Globe,
    title: "Magic Website",
    badge: "Web & Landing",
    tag: "HCP & Patient Portals",
    description: "On-label microsites and landing pages, live in hours.",
    href: "/create",
    gradient: "linear-gradient(145deg,#4fdb9c,#16b878 55%,#0a8556)",
    glow: "rgba(22,184,120,.38)",
  },
];

const SHOWCASE_LANES: ShowcaseLane[] = [
  {
    label: "Magic Video",
    title: "Reels that move medicine forward",
    items: [
      {
        title: "Tecentriq clinical pivotal reel",
        subtitle: "Oncologists · US · FDA",
        meta: "1:42",
        aspect: "9/16",
        gradient: "linear-gradient(160deg,#1b2a4a,#2f4a7d 45%,#5b7fb8)",
        hasPlay: true,
        tag: "MagicReel",
        videoSrc: "/tecentriq-reel.mp4",
      },
      {
        title: "Mechanism of Action (MoA) 3D",
        subtitle: "Cardiologists · US · FDA",
        meta: "0:14",
        aspect: "16/9",
        gradient: "linear-gradient(160deg,#3a1e4d,#63307a 48%,#a06bc4)",
        hasPlay: true,
        tag: "MagicReel",
        videoSrc: "/reel-moa.mp4",
      },
      {
        title: "Brevanta therapeutic study",
        subtitle: "Payers · UK · MHRA",
        meta: "1:15",
        aspect: "9/16",
        gradient: "linear-gradient(160deg,#12332c,#1d5a4a 48%,#3f9c7f)",
        hasPlay: true,
        tag: "MagicReel",
        videoSrc: "/Brevanta final draft-web.mp4",
      },
      {
        title: "Clinical laboratory readout",
        subtitle: "Researchers · Global",
        meta: "0:42",
        aspect: "16/9",
        gradient: "linear-gradient(160deg,#2a1b0f,#5c3515 48%,#9e6130)",
        hasPlay: true,
        tag: "MagicReel",
        videoSrc: "/21617-319452308_medium.mp4",
      },
      {
        title: "Molecular interaction dynamics",
        subtitle: "HCPs · EU · EMA",
        meta: "0:30",
        aspect: "16/9",
        gradient: "linear-gradient(160deg,#16233f,#2c4573 50%,#5b7fb8)",
        hasPlay: true,
        tag: "MagicReel",
        videoSrc: "/27019-361107952_medium.mp4",
      },
      {
        title: "Surgical precision & robotics",
        subtitle: "Surgeons · US · FDA",
        meta: "0:24",
        aspect: "16/9",
        gradient: "linear-gradient(160deg,#1a0a2e,#3b1a5e 48%,#6a3a9e)",
        hasPlay: true,
        tag: "MagicReel",
        videoSrc: "/326638_medium.mp4",
      },
      {
        title: "Cellular therapy pathway",
        subtitle: "Immunologists · Global",
        meta: "0:10",
        aspect: "16/9",
        gradient: "linear-gradient(160deg,#0a1f18,#13382c 48%,#1d5442)",
        hasPlay: true,
        tag: "MagicReel",
        videoSrc: "/40781-426939561_medium.mp4",
      },
      {
        title: "Diagnostic imaging review",
        subtitle: "Radiologists · US",
        meta: "0:20",
        aspect: "16/9",
        gradient: "linear-gradient(160deg,#1f1329,#381d4a 48%,#572c73)",
        hasPlay: true,
        tag: "MagicReel",
        videoSrc: "/4360-178617258_medium.mp4",
      },
    ],
  },
  {
    label: "Brand Dossiers",
    title: "Master regulatory dossiers & clinical evidence anchors",
    items: [
      {
        title: "Velmora Master Dossier",
        subtitle: "FDA Anchor · Cardiology · 18 Secs",
        meta: "66 Claims",
        aspect: "16/9",
        gradient: "linear-gradient(160deg,#1b2a4a,#2f4a7d 48%,#5b7fb8)",
        hasPlay: false,
        tag: "Dossier",
      },
      {
        title: "Onkavia SmPC Dossier",
        subtitle: "EMA Anchor · NSCLC · 19 Secs",
        meta: "84 Claims",
        aspect: "16/9",
        gradient: "linear-gradient(160deg,#3a1e4d,#63307a 48%,#a06bc4)",
        hasPlay: false,
        tag: "Dossier",
      },
      {
        title: "Nirvexa Value Dossier",
        subtitle: "MHRA Anchor · Immunology · 16 Secs",
        meta: "162 Claims",
        aspect: "16/9",
        gradient: "linear-gradient(160deg,#12332c,#1d5a4a 48%,#3f9c7f)",
        hasPlay: false,
        tag: "Dossier",
      },
      {
        title: "Cardioxa Sample Dossier",
        subtitle: "Sample · FDA Anchor · 17 Secs",
        meta: "165 Claims",
        aspect: "16/9",
        gradient: "linear-gradient(160deg,#2f1e4a,#4b2c78 48%,#7c4bb8)",
        hasPlay: false,
        tag: "Sample",
      },
      {
        title: "PulmoVax Sample Dossier",
        subtitle: "Sample · WHO Anchor · 21 Secs",
        meta: "230 Claims",
        aspect: "16/9",
        gradient: "linear-gradient(160deg,#133b34,#1c6356 48%,#349e8a)",
        hasPlay: false,
        tag: "Sample",
      },
    ],
  },
  {
    label: "Magic Website",
    title: "Microsites your field team can ship same-day",
    items: [
      {
        title: "Velmora HCP portal",
        subtitle: "FDA Anchor · Cardiology",
        meta: "5 pages",
        aspect: "16/9",
        gradient: "linear-gradient(160deg,#1b2a4a,#2f4a7d 48%,#5b7fb8)",
        hasPlay: false,
        tag: "MagicWebsite",
      },
      {
        title: "Onkavia patient landing page",
        subtitle: "EMA Anchor · NSCLC",
        meta: "3 pages",
        aspect: "16/9",
        gradient: "linear-gradient(160deg,#3a1e4d,#63307a 48%,#a06bc4)",
        hasPlay: false,
        tag: "MagicWebsite",
      },
      {
        title: "Nirvexa congress microsite",
        subtitle: "MHRA Anchor · Immunology",
        meta: "4 pages",
        aspect: "16/9",
        gradient: "linear-gradient(160deg,#12332c,#1d5a4a 48%,#3f9c7f)",
        hasPlay: false,
        tag: "MagicWebsite",
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
    label: "Magic Canvas",
    title: "Layouts your reps actually use",
    items: [
      {
        title: "Velmora journal ad",
        subtitle: "FDA · Full-page · A4",
        meta: "A4",
        aspect: "3/4",
        gradient: "linear-gradient(150deg,#16233f,#2c4573 50%,#5b7fb8)",
        hasPlay: true,
        tag: "MagicCanvas",
        videoSrc: "/326638_medium.mp4",
      },
      {
        title: "Onkavia congress panel",
        subtitle: "EMA · 2×1m booth stand",
        meta: "2x1m",
        aspect: "16/9",
        gradient: "linear-gradient(150deg,#33193f,#5b2c70 50%,#9a63bc)",
        hasPlay: true,
        tag: "MagicCanvas",
        videoSrc: "/21617-319452308_medium.mp4",
      },
      {
        title: "Nirvexa payer infographic",
        subtitle: "HEOR summary · UK",
        meta: "1:1",
        aspect: "1/1",
        gradient: "linear-gradient(150deg,#0f2e28,#1b5546 50%,#3d9880)",
        hasPlay: true,
        tag: "MagicCanvas",
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
        gap: 14,
        padding: "36px 28px 30px",
        borderRadius: "var(--r-xl)",
        background: hovered ? "#fdfefe" : "#fff",
        border: hovered ? "1.5px solid var(--brand)" : "1px solid var(--hair)",
        boxShadow: hovered ? `0 20px 40px -14px ${tile.glow}` : "0 2px 6px rgba(0,0,0,0.02)",
        cursor: "pointer",
        textAlign: "center",
        transition: "all .28s cubic-bezier(0.16, 1, 0.3, 1)",
        position: "relative",
        minHeight: 260,
        overflow: "hidden",
      }}
      className="hover:-translate-y-1.5 group"
    >
      {/* Soft radial glow behind the icon — colorful backdrop */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: -34,
          left: "50%",
          width: 170,
          height: 170,
          borderRadius: "50%",
          background: tile.gradient,
          filter: "blur(38px)",
          opacity: hovered ? 0.42 : 0.24,
          transform: "translateX(-50%)",
          transition: "opacity .3s ease",
          pointerEvents: "none",
        }}
      />

      {/* Gradient icon badge — large, colorful, interactive */}
      <span
        style={{
          position: "relative",
          display: "grid",
          placeItems: "center",
          width: 68,
          height: 68,
          borderRadius: 20,
          flexShrink: 0,
          background: tile.gradient,
          color: "#fff",
          boxShadow: `0 14px 26px -10px ${tile.glow}, inset 0 1px 0 rgba(255,255,255,.35)`,
          transition: "transform .32s cubic-bezier(0.16, 1, 0.3, 1)",
          transform: hovered ? "scale(1.1) rotate(-6deg)" : "scale(1) rotate(0deg)",
        }}
      >
        <Icon size={30} strokeWidth={1.9} />
      </span>

      {/* Badge */}
      <span
        style={{
          position: "relative",
          fontSize: 9.5,
          fontWeight: 800,
          letterSpacing: ".04em",
          textTransform: "uppercase",
          color: "var(--brand-deep)",
          background: "var(--tint)",
          border: "1px solid var(--tint-line)",
          padding: "2px 8px",
          borderRadius: 99,
        }}
      >
        {tile.badge}
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

      {/* Description */}
      <p
        style={{
          position: "relative",
          fontSize: 13.5,
          color: "var(--ink-3)",
          margin: 0,
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
          boxShadow: hovered ? `0 10px 20px -10px ${tile.glow}` : "none",
          transition: "all .24s ease",
        }}
      >
        Get started
        <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
      </span>
    </button>
  );
}

/* ─── Showcase Item Card ─────────────────────────────────────────────────────── */
function ShowcaseCard({ item, onPlay }: { item: ShowcaseItem; onPlay: (item: ShowcaseItem) => void }) {
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Calculate width from aspect ratio
  const aspectW =
    item.aspect === "9/16"
      ? 125
      : item.aspect === "16/9"
      ? 260
      : item.aspect === "1/1"
      ? 140
      : item.aspect === "3/4"
      ? 135
      : 180;

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
        width: aspectW,
        height: 200,
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

      {/* Tag pill */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          fontSize: 9.5,
          fontWeight: 800,
          background: "rgba(0,0,0,.58)",
          color: "rgba(255,255,255,.95)",
          padding: "3px 8px",
          borderRadius: 6,
          backdropFilter: "blur(6px)",
          letterSpacing: ".03em",
        }}
      >
        {item.tag}
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
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 11px", zIndex: 10 }}>
        <b
          style={{
            display: "block",
            fontSize: 12.5,
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

import { MOCK_DOSSIERS } from "@/features/dossiers/mock-dossiers";
import type { BrandDossier } from "@/features/dossiers/dossier-types";

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

  const isDossierLane = lane.label === "Brand Dossiers";

  return (
    <div style={{ marginBottom: isLast ? 0 : 28 }}>
      {/* Lane header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: "var(--brand)",
              display: "block",
              marginBottom: 2,
            }}
          >
            {lane.label}
          </span>
          <h3
            style={{
              fontSize: 14.5,
              fontWeight: 800,
              letterSpacing: "-.3px",
              color: "var(--ink)",
              margin: 0,
            }}
          >
            {lane.title}
          </h3>
        </div>

        {/* Scroll arrows */}
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => scroll("left")}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: "1px solid var(--hair)",
              background: "#fff",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: "1px solid var(--hair)",
              background: "#fff",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
              <path d="M9 18l6-6-6-6" />
            </svg>
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
export function HomeScreen() {
  const router = useRouter();
  const [playingVideoItem, setPlayingVideoItem] = useState<ShowcaseItem | null>(null);

  function openTile(tile: TileOption) {
    if (tile.href === "/create") {
      useWorkspaceStore.getState().setView("create");
      useWorkspaceStore.getState().setVideoSubStage("mode-select");
    }
    if (tile.href !== "#") {
      router.push(tile.href);
    }
  }

  return (
    <div className="page-enter space-y-7 max-w-[1140px] pb-12">
      {/* Welcome + Start Here CTA */}
      <div className="pt-1 pb-1 flex items-center justify-between gap-5 flex-wrap">
        <div>
          <h1
            style={{
              fontSize: "clamp(24px, 2.5vw, 32px)",
              lineHeight: 1.2,
              fontWeight: 800,
              letterSpacing: "-0.8px",
              margin: 0,
              color: "var(--ink)",
            }}
          >
            Welcome back, <span style={{ color: "var(--brand)" }}>{PERSONA.firstName}.</span>
          </h1>
          <p className="mt-1.5 text-[14px] text-[var(--ink-3)] font-medium">
            Select a content workflow or explore verified medical showreels.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/dossiers")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "15px 26px",
            borderRadius: 99,
            fontWeight: 750,
            fontSize: 15,
            color: "#fff",
            background: "linear-gradient(180deg,#ff5b2d,var(--brand))",
            boxShadow: "0 16px 32px -14px rgba(253,72,22,.9),inset 0 1px 0 rgba(255,255,255,.32)",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
          className="hover:-translate-y-0.5 hover:scale-[1.02] transition-transform"
        >
          <Sparkles size={18} strokeWidth={2.2} />
          Start Here — upload dossier or brief
          <ArrowRight size={16} strokeWidth={2.4} />
        </button>
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

      {/* Showcase — 4 horizontal scrollable lanes */}
      <div
        style={{
          background: "#fff",
          borderRadius: "var(--r-xl)",
          border: "1px solid var(--hair)",
          boxShadow: "var(--sh-1)",
          padding: "22px 22px 20px",
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
    </div>
  );
}

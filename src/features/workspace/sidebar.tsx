"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, type ReactNode } from "react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Home,
  Clapperboard,
  Video,
  FileImage,
  Globe,
  FileText,
  Library,
  Package,
  ClipboardCheck,
  ShieldCheck,
  BarChart3,
  Settings,
} from "lucide-react";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { PERSONA } from "@/features/workspace/mock-personas";
import { LogoMark } from "@/components/ui/logo-mark";

/** Premium collapse/expand control — a small dark chip so it reads as a
 *  deliberate, discoverable control in both states, rather than an
 *  implicit "click the logo" affordance. */
function SidebarToggle({ collapsed, onClick }: { collapsed: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className="group grid size-8 shrink-0 place-items-center rounded-control border border-hair-2 text-ink-3 transition-all duration-200 hover:scale-105 hover:border-tint-line hover:text-brand-deep active:scale-95"
      style={{
        background: "linear-gradient(155deg,#ffffff,#f6f4f2)",
        boxShadow: "0 2px 6px -2px rgba(10,13,20,.1), inset 0 1px 0 rgba(255,255,255,.9)",
      }}
    >
      {collapsed ? (
        <PanelLeftOpen size={15} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-0.5" />
      ) : (
        <PanelLeftClose size={15} strokeWidth={2} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
      )}
    </button>
  );
}

interface CreateTile {
  label: string;
  icon: string;
  targetAsset: string;
}

const CREATE_TILES: CreateTile[] = [
  { label: "Video", icon: "video", targetAsset: "video" },
  { label: "Docs", icon: "image", targetAsset: "infographic" },
  { label: "Web", icon: "globe", targetAsset: "web" },
];

interface NavItem {
  label: string;
  shortLabel: string;
  icon: string;
  href: string;
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const ASSET_GROUPS: NavGroup[] = [
  {
    label: "Assets",
    items: [
      { label: "Product Library", shortLabel: "Products", icon: "package", href: "/product-library" },
      { label: "Content Library", shortLabel: "Contents", icon: "library", href: "#" },
      { label: "Claims Library", shortLabel: "Claims", icon: "claims", href: "#" },
    ],
  },
  {
    label: "Review",
    items: [
      { label: "MLR Review", shortLabel: "MLR", icon: "shield", href: "#", badge: 12 },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Analytics", shortLabel: "Analytics", icon: "chart", href: "/analytics" },
    ],
  },
];

/** A refined, single-family icon set (Lucide, 1.75 stroke) replacing the
 *  earlier hand-rolled SVGs — consistent geometry and weight across every
 *  row instead of each glyph being its own one-off shape. */
function NavIcon({ name }: { name: string }): ReactNode {
  const icons: Record<string, ReactNode> = {
    home: <Home size={16} strokeWidth={1.75} />,
    studio: <Clapperboard size={16} strokeWidth={1.75} />,
    studioFilled: <Clapperboard size={16} strokeWidth={1.75} fill="currentColor" fillOpacity={0.18} />,
    video: <Video size={16} strokeWidth={1.75} />,
    image: <FileImage size={16} strokeWidth={1.75} />,
    globe: <Globe size={16} strokeWidth={1.75} />,
    dossier: <FileText size={16} strokeWidth={1.75} />,
    library: <Library size={16} strokeWidth={1.75} />,
    package: <Package size={16} strokeWidth={1.75} />,
    claims: <ClipboardCheck size={16} strokeWidth={1.75} />,
    shield: <ShieldCheck size={16} strokeWidth={1.75} />,
    chart: <BarChart3 size={16} strokeWidth={1.75} />,
    settings: <Settings size={16} strokeWidth={1.75} />,
  };
  return <span className="flex shrink-0 items-center justify-center">{icons[name] ?? icons.home}</span>;
}

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const collapsed = useWorkspaceStore((s) => s.navCollapsed);
  const setCollapsed = useWorkspaceStore((s) => s.setNavCollapsed);
  const setAuthView = useWorkspaceStore((s) => s.setAuthView);
  const setView = useWorkspaceStore((s) => s.setView);
  const setVideoSubStage = useWorkspaceStore((s) => s.setVideoSubStage);
  const assetType = useWorkspaceStore((s) => s.assetType);

  const [menuOpen, setMenuOpen] = useState(false);
  const [createFlyoutOpen, setCreateFlyoutOpen] = useState(false);
  const flyoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  const sbw = collapsed ? 80 : 252;

  function handleSignOut() {
    setMenuOpen(false);
    setAuthView("signedout");
    router.push("/auth");
  }

  function handleCreateNav(targetAsset: string) {
    setCreateFlyoutOpen(false);
    if (targetAsset === "video") {
      useWorkspaceStore.getState().setAssetType("video");
      useWorkspaceStore.getState().setVideoSubStage("mode-select");
      useWorkspaceStore.getState().setView("create");
      router.push("/create");
    } else if (targetAsset === "infographic") {
      useWorkspaceStore.getState().setAssetType("infographic");
      useWorkspaceStore.getState().setCreationMode("magic-chart");
      useWorkspaceStore.getState().setVideoSubStage("mode-select");
      useWorkspaceStore.getState().setView("create");
      router.push("/create");
    }
  }

  const isHomeActive = pathname === "/";
  const isCreateActive = pathname.startsWith("/create");

  const handleMouseEnterCreate = () => {
    if (collapsed) {
      if (flyoutTimerRef.current) clearTimeout(flyoutTimerRef.current);
      setCreateFlyoutOpen(true);
    }
  };

  const handleMouseLeaveCreate = () => {
    if (collapsed) {
      flyoutTimerRef.current = setTimeout(() => {
        setCreateFlyoutOpen(false);
      }, 220);
    }
  };

  return (
    <div className="relative z-40 flex h-full shrink-0 p-3 select-none">
      {/* ─── Floating Island Glassy Sidebar ─── */}
      <aside
        style={{
          width: sbw,
          transition: "width 0.32s cubic-bezier(0.22, 1, 0.36, 1), border-radius 0.32s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        className={`relative flex h-full flex-col border border-hair bg-white/95 shadow-float backdrop-blur-xl transition-all overflow-hidden ${
          collapsed ? "rounded-panel" : "rounded-card"
        }`}
      >
        {/* Subtle inner top highlight — the premium "glass edge" cue */}
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
        {/* Top Header: brand mark + a premium toggle chip, present and
            equally discoverable in both collapsed and expanded states. */}
        <div className={`flex items-center pt-4 pb-2.5 px-4 ${collapsed ? "flex-col gap-2.5" : "justify-between"}`}>
          <div className="flex items-center gap-2.5 font-[800] text-title tracking-tight text-ink">
            <LogoMark size={24} className="text-brand" />
            {!collapsed && (
              <span>
                swish<span className="text-brand">X</span>
              </span>
            )}
          </div>

          <SidebarToggle collapsed={collapsed} onClick={() => setCollapsed(!collapsed)} />
        </div>

        {/* ── Scrollable Body with comfortable lateral padding ── */}
        <div className={`flex-1 overflow-y-auto ${collapsed ? "px-2" : "px-3"} py-2 scrollbar-none space-y-3.5`}>
          {/* ── HOME BUTTON ── */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                setView("home");
                router.push("/");
              }}
              title={collapsed ? "Home" : undefined}
              className={`group relative flex items-center rounded-control transition-all duration-200 ${
                collapsed
                  ? "w-[58px] flex-col justify-center py-2 px-1 gap-1"
                  : "w-full h-[42px] gap-3 px-3"
              } ${
                isHomeActive
                  ? "bg-brand text-white shadow-brand-lift"
                  : "text-ink-2 hover:bg-tint hover:text-brand-deep"
              }`}
            >
              <div
                className={`grid size-7 place-items-center rounded-chip transition-all shrink-0 ${
                  isHomeActive
                    ? "text-white"
                    : "text-ink-3 group-hover:text-brand"
                }`}
              >
                <NavIcon name="home" />
              </div>
              <span
                className={`tracking-tight ${
                  collapsed ? "text-caption leading-none" : "text-body-lg"
                } ${isHomeActive ? "font-[750] text-white" : "font-normal group-hover:font-bold text-ink"}`}
              >
                Home
              </span>
            </button>
          </div>

          {/* ── MAGIC STUDIO SECTION (single-column rows: Video, Creatives, Web) ── */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnterCreate}
            onMouseLeave={handleMouseLeaveCreate}
          >
            {!collapsed ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 px-2 pt-1 text-caption font-extrabold uppercase tracking-[0.14em] text-ink-3">
                  <span>Magic Studio</span>
                </div>

                {/* Single-column rows, soft-tint active state (not solid fill) */}
                {CREATE_TILES.map((tile) => {
                  const isTileActive =
                    isCreateActive &&
                    ((tile.targetAsset === "video" && assetType === "video") ||
                      (tile.targetAsset === "infographic" && assetType === "infographic"));
                  return (
                    <button
                      key={tile.label}
                      onClick={() => handleCreateNav(tile.targetAsset)}
                      className={`group flex w-full h-[40px] items-center gap-3 rounded-control px-3 text-left transition-all duration-150 cursor-pointer ${
                        isTileActive
                          ? "bg-brand text-white shadow-brand-lift font-bold"
                          : "text-ink-2 font-normal hover:font-bold hover:bg-tint hover:text-brand-deep"
                      }`}
                    >
                      <span className={`shrink-0 transition-colors ${isTileActive ? "text-white" : "text-ink-3 group-hover:text-brand"}`}>
                        <NavIcon name={tile.icon} />
                      </span>
                      <span className="truncate text-body-lg tracking-tight">{tile.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Collapsed Mode: Studio Icon with Solid Orange Filled Shape in Unselected, Solid Chip in Selected */
              <div className="flex flex-col items-center gap-1">
                <div className="my-1 h-px w-7 bg-gradient-to-r from-transparent via-hair-2 to-transparent" />
                <button
                  onClick={() => handleCreateNav("video")}
                  className={`group relative flex w-[58px] flex-col items-center justify-center rounded-control py-2 px-1 gap-1 transition-all duration-200 cursor-pointer ${
                    isCreateActive
                      ? "bg-brand text-white shadow-brand-lift"
                      : "text-ink-2 hover:bg-tint hover:text-brand-deep"
                  }`}
                  title="Studio"
                >
                  <div
                    className={`grid size-7 place-items-center rounded-chip transition-transform group-hover:scale-105 shrink-0 ${
                      isCreateActive ? "text-white" : "text-brand filter drop-shadow-brand-lift"
                    }`}
                  >
                    <NavIcon name="studioFilled" />
                  </div>
                  <span className={`text-caption tracking-tight leading-none text-center ${isCreateActive ? "font-[750] text-white" : "font-normal group-hover:font-bold text-ink"}`}>
                    Studio
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* ── ASSETS & REVIEW SECTIONS ── */}
          {ASSET_GROUPS.map((group) => (
            <div key={group.label} className="space-y-1.5">
              {!collapsed ? (
                <div className="px-2 pt-2 text-caption font-extrabold uppercase tracking-[0.14em] text-ink-3">
                  {group.label}
                </div>
              ) : (
                <div className="my-1.5 flex justify-center">
                  <div className="h-px w-7 bg-gradient-to-r from-transparent via-hair-2 to-transparent" />
                </div>
              )}

              {group.items.map((item) => {
                const isActive = item.href !== "#" && pathname.startsWith(item.href);
                return (
                  <div key={item.label} className="flex justify-center">
                    <button
                      onClick={() => {
                        if (item.href !== "#") router.push(item.href);
                      }}
                      title={collapsed ? item.label : undefined}
                      className={`group flex items-center rounded-control transition-all duration-150 ${
                        collapsed
                          ? "w-[58px] flex-col justify-center py-2 px-1 gap-1"
                          : "w-full h-[42px] gap-3 px-3"
                      } ${
                        isActive
                          ? "bg-brand text-white shadow-brand-lift"
                          : "text-ink-2 hover:bg-tint hover:text-brand-deep"
                      }`}
                    >
                      <span className={`shrink-0 ${isActive ? "text-white" : "text-ink-3 group-hover:text-brand"}`}>
                        <NavIcon name={item.icon} />
                      </span>
                      <span
                        className={`tracking-tight truncate ${
                          collapsed ? "text-caption leading-none" : "flex-1 text-left text-body-lg"
                        } ${isActive ? "font-[750] text-white" : "font-normal group-hover:font-bold text-ink"}`}
                      >
                        {collapsed ? item.shortLabel : item.label}
                      </span>
                      {!collapsed && item.badge !== undefined && (
                        <span className={`rounded-chip px-2 py-0.5 text-caption font-bold ${isActive ? "bg-white/25 text-white" : "bg-brand text-white"}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* ── Floating Bottom: Tokens & Profile ── */}
        <div className="relative border-t border-hair p-2 space-y-1.5">
          {/* Token chip */}
          {!collapsed && (
            <div className="flex items-center gap-2 rounded-control border border-tint-line bg-gradient-to-r from-tint to-white px-2.5 py-2">
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth={2.2}>
                <circle cx={12} cy={12} r={9} />
                <path d="M12 7v10M9 10h6" />
              </svg>
              <div className="min-w-0 flex-1">
                <span className="block text-label font-extrabold text-ink leading-none">2.45M Tokens</span>
                <span className="block text-micro uppercase font-bold text-ink-3 mt-0.5">Growth Plan</span>
              </div>
            </div>
          )}

          {/* User Account / Workspace Pill */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`flex w-full items-center rounded-control border border-hair bg-black/[0.02] p-1.5 text-left transition-all hover:bg-black/[0.05] ${
                collapsed ? "justify-center" : "gap-2.5"
              }`}
            >
              <span
                style={{ background: PERSONA.avatarGradient }}
                className="grid size-7 shrink-0 place-items-center rounded-full text-label font-[800] text-white shadow-xs"
              >
                {PERSONA.initials}
              </span>

              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <div className="truncate text-body font-bold text-ink leading-tight">{PERSONA.name}</div>
                  <div className="flex items-center gap-1 text-caption font-bold text-brand truncate mt-0.5">
                    <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <rect x={2} y={7} width={20} height={15} rx={2} />
                      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                    </svg>
                    <span className="truncate">{PERSONA.org}</span>
                  </div>
                </div>
              )}
            </button>

            {/* Profile Pop-up Menu */}
            {menuOpen && (
              <div
                style={{ animation: "spring-in 0.24s cubic-bezier(0.16, 1, 0.3, 1) both" }}
                className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-50 rounded-panel border border-hair bg-white/95 p-2 shadow-float backdrop-blur-2xl"
              >
                <div className="flex items-center gap-2.5 p-2 border-b border-hair">
                  <span
                    style={{ background: PERSONA.avatarGradient }}
                    className="grid size-8 shrink-0 place-items-center rounded-full text-body font-bold text-white"
                  >
                    {PERSONA.initials}
                  </span>
                  <div className="min-w-0">
                    <b className="block text-body-lg font-bold leading-tight">{PERSONA.name}</b>
                    <span className="block text-label text-ink-3 truncate">{PERSONA.email}</span>
                  </div>
                </div>

                <div className="py-1 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => router.push("/settings")}
                    className="flex w-full items-center gap-2 rounded-chip px-2.5 py-1.5 text-body font-medium text-ink-2 hover:bg-black/[0.04] text-left"
                  >
                    Profile &amp; Settings
                  </button>
                  <button className="flex w-full items-center justify-between rounded-chip px-2.5 py-1.5 text-body font-medium text-ink-2 hover:bg-black/[0.04] text-left">
                    <span>Switch Workspace</span>
                    <span className="rounded-glyph bg-black/[0.06] px-1.5 py-0.2 text-caption font-bold text-ink-3">3</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-chip px-2.5 py-1.5 text-body font-semibold text-danger hover:bg-danger-bg text-left"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Hover Flyout Grid for Collapsed Mode ── */}
      {collapsed && createFlyoutOpen && (
        <div
          onMouseEnter={handleMouseEnterCreate}
          onMouseLeave={handleMouseLeaveCreate}
          style={{
            position: "fixed",
            left: 92,
            top: 76,
            zIndex: 9999,
            animation: "spring-in 0.22s cubic-bezier(0.16, 1, 0.3, 1) both",
          }}
          className="w-[250px] rounded-card border border-hair bg-card p-3.5 shadow-float backdrop-blur-2xl"
        >
          <div className="flex items-center gap-2 pb-2.5 mb-2.5 border-b border-hair">
            <span className="grid size-6 place-items-center rounded-chip bg-tint text-brand">
              <NavIcon name="studioFilled" />
            </span>
            <span className="text-body-lg font-[800] tracking-tight text-ink">Studio</span>
          </div>

          <div className="space-y-1">
            {CREATE_TILES.map((tile) => {
              const isTileActive =
                isCreateActive &&
                ((tile.targetAsset === "video" && assetType === "video") ||
                  (tile.targetAsset === "infographic" && assetType === "infographic"));
              return (
                <button
                  key={tile.label}
                  onClick={() => handleCreateNav(tile.targetAsset)}
                  className={`group flex w-full items-center gap-2.5 rounded-control px-2.5 py-2 text-left transition-all duration-150 cursor-pointer ${
                    isTileActive
                      ? "bg-brand text-white shadow-brand-lift font-bold"
                      : "text-ink-2 font-normal hover:font-bold hover:bg-tint hover:text-brand-deep"
                  }`}
                >
                  <span className={`transition-colors ${isTileActive ? "text-white" : "text-ink-3 group-hover:text-brand"}`}>
                    <NavIcon name={tile.icon} />
                  </span>
                  <span className="truncate text-body-lg tracking-tight">{tile.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, type ReactNode } from "react";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { PERSONA } from "@/features/workspace/mock-personas";
import { LogoMark } from "@/components/ui/logo-mark";

interface CreateTile {
  label: string;
  icon: string;
  targetAsset: string;
}

const CREATE_TILES: CreateTile[] = [
  { label: "Video", icon: "video", targetAsset: "video" },
  { label: "Creatives", icon: "image", targetAsset: "infographic" },
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
      { label: "Brand Dossiers", shortLabel: "Brands", icon: "dossier", href: "/dossiers" },
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

function NavIcon({ name, active = false }: { name: string; active?: boolean }): ReactNode {
  const color = active ? "#fff" : "currentColor";
  const icons: Record<string, ReactNode> = {
    home: (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="size-4">
        <path d="M3 10.5L12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
      </svg>
    ),
    studio: (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="size-4">
        <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z" />
        <path d="M19 2l.8 2.2L22 5l-2.2.8L19 8l-.8-2.2L16 5l2.2-.8L19 2z" />
      </svg>
    ),
    studioFilled: (
      <svg viewBox="0 0 24 24" className="size-4">
        <path
          d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z"
          fill={active ? "#fff" : "var(--brand)"}
        />
        <path
          d="M19 2l.8 2.2L22 5l-2.2.8L19 8l-.8-2.2L16 5l2.2-.8L19 2z"
          fill={active ? "#fff" : "var(--brand)"}
        />
      </svg>
    ),
    video: (
      <svg viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "currentColor"} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="size-4">
        <rect x="2" y="5" width="15" height="14" rx="3" />
        <path d="M17 9.5l5-3.5v12l-5-3.5z" />
      </svg>
    ),
    image: (
      <svg viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "currentColor"} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="size-4">
        <rect x="3" y="3" width="18" height="18" rx="3.5" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
    globe: (
      <svg viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "currentColor"} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="size-4">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    dossier: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="size-4">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    library: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="size-4">
        <path d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    ),
    claims: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="size-4">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="m9 15 2 2 4-4" />
      </svg>
    ),
    shield: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="size-4">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    chart: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="size-4">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    settings: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="size-4">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 14.1a2 2 0 1 1 0-4 1.6 1.6 0 0 0 1.6-2.4l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 3.1V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1.3z" />
      </svg>
    ),
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
          transition: "width 0.32s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        className="relative flex h-full flex-col rounded-card border border-black/[0.08] bg-white/95 shadow-[0_8px_32px_-8px_rgba(10,13,20,0.08),0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xl transition-all overflow-hidden"
      >
        {/* Top Header: Logo (Click to expand if collapsed) + Minimize Button in Open State */}
        <div
          className={`flex items-center pt-4 pb-2.5 px-4 ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          {/* Logo Button: Expands when collapsed */}
          <button
            onClick={() => collapsed && setCollapsed(false)}
            title={collapsed ? "Click to expand sidebar" : undefined}
            className={`flex items-center gap-2.5 font-[800] text-title tracking-tight text-ink ${
              collapsed ? "cursor-pointer hover:scale-105 transition-transform" : "cursor-default"
            }`}
          >
            <LogoMark size={24} className="text-brand" />
            {!collapsed && (
              <span>
                swish<span className="text-brand">X</span>
              </span>
            )}
          </button>

          {/* Minimize toggle button ONLY visible in open state */}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              title="Collapse sidebar"
              className="flex size-7 items-center justify-center rounded-lg text-ink-3 hover:bg-black/5 hover:text-ink transition-colors"
            >
              <svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <rect x="3" y="4" width="18" height="16" rx="2.5" />
                <path d="M9 4v16" />
                <path d="M15 9l-2.5 3 2.5 3" />
              </svg>
            </button>
          )}
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
                  ? "bg-brand text-white shadow-[0_4px_14px_rgba(253,72,22,0.35)]"
                  : "text-ink-2 hover:bg-tint hover:text-brand-deep"
              }`}
            >
              <div
                className={`grid size-7 place-items-center rounded-[9px] transition-all shrink-0 ${
                  isHomeActive
                    ? "text-white"
                    : "text-ink-3 group-hover:text-brand"
                }`}
              >
                <NavIcon name="home" active={isHomeActive} />
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
                      className={`group flex w-full h-[40px] items-center gap-3 rounded-[12px] px-3 text-left transition-all duration-150 cursor-pointer ${
                        isTileActive
                          ? "bg-tint text-brand-deep font-bold"
                          : "text-ink-2 font-normal hover:font-bold hover:bg-tint hover:text-brand-deep"
                      }`}
                    >
                      <span className={`shrink-0 transition-colors ${isTileActive ? "text-brand" : "text-ink-3 group-hover:text-brand"}`}>
                        <NavIcon name={tile.icon} active={false} />
                      </span>
                      <span className="truncate text-body-lg tracking-tight">{tile.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Collapsed Mode: Studio Icon with Solid Orange Filled Shape in Unselected, Solid Chip in Selected */
              <div className="flex flex-col items-center gap-1">
                <div className="my-1 h-px w-6 bg-black/10" />
                <button
                  onClick={() => handleCreateNav("video")}
                  className={`group relative flex w-[58px] flex-col items-center justify-center rounded-control py-2 px-1 gap-1 transition-all duration-200 cursor-pointer ${
                    isCreateActive
                      ? "bg-brand text-white shadow-[0_4px_14px_rgba(253,72,22,0.35)]"
                      : "text-ink-2 hover:bg-tint hover:text-brand-deep"
                  }`}
                  title="Studio"
                >
                  <div
                    className={`grid size-7 place-items-center rounded-[9px] transition-transform group-hover:scale-105 shrink-0 ${
                      !isCreateActive ? "filter drop-shadow-[0_1px_4px_rgba(253,72,22,0.35)]" : ""
                    }`}
                  >
                    <NavIcon name="studioFilled" active={isCreateActive} />
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
                  <div className="h-px w-6 bg-black/10" />
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
                          ? "bg-brand text-white shadow-[0_4px_14px_rgba(253,72,22,0.35)]"
                          : "text-ink-2 hover:bg-tint hover:text-brand-deep"
                      }`}
                    >
                      <span className={`shrink-0 ${isActive ? "text-white" : "text-ink-3 group-hover:text-brand"}`}>
                        <NavIcon name={item.icon} active={isActive} />
                      </span>
                      <span
                        className={`tracking-tight truncate ${
                          collapsed ? "text-caption leading-none" : "flex-1 text-left text-body-lg"
                        } ${isActive ? "font-[750] text-white" : "font-normal group-hover:font-bold text-ink"}`}
                      >
                        {collapsed ? item.shortLabel : item.label}
                      </span>
                      {!collapsed && item.badge !== undefined && (
                        <span className={`rounded-full px-2 py-0.5 text-caption font-bold ${isActive ? "bg-white/25 text-white" : "bg-brand text-white"}`}>
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
        <div className="relative border-t border-black/[0.06] p-2 space-y-1.5">
          {/* Token chip */}
          {!collapsed && (
            <div className="flex items-center gap-2 rounded-[13px] border border-tint-line bg-gradient-to-r from-tint to-white px-2.5 py-2">
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
              className={`flex w-full items-center rounded-control border border-black/[0.06] bg-black/[0.02] p-1.5 text-left transition-all hover:bg-black/[0.05] ${
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
                className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-50 rounded-panel border border-black/[0.08] bg-white/95 p-2 shadow-[0_16px_36px_-8px_rgba(10,13,20,0.18)] backdrop-blur-2xl"
              >
                <div className="flex items-center gap-2.5 p-2 border-b border-black/[0.05]">
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
                  <button className="flex w-full items-center gap-2 rounded-chip px-2.5 py-1.5 text-body font-medium text-ink-2 hover:bg-black/[0.04] text-left">
                    Profile &amp; Settings
                  </button>
                  <button className="flex w-full items-center justify-between rounded-chip px-2.5 py-1.5 text-body font-medium text-ink-2 hover:bg-black/[0.04] text-left">
                    <span>Switch Workspace</span>
                    <span className="rounded bg-black/[0.06] px-1.5 py-0.2 text-caption font-bold text-ink-3">3</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-chip px-2.5 py-1.5 text-body font-semibold text-rose-600 hover:bg-rose-50 text-left"
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
          className="w-[250px] rounded-[22px] border border-black/[0.08] bg-white p-3.5 shadow-[0_20px_50px_-10px_rgba(10,13,20,0.22),0_4px_12px_rgba(0,0,0,0.05)] backdrop-blur-2xl"
        >
          <div className="flex items-center gap-2 pb-2.5 mb-2.5 border-b border-black/[0.06]">
            <span className="grid size-6 place-items-center rounded-lg bg-tint text-brand">
              <NavIcon name="studioFilled" active={false} />
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
                  className={`group flex w-full items-center gap-2.5 rounded-[12px] px-2.5 py-2 text-left transition-all duration-150 cursor-pointer ${
                    isTileActive
                      ? "bg-tint text-brand-deep font-bold"
                      : "text-ink-2 font-normal hover:font-bold hover:bg-tint hover:text-brand-deep"
                  }`}
                >
                  <span className={`transition-colors ${isTileActive ? "text-brand" : "text-ink-3 group-hover:text-brand"}`}>
                    <NavIcon name={tile.icon} active={false} />
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

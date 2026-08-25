"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { PERSONA } from "@/features/workspace/mock-personas";

interface NavItem {
  label: string;
  icon: string;
  href: string;
  indent?: boolean;
  soon?: boolean;
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Home", icon: "home", href: "/" },
    ],
  },
  {
    label: "Create",
    items: [
      { label: "Content Studio", icon: "studio", href: "/create" },
      { label: "Magic Video", icon: "video", href: "/create", indent: true },
      { label: "Magic Aid", icon: "layers", href: "#", soon: true, indent: true },
      { label: "Magic Mail", icon: "mail", href: "#", soon: true, indent: true },
      { label: "Magic Canvas", icon: "canvas", href: "#", indent: true },
      { label: "Magic Doc", icon: "doc", href: "#", soon: true, indent: true },
    ],
  },
  {
    label: "Library",
    items: [
      { label: "Brand Dossiers", icon: "dossier", href: "/dossiers" },
      { label: "Content Library", icon: "library", href: "#" },
      { label: "Templates", icon: "templates", href: "#" },
      { label: "Characters", icon: "characters", href: "#" },
      { label: "Claims Library", icon: "claims", href: "#" },
    ],
  },
  {
    label: "Activate",
    items: [
      { label: "MLR Review", icon: "shield", href: "#", badge: 12 },
      { label: "Campaigns", icon: "campaigns", href: "#" },
      { label: "Audience", icon: "audience", href: "#" },
      { label: "Re-engage", icon: "reengage", href: "#" },
    ],
  },
];

function NavIcon({ name }: { name: string }): ReactNode {
  const icons: Record<string, ReactNode> = {
    home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 10.5L12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>,
    studio: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l2.5 6.5L22 12l-6.5 2.5L13 21l-2.5-6.5L4 12l6.5-2.5z" /></svg>,
    video: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M5 3l14 9-14 9z" /></svg>,
    layers: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 2l9 5-9 5-9-5z" /><path d="M3 12l9 5 9-5M3 17l9 5 9-5" /></svg>,
    mail: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="5" width="20" height="14" rx="2.5" /><path d="M2 7l10 6 10-6" /></svg>,
    canvas: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="16" rx="2.5" /><path d="M3 15l5-5 4 4 3-3 6 6" /></svg>,
    doc: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>,
    dossier: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M2 4h7a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H2z" /><path d="M22 4h-7a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5H22z" /></svg>,
    library: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 7l2-3h5l2 3h9v12H3z" /></svg>,
    templates: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="16" rx="2.5" /><path d="M3 9h18M9 9v11" /></svg>,
    characters: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={12} cy={8} r={4} /><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" /></svg>,
    claims: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M7 7v10M11 7v10M17 7v10M21 7v10" /></svg>,
    shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 2l8 4v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6z" /></svg>,
    campaigns: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" /></svg>,
    audience: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={9} cy={8} r={3.5} /><path d="M2 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5" /><path d="M17 8.5a3.5 3.5 0 0 1 0 5" /></svg>,
    reengage: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 3v6h-6" /></svg>,
    settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={12} cy={12} r={3} /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 14.1a2 2 0 1 1 0-4 1.6 1.6 0 0 0 1.6-2.4l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 3.1V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1.3z" /></svg>,
  };
  return (
    <span style={{ width: 15, height: 15, display: "block", flexShrink: 0, opacity: 0.85 }}>
      {icons[name] ?? icons.home}
    </span>
  );
}

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const collapsed = useWorkspaceStore((s) => s.navCollapsed);
  const setCollapsed = useWorkspaceStore((s) => s.setNavCollapsed);
  const setAuthView = useWorkspaceStore((s) => s.setAuthView);
  const setView = useWorkspaceStore((s) => s.setView);
  const [menuOpen, setMenuOpen] = useState(false);

  const sbw = collapsed ? 74 : 248;

  function handleSignOut() {
    setMenuOpen(false);
    setAuthView("signedout");
    router.push("/auth");
  }

  return (
    <aside
      style={{
        width: sbw,
        flexShrink: 0,
        borderRight: "1px solid var(--hair)",
        display: "flex",
        flexDirection: "column",
        padding: collapsed ? "18px 10px 14px" : "18px 14px 14px",
        background: "#fff",
        position: "relative",
        zIndex: 2,
        transition: "width .26s var(--e)",
        overflow: "hidden",
      }}
    >
      {/* Top: logo + collapse toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", padding: "2px 6px 22px", flexDirection: collapsed ? "column" : "row", gap: collapsed ? 9 : 0 }}>
        {!collapsed ? (
          <div style={{ fontWeight: 800, fontSize: 18.5, letterSpacing: "-.7px", display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, background: "linear-gradient(140deg,#ff7a3d,var(--brand) 55%,#d8320c)", display: "grid", placeItems: "center", boxShadow: "0 10px 28px -8px rgba(253,72,22,.85),inset 0 1px 0 rgba(255,255,255,.4)", flexShrink: 0 }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4}><path d="M13 3l2.5 6.5L22 12l-6.5 2.5L13 21l-2.5-6.5L4 12l6.5-2.5z" /></svg>
            </span>
            SwishX
          </div>
        ) : (
          <span style={{ width: 26, height: 26, borderRadius: 8, background: "linear-gradient(140deg,#ff7a3d,var(--brand) 55%,#d8320c)", display: "grid", placeItems: "center", boxShadow: "0 10px 28px -8px rgba(253,72,22,.85),inset 0 1px 0 rgba(255,255,255,.4)" }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4}><path d="M13 3l2.5 6.5L22 12l-6.5 2.5L13 21l-2.5-6.5L4 12l6.5-2.5z" /></svg>
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand menu" : "Collapse menu"}
          style={{ width: 30, height: 30, borderRadius: 10, display: "grid", placeItems: "center", color: "var(--ink-3)", transition: ".2s var(--e)", flexShrink: 0 }}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: ".26s" }}>
            <rect x={3} y={4} width={18} height={16} rx={2.5} />
            <path d="M9 4v16" />
            <path d="M15 9l-2.5 3 2.5 3" />
          </svg>
        </button>
      </div>

      {/* Nav scroll area */}
      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "thin" }}>
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {/* Group label */}
            {!collapsed ? (
              <div style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--ink-4)", fontWeight: 800, padding: "15px 9px 7px" }}>{group.label}</div>
            ) : (
              <div style={{ height: 1, background: "var(--hair)", margin: "14px 8px 10px" }} />
            )}
            {group.items.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : item.href !== "#" && pathname.startsWith(item.href);
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    if (item.href !== "#") {
                      if (item.href === "/create") setView("create");
                      else if (item.href === "/") setView("home");
                      router.push(item.href);
                    }
                  }}
                  title={collapsed ? item.label : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: collapsed ? 0 : 11,
                    width: "100%",
                    padding: collapsed ? "11px 0" : "9px 10px",
                    borderRadius: 10,
                    fontSize: collapsed ? 0 : 13.5,
                    fontWeight: 560,
                    color: isActive ? "var(--brand)" : "var(--ink-2)",
                    background: isActive ? "var(--tint)" : "transparent",
                    justifyContent: collapsed ? "center" : "flex-start",
                    paddingLeft: !collapsed && item.indent ? 28 : undefined,
                    position: "relative",
                    transition: ".16s var(--e)",
                  }}
                >
                  {isActive && !collapsed && (
                    <span style={{ position: "absolute", left: -14, top: 8, bottom: 8, width: 3, borderRadius: "0 3px 3px 0", background: "var(--brand)" }} />
                  )}
                  <NavIcon name={item.icon} />
                  {!collapsed && (
                    <>
                      <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
                      {item.soon && (
                        <span style={{ fontSize: 9, letterSpacing: ".07em", background: "rgba(10,13,20,.06)", color: "var(--ink-4)", padding: "2px 6px", borderRadius: 5, fontWeight: 800 }}>SOON</span>
                      )}
                      {item.badge !== undefined && (
                        <span style={{ fontSize: 10.5, background: "var(--brand)", color: "#fff", padding: "1px 7px", borderRadius: 99, fontWeight: 750 }}>{item.badge}</span>
                      )}
                    </>
                  )}
                  {collapsed && item.badge !== undefined && (
                    <span style={{ position: "absolute", top: 4, right: 8, fontSize: 9, background: "var(--brand)", color: "#fff", padding: "0 5px", borderRadius: 99, fontWeight: 750 }}>{item.badge}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid var(--hair)", paddingTop: 10, marginTop: 10, position: "relative" }}>
        {/* Token credit chip */}
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 10px", borderRadius: 12, background: "linear-gradient(120deg,var(--tint),#fff)", border: "1px solid var(--tint-line)", marginBottom: 8 }}>
            <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth={2}><circle cx={12} cy={12} r={9} /><path d="M12 7v10M9 10h6" /></svg>
            <span>
              <b style={{ color: "var(--ink)", fontSize: 12.5, display: "block", margin: 0 }}>Tokens</b>
              <small style={{ display: "block", fontSize: 10, color: "var(--ink-4)", letterSpacing: ".04em", textTransform: "uppercase", fontWeight: 700 }}>Growth plan</small>
            </span>
            <b style={{ marginLeft: "auto", color: "var(--brand)", fontWeight: 800, fontSize: 13, letterSpacing: "-.2px" }}>2,450,000</b>
          </div>
        )}

        {/* Settings */}
        <button
          style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : 11, width: "100%", padding: collapsed ? "11px 0" : "9px 10px", borderRadius: 10, fontSize: collapsed ? 0 : 13.5, fontWeight: 560, color: "var(--ink-2)", justifyContent: collapsed ? "center" : "flex-start", marginBottom: 4 }}
          title={collapsed ? "Settings" : undefined}
        >
          <NavIcon name="settings" />
          {!collapsed && "Settings"}
        </button>

        {/* User button */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : 10, padding: collapsed ? "9px 0" : "9px 9px", borderRadius: 12, width: "100%", textAlign: "left", justifyContent: collapsed ? "center" : "flex-start" }}
          >
            <span style={{ width: 30, height: 30, borderRadius: "50%", background: PERSONA.avatarGradient, color: "#fff", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 750, flexShrink: 0 }}>{PERSONA.initials}</span>
            {!collapsed && (
              <span style={{ minWidth: 0 }}>
                <b style={{ fontSize: 13, display: "block", lineHeight: 1.25 }}>{PERSONA.name}</b>
                <span style={{ fontSize: 11, color: "var(--ink-4)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{PERSONA.email}</span>
              </span>
            )}
          </button>

          {/* User menu pop-up */}
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                left: 8,
                right: 8,
                bottom: 52,
                background: "#fff",
                border: "1px solid var(--hair-2)",
                borderRadius: "var(--r-l)",
                boxShadow: "var(--sh-3)",
                padding: 7,
                zIndex: 40,
                animation: "spring-in .26s var(--spring) both",
                transformOrigin: "bottom center",
              }}
            >
              {/* User header */}
              <div style={{ padding: "11px 11px 9px", display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ width: 34, height: 34, borderRadius: "50%", background: PERSONA.avatarGradient, color: "#fff", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 750, flexShrink: 0 }}>{PERSONA.initials}</span>
                <span style={{ minWidth: 0 }}>
                  <b style={{ fontSize: 13.5, display: "block" }}>{PERSONA.name}</b>
                  <span style={{ fontSize: 11.5, color: "var(--ink-4)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{PERSONA.email}</span>
                </span>
              </div>
              <div style={{ height: 1, background: "var(--hair)", margin: "6px 4px" }} />
              {[
                { label: "Profile & preferences" },
                { label: "Switch workspace", badge: "3" },
                { label: "Replay the product tour" },
                { label: "Security & sessions" },
              ].map((item) => (
                <button key={item.label} style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", padding: "10px 11px", borderRadius: 10, fontSize: 13.5, fontWeight: 560, textAlign: "left" }}>
                  {item.label}
                  {item.badge && <span style={{ marginLeft: "auto", fontSize: 10.5, background: "rgba(10,13,20,.08)", color: "var(--ink-3)", padding: "2px 6px", borderRadius: 6 }}>{item.badge}</span>}
                </button>
              ))}
              <div style={{ height: 1, background: "var(--hair)", margin: "6px 4px" }} />
              <button
                onClick={handleSignOut}
                style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", padding: "10px 11px", borderRadius: 10, fontSize: 13.5, fontWeight: 560, textAlign: "left", color: "#b91c1c" }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

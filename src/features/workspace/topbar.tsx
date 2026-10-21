"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSettingsStore } from "@/features/settings/settings-store";
import { canDecide, stepLabel, useWorkspaceReviewItems } from "@/features/review/review-store";
import { Menu, Play, Search, X } from "lucide-react";

import { Portal } from "@/components/ui/portal";
import { ViewAsSwitcher } from "@/features/settings/view-as";

interface TopbarProps {
  pageTitle?: string;
  /** Opens the off-canvas mobile navigation drawer. Only the hamburger
   *  button (mobile-only) calls this — desktop keeps the persistent
   *  sidebar and never renders the button. */
  onMenuClick?: () => void;
}

export function Topbar({ pageTitle = "Home", onMenuClick }: TopbarProps) {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <>
      <header
        style={{
          height: 62,
          flexShrink: 0,
          borderBottom: "1px solid var(--hair)",
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "0 22px",
          background: "rgba(251,250,249,.82)",
          backdropFilter: "blur(18px) saturate(1.4)",
          position: "relative",
          zIndex: 3,
        }}
      >
        {/* Mobile-only menu trigger — the persistent sidebar becomes an
            off-canvas drawer below the md breakpoint (see AppShell). */}
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation"
            className="grid size-8 shrink-0 place-items-center rounded-control text-ink-2 md:hidden"
          >
            <Menu size={18} />
          </button>
        )}

        {/* Page context */}
        <b style={{ fontSize: 14.5, fontWeight: 720, letterSpacing: "-.3px", color: "var(--ink)", flexShrink: 0 }}>{pageTitle}</b>

        {/* Centered search — visual affordance for now, wires up to real search later.
            The input itself is hidden below sm (no room for it alongside the
            menu trigger, title, and right-side icons on a phone), but the
            wrapper stays so it keeps acting as a flexible spacer. */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", minWidth: 0, padding: "0 24px" }}>
          <label
            className="hidden sm:flex"
            style={{
              alignItems: "center",
              gap: 8,
              width: "100%",
              maxWidth: 380,
              padding: "8px 12px",
              borderRadius: 99,
              border: "1px solid var(--hair-2)",
              background: "#fff",
              cursor: "text",
            }}
          >
            <Search size={14} color="var(--ink-4)" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search anything…"
              style={{ flex: 1, minWidth: 0, border: "none", outline: "none", fontSize: 13, color: "var(--ink)", background: "transparent" }}
            />
            <span
              style={{
                flexShrink: 0,
                fontSize: 10.5,
                fontWeight: 700,
                color: "var(--ink-4)",
                background: "var(--surface-subtle)",
                border: "1px solid var(--hair)",
                borderRadius: 6,
                padding: "2px 6px",
              }}
            >
              ⌘K
            </span>
          </label>
        </div>

        {/* Right-aligned: who the app is viewed as, Watch demo, icon buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <ViewAsSwitcher />
          <button
            type="button"
            onClick={() => setDemoOpen(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 13px", borderRadius: 99, border: "1px solid var(--hair-2)", background: "#fff", color: "var(--ink-2)", fontSize: 12.5, fontWeight: 700 }}
          >
            <Play size={11} fill="var(--brand)" color="var(--brand)" />
            Watch demo
          </button>

          {[
            { title: "Help", path: "M9.5 9.5a2.6 2.6 0 1 1 3.4 2.5c-.7.3-.9.8-.9 1.5v.5M12 17v.5" },
          ].map((btn) => (
            <button
              key={btn.title}
              title={btn.title}
              style={{ width: 36, height: 36, borderRadius: 10, display: "grid", placeItems: "center", color: "var(--ink-3)", position: "relative" }}
            >
              <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}><path d={btn.path} /></svg>
            </button>
          ))}
          <NotificationsMenu />
          {[
            { title: "Dark mode", path: "M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z", badge: false },
          ].map((btn) => (
            <button
              key={btn.title}
              title={btn.title}
              style={{ width: 36, height: 36, borderRadius: 10, display: "grid", placeItems: "center", color: "var(--ink-3)", position: "relative" }}
            >
              <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}><path d={btn.path} /></svg>
              {btn.badge && <span style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: "var(--brand)", border: "1.5px solid var(--canvas)" }} />}
            </button>
          ))}
        </div>
      </header>

      {/* Demo video modal — portalled to the body. The header's backdrop-filter
          establishes a containing block, and a "fixed" overlay rendered under it
          is trapped inside the header's own box. */}
      {demoOpen && (
        <Portal>
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setDemoOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-[820px] overflow-hidden rounded-card border border-white/20 bg-[#0d1017] shadow-2xl text-white select-none flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-black/40 shrink-0">
              <span className="text-body-lg font-bold text-white">SwishX in 90 seconds</span>
              <button
                type="button"
                onClick={() => setDemoOpen(false)}
                className="grid size-8 place-items-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition cursor-pointer shrink-0 ml-2"
              >
                <X size={15} />
              </button>
            </div>
            <div className="relative bg-black flex items-center justify-center overflow-hidden aspect-video max-h-[65vh]">
              <video src="/reel-moa.mp4" controls autoPlay playsInline className="size-full object-contain" />
            </div>
          </div>
        </div>
        </Portal>
      )}
    </>
  );
}

/**
 * The bell: what needs this person, worked out from the review funnel and the
 * team rather than a feed of its own. Items waiting on their review, their
 * submissions sent back or approved, and for admins, people asking to join.
 */
function NotificationsMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const items = useWorkspaceReviewItems();
  const members = useSettingsStore((s) => s.members);
  const me = useSettingsStore((s) => s.currentUserId);
  const isAdmin = useSettingsStore((s) => s.isAdmin);
  const joinRequests = useSettingsStore((s) => s.joinRequests);
  const nameOf = (id?: string) => members.find((m) => m.id === id)?.name ?? "A reviewer";

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!wrapRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const notes = [
    ...items.filter((i) => canDecide(i, me, members)).map((i) => ({
      id: `w-${i.id}`, tone: "brand" as const, href: "/mlr-review",
      title: `${i.title} is waiting for you`, detail: `${stepLabel(i)} · from ${nameOf(i.ownerId)}`,
    })),
    ...items.filter((i) => i.ownerId === me && i.status === "changes").map((i) => {
      const last = [...i.events].reverse().find((e) => e.kind === "changes");
      return { id: `c-${i.id}`, tone: "warn" as const, href: "/mlr-review", title: `Changes requested on ${i.title}`, detail: `${nameOf(last?.by)}: “${last?.note ?? ""}”` };
    }),
    ...items.filter((i) => i.ownerId === me && i.status === "approved").map((i) => ({
      id: `a-${i.id}`, tone: "ok" as const, href: "/mlr-review", title: `${i.title} was approved`, detail: `Published as ${i.version}. Sharing is open.`,
    })),
    ...(isAdmin ? joinRequests.map((r) => ({
      id: `j-${r.id}`, tone: "brand" as const, href: "/settings/team", title: `${r.name} asked to join`, detail: `${r.email} · ${r.requestedAt}`,
    })) : []),
  ];
  const actionable = notes.filter((n) => n.tone !== "ok").length;
  const dot = { brand: "var(--brand)", warn: "var(--warn)", ok: "var(--ok)" };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        type="button"
        title="Notifications"
        aria-label={actionable ? `Notifications, ${actionable} need you` : "Notifications"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={{ width: 36, height: 36, borderRadius: 10, display: "grid", placeItems: "center", color: "var(--ink-3)", position: "relative" }}
      >
        <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" /></svg>
        {actionable > 0 && <span style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: "var(--brand)", border: "1.5px solid var(--canvas)" }} />}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-panel border border-hair-2 bg-card shadow-float">
          <div className="border-b border-hair px-3.5 py-2.5 text-body font-bold text-ink">Notifications</div>
          {notes.length === 0 ? (
            <p className="px-3.5 py-6 text-center text-label text-ink-4">Nothing needs you right now.</p>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {notes.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => { setOpen(false); router.push(n.href); }}
                    className="flex w-full cursor-pointer items-start gap-2.5 border-b border-hair px-3.5 py-2.5 text-left last:border-b-0 hover:bg-subtle"
                  >
                    <span className="mt-1.5 size-2 shrink-0 rounded-full" style={{ background: dot[n.tone] }} />
                    <span className="min-w-0">
                      <span className="block text-body font-semibold text-ink">{n.title}</span>
                      <span className="block truncate text-caption text-ink-3">{n.detail}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

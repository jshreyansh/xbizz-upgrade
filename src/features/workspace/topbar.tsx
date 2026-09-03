"use client";

import { useState } from "react";
import { Play, X } from "lucide-react";

interface TopbarProps {
  pageTitle?: string;
}

export function Topbar({ pageTitle = "Home" }: TopbarProps) {
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
        {/* Page context */}
        <b style={{ fontSize: 14.5, fontWeight: 720, letterSpacing: "-.3px", color: "var(--ink)" }}>{pageTitle}</b>

        {/* Right-aligned: Watch demo + icon buttons */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
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
            { title: "Notifications", path: "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0", badge: true },
            { title: "Dark mode", path: "M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" },
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

      {/* Demo video modal — rendered as a sibling of <header>, not a child, since
          the header's backdrop-filter establishes a containing block that would
          otherwise trap this "fixed" overlay inside the header's own box. */}
      {demoOpen && (
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
              <span className="text-body-lg font-bold text-white">SwishX — 90 second tour</span>
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
      )}
    </>
  );
}

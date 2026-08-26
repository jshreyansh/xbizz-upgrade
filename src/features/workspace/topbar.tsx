"use client";

interface TopbarProps {
  pageTitle?: string;
}

export function Topbar({ pageTitle = "Home" }: TopbarProps) {
  return (
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

      {/* Demo pill */}
      <span style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 13px", border: "1px solid var(--tint-line)", background: "var(--tint)", color: "var(--brand-deep)", borderRadius: 99, fontSize: 12.5, fontWeight: 700 }}>
        <i style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--brand)", display: "block", animation: "blink 2s infinite" }} />
        Demo Mode
      </span>

      {/* Icon buttons */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
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
  );
}

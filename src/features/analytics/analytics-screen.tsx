"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCard {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "flat";
}

const STATS: StatCard[] = [
  { label: "Assets shipped", value: "128", delta: "+18% vs last month", trend: "up" },
  { label: "Avg. time to MLR approval", value: "2.4 days", delta: "-0.6 days", trend: "up" },
  { label: "Claims verified", value: "94%", delta: "+3 pts", trend: "up" },
  { label: "Active brand dossiers", value: "6", delta: "No change", trend: "flat" },
];

interface StudioRow {
  studio: string;
  color: string;
  assets: number;
  share: number;
}

const STUDIO_BREAKDOWN: StudioRow[] = [
  { studio: "Video", color: "#3d6bff", assets: 54, share: 42 },
  { studio: "Creatives", color: "#9b5bff", assets: 41, share: 32 },
  { studio: "Web", color: "#16b878", assets: 33, share: 26 },
];

interface TopAsset {
  title: string;
  studio: string;
  metric: string;
  status: "Approved" | "In MLR" | "Draft";
}

const TOP_ASSETS: TopAsset[] = [
  { title: "Velmora — MoA explainer", studio: "Video", metric: "1.2k views", status: "Approved" },
  { title: "Onkavia detail aid", studio: "Creatives", metric: "860 views", status: "Approved" },
  { title: "Nirvexa launch microsite", studio: "Web", metric: "540 visits", status: "In MLR" },
  { title: "Dr. Rao — dosing update", studio: "Video", metric: "410 views", status: "Draft" },
];

const STATUS_STYLE: Record<TopAsset["status"], { bg: string; color: string }> = {
  Approved: { bg: "var(--ok-bg)", color: "var(--ok)" },
  "In MLR": { bg: "var(--tint)", color: "var(--brand-deep)" },
  Draft: { bg: "var(--surface-subtle)", color: "var(--ink-3)" },
};

function TrendIcon({ trend }: { trend: StatCard["trend"] }) {
  if (trend === "up") return <TrendingUp size={13} color="var(--ok)" />;
  if (trend === "down") return <TrendingDown size={13} color="#dc2626" />;
  return <Minus size={13} color="var(--ink-4)" />;
}

export function AnalyticsScreen() {
  return (
    <div className="page-enter space-y-7 max-w-[1140px] pb-12">
      {/* Header */}
      <div>
        <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-4)", fontWeight: 800, marginBottom: 5 }}>
          Workspace Performance
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-1px", margin: "0 0 8px" }}>Analytics</h1>
        <p style={{ margin: 0, fontSize: 14.5, color: "var(--ink-3)", lineHeight: 1.6, maxWidth: "64ch" }}>
          How your content studios and dossiers are performing, at a glance.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {STATS.map((stat) => (
          <div
            key={stat.label}
            style={{ background: "#fff", border: "1px solid var(--hair)", borderRadius: "var(--r-l)", padding: "18px 18px 16px", boxShadow: "var(--sh-1)" }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: ".03em" }}>{stat.label}</span>
            <b style={{ display: "block", fontSize: 26, fontWeight: 800, color: "var(--ink)", letterSpacing: "-.6px", margin: "8px 0 6px" }}>{stat.value}</b>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 650, color: stat.trend === "up" ? "var(--ok)" : stat.trend === "down" ? "#dc2626" : "var(--ink-4)" }}>
              <TrendIcon trend={stat.trend} />
              {stat.delta}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16, alignItems: "start" }}>
        {/* Studio breakdown */}
        <div style={{ background: "#fff", border: "1px solid var(--hair)", borderRadius: "var(--r-xl)", padding: "22px 22px 20px", boxShadow: "var(--sh-1)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-.3px", color: "var(--ink)", margin: "0 0 4px" }}>Output by studio</h3>
          <p style={{ fontSize: 12.5, color: "var(--ink-3)", margin: "0 0 18px" }}>Share of assets shipped this month.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {STUDIO_BREAKDOWN.map((row) => (
              <div key={row.studio}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-2)" }}>{row.studio}</span>
                  <span style={{ fontSize: 12, color: "var(--ink-4)" }}>{row.assets} assets · {row.share}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 99, background: "var(--surface-subtle)", overflow: "hidden" }}>
                  <span style={{ display: "block", height: "100%", width: `${row.share}%`, background: row.color, borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top assets */}
        <div style={{ background: "#fff", border: "1px solid var(--hair)", borderRadius: "var(--r-xl)", padding: "22px 22px 20px", boxShadow: "var(--sh-1)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-.3px", color: "var(--ink)", margin: "0 0 4px" }}>Top performing assets</h3>
          <p style={{ fontSize: 12.5, color: "var(--ink-3)", margin: "0 0 16px" }}>Most viewed this month.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {TOP_ASSETS.map((asset) => {
              const style = STATUS_STYLE[asset.status];
              return (
                <div
                  key={asset.title}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 4px", borderBottom: "1px solid var(--hair)" }}
                >
                  <div style={{ minWidth: 0 }}>
                    <b style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{asset.title}</b>
                    <span style={{ fontSize: 11.5, color: "var(--ink-4)" }}>{asset.studio} · {asset.metric}</span>
                  </div>
                  <span style={{ flexShrink: 0, fontSize: 9.5, fontWeight: 800, letterSpacing: ".03em", textTransform: "uppercase", color: style.color, background: style.bg, padding: "2px 8px", borderRadius: 99 }}>
                    {asset.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

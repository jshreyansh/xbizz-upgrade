"use client";

import type { CSSProperties } from "react";
import type { SceneGraph } from "@/types/content";

/**
 * An animated chart as a scene layer.
 *
 * The animation is driven by `progress` — how far the playhead has travelled
 * through the graph's own window — and NOT by a CSS keyframe loop. That
 * matters for three reasons: the editor canvas and the published video show
 * the identical frame at the identical time, scrubbing to 11.2s shows what is
 * actually on screen at 11.2s rather than restarting the animation, and a
 * paused player holds a real frame instead of whatever the loop was mid-way
 * through.
 *
 * Bars grow in sequence rather than together, so the comparison reads in the
 * order the claim makes it: the product, then what it was measured against.
 */
export function SceneGraphLayer({
  graph,
  progress,
  style,
  compact = false,
}: {
  graph: SceneGraph;
  /** 0 to 1 through the graph's own in/out window. */
  progress: number;
  style?: CSSProperties;
  compact?: boolean;
}) {
  const clamped = Math.max(0, Math.min(1, progress));
  // Each bar gets its own slice of the first 70% of the window, in order; the
  // remaining 30% is the chart simply being read.
  const perBar = 0.7 / graph.series.length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: compact ? 4 : 8,
        padding: compact ? 8 : 14,
        borderRadius: 14,
        background: "rgba(8, 20, 16, 0.82)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(10px)",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: compact ? 8 : 11, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>
          {graph.title}
        </span>
        <span style={{ fontSize: compact ? 6 : 9, color: "rgba(255,255,255,0.55)", whiteSpace: "nowrap" }}>
          {graph.unit}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: compact ? 3 : 7 }}>
        {graph.series.map((bar, index) => {
          const start = index * perBar;
          const grown = Math.max(0, Math.min(1, (clamped - start) / perBar));
          const width = (bar.value / graph.max) * 100 * grown;

          return (
            <div key={bar.label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                <span
                  style={{
                    fontSize: compact ? 6 : 9,
                    fontWeight: bar.highlight ? 800 : 600,
                    color: bar.highlight ? "#fff" : "rgba(255,255,255,0.7)",
                  }}
                >
                  {bar.label}
                </span>
                {/* The number counts up with its own bar, so the figure and the
                    length always agree — a bar at half length beside its final
                    value would misread as the finished result. */}
                <span
                  style={{
                    fontSize: compact ? 6 : 9,
                    fontWeight: 800,
                    fontVariantNumeric: "tabular-nums",
                    color: bar.highlight ? "#d8f05d" : "rgba(255,255,255,0.75)",
                    opacity: grown > 0 ? 1 : 0,
                  }}
                >
                  {Math.round(bar.value * grown)}%
                </span>
              </div>
              <div
                style={{
                  height: compact ? 4 : 8,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.10)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${width}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: bar.highlight
                      ? "linear-gradient(90deg, #d8f05d, #a3d139)"
                      : "rgba(255,255,255,0.34)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {!compact && (
        <span style={{ fontSize: 8, color: "rgba(255,255,255,0.45)" }}>{graph.footnote}</span>
      )}
    </div>
  );
}

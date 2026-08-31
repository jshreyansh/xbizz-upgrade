"use client";

import React from "react";
import type { Scene } from "@/types/content";
import { scenes as defaultScenes } from "@/features/workspace/mock-data";

export interface SceneCompositionProps {
  scene?: Scene;
  brandName?: string;
  totalScenes?: number;
  compact?: boolean;
}

const sceneThemeColors = [
  { bg: "linear-gradient(135deg, #132b22 0%, #1f4236 60%, #0e2019 100%)", accent: "#d8f05d" },
  { bg: "linear-gradient(135deg, #153229 0%, #204c3d 60%, #102720 100%)", accent: "#a3e635" },
  { bg: "linear-gradient(135deg, #173d31 0%, #234d3f 62%, #142e27 100%)", accent: "#d8f05d" },
  { bg: "linear-gradient(135deg, #16362b 0%, #255444 60%, #112921 100%)", accent: "#86efac" },
  { bg: "linear-gradient(135deg, #122820 0%, #1c3d31 60%, #0c1c16 100%)", accent: "#d8f05d" },
];

export function DynamicSceneComposition({
  scene = defaultScenes[2],
  brandName = "DERMORA",
  totalScenes = 5,
}: SceneCompositionProps) {
  const currentTheme = sceneThemeColors[((scene.number || 1) - 1) % sceneThemeColors.length];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#173d31",
        color: "white",
        fontFamily: "Inter, system-ui, sans-serif",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* Background with Ambient Radial Glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 76% 34%, rgba(213,238,91,.15), transparent 32%), ${currentTheme.bg}`,
        }}
      />

      {/* 3D Kinetic Orbital Rings & Ambient Elements */}
      <div
        style={{
          position: "absolute",
          width: 430,
          height: 430,
          right: -80,
          top: -110,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,.14)",
          animation: "spin 20s linear infinite",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 58,
            top: 334,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: currentTheme.accent,
            boxShadow: `0 0 34px ${currentTheme.accent}`,
          }}
        />
      </div>

      {/* Right-Side Media & Graphics Showcase (Images & Video Clip elements) */}
      <div
        style={{
          position: "absolute",
          right: "6%",
          top: "14%",
          bottom: "16%",
          width: "38%",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        {/* Element 1: Clinical Trial Chart Graphic (Image Layer) */}
        <div
          style={{
            flex: 1,
            borderRadius: 14,
            background: "rgba(10, 24, 19, 0.75)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.16)",
            padding: "10px 14px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: currentTheme.accent,
                  background: "rgba(216,240,93,0.12)",
                  padding: "2px 6px",
                  borderRadius: 4,
                  border: "1px solid rgba(216,240,93,0.25)",
                }}
              >
                📊 Image Layer
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>
                Pivotal Readout
              </span>
            </div>
            <span style={{ fontSize: 9.5, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
              Wk 16 (p &lt; 0.001)
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "6px 0" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, fontWeight: 700, color: "white", marginBottom: 2 }}>
                <span>{brandName} 200mg</span>
                <span style={{ color: currentTheme.accent }}>78.4%</span>
              </div>
              <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: "78.4%", height: "100%", background: `linear-gradient(90deg, ${currentTheme.accent}, #22c55e)`, borderRadius: 3 }} />
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 2 }}>
                <span>Placebo Control</span>
                <span>21.1%</span>
              </div>
              <div style={{ width: "100%", height: 5, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: "21.1%", height: "100%", background: "rgba(255,255,255,0.4)", borderRadius: 3 }} />
              </div>
            </div>
          </div>

          <div style={{ fontSize: 8.5, color: "rgba(255,255,255,0.5)", display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 4 }}>
            <span>N=1,420 Patients</span>
            <span>FDA Label §14.1</span>
          </div>
        </div>

        {/* Element 2: 3D Microscopic Mechanism Video Clip Layer */}
        <div
          style={{
            flex: 0.9,
            borderRadius: 14,
            background: "rgba(8, 20, 16, 0.8)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.14)",
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Animated Video Clip Preview Thumbnail */}
          <div
            style={{
              width: 52,
              height: 42,
              borderRadius: 8,
              background: "linear-gradient(135deg, #0d382b, #1d6e53)",
              border: "1px solid rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "6px solid #112921",
                  borderTop: "3.5px solid transparent",
                  borderBottom: "3.5px solid transparent",
                  marginLeft: 1.5,
                }}
              />
            </div>
            <span
              style={{
                position: "absolute",
                bottom: 2,
                right: 3,
                fontSize: 7.5,
                fontWeight: 800,
                color: "white",
                background: "rgba(0,0,0,0.7)",
                padding: "0.5px 3px",
                borderRadius: 2,
              }}
            >
              0:14s
            </span>
          </div>

          {/* Video Metadata */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span
                style={{
                  fontSize: 8.5,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#38bdf8",
                  background: "rgba(56, 189, 248, 0.12)",
                  padding: "1px 5px",
                  borderRadius: 3,
                }}
              >
                🎬 Video Clip
              </span>
              <span style={{ fontSize: 8.5, color: "rgba(255,255,255,0.6)" }}>4K · 60fps</span>
            </div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "white", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              3D Receptor Binding Kinematics
            </div>
          </div>
        </div>
      </div>

      {/* Structured Scene Content Overlay */}
      <div
        style={{
          position: "relative",
          display: "flex",
          height: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "6% 7%",
          zIndex: 15,
        }}
      >
        {/* Top Tag & Pillar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,.75)",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 24,
              height: 2.5,
              background: currentTheme.accent,
              borderRadius: 2,
            }}
          />
          {scene.narrativeTag || "PIVOTAL EVIDENCE"}
        </div>

        {/* Core Headline & Narration Subtitle */}
        <div style={{ maxWidth: "52%" }}>
          <div
            style={{
              fontSize: 26,
              lineHeight: 1.15,
              fontWeight: 800,
              letterSpacing: "-.035em",
              color: "#ffffff",
              textShadow: "0 2px 12px rgba(0,0,0,0.3)",
            }}
          >
            {scene.title}
          </div>
          <div
            style={{
              marginTop: 10,
              fontSize: 12.5,
              lineHeight: 1.45,
              color: "rgba(255,255,255,.85)",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {scene.narration}
          </div>
        </div>

        {/* Bottom Metadata & Compliance Footnote */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 10,
            color: "rgba(255,255,255,.55)",
            borderTop: "1px solid rgba(255,255,255,.1)",
            paddingTop: 10,
          }}
        >
          <span>{brandName}® · For US Healthcare Professionals Only</span>
          <span>
            Scene 0{scene.number} / 0{totalScenes}
          </span>
        </div>
      </div>
    </div>
  );
}

// Backward-compatible export for existing DermoraComposition
export function DermoraComposition() {
  return <DynamicSceneComposition />;
}

// Master Video Sequence Composition that renders the active scene
export function MasterVideoSequenceComposition({
  sceneList = defaultScenes,
  activeScene,
  brandName = "DERMORA",
}: {
  sceneList?: Scene[];
  activeScene?: Scene;
  brandName?: string;
}) {
  const currentScene = activeScene || sceneList[0] || defaultScenes[0];

  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#111815" }}>
      <DynamicSceneComposition
        scene={currentScene}
        brandName={brandName}
        totalScenes={sceneList.length}
      />
    </div>
  );
}

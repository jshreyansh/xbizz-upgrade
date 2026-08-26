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

      {/* 3D Kinetic Orbital Rings (Pure CSS Rotation & Pulse) */}
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

      <div
        style={{
          position: "absolute",
          width: 250,
          height: 250,
          right: 30,
          top: 0,
          borderRadius: "50%",
          border: "28px solid rgba(255,255,255,.035)",
        }}
      />

      {/* Structured Scene Content Overlay */}
      <div
        style={{
          position: "relative",
          display: "flex",
          height: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "7% 8%",
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
        <div style={{ maxWidth: "70%" }}>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.12,
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
              marginTop: 12,
              fontSize: 13,
              lineHeight: 1.5,
              color: "rgba(255,255,255,.82)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
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

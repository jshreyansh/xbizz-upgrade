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

      {/* Right-Side Media & Graphics Showcase (Rendered selectively for ~60% of scenes) */}
      {scene.mediaType && scene.mediaType !== "none" && (
        <div
          style={{
            position: "absolute",
            right: "5%",
            top: "12%",
            bottom: "14%",
            width: "42%",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          {/* If scene has an image or both (e.g. Scene 3 Anatomical Heart) */}
          {(scene.mediaType === "image" || scene.mediaType === "both") && (
            <div
              style={{
                flex: scene.mediaType === "both" ? 1.1 : 1,
                borderRadius: 16,
                background: "rgba(10, 24, 19, 0.75)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                boxShadow: "0 10px 36px rgba(0,0,0,0.4)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Real Anatomical Heart Image */}
              <div
                style={{
                  width: 90,
                  height: 100,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.5))",
                }}
              >
                <img
                  src={scene.mediaImageSrc || "/anatomical-heart.png"}
                  alt={scene.mediaLabel || "Anatomical Model"}
                  style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                />
              </div>

              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
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
                    🫀 Image Asset
                  </span>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.6)" }}>Draggable</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "white", marginTop: 4 }}>
                  {scene.mediaLabel || "Anatomical Cardiac Structure"}
                </div>
                <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>
                  Grounded in FDA Dossier §4.2
                </div>
              </div>
            </div>
          )}

          {/* If scene has a video or both (e.g. Scene 2, Scene 3, Scene 4) */}
          {(scene.mediaType === "video" || scene.mediaType === "both") && (
            <div
              style={{
                flex: scene.mediaType === "both" ? 1 : 1.4,
                borderRadius: 16,
                background: "rgba(8, 20, 16, 0.85)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                overflow: "hidden",
                boxShadow: "0 10px 36px rgba(0,0,0,0.4)",
                position: "relative",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Real Video Player */}
              <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
                <video
                  src={scene.mediaVideoSrc || "/reel-moa.mp4"}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />

                {/* Video Badges */}
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    zIndex: 2,
                  }}
                >
                  <span
                    style={{
                      fontSize: 8.5,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#38bdf8",
                      background: "rgba(15, 23, 42, 0.75)",
                      backdropFilter: "blur(6px)",
                      padding: "2px 6px",
                      borderRadius: 4,
                      border: "1px solid rgba(56, 189, 248, 0.4)",
                    }}
                  >
                    🎬 Video Clip
                  </span>
                  <span
                    style={{
                      fontSize: 8.5,
                      fontWeight: 700,
                      color: "white",
                      background: "rgba(0,0,0,0.6)",
                      padding: "2px 5px",
                      borderRadius: 4,
                    }}
                  >
                    4K · 60fps
                  </span>
                </div>

                <div
                  style={{
                    position: "absolute",
                    bottom: 8,
                    left: 8,
                    right: 8,
                    background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                    padding: "6px 8px 2px",
                    borderRadius: "0 0 8px 8px",
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {scene.mediaLabel || "3D Mechanism Kinematics"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
        <div style={{ maxWidth: scene.mediaType && scene.mediaType !== "none" ? "52%" : "82%" }}>
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

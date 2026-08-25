import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export function DermoraComposition() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const intro = spring({ frame, fps, config: { damping: 18, stiffness: 72 } });
  const orbit = interpolate(frame, [0, 300], [0, 360], { extrapolateRight: "extend" });
  const pulse = 0.7 + Math.sin(frame / 16) * 0.12;

  return (
    <AbsoluteFill style={{ background: "#173d31", color: "white", fontFamily: "Inter, system-ui, sans-serif", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 76% 34%, rgba(213,238,91,.12), transparent 29%), linear-gradient(135deg, #173d31 0%, #234d3f 62%, #142e27 100%)" }} />
      <div style={{ position: "absolute", width: 430, height: 430, right: -80, top: -110, borderRadius: "50%", border: "1px solid rgba(255,255,255,.12)", transform: `rotate(${orbit}deg)` }}>
        <div style={{ position: "absolute", left: 58, top: 334, width: 24, height: 24, borderRadius: "50%", background: "#d8f05d", boxShadow: "0 0 34px rgba(216,240,93,.55)", transform: `scale(${pulse})` }} />
      </div>
      <div style={{ position: "absolute", width: 250, height: 250, right: 30, top: 0, borderRadius: "50%", border: "28px solid rgba(255,255,255,.035)" }} />
      <div style={{ position: "relative", display: "flex", height: "100%", flexDirection: "column", justifyContent: "space-between", padding: "8% 8.5%", opacity: intro, transform: `translateY(${(1 - intro) * 18}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, fontWeight: 750, letterSpacing: ".18em", color: "rgba(255,255,255,.62)" }}>
          <span style={{ display: "inline-block", width: 24, height: 2, background: "#d8f05d" }} /> PIVOTAL EVIDENCE
        </div>
        <div style={{ maxWidth: "67%" }}>
          <div style={{ fontSize: 30, lineHeight: 1.06, fontWeight: 720, letterSpacing: "-.04em" }}>A clearer view of the clinical response.</div>
          <div style={{ marginTop: 13, fontSize: 12, lineHeight: 1.55, color: "rgba(255,255,255,.7)" }}>CLEARSKIN primary endpoint · Week 16</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 9, color: "rgba(255,255,255,.48)" }}>
          <span>DERMORA® · For US HCP audiences</span><span>Scene 03 / 05</span>
        </div>
      </div>
    </AbsoluteFill>
  );
}

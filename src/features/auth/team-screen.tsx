"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ClipboardCheck, Clapperboard, Compass, PenLine, ShieldCheck, type LucideIcon } from "lucide-react";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { TEAM, type TeamMember } from "@/features/workspace/mock-personas";
import { Mascot, mascotColour } from "@/features/workspace/mascot";

/**
 * The last sign-up step: the specialists who work inside the studio.
 *
 * Shown as the chain they are — each one hands something to the next, and
 * nothing moves on until it has been checked — rather than five unrelated
 * cards. Each is a character of its own shape and colour, watching the
 * pointer and smiling when you reach them, with the icon of what they do.
 */

const ICON: Record<TeamMember["key"], LucideIcon> = {
  amber: Compass,
  brand: PenLine,
  green: ShieldCheck,
  blue: Clapperboard,
  violet: ClipboardCheck,
};

export function TeamScreen() {
  const router = useRouter();
  const setIsFirstRun = useWorkspaceStore((s) => s.setIsFirstRun);
  const [hovered, setHovered] = useState<number | null>(null);

  /* Straight into the studio: sign-up has already said what it needed to. */
  function enterApp() {
    setIsFirstRun(false);
    router.push("/");
  }

  return (
    <div className="stage-in flex h-full w-full items-center justify-center overflow-y-auto p-11">
      <div style={{ width: "100%", maxWidth: 1080, textAlign: "center", color: "#fff" }}>
        <div style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,255,255,.62)", fontWeight: 700, marginBottom: 22, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
          <span style={{ width: 22, height: 1, background: "linear-gradient(90deg,var(--brand),transparent)", display: "inline-block" }} />
          Step 4 of 4 · Your co-workers
        </div>
        <h2 style={{ fontSize: "clamp(32px,3.6vw,46px)", letterSpacing: "-1.9px", margin: "0 0 12px", fontWeight: 800 }}>Five specialists. One record of truth.</h2>
        <p style={{ color: "rgba(255,255,255,.68)", fontSize: 16, margin: "0 auto 44px", maxWidth: "58ch", lineHeight: 1.62 }}>
          They work as a chain. Each one hands their work to the next, every line is cited to an approved source, and nothing reaches your asset until it has been checked.
        </p>

        <div style={{ display: "flex", alignItems: "stretch", justifyContent: "center" }}>
          {TEAM.map((member, i) => {
            const Icon = ICON[member.key];
            return (
              <div
                key={member.name}
                onPointerEnter={() => setHovered(i)}
                onPointerLeave={() => setHovered((h) => (h === i ? null : h))}
                style={{ display: "flex", alignItems: "stretch", flex: "1 1 0", minWidth: 0 }}
              >
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    background: "rgba(255,255,255,.055)",
                    border: "1px solid rgba(255,255,255,.13)",
                    backdropFilter: "blur(18px)",
                    borderRadius: "var(--r-l)",
                    padding: "22px 14px 16px",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    animation: `slide-up .8s var(--spring) ${0.08 + i * 0.12}s both`,
                  }}
                >
                  <span style={{ position: "absolute", inset: "0 0 auto", height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent)" }} />
                  {/* Their colour, faintly, behind the portrait. */}
                  <span aria-hidden style={{ position: "absolute", top: -60, left: "50%", width: 180, height: 180, transform: "translateX(-50%)", borderRadius: "50%", background: mascotColour(member.key), opacity: 0.14, filter: "blur(34px)" }} />

                  <div style={{ position: "relative", width: 84, height: 84, marginBottom: 14 }}>
                    <Mascot who={member.key} size={84} follow mood={hovered === i ? "happy" : "idle"} />
                    <span
                      title={member.name}
                      style={{
                        position: "absolute",
                        right: -6,
                        bottom: -2,
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        background: "#1b1714",
                        border: `1.5px solid ${mascotColour(member.key)}`,
                      }}
                    >
                      <Icon size={13} strokeWidth={2.4} color={mascotColour(member.key)} />
                    </span>
                  </div>

                  <b style={{ display: "block", fontSize: 14, marginBottom: 6, position: "relative" }}>{member.name}</b>
                  <span style={{ fontSize: 11.5, color: "rgba(255,255,255,.58)", lineHeight: 1.55, display: "block", position: "relative" }}>{member.role}</span>

                  <span style={{ flex: 1, minHeight: 14 }} />
                  <span
                    style={{
                      position: "relative",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      maxWidth: "100%",
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: "rgba(255,255,255,.82)",
                      background: "rgba(255,255,255,.07)",
                      border: "1px solid rgba(255,255,255,.12)",
                      borderRadius: 999,
                      padding: "4px 10px",
                      lineHeight: 1.35,
                      textAlign: "left",
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: mascotColour(member.key), flexShrink: 0 }} />
                    <span>{i === TEAM.length - 1 ? `Delivers ${member.handsOn.toLowerCase()}` : `Hands on ${member.handsOn.toLowerCase()}`}</span>
                  </span>
                </div>

                {/* The hand-off to the next specialist. */}
                {i < TEAM.length - 1 && (
                  <div aria-hidden style={{ width: 22, flexShrink: 0, display: "grid", placeItems: "center", animation: `fadeIn .6s ease ${0.3 + i * 0.12}s both` }}>
                    <span style={{ width: 20, height: 20, borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.16)" }}>
                      <ChevronRight size={12} color="rgba(255,255,255,.7)" />
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={enterApp}
          style={{
            marginTop: 44,
            padding: "15px 32px",
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            borderRadius: "var(--r)",
            fontWeight: 680,
            fontSize: 15,
            background: "linear-gradient(180deg,#ff5b2d,var(--brand))",
            color: "#fff",
            boxShadow: "0 12px 26px -14px rgba(253,72,22,.95),inset 0 1px 0 rgba(255,255,255,.28)",
          }}
        >
          Enter SwishX
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BrandDossier } from "@/features/dossiers/dossier-types";
import { DOCUMENT_TYPES, PHARMA_SECTIONS } from "@/features/dossiers/dossier-wizard-data";

/**
 * A dossier, read.
 *
 * Lifted out of the wizard's final step, which is where it was born and the
 * only place it could be seen. It is the same document in three places now —
 * the Brand Dossiers page, a product's dossier route, and a modal from the
 * studio's claims panel — and the whole point of a master document is that
 * everyone is looking at the same one.
 *
 * Its own state: which section is open, who a copy is going to, and which
 * flagged claims have been dealt with. None of that belongs to the wizard,
 * and a modal needs it as much as a page does.
 */
export function DossierReader({
  dossier: activeDossier,
  onCreateVideo,
}: {
  dossier: BrandDossier;
  /** Absent in the modal, where there is no room to start a project. */
  onCreateVideo?: (() => void) | null;
}) {
  const router = useRouter();
  const [activeSectionId, setActiveSectionId] = useState<string>(
    activeDossier.sections[0]?.id || "sec-a1"
  );
  const [showSendMenu, setShowSendMenu] = useState(false);
  const [sendRecipients, setSendRecipients] = useState<string[]>([]);
  const [sentAt, setSentAt] = useState<string | null>(null);
  const [claimsPanelOpen, setClaimsPanelOpen] = useState(false);
  const [resolvedClaims, setResolvedClaims] = useState<Record<string, "pending" | "accepted" | "rejected">>({});

  function toggleSendRecipient(role: string) {
    setSendRecipients((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  }

  function sendToTeam() {
    if (sendRecipients.length === 0) return;
    setSentAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    setShowSendMenu(false);
  }

  const createMagicVideo = onCreateVideo ?? (() => router.push("/create"));

  return (

      <div className="rise-in space-y-6">
        {/* Top Dossier Summary Card */}
        <div
          style={{
            background: "#fff",
            borderRadius: "var(--r-xl)",
            border: "1px solid var(--hair)",
            padding: "26px 28px",
            boxShadow: "var(--sh-1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 16,
                background: activeDossier.gradient,
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontSize: 20,
                fontWeight: 800,
              }}
            >
              {activeDossier.initials}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.8px", margin: 0 }}>{activeDossier.brandName}</h1>
                <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 99, background: "var(--ok-bg)", color: "var(--ok)", border: "1px solid var(--ok-line)" }}>
                  {activeDossier.regulatoryAnchor} Anchor · {activeDossier.status === "complete" ? "Approved" : "Live"}
                </span>
              </div>
              <p style={{ margin: "3px 0 0", fontSize: 13.5, color: "var(--ink-3)" }}>
                {activeDossier.genericName} — {activeDossier.indication}
              </p>
              {activeDossier.approvals.every((a) => a.status === "approved") && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                  <div style={{ display: "flex" }}>
                    {activeDossier.approvals.map((a, i) => (
                      <span
                        key={a.role}
                        title={`${a.name} · ${a.role}`}
                        style={{
                          width: 20, height: 20, borderRadius: "50%", background: a.gradient,
                          display: "grid", placeItems: "center", color: "#fff", fontSize: 8.5, fontWeight: 800,
                          border: "2px solid #fff", marginLeft: i === 0 ? 0 : -6,
                        }}
                      >
                        {a.initials}
                      </span>
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: "var(--ink-4)" }}>
                    Approved by {activeDossier.approvals.map((a) => a.name).join(", ")}
                  </span>
                </div>
              )}

              {/* Document meta strip — makes this read as a formal master document, not a screen */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--hair)" }}>
                {[
                  ["Document type", DOCUMENT_TYPES.find((d) => d.type === activeDossier.documentType)?.label || "Commercial dossier"],
                  ["Sections", `${activeDossier.sections.length} of ${PHARMA_SECTIONS.length}`],
                  ["Claims cited", String(activeDossier.claimsCited)],
                  ["Last updated", activeDossier.lastUpdated],
                ].map(([k, v]) => (
                  <div key={k}>
                    <span style={{ display: "block", fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-4)", fontWeight: 700 }}>{k}</span>
                    <b style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)" }}>{v}</b>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, position: "relative" }}>
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowSendMenu((v) => !v)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "11px 16px", borderRadius: "var(--r)", fontWeight: 700, fontSize: 14,
                  background: "#fff", border: "1px solid var(--hair-2)", color: "var(--ink-2)", cursor: "pointer",
                }}
              >
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13M22 2 15 22l-4-9-9-4z" /></svg>
                Send to team
                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
              </button>

              {showSendMenu && (
                <div
                  style={{
                    position: "absolute", top: "calc(100% + 8px)", right: 0, width: 260, zIndex: 20,
                    background: "#fff", borderRadius: "var(--r-l)", border: "1px solid var(--hair)", boxShadow: "var(--sh-3)", overflow: "hidden",
                  }}
                >
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--hair)", fontSize: 11.5, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--ink-4)" }}>
                    Notify internal team
                  </div>
                  <div style={{ padding: "6px 0" }}>
                    {activeDossier.approvals.map((a) => (
                      <label key={a.role} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={sendRecipients.includes(a.role)}
                          onChange={() => toggleSendRecipient(a.role)}
                          style={{ accentColor: "var(--brand)", width: 15, height: 15 }}
                        />
                        <span style={{ width: 24, height: 24, borderRadius: "50%", background: a.gradient, color: "#fff", fontSize: 9, fontWeight: 800, display: "grid", placeItems: "center", flexShrink: 0 }}>{a.initials}</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{a.name}</span>
                      </label>
                    ))}
                  </div>
                  <div style={{ padding: 12, borderTop: "1px solid var(--hair)" }}>
                    <button
                      onClick={sendToTeam}
                      disabled={sendRecipients.length === 0}
                      style={{
                        width: "100%", padding: "10px", borderRadius: "var(--r)", fontWeight: 700, fontSize: 13,
                        background: sendRecipients.length ? "var(--ink)" : "var(--hair-2)",
                        color: sendRecipients.length ? "#fff" : "var(--ink-4)",
                        border: "none", cursor: sendRecipients.length ? "pointer" : "default",
                      }}
                    >
                      Send {sendRecipients.length > 0 ? `to ${sendRecipients.length}` : ""}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {onCreateVideo !== null && (
            <button
              onClick={createMagicVideo}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "11px 20px",
                borderRadius: "var(--r)",
                fontWeight: 700,
                fontSize: 14,
                background: "linear-gradient(180deg,#ff5b2d,var(--brand))",
                color: "#fff",
                border: "none",
                boxShadow: "0 12px 26px -14px rgba(253,72,22,.9)",
                cursor: "pointer",
              }}
            >
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
                <path d="M5 3l14 9-14 9z" />
              </svg>
              Create Magic Video from Dossier
            </button>
            )}
          </div>
        </div>

        {sentAt && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 16px", borderRadius: "var(--r)", background: "var(--ok-bg)", border: "1px solid var(--ok-line)", color: "var(--ok)", fontSize: 13, fontWeight: 650 }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l6 6L20 5" /></svg>
            Sent to {sendRecipients.join(", ")} at {sentAt}
          </div>
        )}

        {/* Master document: Collapsible Index (left) + Section preview (middle) + Claims Verification Drawer (right) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: claimsPanelOpen ? "72px minmax(0, 1fr) 390px" : "320px minmax(0, 1fr)",
            gap: 20,
            alignItems: "start",
            transition: "grid-template-columns 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* ── LEFT INDEX PANEL (Expands to 320px or collapses to 72px numbers 01, 02, 03...) ── */}
          <div
            style={{
              background: "#fff",
              borderRadius: "var(--r-xl)",
              border: "1px solid var(--hair)",
              boxShadow: "var(--sh-1)",
              overflow: "hidden",
              position: "sticky",
              top: 20,
              transition: "all 0.3s ease",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: claimsPanelOpen ? "16px 8px" : "16px 18px",
                borderBottom: "1px solid var(--hair)",
                textAlign: claimsPanelOpen ? "center" : "left",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {!claimsPanelOpen ? (
                <div>
                  <span style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 800, color: "var(--brand)" }}>Index</span>
                  <b style={{ fontSize: 15, fontWeight: 800, display: "block", marginTop: 2 }}>{activeDossier.sections.length} sections</b>
                </div>
              ) : (
                <span style={{ fontSize: 11, fontWeight: 800, color: "var(--brand)", textTransform: "uppercase", width: "100%", display: "block" }}>
                  Secs
                </span>
              )}
            </div>

            {/* Section list */}
            <div style={{ maxHeight: 620, overflowY: "auto", padding: claimsPanelOpen ? "8px 6px" : "8px 8px 12px" }}>
              {(["commercial", "clinical", "safety", "regulatory"] as const).map((cat) => {
                const sectionsInCat = activeDossier.sections.filter((s) => s.category === cat);
                if (sectionsInCat.length === 0) return null;
                return (
                  <div key={cat} style={{ marginBottom: 6 }}>
                    {!claimsPanelOpen && (
                      <div style={{ padding: "10px 10px 4px", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)" }}>
                        {cat}
                      </div>
                    )}
                    {sectionsInCat.map((sec) => {
                      const isSelected = activeSectionId === sec.id;
                      const hasIssues = sec.unverifiedClaims && sec.unverifiedClaims.length > 0;
                      return (
                        <button
                          key={sec.id}
                          onClick={() => setActiveSectionId(sec.id)}
                          title={`${String(sec.number).padStart(2, "0")}. ${sec.title}`}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: claimsPanelOpen ? "center" : "flex-start",
                            gap: claimsPanelOpen ? 0 : 8,
                            padding: claimsPanelOpen ? "10px 0" : "9px 10px",
                            borderRadius: "var(--r)",
                            textAlign: "left",
                            background: isSelected ? "var(--tint)" : "transparent",
                            border: isSelected ? "1px solid var(--tint-line)" : "1px solid transparent",
                            position: "relative",
                            cursor: "pointer",
                            marginBottom: 3,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 800,
                              color: isSelected ? "var(--brand-deep)" : hasIssues ? "#dc2626" : "var(--ink-4)",
                              display: "grid",
                              placeItems: "center",
                              width: claimsPanelOpen ? 34 : 20,
                              height: claimsPanelOpen ? 34 : "auto",
                              borderRadius: claimsPanelOpen ? 10 : 0,
                              background: claimsPanelOpen && isSelected ? "#fff" : "transparent",
                              boxShadow: claimsPanelOpen && isSelected ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                            }}
                          >
                            {String(sec.number).padStart(2, "0")}
                          </span>
                          {!claimsPanelOpen && (
                            <span style={{ flex: 1, minWidth: 0 }}>
                              <b
                                style={{
                                  fontSize: 13,
                                  fontWeight: 650,
                                  color: isSelected ? "var(--brand-deep)" : "var(--ink)",
                                  display: "block",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {sec.title}
                              </b>
                              <span style={{ fontSize: 10.5, color: hasIssues ? "#dc2626" : "var(--ink-4)", fontWeight: hasIssues ? 700 : 400 }}>
                                {hasIssues ? `⚠️ ${sec.unverifiedClaims?.length} pending` : `${sec.claimsCount} claims · ${sec.citations.length} sources`}
                              </span>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── MIDDLE FULL DOCUMENT PANE ── */}
          {(() => {
            const sec = activeDossier.sections.find((s) => s.id === activeSectionId) || activeDossier.sections[0];
            const secIndex = activeDossier.sections.findIndex((s) => s.id === sec.id);
            const unverifiedList = sec.unverifiedClaims || [];
            const pendingCount = unverifiedList.filter((u) => !resolvedClaims[u.id]).length;

            return (
              <div style={{ background: "#fff", borderRadius: "var(--r-xl)", border: "1px solid var(--hair)", boxShadow: "var(--sh-2)", overflow: "hidden" }}>
                {/* ── SECTION LEVEL CLAIMS DEFICIENCY WARNING BANNER ── */}
                {unverifiedList.length > 0 && (
                  <div
                    style={{
                      background: "#fffbeb",
                      borderBottom: "1px solid #fde68a",
                      padding: "14px 28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ display: "grid", placeItems: "center", width: 28, height: 28, borderRadius: "50%", background: "#fef3c7", color: "#b45309", fontSize: 14 }}>
                        ⚠️
                      </span>
                      <div>
                        <b style={{ fontSize: 13, color: "#92400e", display: "block" }}>
                          {pendingCount > 0
                            ? `Please resolve all ${pendingCount} pending claims verification issues`
                            : "All claims verification issues resolved in this section"}
                        </b>
                        <span style={{ fontSize: 11.5, color: "#b45309" }}>
                          {pendingCount > 0
                            ? "Clinical claims must match verified on-label source anchors before export."
                            : "Ready for formal MLR approval."}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setClaimsPanelOpen((prev) => !prev)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 14px",
                        borderRadius: "var(--r)",
                        fontWeight: 700,
                        fontSize: 12,
                        background: claimsPanelOpen ? "#fef3c7" : "linear-gradient(180deg,#d97706,#b45309)",
                        color: claimsPanelOpen ? "#92400e" : "#fff",
                        border: "none",
                        boxShadow: "0 2px 6px rgba(180,83,9,0.2)",
                        cursor: "pointer",
                      }}
                    >
                      <span>{claimsPanelOpen ? "Close Claims Panel" : "Resolve Claims →"}</span>
                    </button>
                  </div>
                )}

                <div style={{ padding: "40px 44px 32px", position: "relative" }}>
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute", top: 24, right: 40, fontSize: 72, fontWeight: 800, lineHeight: 1,
                      color: "var(--hair)", userSelect: "none",
                    }}
                  >
                    {String(sec.number).padStart(2, "0")}
                  </span>
                  <div style={{ borderBottom: "1px solid var(--hair)", paddingBottom: 20, marginBottom: 24, position: "relative" }} className="space-y-2">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "var(--brand)", textTransform: "uppercase", letterSpacing: ".08em" }}>
                        Section {sec.number} of {activeDossier.sections.length} · {sec.category}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          padding: "2px 7px",
                          borderRadius: 99,
                          background: unverifiedList.length > 0 ? "#fef2f2" : "var(--ok-bg)",
                          color: unverifiedList.length > 0 ? "#dc2626" : "var(--ok)",
                          border: unverifiedList.length > 0 ? "1px solid #fecaca" : "1px solid var(--ok-line)",
                          fontWeight: 700,
                        }}
                      >
                        {unverifiedList.length > 0 ? "⚠️ Needs Verification" : "MLR Approved"}
                      </span>
                    </div>
                    <h2 style={{ fontSize: 27, fontWeight: 800, letterSpacing: "-.6px", margin: 0, maxWidth: "38ch" }}>{sec.title}</h2>
                  </div>

                  {/* Body Content with citations */}
                  <div style={{ fontSize: 15.5, lineHeight: 1.85, color: "var(--ink-2)", maxWidth: "72ch" }}>
                    <p>{sec.content}</p>
                  </div>

                  {/* Citations Footer */}
                  <div style={{ background: "var(--tint-2)", padding: "18px 20px", borderRadius: "var(--r)", border: "1px solid var(--tint-line)", marginTop: 24 }}>
                    <b style={{ display: "block", fontSize: 12, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--brand-deep)", marginBottom: 8 }}>
                      On-Record Citations
                    </b>
                    <div style={{ display: "grid", gap: 6 }}>
                      {sec.citations.map((cite, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--ink-3)" }}>
                          <span style={{ color: "var(--brand)", fontWeight: 800 }}>[{i + 1}]</span>
                          <span>{cite}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Document footer — page-turn between sections */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 44px", borderTop: "1px solid var(--hair)", background: "var(--surface-subtle)" }}>
                  <button
                    onClick={() => secIndex > 0 && setActiveSectionId(activeDossier.sections[secIndex - 1].id)}
                    disabled={secIndex === 0}
                    style={{ fontSize: 12.5, fontWeight: 700, color: secIndex === 0 ? "var(--ink-4)" : "var(--ink-2)", cursor: secIndex === 0 ? "default" : "pointer" }}
                  >
                    ← Previous section
                  </button>
                  <span style={{ fontSize: 11.5, color: "var(--ink-4)", fontWeight: 650 }}>
                    Page {secIndex + 1} of {activeDossier.sections.length}
                  </span>
                  <button
                    onClick={() => secIndex < activeDossier.sections.length - 1 && setActiveSectionId(activeDossier.sections[secIndex + 1].id)}
                    disabled={secIndex === activeDossier.sections.length - 1}
                    style={{ fontSize: 12.5, fontWeight: 700, color: secIndex === activeDossier.sections.length - 1 ? "var(--ink-4)" : "var(--ink-2)", cursor: secIndex === activeDossier.sections.length - 1 ? "default" : "pointer" }}
                  >
                    Next section →
                  </button>
                </div>
              </div>
            );
          })()}

          {/* ── RIGHT CLAIMS VERIFICATION DRAWER (Opens when user clicks Resolve Claims) ── */}
          {claimsPanelOpen && (() => {
            const sec = activeDossier.sections.find((s) => s.id === activeSectionId) || activeDossier.sections[0];
            const unverifiedList = sec.unverifiedClaims || [];

            return (
              <div
                style={{
                  background: "#fff",
                  borderRadius: "var(--r-xl)",
                  border: "1px solid var(--hair)",
                  boxShadow: "var(--sh-2)",
                  overflow: "hidden",
                  position: "sticky",
                  top: 20,
                  maxHeight: "calc(100vh - 120px)",
                  display: "flex",
                  flexDirection: "column",
                }}
                className="animate-in fade-in slide-in-from-right-4 duration-300"
              >
                {/* Drawer Header */}
                <div
                  style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid var(--hair)",
                    background: "#fafbf9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <span style={{ fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 800, color: "#d97706" }}>
                      Claims Verification
                    </span>
                    <b style={{ fontSize: 14.5, fontWeight: 800, display: "block", color: "var(--ink)", marginTop: 2 }}>
                      Section {sec.number} Claims ({unverifiedList.length})
                    </b>
                  </div>
                  <button
                    type="button"
                    onClick={() => setClaimsPanelOpen(false)}
                    style={{
                      background: "transparent",
                      border: "none",
                      fontSize: 16,
                      cursor: "pointer",
                      color: "var(--ink-4)",
                      padding: 4,
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Claims Tile Stack */}
                <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "grid", gap: 12 }}>
                  {unverifiedList.length === 0 ? (
                    <div style={{ padding: 24, textAlign: "center", color: "var(--ink-4)", fontSize: 13 }}>
                      No pending unverified claims for this section.
                    </div>
                  ) : (
                    unverifiedList.map((item, idx) => {
                      const status = resolvedClaims[item.id] || item.status;
                      return (
                        <div
                          key={item.id}
                          style={{
                            borderRadius: "var(--r)",
                            border:
                              status === "accepted"
                                ? "1px solid var(--ok-line)"
                                : status === "rejected"
                                ? "1px solid #fecaca"
                                : "1px solid #fde68a",
                            background:
                              status === "accepted"
                                ? "var(--ok-bg)"
                                : status === "rejected"
                                ? "#fef2f2"
                                : "#fffdfa",
                            padding: 14,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                            display: "grid",
                            gap: 8,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "var(--ink-4)" }}>
                              Claim #{idx + 1}
                            </span>
                            {status !== "pending" && (
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 800,
                                  padding: "2px 6px",
                                  borderRadius: 99,
                                  background: status === "accepted" ? "var(--ok)" : "#dc2626",
                                  color: "#fff",
                                }}
                              >
                                {status === "accepted" ? "Verified" : "Denied"}
                              </span>
                            )}
                          </div>

                          {/* Claim Statement */}
                          <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: "var(--ink)", lineHeight: 1.4 }}>
                            "{item.claim}"
                          </p>

                          {/* Issue Description */}
                          <div style={{ background: "rgba(0,0,0,0.03)", padding: "8px 10px", borderRadius: 8 }}>
                            <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "#b45309", display: "block", marginBottom: 2 }}>
                              Deficiency
                            </span>
                            <p style={{ margin: 0, fontSize: 11.5, color: "var(--ink-2)", lineHeight: 1.4 }}>
                              {item.issue}
                            </p>
                          </div>

                          {/* Source Link */}
                          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--brand)" }}>
                            <span>🔗</span>
                            <span style={{ textDecoration: "underline", fontWeight: 600 }}>{item.sourceLink}</span>
                          </div>

                          {/* Accept / Deny Action Buttons */}
                          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                            <button
                              type="button"
                              onClick={() => setResolvedClaims((prev) => ({ ...prev, [item.id]: "accepted" }))}
                              style={{
                                flex: 1,
                                padding: "7px 10px",
                                borderRadius: 8,
                                fontSize: 11.5,
                                fontWeight: 700,
                                background: status === "accepted" ? "var(--ok)" : "#fff",
                                color: status === "accepted" ? "#fff" : "var(--ok)",
                                border: "1px solid var(--ok-line)",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                              }}
                            >
                              ✓ Accept Claim
                            </button>
                            <button
                              type="button"
                              onClick={() => setResolvedClaims((prev) => ({ ...prev, [item.id]: "rejected" }))}
                              style={{
                                flex: 1,
                                padding: "7px 10px",
                                borderRadius: 8,
                                fontSize: 11.5,
                                fontWeight: 700,
                                background: status === "rejected" ? "#dc2626" : "#fff",
                                color: status === "rejected" ? "#fff" : "#dc2626",
                                border: "1px solid #fecaca",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                              }}
                            >
                              ✕ Deny / Flag
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { BrandDossier } from "@/features/dossiers/dossier-types";
import { DOCUMENT_TYPES, PHARMA_SECTIONS } from "@/features/dossiers/dossier-wizard-data";
import { citationSource } from "@/features/dossiers/citation-sources";
import { CitationPill } from "@/features/workspace/script-scene-card";
import type { SceneCitation } from "@/types/content";
import { ExternalLink, X } from "lucide-react";

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
  /** The subsection last jumped to, so the index shows where you are. */
  const [activeSubId, setActiveSubId] = useState<string | null>(null);
  const [showSendMenu, setShowSendMenu] = useState(false);
  const [sendRecipients, setSendRecipients] = useState<string[]>([]);
  const [sentAt, setSentAt] = useState<string | null>(null);
  const [claimsPanelOpen, setClaimsPanelOpen] = useState(false);
  const [highlightedClaimId, setHighlightedClaimId] = useState<string | null>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  /* Scroll the rail to the claim the citation named — opening a panel and
     leaving the reader to find the row themselves is most of the work. */
  useEffect(() => {
    if (highlightedClaimId) highlightRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [highlightedClaimId]);

  function toggleSendRecipient(role: string) {
    setSendRecipients((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  }

  function sendToTeam() {
    if (sendRecipients.length === 0) return;
    setSentAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    setShowSendMenu(false);
  }

  const activeSection = useMemo(
    () => activeDossier.sections.find((s) => s.id === activeSectionId) ?? activeDossier.sections[0],
    [activeDossier, activeSectionId]
  );

  /**
   * Every paragraph in the open section, in reading order.
   *
   * A section's own body comes first, then each subsection's, so a claim's
   * position is the same whether it sits in 3 or in 3.2 — which is what lets
   * one index address both.
   */
  const paragraphs = useMemo(() => {
    if (!activeSection) return [] as { key: string; text: string; subId?: string }[];
    const out: { key: string; text: string; subId?: string }[] = [];
    activeSection.content.split("\n\n").forEach((text, i) => out.push({ key: `body-${i}`, text }));
    activeSection.subsections?.forEach((sub) => {
      sub.content.split("\n\n").forEach((text, i) => out.push({ key: `${sub.id}-${i}`, text, subId: sub.id }));
    });
    return out;
  }, [activeSection]);

  /** Where each subsection's paragraphs start in that list. */
  const subsectionOffset = useMemo(() => {
    const map = new Map<string, number>();
    if (!activeSection) return map;
    let at = activeSection.content.split("\n\n").length;
    activeSection.subsections?.forEach((sub) => {
      map.set(sub.id, at);
      at += sub.content.split("\n\n").length;
    });
    return map;
  }, [activeSection]);

  /**
   * The claims this section makes, as records rather than a footnote list.
   *
   * One per paragraph: the sentence that states it, and the source it rests
   * on resolved to the register that source lives in. The id is positional,
   * so the same claim keeps the same id across renders — which is what lets
   * a citation badge highlight one.
   */
  const sectionClaims = useMemo(
    () =>
      paragraphs.map((para, i) => {
        const cited = activeSection?.citations ?? [];
        const raw = cited[i % Math.max(1, cited.length)] ?? "On-record source";
        return {
          id: `${activeSection?.id ?? "sec"}-claim-${i}`,
          /* The first sentence, not the paragraph around it. A claim is a
             statement; the rest of the paragraph is what surrounds it. */
          line: para.text.split(/(?<=\.)\s/)[0].trim(),
          source: citationSource(raw),
        };
      }),
    [paragraphs, activeSection]
  );

  /** The badge at the end of a paragraph, pointing at that paragraph's source. */
  const citationFor = (index: number): SceneCitation[] => {
    const claim = sectionClaims[index];
    if (!claim) return [];
    return [
      {
        id: `${claim.id}-cite`,
        source: claim.source.publisher,
        title: claim.source.line,
        date: claim.source.locator ?? "On record · approved",
        claimId: claim.id,
        url: claim.source.url || undefined,
      },
    ];
  };

  /** A citation's Details opens the rail on the claim it points at. */
  function openClaimInRail(claimId: string) {
    setClaimsPanelOpen(true);
    setHighlightedClaimId(claimId);
  }

  /**
   * A subsection in the index jumps to its heading in the document.
   *
   * The index lists every section's parts, so the target is often not in the
   * open section at all — open it first, and scroll once the browser has
   * painted the section it belongs to.
   */
  function goToSubsection(sectionId: string, subId: string) {
    setActiveSubId(subId);
    const scroll = () =>
      document.getElementById(`dossier-sub-${subId}`)?.scrollIntoView({ block: "start", behavior: "smooth" });
    if (sectionId === activeSectionId) {
      scroll();
      return;
    }
    setActiveSectionId(sectionId);
    requestAnimationFrame(() => requestAnimationFrame(scroll));
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
            gridTemplateColumns: claimsPanelOpen ? "72px minmax(0, 1fr) 340px" : "320px minmax(0, 1fr)",
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

                      const row = (
                        <button
                          key={sec.id}
                          onClick={() => { setActiveSectionId(sec.id); setActiveSubId(null); }}
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
                              color: isSelected ? "var(--brand-deep)" : "var(--ink-4)",
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
                              <span style={{ fontSize: 10.5, color: "var(--ink-4)" }}>
                                {`${sec.claimsCount} claims · ${sec.citations.length} sources`}
                              </span>
                            </span>
                          )}
                        </button>
                      );

                      /* Always listed, not only under the section you happen
                         to be in: an index whose shape changes as you move
                         through it cannot be scanned, and you cannot see that
                         3 has three parts until you are already in 3.
                         Collapsed, the rail is 72px of numbers and there is
                         no room for them at all. */
                      if (claimsPanelOpen || !sec.subsections?.length) return row;

                      return (
                        <div key={sec.id}>
                          {row}
                          <div style={{ marginBottom: 6, paddingLeft: 14, borderLeft: "1px solid var(--hair)", marginLeft: 19 }}>
                            {sec.subsections.map((sub) => {
                              const here = activeSubId === sub.id;
                              return (
                                <button
                                  key={sub.id}
                                  onClick={() => goToSubsection(sec.id, sub.id)}
                                  title={`${sec.number}.${sub.number} ${sub.title}`}
                                  style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 7,
                                    padding: "5px 8px",
                                    borderRadius: "var(--r-s)",
                                    textAlign: "left",
                                    background: here ? "var(--tint)" : "transparent",
                                    cursor: "pointer",
                                  }}
                                >
                                  <span style={{ fontSize: 10.5, fontWeight: 800, color: here ? "var(--brand)" : "var(--ink-4)", fontVariantNumeric: "tabular-nums" }}>
                                    {sec.number}.{sub.number}
                                  </span>
                                  <span
                                    style={{
                                      flex: 1,
                                      minWidth: 0,
                                      fontSize: 12,
                                      fontWeight: here ? 700 : 500,
                                      color: here ? "var(--brand-deep)" : "var(--ink-2)",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {sub.title}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
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
            return (
              <div style={{ background: "#fff", borderRadius: "var(--r-xl)", border: "1px solid var(--hair)", boxShadow: "var(--sh-2)", overflow: "hidden" }}>
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
                          background: "var(--ok-bg)",
                          color: "var(--ok)",
                          border: "1px solid var(--ok-line)",
                          fontWeight: 700,
                        }}
                      >
                        MLR Approved
                      </span>
                    </div>
                    <h2 style={{ fontSize: 27, fontWeight: 800, letterSpacing: "-.6px", margin: 0, maxWidth: "38ch" }}>{sec.title}</h2>
                  </div>

                  {/* The body, cited where it is written.
                      A footnote list under the section says the whole section
                      rests on two sources; a badge at the end of a paragraph
                      says which source that paragraph rests on, which is the
                      question a reviewer is actually asking. Same badge as
                      the production plan's narration, so a citation behaves
                      the same wherever it appears. */}
                  <div style={{ fontSize: 15.5, lineHeight: 1.85, color: "var(--ink-2)", maxWidth: "72ch" }}>
                    {sec.content.split("\n\n").map((para, i) => (
                      <p key={i} style={{ marginBottom: 18 }}>
                        {para}{" "}
                        <CitationPill citations={citationFor(i)} onDetails={openClaimInRail} detailsLabel="All claims" />
                      </p>
                    ))}

                    {/* A numbered part of the section, with a heading the
                        index can address. Same prose, same badges — the only
                        thing a subsection adds is a place to jump to. */}
                    {sec.subsections?.map((sub) => {
                      const offset = subsectionOffset.get(sub.id) ?? 0;
                      return (
                        <section key={sub.id} id={`dossier-sub-${sub.id}`} style={{ scrollMarginTop: 24 }}>
                          <h3
                            style={{
                              display: "flex", alignItems: "baseline", gap: 10,
                              margin: "26px 0 10px", fontSize: 17, fontWeight: 800,
                              letterSpacing: "-.3px", color: "var(--ink)",
                            }}
                          >
                            <span style={{ fontSize: 13, fontWeight: 800, color: "var(--brand)", fontVariantNumeric: "tabular-nums" }}>
                              {sec.number}.{sub.number}
                            </span>
                            {sub.title}
                          </h3>
                          {sub.content.split("\n\n").map((para, j) => (
                            <p key={j} style={{ marginBottom: 18 }}>
                              {para}{" "}
                              <CitationPill citations={citationFor(offset + j)} onDetails={openClaimInRail} detailsLabel="All claims" />
                            </p>
                          ))}
                        </section>
                      );
                    })}
                  </div>

                  {/* Citations Footer */}
                  <div style={{ background: "var(--tint-2)", padding: "18px 20px", borderRadius: "var(--r)", border: "1px solid var(--tint-line)", marginTop: 24 }}>
                    <b style={{ display: "block", fontSize: 12, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--brand-deep)", marginBottom: 8 }}>
                      On-Record Citations
                    </b>
                    <div style={{ display: "grid", gap: 6 }}>
                      {sec.citations.map((cite, i) => {
                        const src = citationSource(cite);
                        return (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--ink-3)" }}>
                            <span style={{ color: "var(--brand)", fontWeight: 800 }}>[{i + 1}]</span>
                            <span style={{ minWidth: 0, flex: 1 }}>{cite}</span>
                            {src.url && (
                              <a
                                href={src.url}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="inline-flex shrink-0 cursor-pointer items-center gap-1 font-bold text-brand transition-colors hover:text-brand-deep"
                                style={{ fontSize: 11.5 }}
                              >
                                {src.publisher}
                                <ExternalLink className="size-3" />
                              </a>
                            )}
                          </div>
                        );
                      })}
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

          {/* The claim a citation points at, beside the sentence making it.
              Opened by the badge, not by a button in the chrome: you go
              looking for a claim because you are reading one. */}
          {claimsPanelOpen && (
            <aside
              style={{
                background: "#fff",
                borderRadius: "var(--r-xl)",
                border: "1px solid var(--hair)",
                boxShadow: "var(--sh-2)",
                overflow: "hidden",
                alignSelf: "start",
                position: "sticky",
                top: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "14px 16px", borderBottom: "1px solid var(--hair)" }}>
                <div>
                  <span style={{ display: "block", fontSize: 10, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-4)" }}>
                    Cited claims
                  </span>
                  <b style={{ fontSize: 13.5, fontWeight: 800 }}>{sectionClaims.length} in this section</b>
                </div>
                <button
                  type="button"
                  onClick={() => { setClaimsPanelOpen(false); setHighlightedClaimId(null); }}
                  aria-label="Close claims"
                  className="grid size-7 cursor-pointer place-items-center rounded-full text-ink-3 transition hover:bg-black/5 hover:text-ink"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div style={{ maxHeight: 620, overflowY: "auto", padding: 12, display: "grid", gap: 8 }}>
                {sectionClaims.map((claim) => {
                  const active = highlightedClaimId === claim.id;
                  return (
                    <div
                      key={claim.id}
                      ref={active ? highlightRef : undefined}
                      style={{
                        borderRadius: "var(--r)",
                        border: `1px solid ${active ? "var(--brand)" : "var(--hair-2)"}`,
                        background: active ? "var(--tint)" : "var(--surface-subtle)",
                        boxShadow: active ? "0 0 0 2px color-mix(in srgb, var(--brand) 20%, transparent)" : "none",
                        padding: "10px 12px",
                        transition: "background .2s, border-color .2s, box-shadow .2s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--brand-deep)" }}>
                          {claim.source.publisher}
                        </span>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ok)" }}>✓ Approved</span>
                      </div>

                      {/* The claim, then what backs it. The paragraph it came
                          from is two inches to the left — repeating it here
                          made the rail a second copy of the document. */}
                      <p className="line-clamp-2" style={{ marginTop: 4, fontSize: 12.5, lineHeight: 1.55, color: "var(--ink)", fontWeight: 600 }}>
                        {claim.line}
                      </p>
                      <p style={{ marginTop: 5, fontSize: 11.5, lineHeight: 1.5, color: "var(--ink-3)" }}>
                        {claim.source.line}
                        {claim.source.locator ? ` · ${claim.source.locator}` : ""}
                      </p>
                      {claim.source.url && (
                        <a
                          href={claim.source.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          style={{ marginTop: 7, fontSize: 11.5, fontWeight: 700 }}
                          className="inline-flex cursor-pointer items-center gap-1 text-brand transition-colors hover:text-brand-deep"
                        >
                          View source
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </aside>
          )}
        </div>
      </div>
  );
}

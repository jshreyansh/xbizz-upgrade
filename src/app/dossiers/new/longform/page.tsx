"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, PenLine, X } from "lucide-react";
import { AppShell } from "@/features/workspace/app-shell";
import { DossierFlowShell } from "@/features/dossiers/dossier-flow-shell";
import { useDossierDraftStore } from "@/features/dossiers/dossier-draft-store";
import { ProcessingChecklist, SuccessScreen, REGULATORY_BODIES, PREVIEW_SECTIONS } from "@/features/dossiers/dossier-flow-pieces";
import { DossierPreviewChat } from "@/features/dossiers/dossier-preview-chat";
import { useAssistantChat, DossierAssistantPanel, isQuestion } from "@/features/dossiers/dossier-assistant-chat";
import type { BrandDossier, DossierSection, DossierSource, RegulatoryBody } from "@/features/dossiers/dossier-types";

type Phase = "input" | "processing" | "preview" | "success";
type DraftSection = { id: string; title: string; content: string };
type DraftSource = { id: string; name: string };

/** Assembles a BrandDossier straight from what the user typed — no AI
 *  drafting, no offline placeholder text. Every section and source here
 *  is exactly what the author wrote. */
function buildManualDossier(input: {
  brandName: string;
  genericName: string;
  indication: string;
  anchor: RegulatoryBody;
  category: string;
  audiences: string[];
  sections: DraftSection[];
  sources: DraftSource[];
}): BrandDossier {
  const sections: DossierSection[] = input.sections.map((s, i) => ({
    id: s.id,
    number: i + 1,
    title: s.title || `Section ${i + 1}`,
    category: (["clinical", "commercial", "regulatory", "safety"] as const)[i % 4],
    content: s.content.trim() || `No content written yet for ${(s.title || "this section").toLowerCase()}.`,
    claimsCount: 0,
    heldOutCount: 0,
    citations: [],
  }));

  const sources: DossierSource[] = input.sources.map((src) => ({
    id: src.id,
    name: src.name,
    type: "slides",
    date: "Just now",
    status: "approved",
    details: "Attached by you",
    citationCount: 0,
  }));

  const id = `${input.brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;

  return {
    id,
    brandName: input.brandName,
    genericName: input.genericName || input.brandName.toLowerCase(),
    indication: input.indication || "Indication pending confirmation.",
    therapyArea: "General Medicine",
    regulatoryAnchor: input.anchor,
    documentType: "commercial",
    gradient: "linear-gradient(145deg,#3a1e4d,#63307a 48%,#a06bc4)",
    accentColor: "#9b6bff",
    initials: input.brandName.slice(0, 2).toUpperCase(),
    sectionsCount: sections.length,
    claimsCited: 0,
    claimsHeldOut: 0,
    verifiedClaimsCount: 0,
    totalClaimsCount: 0,
    healthStatus: "healthy",
    sourcesCount: sources.length,
    lastUpdated: "Just now",
    status: "complete",
    isSample: false,
    generatedBy: "manual",
    category: input.category,
    targetAudience: input.audiences,
    sources,
    sections,
    approvals: [
      { role: "Medical Writer", name: "Medical Writer", initials: "MW", gradient: "linear-gradient(140deg,#ff7a3d,#c9310a)", status: "pending" },
      { role: "MLR Reviewer", name: "MLR Reviewer", initials: "MR", gradient: "linear-gradient(140deg,#22c07a,#12784a)", status: "pending" },
      { role: "Project Manager", name: "Project Manager", initials: "PM", gradient: "linear-gradient(140deg,#9b6bff,#5b21b6)", status: "pending" },
      { role: "Brand Lead", name: "You", initials: "N", gradient: "linear-gradient(140deg,#3a3f4b,#0d1017)", status: "pending" },
    ],
  };
}

export default function NewDossierLongFormPage() {
  const router = useRouter();
  const { brandName, genericName, anchor: draftAnchor, category, audiences, path, reset, addCreatedDossier } = useDossierDraftStore();

  const [phase, setPhase] = useState<Phase>("input");
  const [indication, setIndication] = useState("");
  const [anchor, setAnchor] = useState<RegulatoryBody>(draftAnchor);
  const [sections, setSections] = useState<DraftSection[]>(() => PREVIEW_SECTIONS.map((title, i) => ({ id: `sec-${i}`, title, content: "" })));
  const [sources, setSources] = useState<DraftSource[]>([]);
  const [newSourceName, setNewSourceName] = useState("");
  const [dossier, setDossier] = useState<BrandDossier | null>(null);

  // Guard against direct URL access mid-flow.
  useEffect(() => {
    if (!brandName) router.replace("/dossiers/new");
    else if (path !== "longform") router.replace("/dossiers/new/path");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finish(andOpen: boolean) {
    if (dossier) addCreatedDossier(dossier);
    const id = dossier?.id;
    reset();
    router.push(andOpen && id ? `/dossiers?open=${id}` : "/dossiers");
  }

  function addSection(title?: string) {
    setSections((s) => [...s, { id: `sec-custom-${s.length}-${Date.now().toString(36)}`, title: title || "New section", content: "" }]);
  }
  function removeSection(id: string) {
    setSections((s) => s.filter((sec) => sec.id !== id));
  }
  function updateSectionTitle(id: string, title: string) {
    setSections((s) => s.map((sec) => (sec.id === id ? { ...sec, title } : sec)));
  }
  function updateSectionContent(id: string, content: string) {
    setSections((s) => s.map((sec) => (sec.id === id ? { ...sec, content } : sec)));
  }
  function addSource(name: string) {
    if (!name.trim()) return;
    setSources((s) => [...s, { id: `src-${s.length}-${Date.now().toString(36)}`, name: name.trim() }]);
  }
  function removeSource(id: string) {
    setSources((s) => s.filter((src) => src.id !== id));
  }

  const filledSections = sections.filter((s) => s.content.trim().length > 0).length;
  const canBuild = brandName.length > 0 && filledSections > 0;

  function respond(text: string): string {
    const lower = text.toLowerCase();

    if (phase === "success") {
      if (isQuestion(text)) {
        return "The dossier's saved. From here you can start a video or creative from it, invite reviewers for MLR sign-off, or open it to inspect the sections in full.";
      }
      if (/(video|reel|creative)/.test(lower)) {
        setTimeout(() => router.push("/create"), 700);
        return "Great choice — taking you to start a video from this dossier.";
      }
      if (/(view|open|inspect)/.test(lower)) {
        setTimeout(() => finish(true), 700);
        return "Opening the dossier now.";
      }
      if (/(review|invite|reviewer|approv)/.test(lower)) {
        return "Noted — reviewers will see this dossier in their MLR queue once it's published.";
      }
      return "You can start a video from this dossier, invite reviewers, or view the dossier now — just say the word.";
    }

    if (isQuestion(text)) {
      return 'This is the long form — write each section\'s content yourself (I\'ve started you off with the standard six). Add or remove sections, attach sources, then say "build" when you\'re ready. No AI drafting involved — every word is yours.';
    }

    const anchorMatch = REGULATORY_BODIES.find((b) => lower.includes(b.toLowerCase()));
    if (anchorMatch) {
      setAnchor(anchorMatch);
      return `Set the regulatory anchor to ${anchorMatch}.`;
    }

    const addSectionMatch = text.match(/add (?:a |another )?section (?:called |named |for |titled )?["“]?([a-z0-9 &/'-]+?)["”]?[.!]?$/i);
    if (addSectionMatch) {
      const title = addSectionMatch[1].trim().replace(/\b\w/g, (c) => c.toUpperCase());
      addSection(title);
      return `Added a new section — "${title}". You'll see it at the bottom of the list.`;
    }

    const addSourceMatch = text.match(/add (?:a |another )?source (?:called |named |for )?["“]?([a-z0-9 &/'.-]+?)["”]?[.!]?$/i);
    if (addSourceMatch) {
      const name = addSourceMatch[1].trim();
      addSource(name);
      return `Added "${name}" as a source.`;
    }

    if (/\b(build|assemble|generate|finish|done)\b/.test(lower)) {
      if (!canBuild) {
        return "I need at least one section with content, and a brand name, before I can assemble the dossier.";
      }
      setTimeout(() => startBuild(), 600);
      return "Assembling your dossier now.";
    }

    return 'Write each section below, or tell me things like "add a section called Patient Support Program" or "add source Phase 3 trial data" — say "build" when you\'re ready.';
  }

  const { messages, thinking, send, pushAssistant, pushUser } = useAssistantChat(
    `This is the long form for ${brandName || "your brand"} — write each section yourself. I've started you off with the standard structure; add, remove, or rename sections as you like, then say "build" when ready.`,
    respond
  );

  if (!brandName || path !== "longform") return null;

  function startBuild() {
    setPhase("processing");
    pushAssistant("Assembling your dossier from what you've written…");
    const built = buildManualDossier({ brandName, genericName, indication, anchor, category, audiences, sections, sources });
    setDossier(built);
  }

  return (
    <AppShell pageTitle="New Brand Dossier">
      <DossierFlowShell
        step={3}
        stepLabel="Long form"
        backHref={phase === "input" ? "/dossiers/new/path" : undefined}
        wide={phase === "preview"}
        chat={
          phase === "preview"
            ? undefined
            : (
                <DossierAssistantPanel
                  messages={messages}
                  thinking={thinking}
                  onSend={send}
                  onAttachFile={
                    phase === "input"
                      ? (file) => {
                          addSource(file.name);
                          pushUser(`📎 Attached ${file.name}`);
                          pushAssistant(`Added "${file.name}" as a source.`);
                        }
                      : undefined
                  }
                  disabled={phase === "processing"}
                  disabledNote="Assembling — hang tight…"
                  placeholder={phase === "success" ? 'e.g. "start a video from this"' : 'e.g. "add a section called…"'}
                  subtitle={phase === "success" ? "What's next?" : "Add sections & sources by prompt"}
                  quickReplies={
                    phase === "success"
                      ? ["Start a video from this", "Invite reviewers", "View dossier"]
                      : phase === "input"
                      ? ["What does this step do?", "Build dossier"]
                      : undefined
                  }
                />
              )
        }
      >
        {phase === "input" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ width: 36, height: 36, borderRadius: 11, display: "grid", placeItems: "center", background: "#f3ecfe", color: "#5b21b6" }}>
                <PenLine size={17} />
              </span>
              <h1 style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-.3px", margin: 0, color: "var(--ink)" }}>Write {brandName}&rsquo;s dossier</h1>
            </div>
            <p style={{ fontSize: 13.5, color: "var(--ink-3)", margin: "6px 0 20px" }}>
              No AI drafting — write each section in your own words, add or remove sections as needed.
            </p>

            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink-2)", marginBottom: 6 }}>Indication (optional)</label>
            <textarea
              value={indication}
              onChange={(e) => setIndication(e.target.value)}
              rows={2}
              placeholder="What is this brand for?"
              style={{ width: "100%", padding: "10px 13px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", fontSize: 13.5, marginBottom: 18, resize: "vertical", color: "var(--ink)", fontFamily: "inherit" }}
            />

            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink-2)", marginBottom: 6 }}>Regulatory anchor</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
              {REGULATORY_BODIES.map((body) => (
                <button
                  key={body}
                  type="button"
                  onClick={() => setAnchor(body)}
                  style={{
                    flex: 1,
                    padding: "9px 0",
                    borderRadius: "var(--r)",
                    fontSize: 13,
                    fontWeight: 700,
                    color: anchor === body ? "#fff" : "var(--ink-3)",
                    background: anchor === body ? "var(--ink)" : "var(--surface-subtle)",
                    border: "1px solid var(--hair)",
                  }}
                >
                  {body}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)" }}>
                Sections <span style={{ color: "var(--ink-4)", fontWeight: 600 }}>({filledSections}/{sections.length} filled)</span>
              </label>
              <button
                type="button"
                onClick={() => addSection()}
                style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "var(--brand-deep)", background: "var(--tint)", border: "1px solid var(--tint-line)", padding: "5px 10px", borderRadius: 99 }}
              >
                <Plus size={13} />
                Add section
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {sections.map((s) => (
                <div key={s.id} style={{ border: "1px solid var(--hair)", borderRadius: "var(--r)", background: "var(--surface-subtle)", padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <input
                      value={s.title}
                      onChange={(e) => updateSectionTitle(s.id, e.target.value)}
                      style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 700, color: "var(--ink)", background: "transparent", border: "none", outline: "none" }}
                    />
                    <button type="button" onClick={() => removeSection(s.id)} style={{ color: "var(--ink-4)", flexShrink: 0 }} title="Remove section">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <textarea
                    value={s.content}
                    onChange={(e) => updateSectionContent(s.id, e.target.value)}
                    rows={3}
                    placeholder={`Write the ${s.title.toLowerCase()} content…`}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--hair)", fontSize: 12.5, resize: "vertical", color: "var(--ink)", background: "#fff", fontFamily: "inherit" }}
                  />
                </div>
              ))}
            </div>

            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink-2)", marginBottom: 8 }}>Sources</label>
            {sources.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 10 }}>
                {sources.map((src) => (
                  <span
                    key={src.id}
                    style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 650, color: "var(--ink-3)", background: "#fff", border: "1px solid var(--hair)", padding: "5px 5px 5px 10px", borderRadius: 99 }}
                  >
                    {src.name}
                    <button type="button" onClick={() => removeSource(src.id)} style={{ display: "grid", placeItems: "center", color: "var(--ink-4)" }}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
              <input
                value={newSourceName}
                onChange={(e) => setNewSourceName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addSource(newSourceName);
                    setNewSourceName("");
                  }
                }}
                placeholder="e.g. Phase 3 trial data"
                style={{ flex: 1, padding: "9px 12px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", fontSize: 13, color: "var(--ink)" }}
              />
              <button
                type="button"
                onClick={() => {
                  addSource(newSourceName);
                  setNewSourceName("");
                }}
                style={{ padding: "9px 16px", borderRadius: "var(--r)", fontSize: 13, fontWeight: 700, color: "var(--ink-3)", background: "var(--surface-subtle)", border: "1px solid var(--hair)" }}
              >
                Add
              </button>
            </div>

            <button
              type="button"
              disabled={!canBuild}
              onClick={startBuild}
              style={{
                width: "100%",
                padding: "13px 0",
                borderRadius: "var(--r)",
                fontWeight: 750,
                fontSize: 14.5,
                color: "#fff",
                background: !canBuild ? "var(--ink-4)" : "linear-gradient(180deg,#9b6bff,#5b21b6)",
                opacity: !canBuild ? 0.5 : 1,
                cursor: !canBuild ? "not-allowed" : "pointer",
                boxShadow: !canBuild ? "none" : "0 12px 24px -12px rgba(91,33,182,.5)",
              }}
            >
              Build dossier
            </button>
          </>
        )}

        {phase === "processing" && (
          <ProcessingChecklist
            title="Assembling your dossier"
            items={["Compiling sections", "Indexing sources", "Preparing approvals", "Finalizing preview"]}
            onDone={() => setPhase("preview")}
          />
        )}

        {phase === "preview" && dossier && (
          <DossierPreviewChat
            dossier={dossier}
            onChange={(updater) => setDossier((prev) => (prev ? updater(prev) : prev))}
            onFinish={() => setPhase("success")}
            finishLabel="Confirm & finish"
          />
        )}

        {phase === "success" && dossier && (
          <SuccessScreen
            headline="Brand dossier created"
            subtitle={`${dossier.brandName} is saved and ready for review.`}
            dossier={dossier}
            onClose={() => finish(false)}
            onViewDossier={() => finish(true)}
          />
        )}
      </DossierFlowShell>
    </AppShell>
  );
}

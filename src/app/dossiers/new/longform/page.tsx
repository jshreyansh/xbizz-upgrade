"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, RefreshCw, PenLine, X } from "lucide-react";
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

/** Per-section auto-write templates for the standard six, so the long
 *  form starts fully drafted instead of blank — the end user only needs
 *  to edit, never type from scratch. Unknown/custom section titles fall
 *  back to a generic templated paragraph. */
const SECTION_TEMPLATES: Record<string, (brand: string, generic: string) => string> = {
  "indication & positioning": (b, g) =>
    `${b} (${g}) is positioned to address a clearly defined patient population where current standards of care leave room for improvement. Its indication reflects a favorable benefit-risk profile established through the supporting clinical program. Positioning emphasizes differentiated efficacy and a manageable safety profile relative to existing therapies in this space.`,
  "mechanism of action": (b, g) =>
    `${g} exerts its therapeutic effect through targeted modulation of the underlying disease pathway, offering a mode of action distinct from earlier-generation agents. This mechanism supports both efficacy and tolerability across the studied population and has been characterized through nonclinical and early clinical pharmacology work for ${b}.`,
  "clinical evidence": (b, g) =>
    `The clinical program for ${b} (${g}) demonstrates consistent efficacy across the primary and key secondary endpoints studied. Results support the proposed positioning and are consistent with the mechanism of action, with a safety profile aligned with expectations for the drug class.`,
  "safety profile": (b, g) =>
    `${b} has demonstrated a manageable and consistent safety profile across the studied population, with adverse events generally mild to moderate in severity. Ongoing pharmacovigilance continues to monitor for any emerging signals specific to ${g}.`,
  "dosing & administration": (b, g) =>
    `${b} is administered according to a regimen designed to balance efficacy and tolerability, with dosing informed by the pharmacokinetic profile of ${g}. Administration guidance should be confirmed against the current approved label before use in promotional or educational materials.`,
  "payer & heor summary": (b, g) =>
    `The health-economic case for ${b} centers on its value relative to existing standard-of-care options, supported by outcomes data from the ${g} clinical program. Payer conversations typically focus on total cost of care and the durability of the observed clinical benefit.`,
};

function autoWriteSection(title: string, brandName: string, genericName: string): string {
  const template = SECTION_TEMPLATES[title.trim().toLowerCase()];
  if (template) return template(brandName, genericName || brandName.toLowerCase());
  return `Auto-drafted summary of ${title.toLowerCase()} for ${brandName} (${genericName || brandName.toLowerCase()}), covering the key points this section is expected to address. Edit this to reflect the specifics for your brand before finalizing.`;
}

function autoWriteIndication(brandName: string, genericName: string, category: string): string {
  const audience = category ? category.toLowerCase() : "the intended patient population";
  return `${brandName} (${genericName || brandName.toLowerCase()}) is intended for use in ${audience}, offering a differentiated option within its therapy area.`;
}

/** Assembles a BrandDossier from the long-form draft — every section is
 *  auto-drafted up front and stays fully editable before building. */
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
  const [indication, setIndication] = useState(() => autoWriteIndication(brandName, genericName, category));
  const [anchor, setAnchor] = useState<RegulatoryBody>(draftAnchor);
  const [sections, setSections] = useState<DraftSection[]>(() =>
    PREVIEW_SECTIONS.map((title, i) => ({ id: `sec-${i}`, title, content: autoWriteSection(title, brandName, genericName) }))
  );
  const [sources, setSources] = useState<DraftSource[]>(() => [
    { id: "src-1", name: `${draftAnchor} Approved Prescribing Information` },
    { id: "src-2", name: "PubMed literature review" },
  ]);
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
    const t = title || "New section";
    setSections((s) => [...s, { id: `sec-custom-${s.length}-${Date.now().toString(36)}`, title: t, content: autoWriteSection(t, brandName, genericName) }]);
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
  function regenerateSection(id: string) {
    setSections((s) => s.map((sec) => (sec.id === id ? { ...sec, content: autoWriteSection(sec.title, brandName, genericName) } : sec)));
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

    if (isQuestion(text)) {
      return "This is the long form — I auto-draft every section for you up front (I've already written the standard six below), so there's nothing you have to type from scratch. Edit anything you like, hit the refresh icon to auto-write a section again, or add/remove sections — then say \"build\" when you're ready.";
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
      return `Added and auto-drafted a new section — "${title}". You'll see it at the bottom of the list.`;
    }

    const addSourceMatch = text.match(/add (?:a |another )?source (?:called |named |for )?["“]?([a-z0-9 &/'.-]+?)["”]?[.!]?$/i);
    if (addSourceMatch) {
      const name = addSourceMatch[1].trim();
      addSource(name);
      return `Added "${name}" as a source.`;
    }

    const rewriteMatch = /(rewrite|regenerate|redo|auto.?write|refresh)/.test(lower)
      ? sections.find((s) =>
          s.title
            .toLowerCase()
            .split(/[\s&/]+/)
            .filter((w) => w.length > 3)
            .some((w) => lower.includes(w))
        )
      : undefined;
    if (rewriteMatch) {
      regenerateSection(rewriteMatch.id);
      return `Auto-wrote "${rewriteMatch.title}" again — check the updated draft below.`;
    }

    if (/\b(build|assemble|generate|finish|done)\b/.test(lower)) {
      if (!canBuild) {
        return "I need a brand name and at least one section before I can assemble the dossier.";
      }
      setTimeout(() => startBuild(), 600);
      return "Assembling your dossier now.";
    }

    return 'Everything below is already auto-drafted — edit anything, say "rewrite the safety section" to auto-write it again, or "add a section called…" — say "build" when you\'re ready.';
  }

  const { messages, thinking, send, pushAssistant, pushUser } = useAssistantChat(
    `This is the long form for ${brandName || "your brand"} — I've auto-drafted every section below so there's nothing to type from scratch. Edit anything, ask me to rewrite a section, or add/remove sections, then say "build" when ready.`,
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
          phase === "preview" || phase === "success"
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
                  placeholder='e.g. "rewrite the safety section"'
                  subtitle="Auto-write, edit & rebuild by prompt"
                  quickReplies={phase === "input" ? ["What does this step do?", "Build dossier"] : undefined}
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
              <h1 style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-.3px", margin: 0, color: "var(--ink)" }}>{brandName}&rsquo;s dossier, auto-drafted</h1>
            </div>
            <p style={{ fontSize: 13.5, color: "var(--ink-3)", margin: "6px 0 20px" }}>
              Every section below is already written — just review and edit anything you like, no need to type from scratch.
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
                Sections <span style={{ color: "var(--ink-4)", fontWeight: 600 }}>({filledSections}/{sections.length} auto-drafted)</span>
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
                    <button
                      type="button"
                      onClick={() => regenerateSection(s.id)}
                      style={{ color: "var(--brand-deep)", flexShrink: 0, display: "grid", placeItems: "center" }}
                      title="Auto-write this section again"
                    >
                      <RefreshCw size={13} />
                    </button>
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

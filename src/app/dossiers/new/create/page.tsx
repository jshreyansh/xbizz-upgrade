"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Plus, Trash2, RefreshCw, ArrowRight } from "lucide-react";
import { AppShell } from "@/features/workspace/app-shell";
import { DossierFlowShell } from "@/features/dossiers/dossier-flow-shell";
import { useDossierDraftStore } from "@/features/dossiers/dossier-draft-store";
import { ProcessingChecklist, SuccessScreen, buildMockDossier, autoWriteSection, REGULATORY_BODIES, PREVIEW_SECTIONS } from "@/features/dossiers/dossier-flow-pieces";
import { DossierPreviewChat } from "@/features/dossiers/dossier-preview-chat";
import { useAssistantChat, DossierAssistantPanel, isQuestion } from "@/features/dossiers/dossier-assistant-chat";
import { mapAiResultToBrandDossier, type AiDossierResult } from "@/features/dossiers/ai-dossier-prompt";
import type { BrandDossier, RegulatoryBody } from "@/features/dossiers/dossier-types";

/** Calls the real Brand Dossier Generator; falls back to the offline mock
 *  whenever the API isn't configured, errors, or is unreachable — so the
 *  flow never breaks even without an ANTHROPIC_API_KEY set. */
async function generateDossier(input: {
  brandName: string;
  genericName: string;
  indication: string;
  anchor: RegulatoryBody;
  category: string;
  audiences: string[];
}): Promise<BrandDossier> {
  try {
    const res = await fetch("/api/generate-dossier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawInput: input.indication }),
    });
    if (!res.ok) throw new Error("generator unavailable");
    const data: { result: AiDossierResult } = await res.json();
    return mapAiResultToBrandDossier(data.result, {
      brandName: input.brandName,
      genericName: input.genericName,
      regulatoryAnchor: input.anchor,
      category: input.category,
      targetAudience: input.audiences,
    });
  } catch {
    return buildMockDossier({
      brandName: input.brandName,
      genericName: input.genericName,
      indication: input.indication,
      regulatoryAnchor: input.anchor,
      sectionTitles: PREVIEW_SECTIONS,
      category: input.category,
      targetAudience: input.audiences,
    });
  }
}

type Phase = "input" | "processing" | "review" | "preview" | "success";
type DraftSection = { id: string; title: string; content: string; claimsCount: number };

export default function NewDossierCreatePage() {
  const router = useRouter();
  const { brandName, genericName, anchor: draftAnchor, category, audiences, supportingFiles, path, reset, addCreatedDossier } = useDossierDraftStore();

  const [phase, setPhase] = useState<Phase>("input");
  const [indication, setIndication] = useState("");
  const [anchor, setAnchor] = useState<RegulatoryBody>(draftAnchor);
  const [dossier, setDossier] = useState<BrandDossier | null>(null);
  const [draftSections, setDraftSections] = useState<DraftSection[]>([]);

  // Guard against direct URL access mid-flow.
  useEffect(() => {
    if (!brandName) router.replace("/dossiers/new");
    else if (path !== "create") router.replace("/dossiers/new/path");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finish(andOpen: boolean) {
    if (dossier) addCreatedDossier(dossier);
    const id = dossier?.id;
    reset();
    router.push(andOpen && id ? `/dossiers?open=${id}` : "/dossiers");
  }

  function addDraftSection(title?: string) {
    const t = title || "New section";
    setDraftSections((s) => [...s, { id: `sec-custom-${s.length}-${Date.now().toString(36)}`, title: t, content: autoWriteSection(t, brandName, genericName), claimsCount: 0 }]);
  }
  function removeDraftSection(id: string) {
    setDraftSections((s) => s.filter((sec) => sec.id !== id));
  }
  function updateDraftSectionTitle(id: string, title: string) {
    setDraftSections((s) => s.map((sec) => (sec.id === id ? { ...sec, title } : sec)));
  }
  function updateDraftSectionContent(id: string, content: string) {
    setDraftSections((s) => s.map((sec) => (sec.id === id ? { ...sec, content } : sec)));
  }
  function regenerateDraftSection(id: string) {
    setDraftSections((s) => s.map((sec) => (sec.id === id ? { ...sec, content: autoWriteSection(sec.title, brandName, genericName) } : sec)));
  }

  function respond(text: string): string {
    const lower = text.toLowerCase();

    if (phase === "review") {
      if (isQuestion(text)) {
        return "This is your draft, ready to edit — nothing here is final. Ask me to rewrite a section, add a new one, or just edit the text directly. Say \"continue\" when it looks good.";
      }

      const addSectionMatch = text.match(/add (?:a |another )?section (?:called |named |for |titled )?["“]?([a-z0-9 &/'-]+?)["”]?[.!]?$/i);
      if (addSectionMatch) {
        const title = addSectionMatch[1].trim().replace(/\b\w/g, (c) => c.toUpperCase());
        addDraftSection(title);
        return `Added and auto-drafted a new section — "${title}". You'll see it at the bottom of the list.`;
      }

      const rewriteMatch = /(rewrite|regenerate|redo|auto.?write|refresh)/.test(lower)
        ? draftSections.find((s) =>
            s.title
              .toLowerCase()
              .split(/[\s&/]+/)
              .filter((w) => w.length > 3)
              .some((w) => lower.includes(w))
          )
        : undefined;
      if (rewriteMatch) {
        regenerateDraftSection(rewriteMatch.id);
        return `Auto-wrote "${rewriteMatch.title}" again — check the updated draft below.`;
      }

      if (/\b(continue|next|looks good|done|proceed|finish)\b/.test(lower)) {
        setTimeout(() => continueToPreview(), 500);
        return "Great — building the final preview now.";
      }

      return 'Ask me to rewrite a section, add a new one, or edit the text directly — say "continue" when it looks good.';
    }

    if (isQuestion(text)) {
      return "Give me a short brief — what this brand is for and who it's for — and a regulatory anchor if you know it. I'll analyze approved label & literature, draft every section, and hand you an editable review before it's final.";
    }

    const anchorMatch = REGULATORY_BODIES.find((b) => lower.includes(b.toLowerCase()));
    const notes: string[] = [];
    if (anchorMatch) {
      setAnchor(anchorMatch);
      notes.push(`the regulatory anchor to ${anchorMatch}`);
    }
    const looksLikeBrief = text.trim().length > 20 && !/^(go|start|analy[sz]e)\b/i.test(text.trim());
    if (looksLikeBrief) {
      setIndication(text);
      notes.push("the brief");
    }
    if (/\b(go|start|analy[sz]e)\b/i.test(lower)) {
      if (indication.trim() || looksLikeBrief) {
        setTimeout(() => startAnalysis(), 700);
        return "On it — analyzing now.";
      }
      return "I need a brief first — tell me what this brand is for and who it's for.";
    }
    if (notes.length) return `Done — set ${notes.join(" and ")}. Say "go" whenever you're ready to analyze.`;
    return 'Tell me the brief (what it\'s for, who it\'s for) and the regulatory anchor — or just say "go" once the form is filled in.';
  }

  const { messages, thinking, send, pushAssistant } = useAssistantChat(
    `Tell me the brief for ${brandName}, and the regulatory anchor if you know it — I'll fill this step in for you.`,
    respond
  );

  if (!brandName || path !== "create") return null;

  const canAnalyze = indication.trim().length > 0;

  async function startAnalysis() {
    setPhase("processing");
    pushAssistant("Analyzing your brief now — I'll let you know the moment the draft's ready.");
    // Run the real generation alongside a minimum display time so the
    // processing checklist always finishes its animation — whether the
    // API responds in 200ms or a few seconds.
    const [generated] = await Promise.all([
      generateDossier({ brandName, genericName, indication, anchor, category, audiences }),
      new Promise((resolve) => setTimeout(resolve, 3400)),
    ]);
    setDossier(generated);
    setDraftSections(generated.sections.map((s) => ({ id: s.id, title: s.title, content: s.content, claimsCount: s.claimsCount })));
    setPhase("review");
    pushAssistant(`Here's the first draft of ${generated.brandName}'s dossier — edit anything, ask me to rewrite a section, or add another, then say "continue" when it's ready.`);
  }

  function continueToPreview() {
    if (!dossier) return;
    const mergedSections = draftSections.map((s, i) => ({
      id: s.id,
      number: i + 1,
      title: s.title,
      category: dossier.sections[i]?.category ?? (["clinical", "commercial", "regulatory", "safety"] as const)[i % 4],
      content: s.content,
      claimsCount: s.claimsCount,
      heldOutCount: 0,
      citations: dossier.sections.find((sec) => sec.id === s.id)?.citations ?? [],
    }));
    setDossier({
      ...dossier,
      sections: mergedSections,
      sectionsCount: mergedSections.length,
      claimsCited: mergedSections.reduce((sum, s) => sum + s.claimsCount, 0),
    });
    setPhase("preview");
  }

  return (
    <AppShell pageTitle="New Brand Dossier">
      <DossierFlowShell
        step={3}
        stepLabel="Create"
        backHref={phase === "input" ? "/dossiers/new/path" : undefined}
        wide={phase === "preview" || phase === "review"}
        chat={
          phase === "preview" || phase === "success"
            ? undefined
            : (
                <DossierAssistantPanel
                  messages={messages}
                  thinking={thinking}
                  onSend={send}
                  disabled={phase === "processing"}
                  disabledNote="Analyzing — hang tight…"
                  placeholder={phase === "review" ? 'e.g. "rewrite the safety section"' : "Tell me the brief, or the anchor"}
                  subtitle={phase === "review" ? "Edit & rebuild by prompt" : "Fill this step by prompt"}
                  quickReplies={
                    phase === "input"
                      ? ["What does this step do?"]
                      : phase === "review"
                      ? ["Continue", "What does this step do?"]
                      : undefined
                  }
                />
              )
        }
      >
        {phase === "input" && (
          <>
            <h1 style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-.3px", margin: "0 0 4px", color: "var(--ink)" }}>Create {brandName}&rsquo;s dossier</h1>
            <p style={{ fontSize: 13.5, color: "var(--ink-3)", margin: "0 0 14px" }}>
              Give us the brief — we&rsquo;ll draft every section, then hand you an editable review before it&rsquo;s final.
            </p>
            {supportingFiles.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 13px", borderRadius: "var(--r)", background: "var(--tint-2)", border: "1px solid var(--tint-line)", fontSize: 12.5, color: "var(--brand-deep)", fontWeight: 650, marginBottom: 18 }}>
                <FileText size={13} />
                {supportingFiles.length} supporting document{supportingFiles.length > 1 ? "s" : ""} carried over from the product step
              </div>
            )}

            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink-2)", marginBottom: 6 }}>Indication / brief</label>
            <textarea
              value={indication}
              onChange={(e) => setIndication(e.target.value)}
              rows={4}
              placeholder="What is this brand for, and who's the audience?"
              style={{ width: "100%", padding: "11px 13px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", fontSize: 14, marginBottom: 20, resize: "vertical", color: "var(--ink)", fontFamily: "inherit" }}
            />

            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink-2)", marginBottom: 6 }}>Regulatory anchor</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
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

            <button
              type="button"
              disabled={!canAnalyze}
              onClick={startAnalysis}
              style={{
                width: "100%",
                padding: "13px 0",
                borderRadius: "var(--r)",
                fontWeight: 750,
                fontSize: 14.5,
                color: "#fff",
                background: !canAnalyze ? "var(--ink-4)" : "linear-gradient(180deg,#ff5b2d,var(--brand))",
                opacity: !canAnalyze ? 0.5 : 1,
                cursor: !canAnalyze ? "not-allowed" : "pointer",
                boxShadow: !canAnalyze ? "none" : "0 12px 24px -12px rgba(253,72,22,.6)",
              }}
            >
              Analyze &amp; create
            </button>
          </>
        )}

        {phase === "processing" && (
          <ProcessingChecklist
            title="Analyzing brand & building preview"
            items={["Reading approved label & literature", "Drafting section outline", "Grounding claims to sources", "Building preview"]}
            onDone={() => {}}
          />
        )}

        {phase === "review" && (
          <>
            <h1 style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-.3px", margin: "0 0 4px", color: "var(--ink)" }}>Review {brandName}&rsquo;s draft</h1>
            <p style={{ fontSize: 13.5, color: "var(--ink-3)", margin: "6px 0 20px" }}>
              Every section is already drafted — edit anything, or ask the agent to rewrite a section.
            </p>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)" }}>
                Sections <span style={{ color: "var(--ink-4)", fontWeight: 600 }}>({draftSections.length})</span>
              </label>
              <button
                type="button"
                onClick={() => addDraftSection()}
                style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "var(--brand-deep)", background: "var(--tint)", border: "1px solid var(--tint-line)", padding: "5px 10px", borderRadius: 99 }}
              >
                <Plus size={13} />
                Add section
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {draftSections.map((s) => (
                <div key={s.id} style={{ border: "1px solid var(--hair)", borderRadius: "var(--r)", background: "var(--surface-subtle)", padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <input
                      value={s.title}
                      onChange={(e) => updateDraftSectionTitle(s.id, e.target.value)}
                      style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 700, color: "var(--ink)", background: "transparent", border: "none", outline: "none" }}
                    />
                    <button
                      type="button"
                      onClick={() => regenerateDraftSection(s.id)}
                      style={{ color: "var(--brand-deep)", flexShrink: 0, display: "grid", placeItems: "center" }}
                      title="Auto-write this section again"
                    >
                      <RefreshCw size={13} />
                    </button>
                    <button type="button" onClick={() => removeDraftSection(s.id)} style={{ color: "var(--ink-4)", flexShrink: 0 }} title="Remove section">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <textarea
                    value={s.content}
                    onChange={(e) => updateDraftSectionContent(s.id, e.target.value)}
                    rows={3}
                    placeholder={`Write the ${s.title.toLowerCase()} content…`}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--hair)", fontSize: 12.5, resize: "vertical", color: "var(--ink)", background: "#fff", fontFamily: "inherit" }}
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={continueToPreview}
              style={{
                width: "100%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "13px 0",
                borderRadius: "var(--r)",
                fontWeight: 750,
                fontSize: 14.5,
                color: "#fff",
                background: "linear-gradient(180deg,#ff5b2d,var(--brand))",
                boxShadow: "0 12px 24px -12px rgba(253,72,22,.6)",
              }}
            >
              Continue to preview
              <ArrowRight size={15} />
            </button>
          </>
        )}

        {phase === "preview" && dossier && (
          <DossierPreviewChat
            dossier={dossier}
            onChange={(updater) => setDossier((prev) => (prev ? updater(prev) : prev))}
            onFinish={() => setPhase("success")}
          />
        )}

        {phase === "success" && dossier && (
          <SuccessScreen
            headline="Brand dossier created"
            subtitle={`${dossier.brandName} is drafted, grounded, and ready for review.`}
            dossier={dossier}
            onClose={() => finish(false)}
            onViewDossier={() => finish(true)}
          />
        )}
      </DossierFlowShell>
    </AppShell>
  );
}

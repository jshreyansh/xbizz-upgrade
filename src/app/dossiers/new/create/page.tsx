"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, ArrowRight, Sparkles, WifiOff } from "lucide-react";
import { AppShell } from "@/features/workspace/app-shell";
import { DossierFlowShell } from "@/features/dossiers/dossier-flow-shell";
import { useDossierDraftStore } from "@/features/dossiers/dossier-draft-store";
import { ProcessingChecklist, SuccessScreen, buildMockDossier, REGULATORY_BODIES, PREVIEW_SECTIONS } from "@/features/dossiers/dossier-flow-pieces";
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

type Phase = "input" | "processing" | "preview" | "success";

export default function NewDossierCreatePage() {
  const router = useRouter();
  const { brandName, genericName, anchor: draftAnchor, category, audiences, supportingFiles, path, reset, addCreatedDossier } = useDossierDraftStore();

  const [phase, setPhase] = useState<Phase>("input");
  const [indication, setIndication] = useState("");
  const [anchor, setAnchor] = useState<RegulatoryBody>(draftAnchor);
  const [dossier, setDossier] = useState<BrandDossier | null>(null);

  // Guard against direct URL access mid-flow.
  useEffect(() => {
    if (!brandName) router.replace("/dossiers/new");
    else if (path !== "create") router.replace("/dossiers/new/path");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!brandName || path !== "create") return null;

  async function startAnalysis() {
    setPhase("processing");
    // Run the real generation alongside a minimum display time so the
    // processing checklist always finishes its animation — whether the
    // API responds in 200ms or a few seconds.
    const [generated] = await Promise.all([
      generateDossier({ brandName, genericName, indication, anchor, category, audiences }),
      new Promise((resolve) => setTimeout(resolve, 3400)),
    ]);
    setDossier(generated);
    setPhase("preview");
  }

  function finish(andOpen: boolean) {
    if (dossier) addCreatedDossier(dossier);
    const id = dossier?.id;
    reset();
    router.push(andOpen && id ? `/dossiers?open=${id}` : "/dossiers");
  }

  const canAnalyze = indication.trim().length > 0;

  return (
    <AppShell pageTitle="New Brand Dossier">
      <DossierFlowShell step={3} stepLabel="Create" backHref={phase === "input" ? "/dossiers/new/path" : undefined}>
        {phase === "input" && (
          <>
            <h1 style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-.3px", margin: "0 0 4px", color: "var(--ink)" }}>Create {brandName}&rsquo;s dossier</h1>
            <p style={{ fontSize: 13.5, color: "var(--ink-3)", margin: "0 0 14px" }}>
              Give us the brief — we&rsquo;ll analyze approved sources and draft a preview.
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

        {phase === "preview" && dossier && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-.3px", margin: 0, color: "var(--ink)" }}>
                Preview — {dossier.brandName}
              </h1>
              {dossier.generatedBy === "ai" ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "var(--brand-deep)", background: "var(--tint)", border: "1px solid var(--tint-line)", padding: "3px 9px", borderRadius: 99, flexShrink: 0 }}>
                  <Sparkles size={11} />
                  Generated with Claude
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "var(--ink-4)", background: "var(--surface-subtle)", border: "1px solid var(--hair)", padding: "3px 9px", borderRadius: 99, flexShrink: 0 }}>
                  <WifiOff size={11} />
                  Offline preview data
                </span>
              )}
            </div>
            <p style={{ fontSize: 13.5, color: "var(--ink-3)", margin: "0 0 18px" }}>
              {dossier.sectionsCount} sections drafted and grounded to {dossier.sourcesCount} sources.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 26, maxHeight: 320, overflowY: "auto" }}>
              {dossier.sections.map((s) => (
                <div
                  key={s.id}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 13px", borderRadius: "var(--r)", background: "var(--surface-subtle)", border: "1px solid var(--hair)" }}
                >
                  <span style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", background: "var(--ok-bg)", border: "1px solid var(--ok-line)", fontSize: 10.5, fontWeight: 800, color: "var(--ok)" }}>
                    {s.number}
                  </span>
                  <span style={{ fontSize: 13.5, fontWeight: 650, color: "var(--ink-2)", flex: 1 }}>{s.title}</span>
                  <span style={{ fontSize: 9.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".03em", color: "var(--ink-4)" }}>{s.claimsCount} claims</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setPhase("success")}
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
              Looks good — finish
              <ArrowRight size={15} />
            </button>
          </>
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

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText } from "lucide-react";
import { AppShell } from "@/features/workspace/app-shell";
import { DossierFlowShell } from "@/features/dossiers/dossier-flow-shell";
import { useDossierDraftStore } from "@/features/dossiers/dossier-draft-store";
import { ProcessingChecklist, SuccessScreen, buildMockDossier } from "@/features/dossiers/dossier-flow-pieces";
import type { BrandDossier } from "@/features/dossiers/dossier-types";

type Phase = "input" | "processing" | "success";

export default function NewDossierUploadPage() {
  const router = useRouter();
  const { brandName, genericName, anchor, category, audiences, supportingFiles, path, reset, addCreatedDossier } = useDossierDraftStore();

  const [phase, setPhase] = useState<Phase>("input");
  const [fileName, setFileName] = useState<string | null>(null);
  const [dossier, setDossier] = useState<BrandDossier | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Guard against direct URL access mid-flow.
  useEffect(() => {
    if (!brandName) router.replace("/dossiers/new");
    else if (path !== "upload") router.replace("/dossiers/new/path");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!brandName || path !== "upload") return null;

  function handleFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  }

  function startVerification() {
    setDossier(buildMockDossier({ brandName, genericName, indication: `Extracted from ${fileName}`, regulatoryAnchor: anchor, category, targetAudience: audiences }));
    setPhase("processing");
  }

  function finish(andOpen: boolean) {
    if (dossier) addCreatedDossier(dossier);
    const id = dossier?.id;
    reset();
    router.push(andOpen && id ? `/dossiers?open=${id}` : "/dossiers");
  }

  const canUpload = !!fileName;

  return (
    <AppShell pageTitle="New Brand Dossier">
      <DossierFlowShell step={3} stepLabel="Upload" backHref={phase === "input" ? "/dossiers/new/path" : undefined}>
        {phase === "input" && (
          <>
            <h1 style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-.3px", margin: "0 0 4px", color: "var(--ink)" }}>Upload {brandName}&rsquo;s dossier</h1>
            <p style={{ fontSize: 13.5, color: "var(--ink-3)", margin: "0 0 14px" }}>
              We&rsquo;ll verify and validate it against the {anchor} anchor.
            </p>
            {supportingFiles.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 13px", borderRadius: "var(--r)", background: "var(--tint-2)", border: "1px solid var(--tint-line)", fontSize: 12.5, color: "var(--brand-deep)", fontWeight: 650, marginBottom: 18 }}>
                <FileText size={13} />
                {supportingFiles.length} supporting document{supportingFiles.length > 1 ? "s" : ""} carried over from the product step
              </div>
            )}

            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink-2)", marginBottom: 6 }}>Dossier file</label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: "26px 16px",
                borderRadius: "var(--r-l)",
                border: `1.5px dashed ${fileName ? "var(--brand)" : "var(--hair-2)"}`,
                background: fileName ? "var(--tint-2)" : "var(--surface-subtle)",
                cursor: "pointer",
                marginBottom: 28,
              }}
            >
              {fileName ? <FileText size={22} color="var(--brand-deep)" /> : <Upload size={22} color="var(--ink-4)" />}
              <span style={{ fontSize: 13, fontWeight: 650, color: fileName ? "var(--brand-deep)" : "var(--ink-3)" }}>
                {fileName ?? "Click to browse — PDF, DOCX, or PPTX"}
              </span>
            </button>
            <input ref={fileInputRef} type="file" onChange={handleFilePicked} style={{ display: "none" }} accept=".pdf,.doc,.docx,.ppt,.pptx" />

            <button
              type="button"
              disabled={!canUpload}
              onClick={startVerification}
              style={{
                width: "100%",
                padding: "13px 0",
                borderRadius: "var(--r)",
                fontWeight: 750,
                fontSize: 14.5,
                color: "#fff",
                background: !canUpload ? "var(--ink-4)" : "linear-gradient(180deg,#ff5b2d,var(--brand))",
                opacity: !canUpload ? 0.5 : 1,
                cursor: !canUpload ? "not-allowed" : "pointer",
                boxShadow: !canUpload ? "none" : "0 12px 24px -12px rgba(253,72,22,.6)",
              }}
            >
              Verify &amp; validate
            </button>
          </>
        )}

        {phase === "processing" && (
          <ProcessingChecklist
            title="Verifying & validating"
            items={["Scanning document structure", "Extracting brand & indication", "Matching regulatory anchor", "Cross-referencing citations"]}
            onDone={() => setPhase("success")}
          />
        )}

        {phase === "success" && dossier && (
          <SuccessScreen
            headline="Dossier verified & validated"
            subtitle={`${dossier.brandName} passed all checks and is ready to use.`}
            dossier={dossier}
            onClose={() => finish(false)}
            onViewDossier={() => finish(true)}
          />
        )}
      </DossierFlowShell>
    </AppShell>
  );
}

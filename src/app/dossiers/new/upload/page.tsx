"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText } from "lucide-react";
import { AppShell } from "@/features/workspace/app-shell";
import { DossierFlowShell } from "@/features/dossiers/dossier-flow-shell";
import { useDossierDraftStore } from "@/features/dossiers/dossier-draft-store";
import { ProcessingChecklist, SuccessScreen, buildMockDossier } from "@/features/dossiers/dossier-flow-pieces";
import { DossierPreviewChat } from "@/features/dossiers/dossier-preview-chat";
import { useAssistantChat, DossierAssistantPanel, isQuestion } from "@/features/dossiers/dossier-assistant-chat";
import type { BrandDossier } from "@/features/dossiers/dossier-types";

type Phase = "input" | "processing" | "preview" | "success";

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

  function finish(andOpen: boolean) {
    if (dossier) addCreatedDossier(dossier);
    const id = dossier?.id;
    reset();
    router.push(andOpen && id ? `/dossiers?open=${id}` : "/dossiers");
  }

  function respond(text: string): string {
    const lower = text.toLowerCase();

    if (phase === "success") {
      if (isQuestion(text)) {
        return "The document's verified and saved. From here you can start a video or creative from it, invite reviewers for MLR sign-off, or open it to inspect the sections in full.";
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
      return "Attach your existing dossier document (PDF, DOCX, or PPTX) and I'll verify it against the regulatory anchor and cross-reference its citations — no need to rewrite anything.";
    }

    if (/\b(verify|validate|go|start)\b/.test(lower)) {
      if (fileName) {
        setTimeout(() => startVerification(), 700);
        return "On it — verifying now.";
      }
      return "Attach your file first — click the 📎 icon and I'll take it from there.";
    }
    if (/(upload|attach|document|file)/.test(lower)) {
      return "Click the 📎 icon below and I'll attach it and get it ready to verify.";
    }
    return 'Attach your existing dossier document with the 📎 icon, then say "verify" — or use the dropzone below.';
  }

  const { messages, thinking, send, pushAssistant, pushUser } = useAssistantChat(
    `Attach ${brandName}'s existing dossier document and I'll verify it against the ${anchor} anchor.`,
    respond
  );

  if (!brandName || path !== "upload") return null;

  const canUpload = !!fileName;

  function handleFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  }

  function startVerification() {
    setDossier(buildMockDossier({ brandName, genericName, indication: `Extracted from ${fileName}`, regulatoryAnchor: anchor, category, targetAudience: audiences }));
    setPhase("processing");
    pushAssistant("Verifying your document now — I'll let you know the moment it's checked.");
  }

  return (
    <AppShell pageTitle="New Brand Dossier">
      <DossierFlowShell
        step={3}
        stepLabel="Upload"
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
                          setFileName(file.name);
                          pushUser(`📎 Attached ${file.name}`);
                          pushAssistant(`Got "${file.name}" — say "verify" whenever you're ready, or I can start now.`);
                        }
                      : undefined
                  }
                  disabled={phase === "processing"}
                  disabledNote="Verifying — hang tight…"
                  placeholder={phase === "success" ? 'e.g. "start a video from this"' : 'Attach a file, or say "verify"'}
                  subtitle={phase === "success" ? "What's next?" : "Fill this step by prompt"}
                  quickReplies={
                    phase === "success"
                      ? ["Start a video from this", "Invite reviewers", "View dossier"]
                      : phase === "input"
                      ? ["What does this step do?"]
                      : undefined
                  }
                />
              )
        }
      >
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

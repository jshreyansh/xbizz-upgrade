"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Upload, PenLine } from "lucide-react";
import { AppShell } from "@/features/workspace/app-shell";
import { DossierFlowShell } from "@/features/dossiers/dossier-flow-shell";
import { useDossierDraftStore } from "@/features/dossiers/dossier-draft-store";
import { useAssistantChat, DossierAssistantPanel, isQuestion } from "@/features/dossiers/dossier-assistant-chat";

export default function NewDossierPathPage() {
  const router = useRouter();
  const brandName = useDossierDraftStore((s) => s.brandName);
  const setPath = useDossierDraftStore((s) => s.setPath);

  // Direct URL access without a product chosen yet — send them back to start.
  useEffect(() => {
    if (!brandName) router.replace("/dossiers/new");
  }, [brandName, router]);

  function respond(text: string): string {
    const lower = text.toLowerCase();
    if (isQuestion(text)) {
      return "Create has AI draft everything from approved label & literature — fastest if you're starting fresh. Upload lets you bring an existing document in for verification. Long form lets you type every section yourself, start to finish. All three end up MLR-ready.";
    }
    if (/(upload|existing|already have|deck|pdf|doc|file)/.test(lower)) {
      setPath("upload");
      setTimeout(() => router.push("/dossiers/new/upload"), 800);
      return "Got it — taking you to Upload so you can bring your existing document.";
    }
    if (/(long.?form|manual|myself|type it|write it myself|from scratch by hand)/.test(lower)) {
      setPath("longform");
      setTimeout(() => router.push("/dossiers/new/longform"), 800);
      return "Got it — taking you to the long form so you can author every section yourself.";
    }
    if (/(create|scratch|ai|draft|generate|write)/.test(lower)) {
      setPath("create");
      setTimeout(() => router.push("/dossiers/new/create"), 800);
      return "Got it — I'll draft it from approved sources. Taking you to Create.";
    }
    return 'Let me know — should I draft this from scratch, bring in an existing document, or write it yourself in the long form? Just say "create", "upload", or "long form".';
  }

  const { messages, thinking, send } = useAssistantChat(
    `Should I draft ${brandName || "this"}'s dossier from scratch, do you have an existing document to bring in, or would you rather write it yourself in the long form?`,
    respond
  );

  if (!brandName) return null;

  return (
    <AppShell pageTitle="New Brand Dossier">
      <DossierFlowShell
        step={2}
        stepLabel="Choose a path"
        backHref="/dossiers/new"
        chat={
          <DossierAssistantPanel
            messages={messages}
            thinking={thinking}
            onSend={send}
            placeholder='"create" or "upload"'
            subtitle="Pick a path by prompt"
            quickReplies={["Create from scratch", "Upload a document", "Long form", "What's the difference?"]}
          />
        }
      >
        <h1 style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-.3px", margin: "0 0 4px", color: "var(--ink)", textAlign: "center" }}>
          How do you want to build {brandName}&rsquo;s dossier?
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--ink-3)", margin: "0 0 26px", textAlign: "center" }}>
          Either way, it&rsquo;ll be grounded and MLR-ready.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <button
            type="button"
            onClick={() => {
              setPath("create");
              router.push("/dossiers/new/create");
            }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "24px 14px", borderRadius: "var(--r-l)", border: "1px solid var(--hair-2)", background: "#fff", cursor: "pointer", textAlign: "center" }}
            className="hover:-translate-y-0.5 transition-transform"
          >
            <span style={{ width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", background: "linear-gradient(180deg,#ff5b2d,var(--brand))", color: "#fff" }}>
              <Sparkles size={20} />
            </span>
            <b style={{ fontSize: 14.5, fontWeight: 800, color: "var(--ink)" }}>Create</b>
            <span style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.4 }}>AI drafts it from approved sources</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPath("upload");
              router.push("/dossiers/new/upload");
            }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "24px 14px", borderRadius: "var(--r-l)", border: "1px solid var(--hair-2)", background: "#fff", cursor: "pointer", textAlign: "center" }}
            className="hover:-translate-y-0.5 transition-transform"
          >
            <span style={{ width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", background: "var(--ink)", color: "#fff" }}>
              <Upload size={20} />
            </span>
            <b style={{ fontSize: 14.5, fontWeight: 800, color: "var(--ink)" }}>Upload</b>
            <span style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.4 }}>Bring an existing document</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPath("longform");
              router.push("/dossiers/new/longform");
            }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "24px 14px", borderRadius: "var(--r-l)", border: "1px solid var(--hair-2)", background: "#fff", cursor: "pointer", textAlign: "center" }}
            className="hover:-translate-y-0.5 transition-transform"
          >
            <span style={{ width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", background: "linear-gradient(180deg,#9b6bff,#5b21b6)", color: "#fff" }}>
              <PenLine size={20} />
            </span>
            <b style={{ fontSize: 14.5, fontWeight: 800, color: "var(--ink)" }}>Long form</b>
            <span style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.4 }}>Write every section yourself</span>
          </button>
        </div>
      </DossierFlowShell>
    </AppShell>
  );
}

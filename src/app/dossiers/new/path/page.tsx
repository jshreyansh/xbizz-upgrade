"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Upload } from "lucide-react";
import { AppShell } from "@/features/workspace/app-shell";
import { DossierFlowShell } from "@/features/dossiers/dossier-flow-shell";
import { useDossierDraftStore } from "@/features/dossiers/dossier-draft-store";

export default function NewDossierPathPage() {
  const router = useRouter();
  const brandName = useDossierDraftStore((s) => s.brandName);
  const setPath = useDossierDraftStore((s) => s.setPath);

  // Direct URL access without a product chosen yet — send them back to start.
  useEffect(() => {
    if (!brandName) router.replace("/dossiers/new");
  }, [brandName, router]);

  if (!brandName) return null;

  return (
    <AppShell pageTitle="New Brand Dossier">
      <DossierFlowShell step={2} stepLabel="Choose a path" backHref="/dossiers/new">
        <h1 style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-.3px", margin: "0 0 4px", color: "var(--ink)", textAlign: "center" }}>
          How do you want to build {brandName}&rsquo;s dossier?
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--ink-3)", margin: "0 0 26px", textAlign: "center" }}>
          Either way, it&rsquo;ll be grounded and MLR-ready.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <button
            type="button"
            onClick={() => {
              setPath("create");
              router.push("/dossiers/new/create");
            }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "28px 16px", borderRadius: "var(--r-l)", border: "1px solid var(--hair-2)", background: "#fff", cursor: "pointer", textAlign: "center" }}
            className="hover:-translate-y-0.5 transition-transform"
          >
            <span style={{ width: 46, height: 46, borderRadius: 14, display: "grid", placeItems: "center", background: "linear-gradient(180deg,#ff5b2d,var(--brand))", color: "#fff" }}>
              <Sparkles size={21} />
            </span>
            <b style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)" }}>Create</b>
            <span style={{ fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.45 }}>AI drafts it from approved sources</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPath("upload");
              router.push("/dossiers/new/upload");
            }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "28px 16px", borderRadius: "var(--r-l)", border: "1px solid var(--hair-2)", background: "#fff", cursor: "pointer", textAlign: "center" }}
            className="hover:-translate-y-0.5 transition-transform"
          >
            <span style={{ width: 46, height: 46, borderRadius: 14, display: "grid", placeItems: "center", background: "var(--ink)", color: "#fff" }}>
              <Upload size={21} />
            </span>
            <b style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)" }}>Upload</b>
            <span style={{ fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.45 }}>Bring an existing document</span>
          </button>
        </div>
      </DossierFlowShell>
    </AppShell>
  );
}

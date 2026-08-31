"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Sparkles, ChevronDown } from "lucide-react";
import { AppShell } from "@/features/workspace/app-shell";
import { DossierFlowShell } from "@/features/dossiers/dossier-flow-shell";
import { useDossierDraftStore, applyProductSelection } from "@/features/dossiers/dossier-draft-store";
import { BRAND_REGISTRY } from "@/features/dossiers/mock-dossiers";
import { DOSSIER_CATEGORIES, TARGET_AUDIENCES, OTHER_PRODUCT_ID } from "@/features/dossiers/dossier-flow-pieces";

export default function NewDossierProductPage() {
  const router = useRouter();
  const supportingFilesRef = useRef<HTMLInputElement>(null);

  const productId = useDossierDraftStore((s) => s.productId);
  const brandName = useDossierDraftStore((s) => s.brandName);
  const category = useDossierDraftStore((s) => s.category);
  const audiences = useDossierDraftStore((s) => s.audiences);
  const supportingFiles = useDossierDraftStore((s) => s.supportingFiles);
  const setOtherBrandName = useDossierDraftStore((s) => s.setOtherBrandName);
  const setCategory = useDossierDraftStore((s) => s.setCategory);
  const toggleAudience = useDossierDraftStore((s) => s.toggleAudience);
  const addSupportingFiles = useDossierDraftStore((s) => s.addSupportingFiles);

  const isOtherProduct = productId === OTHER_PRODUCT_ID;
  const productChosen = isOtherProduct ? brandName.trim().length > 0 : productId.length > 0;

  function handleProductChange(id: string) {
    const brand = BRAND_REGISTRY.find((b) => b.id === id);
    applyProductSelection(id, brand);
  }

  function handleSupportingFilesPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) addSupportingFiles(files);
  }

  return (
    <AppShell pageTitle="New Brand Dossier">
      <DossierFlowShell step={1} stepLabel="Product" backHref="/dossiers">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ width: 36, height: 36, borderRadius: 11, display: "grid", placeItems: "center", background: "var(--tint)", color: "var(--brand-deep)" }}>
            <Sparkles size={17} />
          </span>
          <h1 style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-.3px", margin: 0, color: "var(--ink)" }}>New brand dossier</h1>
        </div>
        <p style={{ fontSize: 13.5, color: "var(--ink-3)", margin: "6px 0 22px" }}>Which product is this for?</p>

        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink-2)", marginBottom: 6 }}>Product</label>
        <div style={{ position: "relative", marginBottom: isOtherProduct ? 16 : 22 }}>
          <select
            value={productId}
            onChange={(e) => handleProductChange(e.target.value)}
            style={{
              width: "100%",
              padding: "11px 34px 11px 13px",
              borderRadius: "var(--r)",
              border: "1px solid var(--hair-2)",
              fontSize: 14,
              color: productId ? "var(--ink)" : "var(--ink-4)",
              background: "#fff",
              appearance: "none",
              cursor: "pointer",
            }}
          >
            <option value="" disabled>
              Choose a product…
            </option>
            {BRAND_REGISTRY.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} — {b.therapyArea}
                {b.hasDossier ? " (has a dossier)" : ""}
              </option>
            ))}
            <option value={OTHER_PRODUCT_ID}>Other / new product…</option>
          </select>
          <ChevronDown size={15} style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", color: "var(--ink-4)", pointerEvents: "none" }} />
        </div>

        {isOtherProduct && (
          <>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink-2)", marginBottom: 6 }}>Brand name</label>
            <input
              value={brandName}
              onChange={(e) => setOtherBrandName(e.target.value)}
              placeholder="e.g. Velmora"
              style={{ width: "100%", padding: "11px 13px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", fontSize: 14, marginBottom: 22, color: "var(--ink)" }}
            />
          </>
        )}

        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink-2)", marginBottom: 6 }}>Dossier category</label>
        <div style={{ position: "relative", marginBottom: 22 }}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: "100%",
              padding: "11px 34px 11px 13px",
              borderRadius: "var(--r)",
              border: "1px solid var(--hair-2)",
              fontSize: 14,
              color: category ? "var(--ink)" : "var(--ink-4)",
              background: "#fff",
              appearance: "none",
              cursor: "pointer",
            }}
          >
            <option value="">Choose a category…</option>
            {DOSSIER_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown size={15} style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", color: "var(--ink-4)", pointerEvents: "none" }} />
        </div>

        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink-2)", marginBottom: 6 }}>Target audience</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
          {TARGET_AUDIENCES.map((a) => {
            const selected = audiences.includes(a);
            return (
              <button
                key={a}
                type="button"
                onClick={() => toggleAudience(a)}
                style={{
                  padding: "8px 15px",
                  borderRadius: 99,
                  fontSize: 13,
                  fontWeight: 700,
                  color: selected ? "#fff" : "var(--ink-3)",
                  background: selected ? "var(--ink)" : "var(--surface-subtle)",
                  border: "1px solid var(--hair)",
                }}
              >
                {a}
              </button>
            );
          })}
        </div>

        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink-2)", marginBottom: 6 }}>Supporting documents (optional)</label>
        <button
          type="button"
          onClick={() => supportingFilesRef.current?.click()}
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            padding: "18px",
            borderRadius: "var(--r-l)",
            border: `1.5px dashed ${supportingFiles.length ? "var(--brand)" : "var(--hair-2)"}`,
            background: supportingFiles.length ? "var(--tint-2)" : "var(--surface-subtle)",
            cursor: "pointer",
            marginBottom: 28,
          }}
        >
          <Upload size={18} color={supportingFiles.length ? "var(--brand-deep)" : "var(--ink-4)"} />
          <span style={{ fontSize: 12.5, fontWeight: 650, color: supportingFiles.length ? "var(--brand-deep)" : "var(--ink-3)" }}>
            {supportingFiles.length
              ? `${supportingFiles.length} file${supportingFiles.length > 1 ? "s" : ""} attached — click to add more`
              : "Any label, deck, or reference doc — we'll bring it into the dossier flow"}
          </span>
        </button>
        <input ref={supportingFilesRef} type="file" multiple onChange={handleSupportingFilesPicked} style={{ display: "none" }} />

        <button
          type="button"
          disabled={!productChosen}
          onClick={() => router.push("/dossiers/new/path")}
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
            background: !productChosen ? "var(--ink-4)" : "linear-gradient(180deg,#ff5b2d,var(--brand))",
            opacity: !productChosen ? 0.5 : 1,
            cursor: !productChosen ? "not-allowed" : "pointer",
            boxShadow: !productChosen ? "none" : "0 12px 24px -12px rgba(253,72,22,.6)",
          }}
        >
          Next
        </button>
      </DossierFlowShell>
    </AppShell>
  );
}

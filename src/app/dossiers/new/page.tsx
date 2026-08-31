"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Sparkles, ChevronDown } from "lucide-react";
import { AppShell } from "@/features/workspace/app-shell";
import { DossierFlowShell } from "@/features/dossiers/dossier-flow-shell";
import { useDossierDraftStore, applyProductSelection } from "@/features/dossiers/dossier-draft-store";
import { BRAND_REGISTRY } from "@/features/dossiers/mock-dossiers";
import { DOSSIER_CATEGORIES, TARGET_AUDIENCES, OTHER_PRODUCT_ID } from "@/features/dossiers/dossier-flow-pieces";
import { useAssistantChat, DossierAssistantPanel, isQuestion } from "@/features/dossiers/dossier-assistant-chat";
import { PERSONA } from "@/features/workspace/mock-personas";

export default function NewDossierProductPage() {
  const router = useRouter();
  const supportingFilesRef = useRef<HTMLInputElement>(null);

  const productId = useDossierDraftStore((s) => s.productId);
  const brandName = useDossierDraftStore((s) => s.brandName);
  const genericName = useDossierDraftStore((s) => s.genericName);
  const category = useDossierDraftStore((s) => s.category);
  const audiences = useDossierDraftStore((s) => s.audiences);
  const supportingFiles = useDossierDraftStore((s) => s.supportingFiles);
  const createdDossiers = useDossierDraftStore((s) => s.createdDossiers);
  const setOtherBrandName = useDossierDraftStore((s) => s.setOtherBrandName);
  const setOtherGenericName = useDossierDraftStore((s) => s.setOtherGenericName);
  const setCategory = useDossierDraftStore((s) => s.setCategory);
  const toggleAudience = useDossierDraftStore((s) => s.toggleAudience);
  const addSupportingFiles = useDossierDraftStore((s) => s.addSupportingFiles);

  // First time this session that this user has landed on the creation
  // flow — a lightweight, demo-appropriate proxy for "first-time,
  // post-login" since there's no backend to check real account history.
  const isFirstTime = createdDossiers.length === 0;

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

  function respond(text: string): string {
    const lower = text.toLowerCase();

    if (isQuestion(text)) {
      return "This step sets up the dossier's identity: which product it's for, its category (Patient/HCP/Payer/Commercial related), and who reads it. Tell me those three things, or fill them in below — either way I'll keep them in sync.";
    }

    const notes: string[] = [];

    const brandMatch = BRAND_REGISTRY.find((b) => lower.includes(b.name.toLowerCase()));
    if (brandMatch) {
      handleProductChange(brandMatch.id);
      notes.push(`the product to ${brandMatch.name}`);
    }

    const categoryMatch = DOSSIER_CATEGORIES.find((c) => lower.includes(c.toLowerCase()));
    if (categoryMatch) {
      setCategory(categoryMatch);
      notes.push(`the category to "${categoryMatch}"`);
    }

    const audienceMatches = TARGET_AUDIENCES.filter((a) => lower.includes(a.toLowerCase()) && !audiences.includes(a));
    if (audienceMatches.length) {
      audienceMatches.forEach((a) => toggleAudience(a));
      notes.push(`the audience to ${audienceMatches.join(", ")}`);
    }

    if (/(next|continue|go|proceed)/.test(lower) && (productChosen || brandMatch)) {
      setTimeout(() => router.push("/dossiers/new/path"), 700);
      return notes.length
        ? `Done — set ${notes.join(" and ")}. Moving to the next step now.`
        : "Moving to the next step now.";
    }

    if (notes.length) return `Done — set ${notes.join(" and ")}. Say "next" whenever you're ready to continue.`;
    return 'Tell me the product, dossier category, or audience — e.g. "Renalis, patient related, for HCP and payer" — and I\'ll set it for you. You can also just fill in the fields directly.';
  }

  const { messages, thinking, send } = useAssistantChat(
    isFirstTime
      ? `Welcome, ${PERSONA.firstName} — tell me the product and I'll set up the rest, or use the fields below.`
      : "Tell me the product, category, or audience and I'll fill this step in for you.",
    respond
  );

  return (
    <AppShell pageTitle="New Brand Dossier">
      <DossierFlowShell
        step={1}
        stepLabel="Product"
        backHref="/dossiers"
        chat={
          <DossierAssistantPanel
            messages={messages}
            thinking={thinking}
            onSend={send}
            onAttachFile={(file) => addSupportingFiles([file])}
            placeholder='e.g. "Renalis, patient related, for HCP"'
            subtitle="Set up this step by prompt"
            quickReplies={productChosen ? ["Next", "What does this step do?"] : ["What does this step do?"]}
          />
        }
      >
        {isFirstTime && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: "var(--r)",
              background: "var(--tint-2)",
              border: "1px solid var(--tint-line)",
              marginBottom: 18,
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>👋</span>
            <span style={{ fontSize: 13, fontWeight: 650, color: "var(--brand-deep)" }}>
              Welcome, {PERSONA.firstName} — let&rsquo;s build your first brand dossier.
            </span>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ width: 36, height: 36, borderRadius: 11, display: "grid", placeItems: "center", background: "var(--tint)", color: "var(--brand-deep)" }}>
            <Sparkles size={17} />
          </span>
          <h1 style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-.3px", margin: 0, color: "var(--ink)" }}>New brand dossier</h1>
        </div>
        <p style={{ fontSize: 13.5, color: "var(--ink-3)", margin: "6px 0 22px" }}>
          {isFirstTime
            ? "This becomes the single source of truth every studio reads from — let's set it up together."
            : "Which product is this for?"}
        </p>

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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink-2)", marginBottom: 6 }}>Brand name</label>
              <input
                value={brandName}
                onChange={(e) => setOtherBrandName(e.target.value)}
                placeholder="e.g. Velmora"
                style={{ width: "100%", padding: "11px 13px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", fontSize: 14, color: "var(--ink)" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink-2)", marginBottom: 6 }}>Generic / molecule name</label>
              <input
                value={genericName}
                onChange={(e) => setOtherGenericName(e.target.value)}
                placeholder="e.g. velmoxaban mesylate"
                style={{ width: "100%", padding: "11px 13px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", fontSize: 14, color: "var(--ink)" }}
              />
            </div>
          </div>
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

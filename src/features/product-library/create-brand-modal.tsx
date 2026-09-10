"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X, Check, ArrowRight, Upload, Link2, PenLine, FileText, ImagePlus, Layers } from "lucide-react";
import { cn } from "@/lib/cn";
import { ProductArtwork } from "@/features/product-library/product-artwork";
import { useProductLibraryStore } from "@/features/product-library/product-library-store";
import type { LibraryProduct, ProductType } from "@/features/product-library/product-library-types";

const TYPE_OPTIONS: { id: ProductType; hint: string }[] = [
  { id: "Tablet", hint: "Blister-packed oral dose" },
  { id: "Capsule", hint: "Two-tone oral dose" },
  { id: "Syrup", hint: "Liquid oral dose" },
  { id: "Injection", hint: "Vial or pre-filled syringe" },
  { id: "Device", hint: "Pen, inhaler, or applicator" },
];

const GRADIENT_THEMES = [
  { id: "indigo", gradient: "linear-gradient(150deg,#4338ca,#6d5ef5 55%,#9b8cff)" },
  { id: "amber", gradient: "linear-gradient(150deg,#c2620a,#e08a2b 55%,#f3ad55)" },
  { id: "navy", gradient: "linear-gradient(150deg,#1b2a4a,#2f4a7d 55%,#5b7fb8)" },
  { id: "violet", gradient: "linear-gradient(150deg,#3a1e4d,#63307a 55%,#a06bc4)" },
  { id: "teal", gradient: "linear-gradient(150deg,#12332c,#1d5a4a 55%,#3f9c7f)" },
  { id: "rust", gradient: "linear-gradient(150deg,#7a1f06,#b82f0c 55%,#ff8a4c)" },
];

const MARKETS = ["India", "US", "UK", "EU", "Japan"];

const SUGGESTED_TAGS = ["Prescribing Information", "Approved Brand Deck", "Clinical Study PDFs", "Market Research", "Competitor Claims", "MLR-Approved Copy"];

function slugify(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "brand";
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Section heading used throughout the one-page layout below — every part
 *  of the brief is visible at once, not gated behind a step. */
function SectionHeading({ eyebrow, title, hint }: { eyebrow: string; title: string; hint?: string }) {
  return (
    <div className="space-y-1">
      <span className="text-label font-extrabold uppercase tracking-[.08em] text-brand-deep">{eyebrow}</span>
      <h3 className="text-title font-extrabold tracking-tight text-ink">{title}</h3>
      {hint && <p className="text-body text-ink-3">{hint}</p>}
    </div>
  );
}

export function CreateBrandModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  /** When another flow (e.g. the Brand Dossier wizard's "Add a new brand")
   *  embeds this modal, it wants the new brand handed back so it can select
   *  it and carry on — not a navigation away to the brand's own page. */
  onCreated?: (product: LibraryProduct) => void;
}) {
  const router = useRouter();
  const addProduct = useProductLibraryStore((s) => s.addProduct);
  const products = useProductLibraryStore((s) => s.products);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Portalled to document.body below: an ancestor further up the tree has an
  // active transform/animation, which turns `position: fixed` here into
  // something positioned relative to that ancestor instead of the viewport.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate: portal target (document.body) only exists once mounted on the client.
    setMounted(true);
  }, []);

  const [name, setName] = useState("");
  const [genericName, setGenericName] = useState("");
  const [type, setType] = useState<ProductType>("Tablet");
  const [themeId, setThemeId] = useState(GRADIENT_THEMES[0].id);
  const [referenceImageFile, setReferenceImageFile] = useState<File | null>(null);

  const [market, setMarket] = useState(MARKETS[0]);
  const [tags, setTags] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [sourceMode, setSourceMode] = useState<"none" | "link" | "text">("none");
  const [link, setLink] = useState("");
  const [notes, setNotes] = useState("");

  const gradient = GRADIENT_THEMES.find((g) => g.id === themeId)?.gradient ?? GRADIENT_THEMES[0].gradient;
  const idPreview = useMemo(() => slugify(name), [name]);
  const canCreate = name.trim().length > 1 && genericName.trim().length > 1;
  const sourcesCount = files.length + (link.trim() ? 1 : 0) + (notes.trim() ? 1 : 0) + tags.length;
  // Not revoked on change/unmount: once a brand is created, this exact URL
  // is what the library card and Front-angle photo point at — revoking it
  // would blank out the image the moment the modal closes.
  const referenceImageUrl = useMemo(() => (referenceImageFile ? URL.createObjectURL(referenceImageFile) : null), [referenceImageFile]);

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length) setFiles((prev) => [...prev, ...picked]);
    e.target.value = "";
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (picked) setReferenceImageFile(picked);
    e.target.value = "";
  }

  function reset() {
    setName("");
    setGenericName("");
    setType("Tablet");
    setThemeId(GRADIENT_THEMES[0].id);
    setReferenceImageFile(null);
    setMarket(MARKETS[0]);
    setTags([]);
    setFiles([]);
    setSourceMode("none");
    setLink("");
    setNotes("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleCreate() {
    if (!canCreate) return;
    const takenIds = new Set(products.map((p) => p.id));
    const id = takenIds.has(idPreview) ? `${idPreview}-${Date.now().toString().slice(-4)}` : idPreview;
    const product: LibraryProduct = {
      id,
      name: name.trim(),
      genericName: genericName.trim(),
      type,
      gradient,
      dossiersVerified: 0,
      dossiersTotal: 6,
      claimsApproved: 0,
      views: 0,
      updated: "Just now",
      referenceImageUrl: referenceImageUrl ?? undefined,
    };
    addProduct(product);
    if (onCreated) {
      onCreated(product);
      reset();
    } else {
      handleClose();
      router.push(`/product-library/${id}`);
    }
  }

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm animate-in fade-in duration-200 sm:p-6"
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, width: "100vw", height: "100vh" }}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex h-[92vh] w-full max-w-[1180px] flex-col overflow-hidden rounded-card border border-hair bg-card shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient glow wash, matching the premium background language used elsewhere in the app */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="absolute rounded-full" style={{ width: 460, height: 460, left: "-8%", top: "-14%", background: "radial-gradient(circle,rgba(255,122,61,.1),transparent 70%)" }} />
          <span className="absolute rounded-full" style={{ width: 420, height: 420, right: "18%", bottom: "-16%", background: "radial-gradient(circle,rgba(61,107,255,.07),transparent 70%)" }} />
        </div>

        {/* Header */}
        <div className="relative flex shrink-0 items-center justify-between border-b border-hair px-7 py-5">
          <div>
            <span className="block text-display font-extrabold tracking-tight text-ink">Create a new brand</span>
            <span className="text-body-lg text-ink-3">Everything in one place — fill in what you know, skip the rest.</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="grid size-9 shrink-0 place-items-center rounded-control text-ink-3 transition-colors hover:bg-subtle hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body: form (scrollable) + live preview rail (sticky) */}
        <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
          <div className="min-h-0 flex-1 space-y-10 overflow-y-auto px-7 py-8">
            {/* Identity */}
            <div className="space-y-4">
              <SectionHeading eyebrow="01 · Identity" title="Name the brand" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-label font-bold text-ink-2">Brand name</label>
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Velmora"
                    className="w-full rounded-control border border-hair-2 bg-card px-3.5 py-2.5 text-body-lg text-ink outline-none transition-colors focus:border-brand"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-label font-bold text-ink-2">Generic / molecule name</label>
                  <input
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    placeholder="e.g. Velmoxaban mesylate"
                    className="w-full rounded-control border border-hair-2 bg-card px-3.5 py-2.5 text-body-lg text-ink outline-none transition-colors focus:border-brand"
                  />
                </div>
              </div>
            </div>

            {/* Presentation + reference image */}
            <div className="space-y-4">
              <SectionHeading eyebrow="02 · Presentation" title="What does it look like?" />
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_260px]">
                <div className="grid grid-cols-5 gap-2.5">
                  {TYPE_OPTIONS.map((opt) => {
                    const isSel = type === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setType(opt.id)}
                        title={opt.hint}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-panel border p-3 text-center transition-all",
                          isSel ? "border-brand bg-tint shadow-brand-soft" : "border-hair bg-card hover:border-hair-3"
                        )}
                      >
                        <div className="size-10" style={{ filter: isSel ? undefined : "grayscale(.4) opacity(.75)" }}>
                          <ProductArtwork kind={opt.id} className="h-full w-full" />
                        </div>
                        <span className={cn("text-caption font-bold", isSel ? "text-brand-deep" : "text-ink-3")}>{opt.id}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Reference image upload */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-label font-bold text-ink-2">Reference image</span>
                    <span className="rounded-chip bg-subtle px-1.5 py-0.5 text-micro font-extrabold uppercase tracking-[.03em] text-ink-4">Optional</span>
                  </div>
                  <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelected} />
                  {referenceImageUrl ? (
                    <div className="relative overflow-hidden rounded-panel border border-hair" style={{ height: 96 }}>
                      <img src={referenceImageUrl} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setReferenceImageFile(null)}
                        className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                        style={{ background: "rgba(0,0,0,.4)" }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="flex w-full flex-col items-center justify-center gap-1 rounded-panel border border-dashed border-hair-2 text-ink-4 transition-colors hover:border-brand hover:bg-tint-2 hover:text-brand-deep"
                      style={{ height: 96 }}
                    >
                      <ImagePlus size={16} />
                      <span className="text-caption font-bold">Upload a photo</span>
                    </button>
                  )}
                  <p className="text-micro leading-snug text-ink-4">Real product photography replaces the generated art on this brand&rsquo;s card.</p>
                </div>
              </div>
            </div>

            {/* Color theme */}
            <div className="space-y-3">
              <SectionHeading eyebrow="03 · Color theme" title="Pick an accent" />
              <div className="flex gap-2.5">
                {GRADIENT_THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setThemeId(t.id)}
                    className={cn(
                      "size-9 shrink-0 rounded-full transition-transform hover:scale-110",
                      themeId === t.id && "ring-2 ring-brand ring-offset-2 ring-offset-card"
                    )}
                    style={{ background: t.gradient }}
                    aria-label={`${t.id} theme`}
                  />
                ))}
              </div>
            </div>

            {/* Market */}
            <div className="space-y-3">
              <SectionHeading eyebrow="04 · Market" title="Where is this sold?" hint="Every claim is checked against this market's label and guidance." />
              <div className="flex flex-wrap gap-1.5">
                {MARKETS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMarket(m)}
                    className={cn(
                      "rounded-chip px-3.5 py-1.5 text-body font-bold transition-colors",
                      market === m ? "bg-ink text-white" : "bg-subtle text-ink-3 hover:bg-tint-2"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Sources */}
            <div className="space-y-3 pb-2">
              <div className="flex items-center gap-2">
                <SectionHeading eyebrow="05 · Sources" title="Add anything you already have" />
                <span className="rounded-chip bg-subtle px-2 py-0.5 text-micro font-extrabold uppercase tracking-[.03em] text-ink-4">Optional</span>
              </div>
              <p className="text-body text-ink-3">
                I already write from trusted public sources, so you can skip this — but files, links, or a few typed lines make the brand far more yours.
              </p>

              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_TAGS.map((tag) => {
                  const sel = tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        "rounded-chip border px-2.5 py-1 text-caption font-bold transition-colors",
                        sel ? "border-brand bg-tint text-brand-deep" : "border-hair-2 bg-card text-ink-3 hover:border-hair-3"
                      )}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFilesSelected} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-1.5 rounded-panel border border-dashed border-tint-line bg-tint-2 py-6 text-center transition-colors hover:border-brand hover:bg-tint"
              >
                <span
                  className="grid size-9 place-items-center rounded-full text-white"
                  style={{ background: "linear-gradient(155deg,#ff8a52,var(--brand))", boxShadow: "0 8px 16px -8px rgba(253,72,22,.5)" }}
                >
                  <Upload size={16} />
                </span>
                <span className="text-body-lg font-bold text-ink">Drop files here, or browse</span>
                <span className="text-caption text-ink-4">PDF, PPT, DOC, XLS, images — as many as you like.</span>
              </button>

              {files.length > 0 && (
                <div className="space-y-1.5">
                  {files.map((f, i) => (
                    <div key={`${f.name}-${i}`} className="flex items-center gap-2.5 rounded-control border border-ok-line bg-ok-bg px-3 py-2">
                      <Check size={13} className="shrink-0 text-ok" />
                      <span className="min-w-0 flex-1 truncate text-body font-semibold text-ink">{f.name}</span>
                      <span className="shrink-0 text-caption text-ink-4">{formatBytes(f.size)}</span>
                      <button type="button" onClick={() => removeFile(i)} className="shrink-0 text-ink-4 transition-colors hover:text-danger">
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSourceMode(sourceMode === "link" ? "none" : "link")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-control border px-3 py-1.5 text-body font-bold transition-colors",
                    sourceMode === "link" ? "border-brand bg-tint text-brand-deep" : "border-hair-2 bg-card text-ink-3 hover:border-hair-3"
                  )}
                >
                  <Link2 size={13} /> Paste a link instead
                </button>
                <button
                  type="button"
                  onClick={() => setSourceMode(sourceMode === "text" ? "none" : "text")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-control border px-3 py-1.5 text-body font-bold transition-colors",
                    sourceMode === "text" ? "border-brand bg-tint text-brand-deep" : "border-hair-2 bg-card text-ink-3 hover:border-hair-3"
                  )}
                >
                  <PenLine size={13} /> Type it out
                </button>
              </div>

              {sourceMode === "link" && (
                <div className="flex items-center gap-2 rounded-control border border-hair-2 bg-card px-3 py-2 focus-within:border-brand">
                  <Link2 size={14} className="shrink-0 text-ink-4" />
                  <input
                    autoFocus
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://…"
                    className="w-full border-none bg-transparent text-body-lg text-ink outline-none placeholder:text-ink-4"
                  />
                </div>
              )}

              {sourceMode === "text" && (
                <div
                  className="relative overflow-hidden rounded-panel border border-tint-line"
                  style={{ background: "linear-gradient(160deg,var(--tint) 0%,#fff 55%,var(--tint-2) 100%)" }}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-6 -top-10 h-32 w-32 rounded-full"
                    style={{ background: "radial-gradient(circle,rgba(253,72,22,.16),transparent 70%)" }}
                  />
                  <div className="relative flex items-center gap-2 border-b border-tint-line/70 px-3.5 py-2.5">
                    <span
                      className="grid size-6 shrink-0 place-items-center rounded-control text-white"
                      style={{ background: "linear-gradient(155deg,#ff8a52,var(--brand))" }}
                    >
                      <FileText size={12} />
                    </span>
                    <span className="text-label font-bold text-ink-2">Notes for this brand</span>
                  </div>
                  <textarea
                    autoFocus
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="e.g. Positioned as the once-daily alternative to twice-daily dosing. Key competitor is already in market with a stronger safety claim…"
                    className="relative w-full resize-none bg-transparent px-3.5 py-3 text-body-lg leading-relaxed text-ink outline-none placeholder:text-ink-4"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Live preview rail — always visible, updates as the form is filled in */}
          <div className="relative flex w-full shrink-0 flex-col border-t border-hair bg-subtle/60 px-7 py-7 lg:w-[360px] lg:border-l lg:border-t-0">
            <span className="mb-4 inline-flex items-center gap-1.5 text-label font-extrabold uppercase tracking-[.08em] text-ink-4">
              <Layers size={12} /> Live preview
            </span>

            <div className="overflow-hidden rounded-card border border-hair bg-card shadow-soft">
              <div className="relative overflow-hidden" style={{ background: gradient, height: 150 }}>
                <span
                  aria-hidden
                  className="pointer-events-none absolute rounded-full"
                  style={{ width: "70%", height: "70%", right: "-15%", top: "-15%", background: "radial-gradient(circle,rgba(255,255,255,.28),transparent 70%)" }}
                />
                <span
                  className="absolute left-3 top-2.5 rounded-chip px-2 py-0.5 text-micro font-extrabold uppercase tracking-[.04em] text-white/90"
                  style={{ background: "rgba(0,0,0,.22)" }}
                >
                  {type}
                </span>
                <div className="absolute -bottom-3 right-[-6%] h-[85%] w-3/5">
                  {referenceImageUrl ? (
                    <img src={referenceImageUrl} alt="" className="h-full w-full object-contain drop-shadow-lg" />
                  ) : (
                    <ProductArtwork kind={type} className="h-full w-full" />
                  )}
                </div>
                <span
                  className="absolute bottom-2.5 left-3 grid size-9 place-items-center rounded-control text-body font-extrabold text-white"
                  style={{ background: "rgba(0,0,0,.24)" }}
                >
                  {(name || "??").slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="p-3.5">
                <b className="block truncate text-body-lg font-extrabold text-ink">{name || "Untitled brand"}</b>
                <span className="block truncate text-caption italic text-ink-3">{genericName || "Generic name"}</span>
                <span className="mt-2 block text-caption text-ink-4">0 dossiers · 0 claims · 0 views</span>
              </div>
            </div>

            <div className="mt-5 space-y-2.5 text-body text-ink-3">
              <div className="flex items-center justify-between">
                <span className="text-ink-4">Market</span>
                <span className="font-bold text-ink">{market}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-4">Sources</span>
                <span className="font-bold text-ink">{sourcesCount > 0 ? `${sourcesCount} attached` : "None — public data only"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-4">Photography</span>
                <span className="font-bold text-ink">{referenceImageUrl ? "Your upload" : "Generated placeholder"}</span>
              </div>
            </div>

            <p className="mt-5 text-caption leading-relaxed text-ink-4">
              Starts with all 6 dossier types ready to fill in — nothing here is final, every field stays editable from the brand&rsquo;s own page.
            </p>

            <div className="flex-1" />

            <button
              type="button"
              disabled={!canCreate}
              onClick={handleCreate}
              className="mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-control px-4 py-3 text-body-lg font-bold text-white transition-all enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: "linear-gradient(180deg,#ff5b2d,var(--brand))", boxShadow: "0 14px 28px -14px rgba(253,72,22,.9)" }}
            >
              Create brand <ArrowRight size={15} />
            </button>
            {!canCreate && <span className="mt-2 text-center text-caption text-ink-4">Name and generic name are needed to continue.</span>}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Check, ArrowLeft, ArrowRight } from "lucide-react";
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

function slugify(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "brand";
}

type Step = "basics" | "review";

export function CreateBrandModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const addProduct = useProductLibraryStore((s) => s.addProduct);
  const products = useProductLibraryStore((s) => s.products);

  const [step, setStep] = useState<Step>("basics");
  const [name, setName] = useState("");
  const [genericName, setGenericName] = useState("");
  const [type, setType] = useState<ProductType>("Tablet");
  const [themeId, setThemeId] = useState(GRADIENT_THEMES[0].id);

  const gradient = GRADIENT_THEMES.find((g) => g.id === themeId)?.gradient ?? GRADIENT_THEMES[0].gradient;
  const idPreview = useMemo(() => slugify(name), [name]);
  const canContinue = name.trim().length > 1 && genericName.trim().length > 1;

  function reset() {
    setStep("basics");
    setName("");
    setGenericName("");
    setType("Tablet");
    setThemeId(GRADIENT_THEMES[0].id);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleCreate() {
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
    };
    addProduct(product);
    handleClose();
    router.push(`/product-library/${id}`);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[580px] overflow-hidden rounded-card border border-hair bg-card shadow-float" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hair px-5 py-4">
          <div>
            <span className="block text-title font-extrabold tracking-tight text-ink">Create brand</span>
            <span className="text-body text-ink-3">{step === "basics" ? "Tell us what this brand is." : "Confirm before it's added to your library."}</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="grid size-8 shrink-0 place-items-center rounded-control text-ink-3 transition-colors hover:bg-subtle hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-2.5 px-5 pt-4">
          {(["basics", "review"] as const).map((s, i) => {
            const done = s === "basics" && step === "review";
            const current = s === step;
            return (
              <div key={s} className="flex flex-1 items-center gap-2.5">
                <div
                  className={cn(
                    "grid size-5.5 shrink-0 place-items-center rounded-full text-micro font-extrabold transition-colors",
                    done ? "bg-ok-bg text-ok" : current ? "bg-brand text-white" : "bg-subtle text-ink-4"
                  )}
                >
                  {done ? <Check size={11} /> : i + 1}
                </div>
                <span className={cn("text-body font-bold", current ? "text-ink" : "text-ink-4")}>{s === "basics" ? "Basics" : "Review"}</span>
                {i === 0 && <span className="h-px flex-1 bg-hair" />}
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className="space-y-5 px-5 py-5">
          {step === "basics" ? (
            <>
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

              <div className="space-y-2">
                <label className="text-label font-bold text-ink-2">Presentation</label>
                <div className="grid grid-cols-5 gap-2">
                  {TYPE_OPTIONS.map((opt) => {
                    const isSel = type === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setType(opt.id)}
                        title={opt.hint}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-panel border p-2.5 text-center transition-all",
                          isSel ? "border-brand bg-tint shadow-brand-soft" : "border-hair bg-card hover:border-hair-3"
                        )}
                      >
                        <div className="size-8" style={{ filter: isSel ? undefined : "grayscale(.4) opacity(.75)" }}>
                          <ProductArtwork kind={opt.id} className="h-full w-full" />
                        </div>
                        <span className={cn("text-caption font-bold", isSel ? "text-brand-deep" : "text-ink-3")}>{opt.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-label font-bold text-ink-2">Color theme</label>
                <div className="flex gap-2">
                  {GRADIENT_THEMES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setThemeId(t.id)}
                      className={cn(
                        "size-8 shrink-0 rounded-full transition-transform hover:scale-110",
                        themeId === t.id && "ring-2 ring-brand ring-offset-2 ring-offset-card"
                      )}
                      style={{ background: t.gradient }}
                      aria-label={`${t.id} theme`}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Live preview — exactly what will land in the grid */}
              <div className="mx-auto max-w-[240px] overflow-hidden rounded-card border border-hair bg-card shadow-soft">
                <div className="relative overflow-hidden" style={{ background: gradient, height: 120 }}>
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
                    <ProductArtwork kind={type} className="h-full w-full" />
                  </div>
                  <span
                    className="absolute bottom-2.5 left-3 grid size-8 place-items-center rounded-control text-body font-extrabold text-white"
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

              <p className="text-center text-body text-ink-3">
                Starts with all 6 dossier types ready to fill in, a placeholder photography set for every angle, and no approved claims yet — replace or add to any of it from the brand&rsquo;s own page.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-hair px-5 py-4">
          {step === "basics" ? (
            <span className="text-caption text-ink-4">{name ? `/product-library/${idPreview}` : " "}</span>
          ) : (
            <button
              type="button"
              onClick={() => setStep("basics")}
              className="inline-flex items-center gap-1.5 text-body-lg font-bold text-ink-3 transition-colors hover:text-ink"
            >
              <ArrowLeft size={14} /> Back
            </button>
          )}

          {step === "basics" ? (
            <button
              type="button"
              disabled={!canContinue}
              onClick={() => setStep("review")}
              className="inline-flex items-center gap-1.5 rounded-control px-4 py-2 text-body-lg font-bold text-white transition-all enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: "linear-gradient(180deg,#ff5b2d,var(--brand))", boxShadow: "0 12px 26px -14px rgba(253,72,22,.9)" }}
            >
              Continue <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex items-center gap-1.5 rounded-control px-4 py-2 text-body-lg font-bold text-white transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(180deg,#ff5b2d,var(--brand))", boxShadow: "0 12px 26px -14px rgba(253,72,22,.9)" }}
            >
              Create brand <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

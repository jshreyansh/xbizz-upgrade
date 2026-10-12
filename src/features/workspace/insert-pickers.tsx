"use client";

import { useEffect, useState, type ReactNode } from "react";
import QRCode from "qrcode";
import { Check, QrCode, Search, Shapes, X, type LucideIcon } from "lucide-react";
import { Portal } from "@/components/ui/portal";
import { Button, IconButton } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { ProductArtwork } from "@/features/product-library/product-artwork";
import { buildProductDetail } from "@/features/product-library/mock-product-detail";
import type { LibraryProduct } from "@/features/product-library/product-library-types";
import { LIBRARY_ASSETS } from "@/features/content-library/content-library-data";
import { workspaceAssets } from "@/features/workspace/workspace-assets";

/**
 * The pickers behind the editor's Insert › Image menu.
 *
 * The brand's images and the workspace's media are the same pop-up: a grid,
 * each image captioned with where it came from — a drug or a project, by
 * name and ID — because on approved material, where an image came from is
 * what says whether it may be used. Icons and QR codes have their own
 * contents but the same frame, and every one of them ends in "Use this".
 */

/* ───────────────────────────────── the frame ───────────────────────────────── */

function PickerShell({
  icon: Icon,
  title,
  sub,
  search,
  onSearch,
  searchLabel,
  footer,
  onClose,
  wide = true,
  children,
}: {
  icon: LucideIcon;
  title: string;
  sub: string;
  search?: string;
  onSearch?: (value: string) => void;
  searchLabel?: string;
  footer: ReactNode;
  onClose: () => void;
  wide?: boolean;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <Portal>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={onClose}
        className="fixed inset-0 z-[9999] grid place-items-center bg-ink/75 p-4 backdrop-blur-sm sm:p-6"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "flex max-h-full w-full flex-col overflow-hidden rounded-card border border-hair bg-card shadow-modal",
            wide ? "h-[min(720px,88vh)] max-w-[880px]" : "max-w-[520px]"
          )}
        >
          <div className="flex items-start gap-3 border-b border-hair px-5 py-3.5">
            <Icon className="mt-0.5 size-4 shrink-0 text-brand" />
            <div className="min-w-0 flex-1">
              <p className="text-body-lg font-[850] text-ink">{title}</p>
              <p className="text-label text-ink-3">{sub}</p>
            </div>
            <IconButton aria-label="Close" onClick={onClose}>
              <X className="size-4" />
            </IconButton>
          </div>
          {onSearch && (
            <div className="border-b border-hair px-5 py-3">
              <Field
                size="sm"
                aria-label={searchLabel}
                placeholder={searchLabel}
                iconLeft={<Search className="size-4" />}
                value={search}
                autoFocus
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
          <div className="flex items-center justify-between gap-3 border-t border-hair px-5 py-3">{footer}</div>
        </div>
      </div>
    </Portal>
  );
}

/* ───────────────────────────────── images ───────────────────────────────── */

export interface MediaItem {
  id: string;
  name: string;
  /** Fills the tile. */
  visual: ReactNode;
  /** A variation and angle, or what it was used for. */
  note?: string;
  source: { kind: "Drug" | "Project"; name: string; id: string };
}

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Every image attached to one drug, across its variations, archived ones left out. */
export function brandImageItems(product: LibraryProduct): MediaItem[] {
  return buildProductDetail(product).variations.flatMap((variation) =>
    variation.images
      .filter((img) => !img.archived)
      .map((img) => ({
        id: `${product.id}-${img.id}`,
        name: img.label,
        note: [variation.label, img.angle].filter(Boolean).join(" · "),
        source: { kind: "Drug" as const, name: product.name, id: product.id },
        visual: (
          <div className="absolute inset-0 p-3" style={{ background: img.gradient }}>
            <ProductArtwork
              kind={img.angle === "Lifestyle" ? "Lifestyle" : product.type}
              photoUrl={img.imageUrl}
              className="h-full w-full"
            />
          </div>
        ),
      }))
  );
}

/** Images used anywhere in the workspace: other drugs' artwork, and project media. */
export function workspaceMediaItems(products: LibraryProduct[], brandName: string): MediaItem[] {
  const drugs = products.flatMap((p) => brandImageItems(p).slice(0, 2));
  const projectFiles = [...workspaceAssets(brandName, "product"), ...workspaceAssets(brandName, "reference")]
    .filter((a) => a.kind === "image" && a.previewUrl)
    .map((a) => ({
      id: `wa-${a.id}`,
      name: a.name,
      note: a.note,
      source: { kind: "Project" as const, name: a.origin, id: slug(a.origin) },
      visual: (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={a.previewUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ),
    }));
  const projectArt = LIBRARY_ASSETS.filter((a) => a.kind === "infographic").map((a) => ({
    id: `la-${a.id}`,
    name: a.title,
    note: a.spec,
    source: { kind: "Project" as const, name: a.title, id: a.id },
    visual: (
      <div className="absolute inset-0 flex flex-col justify-end p-3" style={{ background: a.gradient }}>
        <span className="text-micro font-extrabold uppercase tracking-wider text-white/60">{a.badge}</span>
        <span className="text-body font-black leading-tight text-white">{a.metric}</span>
      </div>
    ),
  }));
  return [...projectFiles, ...projectArt, ...drugs];
}

export function MediaPickerModal({
  title,
  sub,
  icon,
  items,
  empty,
  onUse,
  onClose,
}: {
  title: string;
  sub: string;
  icon: LucideIcon;
  items: MediaItem[];
  /** Said when there is nothing to show at all. */
  empty?: string;
  onUse: (item: MediaItem) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const q = query.trim().toLowerCase();
  const shown = q
    ? items.filter((i) => [i.name, i.note, i.source.name, i.source.id].some((t) => t?.toLowerCase().includes(q)))
    : items;
  const chosen = items.find((i) => i.id === picked);

  return (
    <PickerShell
      icon={icon}
      title={title}
      sub={sub}
      search={query}
      onSearch={setQuery}
      searchLabel="Search by name, drug or project"
      onClose={onClose}
      footer={
        <>
          <span className="truncate text-label text-ink-3">
            {chosen ? chosen.name : `${shown.length} ${shown.length === 1 ? "image" : "images"}`}
          </span>
          <Button size="sm" disabled={!chosen} onClick={() => chosen && onUse(chosen)} className="shrink-0">
            Use this image
          </Button>
        </>
      }
    >
      {shown.length === 0 ? (
        <p className="py-12 text-center text-body text-ink-3">
          {items.length === 0 && empty ? empty : <>Nothing matches &ldquo;{query}&rdquo;.</>}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((item) => {
            const on = picked === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={on}
                onClick={() => setPicked(on ? null : item.id)}
                onDoubleClick={() => onUse(item)}
                className={cn(
                  "focus-ring group flex cursor-pointer flex-col overflow-hidden rounded-panel border bg-card text-left transition",
                  on ? "border-brand ring-2 ring-brand/25" : "border-hair hover:border-hair-3"
                )}
              >
                <span className="relative block h-32 overflow-hidden bg-subtle">
                  {item.visual}
                  {on && (
                    <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-brand text-white shadow-soft">
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                  )}
                </span>
                <span className="grid gap-1 px-2.5 py-2">
                  <span className="truncate text-label font-bold text-ink">{item.name}</span>
                  {item.note && <span className="truncate text-caption text-ink-3">{item.note}</span>}
                  {/* Where it came from: a drug or a project, by name and ID. */}
                  <span className="flex min-w-0 items-center gap-1.5 text-caption text-ink-3">
                    <span
                      className={cn(
                        "shrink-0 rounded-glyph px-1.5 py-px text-micro font-extrabold uppercase tracking-wide",
                        item.source.kind === "Drug" ? "bg-tint text-brand-deep" : "bg-subtle text-ink-2"
                      )}
                    >
                      {item.source.kind}
                    </span>
                    <span className="truncate">
                      {item.source.name} · <span className="font-mono">{item.source.id}</span>
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </PickerShell>
  );
}

/* ───────────────────────────────── icons ───────────────────────────────── */

/* Material Symbols, from Google Fonts, as stand-ins until the brand has its
   own icon set. Chosen for medical documents. */
const ICONS = [
  "medication", "pill", "vaccines", "syringe", "medication_liquid", "prescriptions", "local_pharmacy",
  "science", "biotech", "genetics", "labs", "experiment", "microbiology",
  "monitor_heart", "cardiology", "ecg_heart", "pulmonology", "dermatology", "neurology", "ophthalmology",
  "gastroenterology", "nephrology", "oncology", "orthopedics", "body_system", "bloodtype", "water_drop",
  "thermometer", "stethoscope", "local_hospital", "emergency", "medical_services", "clinical_notes",
  "health_and_safety", "health_metrics", "healing", "allergy", "coronavirus", "sanitizer", "psychology",
  "accessibility", "elderly", "pregnant_woman", "child_care", "groups", "person", "patient_list",
  "favorite", "verified", "check_circle", "warning", "info", "help", "shield", "lock",
  "schedule", "calendar_month", "hourglass_empty", "update", "autorenew", "timeline",
  "trending_up", "trending_down", "bar_chart", "pie_chart", "show_chart", "insights", "analytics", "percent",
  "monitor_weight", "scale", "straighten", "fitness_center", "directions_walk", "bedtime", "restaurant",
  "nutrition", "spa", "eco", "light_mode", "visibility", "hearing", "mood", "sentiment_satisfied",
  "compare_arrows", "swap_horiz", "add_circle", "description", "menu_book", "quiz", "call", "mail",
  "language", "qr_code", "location_on", "star", "bolt",
];

const iconLabel = (name: string) => name.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

const SYMBOLS_CSS =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=block";

/** Loads the icon font once, the first time the picker opens. */
function useSymbolsFont() {
  useEffect(() => {
    if (document.querySelector(`link[data-symbols]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = SYMBOLS_CSS;
    link.dataset.symbols = "";
    document.head.appendChild(link);
  }, []);
}

/** One Material Symbol, by name. */
export function MaterialSymbol({ name, size = 24, className }: { name: string; size?: number; className?: string }) {
  return (
    <span aria-hidden style={{ fontSize: size }} className={cn("material-symbols-rounded select-none leading-none", className)}>
      {name}
    </span>
  );
}

export function IconPickerModal({ onUse, onClose }: { onUse: (name: string, label: string) => void; onClose: () => void }) {
  useSymbolsFont();
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const q = query.trim().toLowerCase().replace(/\s+/g, "_");
  const shown = q ? ICONS.filter((n) => n.includes(q)) : ICONS;

  return (
    <PickerShell
      icon={Shapes}
      title="Icons"
      sub="Line icons, drawn in the brand colour. Material Symbols for now, until the brand's own set is added."
      search={query}
      onSearch={setQuery}
      searchLabel="Search icons, e.g. heart, pill, calendar"
      onClose={onClose}
      footer={
        <>
          <span className="truncate text-label text-ink-3">
            {picked ? iconLabel(picked) : `${shown.length} icons`}
          </span>
          <Button size="sm" disabled={!picked} onClick={() => picked && onUse(picked, iconLabel(picked))} className="shrink-0">
            Use this icon
          </Button>
        </>
      }
    >
      {shown.length === 0 ? (
        <p className="py-12 text-center text-body text-ink-3">No icon matches &ldquo;{query}&rdquo;.</p>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
          {shown.map((name) => {
            const on = picked === name;
            return (
              <button
                key={name}
                type="button"
                title={iconLabel(name)}
                aria-label={iconLabel(name)}
                aria-pressed={on}
                onClick={() => setPicked(on ? null : name)}
                onDoubleClick={() => onUse(name, iconLabel(name))}
                className={cn(
                  "focus-ring grid cursor-pointer justify-items-center gap-1.5 rounded-control border px-1 pb-2 pt-3 transition",
                  on ? "border-brand bg-tint ring-2 ring-brand/25" : "border-hair hover:border-tint-line hover:bg-tint"
                )}
              >
                <MaterialSymbol name={name} size={28} className="text-brand" />
                <span className="w-full truncate text-center text-caption text-ink-3">{iconLabel(name)}</span>
              </button>
            );
          })}
        </div>
      )}
    </PickerShell>
  );
}

/* ───────────────────────────────── QR code ───────────────────────────────── */

/** "pi.example.com/x" becomes "https://pi.example.com/x"; anything without a dot is not a link. */
function normaliseUrl(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;
  const withScheme = /^https?:\/\//i.test(text) ? text : `https://${text}`;
  try {
    const url = new URL(withScheme);
    return url.hostname.includes(".") ? url.toString() : null;
  } catch {
    return null;
  }
}

export function QrCodeModal({ onUse, onClose }: { onUse: (url: string, image: string) => void; onClose: () => void }) {
  const [link, setLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [qr, setQr] = useState<{ url: string; image: string } | null>(null);

  const generate = async () => {
    const url = normaliseUrl(link);
    if (!url) {
      setError("Enter a full web address, like pi.velmora.com or https://…");
      return;
    }
    setError(null);
    const image = await QRCode.toDataURL(url, { margin: 1, width: 480, errorCorrectionLevel: "M" });
    setQr({ url, image });
  };

  return (
    <PickerShell
      icon={QrCode}
      title="QR code"
      sub="Links the printed page to a web address: the full prescribing information, or a copy of the poster."
      onClose={onClose}
      wide={false}
      footer={
        qr ? (
          <>
            <Button size="sm" variant="ghost" onClick={() => setQr(null)}>
              Change link
            </Button>
            <Button size="sm" onClick={() => onUse(qr.url, qr.image)}>
              Use this image
            </Button>
          </>
        ) : (
          <>
            <span className="text-label text-ink-3">Generated here, nothing is sent anywhere.</span>
            <Button size="sm" onClick={generate} disabled={!link.trim()}>
              Generate QR
            </Button>
          </>
        )
      }
    >
      {qr ? (
        <div className="grid justify-items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr.image} alt={`QR code linking to ${qr.url}`} className="size-56 rounded-control border border-hair bg-card p-2" />
          <p className="max-w-full break-all text-center text-label text-ink-3">{qr.url}</p>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void generate();
          }}
        >
          <Field
            label="Link"
            placeholder="pi.velmora.com"
            value={link}
            autoFocus
            error={error ?? undefined}
            hint="Where the code should take someone who scans it."
            onChange={(e) => {
              setLink(e.target.value);
              setError(null);
            }}
          />
        </form>
      )}
    </PickerShell>
  );
}

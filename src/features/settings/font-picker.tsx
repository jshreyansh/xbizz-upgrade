"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/cn";

/**
 * A font picker that shows each face SET IN ITSELF alongside its name. A list
 * of font names in the UI font tells you nothing about what you are choosing —
 * the whole point of picking a typeface is seeing it.
 *
 * The faces are loaded from Google Fonts on mount rather than in the root
 * layout, so the weight is paid on this tab only and not on every page.
 */
const FONTS = [
  "Inter", "Poppins", "Nunito", "Nunito Sans", "Raleway", "Work Sans",
  "Source Sans 3", "Rubik", "Mulish", "Manrope", "DM Sans", "Outfit",
  "Plus Jakarta Sans", "Figtree", "Karla", "Lato", "Montserrat", "Open Sans",
  "Roboto", "Public Sans", "Space Grotesk", "Sora", "Urbanist", "Lexend",
  "Playfair Display", "Merriweather", "Lora", "Source Serif 4",
  "IBM Plex Sans", "IBM Plex Mono", "JetBrains Mono", "Roboto Mono",
];

const GOOGLE_HREF =
  "https://fonts.googleapis.com/css2?" +
  FONTS.map((f) => `family=${f.replace(/ /g, "+")}:wght@400;600`).join("&") +
  "&display=swap";

function useGoogleFonts() {
  useEffect(() => {
    const id = "swishx-font-picker-faces";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = GOOGLE_HREF;
    document.head.appendChild(link);
    // Left in place deliberately: unmounting and remounting the picker should
    // not re-download 32 faces.
  }, []);
}

export interface FontPickerProps {
  /** Already-chosen names, hidden from the list. */
  exclude?: string[];
  onPick: (name: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function FontPicker({ exclude = [], onPick, disabled, placeholder = "Choose a typeface" }: FontPickerProps) {
  useGoogleFonts();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FONTS
      .filter((f) => !exclude.includes(f))
      .filter((f) => (q ? f.toLowerCase().includes(q) : true));
  }, [query, exclude]);

  // Close on outside click and on Escape — a dropdown that traps you is worse
  // than no dropdown.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => { if (open) searchRef.current?.focus(); }, [open]);

  return (
    <div ref={wrapRef} className="relative w-full max-w-sm">
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-control border bg-card px-3 py-2 text-left transition-colors cursor-pointer",
          open ? "border-brand ring-2 ring-brand/15" : "border-hair-2 hover:border-hair-3",
          disabled && "pointer-events-none opacity-40",
        )}
      >
        <span className="truncate text-body text-ink-3">{placeholder}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-ink-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1 overflow-hidden rounded-panel border border-hair bg-card shadow-float">
          <div className="border-b border-hair p-2">
            <div className="flex items-center gap-2 rounded-control border border-brand bg-card px-2.5 py-1.5 ring-2 ring-brand/15">
              <Search className="size-3.5 shrink-0 text-ink-3" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search fonts…"
                className="w-full bg-transparent text-body text-ink outline-none placeholder:text-ink-3"
              />
            </div>
          </div>

          <ul role="listbox" className="max-h-64 overflow-y-auto py-1">
            {results.length === 0 ? (
              <li className="px-3 py-6 text-center">
                <Text size="body" tone="muted">No font matches &ldquo;{query}&rdquo;.</Text>
              </li>
            ) : (
              results.map((f) => (
                <li key={f}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={false}
                    onClick={() => { onPick(f); setOpen(false); setQuery(""); }}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-subtle cursor-pointer"
                  >
                    {/* The face, set in itself. This is the whole point. */}
                    <span
                      style={{ fontFamily: `"${f}", var(--font-figtree), sans-serif` }}
                      className="truncate text-subhead text-ink"
                    >
                      {f}
                    </span>
                    <Check className="size-3.5 shrink-0 text-brand opacity-0" />
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

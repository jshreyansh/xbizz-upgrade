"use client";

import { Check, ChevronDown, X } from "lucide-react";
import { createPortal } from "react-dom";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type MenuPlacement = { style: CSSProperties; above: boolean };

/** An option with a label that differs from its value, and an optional hint line. */
export interface SelectOption {
  value: string;
  label: string;
  hint?: string;
  /** e.g. a font family, so a font list previews itself. */
  style?: CSSProperties;
}

type SelectSize = "sm" | "md" | "lg";

const TRIGGER: Record<SelectSize, string> = {
  sm: "h-8 rounded-chip px-2.5 text-label font-bold",
  md: "h-10 rounded-control px-3 text-body",
  lg: "squircle-control h-12 px-3.5 text-body-lg font-medium shadow-hair",
};
const ROW: Record<SelectSize, string> = {
  sm: "min-h-8 gap-2 px-2 text-body",
  md: "min-h-10 gap-2.5 px-2.5 text-body",
  lg: "min-h-11 gap-3 px-3 text-body-lg",
};

const toOption = (o: string | SelectOption): SelectOption => (typeof o === "string" ? { value: o, label: o } : o);

/**
 * The dropdown. Used everywhere a native <select> would be, so every list of
 * choices opens the same themed menu instead of the browser's own.
 *
 * Options are strings, or { value, label, hint } when what is shown differs
 * from what is stored. Three sizes: lg for form-first screens, md for settings
 * forms, sm for toolbars and inline rows.
 */
export function SelectMenu({
  value,
  options: rawOptions,
  onChange,
  ariaLabel,
  className,
  triggerClassName,
  placeholder = "Select an option...",
  renderIcon,
  size = "lg",
  menuMinWidth,
  disabled,
}: {
  value: string;
  options: readonly (string | SelectOption)[];
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
  /** Merged last onto the trigger button. */
  triggerClassName?: string;
  placeholder?: string;
  renderIcon?: (option: string) => ReactNode;
  size?: SelectSize;
  /** For narrow triggers: the menu may be wider than the button. */
  menuMinWidth?: number;
  disabled?: boolean;
}) {
  const options = rawOptions.map(toOption);
  const [open, setOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [placement, setPlacement] = useState<MenuPlacement | null>(null);
  const [active, setActive] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);
  const hasValue = Boolean(current);

  useEffect(() => {
    if (open) {
      const timeout = window.setTimeout(() => setMenuMounted(true), 0);
      return () => window.clearTimeout(timeout);
    }
    const timeout = window.setTimeout(() => setMenuMounted(false), 150);
    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    const positionMenu = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      const below = window.innerHeight - rect.bottom - 12;
      const above = rect.top - 12;
      const opensAbove = below < 260 && above > below;
      const maxHeight = Math.max(150, Math.min(390, (opensAbove ? above : below) - 8));
      const width = Math.max(rect.width, menuMinWidth ?? 0);
      const left = Math.min(rect.left, window.innerWidth - width - 12);
      setPlacement({
        above: opensAbove,
        style: {
          position: "fixed",
          left,
          width,
          maxHeight,
          ...(opensAbove ? { bottom: window.innerHeight - rect.top + 6 } : { top: rect.bottom + 6 }),
        },
      });
    };
    if (open) positionMenu();
    window.addEventListener("resize", positionMenu);
    window.addEventListener("scroll", positionMenu, true);
    return () => {
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu, true);
    };
  }, [open, menuMinWidth]);

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);

  /* Keep the highlighted row in view as the arrows move it. */
  useEffect(() => {
    if (!open || active < 0) return;
    menuRef.current?.querySelectorAll<HTMLElement>("[role=option]")[active]?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const openMenu = () => {
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };
  const choose = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const menu = menuMounted && placement && (
    <div
      ref={menuRef}
      style={placement.style}
      className={cn(
        "squircle-panel z-[100] overflow-y-auto border border-hair-2 bg-card p-1.5 shadow-float",
        open
          ? placement.above
            ? "select-pop-above"
            : "select-pop"
          : placement.above
          ? "select-pop-out-above pointer-events-none"
          : "select-pop-out pointer-events-none"
      )}
      role="listbox"
      aria-label={ariaLabel}
    >
      {options.map((option, i) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="option"
            tabIndex={-1}
            aria-selected={selected}
            onMouseEnter={() => setActive(i)}
            onClick={() => choose(option.value)}
            className={cn(
              "squircle-control flex w-full items-center rounded-control py-1.5 text-left transition-colors duration-150",
              ROW[size],
              selected ? "font-semibold text-brand-deep" : "font-normal text-ink",
              i === active ? "bg-subtle" : selected ? "bg-tint" : ""
            )}
          >
            <span
              className={cn(
                "grid shrink-0 place-items-center rounded-full border transition",
                size === "sm" ? "size-4" : "size-5",
                selected ? "border-brand" : "border-hair-2 bg-card"
              )}
            >
              <span className={cn("rounded-full bg-brand transition", size === "sm" ? "size-2" : "size-2.5", selected ? "scale-100" : "scale-0")} />
            </span>
            {renderIcon?.(option.value)}
            <span className="min-w-0 flex-1">
              <span className="block truncate" style={option.style}>{option.label}</span>
              {option.hint && <span className="block truncate text-caption font-normal text-ink-4">{option.hint}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={(event) => {
          if (!open) {
            if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openMenu();
            }
            return;
          }
          if (event.key === "Escape" || event.key === "Tab") { setOpen(false); return; }
          if (event.key === "ArrowDown") { event.preventDefault(); setActive((a) => Math.min(options.length - 1, a + 1)); }
          if (event.key === "ArrowUp") { event.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
          if ((event.key === "Enter" || event.key === " ") && options[active]) { event.preventDefault(); choose(options[active].value); }
        }}
        className={cn(
          "focus-ring group flex w-full cursor-pointer items-center justify-between border bg-card text-left transition disabled:cursor-not-allowed disabled:opacity-50",
          TRIGGER[size],
          hasValue ? "text-ink" : "text-ink-4",
          open ? "border-brand ring-2 ring-brand/15" : "border-hair-2 hover:border-hair-3",
          triggerClassName
        )}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {hasValue ? (
            <>
              {renderIcon?.(current!.value)}
              <span className="truncate" style={current!.style}>{current!.label}</span>
            </>
          ) : (
            <span className="truncate font-normal italic text-ink-4">{placeholder}</span>
          )}
        </span>
        <span
          className={cn(
            "ml-2 grid shrink-0 place-items-center rounded-full text-ink-3 transition",
            size === "lg" ? "size-7" : "size-5",
            open ? "rotate-180 bg-tint text-brand" : "group-hover:bg-subtle"
          )}
        >
          <ChevronDown className={size === "lg" ? "size-4" : "size-3.5"} />
        </span>
      </button>
      {typeof document !== "undefined" && menu ? createPortal(menu, document.body) : null}
    </div>
  );
}

export function MultiSelectMenu({
  values,
  options,
  onChange,
  ariaLabel,
  className,
  placeholder = "Select focus topics...",
  renderIcon,
}: {
  values: string[];
  options: readonly string[];
  onChange: (values: string[]) => void;
  ariaLabel: string;
  className?: string;
  placeholder?: string;
  renderIcon?: (option: string) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [placement, setPlacement] = useState<MenuPlacement | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedValues = values;

  useEffect(() => {
    if (open) {
      const timeout = window.setTimeout(() => setMenuMounted(true), 0);
      return () => window.clearTimeout(timeout);
    }
    const timeout = window.setTimeout(() => setMenuMounted(false), 150);
    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    const positionMenu = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      const below = window.innerHeight - rect.bottom - 12;
      const above = rect.top - 12;
      const opensAbove = below < 310 && above > below;
      const maxHeight = Math.max(190, Math.min(430, (opensAbove ? above : below) - 8));
      setPlacement({
        above: opensAbove,
        style: {
          position: "fixed",
          left: rect.left,
          width: rect.width,
          maxHeight,
          ...(opensAbove ? { bottom: window.innerHeight - rect.top + 8 } : { top: rect.bottom + 8 }),
        },
      });
    };
    if (open) positionMenu();
    window.addEventListener("resize", positionMenu);
    window.addEventListener("scroll", positionMenu, true);
    return () => {
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu, true);
    };
  }, [open]);

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const toggleValue = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter((item) => item !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  const menu = menuMounted && placement && (
    <div ref={menuRef} style={placement.style} className={cn("squircle-panel z-[100] overflow-y-auto border border-hair-2 bg-card p-1.5 shadow-float", open ? placement.above ? "select-pop-above" : "select-pop" : placement.above ? "select-pop-out-above pointer-events-none" : "select-pop-out pointer-events-none")} role="listbox" aria-multiselectable="true" aria-label={ariaLabel}>
      {options.map((option) => {
        const selected = selectedValues.includes(option);
        return <button key={option} type="button" role="option" aria-selected={selected} onClick={() => toggleValue(option)} className={cn("squircle-control focus-ring flex min-h-11 w-full items-center gap-3 px-3 text-left text-body-lg transition-[opacity,background-color] duration-200 hover:opacity-100", selected ? "bg-[#eff6f2] font-medium text-brand opacity-100" : "opacity-68 hover:bg-[#f6f8f7]")}><span className={cn("grid size-5 shrink-0 place-items-center rounded-glyph transition", selected ? "bg-brand text-white" : "bg-[#eef1ef] text-transparent")}><Check className="size-3.5" strokeWidth={3} /></span>{renderIcon?.(option)}<span className="min-w-0 flex-1 truncate">{option}</span></button>;
      })}
      <div className="sticky bottom-0 mt-1 border-t border-hair bg-card p-1.5"><button type="button" onClick={() => setOpen(false)} className="squircle-control focus-ring min-h-10 w-full bg-brand px-3 text-body-lg font-medium text-white">Done · {selectedValues.length} selected</button></div>
    </div>
  );

  return (
    <div ref={rootRef} className={cn("relative space-y-2", className)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "squircle-control focus-ring group flex h-11 w-full items-center justify-between rounded-control border bg-card px-3.5 text-left text-body-lg font-medium text-ink shadow-hair transition",
          open
            ? "border-brand shadow-[0_0_0_3px_rgba(253,72,22,0.12)]"
            : "border-hair-2 hover:border-hair-3 hover:bg-[#fcfdfc]"
        )}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2 text-ink-2">
          <span className="font-medium text-ink">
            {selectedValues.length === 0
              ? "Select focus topics..."
              : `${selectedValues.length} topics selected`}
          </span>
        </span>
        <span
          className={cn(
            "ml-3 grid size-6 shrink-0 place-items-center rounded-full text-ink-3 transition",
            open ? "rotate-180 text-brand" : "group-hover:bg-[#f2f5f3]"
          )}
        >
          <ChevronDown className="size-4" />
        </span>
      </button>

      {/* Selected Items as individual removable chips below */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {selectedValues.map((val) => (
            <span
              key={val}
              className="inline-flex items-center gap-1.5 rounded-chip border border-tint-line bg-tint px-2.5 py-1 text-label font-semibold text-brand-deep transition hover:bg-tint"
            >
              {renderIcon?.(val)}
              <span>{val}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleValue(val);
                }}
                className="grid size-4 place-items-center rounded-full text-brand hover:bg-black/10 transition"
                aria-label={`Remove ${val}`}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {typeof document !== "undefined" && menu ? createPortal(menu, document.body) : null}
    </div>
  );
}

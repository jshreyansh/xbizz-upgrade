"use client";

import { Check, ChevronDown, X } from "lucide-react";
import { createPortal } from "react-dom";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type MenuPlacement = { style: CSSProperties; above: boolean };

export function SelectMenu({
  value,
  options,
  onChange,
  ariaLabel,
  className,
  placeholder = "Select an option...",
  renderIcon,
}: {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
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
  const hasValue = Boolean(value);

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

  const menu = menuMounted && placement && (
    <div
      ref={menuRef}
      style={placement.style}
      className={cn(
        "squircle-panel z-[100] overflow-y-auto border border-hair-2 bg-card p-1.5 shadow-[0_20px_60px_rgb(23_34_29/16%),0_3px_12px_rgb(23_34_29/6%)]",
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
      {options.map((option) => {
        const selected = option === value;
        return (
          <button
            key={option}
            type="button"
            role="option"
            aria-selected={selected}
            onClick={() => {
              onChange(option);
              setOpen(false);
            }}
            className={cn(
              "squircle-control focus-ring flex min-h-11 w-full items-center gap-3 px-3 text-left text-body-lg transition-[opacity,background-color,transform] duration-200 hover:opacity-100 focus-visible:opacity-100",
              selected
                ? "bg-[#eff6f2] font-medium text-brand opacity-100"
                : "font-normal text-ink opacity-68 hover:bg-[#f6f8f7]"
            )}
          >
            <span
              className={cn(
                "grid size-5 shrink-0 place-items-center rounded-full border transition",
                selected ? "border-brand" : "border-[#d6ddd9] bg-card"
              )}
            >
              <span
                className={cn(
                  "size-2.5 rounded-full bg-brand transition",
                  selected ? "scale-100" : "scale-0"
                )}
              />
            </span>
            {renderIcon?.(option)}
            <span className="min-w-0 flex-1 truncate">{option}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(
          "squircle-control focus-ring group flex h-12 w-full items-center justify-between border bg-card px-3.5 text-left text-body-lg font-medium shadow-[0_1px_2px_rgb(19_31_26/2%)] transition",
          hasValue ? "text-ink" : "text-ink-4",
          open
            ? "border-[#9fb4aa] shadow-[0_0_0_3px_rgb(37_79_63/8%)]"
            : "border-hair-2 hover:border-[#cbd5d0] hover:bg-[#fcfdfc]"
        )}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {hasValue ? (
            <>
              {renderIcon?.(value)}
              <span className="truncate">{value}</span>
            </>
          ) : (
            <span className="text-ink-4 italic font-normal">{placeholder}</span>
          )}
        </span>
        <span
          className={cn(
            "ml-3 grid size-7 shrink-0 place-items-center rounded-full text-ink-3 transition",
            open ? "rotate-180 bg-tint text-brand" : "group-hover:bg-[#f2f5f3]"
          )}
        >
          <ChevronDown className="size-4" />
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
    <div ref={menuRef} style={placement.style} className={cn("squircle-panel z-[100] overflow-y-auto border border-hair-2 bg-card p-1.5 shadow-[0_20px_60px_rgb(23_34_29/16%),0_3px_12px_rgb(23_34_29/6%)]", open ? placement.above ? "select-pop-above" : "select-pop" : placement.above ? "select-pop-out-above pointer-events-none" : "select-pop-out pointer-events-none")} role="listbox" aria-multiselectable="true" aria-label={ariaLabel}>
      {options.map((option) => {
        const selected = selectedValues.includes(option);
        return <button key={option} type="button" role="option" aria-selected={selected} onClick={() => toggleValue(option)} className={cn("squircle-control focus-ring flex min-h-11 w-full items-center gap-3 px-3 text-left text-body-lg transition-[opacity,background-color] duration-200 hover:opacity-100", selected ? "bg-[#eff6f2] font-medium text-brand opacity-100" : "opacity-68 hover:bg-[#f6f8f7]")}><span className={cn("grid size-5 shrink-0 place-items-center rounded-[6px] transition", selected ? "bg-brand text-white" : "bg-[#eef1ef] text-transparent")}><Check className="size-3.5" strokeWidth={3} /></span>{renderIcon?.(option)}<span className="min-w-0 flex-1 truncate">{option}</span></button>;
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
          "squircle-control focus-ring group flex h-11 w-full items-center justify-between rounded-[13px] border bg-card px-3.5 text-left text-body-lg font-medium text-ink shadow-[0_1px_2px_rgb(19_31_26/2%)] transition",
          open
            ? "border-brand shadow-[0_0_0_3px_rgba(253,72,22,0.12)]"
            : "border-hair-2 hover:border-[#cbd5d0] hover:bg-[#fcfdfc]"
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
              className="inline-flex items-center gap-1.5 rounded-[9px] border border-tint-line bg-tint px-2.5 py-1 text-label font-semibold text-brand-deep transition hover:bg-tint"
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

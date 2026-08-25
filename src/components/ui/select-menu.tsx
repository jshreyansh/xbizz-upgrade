"use client";

import { Check, ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type MenuPlacement = { style: CSSProperties; above: boolean };

export function SelectMenu({ value, options, onChange, ariaLabel, className, renderIcon }: { value: string; options: readonly string[]; onChange: (value: string) => void; ariaLabel: string; className?: string; renderIcon?: (option: string) => ReactNode }) {
  const [open, setOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [placement, setPlacement] = useState<MenuPlacement | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedValue = value || options[0];

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
    <div ref={menuRef} style={placement.style} className={cn("squircle-panel z-[100] overflow-y-auto border border-[#e3e8e5] bg-white p-1.5 shadow-[0_20px_60px_rgb(23_34_29/16%),0_3px_12px_rgb(23_34_29/6%)]", open ? placement.above ? "select-pop-above" : "select-pop" : placement.above ? "select-pop-out-above pointer-events-none" : "select-pop-out pointer-events-none")} role="listbox" aria-label={ariaLabel}>
      {options.map((option) => {
        const selected = option === selectedValue;
        return (
          <button key={option} type="button" role="option" aria-selected={selected} onClick={() => { onChange(option); setOpen(false); }} className={cn("squircle-control focus-ring flex min-h-11 w-full items-center gap-3 px-3 text-left text-[14px] transition-[opacity,background-color,transform] duration-200 hover:opacity-100 focus-visible:opacity-100", selected ? "bg-[#eff6f2] font-medium text-[var(--brand)] opacity-100" : "font-normal text-[var(--ink)] opacity-68 hover:bg-[#f6f8f7]")}>
            <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border transition", selected ? "border-[var(--brand)]" : "border-[#d6ddd9] bg-white")}><span className={cn("size-2.5 rounded-full bg-[var(--brand)] transition", selected ? "scale-100" : "scale-0")} /></span>
            {renderIcon?.(option)}
            <span className="min-w-0 flex-1 truncate">{option}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button type="button" onClick={() => setOpen((current) => !current)} onKeyDown={(event) => { if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") { event.preventDefault(); setOpen(true); } }} className={cn("squircle-control focus-ring group flex h-12 w-full items-center justify-between border bg-white px-3.5 text-left text-[14px] font-medium text-[var(--ink)] shadow-[0_1px_2px_rgb(19_31_26/2%)] transition", open ? "border-[#9fb4aa] shadow-[0_0_0_3px_rgb(37_79_63/8%)]" : "border-[#e3e8e5] hover:border-[#cbd5d0] hover:bg-[#fcfdfc]")} aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open}>
        <span className="flex min-w-0 items-center gap-2.5">{renderIcon?.(selectedValue)}<span className="truncate">{selectedValue}</span></span>
        <span className={cn("ml-3 grid size-7 shrink-0 place-items-center rounded-full text-[#738079] transition", open ? "rotate-180 bg-[var(--brand-soft)] text-[var(--brand)]" : "group-hover:bg-[#f2f5f3]")}><ChevronDown className="size-4" /></span>
      </button>
      {typeof document !== "undefined" && menu ? createPortal(menu, document.body) : null}
    </div>
  );
}

export function MultiSelectMenu({ values, options, onChange, ariaLabel, className, renderIcon }: { values: string[]; options: readonly string[]; onChange: (values: string[]) => void; ariaLabel: string; className?: string; renderIcon?: (option: string) => ReactNode }) {
  const [open, setOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [placement, setPlacement] = useState<MenuPlacement | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedValues = values.length > 0 ? values : [options[0]];

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
      if (selectedValues.length > 1) onChange(selectedValues.filter((item) => item !== option));
    } else onChange([...selectedValues, option]);
  };
  const summary = selectedValues[0];

  const menu = menuMounted && placement && (
    <div ref={menuRef} style={placement.style} className={cn("squircle-panel z-[100] overflow-y-auto border border-[#e3e8e5] bg-white p-1.5 shadow-[0_20px_60px_rgb(23_34_29/16%),0_3px_12px_rgb(23_34_29/6%)]", open ? placement.above ? "select-pop-above" : "select-pop" : placement.above ? "select-pop-out-above pointer-events-none" : "select-pop-out pointer-events-none")} role="listbox" aria-multiselectable="true" aria-label={ariaLabel}>
      {options.map((option) => {
        const selected = selectedValues.includes(option);
        return <button key={option} type="button" role="option" aria-selected={selected} onClick={() => toggleValue(option)} className={cn("squircle-control focus-ring flex min-h-11 w-full items-center gap-3 px-3 text-left text-[14px] transition-[opacity,background-color] duration-200 hover:opacity-100", selected ? "bg-[#eff6f2] font-medium text-[var(--brand)] opacity-100" : "opacity-68 hover:bg-[#f6f8f7]")}><span className={cn("grid size-5 shrink-0 place-items-center rounded-[6px] transition", selected ? "bg-[var(--brand)] text-white" : "bg-[#eef1ef] text-transparent")}><Check className="size-3.5" strokeWidth={3} /></span>{renderIcon?.(option)}<span className="min-w-0 flex-1 truncate">{option}</span></button>;
      })}
      <div className="sticky bottom-0 mt-1 border-t border-[var(--line)] bg-white p-1.5"><button type="button" onClick={() => setOpen(false)} className="squircle-control focus-ring min-h-10 w-full bg-[var(--brand)] px-3 text-[13px] font-medium text-white">Done · {selectedValues.length} selected</button></div>
    </div>
  );

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button type="button" onClick={() => setOpen((current) => !current)} className={cn("squircle-control focus-ring group flex h-12 w-full items-center justify-between border bg-white px-3.5 text-left text-[14px] font-medium text-[var(--ink)] shadow-[0_1px_2px_rgb(19_31_26/2%)] transition", open ? "border-[#9fb4aa] shadow-[0_0_0_3px_rgb(37_79_63/8%)]" : "border-[#e3e8e5] hover:border-[#cbd5d0] hover:bg-[#fcfdfc]")} aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open}>
        <span className="flex min-w-0 items-center gap-2.5">{renderIcon?.(selectedValues[0])}<span className="truncate">{summary}</span>{selectedValues.length > 1 && <><span className="flex -space-x-1.5" aria-hidden="true">{selectedValues.slice(1, 4).map((option) => <span key={option} className="grid size-6 place-items-center rounded-full border-2 border-white bg-[#edf3ef] text-[var(--brand)] shadow-sm">{renderIcon?.(option)}</span>)}</span><span className="shrink-0 text-[12px] font-semibold text-[var(--brand)]">+{selectedValues.length - 1}</span></>}</span>
        <span className={cn("ml-3 grid size-7 shrink-0 place-items-center rounded-full text-[#738079] transition", open ? "rotate-180 bg-[var(--brand-soft)] text-[var(--brand)]" : "group-hover:bg-[#f2f5f3]")}><ChevronDown className="size-4" /></span>
      </button>
      {typeof document !== "undefined" && menu ? createPortal(menu, document.body) : null}
    </div>
  );
}

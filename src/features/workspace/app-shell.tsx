"use client";

import {
  Bell,
  BookOpenText,
  ChevronDown,
  CircleHelp,
  FileStack,
  FolderKanban,
  Home,
  Menu,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { SwishXMark } from "@/components/ui/swishx-mark";
import { cn } from "@/lib/cn";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";

const navItems = [
  { label: "Home", icon: Home, active: true },
  { label: "Content", icon: FolderKanban },
  { label: "Brands & sources", icon: BookOpenText },
  { label: "Reviews", icon: ShieldCheck, count: 3 },
];

export function AppShell({ children }: { children: ReactNode }) {
  const setView = useWorkspaceStore((state) => state.setView);

  return (
    <div className="min-h-screen bg-[var(--background)] lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] flex-col border-r border-[var(--line)] bg-[#f8f9f7] lg:flex">
        <div className="flex h-[72px] items-center px-5">
          <SwishXMark />
        </div>

        <div className="px-3">
          <button className="focus-ring flex w-full items-center gap-3 rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-left shadow-[var(--shadow-sm)]">
            <span className="grid size-8 place-items-center rounded-lg bg-[#e8eee9] text-[11px] font-extrabold text-[var(--brand)]">AT</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-bold">Aster Therapeutics</span>
              <span className="block text-[10px] text-[var(--ink-muted)]">US Commercial</span>
            </span>
            <ChevronDown className="size-4 text-[var(--ink-muted)]" />
          </button>
        </div>

        <nav className="mt-6 space-y-1 px-3" aria-label="Primary">
          {navItems.map(({ label, icon: Icon, active, count }) => (
            <button
              key={label}
              onClick={() => label === "Home" && setView("home")}
              className={cn(
                "focus-ring flex h-10 w-full items-center gap-3 rounded-[10px] px-3 text-[12px] font-semibold transition-colors",
                active
                  ? "bg-[var(--brand-soft)] text-[var(--brand-strong)]"
                  : "text-[var(--ink-muted)] hover:bg-black/5 hover:text-[var(--ink)]",
              )}
            >
              <Icon className="size-[17px]" strokeWidth={1.8} />
              <span className="flex-1 text-left">{label}</span>
              {count ? <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-[var(--brand)]">{count}</span> : null}
            </button>
          ))}
        </nav>

        <div className="mt-7 px-5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#939c97]">Pinned</div>
        <div className="mt-2 space-y-1 px-3">
          {["DERMORA launch", "HCP education", "Congress 2026"].map((item, index) => (
            <button key={item} className="focus-ring flex h-9 w-full items-center gap-3 rounded-lg px-3 text-[12px] text-[var(--ink-muted)] hover:bg-black/5">
              <span className={cn("size-2 rounded-[3px]", index === 0 ? "bg-[#8fbe61]" : index === 1 ? "bg-[#7aa9d6]" : "bg-[#d69b7a]")} />
              {item}
            </button>
          ))}
        </div>

        <div className="mt-auto border-t border-[var(--line)] p-3">
          <button className="focus-ring flex h-10 w-full items-center gap-3 rounded-[10px] px-3 text-[12px] text-[var(--ink-muted)] hover:bg-black/5">
            <CircleHelp className="size-[17px]" />
            Help & shortcuts
          </button>
          <div className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5">
            <span className="grid size-8 place-items-center rounded-full bg-[#d9b7a4] text-[11px] font-extrabold text-[#533b2e]">MK</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-bold">Maya Kapoor</span>
              <span className="block text-[10px] text-[var(--ink-muted)]">Brand Marketing</span>
            </span>
            <ChevronDown className="size-4 text-[var(--ink-muted)]" />
          </div>
        </div>
      </aside>

      <main className="min-w-0 lg:col-start-2">
        <header className="sticky top-0 z-20 flex h-[72px] items-center border-b border-[var(--line)] bg-[rgb(244_245_243/88%)] px-4 backdrop-blur-xl sm:px-7 lg:px-9">
          <button className="focus-ring mr-3 grid size-9 place-items-center rounded-lg hover:bg-black/5 lg:hidden" aria-label="Open navigation">
            <Menu className="size-5" />
          </button>
          <div className="lg:hidden"><SwishXMark compact /></div>
          <div className="relative ml-auto hidden w-full max-w-[320px] sm:block lg:ml-0">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8d9691]" />
            <input
              aria-label="Search content"
              placeholder="Search content, claims, sources…"
              className="focus-ring h-9 w-full rounded-[10px] border border-[var(--line)] bg-white/80 pl-9 pr-16 text-[12px] placeholder:text-[#9ca39f]"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-[var(--line)] bg-[#f7f8f6] px-1.5 py-0.5 text-[9px] font-semibold text-[#87908b]">⌘ K</span>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <Button variant="ghost" size="icon" aria-label="Library"><FileStack className="size-[18px]" /></Button>
            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
              <Bell className="size-[18px]" />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#d25f51] ring-2 ring-[var(--background)]" />
            </Button>
            <Button onClick={() => setView("create")} className="ml-2"><Plus className="size-4" />New content</Button>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

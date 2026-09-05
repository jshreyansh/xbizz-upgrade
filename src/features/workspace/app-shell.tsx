"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/features/workspace/sidebar";
import { Topbar } from "@/features/workspace/topbar";
import { TeamDock } from "@/features/team-dock/team-dock";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";

interface AppShellProps {
  children: ReactNode;
  pageTitle?: string;
}

export function AppShell({ children, pageTitle }: AppShellProps) {
  const toggleTeamDock = useWorkspaceStore((s) => s.toggleTeamDock);
  const pathname = usePathname();

  // The sidebar is a fixed-width floating panel that only fits alongside
  // content on tablet/desktop widths. Below md it becomes an off-canvas
  // drawer instead — without this, the sidebar rendered full-bleed over the
  // whole viewport on a phone, so a tap that looked like it landed on the
  // page was really landing on a nav row underneath (e.g. "Video" then
  // "Home"), reading as the view randomly toggling between the two.
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        toggleTeamDock();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleTeamDock]);

  // Close the drawer whenever navigation actually happens, rather than
  // threading a callback through every nav row inside <Sidebar>.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate: syncs drawer visibility to the router's own pathname, an external system.
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-canvas">
      {/* Desktop / tablet: the persistent floating sidebar. */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile: the same sidebar, presented as an off-canvas drawer. */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${mobileNavOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!mobileNavOpen}
      >
        <div
          onClick={() => setMobileNavOpen(false)}
          className={`absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity duration-300 ${
            mobileNavOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className="absolute inset-y-0 left-0 transition-transform duration-300 ease-out"
          style={{ transform: mobileNavOpen ? "translateX(0)" : "translateX(-105%)" }}
        >
          <Sidebar />
        </div>
      </div>

      <div className="flex h-full min-w-0 flex-1 flex-col">
        <Topbar pageTitle={pageTitle} onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 pt-5 pb-16 sm:px-8 sm:pt-7 sm:pb-20">{children}</main>
      </div>
      <TeamDock />
    </div>
  );
}

"use client";

import { useEffect, type ReactNode } from "react";
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

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-canvas">
      <Sidebar />
      <div className="flex h-full min-w-0 flex-1 flex-col">
        <Topbar pageTitle={pageTitle} />
        <main className="flex-1 overflow-y-auto px-8 pt-7 pb-20">{children}</main>
      </div>
      <TeamDock />
    </div>
  );
}

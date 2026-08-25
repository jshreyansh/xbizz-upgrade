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
    <div style={{ position: "fixed", inset: 0, display: "flex", background: "var(--canvas)", overflow: "hidden" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100%" }}>
        <Topbar pageTitle={pageTitle} />
        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px 80px" }}>
          {children}
        </main>
      </div>
      <TeamDock />
    </div>
  );
}

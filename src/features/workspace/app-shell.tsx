"use client";

import type { ReactNode } from "react";
import { Sidebar } from "@/features/workspace/sidebar";
import { Topbar } from "@/features/workspace/topbar";

interface AppShellProps {
  children: ReactNode;
  pageTitle?: string;
}

export function AppShell({ children, pageTitle }: AppShellProps) {
  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", background: "var(--canvas)" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar pageTitle={pageTitle} />
        <main style={{ flex: 1, overflowY: "auto", padding: "30px 34px 80px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

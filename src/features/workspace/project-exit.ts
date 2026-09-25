"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import type { ToastTone } from "@/components/patterns/toast";

/**
 * Where a project gets left — closed from the header's ✕, or handed off to
 * the Character or Voice library mid-flow. Every one of those moments asks
 * the same question ("keep this as a draft, or throw it away?") and does the
 * same two things afterward (drop the workspace state, go to `destination`),
 * so it happens once here instead of five times with five different toasts.
 */
export interface ExitDestination {
  href: string;
  /** Named in the confirm dialog's body: "the Character Library", "home". */
  label: string;
}

const HOME: ExitDestination = { href: "/", label: "home" };

const QUEUED_TOAST_KEY = "swishx:queued-toast";

/**
 * The screen a "save as draft" or "discard" resolves on is never the one
 * that asked the question — by the time the toast would show, the router has
 * already left it. Queuing the message for the next page to pick up (see
 * `AppShell`) is what makes it show up where the user actually lands, not
 * flash for one frame on the page being torn down.
 */
export function queueToast(message: string, tone: ToastTone = "done") {
  try {
    sessionStorage.setItem(QUEUED_TOAST_KEY, JSON.stringify({ message, tone }));
  } catch {
    // Private tab, storage disabled — the toast is a nicety, not load-bearing.
  }
}

export function takeQueuedToast(): { message: string; tone: ToastTone } | null {
  try {
    const raw = sessionStorage.getItem(QUEUED_TOAST_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(QUEUED_TOAST_KEY);
    return JSON.parse(raw) as { message: string; tone: ToastTone };
  } catch {
    return null;
  }
}

export function useProjectExit() {
  const router = useRouter();
  const reset = useWorkspaceStore((s) => s.reset);
  const [pending, setPending] = useState<ExitDestination | null>(null);

  const requestExit = useCallback((destination: ExitDestination = HOME) => {
    setPending(destination);
  }, []);

  const cancel = useCallback(() => setPending(null), []);

  const resolve = useCallback(
    (keepAsDraft: boolean) => {
      if (!pending) return;
      const destination = pending;
      queueToast(
        keepAsDraft ? "Saved as draft" : "Project discarded",
        keepAsDraft ? "done" : "undone"
      );
      reset();
      setPending(null);
      router.push(destination.href);
    },
    [pending, reset, router]
  );

  return { pending, requestExit, cancel, resolve };
}

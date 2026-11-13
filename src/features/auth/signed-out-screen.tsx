"use client";

import { LogOut } from "lucide-react";
import { LogoMark } from "@/components/ui/logo-mark";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { useSettingsStore } from "@/features/settings/settings-store";
import { useAuthFlow } from "@/features/auth/auth-flow";
import { AuthButton } from "@/features/auth/auth-stage";

export function SignedOutScreen() {
  const setAuthView = useWorkspaceStore((s) => s.setAuthView);
  const me = useSettingsStore((s) => s.members.find((m) => m.id === s.currentUserId));
  const workspaceName = useSettingsStore((s) => s.workspaceName);

  return (
    <div className="stage-in relative flex h-full w-full flex-col px-6 py-10 text-white md:px-14 md:py-12">
      <div className="inline-flex items-center gap-2 text-title font-extrabold tracking-tight">
        <LogoMark size={24} />
        <span>
          swish<span className="text-brand">X</span><span className="ml-1.5 font-semibold text-current opacity-60">Studio</span>
        </span>
      </div>

      <div className="mx-auto my-auto w-full max-w-[440px] text-center">
        <div className="mx-auto mb-6 grid size-16 place-items-center rounded-full border border-white/15 bg-white/[.06]">
          <LogOut className="size-7" strokeWidth={1.8} />
        </div>
        <h2 className="m-0 text-hero-lg font-extrabold tracking-tight">You&apos;re Signed Out</h2>
        <p className="mx-auto mt-3 max-w-[40ch] text-body-lg leading-relaxed text-white/65">
          Your session on this device has ended. Everything you made is safe in the {workspaceName} workspace.
        </p>
        <div className="mt-8 flex justify-center">
          <AuthButton
            className="w-auto px-8"
            onClick={() => { if (me) useAuthFlow.getState().setEmail(me.email); setAuthView("signin"); }}
          >
            Sign Back In
          </AuthButton>
        </div>
        {me && <p className="mt-5 text-caption text-white/40">Last signed in as {me.email}</p>}
      </div>
    </div>
  );
}

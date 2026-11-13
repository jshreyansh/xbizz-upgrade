"use client";

import { useEffect } from "react";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { useAuthFlow } from "@/features/auth/auth-flow";
import {
  BlockedScreen, DetailsScreen, InviteScreen, JoinScreen, OrganisationScreen, WaitingScreen,
} from "@/features/auth/auth-steps";
import { SignInScreen } from "@/features/auth/sign-in-screen";
import { OtpScreen } from "@/features/auth/otp-screen";
import { WorkspaceScreen } from "@/features/auth/workspace-screen";
import { TeamScreen } from "@/features/auth/team-screen";
import { SignedOutScreen } from "@/features/auth/signed-out-screen";
import { AccountTypeScreen, AgencyRewardScreen } from "@/features/auth/account-type-screen";

/**
 * The ground behind every step: near-black, one warm glow from the brand
 * colour and a faint dot grid that fades out, so the card and the words are
 * what you see.
 */
function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div
        className="auth-drift absolute rounded-full"
        style={{
          width: "75vw",
          height: "75vw",
          left: "-22%",
          top: "-38%",
          background: "radial-gradient(circle, rgba(253,72,22,.38), rgba(253,72,22,.08) 45%, transparent 68%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="auth-drift absolute rounded-full"
        style={{
          width: "55vw",
          height: "55vw",
          right: "-12%",
          bottom: "-30%",
          background: "radial-gradient(circle, rgba(138,92,245,.22), transparent 65%)",
          filter: "blur(50px)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,.16) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage: "radial-gradient(ellipse 70% 70% at 25% 35%, black, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 25% 35%, black, transparent 75%)",
        }}
      />
      {/* Where the pointer is, the grid lights up. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(255,154,107,.55) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage: "radial-gradient(circle 260px at var(--mx, 30%) var(--my, 40%), black, transparent)",
          WebkitMaskImage: "radial-gradient(circle 260px at var(--mx, 30%) var(--my, 40%), black, transparent)",
        }}
      />
    </div>
  );
}

export function AuthShell() {
  const authView = useWorkspaceStore((s) => s.authView);
  const setAuthView = useWorkspaceStore((s) => s.setAuthView);

  /* An invite link (/auth?invite=…) lands on the invite itself. */
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("invite");
    if (!id) return;
    useAuthFlow.getState().setInviteId(id);
    useAuthFlow.getState().setRoute({ path: "invite", inviteId: id });
    setAuthView("invite");
  }, [setAuthView]);

  return (
    <div
      className="relative flex h-full w-full overflow-hidden"
      style={{ background: "#0b0c10" }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
    >
      <Backdrop />

      {/* Stage content */}
      <div className="relative z-10 flex h-full w-full">
        {authView === "signin" && <SignInScreen />}
        {authView === "otp" && <OtpScreen />}
        {authView === "accounttype" && <AccountTypeScreen />}
        {authView === "reward" && <AgencyRewardScreen />}
        {authView === "organisation" && <OrganisationScreen />}
        {authView === "workspace" && <WorkspaceScreen />}
        {authView === "invite" && <InviteScreen />}
        {authView === "details" && <DetailsScreen />}
        {authView === "join" && <JoinScreen />}
        {authView === "waiting" && <WaitingScreen />}
        {authView === "blocked" && <BlockedScreen />}
        {authView === "team" && <TeamScreen />}
        {authView === "signedout" && <SignedOutScreen />}
      </div>

    </div>
  );
}

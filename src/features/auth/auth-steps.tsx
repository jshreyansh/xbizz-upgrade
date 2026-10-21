"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock, Lock, MailX, ShieldAlert } from "lucide-react";
import { Field } from "@/components/ui/field";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import {
  findInvite, listWorkspaces, orgPeople, useSettingsStore, workspaceNameOf,
} from "@/features/settings/settings-store";
import { PERMISSIONS, REGIONS, emailDomain } from "@/features/settings/settings-types";
import { routeEmail, useAuthFlow } from "@/features/auth/auth-flow";
import { AuthButton, AuthCardHead, AuthLabel, AuthStage } from "@/features/auth/auth-stage";
import { cn } from "@/lib/cn";

const SELECT =
  "w-full cursor-pointer rounded-control border border-hair-2 bg-card px-3 py-2.5 text-body text-ink focus:border-brand focus:outline-none";

/** After the code: wherever this email leads. */
export function useAuthNext() {
  const router = useRouter();
  const setAuthView = useWorkspaceStore((s) => s.setAuthView);
  return () => {
    const { email, inviteId, setRoute } = useAuthFlow.getState();
    const route = routeEmail(email, inviteId);
    setRoute(route);
    switch (route.path) {
      case "member":
        useSettingsStore.getState().signInAs(route.personId!);
        router.push("/");
        return;
      case "invite": setAuthView("details"); return;
      case "join": setAuthView("join"); return;
      case "pending": setAuthView("waiting"); return;
      case "new": setAuthView("organisation"); return;
      default: setAuthView("blocked");
    }
  };
}

/* ── New company: the organisation, before its first workspace ─────────── */

export function OrganisationScreen() {
  const setAuthView = useWorkspaceStore((s) => s.setAuthView);
  const email = useAuthFlow((s) => s.email);
  const domain = emailDomain(email);
  const guess = domain.split(".")[0].replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const [name, setName] = useState(guess || "");
  const [entity, setEntity] = useState(guess ? `${guess} Inc.` : "");
  const [region, setRegion] = useState<string>("United States");

  const next = () => {
    const s = useSettingsStore.getState();
    useSettingsStore.setState({
      orgName: name.trim(),
      legalEntity: entity.trim() || name.trim(),
      region,
      allowedDomains: [domain],
      /* Whoever sets the company up is its first organisation admin. */
      orgAdminIds: s.orgAdminIds.includes(s.currentUserId) ? s.orgAdminIds : [...s.orgAdminIds, s.currentUserId],
    });
    setAuthView("workspace");
  };

  return (
    <AuthStage
      eyebrow="Step 2 of 4 · Organisation"
      title="First, the company."
      accent="Then its brands."
      body={<>Your organisation is the company: its legal entity, who can sign up, and its admins. Brands and markets go in <b className="text-white">workspaces</b> inside it, each with its own team, libraries and credits.</>}
    >
      <AuthCardHead title="Set up your organisation">
        You&apos;ll be its admin, so you can add workspaces and people later.
      </AuthCardHead>
      <div className="grid gap-4">
        <Field label="Organisation name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Meridian Therapeutics" autoFocus />
        <Field label="Legal entity" value={entity} onChange={(e) => setEntity(e.target.value)} hint="Shown on invoices" />
        <label className="grid gap-1.5">
          <span className="text-label font-semibold text-ink-2">Headquarters region</span>
          <select value={region} onChange={(e) => setRegion(e.target.value)} className={SELECT}>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <div className="rounded-control border border-hair bg-subtle px-3 py-2.5 text-label leading-snug text-ink-3">
          Anyone with an <b className="text-ink">@{domain}</b> email can ask to join. You approve each request, and you can add more domains in Settings.
        </div>
        <AuthButton onClick={next} disabled={name.trim().length < 2}>Create organisation</AuthButton>
      </div>
    </AuthStage>
  );
}

/* ── Invited: the invite, then your details ────────────────────────────── */

function useInvite() {
  const inviteId = useAuthFlow((s) => s.inviteId ?? s.route.inviteId);
  const s = useSettingsStore();
  const found = inviteId ? findInvite(s, inviteId) : undefined;
  const inviter = found?.invite.invitedBy ? orgPeople(s).find((p) => p.id === found.invite.invitedBy) : orgPeople(s).find((p) => s.orgAdminIds.includes(p.id));
  return {
    found,
    inviterName: inviter?.name ?? "An admin",
    workspaceName: found ? workspaceNameOf(s, found.workspaceId) : "",
    orgName: s.orgName,
  };
}

/** The invite link's landing page: who, where, and as what. Verifying comes next. */
export function InviteScreen() {
  const setAuthView = useWorkspaceStore((s) => s.setAuthView);
  const { setEmail } = useAuthFlow();
  const { found, inviterName, workspaceName, orgName } = useInvite();

  if (!found) return <BlockedScreen />;
  const { invite } = found;
  const perms = PERMISSIONS.filter((p) => invite.permissions.includes(p.id)).map((p) => p.label);

  return (
    <AuthStage
      eyebrow="You're invited"
      title={`Join ${workspaceName}`}
      accent="on SwishX."
      body={`${inviterName} added you to ${orgName}'s ${workspaceName} workspace. Verify your email and you're in, with your role already set.`}
    >
      <AuthCardHead title={`Join ${workspaceName}`}>
        {inviterName} invited <b className="text-ink [overflow-wrap:anywhere]">{invite.email}</b>.
      </AuthCardHead>
      <dl className="mb-6 grid gap-2.5 rounded-control border border-hair bg-subtle p-3.5 text-body">
        <div className="flex justify-between gap-3"><dt className="text-ink-3">Organisation</dt><dd className="text-right font-semibold text-ink">{orgName}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-ink-3">Workspace</dt><dd className="text-right font-semibold text-ink">{workspaceName}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-ink-3">Role</dt><dd className="text-right font-semibold text-ink">{invite.role} · {invite.seniority}</dd></div>
        <div className="grid gap-1">
          <dt className="text-ink-3">You&apos;ll be able to</dt>
          <dd className="text-label text-ink-2">{perms.length ? perms.join(" · ") : "See published content"}</dd>
        </div>
      </dl>
      {invite.expired ? (
        <AuthButton onClick={() => { useAuthFlow.getState().setRoute({ path: "expired", inviteId: invite.id }); setAuthView("blocked"); }}>Continue</AuthButton>
      ) : (
        <AuthButton onClick={() => { setEmail(invite.email); setAuthView("otp"); }}>Accept and verify email</AuthButton>
      )}
      <AuthButton variant="secondary" onClick={() => setAuthView("signin")}>Not you? Sign in with another email</AuthButton>
    </AuthStage>
  );
}

/** Verified: your name, then straight in with the invited role. */
export function DetailsScreen() {
  const router = useRouter();
  const email = useAuthFlow((s) => s.email);
  const { found, workspaceName } = useInvite();
  const local = email.split("@")[0].split(/[._-]/).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
  const [name, setName] = useState(local);
  const [title, setTitle] = useState("");
  const [agreed, setAgreed] = useState(false);

  if (!found) return <BlockedScreen />;

  const join = () => {
    if (useSettingsStore.getState().acceptInvite(found.invite.id, name)) {
      useAuthFlow.getState().setInviteId(undefined);
      router.push("/");
    }
  };

  return (
    <AuthStage
      eyebrow="Almost in"
      title="Tell us"
      accent="who you are."
      body="Your name shows on what you make, comment on and approve. Your role and permissions were set by whoever invited you."
    >
      <AuthCardHead title="Your details">Joining {workspaceName} as {found.invite.role}.</AuthCardHead>
      <div className="grid gap-4">
        <Field label="Full name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <Field label="Job title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brand Manager" />
        <Field label="Work email" value={email} readOnly hint="Verified" />
        <label className="flex cursor-pointer items-start gap-2.5 text-label leading-snug text-ink-3">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 size-4 accent-brand" />
          <span>I agree to the <a href="#" className="font-semibold text-brand">Terms</a> and <a href="#" className="font-semibold text-brand">Privacy Notice</a>.</span>
        </label>
        <AuthButton onClick={join} disabled={name.trim().length < 2 || !agreed}>Join {workspaceName}</AuthButton>
      </div>
    </AuthStage>
  );
}

/* ── Colleague, not invited: ask to join, then wait ────────────────────── */

export function JoinScreen() {
  const setAuthView = useWorkspaceStore((s) => s.setAuthView);
  const email = useAuthFlow((s) => s.email);
  const s = useSettingsStore();
  const workspaces = listWorkspaces(s).filter((w) => !w.archived);
  const local = email.split("@")[0].split(/[._-]/).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
  const [workspaceId, setWorkspaceId] = useState(workspaces[0]?.id ?? "");
  const [name, setName] = useState(local);
  const [note, setNote] = useState("");

  const send = () => {
    s.requestToJoin(workspaceId, name, email, note);
    setAuthView("waiting");
  };

  return (
    <AuthStage
      eyebrow={`${s.orgName} is on SwishX`}
      title="Your team"
      accent="is already here."
      body={`People with an @${emailDomain(email)} email work in ${s.orgName}'s workspaces. Nobody has invited you yet, so ask the admins of the one you need. They choose your role when they approve.`}
    >
      <AuthCardHead title="Ask to join">Your request goes to that workspace&apos;s admins.</AuthCardHead>
      <div className="grid gap-4">
        <div>
          <AuthLabel>Workspace</AuthLabel>
          <div className="grid gap-2" role="radiogroup" aria-label="Workspace">
            {workspaces.map((w) => (
              <button
                key={w.id}
                type="button"
                role="radio"
                aria-checked={workspaceId === w.id}
                onClick={() => setWorkspaceId(w.id)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-control border px-3.5 py-2.5 text-left transition-colors",
                  workspaceId === w.id ? "border-brand bg-tint" : "border-hair-2 bg-card hover:border-ink-4"
                )}
              >
                <span className="text-body font-semibold text-ink">{w.name}</span>
                <span className="text-caption text-ink-4">{w.memberCount} people</span>
              </button>
            ))}
          </div>
        </div>
        <Field label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <Field multiline rows={2} label="Note to the admins (optional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="I'm joining the EU brand team as a medical writer." />
        <AuthButton onClick={send} disabled={!workspaceId || name.trim().length < 2}>Send request</AuthButton>
        <AuthButton variant="secondary" className="mt-0" onClick={() => setAuthView("signin")}>Use a different email</AuthButton>
      </div>
    </AuthStage>
  );
}

export function WaitingScreen() {
  const setAuthView = useWorkspaceStore((s) => s.setAuthView);
  const email = useAuthFlow((s) => s.email);
  const s = useSettingsStore();
  const all = [{ id: s.workspaceId, list: s.joinRequests }, ...Object.entries(s.stash).map(([id, w]) => ({ id, list: w.joinRequests }))];
  const where = all.find((w) => w.list.some((r) => r.email.toLowerCase() === email.toLowerCase()));
  const workspace = where ? workspaceNameOf(s, where.id) : "the workspace";

  return (
    <AuthStage eyebrow="Request sent" title="Sit tight." accent="An admin decides." body="Admins approve requests from Settings → Team, and choose your role as they do. You'll get an email the moment they do, and the same sign-in takes you straight in.">
      <div className="mb-5 grid size-12 place-items-center rounded-full bg-tint text-brand"><Clock className="size-6" /></div>
      <AuthCardHead title="Waiting for approval">
        We sent your request to the admins of <b className="text-ink">{workspace}</b>. We&apos;ll email <b className="text-ink [overflow-wrap:anywhere]">{email}</b> when it&apos;s approved.
      </AuthCardHead>
      <div className="mb-6 flex items-start gap-2 rounded-control border border-hair bg-subtle px-3 py-2.5 text-label leading-snug text-ink-3">
        <Check className="mt-0.5 size-3.5 shrink-0 text-ok" />
        Nothing else to do. Close this tab if you like.
      </div>
      <AuthButton variant="secondary" className="mt-0" onClick={() => setAuthView("signin")}>Back to sign in</AuthButton>
    </AuthStage>
  );
}

/* ── Can't get in ──────────────────────────────────────────────────────── */

export function BlockedScreen() {
  const setAuthView = useWorkspaceStore((s) => s.setAuthView);
  const { email, route, setEmail, setRoute } = useAuthFlow();
  const s = useSettingsStore();
  const found = route.inviteId ? findInvite(s, route.inviteId) : undefined;
  const [asked, setAsked] = useState(false);

  const content = (() => {
    if (route.path === "wrong-email" && found) {
      return {
        Icon: MailX,
        title: "This invite is for someone else",
        body: <>It was sent to <b className="text-ink">{found.invite.email}</b>, and you signed in as <b className="text-ink">{email}</b>. Sign in with the invited address, or ask for an invite to yours.</>,
        actions: (
          <>
            <AuthButton onClick={() => { setEmail(found.invite.email); setRoute({ path: "invite", inviteId: found.invite.id }); setAuthView("otp"); }}>Sign in as {found.invite.email.split("@")[0]}</AuthButton>
            <AuthButton variant="secondary" onClick={() => { useAuthFlow.getState().setInviteId(undefined); setAuthView("signin"); }}>Use a different email</AuthButton>
          </>
        ),
      };
    }
    if (route.path === "expired" && found) {
      return {
        Icon: Clock,
        title: "This invite has expired",
        body: <>Invite links last 14 days. The admins of <b className="text-ink">{workspaceNameOf(s, found.workspaceId)}</b> can send you a fresh one.</>,
        actions: asked ? (
          <div className="flex items-start gap-2 rounded-control border border-ok-line bg-ok-bg px-3 py-2.5 text-label text-ok"><Check className="mt-0.5 size-3.5 shrink-0" /> Asked. You&apos;ll get a new link by email.</div>
        ) : (
          <AuthButton onClick={() => setAsked(true)}>Ask for a new invite</AuthButton>
        ),
      };
    }
    /* An invite link whose invite is gone (revoked, or already used). */
    const inviteGone = route.path === "invite" || !!route.reason?.startsWith("This invite");
    return {
      Icon: inviteGone ? ShieldAlert : Lock,
      title: inviteGone ? "This invite isn't valid" : "You can't sign in right now",
      body: <>{inviteGone ? "This invite is no longer valid. It may have been revoked or already used." : route.reason ?? "Your access was removed."} Ask an admin in your company to add you again.</>,
      actions: <AuthButton variant="secondary" className="mt-0" onClick={() => { useAuthFlow.getState().setInviteId(undefined); setAuthView("signin"); }}>Back to sign in</AuthButton>,
    };
  })();

  const { Icon } = content;
  return (
    <AuthStage eyebrow="Access" title="Not quite" accent="yet." body="Access to SwishX comes from your company's admins: by invite, or by approving a request to join.">
      <div className="mb-5 grid size-12 place-items-center rounded-full bg-warn-bg text-warn"><Icon className="size-6" /></div>
      <AuthCardHead title={content.title}>{content.body}</AuthCardHead>
      {content.actions}
    </AuthStage>
  );
}

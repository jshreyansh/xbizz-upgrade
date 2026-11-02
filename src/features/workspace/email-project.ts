"use client";

import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { useBrandName } from "@/features/workspace/brand-catalogue";
import { DOSSIERS } from "@/features/workspace/brand-modal-data";
import { brandAdFacts } from "@/features/workspace/ad-options";
import { useProjectIndication } from "@/features/workspace/indication-rows";
import { useEmailStore } from "@/features/workspace/email-store";
import { EMAIL_PURPOSES, approvedLinks, ctaLink, emailBlocks, emailLinks, emailTemplates, isProfessional, libraryPieces, senderInfo, sourceBlocks } from "@/features/workspace/email-options";

/** The parts of an email, top to bottom. Inserted images and links are "m:" + their id. */
export type EmailZone = "header" | "greeting" | "note" | "opening" | "blocks" | "piece" | "cta" | "signoff" | "isi" | "footer";
export type ZoneType = "lock" | "auto" | "choose" | "type";

export const ZONE_NAME: Record<EmailZone, string> = {
  header: "Header",
  greeting: "Greeting",
  note: "Personal note",
  opening: "Opening and indication",
  blocks: "Content blocks",
  piece: "Documents",
  cta: "Call to action",
  signoff: "Sign-off",
  isi: "Important Safety Information",
  footer: "Footer",
};

export const ZONE_TYPE_LABEL: Record<ZoneType, string> = { lock: "Locked", auto: "Filled in", choose: "Sender chooses", type: "Sender types" };

/**
 * The email as the start step, the plan and the editor left it, with
 * everything derived from those answers worked out once.
 */
export function useEmailProject() {
  const dossierId = useWorkspaceStore((s) => s.sourcePayload.dossierId) ?? "";
  const projectName = useWorkspaceStore((s) => s.projectName);
  const brandName = useBrandName(dossierId) || "Onkavia";
  const brandId = DOSSIERS[dossierId]?.brandId ?? dossierId;
  const indication = useProjectIndication();
  const lead = indication.only ?? indication.picked[0] ?? indication.options[0];
  const condition = lead?.condition ?? "the indication";
  const email = useEmailStore();
  const purpose = EMAIL_PURPOSES[email.purpose];
  const audience = email.audience;
  const professional = isProfessional(audience);
  const unbranded = !!purpose.unbranded;
  const sender = senderInfo(email.sender, audience);
  const isHQ = email.sender === "hq";
  const library = libraryPieces(brandName, audience);
  const pieces = library.filter((p) => p.linkable);
  const startPiece = unbranded ? undefined : pieces.find((p) => p.id === email.startPiece);
  /* The dossier's blocks, then one from the piece it's built from and one per file the user added. */
  const blocks = [
    ...emailBlocks(brandId, brandName, email.sender, audience, condition, email.purpose).map((b) => ({ ...b, group: "dossier" as const })),
    ...sourceBlocks(startPiece, email.files),
  ];
  const included = blocks.filter((b) => !email.offBlocks.includes(b.id));
  /* The piece it is built from comes first: it is the one a lone attachment shows. */
  const attachedPieces = unbranded ? [] : pieces.filter((p) => email.attached.includes(p.id)).sort((a, b) => Number(b.id === startPiece?.id) - Number(a.id === startPiece?.id));
  const templates = emailTemplates(brandName, audience, condition);
  const template = templates.find((t) => t.id === email.template);
  const showNote = !isHQ && email.repEdit.note;
  const links = approvedLinks(brandName, audience, condition);
  const cta = ctaLink(email.purpose, email.cta[email.purpose], email.customLink, links);
  const allLinks = emailLinks(cta, email.media, attachedPieces, audience, unbranded);
  const subjects = purpose.subjects(brandName, condition);

  const zoneType = (id: string): ZoneType => {
    if (id === "greeting" || id === "footer") return "auto";
    if (id === "signoff") return isHQ ? "lock" : "auto";
    if (id === "note") return "type";
    if (id === "blocks") return isHQ || !email.repEdit.blocks ? "lock" : "choose";
    if (id === "piece") return isHQ || !email.repEdit.piece || attachedPieces.length < 2 ? "lock" : "choose";
    return "lock";
  };

  /* The parts this email has, in order. */
  const zones: string[] = [
    "header",
    "greeting",
    ...(showNote ? ["note"] : []),
    "opening",
    "blocks",
    ...email.media.map((m) => `m:${m.uid}`),
    ...(attachedPieces.length ? ["piece"] : []),
    "cta",
    "signoff",
    ...(unbranded ? [] : ["isi"]),
    "footer",
  ];

  return {
    email,
    brandName,
    brandId,
    condition,
    wording: lead?.wording,
    boxedWarning: brandAdFacts(brandId).boxedWarning,
    purpose,
    audience,
    professional,
    unbranded,
    sender,
    isHQ,
    blocks,
    included,
    /** Every library piece for this audience, linkable or not, for the picker. */
    library,
    pieces,
    startPiece,
    attachedPieces,
    templates,
    template,
    showNote,
    cta,
    /** The audience's approved pages, for the button and the link picker. */
    approved: links,
    links: allLinks,
    subjects,
    subject: subjects[email.subjects[0] ?? 0],
    zoneType,
    zones,
    title: projectName || `${unbranded ? condition[0].toUpperCase() + condition.slice(1) : brandName} · ${purpose.label} email`,
    /** Every claim the email shows: its blocks and anything inserted with a claim on it. */
    claimIds: [...new Set([...included.filter((b) => !b.newClaim).map((b) => b.claimId), ...email.media.flatMap((m) => m.claims)])],
  };
}

export type EmailProject = ReturnType<typeof useEmailProject>;

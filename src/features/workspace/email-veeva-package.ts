"use client";

import { makeZip, zipBytes, type ZipEntry } from "@/lib/zip";
import { getBlockRule, type EmailBlock } from "@/features/workspace/email-options";
import type { EmailProject } from "@/features/workspace/email-project";

/**
 * What a marketer uploads into Veeva PromoMats by hand, built from the email.
 *
 * PromoMats does not take "an email". It takes documents — an Email Template,
 * a Template Fragment for the safety footer, one Email Fragment per block a
 * rep can choose — each with an HTML source file, an assets ZIP, its fields
 * (the "metadata": product, country, language, subject, sender, consent,
 * expiry…) and its relationships to approved PI, ISI and pieces. There is no
 * integration yet, so this is the package and a sheet of every value to type
 * in, plus a Vault Loader CSV for teams that load in bulk.
 *
 * Field API names are the ones Veeva documents for the Email Template type
 * (subject__v, from_address__v…); a customer's Vault can add or rename
 * fields, which the README says.
 */

export interface VeevaField {
  label: string;
  api: string;
  value: string;
  required: boolean;
}

/**
 * What each PromoMats field does once Vault CRM syncs the document. The
 * integration maps fields of the same name by default; the API names given
 * here are the ones Veeva documents.
 */
const IN_CRM: Record<string, string> = {
  file: "The email body reps send",
  assets__v: "Images, hosted by Vault",
  product__v: "Matched to the CRM product by its External ID",
  country__v: "Needs a Vault country abbreviation, or the sync fails",
  language__v: "Language of the email in the rep's library",
  expiration_date__v: "Expired in CRM on the next sync after this date",
  subject__v: "Subject line of the sent email (255 characters at most)",
  from_address__v: "From address of the sent email",
  from_name__v: "From name of the sent email",
  reply_to_address__v: "Where replies go; the From Address if blank",
  reply_to_name__v: "Name replies go to",
  check_consent__v: "check_consent__v: Yes, No or Default",
  email_template_type__v: "Blank means a standard template",
  restrict_fragments_by_product__v: "Reps only see fragments for the same product",
  crm_hidden__v: "hidden__v: hides it from the rep's library",
  key_message__v: "Key message recorded on the sent-email activity",
};

/** Where in PromoMats the value goes. */
const WHERE: Record<string, string> = { file: "Upload: choose file", assets__v: "Assets field" };
const whereFor = (api: string) => WHERE[api] ?? "Doc Info";

export interface VeevaDocument {
  /** Stable key for the relationships sheet. */
  key: string;
  name: string;
  number: string;
  type: "Email Template" | "Template Fragment" | "Email Fragment";
  file: string;
  assets?: string;
  fields: VeevaField[];
}

export interface VeevaRelationship {
  source: string;
  type: "Related PI" | "Related ISI" | "Related Pieces" | "Related Email Fragments" | "Other Related Documents";
  target: string;
  targetNumber: string;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const csvCell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
/* With a BOM, so Excel reads it as UTF-8 (®, →). Vault Loader accepts it too. */
const csv = (rows: string[][]) => "\uFEFF" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";

const MONTHS: Record<string, string> = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
/** "14 Nov 2026" → "2026-11-14", the date format Vault Loader reads. */
const isoDate = (d: string | undefined, fallback: string) => {
  const m = d?.match(/^(\d{1,2}) (\w{3}) (\d{4})$/);
  return m && MONTHS[m[2]] ? `${m[3]}-${MONTHS[m[2]]}-${m[1].padStart(2, "0")}` : fallback;
};

const FONT = "font-family: Arial, Helvetica, sans-serif;";
const VIOLET = "#5b21b6";

/** The text after the stat, when the text leads with the same number. */
const bodyText = (b: EmailBlock) => (b.stat && b.text.startsWith(b.stat) ? b.text.slice(b.stat.length).trim() : b.text);

function blockHtml(b: EmailBlock, n: number, repNote = false) {
  const stat = b.stat ? `<div style="${FONT} font-size: 34px; font-weight: bold; color: ${VIOLET}; line-height: 1.1;">${esc(b.stat)}</div>` : "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #e5e7eb;">
  <tr><td style="padding: 16px 0; ${FONT}">
    <div style="font-size: 11px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; color: ${VIOLET};">${esc(b.title)}</div>
    ${stat}
    <div style="font-size: 15px; line-height: 1.5; color: #374151;">${esc(b.stat ? bodyText(b) : b.text)}<sup>${n}</sup></div>${repNote ? `
    <div style="font-size: 14px; line-height: 1.5; color: #374151; font-style: italic;">{{customText(255)}}</div>` : ""}
  </td></tr>
</table>`;
}

export function veevaPackage(p: EmailProject) {
  const brd = p.brandName.slice(0, 3).toUpperCase();
  const job = (n: number) => `US-${brd}-2611-${String(42 + n).padStart(4, "0")}`;
  const yearOn = "2027-11-02";
  const rules = (b: EmailBlock) => getBlockRule(p.email.blockRules, b.id);
  /* Fixed content is part of the template; what a rep may leave out becomes a fragment. */
  const fixed = p.isHQ ? p.included : p.included.filter((b) => rules(b).mandatory);
  const optional = p.isHQ ? [] : p.included.filter((b) => !rules(b).mandatory);
  const subjects = p.email.subjects.map((i) => p.subjects[i]).filter(Boolean);
  const subjectField =
    p.email.subjectMode === "choice" && subjects.length > 1 ? `{{customText[${subjects.map((s) => s.replace(/[|"']/g, "")).join("|")}]}}` : p.subject;
  const productId = `${brd}-001`;
  /* A document expires when the first claim fixed in it does. */
  const templateExpiry = fixed.map((b) => isoDate(b.expires, yearOn)).sort()[0] ?? yearOn;
  const hero = p.professional ? "hcp-clinic.jpg" : "patient-support.jpg";

  const common = (expiry: string) => [
    { label: "Product", api: "product__v", value: p.brandName, required: true },
    { label: "Country", api: "country__v", value: "United States", required: true },
    { label: "Language", api: "language__v", value: "English", required: true },
    { label: "Expiration Date", api: "expiration_date__v", value: expiry, required: false },
  ];

  /* ── Documents ── */
  const template: VeevaDocument = {
    key: "template",
    name: `${p.brandName} ${p.purpose.label} Email Template`,
    number: job(0),
    type: "Email Template",
    file: "template/email-template.html",
    assets: "template/assets.zip",
    fields: [
      ...common(templateExpiry),
      { label: "Subject", api: "subject__v", value: subjectField, required: true },
      { label: "From Address", api: "from_address__v", value: p.sender.address, required: true },
      { label: "From Name", api: "from_name__v", value: p.isHQ ? `${p.brandName} team` : "{{userName}}", required: false },
      { label: "Reply To Address", api: "reply_to_address__v", value: p.isHQ ? p.sender.address : "{{userEmailAddress}}", required: false },
      { label: "Reply To Name", api: "reply_to_name__v", value: p.isHQ ? `${p.brandName} team` : "{{userName}}", required: false },
      { label: "Check Consent", api: "check_consent__v", value: "Yes", required: false },
      { label: "Email Template Type", api: "email_template_type__v", value: "", required: false },
      { label: "Restrict Fragments by Product", api: "restrict_fragments_by_product__v", value: "Yes", required: false },
      { label: "Hide from CRM Library", api: "crm_hidden__v", value: "No", required: false },
      { label: "Key Message", api: "key_message__v", value: p.included[0]?.title ?? "", required: false },
    ],
  };
  const footer: VeevaDocument | null = p.unbranded
    ? null
    : {
        key: "isi-footer",
        name: `${p.brandName} ISI Footer (HCP email)`,
        number: job(1),
        type: "Template Fragment",
        file: "template-fragment/isi-footer.html",
        fields: common(yearOn),
      };
  const fragments: VeevaDocument[] = optional.map((b, i) => ({
    key: `fragment-${i + 1}`,
    name: `${p.brandName} Email Fragment: ${b.title}`,
    number: job(2 + i),
    type: "Email Fragment",
    file: `fragments/${String(i + 1).padStart(2, "0")}-${slug(b.title)}.html`,
    fields: [...common(isoDate(b.expires, yearOn)), { label: "Key Message", api: "key_message__v", value: b.title, required: false }],
  }));
  const documents = [template, ...(footer ? [footer] : []), ...fragments];

  /* ── Relationships to what is already approved in PromoMats ── */
  const relationships: VeevaRelationship[] = [
    ...(p.unbranded
      ? []
      : ([
          { source: template.number, type: "Related PI", target: `${p.brandName} Prescribing Information`, targetNumber: `US-${brd}-2601-0003` },
          { source: template.number, type: "Related ISI", target: `${p.brandName} Important Safety Information`, targetNumber: `US-${brd}-2601-0004` },
        ] as VeevaRelationship[])),
    ...p.attachedPieces.map(
      (pc, i): VeevaRelationship => ({ source: template.number, type: i === 0 ? "Related Pieces" : "Other Related Documents", target: pc.title, targetNumber: `US-${brd}-2609-${String(30 + i).padStart(4, "0")}` })
    ),
    ...fragments.map((f): VeevaRelationship => ({ source: template.number, type: "Related Email Fragments", target: f.name, targetNumber: f.number })),
    ...fragments.flatMap((f) => (p.unbranded ? [] : [{ source: f.number, type: "Related ISI" as const, target: `${p.brandName} Important Safety Information`, targetNumber: `US-${brd}-2601-0004` }])),
  ];

  /* ── HTML ── */
  const pieceLinks = p.attachedPieces
    .map(
      (pc, i) =>
        `<tr><td style="padding: 6px 0; ${FONT} font-size: 14px;"><a href="${i === 0 ? "{{PieceLink}}" : `{{$${4180 + i}}}`}" style="color: ${VIOLET}; font-weight: bold;">${esc(pc.title)} ›</a></td></tr>`
    )
    .join("\n");
  const templateHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(p.subject)}</title>
</head>
<body style="margin: 0; padding: 0; background: #f3f4f6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f3f4f6;">
<tr><td align="center" style="padding: 24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width: 600px; background: #ffffff;">
  <tr><td style="padding: 10px 28px; ${FONT} font-size: 11px; color: #6b7280;">${p.professional ? "For US healthcare professionals only" : "Information for patients"}</td></tr>
  <tr><td style="padding: 14px 28px; border-bottom: 1px solid #e5e7eb; ${FONT}">
    <span style="font-size: 22px; font-weight: bold; color: #111827;">${esc(p.brandName)}&reg;</span>
    <span style="float: right; font-size: 11px;"><a href="{{PILink}}" style="color: ${VIOLET};">Prescribing Information</a> &nbsp; <a href="{{ISILink}}" style="color: ${VIOLET};">Important Safety Information</a></span>
  </td></tr>
  <tr><td><img src="assets/hero.jpg" width="600" alt="${esc(p.professional ? "A specialist talking with a patient in clinic" : "A nurse talking with a patient")}" style="display: block; width: 600px; height: auto;"></td></tr>
  <tr><td style="padding: 22px 28px 6px; ${FONT} font-size: 24px; font-weight: bold; color: #111827;">${esc(p.subject)}</td></tr>
  <tr><td style="padding: 6px 28px; ${FONT} font-size: 15px; color: #374151;">${p.professional ? "Dear {{accTitle}} {{accLname}}," : "Hi {{accFname}},"}</td></tr>
${p.showNote ? `  <tr><td style="padding: 6px 28px; ${FONT} font-size: 15px; color: #374151;">{{customText(255)}}</td></tr>\n` : ""}  <tr><td style="padding: 6px 28px; ${FONT} font-size: 15px; color: #374151;">${esc(p.purpose.opening(p.brandName, p.condition))}</td></tr>
${p.professional && p.wording ? `  <tr><td style="padding: 6px 28px; ${FONT} font-size: 13px; color: #374151;"><b>INDICATION:</b> ${esc(p.wording)}</td></tr>\n` : ""}  <tr><td style="padding: 0 28px;">
${fixed.map((b, i) => blockHtml(b, i + 1, rules(b).editable)).join("\n")}
  </td></tr>
${optional.length ? `  <tr><td style="padding: 0 28px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">{{insertEmailFragments[1,${optional.length}]}}</table>
  </td></tr>\n` : ""}${pieceLinks ? `  <tr><td style="padding: 8px 28px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${pieceLinks}</table></td></tr>\n` : ""}  <tr><td align="center" style="padding: 18px 28px;">
    <a href="${esc(p.cta.status === "missing" ? "https://[ADD THE PAGE THIS BUTTON OPENS]" : p.cta.dest)}" style="display: inline-block; background: ${VIOLET}; color: #ffffff; ${FONT} font-size: 15px; font-weight: bold; text-decoration: none; padding: 12px 26px; border-radius: 4px;">${esc(p.ctaText)}</a>
  </td></tr>
  <tr><td style="padding: 14px 28px; border-top: 1px solid #e5e7eb; ${FONT} font-size: 14px; color: #374151;">${p.isHQ ? `The ${esc(p.brandName)} team` : "{{userName}}<br>{{userEmailAddress}}"}</td></tr>
${footer ? "  <tr><td>{{emailTemplateFragment}}</td></tr>\n" : ""}  <tr><td style="padding: 16px 28px; background: #111827; ${FONT} font-size: 11px; line-height: 1.5; color: #d1d5db;">
    ${esc(p.brandName)} is a registered trademark of Corvane Pharma US. &copy; 2026 Corvane Pharma US, 200 W Madison St, Chicago, IL 60606.<br>
    <a href="{{unsubscribe_product_link}}" style="color: #d1d5db;">Unsubscribe</a> &middot; ${job(0)} &middot; 11/26
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>
`;
  const footerHtml = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f9fafb; border-top: 3px solid ${VIOLET};">
  <tr><td style="padding: 18px 28px; ${FONT} font-size: 12px; line-height: 1.5; color: #374151;">
    ${p.professional && p.wording ? `<b>INDICATION</b><br>${esc(p.wording)}<br><br>` : ""}<b>IMPORTANT SAFETY INFORMATION</b><br>
    ${p.boxedWarning ? "<b>WARNING: SERIOUS INFECTIONS, MORTALITY, MALIGNANCY, MAJOR ADVERSE CARDIOVASCULAR EVENTS AND THROMBOSIS.</b> Serious infections leading to hospitalization or death have occurred.<br>" : ""}
    Serious infections that may lead to hospitalization or death have been reported. Check blood counts before starting and during treatment.<br>
    Please see <a href="{{PILink}}" style="color: ${VIOLET};">full Prescribing Information</a>${p.boxedWarning ? ", including Boxed Warning," : ""} and <a href="{{ISILink}}" style="color: ${VIOLET};">Important Safety Information</a>.
  </td></tr>
</table>
`;
  const fragmentHtml = (b: EmailBlock, n: number) => `<tr><td>
${blockHtml(b, n, rules(b).editable)}
</td></tr>
`;

  /* ── Sheets ── */
  const metadataSheet = csv([
    ["Document number", "Document name", "Veeva document type", "Field", "Field API name", "Value", "Required", "Where to set it", "What it does in Vault CRM"],
    ...documents.flatMap((d) => [
      [d.number, d.name, d.type, "Source file", "file", d.file, "Yes", whereFor("file"), IN_CRM.file],
      ...(d.assets ? [[d.number, d.name, d.type, "Assets", "assets__v", d.assets, "No", whereFor("assets__v"), IN_CRM.assets__v]] : []),
      ...d.fields.map((f) => [d.number, d.name, d.type, f.label, f.api, f.value || "(leave blank)", f.required ? "Yes" : "No", whereFor(f.api), IN_CRM[f.api] ?? ""]),
    ]),
  ]);
  const fieldCols = ["product__v", "country__v", "language__v", "expiration_date__v", "subject__v", "from_address__v", "from_name__v", "reply_to_address__v", "reply_to_name__v", "check_consent__v", "email_template_type__v", "restrict_fragments_by_product__v", "crm_hidden__v", "key_message__v"];
  /* external_id__v carries SwishX's number; Vault assigns its own document number. */
  const loaderDocuments = csv([
    ["file", "name__v", "type__v", "lifecycle__v", "external_id__v", ...fieldCols],
    ...documents.map((d) => [d.file, d.name, d.type, "Approved Email", d.number, ...fieldCols.map((api) => d.fields.find((x) => x.api === api)?.value ?? "")]),
  ]);
  /* Vault Loader creates custom relationship types only, so these are added by hand. */
  const relationshipSheet = csv([
    ["From document", "From document name", "Relationship", "To document", "To document name", "Add it in"],
    ...relationships.map((r) => [r.source, documents.find((d) => d.number === r.source)?.name ?? "", r.type, r.targetNumber, r.target, "The From document's Relationships panel"]),
  ]);
  const fragmentOf = (b: EmailBlock) => fragments[optional.indexOf(b)];
  const contentRules = csv([
    ["Block", "Lives in", "Veeva document", "Rep can leave it out", "Rep can add a note", "Claim", "Expires", "How Veeva enforces it"],
    ...p.included.map((b) => {
      const f = optional.includes(b) ? fragmentOf(b) : undefined;
      const r = rules(b);
      return [
        b.title,
        f ? "Email Fragment" : "Email Template",
        f ? f.number : template.number,
        f ? "Yes" : "No",
        r.editable ? "Yes, up to 255 characters" : "No",
        b.claimId,
        f ? isoDate(b.expires, yearOn) : templateExpiry,
        [f ? "Listed in Related Email Fragments; rep picks it" : "Fixed in the template HTML", r.editable ? "{{customText(255)}} in the block" : "Text locked"].join("; "),
      ];
    }),
    ["Fragments a rep must pick", "Email Template", template.number, "", "", "", "", optional.length ? `{{insertEmailFragments[1,${optional.length}]}}` : "No fragments: the email goes as approved"],
    ["Subject line", "Email Template", template.number, "", "", "", "", subjects.length > 1 && p.email.subjectMode === "choice" ? `Rep picks one of ${subjects.length}: {{customText[…]}} in Subject` : "Fixed subject"],
    ["Personal note", "Email Template", template.number, "", p.showNote ? "Yes, up to 255 characters" : "No", "", "", p.showNote ? "{{customText(255)}} under the greeting" : "None"],
    ["Consent", "Email Template", template.number, "", "", "", "", "Check Consent = Yes: only HCPs who opted in for the product receive it"],
    ["Safety information", footer ? "Template Fragment" : "None", footer?.number ?? "", "No", "No", "", "", footer ? "{{emailTemplateFragment}}; cannot be removed" : "Unbranded: no ISI"],
  ]);
  const claimsSheet = csv([
    ["#", "Claim", "Block", "Text in the email", "Source", "Veeva document", "Expires"],
    ...p.included.map((b, i) => [String(i + 1), b.claimId, b.title, b.stat ? `${b.stat} ${bodyText(b)}` : b.text, b.source, optional.includes(b) ? fragmentOf(b).number : template.number, isoDate(b.expires, yearOn)]),
  ]);
  const linkSheet = csv([
    ["Where", "Label", "Goes to", "Tracking"],
    ["Button", p.ctaText, p.cta.dest, "{{AppDocId}} per your Vault setup"],
    ...p.attachedPieces.map((pc, i) => ["Document card", pc.title, i === 0 ? "{{PieceLink}}" : `{{$${4180 + i}}}`, "Tracked by Vault"]),
    ...(p.unbranded ? [] : [["Header and footer", "Prescribing Information", "{{PILink}}", "Tracked by Vault"], ["Header and footer", "Important Safety Information", "{{ISILink}}", "Tracked by Vault"]]),
    ["Footer", "Unsubscribe", "{{unsubscribe_product_link}}", "Recorded as product opt-out"],
  ]);

  const inside: Array<[string, string]> = [
    [template.file, "Email Template source file"],
    ["template/assets.zip", "Images for the template (add under the Assets field)"],
    ...(footer ? [[footer.file, "Template Fragment: the ISI footer"] as [string, string]] : []),
    ...fragments.map((f, i): [string, string] => [f.file, `Email Fragment: ${optional[i].title}`]),
    ["metadata-sheet.csv", "Every field value to enter, per document, and its Vault CRM field"],
    ["content-rules.csv", "What's locked, what a rep can pick, leave out or annotate"],
    ["claims-references.csv", "Every claim in the email, its source and where it sits"],
    ["relationships.csv", "Related PI, ISI, pieces and fragments, to add on each document"],
    ["vault-loader/documents.csv", "The same fields, as a Vault Loader CSV"],
    ["links.csv", "Every link and how it is tracked"],
    ["preview/preview.html", "The email with sample values, for reviewers"],
  ];
  const width = Math.max(...inside.map(([f]) => f.length)) + 3;
  const contentsList = inside.map(([f, what]) => `  ${f.padEnd(width)}${what}`).join("\n");
  const readme = `${p.brandName} · ${p.purpose.label} email — Veeva PromoMats package
Prepared by SwishX · ${job(0)} · ${new Date().toLocaleDateString("en-CA")}

WHAT'S INSIDE
${contentsList}

UPLOADING BY HAND (Vault PromoMats)
  1. Create > Upload. Choose ${template.file}; set the document type to Email Template.
  2. Fill the fields from metadata-sheet.csv. Product, Country, Language, Subject and From Address are required.
  3. Under Assets, upload template/assets.zip.
${footer ? "  4. Upload the ISI footer as a Template Fragment with the same Product, Country and Language.\n" : ""}  ${footer ? "5" : "4"}. Upload each file in fragments/ as an Email Fragment: one product each, with its Expiration Date.
  ${footer ? "6" : "5"}. Add the relationships in relationships.csv: Related PI, Related ISI, Related Pieces and
     Related Email Fragments. The PI, ISI and pieces must already be approved in PromoMats.
  ${footer ? "7" : "6"}. Start your MLR review workflow. After approval, move the documents to Staged to test-send, then Approved.

BULK LOADING (Vault Loader)
  Upload the files to file staging, then load vault-loader/documents.csv as Documents > Create.
  Product, Country and Language are object references: Loader may need their Vault record IDs in place of names.
  Vault Loader creates custom relationship types only, so add the relationships by hand afterwards.

NOTES
  • Field API names are Veeva's standard ones for Approved Email. Your Vault may add or rename fields: check with your Vault admin.
    Veeva's 18R1 notes spell one restrict_fargments_by_product__v; use whichever your Vault shows.
  • The PromoMats product needs an External ID matching the Vault CRM product (${productId} here), or the email won't sync.
  • The Country needs a Vault country abbreviation, or the sync to Vault CRM fails.
  • Every linked document (PI, ISI, pieces, fragments) must be Approved, or sends fail.
  • Tokens in the HTML are Veeva Approved Email tokens; Vault and CRM fill them when a rep sends.
  • US-VEL-… numbers are SwishX's (external_id__v). Vault assigns its own document numbers on upload.
`;

  const previewHtml = templateHtml
    .replace("assets/hero.jpg", "hero.jpg")
    .replace(/\{\{accTitle\}\} \{\{accLname\}\}/g, "Dr. Okafor")
    .replace(/\{\{accFname\}\}/g, "Jordan")
    .replace(/\{\{customText\(255\)\}\}/g, esc(p.sender.sampleNote))
    .replace(/\{\{userName\}\}/g, esc(p.sender.signoff[0]))
    .replace(/\{\{userEmailAddress\}\}/g, esc(p.sender.address))
    .replace(/\{\{insertEmailFragments\[[^\]]*\]\}\}/g, optional.map((b, i) => fragmentHtml(b, fixed.length + i + 1)).join(""))
    .replace("<tr><td>{{emailTemplateFragment}}</td></tr>", `<tr><td>${footerHtml}</td></tr>`);

  return {
    documents,
    relationships,
    metadataSheet,
    fileName: `${job(0)}_${slug(p.brandName)}-${slug(p.purpose.label)}_veeva-package.zip`,
    metadataFileName: `${job(0)}_metadata-sheet.csv`,
    /** The whole package as a ZIP, with the hero image fetched from the app. */
    async zip(): Promise<Blob> {
      const image = new Uint8Array(await (await fetch(`/email/${hero}`)).arrayBuffer());
      const entries: ZipEntry[] = [
        { path: "README.txt", data: readme },
        { path: template.file, data: templateHtml },
        { path: "template/assets.zip", data: await zipBytes([{ path: "hero.jpg", data: image }]) },
        ...(footer ? [{ path: footer.file, data: footerHtml }] : []),
        ...fragments.map((f, i) => ({ path: f.file, data: fragmentHtml(optional[i], fixed.length + i + 1) })),
        { path: "metadata-sheet.csv", data: metadataSheet },
        { path: "content-rules.csv", data: contentRules },
        { path: "claims-references.csv", data: claimsSheet },
        { path: "relationships.csv", data: relationshipSheet },
        { path: "vault-loader/documents.csv", data: loaderDocuments },
        { path: "links.csv", data: linkSheet },
        { path: "preview/preview.html", data: previewHtml },
        { path: "preview/hero.jpg", data: image },
      ];
      return makeZip(entries);
    },
  };
}

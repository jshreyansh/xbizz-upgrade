"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, Upload, Link2, HelpCircle, Package, FolderOpen, Film, FileText } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Segmented, SegmentedButton } from "@/components/patterns/segmented";
import { cn } from "@/lib/cn";
import { useProductLibraryStore } from "@/features/product-library/product-library-store";
import { MediaPickerModal, brandImageItems, workspaceMediaItems, type MediaItem } from "@/features/workspace/insert-pickers";
import { SAMPLE_UPLOADS, linkTag, platformMedia, type EmailAudience, type EmailBlock, type EmailMedia } from "@/features/workspace/email-options";

const uid = () => `m${Date.now()}${Math.round(Math.random() * 1000)}`;

/**
 * What the platform already holds, as media-picker tiles: the drug's images,
 * the workspace's, and the brand's approved videos and documents. Anything
 * picked here is already approved, so nothing new goes to MLR.
 */
export function useEmailLibrary(brandName: string, audience: EmailAudience) {
  const products = useProductLibraryStore((s) => s.products);
  const product = products.find((p) => p.name.toLowerCase() === brandName.toLowerCase());
  const platform = platformMedia(brandName, audience);
  const tile = (m: EmailMedia): MediaItem => ({
    id: m.uid,
    name: m.title,
    note: `${m.src} · Approved ${m.code}`,
    source: { kind: "Project", name: m.src, id: m.code },
    visual: <div className="absolute inset-0" style={{ background: m.gradient }} />,
  });
  const fromImage = (item: MediaItem): EmailMedia => ({
    uid: uid(),
    kind: "image",
    from: "platform",
    title: item.name,
    src: `${item.source.kind} · ${item.source.name}`,
    gradient: "",
    visual: item.visual,
    alt: `${item.name}${item.note ? `, ${item.note}` : ""}.`,
    claims: [],
    newClaims: [],
    code: item.source.id,
  });
  return {
    brandImages: product ? brandImageItems(product) : [],
    workspaceImages: workspaceMediaItems(products, brandName),
    videos: platform.filter((m) => m.kind === "video").map(tile),
    documents: platform.filter((m) => m.kind === "doc").map(tile),
    /** The picked tile, as a part of the email. */
    toMedia(item: MediaItem): EmailMedia {
      const known = platform.find((m) => m.uid === item.id);
      return known ? { ...known, uid: uid() } : fromImage(item);
    },
  };
}

export type EmailInsertRequest = "brand-images" | "workspace-images" | "upload-image" | "videos" | "upload-video" | "url" | "documents" | "upload-doc";

/** A toolbar Insert option, as the dialog it opens. Options email has no use for map to nothing. */
export function insertRequestFor(option: string): EmailInsertRequest | null {
  const map: Record<string, EmailInsertRequest> = {
    "Brand images library": "brand-images",
    "Workspace media library": "workspace-images",
    Upload: "upload-image",
    "Video library": "videos",
    "Upload video": "upload-video",
    "Paste a URL": "url",
    Document: "documents",
    "Upload document": "upload-doc",
  };
  return map[option] ?? null;
}

/** Whichever insert dialog is open: a library, an upload or a link. */
export function EmailInsertDialogs({
  request,
  brandName,
  audience,
  lead,
  onInsert,
  onClose,
}: {
  request: EmailInsertRequest | null;
  brandName: string;
  audience: EmailAudience;
  lead?: EmailBlock;
  onInsert: (media: EmailMedia) => void;
  onClose: () => void;
}) {
  const library = useEmailLibrary(brandName, audience);
  if (!request) return null;
  const picker = (title: string, sub: string, icon: typeof Upload, items: MediaItem[], empty: string, noun = "image") => (
    <MediaPickerModal icon={icon} title={title} sub={sub} items={items} empty={empty} noun={noun} onClose={onClose} onUse={(item) => onInsert(library.toMedia(item))} />
  );
  switch (request) {
    case "brand-images":
      return picker(`Brand images library · ${brandName}`, `Images attached to ${brandName} in the Product Library. Already approved.`, Package, library.brandImages, `No images are attached to ${brandName} yet.`);
    case "workspace-images":
      return picker("Workspace media library", "Images used across the workspace, each with the drug or project it came from.", FolderOpen, library.workspaceImages, "No images in the workspace yet.");
    case "videos":
      return picker(`Video library · ${brandName}`, "Approved videos. Each goes out as a thumbnail that opens the video.", Film, library.videos, `No approved videos for ${brandName} yet.`, "video");
    case "documents":
      return picker(`Documents · ${brandName}`, "Approved leave-behinds and detail aids. Linked, never attached.", FileText, library.documents, `No approved documents for ${brandName} yet.`, "document");
    case "upload-image":
      return <EmailUploadModal kind="image" lead={lead} onInsert={onInsert} onClose={onClose} />;
    case "upload-video":
      return <EmailUploadModal kind="video" lead={lead} onInsert={onInsert} onClose={onClose} />;
    case "upload-doc":
      return <EmailUploadModal kind="doc" lead={lead} onInsert={onInsert} onClose={onClose} />;
    case "url":
      return <EmailLinkModal onInsert={onInsert} onClose={onClose} />;
  }
}

function Check({ ok, children, action }: { ok: boolean | "ask"; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className={cn("flex items-start gap-2.5 rounded-control border p-2.5 text-body text-ink-2", ok === true ? "border-hair bg-card" : ok === "ask" ? "border-hair-2 bg-subtle" : "border-warn-line bg-warn-bg")}>
      {ok === true ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-ok" /> : ok === "ask" ? <HelpCircle className="mt-0.5 size-4 shrink-0 text-ink-3" /> : <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warn" />}
      <div className="min-w-0 flex-1">{children}</div>
      {action}
    </div>
  );
}

/**
 * Uploading an image, video or PDF of your own.
 *
 * An upload is never approved yet, so it goes to MLR as its own item. Any
 * number on it is checked against the approved claims; one that matches none
 * becomes a new claim for MLR rather than slipping through on a picture.
 */
export function EmailUploadModal({
  kind,
  lead,
  onInsert,
  onClose,
}: {
  kind: "image" | "video" | "doc";
  /** The claim an uploaded chart most likely shows. */
  lead?: EmailBlock;
  onInsert: (media: EmailMedia) => void;
  onClose: () => void;
}) {
  const [file, setFile] = useState<{ title: string; gradient: string; label: string; numbers: string[]; previewUrl?: string; real?: boolean; duration?: string } | null>(null);
  const [alt, setAlt] = useState("");
  const [gif, setGif] = useState(false);
  const [vaultNo, setVaultNo] = useState("");
  const accept = { image: "image/*", video: "video/*", doc: "application/pdf" }[kind];
  const noun = { image: "image", video: "video", doc: "document" }[kind];
  const found = (file?.numbers ?? []).map((n) => (n === "matched" ? { n: lead?.stat ?? "the result", claim: lead } : { n, claim: undefined }));
  const ready = !!file && (kind === "doc" || !!alt.trim());

  return (
    <Modal
      open
      onClose={onClose}
      title={`Upload ${noun === "image" ? "an image" : `a ${noun}`}`}
      description="Uploads aren't approved yet, so each one goes to MLR as its own item."
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!ready}
            onClick={() =>
              file &&
              onInsert({
                uid: uid(),
                kind,
                from: "upload",
                title: file.title,
                src: "Uploaded",
                gradient: file.gradient,
                label: file.label,
                previewUrl: file.previewUrl,
                alt: alt.trim(),
                gif,
                duration: file.duration,
                claims: found.filter((f) => f.claim).map((f) => f.claim!.claimId),
                newClaims: found.filter((f) => !f.claim).map((f) => f.n),
                code: vaultNo.trim() || "New",
              })
            }
            className="px-5 font-bold"
          >
            Insert
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <label className="grid cursor-pointer justify-items-center gap-1.5 rounded-panel border border-dashed border-hair-3 bg-canvas p-5 text-center transition hover:border-brand">
          <Upload className="size-5 text-ink-3" />
          <span className="text-body font-bold text-ink">Drop a file or choose one</span>
          <span className="text-label text-ink-3">{kind === "image" ? "PNG or JPG" : kind === "video" ? "MP4 or MOV" : "PDF"}</span>
          <input
            type="file"
            accept={accept}
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setFile({ title: f.name, gradient: "linear-gradient(135deg,#5b6474,#9aa3b2)", label: "", numbers: [], real: true, previewUrl: kind === "image" ? URL.createObjectURL(f) : undefined });
              setAlt("");
            }}
          />
        </label>
        <p className="text-label text-ink-3">
          Or try a sample:{" "}
          {SAMPLE_UPLOADS[kind].map((s, i) => (
            <button
              key={s.title}
              type="button"
              onClick={() => {
                setFile({ ...s });
                setAlt(s.altSuggest);
              }}
              className="cursor-pointer font-bold text-brand hover:underline"
            >
              {i > 0 && " · "}
              {s.title}
            </button>
          ))}
        </p>

        {file && (
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-control border border-hair bg-card p-2.5">
              <span className="h-8 w-12 shrink-0 rounded-chip" style={{ background: file.gradient }} />
              <span className="min-w-0 flex-1">
                <b className="block truncate text-body text-ink">{file.title}</b>
                <span className="text-label text-ink-3">New upload · goes to MLR as its own item</span>
              </span>
            </div>
            <Check ok>{kind === "doc" ? "Linked, not attached. Hosted once it's approved." : "Stored as a hosted file in the Assets folder, never embedded in the email."}</Check>
            {kind === "video" && (
              <Check ok>
                <p>Plays inside Apple Mail only. Everywhere else the doctor sees a thumbnail with the play button drawn in, opening the hosted video.</p>
                <Segmented className="mt-2 w-fit">
                  <SegmentedButton active={!gif} onClick={() => setGif(false)}>
                    Still thumbnail
                  </SegmentedButton>
                  <SegmentedButton active={gif} onClick={() => setGif(true)}>
                    Animated GIF
                  </SegmentedButton>
                </Segmented>
              </Check>
            )}
            {found.length > 0 ? (
              found.map((f) =>
                f.claim ? (
                  <Check key={f.n} ok>
                    Shows <b className="text-ink">{f.n}</b>, which matches {f.claim.claimId}: {f.claim.text}
                  </Check>
                ) : (
                  <Check key={f.n} ok={false}>
                    Shows <b className="text-ink">{f.n}</b>, which matches no approved claim. It goes to MLR as a new claim.
                  </Check>
                )
              )
            ) : (
              <Check ok>{file.real ? "SwishX reads any text in the file here and checks each number against the approved claims." : "No numbers or claims found."}</Check>
            )}
            {kind === "doc" && (
              <Check ok="ask">
                <p>Already approved in Vault? Enter its document number and it isn&apos;t reviewed again.</p>
                <Field size="sm" className="mt-2" placeholder="e.g. US-ONK-2601-0099" value={vaultNo} onChange={(e) => setVaultNo(e.target.value)} />
              </Check>
            )}
            {kind !== "doc" && (
              <Field
                label="Alt text"
                hint="Required. Outlook often hides images, so this is what the doctor reads."
                placeholder="What the image shows"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
              />
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

/**
 * Adding a link: a URL that SwishX checks and MLR then reviews.
 */
export function EmailLinkModal({ onInsert, onClose }: { onInsert: (media: EmailMedia) => void; onClose: () => void }) {
  /* SwishX has no list of the brand's approved pages, so a link is the URL the marketer gives. */
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);
  const host = url.replace(/^https?:\/\//, "").split("/")[0];
  const secure = url.startsWith("https://");
  const ready = checked && !!url.trim();

  return (
    <Modal
      open
      onClose={onClose}
      title="Add a link"
      description="Every link is tracked and labelled for click reports."
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!ready}
            onClick={() => {
              onInsert({ uid: uid(), kind: "link", from: "upload", title: text.trim() || host || url, src: "Pasted URL", gradient: "", url: url.trim(), alt: "", claims: [], newClaims: [], code: "New", approved: false });
            }}
            className="px-5 font-bold"
          >
            Insert
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {(
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <Field
                label="URL"
                className="flex-1"
                placeholder="https://"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setChecked(false);
                }}
              />
              <Button variant="secondary" disabled={!url.trim()} onClick={() => setChecked(true)} className="gap-1.5">
                <Link2 className="size-3.5" />
                Check
              </Button>
            </div>
            <Field label="Link text" placeholder="What the doctor clicks, e.g. Read the guideline" value={text} onChange={(e) => setText(e.target.value)} />
            {checked && (
              <div className="space-y-2">
                <Check ok>Opens: the page loads. Title: &ldquo;{host || "page"}&rdquo;</Check>
                <Check ok={secure}>{secure ? "Secure (https)" : "Not secure. Use the https address."}</Check>
                <Check ok={false}>It goes to MLR as a linked destination for the reviewer to confirm.</Check>
                <Check ok>
                  Clicks are tracked as <span className="font-mono text-label">LinkName={linkTag(text || host || "link")}</span>
                </Check>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

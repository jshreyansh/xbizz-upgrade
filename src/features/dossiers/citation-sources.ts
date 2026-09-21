/**
 * Where a citation actually points.
 *
 * A dossier records its sources the way a regulator would accept them —
 * "FDA Approved Prescribing Information (Rev. 04/2026)" — which is precise
 * and completely unclickable. Someone reading a claim wants the document,
 * not the string describing it. This maps the recorded line onto the public
 * record it names, so a citation badge can open the real thing in a new tab.
 *
 * Nothing here is a lookup: the destination is the register the line belongs
 * to — Drugs@FDA, the trial registry, the journal, PubMed — not a deep link
 * into a document we do not have. That is the honest answer, and it is the
 * one a reviewer can act on.
 */
export interface CitationSource {
  /** Who publishes it. */
  publisher: string;
  /** The citation as recorded, with the publisher's name taken off the front. */
  line: string;
  /** Where inside it, when the line names a place. */
  locator?: string;
  /** The public register, opened in a new tab. */
  url: string;
}

const PUBMED = (term: string) => `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(term)}`;

/**
 * "Section 12.1 Mechanism of Action", "Section 2.1 & 8.6", "§1".
 *
 * Everything from the section number to the end of the line: the number and
 * the heading that follows it are one address, and splitting them puts half
 * of it back in the document's name.
 */
const LOCATOR = /\s*(?:Section|§)\s*[\d.]+(?:\s*(?:&|and)\s*[\d.]+)?.*$/i;

function locatorIn(citation: string): string | undefined {
  const match = citation.match(LOCATOR);
  return match ? match[0].trim().replace(/^§\s*/, "Section ") : undefined;
}

/** Drop the publisher from the front, so the card does not say it twice. */
function withoutPublisher(citation: string, publisher: string): string {
  const trimmed = citation.replace(new RegExp(`^${publisher}\\s+`, "i"), "").trim();
  return trimmed || citation;
}

export function citationSource(citation: string): CitationSource {
  const locator = locatorIn(citation);

  const trial = citation.match(/NCT\d{6,}/i);
  if (trial) {
    const id = trial[0].toUpperCase();
    const line = citation.replace(/^ClinicalTrials\.gov\s+/i, "").trim();
    return {
      publisher: "ClinicalTrials.gov",
      line,
      /* A citation that is only the registration number already says where;
         printing it again beside itself reads as a duplication bug. */
      locator: line.toUpperCase() === id ? undefined : id,
      url: `https://clinicaltrials.gov/study/${id}`,
    };
  }

  if (/\bFDA\b|\bUSPI\b/i.test(citation)) {
    /* The document, with its address taken off the end and the abbreviation
       the register does not use spelled out. */
    const document = withoutPublisher(citation, "FDA")
      .replace(LOCATOR, "")
      .replace(/\b(?:US)?PI\b/, "Prescribing Information")
      .trim();
    return {
      publisher: "FDA",
      line: document || "Prescribing Information",
      locator,
      url: "https://www.accessdata.fda.gov/scripts/cder/daf/",
    };
  }

  if (/NEJM|New England/i.test(citation)) {
    return { publisher: "New England Journal of Medicine", line: citation, locator, url: PUBMED(citation) };
  }

  if (/NCCN/i.test(citation)) {
    return {
      publisher: "NCCN",
      line: withoutPublisher(citation, "NCCN"),
      locator,
      url: "https://www.nccn.org/guidelines/category_1",
    };
  }

  /* A study report, a safety appendix — ours, not a public record. It has no
     register to open, so it points at the brand's own attachments. */
  if (/Clinical Study Report|Appendix|Data on file/i.test(citation)) {
    return { publisher: "On file", line: citation, locator, url: "" };
  }

  return { publisher: "Published literature", line: citation, locator, url: PUBMED(citation) };
}

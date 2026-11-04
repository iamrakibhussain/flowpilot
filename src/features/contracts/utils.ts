/**
 * FlowPilot Contracts & E-Signatures Utilities
 * Variable interpolation, markdown-to-legal clause parsing, and cryptographic audit formatting.
 */

export interface ContractInterpolationContext {
  clientName?: string | null;
  companyName?: string | null;
  clientEmail?: string | null;
  businessName?: string | null;
  contractNumber?: string | null;
  effectiveDate?: string | Date | null;
  expiresDate?: string | Date | null;
}

/**
 * Cleanly format a date for formal legal agreements (e.g. "November 4, 2026")
 */
export function formatLegalDate(dateInput?: string | Date | null): string {
  if (!dateInput) {
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) {
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Interpolates dynamic template placeholders with actual entity data.
 * Handles duplicate tags and cleans up unassigned placeholders gracefully.
 */
export function interpolateContractVariables(
  content: string,
  context: ContractInterpolationContext
): string {
  if (!content) return "";

  const clientName = context.clientName?.trim() || "Client";
  const companyName = context.companyName?.trim() || clientName;
  const clientEmail = context.clientEmail?.trim() || "";
  const businessName = context.businessName?.trim() || "FlowPilot Enterprise";
  const contractNumber = context.contractNumber?.trim() || "CNT-DRAFT";
  const effectiveDate = formatLegalDate(context.effectiveDate);
  const expiresDate = context.expiresDate ? formatLegalDate(context.expiresDate) : "Until Terminated";

  let interpolated = content
    // Client Name
    .replace(/\{\{\s*client_name\s*\}\}/gi, clientName)
    .replace(/\{\{\s*customer_name\s*\}\}/gi, clientName)
    .replace(/\{\{\s*client_email\s*\}\}/gi, clientEmail)
    // Company Name
    .replace(/\{\{\s*company_name\s*\}\}/gi, companyName)
    // Business Name
    .replace(/\{\{\s*business_name\s*\}\}/gi, businessName)
    .replace(/\{\{\s*organization_name\s*\}\}/gi, businessName)
    // Contract Metadata
    .replace(/\{\{\s*contract_number\s*\}\}/gi, contractNumber)
    .replace(/\{\{\s*effective_date\s*\}\}/gi, effectiveDate)
    .replace(/\{\{\s*date\s*\}\}/gi, effectiveDate)
    .replace(/\{\{\s*expires_date\s*\}\}/gi, expiresDate);

  // Clean up any stray duplicate tag artifacts (e.g. repeated variable names)
  interpolated = interpolated.replace(/(\{\{[a-z0-9_]+\}\}\s*)+/gi, "");

  return interpolated;
}

export interface ContractClause {
  id: string;
  type: "title" | "section" | "subsection" | "paragraph" | "list-item";
  heading?: string;
  content: string;
  number?: string;
}

/**
 * Parses raw contract content (which may contain markdown headings, numbered clauses, etc.)
 * into structured legal sections with pristine typographic hierarchy.
 */
export function parseContractClauses(rawContent: string): ContractClause[] {
  if (!rawContent) return [];

  const lines = rawContent.split(/\r?\n/);
  const clauses: ContractClause[] = [];
  let currentParagraph = "";

  const flushParagraph = () => {
    if (currentParagraph.trim()) {
      clauses.push({
        id: `p-${clauses.length}`,
        type: "paragraph",
        content: currentParagraph.trim(),
      });
      currentParagraph = "";
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      flushParagraph();
      continue;
    }

    // Markdown H1 Title (# Title)
    if (line.startsWith("# ")) {
      flushParagraph();
      clauses.push({
        id: `title-${clauses.length}`,
        type: "title",
        content: line.replace(/^#\s+/, "").trim(),
      });
      continue;
    }

    // Markdown H2 Section (## 1. Scope / ## Section Name)
    if (line.startsWith("## ")) {
      flushParagraph();
      const rawHeading = line.replace(/^##\s+/, "").trim();
      clauses.push({
        id: `sec-${clauses.length}`,
        type: "section",
        heading: rawHeading,
        content: "",
      });
      continue;
    }

    // Markdown H3 Subsection (### 1.1 ...)
    if (line.startsWith("### ")) {
      flushParagraph();
      const rawHeading = line.replace(/^###\s+/, "").trim();
      clauses.push({
        id: `subsec-${clauses.length}`,
        type: "subsection",
        heading: rawHeading,
        content: "",
      });
      continue;
    }

    // Numbered Clause Item (e.g., "1. Scope:" or "1. **Scope:**")
    const numberedMatch = line.match(/^(\d+[\.\)])\s+(.*)$/);
    if (numberedMatch) {
      flushParagraph();
      clauses.push({
        id: `num-${clauses.length}`,
        type: "list-item",
        number: numberedMatch[1],
        content: numberedMatch[2].trim(),
      });
      continue;
    }

    // Bullet points (- or *)
    if (line.startsWith("- ") || line.startsWith("* ")) {
      flushParagraph();
      clauses.push({
        id: `bullet-${clauses.length}`,
        type: "list-item",
        number: "•",
        content: line.replace(/^[-*]\s+/, "").trim(),
      });
      continue;
    }

    // Regular line - accumulate into paragraph
    if (currentParagraph) {
      currentParagraph += " " + line;
    } else {
      currentParagraph = line;
    }
  }

  flushParagraph();
  return clauses;
}


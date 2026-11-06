"use client";

import * as React from "react";
import {
  FileCheck2,
  ShieldCheck,
  Lock,
  Building2,
  FileSignature,
  Printer,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  parseContractClauses,
  interpolateContractVariables,
  formatLegalDate,
  type ContractClause,
} from "@/features/contracts/utils";
import type { PortalContract } from "@/features/portal/types";
import { printElementById } from "@/lib/utils/print";

interface PortalContractDocumentViewerProps {
  contract: PortalContract;
  customerName: string;
  customerEmail: string;
  customerCompany?: string | null;
  organizationName?: string;
  organizationEmail?: string | null;
  brandColor?: string;
  showPrintAction?: boolean;
}

/**
 * Helper to safely format inline markdown bolding **text** without external dependencies
 */
function renderFormattedInlineText(text: string) {
  if (!text) return "";
  const cleanText = text.replace(/^#+\s*/, "");
  const parts = cleanText.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-bold text-slate-900 dark:text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export function PortalContractDocumentViewer({
  contract,
  customerName,
  customerEmail,
  customerCompany,
  organizationName = "Business Provider",
  organizationEmail,
  brandColor = "#2563eb",
  showPrintAction = true,
}: PortalContractDocumentViewerProps) {
  const containerId = `portal-contract-doc-${contract.id}`;

  // Interpolate dynamic tags
  const interpolatedContent = React.useMemo(() => {
    return interpolateContractVariables(contract.content, {
      clientName: contract.signerName || customerName,
      companyName: customerCompany || null,
      clientEmail: contract.signerEmail || customerEmail,
      businessName: organizationName,
      contractNumber: contract.contractNumber,
      effectiveDate: contract.issuedAt,
      expiresDate: contract.expiresAt,
    });
  }, [
    contract.content,
    contract.signerName,
    customerName,
    customerCompany,
    contract.signerEmail,
    customerEmail,
    organizationName,
    contract.contractNumber,
    contract.issuedAt,
    contract.expiresAt,
  ]);

  // Parse into structured legal clauses
  const clauses: ContractClause[] = React.useMemo(() => {
    return parseContractClauses(interpolatedContent);
  }, [interpolatedContent]);

  const isSigned = contract.status === "SIGNED" || contract.status === "COUNTERSIGNED";
  const isCountersigned = contract.status === "COUNTERSIGNED";

  return (
    <div className="space-y-4">
      {showPrintAction && (
        <div className="flex items-center justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => printElementById(containerId, `Contract-${contract.contractNumber}`)}
            className="h-8.5 w-full cursor-pointer gap-2 rounded-xl text-xs font-bold shadow-2xs hover:bg-slate-100 sm:h-9 sm:w-auto dark:hover:bg-slate-800"
          >
            <Printer className="h-3.5 w-3.5" />
            Print / Save Document
          </Button>
        </div>
      )}

      {/* Printable Legal Document Sheet */}
      <div
        id={containerId}
        className="relative mx-auto w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm sm:p-8 md:p-12 dark:border-slate-800 dark:bg-slate-900 print:rounded-none print:border-none print:p-0 print:shadow-none"
      >
        {/* Top Accent Gradient Line */}
        <div
          style={{ backgroundColor: brandColor }}
          className="absolute inset-x-0 top-0 h-1.5 opacity-90 print:hidden"
        />

        {/* Letterhead Header */}
        <div className="border-b border-slate-200/80 pb-5 dark:border-slate-800">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <span className="font-serif text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">
                {organizationName}
              </span>
              {organizationEmail && (
                <p className="font-mono text-[11px] text-slate-500">{organizationEmail}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:text-right">
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <FileCheck2 className="h-3.5 w-3.5 text-blue-600" />
                <span>{contract.contractNumber}</span>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider uppercase ${
                  isCountersigned
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : isSigned
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                }`}
              >
                {contract.status.replace("_", " ")}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Effective: {formatLegalDate(contract.issuedAt)}
            </span>
            {contract.expiresAt && (
              <span>• Valid Until: {formatLegalDate(contract.expiresAt)}</span>
            )}
          </div>
        </div>

        {/* Document Title */}
        <div className="mt-6">
          <h2 className="font-serif text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">
            {contract.title}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Legally binding electronic agreement executed under applicable commercial standards.
          </p>
        </div>

        {/* Parties Coordinates Box */}
        <div className="my-5 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="border-b border-slate-200/60 pb-3 sm:border-r sm:border-b-0 sm:pr-4 sm:pb-0 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              <Building2 className="h-3 w-3 text-blue-600" />
              <span>Service Provider</span>
            </div>
            <p className="mt-1 text-xs font-bold text-slate-900 dark:text-slate-100">
              {organizationName}
            </p>
            {organizationEmail && <p className="text-[11px] text-slate-500">{organizationEmail}</p>}
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              <FileSignature className="h-3 w-3 text-indigo-600" />
              <span>Client Signatory</span>
            </div>
            <p className="mt-1 text-xs font-bold text-slate-900 dark:text-slate-100">
              {contract.signerName || customerName}
              {customerCompany ? ` • ${customerCompany}` : ""}
            </p>
            <p className="text-[11px] text-slate-500">{contract.signerEmail || customerEmail}</p>
          </div>
        </div>

        {/* Formatted Clauses (Zero raw ## or markdown syntax) */}
        <div className="my-6 space-y-4 text-xs leading-relaxed text-slate-700 sm:text-sm dark:text-slate-300">
          {clauses.map((clause) => {
            if (clause.type === "title") {
              return null;
            }

            if (clause.type === "section" && clause.heading) {
              return (
                <div
                  key={clause.id}
                  className="border-b border-slate-100 pt-4 pb-1 dark:border-slate-800"
                >
                  <h3 className="font-serif text-sm font-bold tracking-tight text-slate-900 sm:text-base dark:text-slate-100">
                    {clause.heading}
                  </h3>
                </div>
              );
            }

            if (clause.type === "subsection" && clause.heading) {
              return (
                <div key={clause.id} className="pt-2">
                  <h4 className="font-sans text-xs font-bold tracking-wider text-slate-800 uppercase dark:text-slate-200">
                    {clause.heading}
                  </h4>
                </div>
              );
            }

            if (clause.type === "list-item") {
              return (
                <div key={clause.id} className="flex items-start gap-2.5 pl-2 sm:pl-4">
                  <span className="shrink-0 font-mono font-bold text-slate-500">
                    {clause.number}
                  </span>
                  <p className="leading-relaxed">{renderFormattedInlineText(clause.content)}</p>
                </div>
              );
            }

            return (
              <p key={clause.id} className="leading-relaxed text-slate-700 dark:text-slate-300">
                {renderFormattedInlineText(clause.content)}
              </p>
            );
          })}
        </div>

        {/* Executed Cryptographic Signature Stamp */}
        {isSigned && (
          <div className="mt-8 rounded-2xl border-2 border-emerald-300/80 bg-emerald-50/50 p-4.5 sm:p-6 dark:border-emerald-800/80 dark:bg-emerald-950/20">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <span className="font-serif text-sm font-bold sm:text-base">
                    Cryptographically Executed &amp; Recorded
                  </span>
                </div>
                <p className="mt-1 text-xs text-emerald-700/90 dark:text-emerald-400/90">
                  Digitally executed by <strong>{contract.signerName || customerName}</strong> (
                  {contract.signerEmail || customerEmail})
                </p>
                <p className="text-[11px] text-emerald-600/80 dark:text-emerald-500/80">
                  Timestamp:{" "}
                  {contract.signedAt ? new Date(contract.signedAt).toLocaleString() : "Recorded"}
                </p>
                {contract.contentChecksum && (
                  <p className="mt-2 font-mono text-[10px] break-all text-emerald-700 dark:text-emerald-400">
                    SHA-256 Audit Seal: {contract.contentChecksum}
                  </p>
                )}
              </div>

              {/* Signature Graphic if available */}
              {contract.signatureData && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-200 bg-white p-2 sm:p-3 dark:border-emerald-800 dark:bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={contract.signatureData}
                    alt="Client Signature"
                    className="h-12 max-w-[160px] object-contain sm:h-14 sm:max-w-[200px]"
                  />
                  <span className="mt-1 text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                    Digital Signature Stamp
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

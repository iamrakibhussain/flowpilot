"use client";

import * as React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Building2,
  FileCheck2,
  Fingerprint,
  FileSignature,
} from "lucide-react";
import {
  interpolateContractVariables,
  parseContractClauses,
  formatLegalDate,
} from "@/features/contracts/utils";
import type { ContractItem, PublicContractStatement } from "@/features/contracts/types";

interface ContractDocumentPaperProps {
  contract: ContractItem | PublicContractStatement;
  elementId?: string;
  hideHeaderActions?: boolean;
}

/**
 * Safely format inline markdown bolding **text** without raw asterisks
 */
function renderFormattedInlineText(text: string) {
  if (!text) return "";
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-bold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export function ContractDocumentPaper({
  contract,
  elementId = "printable-contract-document",
}: ContractDocumentPaperProps) {
  // Extract organization details cleanly whether from PublicContractStatement or ContractItem
  const orgName =
    "organization" in contract && contract.organization?.name
      ? contract.organization.name
      : "FlowPilot Enterprise";
  const orgEmail =
    "organization" in contract && contract.organization?.contactEmail
      ? contract.organization.contactEmail
      : null;

  const clientName = contract.customer?.name || "Client Signatory";
  const clientCompany = contract.customer?.company || null;
  const clientEmail = contract.customer?.email || "";

  // Dynamic variable interpolation
  const interpolatedContent = React.useMemo(() => {
    return interpolateContractVariables(contract.content, {
      clientName,
      companyName: clientCompany,
      clientEmail,
      businessName: orgName,
      contractNumber: contract.contractNumber,
      effectiveDate: contract.issuedAt,
      expiresDate: contract.expiresAt,
    });
  }, [
    contract.content,
    clientName,
    clientCompany,
    clientEmail,
    orgName,
    contract.contractNumber,
    contract.issuedAt,
    contract.expiresAt,
  ]);

  const clauses = React.useMemo(() => {
    return parseContractClauses(interpolatedContent);
  }, [interpolatedContent]);

  const isSigned = contract.status === "SIGNED" || contract.status === "COUNTERSIGNED";
  const isCountersigned = contract.status === "COUNTERSIGNED";

  return (
    <div
      id={elementId}
      className="relative mx-auto min-h-auto w-full max-w-4xl overflow-hidden rounded-xl border border-slate-200/90 bg-white p-3.5 text-slate-900 shadow-2xl sm:min-h-[11in] sm:rounded-2xl sm:p-8 md:p-14 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 print:rounded-none print:border-none print:p-0 print:shadow-none"
    >
      {/* Decorative top legal gradient accent */}
      <div className="absolute top-0 right-0 left-0 h-2 rounded-t-xl bg-gradient-to-r from-blue-700 via-indigo-600 to-emerald-600 sm:h-2.5 sm:rounded-t-2xl print:hidden" />

      {/* Subtle Background Security Watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.025] select-none dark:opacity-[0.035]"
      >
        <p className="rotate-[-28deg] text-center font-serif text-4xl font-black tracking-widest text-slate-900 uppercase sm:text-7xl md:text-8xl dark:text-white">
          Official Legal Agreement
        </p>
      </div>

      {/* Header / Formal Corporate Letterhead */}
      <div className="relative z-10 border-b-2 border-slate-900/15 pb-6 dark:border-slate-800">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-xs font-black text-white shadow-md shadow-blue-500/20">
                FP
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                {orgName}
              </span>
            </div>
            {orgEmail && (
              <p className="mt-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                Authorized Executive Office: {orgEmail}
              </p>
            )}
            <p className="mt-0.5 text-[10px] font-bold tracking-widest text-slate-500 uppercase dark:text-slate-400">
              Commercial Operations & Advisory Services
            </p>
          </div>

          <div className="text-left sm:text-right">
            <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-100 px-3 py-1 font-mono text-xs font-bold text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <FileCheck2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>{contract.contractNumber}</span>
            </div>
            <div className="mt-2 space-y-0.5 text-xs text-slate-500 dark:text-slate-400">
              <div>
                <span className="font-medium">Effective Date:</span>{" "}
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                  {formatLegalDate(contract.issuedAt)}
                </span>
              </div>
              {contract.expiresAt && (
                <div>
                  <span className="font-medium">Valid Until:</span>{" "}
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {formatLegalDate(contract.expiresAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Legal Document Title with Status Stamp */}
        <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800/80">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-serif text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl md:text-4xl dark:text-white">
              {contract.title}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-extrabold tracking-wider uppercase shadow-sm ${
                isCountersigned
                  ? "border-2 border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300"
                  : isSigned
                    ? "border-2 border-blue-400 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-950/70 dark:text-blue-300"
                    : "border-2 border-amber-400 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/70 dark:text-amber-300"
              }`}
            >
              {isCountersigned ? (
                <>
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Fully Executed & Sealed</span>
                </>
              ) : isSigned ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Client Signed</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>Pending Execution</span>
                </>
              )}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            This agreement is formally drafted and electronically executed pursuant to the Uniform
            Electronic Transactions Act (UETA) and Electronic Signatures in Global and National
            Commerce Act (ESIGN, 15 U.S.C. § 7001).
          </p>
        </div>
      </div>

      {/* Parties Summary Box */}
      <div className="relative z-10 my-5 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:my-6 sm:grid-cols-2 sm:p-5 dark:border-slate-800 dark:bg-slate-950/50">
        <div className="border-b border-slate-200 pb-3.5 sm:border-r sm:border-b-0 sm:pr-4 sm:pb-0 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-[10px] font-extrabold tracking-widest text-slate-500 uppercase dark:text-slate-400">
              First Party (Service Provider)
            </span>
          </div>
          <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{orgName}</p>
          {orgEmail && <p className="text-xs text-slate-600 dark:text-slate-400">{orgEmail}</p>}
          <span className="mt-2 inline-block rounded border border-blue-200 bg-blue-100/70 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300">
            Authorized Provider Entity
          </span>
        </div>

        <div className="pt-1 sm:pt-0">
          <div className="flex items-center gap-2">
            <FileSignature className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-[10px] font-extrabold tracking-widest text-slate-500 uppercase dark:text-slate-400">
              Second Party (Client / Recipient)
            </span>
          </div>
          <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
            {clientName}
            {clientCompany ? ` • ${clientCompany}` : ""}
          </p>
          {clientEmail && (
            <p className="text-xs text-slate-600 dark:text-slate-400">{clientEmail}</p>
          )}
          <span className="mt-2 inline-block rounded border border-indigo-200 bg-indigo-100/70 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300">
            Authorized Signatory Party
          </span>
        </div>
      </div>

      {/* Document Body & Clauses */}
      <div className="space-y-5 text-xs leading-relaxed text-slate-800 sm:text-sm dark:text-slate-200">
        {clauses.map((clause) => {
          if (clause.type === "title") {
            // Rendered in header already, skip repeat or render as prominent section
            return null;
          }

          if (clause.type === "section" && clause.heading) {
            return (
              <div key={clause.id} className="border-t border-slate-100 pt-4 dark:border-slate-800">
                <h3 className="font-serif text-base font-bold tracking-tight text-slate-900 sm:text-lg dark:text-white">
                  {clause.heading}
                </h3>
              </div>
            );
          }

          if (clause.type === "subsection" && clause.heading) {
            return (
              <div key={clause.id} className="pt-2">
                <h4 className="font-sans text-xs font-bold tracking-wider text-slate-700 uppercase sm:text-sm dark:text-slate-300">
                  {clause.heading}
                </h4>
              </div>
            );
          }

          if (clause.type === "list-item") {
            return (
              <div key={clause.id} className="flex items-start gap-2.5 pl-2 sm:pl-4">
                <span className="shrink-0 font-mono font-bold text-slate-600 select-none dark:text-slate-400">
                  {clause.number}
                </span>
                <p className="leading-relaxed">{renderFormattedInlineText(clause.content)}</p>
              </div>
            );
          }

          return (
            <p key={clause.id} className="text-left leading-relaxed sm:text-justify">
              {renderFormattedInlineText(clause.content)}
            </p>
          );
        })}
      </div>

      {/* Formal Execution & Digital Signatures */}
      <div className="relative z-10 mt-12 border-t-2 border-slate-900/15 pt-8 dark:border-slate-800">
        <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-serif text-lg font-bold tracking-wider text-slate-900 uppercase dark:text-white">
              Formal Execution & Digital Signatures
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Each signatory confirms legal capacity, agency authority, and unconditional agreement
              to all covenants herein.
            </p>
          </div>
          {isCountersigned && (
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 shadow-sm dark:border-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Ratified Commercial Instrument</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          {/* Client Signature Card */}
          <div className="relative rounded-xl border-2 border-slate-200 bg-slate-50/70 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-950/40">
            <span className="text-[10px] font-extrabold tracking-widest text-slate-500 uppercase dark:text-slate-400">
              Second Party (Client Signatory)
            </span>

            {contract.signerName ? (
              <div className="mt-3 space-y-3">
                {contract.signatureData && (
                  <div className="relative flex h-20 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-2 shadow-inner dark:border-slate-800 dark:bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={contract.signatureData}
                      alt="Client Digital Signature"
                      className="max-h-14 max-w-full object-contain"
                    />
                    <div className="mt-1 w-full border-b border-dashed border-slate-300 dark:border-slate-700" />
                    <span className="self-start px-1 font-mono text-[8px] text-slate-400 select-none">
                      X Authorized Signatory
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {contract.signerName}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {contract.signerEmail || clientEmail}
                  </p>
                </div>
                {contract.signedAt && (
                  <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    Executed: {new Date(contract.signedAt).toLocaleString()}
                  </p>
                )}
                <div className="inline-flex items-center gap-1.5 rounded border border-emerald-300 bg-emerald-100 px-2.5 py-1 font-mono text-[10px] font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  <span>ESIGN Verified & Recorded</span>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex h-28 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-xs text-slate-400 dark:border-slate-700">
                <Lock className="mb-1.5 h-5 w-5 text-amber-500/70" />
                <span className="font-semibold text-slate-600 dark:text-slate-400">
                  Pending Client Electronic Signature
                </span>
                <span className="mt-0.5 text-[10px] text-slate-400">Awaiting recipient action</span>
              </div>
            )}
          </div>

          {/* Business Countersignature Card */}
          <div className="relative rounded-xl border-2 border-slate-200 bg-slate-50/70 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-950/40">
            <span className="text-[10px] font-extrabold tracking-widest text-slate-500 uppercase dark:text-slate-400">
              First Party (Authorized Provider Officer)
            </span>

            {contract.countersignerName ? (
              <div className="mt-3 space-y-3">
                {contract.countersignatureData && (
                  <div className="relative flex h-20 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-2 shadow-inner dark:border-slate-800 dark:bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={contract.countersignatureData}
                      alt="Business Countersignature"
                      className="max-h-14 max-w-full object-contain"
                    />
                    <div className="mt-1 w-full border-b border-dashed border-slate-300 dark:border-slate-700" />
                    <span className="self-start px-1 font-mono text-[8px] text-slate-400 select-none">
                      X Corporate Executive
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {contract.countersignerName}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{orgName}</p>
                </div>
                {contract.countersignedAt && (
                  <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    Countersigned: {new Date(contract.countersignedAt).toLocaleString()}
                  </p>
                )}
                <div className="inline-flex items-center gap-1.5 rounded border border-blue-300 bg-blue-100 px-2.5 py-1 font-mono text-[10px] font-bold text-blue-800 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                  <ShieldCheck className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span>Corporate Seal Applied</span>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex h-28 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-xs text-slate-400 dark:border-slate-700">
                <Building2 className="mb-1.5 h-5 w-5 text-blue-500/70" />
                <span className="font-semibold text-slate-600 dark:text-slate-400">
                  Pending Business Countersignature
                </span>
                <span className="mt-0.5 text-[10px] text-slate-400">
                  Final provider ratification
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cryptographic SHA-256 Audit Seal & Compliance Statement */}
      <div className="relative z-10 mt-10 border-t border-slate-200 pt-5 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2 font-mono">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Fingerprint className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <span className="font-bold">Cryptographic Audit Checksum:</span>
            </div>
            <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold break-all text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {contract.contentChecksum || "SHA-256 Calculated at Execution"}
            </span>
          </div>

          <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
            FlowPilot Enterprise Cryptographic Contract Engine v2.0
          </div>
        </div>
      </div>
    </div>
  );
}

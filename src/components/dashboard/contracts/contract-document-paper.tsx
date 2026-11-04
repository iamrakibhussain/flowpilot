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

  const isSigned =
    contract.status === "SIGNED" || contract.status === "COUNTERSIGNED";
  const isCountersigned = contract.status === "COUNTERSIGNED";

  return (
    <div
      id={elementId}
      className="relative mx-auto w-full max-w-4xl bg-white p-3.5 sm:p-8 md:p-14 text-slate-900 shadow-2xl border border-slate-200/90 rounded-xl sm:rounded-2xl print:p-0 print:border-none print:shadow-none print:rounded-none dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800 min-h-auto sm:min-h-[11in] overflow-hidden"
    >
      {/* Decorative top legal gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-2 sm:h-2.5 bg-gradient-to-r from-blue-700 via-indigo-600 to-emerald-600 rounded-t-xl sm:rounded-t-2xl print:hidden" />

      {/* Subtle Background Security Watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.025] select-none dark:opacity-[0.035]"
      >
        <p className="rotate-[-28deg] text-center font-serif text-4xl sm:text-7xl md:text-8xl font-black uppercase tracking-widest text-slate-900 dark:text-white">
          Official Legal Agreement
        </p>
      </div>

      {/* Header / Formal Corporate Letterhead */}
      <div className="relative z-10 border-b-2 border-slate-900/15 pb-6 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xs shadow-md shadow-blue-500/20">
                FP
              </div>
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {orgName}
              </span>
            </div>
            {orgEmail && (
              <p className="text-[11px] text-slate-500 mt-1 font-mono dark:text-slate-400">
                Authorized Executive Office: {orgEmail}
              </p>
            )}
            <p className="text-[10px] text-slate-500 mt-0.5 tracking-widest uppercase font-bold dark:text-slate-400">
              Commercial Operations & Advisory Services
            </p>
          </div>

          <div className="text-left sm:text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 shadow-sm">
              <FileCheck2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>{contract.contractNumber}</span>
            </div>
            <div className="mt-2 text-xs text-slate-500 space-y-0.5 dark:text-slate-400">
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
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {contract.title}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-sm ${
                isCountersigned
                  ? "bg-emerald-50 text-emerald-800 border-2 border-emerald-400 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700"
                  : isSigned
                  ? "bg-blue-50 text-blue-800 border-2 border-blue-400 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-700"
                  : "bg-amber-50 text-amber-800 border-2 border-amber-400 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-700"
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
          <p className="mt-2 text-xs text-slate-500 leading-relaxed dark:text-slate-400">
            This agreement is formally drafted and electronically executed pursuant to the Uniform
            Electronic Transactions Act (UETA) and Electronic Signatures in Global and National
            Commerce Act (ESIGN, 15 U.S.C. § 7001).
          </p>
        </div>
      </div>

      {/* Parties Summary Box */}
      <div className="relative z-10 my-5 sm:my-6 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-950/50">
        <div className="border-b pb-3.5 sm:pb-0 sm:border-b-0 sm:border-r border-slate-200 sm:pr-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              First Party (Service Provider)
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900 mt-1 dark:text-white">{orgName}</p>
          {orgEmail && <p className="text-xs text-slate-600 dark:text-slate-400">{orgEmail}</p>}
          <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100/70 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900">
            Authorized Provider Entity
          </span>
        </div>

        <div className="pt-1 sm:pt-0">
          <div className="flex items-center gap-2">
            <FileSignature className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Second Party (Client / Recipient)
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900 mt-1 dark:text-white">
            {clientName}
            {clientCompany ? ` • ${clientCompany}` : ""}
          </p>
          {clientEmail && <p className="text-xs text-slate-600 dark:text-slate-400">{clientEmail}</p>}
          <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100/70 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-900">
            Authorized Signatory Party
          </span>
        </div>
      </div>

      {/* Document Body & Clauses */}
      <div className="space-y-5 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
        {clauses.map((clause) => {
          if (clause.type === "title") {
            // Rendered in header already, skip repeat or render as prominent section
            return null;
          }

          if (clause.type === "section" && clause.heading) {
            return (
              <div key={clause.id} className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  {clause.heading}
                </h3>
              </div>
            );
          }

          if (clause.type === "subsection" && clause.heading) {
            return (
              <div key={clause.id} className="pt-2">
                <h4 className="font-sans text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {clause.heading}
                </h4>
              </div>
            );
          }

          if (clause.type === "list-item") {
            return (
              <div key={clause.id} className="flex items-start gap-2.5 pl-2 sm:pl-4">
                <span className="font-mono font-bold text-slate-600 shrink-0 select-none dark:text-slate-400">
                  {clause.number}
                </span>
                <p className="leading-relaxed">{clause.content}</p>
              </div>
            );
          }

          return (
            <p key={clause.id} className="text-left sm:text-justify leading-relaxed">
              {clause.content}
            </p>
          );
        })}
      </div>

      {/* Formal Execution & Digital Signatures */}
      <div className="relative z-10 mt-12 pt-8 border-t-2 border-slate-900/15 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-slate-900 uppercase tracking-wider dark:text-white">
              Formal Execution & Digital Signatures
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Each signatory confirms legal capacity, agency authority, and unconditional agreement to all covenants herein.
            </p>
          </div>
          {isCountersigned && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-sm dark:bg-emerald-950/70 dark:border-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Ratified Commercial Instrument</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Client Signature Card */}
          <div className="rounded-xl border-2 border-slate-200 bg-slate-50/70 p-4 sm:p-5 relative dark:border-slate-800 dark:bg-slate-950/40">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Second Party (Client Signatory)
            </span>

            {contract.signerName ? (
              <div className="mt-3 space-y-3">
                {contract.signatureData && (
                  <div className="h-20 flex flex-col items-center justify-center bg-white rounded-lg border border-slate-200 p-2 shadow-inner relative dark:bg-slate-900 dark:border-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={contract.signatureData}
                      alt="Client Digital Signature"
                      className="max-h-14 max-w-full object-contain"
                    />
                    <div className="w-full border-b border-dashed border-slate-300 mt-1 dark:border-slate-700" />
                    <span className="text-[8px] font-mono text-slate-400 self-start px-1 select-none">
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
                  <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    Executed: {new Date(contract.signedAt).toLocaleString()}
                  </p>
                )}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  <span>ESIGN Verified & Recorded</span>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex flex-col items-center justify-center h-28 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 text-xs dark:border-slate-700">
                <Lock className="h-5 w-5 mb-1.5 text-amber-500/70" />
                <span className="font-semibold text-slate-600 dark:text-slate-400">
                  Pending Client Electronic Signature
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Awaiting recipient action</span>
              </div>
            )}
          </div>

          {/* Business Countersignature Card */}
          <div className="rounded-xl border-2 border-slate-200 bg-slate-50/70 p-4 sm:p-5 relative dark:border-slate-800 dark:bg-slate-950/40">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              First Party (Authorized Provider Officer)
            </span>

            {contract.countersignerName ? (
              <div className="mt-3 space-y-3">
                {contract.countersignatureData && (
                  <div className="h-20 flex flex-col items-center justify-center bg-white rounded-lg border border-slate-200 p-2 shadow-inner relative dark:bg-slate-900 dark:border-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={contract.countersignatureData}
                      alt="Business Countersignature"
                      className="max-h-14 max-w-full object-contain"
                    />
                    <div className="w-full border-b border-dashed border-slate-300 mt-1 dark:border-slate-700" />
                    <span className="text-[8px] font-mono text-slate-400 self-start px-1 select-none">
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
                  <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    Countersigned: {new Date(contract.countersignedAt).toLocaleString()}
                  </p>
                )}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-100 text-blue-800 font-mono text-[10px] font-bold border border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
                  <ShieldCheck className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span>Corporate Seal Applied</span>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex flex-col items-center justify-center h-28 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 text-xs dark:border-slate-700">
                <Building2 className="h-5 w-5 mb-1.5 text-blue-500/70" />
                <span className="font-semibold text-slate-600 dark:text-slate-400">
                  Pending Business Countersignature
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Final provider ratification</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cryptographic SHA-256 Audit Seal & Compliance Statement */}
      <div className="relative z-10 mt-10 pt-5 border-t border-slate-200 text-slate-500 text-[11px] dark:border-slate-800 dark:text-slate-400">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex flex-wrap items-center gap-2 font-mono">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Fingerprint className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="font-bold">Cryptographic Audit Checksum:</span>
            </div>
            <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-mono font-semibold text-slate-800 break-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
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

"use client";

import * as React from "react";
import {
  Printer,
  X,
  ShieldCheck,
  CheckCircle2,
  Building2,
  FileCheck2,
  Send,
  Lock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { QuoteListItem } from "@/features/quotes/types";
import { useQuote, useSendQuote } from "@/features/quotes/use-quotes";
import { useOrganizationSettings } from "@/features/organizations/use-organization-settings";
import { printElementById } from "@/lib/utils/print";

interface QuotePrintModalProps {
  quote: QuoteListItem | null;
  isOpen: boolean;
  onClose: () => void;
  organizationName?: string;
}

export function QuotePrintModal({
  quote,
  isOpen,
  onClose,
  organizationName = "FlowPilot Enterprise Operations",
}: QuotePrintModalProps) {
  const { data: orgSettings } = useOrganizationSettings();
  const { data: quoteDetails } = useQuote(quote?.id);
  const sendEmailMutation = useSendQuote();
  const [emailStatus, setEmailStatus] = React.useState<{ sent: boolean; message?: string }>({
    sent: false,
  });

  if (!isOpen || !quote) return null;

  const effectiveQuote = quoteDetails || quote;
  const effectiveOrgName = orgSettings?.name || organizationName;
  const effectiveCurrency = orgSettings?.currency || "USD";
  const effectiveTaxId = orgSettings?.taxId;
  const effectiveLogoUrl = orgSettings?.logoUrl;
  const effectiveBrandColor = orgSettings?.brandColor || "#2563eb";
  const introduction = quoteDetails?.introduction || null;
  const terms = quoteDetails?.terms || null;

  const handleSendEmail = async () => {
    try {
      const res = await sendEmailMutation.mutateAsync(quote.id);
      setEmailStatus({
        sent: true,
        message: `Proposal dispatched to ${res.deliveredTo}`,
      });
      setTimeout(() => setEmailStatus({ sent: false }), 6000);
    } catch (err: unknown) {
      setEmailStatus({
        sent: false,
        message: err instanceof Error ? err.message : "Failed to deliver proposal email",
      });
    }
  };

  const handlePrint = () => {
    printElementById("flowpilot-quote-sheet", `Proposal-${quote.quoteNumber}`);
  };

  const isAccepted = quote.status === "ACCEPTED";
  const isExpired =
    quote.status !== "ACCEPTED" &&
    quote.expiresAt &&
    new Date(quote.expiresAt) < new Date();

  const verificationHash = `FP-PROP-${quote.id.slice(0, 8).toUpperCase()}-${quote.quoteNumber}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[94vh] max-w-4xl overflow-y-auto rounded-3xl border-slate-200/90 bg-slate-900/40 p-4 shadow-2xl backdrop-blur-xl sm:p-7 print:static print:transform-none print:max-h-none print:max-w-none print:w-full print:overflow-visible print:border-none print:bg-white print:p-0 print:shadow-none">
        {/* Action Header (Hidden during printing) */}
        <DialogHeader className="flex flex-col items-start justify-between gap-3 border-b border-slate-200/20 pb-4 sm:flex-row sm:items-center print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white">
                Executive Proposal Studio
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-300">
                Pixel-perfect Swiss statement formatted for client signature, archival, and print/PDF export.
              </DialogDescription>
            </div>
          </div>
          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            {emailStatus.sent && (
              <span className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1 text-xs font-medium text-emerald-400">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                {emailStatus.message}
              </span>
            )}
            <Button
              type="button"
              onClick={handleSendEmail}
              disabled={sendEmailMutation.isPending}
              className="h-9 gap-1.5 rounded-xl bg-emerald-600 px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 active:scale-98 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{sendEmailMutation.isPending ? "Sending..." : "Send by Email"}</span>
            </Button>
            <Button
              type="button"
              onClick={handlePrint}
              className="h-9 gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 active:scale-98"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Export PDF</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onClose}
              className="h-9 w-9 rounded-xl border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Printable Proposal Canvas */}
        <div
          id="flowpilot-quote-sheet"
          className="relative mx-auto my-3 w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 font-sans text-slate-900 shadow-xl sm:p-12 print:m-0 print:w-full print:border-none print:p-0 print:shadow-none"
        >
          {/* Subtle Top Classic Brand Accent Bar */}
          <div
            className="absolute top-0 right-0 left-0 h-2 transition-colors duration-300 print:h-1.5"
            style={{ backgroundColor: effectiveBrandColor }}
          />

          {/* Watermark Stamps */}
          {isAccepted && (
            <div className="pointer-events-none absolute top-36 right-12 z-10 -rotate-12 opacity-85 select-none">
              <div className="flex flex-col items-center justify-center rounded-2xl border-4 border-dashed border-emerald-600 bg-emerald-50/70 px-6 py-2.5 shadow-sm">
                <span className="font-mono text-xs font-black tracking-[0.25em] text-emerald-700 uppercase">
                  ✓ DIGITALLY ACCEPTED
                </span>
                <span className="font-mono text-[9px] font-semibold text-emerald-800">
                  {effectiveQuote.acceptedAt
                    ? `SIGNED: ${new Date(effectiveQuote.acceptedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}`
                    : "ESIGN & UETA BINDING VERIFIED"}
                </span>
              </div>
            </div>
          )}

          {isExpired && (
            <div className="pointer-events-none absolute top-36 right-12 z-10 -rotate-12 opacity-85 select-none">
              <div className="flex flex-col items-center justify-center rounded-2xl border-4 border-dashed border-amber-600 bg-amber-50/70 px-6 py-2.5 shadow-sm">
                <span className="font-mono text-xs font-black tracking-[0.25em] text-amber-700 uppercase">
                  ⚠ ESTIMATE EXPIRED
                </span>
                <span className="font-mono text-[9px] font-semibold text-amber-800">
                  REQUIRES RENEWAL OR UPDATED TERMS
                </span>
              </div>
            </div>
          )}

          {/* Proposal Header */}
          <div className="flex flex-col justify-between gap-6 border-b border-slate-200 pb-8 sm:flex-row sm:items-start">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl text-white shadow-sm ring-1 ring-slate-800 transition-colors duration-300"
                  style={{ backgroundColor: effectiveBrandColor }}
                >
                  {effectiveLogoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={effectiveLogoUrl}
                      alt={effectiveOrgName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FileCheck2 className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900">
                    {effectiveOrgName}
                  </h1>
                  <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                    Commercial Proposal & Scope of Work
                  </p>
                  {effectiveTaxId && (
                    <p className="font-mono text-[10px] text-slate-500">
                      Tax / VAT ID: <strong className="text-slate-700">{effectiveTaxId}</strong>
                    </p>
                  )}
                </div>
              </div>
              <p className="max-w-sm text-xs leading-relaxed text-slate-500">
                Official commercial proposal issued via FlowPilot Multi-Tenant Business OS.
              </p>
            </div>

            <div className="space-y-2 text-left sm:text-right">
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-1.5 shadow-xs">
                <FileCheck2 className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-mono text-xs font-bold tracking-wider text-slate-800">
                  ESTIMATE #{quote.quoteNumber}
                </span>
              </div>
              <div className="space-y-1 text-xs text-slate-600">
                <p>
                  <span className="text-slate-400">Date Issued:</span>{" "}
                  <strong className="font-mono text-slate-800">
                    {new Date(quote.issuedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </strong>
                </p>
                <p>
                  <span className="text-slate-400">Valid Until:</span>{" "}
                  <strong className="font-mono text-slate-800">
                    {quote.expiresAt
                      ? new Date(quote.expiresAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Open Validity"}
                  </strong>
                </p>
              </div>
            </div>
          </div>

          {/* Proposal Subject & Client Dossier */}
          <div className="my-6 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Proposal Title & Scope
              </p>
              <h2 className="mt-0.5 text-base font-bold text-slate-900">{quote.title}</h2>
              {introduction && (
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {introduction}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Prepared Exclusively For
                </span>
                <p className="mt-1 text-sm font-bold text-slate-900">{quote.customerName}</p>
                {quote.customerCompany && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                    <Building2 className="h-3 w-3 text-slate-400" />
                    {quote.customerCompany}
                  </p>
                )}
                {quote.customerEmail && (
                  <p className="mt-0.5 text-xs text-slate-500">{quote.customerEmail}</p>
                )}
                {quote.customerPhone && (
                  <p className="text-xs text-slate-500">{quote.customerPhone}</p>
                )}
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Executing Entity
                </span>
                <p className="mt-1 text-sm font-bold text-slate-900">{effectiveOrgName}</p>
                <p className="text-xs text-slate-500">FlowPilot Multi-Tenant Verified Workspace</p>
                <p className="mt-1 font-mono text-[10px] text-slate-400">
                  Status: <span className="font-semibold text-slate-700 uppercase">{quote.status}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Schedule of Deliverables Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-semibold tracking-wider text-slate-600 uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Deliverable / Service Description
                  </th>
                  <th scope="col" className="px-4 py-3 text-center">
                    Qty
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Unit Investment
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {quote.items && quote.items.length > 0 ? (
                  quote.items.map((it, idx) => (
                    <tr key={it.id || idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{it.description}</p>
                        {it.serviceName && (
                          <span className="mt-0.5 inline-block rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                            {it.serviceName}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-slate-700">{it.quantity}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700">
                        ${Number(it.unitPrice).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                        ${Number(it.amount || it.quantity * it.unitPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-center text-slate-400">
                      No line items specified.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown & Totals */}
          <div className="mt-4 flex justify-end">
            <div className="w-full max-w-xs space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono text-slate-900">${quote.subtotal.toFixed(2)}</span>
              </div>
              {quote.discountAmount > 0 && (
                <div className="flex justify-between text-xs text-emerald-600">
                  <span>
                    Discount{" "}
                    {quote.discountType === "PERCENT"
                      ? `(${quote.discountAmount}%)`
                      : "Adjustment"}
                    :
                  </span>
                  <span className="font-mono font-semibold">
                    -$
                    {quote.discountType === "PERCENT"
                      ? ((quote.subtotal * quote.discountAmount) / 100).toFixed(2)
                      : Number(quote.discountAmount).toFixed(2)}
                  </span>
                </div>
              )}
              {quote.taxAmount > 0 && (
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Tax ({quote.taxRate}%):</span>
                  <span className="font-mono text-slate-900">${quote.taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-black text-slate-900">Total Investment:</span>
                  <span className="font-mono text-lg font-black text-slate-900">
                    ${quote.totalAmount.toFixed(2)}{" "}
                    <span className="text-[10px] font-normal text-slate-500">{effectiveCurrency}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms & Conditions Block */}
          {terms && (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Terms & Acceptance Conditions
              </p>
              <p className="mt-1 font-mono text-[11px] leading-relaxed whitespace-pre-line text-slate-600">
                {terms}
              </p>
            </div>
          )}

          {/* Official Sign-Off & Verification Block */}
          <div className="mt-8 border-t border-slate-200 pt-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Authorized Client Signature */}
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Client Digital Sign-Off
                </p>
                {isAccepted ? (
                  <div className="mt-2 space-y-1">
                    <p className="font-serif text-lg font-bold italic text-slate-800">
                      {quote.signerName || quote.customerName}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Digitally Signed & Approved
                    </p>
                    {quote.acceptedAt && (
                      <p className="font-mono text-[10px] text-slate-500">
                        Timestamp: {new Date(quote.acceptedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    <div className="h-10 border-b border-dashed border-slate-300" />
                    <p className="text-[10px] text-slate-400">
                      Authorized Signature Line (Pending Acceptance)
                    </p>
                  </div>
                )}
              </div>

              {/* Service Provider Authorization */}
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  FlowPilot Workspace Authorization
                </p>
                <div className="mt-2 space-y-1">
                  <p className="font-serif text-lg font-bold italic text-slate-800">
                    {effectiveOrgName}
                  </p>
                  <p className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Certified Commercial Proposal
                  </p>
                  <p className="font-mono text-[10px] text-slate-500">
                    Issued: {new Date(quote.issuedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Security Footer */}
            <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-slate-100 pt-4 text-[10px] text-slate-400 sm:flex-row">
              <span className="font-mono font-bold tracking-wider text-slate-500">
                {verificationHash}
              </span>
              <span className="flex items-center gap-1 font-semibold text-slate-500">
                <Lock className="h-3 w-3 text-emerald-500" />
                256-Bit Encrypted Audit Trail • ESIGN & UETA Compliant
              </span>
              <span>Page 1 of 1</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

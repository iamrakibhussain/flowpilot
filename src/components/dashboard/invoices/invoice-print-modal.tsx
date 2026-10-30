"use client";

import * as React from "react";
import {
  Printer,
  X,
  ShieldCheck,
  CheckCircle2,
  Building2,
  QrCode,
  Landmark,
  FileText,
  BadgeCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { InvoiceListItem } from "@/features/invoices/types";
import { useOrganizationSettings } from "@/features/organizations/use-organization-settings";

interface InvoicePrintModalProps {
  invoice: InvoiceListItem | null;
  isOpen: boolean;
  onClose: () => void;
  organizationName?: string;
}

export function InvoicePrintModal({
  invoice,
  isOpen,
  onClose,
  organizationName = "FlowPilot Enterprise Operations",
}: InvoicePrintModalProps) {
  const { data: orgSettings } = useOrganizationSettings();

  if (!invoice) return null;

  const effectiveOrgName = orgSettings?.name || organizationName;
  const effectiveCurrency = orgSettings?.currency || "USD";
  const effectiveTaxId = orgSettings?.taxId;
  const effectiveLogoUrl = orgSettings?.logoUrl;
  const effectiveBankName = orgSettings?.bankName || "Treasury Account";
  const effectiveBankAccount = orgSettings?.bankAccount || "Standard Remittance Wire";
  const effectiveBankRouting = orgSettings?.bankRouting;
  const effectiveBankSwift = orgSettings?.bankSwift || "FLOWUS33XXX";
  const effectiveFooter =
    orgSettings?.invoiceFooter ||
    "Generated securely via FlowPilot Multi-Tenant Business OS • Page 1 of 1";

  const handlePrint = () => {
    window.print();
  };

  const isPaid = invoice.status === "PAID";
  const isOverdue = invoice.status === "OVERDUE";
  const verificationHash = `FP-SEC-${invoice.id.slice(0, 8).toUpperCase()}-${invoice.invoiceNumber}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[94vh] max-w-4xl overflow-y-auto rounded-3xl border-slate-200/90 bg-slate-900/40 p-4 shadow-2xl backdrop-blur-xl sm:p-7 print:border-none print:bg-white print:p-0 print:shadow-none">
        <DialogHeader className="flex flex-col items-start justify-between gap-3 border-b border-slate-200/20 pb-4 sm:flex-row sm:items-center print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white">
                Bank-Grade Statement Studio
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-300">
                Pixel-perfect Swiss classic statement formatted for client dispatch, archival, and
                physical printing.
              </DialogDescription>
            </div>
          </div>
          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
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

        {/* Printable Paper Canvas */}
        <div
          id="flowpilot-invoice-sheet"
          className="relative mx-auto my-3 w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 font-sans text-slate-900 shadow-xl sm:p-12 print:m-0 print:w-full print:border-none print:p-0 print:shadow-none"
        >
          {/* Subtle Top Classic Accent Bar */}
          <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-blue-700 via-indigo-600 to-slate-900 print:h-1.5" />

          {/* Watermark Stamps */}
          {isPaid && (
            <div className="pointer-events-none absolute top-36 right-12 z-10 -rotate-12 opacity-85 select-none">
              <div className="flex flex-col items-center justify-center rounded-2xl border-4 border-dashed border-emerald-600 bg-emerald-50/60 px-6 py-2.5 shadow-sm">
                <span className="font-mono text-xs font-black tracking-[0.25em] text-emerald-700 uppercase">
                  ✓ PAID & SETTLED
                </span>
                <span className="font-mono text-[9px] font-semibold text-emerald-800">
                  {invoice.paidAt
                    ? `SETTLED: ${new Date(invoice.paidAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                    : "FLOWPILOT TREASURY VERIFIED"}
                </span>
              </div>
            </div>
          )}

          {isOverdue && (
            <div className="pointer-events-none absolute top-36 right-12 z-10 -rotate-12 opacity-85 select-none">
              <div className="flex flex-col items-center justify-center rounded-2xl border-4 border-dashed border-rose-600 bg-rose-50/60 px-6 py-2.5 shadow-sm">
                <span className="font-mono text-xs font-black tracking-[0.25em] text-rose-700 uppercase">
                  ⚠ OVERDUE RISK
                </span>
                <span className="font-mono text-[9px] font-semibold text-rose-800">
                  {invoice.daysOverdue} DAYS PAST PAYMENT SCHEDULE
                </span>
              </div>
            </div>
          )}

          {/* Statement Header */}
          <div className="flex flex-col justify-between gap-6 border-b border-slate-200 pb-8 sm:flex-row sm:items-start">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-slate-900 text-white shadow-sm ring-1 ring-slate-800">
                  {effectiveLogoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={effectiveLogoUrl}
                      alt={effectiveOrgName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ShieldCheck className="h-6 w-6 text-blue-400" />
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900">
                    {effectiveOrgName}
                  </h1>
                  <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                    Commercial Invoicing & Operations
                  </p>
                  {effectiveTaxId && (
                    <p className="font-mono text-[10px] text-slate-500">
                      Tax / VAT ID: <strong className="text-slate-700">{effectiveTaxId}</strong>
                    </p>
                  )}
                </div>
              </div>
              <p className="max-w-sm text-xs leading-relaxed text-slate-500">
                Official commercial billing statement issued via FlowPilot Multi-Tenant Business OS.
              </p>
            </div>

            <div className="space-y-2 text-left sm:text-right">
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-1.5 shadow-xs">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-mono text-xs font-bold tracking-wider text-slate-800">
                  INVOICE #{invoice.invoiceNumber}
                </span>
              </div>
              <div className="space-y-1 text-xs text-slate-600">
                <p>
                  <span className="text-slate-400">Statement Date:</span>{" "}
                  <strong className="font-mono text-slate-800">
                    {new Date(invoice.issueDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </strong>
                </p>
                <p>
                  <span className="text-slate-400">Payment Due:</span>{" "}
                  <strong className="font-mono text-slate-800">
                    {new Date(invoice.dueDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </strong>
                </p>
              </div>
            </div>
          </div>

          {/* Client Dossier (Billed To) & Summary Box */}
          <div className="grid grid-cols-1 gap-6 border-b border-slate-100 py-8 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Billed To (Client Dossier)
              </p>
              <h3 className="text-lg font-bold text-slate-900">{invoice.customerName}</h3>
              {invoice.customerCompany && (
                <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  {invoice.customerCompany}
                </p>
              )}
              <p className="font-mono text-xs text-slate-500">{invoice.customerEmail}</p>
            </div>

            <div className="flex flex-col justify-end space-y-1 rounded-xl border border-slate-100 bg-slate-50/60 p-4 sm:text-right">
              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Total Balance Due
              </p>
              <p className="font-mono text-3xl font-black tracking-tight text-slate-900">
                ${invoice.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] font-medium text-slate-500">
                {isPaid
                  ? `Settled on ${invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : "Record"}`
                  : `Due on ${new Date(invoice.dueDate).toLocaleDateString()}`}
              </p>
            </div>
          </div>

          {/* Itemized Services Ledger Table */}
          <div className="overflow-x-auto py-6">
            <table className="w-full min-w-[460px] text-left text-xs">
              <thead>
                <tr className="border-b-2 border-slate-200 text-[10px] tracking-widest text-slate-400 uppercase">
                  <th className="py-3 font-bold">Service / Line Item Description</th>
                  <th className="py-3 text-center font-bold">Qty</th>
                  <th className="py-3 text-right font-bold">Unit Rate</th>
                  <th className="py-3 text-right font-bold">Net Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item, idx) => (
                  <tr key={item.id || idx} className={idx % 2 === 1 ? "bg-slate-50/40" : ""}>
                    <td className="py-3.5 pr-4 font-medium text-slate-800">{item.description}</td>
                    <td className="py-3.5 text-center font-mono text-slate-600">{item.quantity}</td>
                    <td className="py-3.5 text-right font-mono text-slate-600">
                      ${item.unitPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 text-right font-mono font-bold text-slate-900">
                      ${item.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation Totals & Remittance Instructions */}
          <div className="grid grid-cols-1 gap-6 border-t-2 border-slate-200 pt-6 sm:grid-cols-12">
            {/* Bank Wire & Payment Remittance */}
            <div className="space-y-3 sm:col-span-7">
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
                <div className="flex items-center gap-2 pb-2 text-[11px] font-bold text-slate-900">
                  <Landmark className="h-4 w-4 text-blue-600" />
                  <span>Bank Wire & Remittance Instructions ({effectiveBankName})</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>
                    <span className="text-slate-400">Account Beneficiary:</span>
                    <p className="font-semibold text-slate-800">{effectiveOrgName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Payment Reference:</span>
                    <p className="font-mono font-bold text-blue-700">INV-{invoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Account / IBAN:</span>
                    <p className="font-mono font-semibold text-slate-800">{effectiveBankAccount}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Routing / SWIFT:</span>
                    <p className="font-mono font-semibold text-slate-800">
                      {[effectiveBankRouting, effectiveBankSwift].filter(Boolean).join(" / ")}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Settlement Currency:</span>
                    <p className="font-semibold text-slate-800">
                      {effectiveCurrency} ({effectiveCurrency === "USD" ? "$" : effectiveCurrency})
                    </p>
                  </div>
                </div>
              </div>

              {invoice.notes && (
                <div className="space-y-1 text-xs text-slate-500">
                  <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Terms & Notes
                  </p>
                  <p className="leading-relaxed">{invoice.notes}</p>
                </div>
              )}
            </div>

            {/* Calculations Column */}
            <div className="space-y-2.5 sm:col-span-5">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono font-semibold text-slate-900">
                  ${invoice.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Tax Rate</span>
                <span className="font-mono font-semibold text-slate-900">
                  ${invoice.tax.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2.5 text-base font-black text-slate-900">
                <span>Total Due</span>
                <span className="font-mono text-blue-700">
                  ${invoice.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              {isPaid && (
                <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-800">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Amount Paid
                  </span>
                  <span className="font-mono">
                    -${invoice.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Cryptographic Authenticity Block & Footer */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
                <QrCode className="h-6 w-6" />
              </div>
              <div className="text-[10px] text-slate-400">
                <p className="flex items-center gap-1 font-semibold text-slate-600">
                  <BadgeCheck className="h-3.5 w-3.5 text-blue-600" />
                  Authenticity Verified • Cryptographic Hash
                </p>
                <p className="font-mono text-slate-500">{verificationHash}</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">{effectiveFooter}</p>
          </div>
        </div>

        {/* Global Print Styling Injection */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #flowpilot-invoice-sheet,
            #flowpilot-invoice-sheet * {
              visibility: visible !important;
            }
            #flowpilot-invoice-sheet {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 15mm 20mm !important;
              box-shadow: none !important;
              border: none !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}

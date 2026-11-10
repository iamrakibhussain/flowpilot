"use client";

import * as React from "react";
import Link from "next/link";
import {
  X,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Printer,
  Copy,
  Check,
  Ban,
  Receipt,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUpdateInvoiceStatus } from "@/features/invoices/use-invoices";
import { useSendInvoiceEmail } from "@/features/notifications/use-notifications";
import type { InvoiceListItem } from "@/features/invoices/types";

interface InvoiceQuickPeekDrawerProps {
  invoice: InvoiceListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenRecordPayment: (invoice: InvoiceListItem) => void;
  onOpenPrintModal: (invoice: InvoiceListItem) => void;
  onOpenShareModal?: (invoice: InvoiceListItem) => void;
  organizationId?: string;
}

export function InvoiceQuickPeekDrawer({
  invoice,
  isOpen,
  onClose,
  onOpenRecordPayment,
  onOpenPrintModal,
  onOpenShareModal,
  organizationId,
}: InvoiceQuickPeekDrawerProps) {
  const updateStatusMutation = useUpdateInvoiceStatus();
  const sendEmailMutation = useSendInvoiceEmail();

  const [copiedSummary, setCopiedSummary] = React.useState(false);
  const [copiedNumber, setCopiedNumber] = React.useState(false);
  const [emailSentMsg, setEmailSentMsg] = React.useState<string | null>(null);

  const handleSendEmail = async () => {
    if (!invoice) return;
    try {
      const res = await sendEmailMutation.mutateAsync(invoice.id);
      setEmailSentMsg(`Delivered to ${res.deliveredTo}`);
      setTimeout(() => setEmailSentMsg(null), 5000);
    } catch (err: unknown) {
      setEmailSentMsg(err instanceof Error ? err.message : "Failed to send");
      setTimeout(() => setEmailSentMsg(null), 5000);
    }
  };
  const [isConfirmingCancel, setIsConfirmingCancel] = React.useState(false);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !invoice) return null;

  const isPaid = invoice.status === "PAID";
  const isOverdue = invoice.status === "OVERDUE";
  const isCancelled = invoice.status === "CANCELLED";

  const handleCopySummary = async () => {
    const summaryText = `[FlowPilot Official Statement]
Statement #: ${invoice.invoiceNumber}
Client: ${invoice.customerName} (${invoice.customerEmail})
Status: ${invoice.status}
Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}
Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}
Total Due: $${invoice.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
Line Items:
${invoice.items.map((it) => `• ${it.description} — ${it.quantity}x @ $${it.unitPrice} = $${it.amount}`).join("\n")}`;

    await navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleCopyNumber = async () => {
    await navigator.clipboard.writeText(invoice.invoiceNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleVoidInvoice = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        id: invoice.id,
        status: "CANCELLED",
        organizationId,
      });
      setIsConfirmingCancel(false);
      onClose();
    } catch (err) {
      console.error("Failed to void invoice:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop with Frosted Glass Blur */}
      <div
        className="animate-in fade-in fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
        <div className="animate-in slide-in-from-right border-border/80 bg-card text-foreground relative flex h-full w-screen max-w-xl flex-col border-l shadow-2xl duration-300">
          {/* Executive Header */}
          <div className="border-border/60 bg-muted/30 flex items-center justify-between border-b px-4 py-4.5 backdrop-blur-md sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-mono text-sm font-bold">
                    #{invoice.invoiceNumber}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    title="Copy statement number"
                    className="text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded-md p-1 transition-colors"
                  >
                    {copiedNumber ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Issued:{" "}
                  {new Date(invoice.issueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {isPaid ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-700 shadow-2xs dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Paid & Settled
                </span>
              ) : isOverdue ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/25 bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-700 shadow-2xs dark:text-rose-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
                  Overdue ({invoice.daysOverdue}d)
                </span>
              ) : isCancelled ? (
                <span className="border-border bg-muted/60 text-muted-foreground inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold line-through">
                  Void / Cancelled
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-700 shadow-2xs dark:text-amber-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Pending Payment
                </span>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-muted-foreground hover:bg-muted hover:text-foreground h-9 w-9 cursor-pointer rounded-xl"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-7">
            {/* Financial Hero Card with Watermark Stamp */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-900/90 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-4 text-white shadow-xl sm:rounded-3xl sm:p-6">
              {/* Atmospheric Glow */}
              <div className="pointer-events-none absolute top-0 right-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-blue-500/20 blur-3xl" />
              <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 -translate-x-10 translate-y-10 rounded-full bg-indigo-500/15 blur-2xl" />

              {/* Vintage Watermark Stamp */}
              {isPaid && (
                <div className="pointer-events-none absolute top-4 right-4 z-20 rotate-[-12deg] rounded-lg border-2 border-emerald-400/80 bg-emerald-950/50 px-2.5 py-0.5 text-center font-mono text-[10px] font-black tracking-widest text-emerald-400 uppercase shadow-lg backdrop-blur-sm sm:top-6 sm:right-6 sm:rounded-xl sm:px-3.5 sm:py-1 sm:text-xs">
                  ✓ PAID & SETTLED
                </div>
              )}
              {isOverdue && (
                <div className="pointer-events-none absolute top-4 right-4 z-20 rotate-[-12deg] rounded-lg border-2 border-rose-500/80 bg-rose-950/50 px-2.5 py-0.5 text-center font-mono text-[10px] font-black tracking-widest text-rose-400 uppercase shadow-lg backdrop-blur-sm sm:top-6 sm:right-6 sm:rounded-xl sm:px-3.5 sm:py-1 sm:text-xs">
                  ⚠ OVERDUE RISK
                </div>
              )}

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold tracking-widest text-slate-400 uppercase">
                    Total Statement Balance
                  </span>
                  <span className="font-mono text-slate-400">
                    {invoice.itemsCount} line {invoice.itemsCount === 1 ? "item" : "items"}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-black tracking-tight text-white sm:text-4xl">
                    ${invoice.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="font-mono text-xs text-blue-300">USD</span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-3 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                      Due: <strong>{new Date(invoice.dueDate).toLocaleDateString()}</strong>
                    </span>
                  </div>

                  {isPaid ? (
                    <span className="flex items-center gap-1 font-semibold text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Reconciled in full
                    </span>
                  ) : isOverdue ? (
                    <span className="flex items-center gap-1 font-bold text-rose-400">
                      <AlertCircle className="h-3.5 w-3.5" /> Past due deadline
                    </span>
                  ) : (
                    <span className="font-semibold text-amber-300">Awaiting client payment</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Toolbar */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {!isPaid && !isCancelled && (
                <Button
                  onClick={() => onOpenRecordPayment(invoice)}
                  className="cursor-pointer gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 active:scale-98"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Record Pay</span>
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => onOpenPrintModal(invoice)}
                className="border-border/80 text-foreground hover:bg-muted cursor-pointer gap-1.5 rounded-xl text-xs font-semibold shadow-2xs"
              >
                <Printer className="text-muted-foreground h-3.5 w-3.5" />
                <span>Print / PDF</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleCopySummary}
                className="border-border/80 text-foreground hover:bg-muted cursor-pointer gap-1.5 rounded-xl text-xs font-semibold shadow-2xs"
              >
                {copiedSummary ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="text-muted-foreground h-3.5 w-3.5" />
                    <span>Summary</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  if (onOpenShareModal) {
                    onOpenShareModal(invoice);
                  }
                }}
                className="cursor-pointer gap-1.5 rounded-xl border-blue-200 bg-blue-50/70 text-xs font-bold text-blue-700 shadow-2xs hover:bg-blue-100"
              >
                <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
                <span>Share Pay Link</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleSendEmail}
                disabled={sendEmailMutation.isPending}
                className="cursor-pointer gap-1.5 rounded-xl border-emerald-200 bg-emerald-50/80 text-xs font-bold text-emerald-700 shadow-2xs hover:bg-emerald-100 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5 text-emerald-600" />
                <span>{sendEmailMutation.isPending ? "Sending..." : "Send Email"}</span>
              </Button>
            </div>

            {emailSentMsg && (
              <div className="flex items-center gap-1.5 rounded-xl border border-emerald-200/80 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>{emailSentMsg}</span>
              </div>
            )}

            {/* Hosted Client Checkout Portal (Live Simulator Card) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                  Hosted Client Checkout Portal
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:border dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Stripe & Apple Pay Ready
                </span>
              </div>

              <div className="border-border/80 bg-muted/30 text-foreground rounded-2xl border p-4 shadow-2xs">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-foreground truncate font-mono text-xs font-semibold">
                      /pay/[token] • Multi-Tenant Online Settlement
                    </p>
                    <p className="text-muted-foreground text-[10px]">
                      Zero-friction client checkout with WhatsApp, Email & dynamic QR code
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (onOpenShareModal) {
                        onOpenShareModal(invoice);
                      }
                    }}
                    className="h-7.5 shrink-0 rounded-lg border-blue-200 bg-blue-50 text-[11px] font-bold text-blue-700 shadow-2xs hover:bg-blue-100"
                  >
                    Open Share Hub
                  </Button>
                </div>
              </div>
            </div>

            {/* Client Dossier Card */}
            <div className="space-y-2">
              <span className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                Client Dossier
              </span>
              <Card className="border-border/80 bg-card hover:border-border rounded-2xl border p-4.5 shadow-2xs transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-100 to-indigo-100 text-sm font-bold text-blue-700 ring-1 ring-blue-500/20 dark:from-blue-950 dark:to-indigo-950 dark:text-blue-300">
                      {invoice.customerName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-foreground text-sm font-bold">{invoice.customerName}</h4>
                      {invoice.customerCompany && (
                        <p className="text-muted-foreground flex items-center gap-1 text-xs">
                          <Building2 className="text-muted-foreground h-3 w-3" />
                          {invoice.customerCompany}
                        </p>
                      )}
                      <p className="text-muted-foreground truncate text-xs">
                        {invoice.customerEmail}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/customers/${invoice.customerId}`}
                    className="border-border/80 bg-muted/40 hover:bg-muted/70 text-primary inline-flex cursor-pointer items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors"
                  >
                    <span>CRM Profile</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </Card>
            </div>

            {/* Itemized Line Items Table */}
            <div className="space-y-2">
              <span className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                Itemized Breakdown
              </span>
              <div className="border-border/80 bg-card overflow-hidden rounded-2xl border shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="border-border/60 bg-muted/40 text-muted-foreground border-b text-[10px] font-semibold tracking-wider uppercase sm:text-xs">
                    <tr>
                      <th className="px-5 py-3">Item Description</th>
                      <th className="px-3 py-3 text-center">Qty</th>
                      <th className="px-4 py-3 text-right">Unit Rate</th>
                      <th className="px-5 py-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-border/40 text-foreground divide-y">
                    {invoice.items.map((it, idx) => (
                      <tr key={it.id || idx} className="hover:bg-muted/30 transition-colors">
                        <td className="text-foreground px-5 py-3.5 font-semibold">
                          {it.description}
                        </td>
                        <td className="text-muted-foreground px-3 py-3.5 text-center">
                          {it.quantity}
                        </td>
                        <td className="text-muted-foreground px-4 py-3.5 text-right font-mono">
                          ${it.unitPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="text-foreground px-5 py-3.5 text-right font-mono font-bold">
                          ${it.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Subtotals Box */}
                <div className="border-border/60 bg-muted/30 space-y-1.5 border-t px-5 py-4 text-xs">
                  <div className="text-muted-foreground flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-foreground font-mono font-semibold">
                      ${invoice.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="text-muted-foreground flex justify-between">
                    <span>Estimated Sales Tax</span>
                    <span className="text-foreground font-mono font-semibold">
                      ${invoice.tax.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="border-border/80 text-foreground flex justify-between border-t pt-2 text-sm font-bold">
                    <span>Total Due</span>
                    <span className="font-mono text-base font-bold text-blue-600 dark:text-blue-400">
                      ${invoice.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes & Audit History */}
            {invoice.notes && (
              <div className="space-y-1.5">
                <span className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                  Payment History & Audit Notes
                </span>
                <div className="border-border/80 bg-muted/30 text-foreground rounded-2xl border p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap shadow-2xs">
                  {invoice.notes}
                </div>
              </div>
            )}

            {/* Bank-Grade Statement Lifecycle & Audit Trail */}
            <div className="space-y-2">
              <span className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                Lifecycle & Settlement Audit Trail
              </span>
              <div className="border-border/80 bg-muted/20 rounded-2xl border p-4.5 shadow-2xs">
                <ol className="border-border/80 relative ml-2 space-y-4 border-l text-xs">
                  {/* Step 1: Statement Generated */}
                  <li className="ml-4">
                    <span className="ring-card absolute -left-1.5 mt-1 flex h-3 w-3 items-center justify-center rounded-full bg-blue-600 ring-4" />
                    <div className="flex items-center justify-between">
                      <p className="text-foreground font-bold">Statement Issued & Billed</p>
                      <time className="text-muted-foreground font-mono text-[10px]">
                        {new Date(invoice.issueDate).toLocaleDateString()}
                      </time>
                    </div>
                    <p className="text-muted-foreground text-[11px]">
                      Logged in organization ledger with #{invoice.invoiceNumber}.
                    </p>
                  </li>

                  {/* Step 2: Client Dispatch & Due Schedule */}
                  <li className="ml-4">
                    <span className="ring-card bg-muted-foreground/60 absolute -left-1.5 mt-1 flex h-3 w-3 items-center justify-center rounded-full ring-4" />
                    <div className="flex items-center justify-between">
                      <p className="text-foreground font-bold">Payment Due Schedule</p>
                      <time className="text-muted-foreground font-mono text-[10px]">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </time>
                    </div>
                    <p className="text-muted-foreground text-[11px]">
                      Terms net due date linked to client CRM profile.
                    </p>
                  </li>

                  {/* Step 3: Clearing & Settlement */}
                  <li className="ml-4">
                    <span
                      className={`ring-card absolute -left-1.5 mt-1 flex h-3 w-3 items-center justify-center rounded-full ring-4 ${
                        isPaid
                          ? "bg-emerald-600"
                          : isOverdue
                            ? "animate-pulse bg-rose-600"
                            : "bg-amber-500"
                      }`}
                    />
                    <div className="flex items-center justify-between">
                      <p
                        className={`font-bold ${
                          isPaid
                            ? "text-emerald-600 dark:text-emerald-400"
                            : isOverdue
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {isPaid
                          ? "Reconciled & Cleared"
                          : isOverdue
                            ? "Overdue Payment Risk"
                            : "Awaiting Clearance"}
                      </p>
                      <time className="text-muted-foreground font-mono text-[10px]">
                        {invoice.paidAt
                          ? new Date(invoice.paidAt).toLocaleDateString()
                          : isOverdue
                            ? `${invoice.daysOverdue}d past due`
                            : "Pending"}
                      </time>
                    </div>
                    <p className="text-muted-foreground text-[11px]">
                      {isPaid
                        ? "Settlement confirmed and added to recognized revenue."
                        : isOverdue
                          ? "Statement past due schedule; follow-up reminder recommended."
                          : "Awaiting bank wire deposit or online checkout clearance."}
                    </p>
                  </li>
                </ol>
              </div>
            </div>

            {/* Void / Cancel Action Confirmation */}
            {!isPaid && !isCancelled && (
              <div className="border-border/60 border-t pt-4">
                {isConfirmingCancel ? (
                  <div className="space-y-2.5 rounded-2xl border border-rose-200 bg-rose-50/90 p-4">
                    <p className="text-xs font-bold text-rose-800">
                      Are you sure you want to void / cancel this statement?
                    </p>
                    <p className="text-[11px] text-rose-700/80">
                      This action will mark the invoice as cancelled and exclude it from active
                      receivables.
                    </p>
                    <div className="flex gap-2 pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={handleVoidInvoice}
                        disabled={updateStatusMutation.isPending}
                        className="cursor-pointer rounded-xl text-xs font-bold"
                      >
                        {updateStatusMutation.isPending ? "Voiding..." : "Yes, Void Invoice"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setIsConfirmingCancel(false)}
                        className="border-border/80 text-foreground hover:bg-muted cursor-pointer rounded-xl text-xs font-semibold"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsConfirmingCancel(true)}
                    className="text-muted-foreground cursor-pointer text-xs hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400"
                  >
                    <Ban className="mr-1.5 h-3.5 w-3.5" />
                    <span>Void / Cancel Invoice</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import {
  X,
  Building2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  Clock,
  Trash2,
  FolderKanban,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useSendQuote,
  useConvertQuoteToInvoice,
  useDeleteQuote,
} from "@/features/quotes/use-quotes";
import type { QuoteListItem, QuoteStatusType } from "@/features/quotes/types";

interface QuoteQuickPeekDrawerProps {
  quote: QuoteListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenInvoice?: (invoiceId: string) => void;
  onPrint?: (quote: QuoteListItem) => void;
}

export function QuoteQuickPeekDrawer({
  quote,
  isOpen,
  onClose,
  onOpenInvoice,
  onPrint,
}: QuoteQuickPeekDrawerProps) {
  const sendQuoteMutation = useSendQuote();
  const convertMutation = useConvertQuoteToInvoice();
  const deleteMutation = useDeleteQuote();

  const [copiedLink, setCopiedLink] = React.useState(false);
  const [copiedNumber, setCopiedNumber] = React.useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = React.useState<string | null>(null);

  if (!isOpen || !quote) return null;

  const handleCopyLink = () => {
    if (quote.publicToken) {
      const url = `${window.location.origin}/quote/${quote.publicToken}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } else {
      // Trigger send to generate link
      handleSendQuote();
    }
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(quote.quoteNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleSendQuote = async () => {
    try {
      const res = await sendQuoteMutation.mutateAsync(quote.id);
      navigator.clipboard.writeText(res.publicUrl);
      setCopiedLink(true);
      setActionSuccessMsg(`Link copied & statement sent to ${res.deliveredTo}`);
      setTimeout(() => {
        setCopiedLink(false);
        setActionSuccessMsg(null);
      }, 5000);
    } catch (err: unknown) {
      setActionSuccessMsg(err instanceof Error ? err.message : "Failed to dispatch proposal");
      setTimeout(() => setActionSuccessMsg(null), 5000);
    }
  };

  const handleConvertToInvoice = async () => {
    try {
      const res = await convertMutation.mutateAsync(quote.id);
      setActionSuccessMsg(`Converted to Invoice #${res.invoiceNumber}!`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
      if (onOpenInvoice) {
        onOpenInvoice(res.invoiceId);
      }
    } catch (err: unknown) {
      setActionSuccessMsg(err instanceof Error ? err.message : "Conversion failed");
      setTimeout(() => setActionSuccessMsg(null), 4000);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete proposal ${quote.quoteNumber}?`)) return;
    try {
      await deleteMutation.mutateAsync(quote.id);
      onClose();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const getStatusBadge = (status: QuoteStatusType) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="h-3 w-3" /> Digitally Accepted
          </span>
        );
      case "SENT":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
            <Send className="h-3 w-3" /> Sent to Client
          </span>
        );
      case "VIEWED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-600">
            <Clock className="h-3 w-3" /> Viewed by Client
          </span>
        );
      case "DECLINED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-600">
            <AlertCircle className="h-3 w-3" /> Declined
          </span>
        );
      case "EXPIRED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
            <AlertCircle className="h-3 w-3" /> Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-500/20 bg-slate-500/10 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
            Draft Mode
          </span>
        );
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs transition-opacity duration-300"
    >
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-background border-border flex h-full w-screen max-w-full flex-col border-l shadow-2xl sm:max-w-md"
        >
          {/* Header */}
          <div className="border-border flex items-center justify-between border-b p-4 sm:p-5">
            <div className="flex min-w-0 items-center gap-2.5 pr-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <FileCheck2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-foreground truncate font-mono text-sm font-bold tracking-tight">
                    {quote.quoteNumber}
                  </span>
                  <button
                    onClick={handleCopyNumber}
                    className="text-muted-foreground hover:text-foreground shrink-0 p-0.5 transition-colors"
                    title="Copy Estimate Number"
                  >
                    {copiedNumber ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
                <p className="text-muted-foreground truncate text-xs">{quote.title}</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground h-8 w-8 shrink-0 rounded-full p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Feedback banner */}
          {actionSuccessMsg && (
            <div className="animate-in fade-in m-4 mb-0 flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-xs font-medium text-blue-600">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            {/* Status card */}
            <div className="bg-muted/40 border-border/80 flex items-center justify-between rounded-2xl border p-3.5">
              <div className="space-y-1">
                <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                  Proposal Status
                </span>
                <div>{getStatusBadge(quote.status)}</div>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                  Estimated Total
                </span>
                <p className="text-foreground font-mono text-lg font-bold">
                  ${quote.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Client info */}
            <div className="space-y-2">
              <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Client Information
              </span>
              <div className="bg-background border-border/80 space-y-1.5 rounded-2xl border p-3.5 text-xs">
                <div className="text-foreground text-sm font-semibold">{quote.customerName}</div>
                {quote.customerCompany && (
                  <div className="text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    <span>{quote.customerCompany}</span>
                  </div>
                )}
                <div className="text-muted-foreground">{quote.customerEmail}</div>
                {quote.customerPhone && (
                  <div className="text-muted-foreground">{quote.customerPhone}</div>
                )}
              </div>
            </div>

            {/* Deliverables / Line items */}
            <div className="space-y-2">
              <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Scope & Deliverables ({quote.itemsCount})
              </span>
              <div className="border-border/80 divide-border bg-background divide-y overflow-hidden rounded-2xl border">
                {quote.items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between gap-3 p-3 text-xs">
                    <div className="flex-1 space-y-0.5">
                      <div className="text-foreground font-medium">{it.description}</div>
                      <div className="text-muted-foreground text-[11px]">
                        {it.quantity} × ${it.unitPrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-foreground font-mono font-semibold">
                      ${it.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Acceptance Audit (if accepted) */}
            {quote.status === "ACCEPTED" && quote.signerName && (
              <div className="space-y-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="h-4 w-4" /> Legal Electronic Acceptance Audit
                </div>
                <div className="text-muted-foreground space-y-1 text-xs">
                  <div>
                    Signer: <strong className="text-foreground">{quote.signerName}</strong>
                  </div>
                  {quote.acceptedAt && (
                    <div>
                      Timestamp:{" "}
                      <span className="font-mono text-[11px]">
                        {new Date(quote.acceptedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {quote.convertedInvoiceNumber && (
                    <div className="border-t border-emerald-500/20 pt-1 font-medium text-emerald-600">
                      ✓ Converted to Invoice #{quote.convertedInvoiceNumber}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Conversion CTA */}
            {quote.status === "ACCEPTED" && !quote.convertedInvoiceId && (
              <Button
                onClick={handleConvertToInvoice}
                disabled={convertMutation.isPending}
                className="w-full gap-2 rounded-xl bg-emerald-600 font-medium text-white hover:bg-emerald-700"
              >
                <FileCheck2 className="h-4 w-4" />
                {convertMutation.isPending ? "Converting..." : "1-Click Convert to Invoice"}
              </Button>
            )}

            {quote.status === "ACCEPTED" && (
              <Button
                variant="outline"
                asChild
                className="border-primary/40 text-primary hover:bg-primary/10 w-full gap-2 rounded-xl text-xs font-medium"
              >
                <Link
                  href={`/dashboard/projects?new=true&quoteId=${quote.id}&customerId=${quote.customerId}&title=${encodeURIComponent(
                    quote.title
                  )}&budget=${quote.totalAmount}`}
                >
                  <FolderKanban className="h-4 w-4" />
                  Launch Delivery Project
                </Link>
              </Button>
            )}

            {quote.convertedInvoiceId && (
              <div className="flex items-center justify-between rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-xs">
                <span className="font-medium text-blue-700 dark:text-blue-400">
                  Active Invoice Linked
                </span>
                <Link
                  href="/dashboard/invoices"
                  className="flex items-center gap-1 font-semibold text-blue-600 hover:underline"
                >
                  View Invoices <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-border bg-muted/20 space-y-2 border-t p-3.5 sm:p-4">
            {onPrint && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPrint(quote)}
                className="border-border/80 h-10 w-full gap-1.5 rounded-xl text-xs font-bold sm:h-9"
              >
                <Printer className="h-3.5 w-3.5" />
                Print / Export Proposal PDF
              </Button>
            )}

            <div className="grid grid-cols-1 gap-2 xs:grid-cols-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                disabled={sendQuoteMutation.isPending}
                className="h-9 gap-1.5 rounded-xl text-xs font-semibold"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" /> Copied Link!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy Client Link
                  </>
                )}
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={handleSendQuote}
                disabled={sendQuoteMutation.isPending}
                className="h-9 gap-1.5 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700"
              >
                <Send className="h-3.5 w-3.5" />
                {sendQuoteMutation.isPending ? "Sending..." : "Send by Email"}
              </Button>
            </div>

            {quote.status !== "ACCEPTED" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="text-muted-foreground hover:text-destructive h-8 w-full gap-1 text-xs"
              >
                <Trash2 className="h-3 w-3" /> Delete Proposal
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

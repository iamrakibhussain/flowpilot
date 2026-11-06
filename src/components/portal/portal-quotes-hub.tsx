"use client";

import * as React from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Search,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  X,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { PortalQuoteSummary, AcceptPortalQuoteInput } from "@/features/portal/types";

interface PortalQuotesHubProps {
  quotes: PortalQuoteSummary[];
  brandColor?: string;
  currency?: string;
  customerName: string;
  customerEmail: string;
  onAcceptQuote: (
    quoteId: string,
    input: AcceptPortalQuoteInput
  ) => Promise<{ convertedInvoiceId?: string; paymentToken?: string }>;
  onOpenPaymentToken: (paymentToken: string) => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function PortalQuotesHub({
  quotes,
  brandColor = "#2563eb",
  currency = "USD",
  customerName,
  customerEmail,
  onAcceptQuote,
  onOpenPaymentToken,
  onSuccess,
  onError,
}: PortalQuotesHubProps) {
  const [selectedQuoteForAcceptance, setSelectedQuoteForAcceptance] =
    React.useState<PortalQuoteSummary | null>(null);
  const [signerName, setSignerName] = React.useState(customerName || "");
  const [clientNotes, setClientNotes] = React.useState("");
  const [acceptedDisclaimer, setAcceptedDisclaimer] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [depositPrompt, setDepositPrompt] = React.useState<{
    quoteNumber: string;
    paymentToken: string;
  } | null>(null);

  const pendingQuotes = quotes.filter(
    (q) => q.status === "SENT" || q.status === "DRAFT" || q.status === "VIEWED"
  );
  const acceptedQuotes = quotes.filter((q) => q.status === "ACCEPTED");

  const totalValue = quotes.reduce((acc, q) => acc + (Number(q.totalAmount) || 0), 0);

  const filteredQuotes = quotes.filter((q) => {
    const matches =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matches;
  });

  const handleExecuteAcceptance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuoteForAcceptance) return;
    if (!signerName.trim() || !acceptedDisclaimer) return;

    try {
      setIsSubmitting(true);
      const res = await onAcceptQuote(selectedQuoteForAcceptance.id, {
        signerName: signerName.trim(),
        signerEmail: customerEmail,
        clientNotes: clientNotes.trim() || null,
      });

      onSuccess(`Proposal ${selectedQuoteForAcceptance.quoteNumber} accepted successfully!`);
      const currentQuoteNum = selectedQuoteForAcceptance.quoteNumber;
      setSelectedQuoteForAcceptance(null);

      // If a payment token was returned for deposit invoice, show deposit prompt
      if (res.paymentToken) {
        setDepositPrompt({
          quoteNumber: currentQuoteNum,
          paymentToken: res.paymentToken,
        });
      }
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Failed to accept proposal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Telemetry Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs sm:p-5 dark:border-slate-800/90 dark:bg-slate-900">
          <CardContent className="space-y-1 p-0">
            <span className="text-xs font-semibold text-slate-500">Total Proposals</span>
            <p className="text-xl font-black text-slate-900 sm:text-2xl dark:text-slate-100">
              {quotes.length}
            </p>
            <p className="text-[11px] text-slate-400">All issued estimates</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-amber-200/90 bg-amber-50/40 p-4 shadow-2xs sm:p-5 dark:border-amber-900/60 dark:bg-amber-950/20">
          <CardContent className="space-y-1 p-0">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              Awaiting Approval
            </span>
            <p className="text-xl font-black text-amber-900 sm:text-2xl dark:text-amber-300">
              {pendingQuotes.length}
            </p>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
              Pending your review
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-emerald-200/90 bg-emerald-50/40 p-4 shadow-2xs sm:p-5 dark:border-emerald-900/60 dark:bg-emerald-950/20">
          <CardContent className="space-y-1 p-0">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Accepted Proposals
            </span>
            <p className="text-xl font-black text-emerald-900 sm:text-2xl dark:text-emerald-300">
              {acceptedQuotes.length}
            </p>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
              Approved scope
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs sm:p-5 dark:border-slate-800/90 dark:bg-slate-900">
          <CardContent className="space-y-1 p-0">
            <span className="text-xs font-semibold text-slate-500">Total Portfolio Value</span>
            <p className="text-xl font-black text-slate-900 sm:text-2xl dark:text-slate-100">
              {currency} {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-400">Across all estimates</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search proposals by title or quote #..."
          className="h-10 rounded-xl bg-slate-50 pl-9 text-xs dark:bg-slate-900"
        />
      </div>

      {/* Proposals Grid */}
      {filteredQuotes.length === 0 ? (
        <Card className="rounded-3xl border border-slate-200/90 bg-white p-10 text-center shadow-2xs dark:border-slate-800/90 dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
            <FileText className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-extrabold text-slate-900 dark:text-slate-100">
            No Proposals Found
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {searchQuery
              ? "No quotes match your search keyword."
              : "No service proposals have been issued to your portal yet."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredQuotes.map((quote) => {
            const isPending =
              quote.status === "SENT" || quote.status === "DRAFT" || quote.status === "VIEWED";
            const isAccepted = quote.status === "ACCEPTED";

            return (
              <Card
                key={quote.id}
                className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xs transition-all hover:shadow-md dark:border-slate-800/90 dark:bg-slate-900"
              >
                <div className="p-5 sm:p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-slate-500">
                          {quote.quoteNumber}
                        </span>
                        {isPending && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                            <Clock className="h-3 w-3" />
                            Awaiting Approval
                          </span>
                        )}
                        {isAccepted && (
                          <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" />
                            Accepted
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                        {quote.title}
                      </h3>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-400">Total Estimate</p>
                      <p className="text-lg font-black text-slate-900 sm:text-xl dark:text-slate-100">
                        {currency}{" "}
                        {Number(quote.totalAmount).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50/80 p-3.5 text-xs sm:grid-cols-3 dark:bg-slate-950/50">
                    <div>
                      <span className="text-[11px] font-medium text-slate-400">Issued</span>
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        {new Date(quote.issuedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-slate-400">Validity</span>
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        {quote.expiresAt ? new Date(quote.expiresAt).toLocaleDateString() : "Open"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-slate-400">Line Items</span>
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        {quote.itemsCount} Deliverables
                      </p>
                    </div>
                  </div>

                  {quote.notes && (
                    <p className="mt-3 line-clamp-2 text-xs text-slate-500 italic">
                      &quot;{quote.notes}&quot;
                    </p>
                  )}

                  {/* Actions */}
                  <div className="mt-5 flex items-center gap-3">
                    {isPending ? (
                      <Button
                        onClick={() => {
                          setSelectedQuoteForAcceptance(quote);
                          setSignerName(customerName || "");
                          setAcceptedDisclaimer(false);
                        }}
                        style={{ backgroundColor: brandColor }}
                        className="h-10 flex-1 cursor-pointer gap-2 rounded-xl text-xs font-bold text-white shadow-md shadow-blue-500/20"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Approve Proposal &amp; Pay Deposit
                      </Button>
                    ) : (
                      <div className="flex flex-1 items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" />
                          Approved on{" "}
                          {quote.acceptedAt ? new Date(quote.acceptedAt).toLocaleDateString() : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Acceptance Modal */}
      {selectedQuoteForAcceptance && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) setSelectedQuoteForAcceptance(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 backdrop-blur-md sm:p-4"
        >
          <div className="relative my-auto flex max-h-[90vh] w-full max-w-lg flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl transition-all sm:p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="space-y-1">
                <span className="font-mono text-xs font-bold text-slate-500">
                  {selectedQuoteForAcceptance.quoteNumber}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  Accept Proposal &amp; Terms
                </h3>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setSelectedQuoteForAcceptance(null)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteAcceptance} className="mt-4 space-y-4">
              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Proposal Title</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {selectedQuoteForAcceptance.title}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-slate-200/60 pt-2 text-xs dark:border-slate-800">
                  <span className="text-slate-500">Total Agreed Amount</span>
                  <span className="text-base font-black text-slate-900 dark:text-slate-100">
                    {currency} {Number(selectedQuoteForAcceptance.totalAmount).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                  Full Authorized Name *
                </label>
                <Input
                  required
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="h-10 rounded-xl bg-slate-50 font-medium dark:bg-slate-950"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                  Acceptance Notes (Optional)
                </label>
                <Input
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  placeholder="Special instructions or purchase order numbers..."
                  className="h-10 rounded-xl bg-slate-50 font-medium dark:bg-slate-950"
                />
              </div>

              <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 text-[11px] leading-relaxed text-slate-600 transition hover:bg-slate-100/80 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                <input
                  type="checkbox"
                  required
                  checked={acceptedDisclaimer}
                  onChange={(e) => setAcceptedDisclaimer(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  I accept the deliverables, pricing, and terms outlined in proposal{" "}
                  <strong>{selectedQuoteForAcceptance.quoteNumber}</strong> and authorize billing.
                </span>
              </label>

              <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => setSelectedQuoteForAcceptance(null)}
                  className="h-11 flex-1 cursor-pointer rounded-xl font-bold sm:h-10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !acceptedDisclaimer || !signerName.trim()}
                  style={{ backgroundColor: brandColor }}
                  className="h-11 flex-1 cursor-pointer gap-2 rounded-xl font-bold text-white shadow-md shadow-blue-500/20 sm:h-10"
                >
                  {isSubmitting ? "Accepting..." : "Confirm & Authorize"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post-Approval Instant Deposit Checkout Prompt */}
      {depositPrompt && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setDepositPrompt(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 backdrop-blur-md sm:p-4"
        >
          <div className="relative my-auto flex w-full max-w-md flex-col rounded-3xl border border-emerald-200 bg-white p-6 shadow-2xl dark:border-emerald-800 dark:bg-slate-900">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Sparkles className="h-7 w-7" />
            </div>

            <div className="mt-4 text-center">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                Proposal Approved!
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Proposal <strong>{depositPrompt.quoteNumber}</strong> is now accepted. An initial
                deposit invoice has been automatically generated for you.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => setDepositPrompt(null)}
                className="h-11 flex-1 cursor-pointer rounded-xl font-bold"
              >
                View Later
              </Button>
              <Button
                onClick={() => {
                  const token = depositPrompt.paymentToken;
                  setDepositPrompt(null);
                  onOpenPaymentToken(token);
                }}
                style={{ backgroundColor: brandColor }}
                className="h-11 flex-1 cursor-pointer gap-2 rounded-xl font-bold text-white shadow-md shadow-blue-500/20"
              >
                <CreditCard className="h-4 w-4" />
                Pay Deposit Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

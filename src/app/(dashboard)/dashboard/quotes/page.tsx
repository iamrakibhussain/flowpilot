"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileCheck2,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  MoreVertical,
  ExternalLink,
  Copy,
  Check,
  DollarSign,
  Percent,
  Trash2,
  LayoutGrid,
  List,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useQuotes,
  useQuoteStats,
  useSendQuote,
  useConvertQuoteToInvoice,
  useDeleteQuote,
} from "@/features/quotes/use-quotes";
import { QuoteBuilderModal } from "@/components/dashboard/quotes/quote-builder-modal";
import { QuoteQuickPeekDrawer } from "@/components/dashboard/quotes/quote-quick-peek-drawer";
import { QuotePrintModal } from "@/components/dashboard/quotes/quote-print-modal";
import { QuoteCard } from "@/components/dashboard/quotes/quote-card";
import type { QuoteListItem, QuoteStatusType } from "@/features/quotes/types";

const subscribeNoop = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function QuotesPage() {
  const router = useRouter();
  const isClient = React.useSyncExternalStore(subscribeNoop, getClientSnapshot, getServerSnapshot);
  const searchParams = useSearchParams();
  const quoteIdParam = searchParams.get("quoteId");
  const newParam = searchParams.get("new");
  const customerIdParam = searchParams.get("customerId");
  const customerNameParam = searchParams.get("customerName");
  const statusParam = searchParams.get("status")?.toUpperCase();
  const validStatus =
    statusParam &&
    ["DRAFT", "SENT", "VIEWED", "ACCEPTED", "DECLINED", "EXPIRED"].includes(statusParam)
      ? (statusParam as QuoteStatusType)
      : null;

  // Status filter derived directly from URL searchParams
  const statusFilter: QuoteStatusType | "ALL" = validStatus || "ALL";

  const handleSelectStatus = (val: QuoteStatusType | "ALL") => {
    const params = new URLSearchParams(searchParams.toString());
    if (val === "ALL") {
      params.delete("status");
    } else {
      params.set("status", val);
    }
    const qs = params.toString();
    router.replace(`/dashboard/quotes${qs ? `?${qs}` : ""}`, { scroll: false });
  };
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  // Modals & Drawers state
  const [isBuilderOpenManual, setIsBuilderOpenManual] = React.useState<boolean | null>(null);
  const isBuilderOpen = isBuilderOpenManual ?? newParam === "true";
  const setIsBuilderOpen = (open: boolean) => setIsBuilderOpenManual(open);

  const [printQuote, setPrintQuote] = React.useState<QuoteListItem | null>(null);
  const [copiedQuoteId, setCopiedQuoteId] = React.useState<string | null>(null);

  // Debounce search
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: quoteData, isLoading: isLoadingQuotes } = useQuotes({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    search: debouncedSearch || undefined,
    limit: 50,
  });

  const { data: stats } = useQuoteStats();
  const sendQuoteMutation = useSendQuote();
  const convertMutation = useConvertQuoteToInvoice();
  const deleteMutation = useDeleteQuote();

  const quotes = React.useMemo(() => quoteData?.quotes ?? [], [quoteData]);

  // Handle URL deep links: ?quoteId=xxx (from Notifications or direct links)
  const urlMatchedQuote = React.useMemo(() => {
    if (!quoteIdParam || quotes.length === 0) return null;
    return quotes.find((q) => q.id === quoteIdParam || q.quoteNumber === quoteIdParam) ?? null;
  }, [quoteIdParam, quotes]);

  const [selectedQuoteManual, setSelectedQuoteManual] = React.useState<QuoteListItem | null>(null);
  const [isDrawerOpenManual, setIsDrawerOpenManual] = React.useState<boolean | null>(null);

  const selectedQuote = selectedQuoteManual ?? urlMatchedQuote;
  const isDrawerOpen = isDrawerOpenManual ?? Boolean(urlMatchedQuote);

  const handleOpenDrawer = (quote: QuoteListItem) => {
    setSelectedQuoteManual(quote);
    setIsDrawerOpenManual(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpenManual(false);
    setSelectedQuoteManual(null);
    if (quoteIdParam) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("quoteId");
      const nextQuery = params.toString();
      router.replace(nextQuery ? `/dashboard/quotes?${nextQuery}` : "/dashboard/quotes");
    }
  };

  const handleCopyLink = (quote: QuoteListItem) => {
    if (quote.publicToken) {
      const url = `${window.location.origin}/quote/${quote.publicToken}`;
      navigator.clipboard.writeText(url);
      setCopiedQuoteId(quote.id);
      setTimeout(() => setCopiedQuoteId(null), 2000);
    } else {
      // Send to generate
      sendQuoteMutation.mutate(quote.id, {
        onSuccess: (res) => {
          navigator.clipboard.writeText(res.publicUrl);
          setCopiedQuoteId(quote.id);
          setTimeout(() => setCopiedQuoteId(null), 2000);
        },
      });
    }
  };

  const handleSend = (quote: QuoteListItem) => {
    sendQuoteMutation.mutate(quote.id, {
      onSuccess: (res) => {
        alert(`Proposal dispatched successfully to ${res.deliveredTo}`);
      },
    });
  };

  const handleConvert = (quote: QuoteListItem) => {
    convertMutation.mutate(quote.id, {
      onSuccess: (res) => {
        alert(`Successfully converted to Invoice #${res.invoiceNumber}!`);
      },
    });
  };

  const handleDelete = (quote: QuoteListItem) => {
    if (!confirm(`Are you sure you want to delete proposal ${quote.quoteNumber}?`)) return;
    deleteMutation.mutate(quote.id);
  };

  const getStatusBadge = (status: QuoteStatusType) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600">
            <CheckCircle2 className="h-3 w-3" /> Accepted
          </span>
        );
      case "SENT":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600">
            <Send className="h-3 w-3" /> Sent
          </span>
        );
      case "VIEWED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-purple-600">
            <Clock className="h-3 w-3" /> Viewed
          </span>
        );
      case "DECLINED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-rose-600">
            <AlertCircle className="h-3 w-3" /> Declined
          </span>
        );
      case "EXPIRED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600">
            <AlertCircle className="h-3 w-3" /> Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-500/20 bg-slate-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="relative space-y-6">
      {/* Luxury Ambient Atmospheric Glow */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(59,130,246,0.06),transparent)]"
        aria-hidden="true"
      />
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground flex items-center gap-2.5 text-2xl font-bold tracking-tight sm:text-3xl">
            <FileCheck2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Estimates & Client Proposals
          </h1>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed sm:text-sm">
            Create branded proposals, capture digital client signatures, and auto-convert to
            invoices.
          </p>
        </div>

        <Button
          onClick={() => setIsBuilderOpen(true)}
          className="h-10 w-full gap-2 rounded-xl bg-blue-600 font-medium text-white shadow-xs hover:bg-blue-700 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Create Estimate
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/80 bg-card/60 rounded-2xl border backdrop-blur-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">Total Pipeline</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-foreground text-xl font-bold tracking-tight tabular-nums sm:text-2xl">
                $
                {(stats?.totalEstimatedValue || 0).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
              <p className="text-muted-foreground mt-0.5 text-[11px]">
                {stats?.counts.total || 0} proposals generated
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60 rounded-2xl border backdrop-blur-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">Digitally Accepted</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xl font-bold tracking-tight text-emerald-600 tabular-nums sm:text-2xl dark:text-emerald-400">
                $
                {(stats?.acceptedValue || 0).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
              <p className="text-muted-foreground mt-0.5 text-[11px]">
                {stats?.counts.accepted || 0} closed deals
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60 rounded-2xl border backdrop-blur-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">Under Client Review</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-foreground text-xl font-bold tracking-tight tabular-nums sm:text-2xl">
                $
                {(stats?.pendingReviewValue || 0).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
              <p className="text-muted-foreground mt-0.5 text-[11px]">
                {(stats?.counts.sent || 0) + (stats?.counts.viewed || 0)} awaiting signature
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60 rounded-2xl border backdrop-blur-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">Acceptance Rate</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <Percent className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-foreground text-xl font-bold tracking-tight tabular-nums sm:text-2xl">
                {stats?.acceptanceRate || 0}%
              </span>
              <p className="text-muted-foreground mt-0.5 text-[11px]">
                Conversion to signed contracts
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="bg-muted/50 border-border/60 flex [scrollbar-width:none] items-center gap-1.5 overflow-x-auto rounded-xl border p-1 [&::-webkit-scrollbar]:hidden">
          {(
            [
              { label: "All", value: "ALL" },
              { label: "Draft", value: "DRAFT" },
              { label: "Sent", value: "SENT" },
              { label: "Viewed", value: "VIEWED" },
              { label: "Accepted", value: "ACCEPTED" },
              { label: "Declined", value: "DECLINED" },
              { label: "Expired", value: "EXPIRED" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleSelectStatus(tab.value)}
              className={`shrink-0 cursor-pointer rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                statusFilter === tab.value
                  ? "bg-background text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search proposals..."
              className="h-9 rounded-xl pl-9 text-xs"
            />
          </div>

          <div className="border-border/80 bg-muted/40 hidden items-center rounded-xl border p-1 text-xs shadow-2xs sm:flex">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`cursor-pointer rounded-lg p-1.5 transition-all ${
                viewMode === "grid"
                  ? "bg-background text-foreground border-border/60 border shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Pitch deck cards view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`cursor-pointer rounded-lg p-1.5 transition-all ${
                viewMode === "table"
                  ? "bg-background text-foreground border-border/60 border shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Table ledger view"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Skeletons vs Empty vs Grid vs Table */}
      {!isClient || isLoadingQuotes ? (
        <div className="grid grid-cols-1 gap-4.5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="border-border/60 bg-card/60 h-56 animate-pulse space-y-4 rounded-2xl border p-5 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="bg-muted/70 h-5 w-24 rounded-full" />
                <div className="bg-muted/70 h-6 w-16 rounded-md" />
              </div>
              <div className="bg-muted/80 mt-3 h-5 w-3/4 rounded-md" />
              <div className="bg-muted/60 h-3 w-1/2 rounded" />
              <div className="bg-muted/50 h-8 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : quotes.length === 0 ? (
        <div className="border-border/80 bg-card space-y-3 rounded-2xl border p-12 text-center shadow-xs">
          <div className="bg-muted text-muted-foreground mx-auto flex h-12 w-12 items-center justify-center rounded-2xl">
            <FileCheck2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-foreground text-sm font-semibold">No estimates found</h3>
            <p className="text-muted-foreground mx-auto max-w-sm text-xs">
              {debouncedSearch || statusFilter !== "ALL"
                ? "Try adjusting your search criteria or status filter."
                : "Create your first branded estimate and start closing client deals faster."}
            </p>
          </div>
          {statusFilter === "ALL" && !debouncedSearch && (
            <Button
              onClick={() => setIsBuilderOpen(true)}
              size="sm"
              className="gap-1.5 rounded-xl bg-blue-600 text-xs text-white hover:bg-blue-700"
            >
              <Plus className="h-3.5 w-3.5" /> Create First Estimate
            </Button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* Visual Cards Pitch Deck View */
        <div className="grid grid-cols-1 gap-4.5 md:grid-cols-2 lg:grid-cols-3">
          {quotes.map((q) => (
            <QuoteCard
              key={q.id}
              quote={q}
              onOpenDrawer={handleOpenDrawer}
              onCopyLink={handleCopyLink}
              onSend={handleSend}
              onConvert={handleConvert}
              onPrint={(quote) => setPrintQuote(quote)}
              isCopied={copiedQuoteId === q.id}
            />
          ))}
        </div>
      ) : (
        /* Quotes Table View */
        <div className="border-border/80 bg-card overflow-hidden rounded-2xl border shadow-xs">
          <>
            {/* Mobile Touch Card View (Shown on < md) */}
            <div className="divide-border/60 divide-y md:hidden">
              {quotes.map((q) => (
                <div
                  key={q.id}
                  onClick={() => handleOpenDrawer(q)}
                  className="hover:bg-muted/30 active:bg-muted/50 cursor-pointer space-y-3 p-4 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-foreground bg-muted/60 border-border rounded-lg border px-2.5 py-0.5 font-mono text-xs font-bold">
                      {q.quoteNumber}
                    </span>
                    <div>{getStatusBadge(q.status)}</div>
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="text-foreground text-sm font-semibold">{q.customerName}</h4>
                    {q.customerCompany && (
                      <p className="text-muted-foreground text-xs">{q.customerCompany}</p>
                    )}
                    <p className="text-muted-foreground/80 line-clamp-1 text-xs">{q.title}</p>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[10px] font-semibold uppercase">
                        Total
                      </span>
                      <span className="text-foreground font-mono text-sm font-bold">
                        ${q.totalAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(q)}
                        className="h-8 gap-1 rounded-xl text-xs"
                      >
                        {copiedQuoteId === q.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-500" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" /> Link
                          </>
                        )}
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-xl p-0">
                            <MoreVertical className="text-muted-foreground h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl text-xs">
                          <DropdownMenuItem onClick={() => handleOpenDrawer(q)}>
                            <ExternalLink className="mr-2 h-3.5 w-3.5" /> Inspect Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setPrintQuote(q)}>
                            <Printer className="mr-2 h-3.5 w-3.5" /> Print / Export PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyLink(q)}>
                            <Copy className="mr-2 h-3.5 w-3.5" /> Copy Client Link
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSend(q)}>
                            <Send className="mr-2 h-3.5 w-3.5" /> Dispatch Email
                          </DropdownMenuItem>
                          {q.status === "ACCEPTED" && !q.convertedInvoiceId && (
                            <DropdownMenuItem
                              onClick={() => handleConvert(q)}
                              className="font-semibold text-emerald-600 dark:text-emerald-400"
                            >
                              <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Convert to Invoice
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {q.status !== "ACCEPTED" && (
                            <DropdownMenuItem
                              onClick={() => handleDelete(q)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete Proposal
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (Shown on >= md) */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-border text-muted-foreground border-b text-[11px] font-semibold tracking-wider uppercase">
                  <tr>
                    <th className="px-4 py-3">Estimate #</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Proposal Title</th>
                    <th className="px-4 py-3">Valid Until</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {quotes.map((q) => (
                    <tr
                      key={q.id}
                      className="hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => handleOpenDrawer(q)}
                    >
                      <td className="text-foreground px-4 py-3.5 font-mono font-semibold">
                        {q.quoteNumber}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-foreground font-medium">{q.customerName}</div>
                        {q.customerCompany && (
                          <div className="text-muted-foreground text-[11px]">
                            {q.customerCompany}
                          </div>
                        )}
                      </td>
                      <td className="text-muted-foreground max-w-xs truncate px-4 py-3.5">
                        {q.title}
                      </td>
                      <td className="text-muted-foreground px-4 py-3.5 whitespace-nowrap">
                        {q.expiresAt ? new Date(q.expiresAt).toLocaleDateString() : "No expiry"}
                      </td>
                      <td className="text-foreground px-4 py-3.5 text-right font-mono font-semibold whitespace-nowrap">
                        ${q.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {getStatusBadge(q.status)}
                      </td>
                      <td
                        className="px-4 py-3.5 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyLink(q)}
                            className="text-muted-foreground hover:text-foreground h-7 gap-1 px-2 text-xs"
                            title="Copy Public Link"
                          >
                            {copiedQuoteId === q.id ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 rounded-lg p-0">
                                <MoreVertical className="text-muted-foreground h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl text-xs">
                              <DropdownMenuItem onClick={() => handleOpenDrawer(q)}>
                                <ExternalLink className="mr-2 h-3.5 w-3.5" /> Inspect Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCopyLink(q)}>
                                <Copy className="mr-2 h-3.5 w-3.5" /> Copy Client Link
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSend(q)}>
                                <Send className="mr-2 h-3.5 w-3.5" /> Dispatch Email
                              </DropdownMenuItem>
                              {q.status === "ACCEPTED" && !q.convertedInvoiceId && (
                                <DropdownMenuItem
                                  onClick={() => handleConvert(q)}
                                  className="font-medium text-emerald-600"
                                >
                                  <FileCheck2 className="mr-2 h-3.5 w-3.5" /> Convert to Invoice
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {q.status !== "ACCEPTED" && (
                                <DropdownMenuItem
                                  onClick={() => handleDelete(q)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete Proposal
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        </div>
      )}

      {/* Builder Modal */}
      <QuoteBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        initialCustomerId={customerIdParam || undefined}
        initialCustomerName={customerNameParam || undefined}
      />

      {/* Quick Peek Drawer */}
      <QuoteQuickPeekDrawer
        quote={selectedQuote}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onPrint={(quote) => setPrintQuote(quote)}
      />

      {/* Proposal Print & PDF Studio Modal */}
      <QuotePrintModal
        quote={printQuote}
        isOpen={Boolean(printQuote)}
        onClose={() => setPrintQuote(null)}
      />
    </div>
  );
}

"use client";

import * as React from "react";
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Send,
  Share2,
  Check,
  Eye,
  ArrowRight,
  Receipt,
  Printer,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { QuoteListItem, QuoteStatusType } from "@/features/quotes/types";

interface QuoteCardProps {
  quote: QuoteListItem;
  onOpenDrawer: (quote: QuoteListItem) => void;
  onCopyLink: (quote: QuoteListItem) => void;
  onSend: (quote: QuoteListItem) => void;
  onConvert: (quote: QuoteListItem) => void;
  onPrint?: (quote: QuoteListItem) => void;
  isCopied?: boolean;
}

const statusConfig: Record<
  QuoteStatusType,
  { label: string; badge: string; dot: string; border: string }
> = {
  ACCEPTED: {
    label: "Accepted",
    badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
    border: "border-t-emerald-500",
  },
  SENT: {
    label: "Sent",
    badge: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
    border: "border-t-blue-500",
  },
  VIEWED: {
    label: "Viewed",
    badge: "border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400",
    dot: "bg-purple-500",
    border: "border-t-purple-500",
  },
  DECLINED: {
    label: "Declined",
    badge: "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400",
    dot: "bg-rose-500",
    border: "border-t-rose-500",
  },
  EXPIRED: {
    label: "Expired",
    badge: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
    border: "border-t-amber-500",
  },
  DRAFT: {
    label: "Draft",
    badge: "border-border/70 bg-muted/60 text-muted-foreground",
    dot: "bg-slate-400",
    border: "border-t-slate-400",
  },
};

export function QuoteCard({
  quote,
  onOpenDrawer,
  onCopyLink,
  onSend,
  onConvert,
  onPrint,
  isCopied,
}: QuoteCardProps) {
  const statusInfo = statusConfig[quote.status] || statusConfig.DRAFT;

  const clientInitial = quote.customerName
    ? quote.customerName.charAt(0).toUpperCase()
    : "C";

  const isOverdue =
    quote.expiresAt && quote.status !== "ACCEPTED" && new Date(quote.expiresAt) < new Date();

  return (
    <Card
      onClick={() => onOpenDrawer(quote)}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 border-t-2 bg-gradient-to-b from-card to-card/90 p-5 shadow-2xs backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 cursor-pointer ${
        statusInfo.border
      }`}
    >
      <div className="space-y-3.5">
        {/* Top Row: Quote Number, Status Badge & Amount */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-muted-foreground bg-muted/50 border border-border/70 px-2 py-0.5 rounded-md">
              {quote.quoteNumber}
            </span>
            <Badge
              variant="outline"
              className={`flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusInfo.badge}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
              {statusInfo.label}
            </Badge>
          </div>

          <div className="text-right">
            <span className="text-foreground font-mono text-xl font-black tracking-tight">
              ${quote.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Customer Information Chip */}
        <div className="flex items-center gap-2 pt-0.5">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-black text-primary ring-1 ring-primary/20">
            {clientInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-foreground">
              {quote.customerCompany || quote.customerName}
            </p>
            {quote.customerCompany && (
              <p className="truncate text-[10px] text-muted-foreground">{quote.customerName}</p>
            )}
          </div>
        </div>

        {/* Proposal Title */}
        <div>
          <h4 className="text-foreground group-hover:text-primary text-sm font-bold transition-colors line-clamp-1">
            {quote.title}
          </h4>
          <p className="text-muted-foreground mt-0.5 text-[11px]">
            {quote.itemsCount} {quote.itemsCount === 1 ? "deliverable item" : "deliverable items"}
          </p>
        </div>

        {/* Expiry & Issued Date Capsule */}
        <div className="border-border/60 bg-muted/30 flex items-center justify-between rounded-xl border px-3 py-1.5 text-[11px]">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            <span>Issued {new Date(quote.issuedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
          </span>

          {quote.expiresAt && (
            <span
              className={`flex items-center gap-1 font-medium ${
                isOverdue
                  ? "text-rose-600 dark:text-rose-400 font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              {isOverdue && <AlertCircle className="h-3 w-3 text-rose-500" />}
              <span>
                {isOverdue ? "Expired " : "Valid to "}
                {new Date(quote.expiresAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div
        className="border-border/60 mt-4 flex items-center justify-between border-t pt-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenDrawer(quote)}
            className="text-muted-foreground hover:text-foreground h-7.5 px-2.5 text-xs"
          >
            <Eye className="mr-1 h-3.5 w-3.5" />
            Review
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onCopyLink(quote)}
            title="Copy Public Signing Link"
            className="text-muted-foreground hover:text-foreground h-7.5 px-2 text-xs"
          >
            {isCopied ? (
              <span className="text-emerald-600 flex items-center gap-1 font-semibold text-[11px]">
                <Check className="h-3.5 w-3.5" /> Copied
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px]">
                <Share2 className="h-3.5 w-3.5" /> Link
              </span>
            )}
          </Button>

          {onPrint && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onPrint(quote)}
              title="Print / Export PDF"
              className="text-muted-foreground hover:text-foreground h-7.5 px-2 text-xs"
            >
              <Printer className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        <div>
          {quote.status === "ACCEPTED" && !quote.convertedInvoiceId ? (
            <Button
              type="button"
              size="sm"
              onClick={() => onConvert(quote)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-7.5 px-2.5 text-xs font-semibold shadow-xs"
            >
              <Receipt className="mr-1 h-3.5 w-3.5" />
              Invoice
            </Button>
          ) : quote.convertedInvoiceId ? (
            <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-bold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Invoiced
            </span>
          ) : quote.status === "DRAFT" ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onSend(quote)}
              className="border-blue-500/30 text-blue-600 hover:bg-blue-500/10 h-7.5 px-2.5 text-xs font-semibold"
            >
              <Send className="mr-1 h-3 w-3" />
              Send
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenDrawer(quote)}
              className="text-primary hover:text-primary/80 h-7.5 px-2 text-xs font-semibold"
            >
              Details <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}


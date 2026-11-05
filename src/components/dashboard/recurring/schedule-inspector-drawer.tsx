"use client";

import * as React from "react";
import {
  X,
  Clock,
  Calendar,
  Layers,
  FileText,
  DollarSign,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Sparkles,
  Mail,
  Building,
  Check,
  Copy,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useRecurringSchedule,
  usePauseRecurringSchedule,
  useResumeRecurringSchedule,
  useCancelRecurringSchedule,
} from "@/features/recurring/use-recurring";
import type { RecurringScheduleListItem } from "@/features/recurring/types";
import Link from "next/link";

interface ScheduleInspectorDrawerProps {
  scheduleId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenLogHours?: (schedule: RecurringScheduleListItem) => void;
}

export function ScheduleInspectorDrawer({
  scheduleId,
  isOpen,
  onClose,
  onOpenLogHours,
}: ScheduleInspectorDrawerProps) {
  const [activeTab, setActiveTab] = React.useState<"overview" | "invoices">("overview");
  const [isCopied, setIsCopied] = React.useState(false);

  const { data: schedule, isLoading } = useRecurringSchedule(scheduleId || "");
  const pauseMutation = usePauseRecurringSchedule();
  const resumeMutation = useResumeRecurringSchedule();
  const cancelMutation = useCancelRecurringSchedule();

  // Close on ESC
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !scheduleId) return null;

  const isRetainer = schedule?.isRetainer && schedule.retainerHours != null;
  const currentRetainer = schedule?.currentRetainerLog;
  const allocated = currentRetainer?.hoursAllocated ?? schedule?.retainerHours ?? 0;
  const logged = currentRetainer?.hoursLogged ?? 0;
  const overage = currentRetainer?.overageHours ?? 0;
  const burnPercent = allocated > 0 ? Math.min(100, Math.round((logged / allocated) * 100)) : 0;
  const overageRate = schedule?.overageHourlyRate ?? 0;
  const overageCost = Math.round(overage * overageRate * 100) / 100;

  const frequencyLabel =
    {
      WEEKLY: "Weekly",
      BI_WEEKLY: "Bi-Weekly",
      MONTHLY: "Monthly",
      QUARTERLY: "Quarterly",
      ANNUALLY: "Annually",
    }[schedule?.frequency || "MONTHLY"] ||
    schedule?.frequency ||
    "Monthly";

  const handleCopyId = () => {
    if (!schedule) return;
    try {
      navigator.clipboard.writeText(schedule.id);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handlePause = async () => {
    if (!schedule) return;
    await pauseMutation.mutateAsync(schedule.id);
  };

  const handleResume = async () => {
    if (!schedule) return;
    await resumeMutation.mutateAsync(schedule.id);
  };

  const handleCancel = async () => {
    if (!schedule) return;
    if (
      confirm(
        "Are you sure you want to cancel this recurring schedule? Future automated cycles will be halted."
      )
    ) {
      await cancelMutation.mutateAsync(schedule.id);
    }
  };

  const initials = schedule?.customerName
    ? schedule.customerName
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "CL";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      {/* Drawer Panel Container */}
      <div className="border-border/80 bg-background flex h-full w-full max-w-2xl min-w-0 flex-col overflow-x-hidden border-l shadow-2xl transition-all">
        {/* Drawer Header (Compact & Mobile-Optimized) */}
        <div className="border-border/80 bg-card border-b px-4 py-3.5 sm:px-6 sm:py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="to-primary shadow-primary/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 text-xs font-black text-white shadow-md sm:h-11 sm:w-11 sm:text-sm">
                {initials}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-primary font-mono text-[11px] font-bold">
                    {frequencyLabel}
                  </span>

                  {schedule?.status === "ACTIVE" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      </span>
                      Active Billing
                    </span>
                  ) : schedule?.status === "PAUSED" ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Paused
                    </span>
                  ) : (
                    <span className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold">
                      {schedule?.status}
                    </span>
                  )}

                  {isRetainer && (
                    <Badge
                      variant="outline"
                      className="border-indigo-500/25 bg-indigo-500/10 px-2 py-0 text-[10px] font-bold text-indigo-600 dark:text-indigo-400"
                    >
                      <Sparkles className="mr-1 h-2.5 w-2.5" /> Retainer
                    </Badge>
                  )}
                </div>

                <h2 className="text-foreground mt-0.5 line-clamp-1 text-sm font-extrabold tracking-tight sm:text-base">
                  {schedule?.title || "Loading subscription..."}
                </h2>
              </div>
            </div>

            {/* Quick Action Icons */}
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyId}
                title="Copy Schedule UUID"
                className="text-muted-foreground hover:text-foreground h-8 w-8 rounded-lg"
              >
                {isCopied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>

              <button
                onClick={onClose}
                className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors"
                aria-label="Close Inspector"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Client Details Sub-Row */}
          <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="text-foreground/90 font-semibold">{schedule?.customerName}</span>
            {schedule?.customerCompany && (
              <span className="flex items-center gap-1">
                <Building className="text-muted-foreground h-3 w-3" />
                {schedule.customerCompany}
              </span>
            )}
            {schedule?.customerEmail && (
              <span className="flex items-center gap-1">
                <Mail className="text-muted-foreground h-3 w-3" />
                {schedule.customerEmail}
              </span>
            )}
          </div>

          {/* Segmented Control Tabs (50 / 50 Zero Horizontal Scroll Standard) */}
          <div className="bg-muted/60 border-border/60 mt-3 grid grid-cols-2 gap-1 rounded-xl border p-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-all ${
                activeTab === "overview"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Overview & Retainer
            </button>

            <button
              onClick={() => setActiveTab("invoices")}
              className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-all ${
                activeTab === "invoices"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              Invoices History ({schedule?.invoices?.length ?? 0})
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:space-y-5 sm:p-6">
          {isLoading ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-24 text-xs">
              <Loader2 className="text-primary h-7 w-7 animate-spin" />
              <span className="font-medium">Loading subscription details...</span>
            </div>
          ) : !schedule ? (
            <div className="text-muted-foreground py-20 text-center text-xs">
              Schedule details could not be found.
            </div>
          ) : activeTab === "overview" ? (
            <>
              {/* Financial Cadence Card */}
              <div className="border-border/80 bg-card space-y-3.5 rounded-2xl border p-4 shadow-xs sm:p-5">
                <div className="border-border/60 flex flex-col gap-1 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-black tracking-wider uppercase">
                    <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Subscription Cadence
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-foreground font-mono text-xl font-black sm:text-2xl">
                      ${schedule.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-muted-foreground text-xs font-semibold">
                      {schedule.currency} / {(frequencyLabel || "monthly").toLowerCase()}
                    </span>
                  </div>
                </div>

                {/* 3-Column Financial Breakdown */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="border-border/60 bg-muted/30 min-w-0 overflow-hidden rounded-xl border p-2 sm:p-2.5">
                    <span className="text-muted-foreground block truncate text-[10px] font-bold uppercase">
                      Subtotal
                    </span>
                    <span className="text-foreground block truncate font-mono text-xs font-bold sm:text-sm">
                      ${schedule.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="border-border/60 bg-muted/30 min-w-0 overflow-hidden rounded-xl border p-2 sm:p-2.5">
                    <span className="text-muted-foreground block truncate text-[10px] font-bold uppercase">
                      Tax ({schedule.taxRate}%)
                    </span>
                    <span className="text-foreground block truncate font-mono text-xs font-bold sm:text-sm">
                      ${schedule.taxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="border-border/60 bg-muted/30 min-w-0 overflow-hidden rounded-xl border p-2 sm:p-2.5">
                    <span className="text-muted-foreground block truncate text-[10px] font-bold uppercase">
                      Payment Terms
                    </span>
                    <span className="text-foreground block truncate text-xs font-bold sm:text-sm">
                      Net {schedule.paymentDueDays} days
                    </span>
                  </div>
                </div>

                {/* Line Items List */}
                <div className="pt-1">
                  <span className="text-muted-foreground mb-2 block text-[11px] font-black tracking-wider uppercase">
                    Automated Line Items
                  </span>
                  <div className="space-y-2">
                    {schedule.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="border-border/60 bg-muted/20 flex items-center justify-between gap-3 rounded-xl border p-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground truncate font-bold">{it.description}</p>
                          <p className="text-muted-foreground font-mono text-[11px]">
                            {it.quantity} × ${Number(it.unitPrice).toFixed(2)}
                          </p>
                        </div>
                        <span className="text-foreground font-mono text-xs font-black sm:text-sm">
                          $
                          {(it.amount ?? it.quantity * it.unitPrice).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Retainer Burn-down Ledger Card (World-Class Interactive Gauge) */}
              {isRetainer && (
                <div className="space-y-3.5 rounded-2xl border border-indigo-500/25 bg-indigo-500/[0.04] p-4 shadow-xs sm:p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="flex items-center gap-1.5 text-xs font-black tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
                        <Clock className="h-4 w-4" />
                        Current Retainer Cycle Ledger
                      </h4>
                      <p className="text-muted-foreground mt-0.5 text-[11px]">
                        Contracted hours tracking with automatic overage calculation.
                      </p>
                    </div>

                    {schedule.status === "ACTIVE" && onOpenLogHours && (
                      <Button
                        size="sm"
                        onClick={() => onOpenLogHours(schedule)}
                        className="h-8 bg-indigo-600 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        Log Time
                      </Button>
                    )}
                  </div>

                  {/* Progress Gauge */}
                  <div className="border-border/70 bg-card space-y-2.5 rounded-xl border p-3.5 shadow-2xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-semibold">Active Quota:</span>
                      <span className="text-foreground font-mono text-xs font-bold sm:text-sm">
                        {logged} / {allocated} hrs{" "}
                        <span className="text-muted-foreground text-xs font-normal">
                          ({burnPercent}%)
                        </span>
                      </span>
                    </div>

                    <div className="bg-muted/80 h-3 w-full overflow-hidden rounded-full p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          overage > 0
                            ? "bg-rose-500 shadow-xs shadow-rose-500/50"
                            : burnPercent >= 80
                              ? "bg-amber-500 shadow-xs shadow-amber-500/50"
                              : "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xs shadow-indigo-500/40"
                        }`}
                        style={{ width: `${burnPercent}%` }}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 text-xs">
                      <span className="text-muted-foreground shrink-0 font-medium">
                        Remaining:{" "}
                        <span className="text-foreground font-bold">
                          {Math.max(0, allocated - logged)} hrs
                        </span>
                      </span>

                      {overage > 0 ? (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-rose-500/25 bg-rose-500/10 px-2 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                          <AlertTriangle className="h-3 w-3 shrink-0" />+{overage} hrs overage ($
                          {overageCost} extra)
                        </span>
                      ) : (
                        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> Within Quota
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Historical Cycle Ledger Table */}
                  <div className="space-y-2 pt-1">
                    <span className="text-foreground block text-[11px] font-black tracking-wider uppercase">
                      Cycle Time Logs
                    </span>
                    <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                      {schedule.allRetainerLogs && schedule.allRetainerLogs.length > 0 ? (
                        schedule.allRetainerLogs.map((log) => (
                          <div
                            key={log.id}
                            className="border-border/60 bg-card space-y-1.5 rounded-xl border p-3 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-foreground font-bold">
                                {new Date(log.cycleStartDate).toLocaleDateString()} —{" "}
                                {new Date(log.cycleEndDate).toLocaleDateString()}
                              </span>
                              <span className="text-foreground font-mono font-bold">
                                {log.hoursLogged} / {log.hoursAllocated} hrs
                                {log.overageHours > 0 && (
                                  <span className="ml-1 text-rose-500">
                                    (+{log.overageHours}h overage)
                                  </span>
                                )}
                              </span>
                            </div>
                            {log.notes && (
                              <p className="text-muted-foreground border-border/40 bg-muted/40 rounded-lg border p-2 text-[11px] whitespace-pre-line">
                                {log.notes}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-xs italic">
                          No logged retainer hours recorded yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule Dates & Automation Metadata */}
              <div className="border-border/80 bg-card space-y-3 rounded-2xl border p-4 text-xs shadow-xs sm:p-5">
                <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-black tracking-wider uppercase">
                  <Calendar className="text-primary h-4 w-4 shrink-0" />
                  Cadence Timings & Automation
                </span>

                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  <div className="border-border/60 bg-muted/20 rounded-xl border p-2.5">
                    <span className="text-muted-foreground block text-[10px] font-medium">
                      First Run Date
                    </span>
                    <span className="text-foreground font-bold">
                      {new Date(schedule.startDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="border-border/60 bg-muted/20 rounded-xl border p-2.5">
                    <span className="text-muted-foreground block text-[10px] font-medium">
                      Next Run Date
                    </span>
                    <span className="text-primary font-bold">
                      {new Date(schedule.nextRunDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="border-border/60 bg-muted/20 rounded-xl border p-2.5">
                    <span className="text-muted-foreground block text-[10px] font-medium">
                      Last Run Date
                    </span>
                    <span className="text-foreground font-bold">
                      {schedule.lastRunDate
                        ? new Date(schedule.lastRunDate).toLocaleDateString()
                        : "Pending"}
                    </span>
                  </div>

                  <div className="border-border/60 bg-muted/20 rounded-xl border p-2.5">
                    <span className="text-muted-foreground block text-[10px] font-medium">
                      Completed Cycles
                    </span>
                    <span className="text-foreground font-bold">
                      {schedule.totalOccurrences}
                      {schedule.maxOccurrences ? ` / ${schedule.maxOccurrences}` : " (Continuous)"}
                    </span>
                  </div>

                  <div className="border-border/60 bg-muted/20 rounded-xl border p-2.5">
                    <span className="text-muted-foreground block text-[10px] font-medium">
                      End Date
                    </span>
                    <span className="text-foreground font-bold">
                      {schedule.endDate
                        ? new Date(schedule.endDate).toLocaleDateString()
                        : "Indefinite"}
                    </span>
                  </div>

                  <div className="border-border/60 bg-muted/20 rounded-xl border p-2.5">
                    <span className="text-muted-foreground block text-[10px] font-medium">
                      Auto-Email Client
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {schedule.autoSendEmail ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Invoices History Tab (Mobile-First Zero Overflow Standard) */
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-muted-foreground text-xs font-black tracking-wider uppercase">
                  Generated Invoices
                </span>
                <span className="text-foreground text-xs font-semibold">
                  Total Records: {schedule.invoices?.length ?? 0}
                </span>
              </div>

              {schedule.invoices && schedule.invoices.length > 0 ? (
                <div className="space-y-2.5">
                  {schedule.invoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="border-border/80 bg-card hover:border-border space-y-2 rounded-2xl border p-3.5 text-xs shadow-xs transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-primary font-mono text-sm font-bold">
                          {inv.invoiceNumber}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                            inv.status === "PAID"
                              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-600"
                              : inv.status === "OVERDUE"
                                ? "border-rose-500/25 bg-rose-500/10 text-rose-600"
                                : "border-amber-500/25 bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>

                      <p className="text-muted-foreground text-[11px]">
                        Issued {new Date(inv.issueDate).toLocaleDateString()} • Due{" "}
                        {new Date(inv.dueDate).toLocaleDateString()}
                        {inv.paidAt && ` • Paid ${new Date(inv.paidAt).toLocaleDateString()}`}
                      </p>

                      <div className="border-border/50 flex items-center justify-between border-t pt-2">
                        <span className="text-foreground font-mono text-sm font-black sm:text-base">
                          ${inv.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>

                        <Link href="/dashboard/invoices">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-border/80 hover:bg-muted h-7.5 rounded-lg px-2.5 text-xs font-semibold"
                          >
                            <ExternalLink className="mr-1 h-3 w-3" />
                            View Invoice
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-border/80 bg-card/40 rounded-2xl border border-dashed p-6 py-16 text-center text-xs">
                  <FileText className="text-muted-foreground/40 mx-auto mb-2 h-10 w-10" />
                  <p className="text-foreground font-bold">No invoices generated yet</p>
                  <p className="text-muted-foreground mx-auto mt-1 max-w-sm">
                    The autonomous engine will dispatch the first invoice on{" "}
                    <span className="text-primary font-bold">
                      {new Date(schedule.nextRunDate).toLocaleDateString()}
                    </span>
                    .
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions (Sticky & Touch-Friendly) */}
        <div className="border-border/80 bg-card/95 border-t p-3.5 backdrop-blur-md sm:px-6 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {schedule?.status === "ACTIVE" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePause}
                  disabled={pauseMutation.isPending}
                  className="h-9 cursor-pointer rounded-xl border-amber-500/25 px-3 text-xs font-bold text-amber-600 hover:bg-amber-500/10 dark:text-amber-400"
                >
                  <Pause className="mr-1.5 h-3.5 w-3.5" />
                  Pause
                </Button>
              ) : schedule?.status === "PAUSED" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResume}
                  disabled={resumeMutation.isPending}
                  className="h-9 cursor-pointer rounded-xl border-emerald-500/25 px-3 text-xs font-bold text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                >
                  <Play className="mr-1.5 h-3.5 w-3.5" />
                  Resume
                </Button>
              ) : null}

              {schedule?.status !== "CANCELLED" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending}
                  className="h-9 cursor-pointer rounded-xl px-3 text-xs font-semibold text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
                >
                  Cancel
                </Button>
              )}
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={onClose}
              className="bg-foreground text-background hover:bg-foreground/90 h-9 cursor-pointer rounded-xl px-5 text-xs font-bold shadow-xs"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

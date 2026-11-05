"use client";

import React from "react";
import {
  Calendar,
  Clock,
  Repeat,
  Play,
  Pause,
  MoreVertical,
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { RecurringScheduleListItem } from "@/features/recurring/types";

interface ScheduleCardProps {
  schedule: RecurringScheduleListItem;
  onInspect: (schedule: RecurringScheduleListItem) => void;
  onLogHours: (schedule: RecurringScheduleListItem) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
}

export function ScheduleCard({
  schedule,
  onInspect,
  onLogHours,
  onPause,
  onResume,
  onCancel,
}: ScheduleCardProps) {
  const isRetainer = schedule.isRetainer && schedule.retainerHours != null;
  const retainerLog = schedule.currentRetainerLog;

  const allocated = retainerLog?.hoursAllocated ?? schedule.retainerHours ?? 0;
  const logged = retainerLog?.hoursLogged ?? 0;
  const overage = retainerLog?.overageHours ?? 0;
  const burnPercent = allocated > 0 ? Math.min(100, Math.round((logged / allocated) * 100)) : 0;
  const overageRate = schedule.overageHourlyRate ?? 0;
  const overageEstCost = Math.round(overage * overageRate * 100) / 100;

  // Status Styling Configuration
  const statusConfig = {
    ACTIVE: {
      label: "Active Billing",
      badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
      dot: "bg-emerald-500",
      ping: true,
      glow: "from-emerald-500/10 to-transparent",
    },
    PAUSED: {
      label: "Paused",
      badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
      dot: "bg-amber-500",
      ping: false,
      glow: "from-amber-500/10 to-transparent",
    },
    COMPLETED: {
      label: "Completed",
      badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
      dot: "bg-blue-500",
      ping: false,
      glow: "from-blue-500/10 to-transparent",
    },
    CANCELLED: {
      label: "Cancelled",
      badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25",
      dot: "bg-rose-500",
      ping: false,
      glow: "from-rose-500/10 to-transparent",
    },
  }[schedule.status] || {
    label: schedule.status,
    badge: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
    ping: false,
    glow: "from-muted/10 to-transparent",
  };

  const frequencyLabel =
    {
      WEEKLY: "Weekly",
      BI_WEEKLY: "Bi-Weekly",
      MONTHLY: "Monthly",
      QUARTERLY: "Quarterly",
      ANNUALLY: "Annually",
    }[schedule.frequency] || schedule.frequency;

  const nextRunFormatted = React.useMemo(() => {
    try {
      const date = new Date(schedule.nextRunDate);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return schedule.nextRunDate;
    }
  }, [schedule.nextRunDate]);

  // Client initials helper
  const initials = React.useMemo(() => {
    const parts = schedule.customerName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return schedule.customerName.slice(0, 2).toUpperCase() || "CL";
  }, [schedule.customerName]);

  return (
    <div
      onClick={() => onInspect(schedule)}
      className="group border-border/80 from-card via-card/95 to-card/85 hover:border-primary/50 hover:shadow-primary/5 relative box-border flex w-full max-w-full min-w-0 cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border bg-gradient-to-b p-4 shadow-xs backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-5"
    >
      {/* Ambient Gradient Glow at Top Corner */}
      <div
        className={`pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full bg-gradient-to-br ${statusConfig.glow} blur-2xl transition-opacity duration-300 group-hover:opacity-100`}
      />

      {/* Main Card Content */}
      <div className="w-full min-w-0">
        {/* Top Badges & Actions Row */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {/* Status Beacon Badge */}
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold shadow-2xs ${statusConfig.badge}`}
            >
              <span className="relative flex h-1.5 w-1.5">
                {statusConfig.ping && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}
                />
              </span>
              {statusConfig.label}
            </span>

            {/* Frequency Badge */}
            <span className="bg-muted/60 text-muted-foreground border-border/60 inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold">
              <Repeat className="text-primary h-2.5 w-2.5" />
              {frequencyLabel}
            </span>

            {/* Retainer Badge */}
            {isRetainer && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                <Sparkles className="h-2.5 w-2.5 text-indigo-500" />
                Retainer
              </span>
            )}
          </div>

          {/* Quick Menu */}
          <div onClick={(e) => e.stopPropagation()} className="shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:bg-muted hover:text-foreground -mr-1 h-7.5 w-7.5 shrink-0 rounded-lg"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Schedule actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 shadow-lg">
                <DropdownMenuItem onClick={() => onInspect(schedule)} className="cursor-pointer">
                  <Layers className="text-primary mr-2 h-4 w-4" />
                  View Ledger & Invoices
                </DropdownMenuItem>
                {isRetainer && schedule.status === "ACTIVE" && (
                  <DropdownMenuItem
                    onClick={() => onLogHours(schedule)}
                    className="cursor-pointer font-medium text-indigo-600 dark:text-indigo-400"
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Log Retainer Hours
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {schedule.status === "ACTIVE" ? (
                  <DropdownMenuItem
                    onClick={() => onPause(schedule.id)}
                    className="cursor-pointer text-amber-600 dark:text-amber-400"
                  >
                    <Pause className="mr-2 h-4 w-4" />
                    Pause Billing
                  </DropdownMenuItem>
                ) : schedule.status === "PAUSED" ? (
                  <DropdownMenuItem
                    onClick={() => onResume(schedule.id)}
                    className="cursor-pointer text-emerald-600 dark:text-emerald-400"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Resume Billing
                  </DropdownMenuItem>
                ) : null}
                {schedule.status !== "CANCELLED" && (
                  <DropdownMenuItem
                    onClick={() => onCancel(schedule.id)}
                    className="cursor-pointer text-rose-600 dark:text-rose-400"
                  >
                    Cancel Schedule
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Client & Title Profile */}
        <div className="mb-3.5 flex min-w-0 items-start gap-2.5">
          <div className="to-primary shadow-primary/15 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 text-xs font-bold text-white shadow-xs">
            {initials}
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <h3
              className="text-foreground group-hover:text-primary block w-full truncate text-sm font-bold tracking-tight transition-colors sm:text-base"
              title={schedule.title}
            >
              {schedule.title}
            </h3>
            <p className="text-muted-foreground mt-0.5 block w-full truncate text-[11px] sm:text-xs">
              <span className="text-foreground/80 font-medium">{schedule.customerName}</span>
              {schedule.customerCompany ? ` • ${schedule.customerCompany}` : ""}
            </p>
          </div>
        </div>

        {/* Executive Financial Hero Banner */}
        <div className="border-border/70 from-muted/30 via-muted/15 to-background/50 relative mb-3.5 w-full min-w-0 overflow-hidden rounded-xl border bg-gradient-to-br p-3 shadow-2xs">
          <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-1">
            <span className="text-muted-foreground/80 flex shrink-0 items-center gap-1 text-[10px] font-bold tracking-wider uppercase sm:text-[11px]">
              <TrendingUp className="h-3 w-3 shrink-0 text-emerald-500" />
              Cadence Amount
            </span>
            <div className="min-w-0 shrink-0 text-right">
              <span className="text-foreground font-mono text-base font-black tracking-tight sm:text-xl">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: schedule.currency || "USD",
                }).format(schedule.total)}
              </span>
              <span className="text-muted-foreground ml-1 text-[11px] font-medium">
                /{frequencyLabel.toLowerCase()}
              </span>
            </div>
          </div>

          <div className="border-border/50 flex flex-wrap items-center justify-between gap-1 border-t pt-1.5 text-[11px]">
            <span className="text-muted-foreground flex shrink-0 items-center gap-1.5">
              <Calendar className="text-primary h-3 w-3 shrink-0" />
              Next Auto Invoice:
            </span>
            <span className="text-foreground shrink-0 font-bold tracking-tight">
              {nextRunFormatted}
            </span>
          </div>
        </div>

        {/* Retainer Hours Meter (World-Class Interactive Gauge) */}
        {isRetainer && (
          <div className="mb-3.5 w-full min-w-0 space-y-1.5 overflow-hidden rounded-xl border border-indigo-500/20 bg-indigo-500/[0.04] p-3 shadow-2xs">
            <div className="flex items-center justify-between gap-1 text-xs">
              <span className="text-foreground flex shrink-0 items-center gap-1 text-[11px] font-bold">
                <Clock className="h-3 w-3 shrink-0 text-indigo-500" />
                Retainer Quota
              </span>
              <span className="text-foreground truncate font-mono text-[11px] font-bold">
                {logged} / {allocated} hrs{" "}
                <span className="text-muted-foreground font-normal">({burnPercent}%)</span>
              </span>
            </div>

            {/* Glowing Gradient Progress Bar */}
            <div className="bg-muted/80 h-2 w-full overflow-hidden rounded-full p-0.5">
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

            <div className="flex flex-wrap items-center justify-between gap-1 pt-0.5 text-[10px] sm:text-[11px]">
              <span className="text-muted-foreground shrink-0 font-medium">
                Remaining:{" "}
                <span className="text-foreground font-bold">
                  {retainerLog?.hoursRemaining ?? Math.max(0, allocated - logged)} hrs
                </span>
              </span>

              {overage > 0 ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-rose-500/25 bg-rose-500/10 px-1.5 py-0.5 font-bold text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="h-3 w-3 shrink-0" />+{overage}h (${overageEstCost})
                </span>
              ) : (
                <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3 shrink-0" /> In Quota
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Quick Action Toolbar (Zero Horizontal Scroll Guaranteed) */}
      <div className="border-border/60 flex w-full min-w-0 flex-col justify-between gap-2.5 border-t pt-3 sm:flex-row sm:items-center">
        <div className="text-muted-foreground flex shrink-0 items-center text-[11px]">
          <FileText className="text-primary mr-1.5 h-3.5 w-3.5 shrink-0" />
          <span className="font-medium">{schedule.invoicesCount ?? 0} invoices issued</span>
        </div>

        <div
          className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center sm:gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {isRetainer && schedule.status === "ACTIVE" ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onLogHours(schedule)}
                className="bg-background/80 hover:bg-muted h-8 w-full cursor-pointer border-indigo-500/25 px-2.5 text-xs font-bold text-indigo-600 hover:border-indigo-500/40 sm:w-auto dark:text-indigo-400"
              >
                <Clock className="mr-1 h-3.5 w-3.5 shrink-0" />
                Log Time
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={() => onInspect(schedule)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground flex h-8 w-full cursor-pointer items-center justify-center gap-1 rounded-xl px-3 text-xs font-bold shadow-xs sm:w-auto"
              >
                Manage
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              </Button>
            </>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => onInspect(schedule)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground col-span-2 flex h-8 w-full cursor-pointer items-center justify-center gap-1 rounded-xl px-3 text-xs font-bold shadow-xs sm:w-auto"
            >
              Manage Schedule
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

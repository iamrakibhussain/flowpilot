"use client";

import * as React from "react";
import { Repeat, Plus, Play, Search, TrendingUp, Clock, FileCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useRecurringSchedules,
  useRecurringStats,
  usePauseRecurringSchedule,
  useResumeRecurringSchedule,
  useCancelRecurringSchedule,
  useProcessRecurringNow,
} from "@/features/recurring/use-recurring";
import type { RecurringScheduleListItem, RecurringStatus } from "@/features/recurring/types";
import { ScheduleCard } from "@/components/dashboard/recurring/schedule-card";
import { CreateScheduleModal } from "@/components/dashboard/recurring/create-schedule-modal";
import { ScheduleInspectorDrawer } from "@/components/dashboard/recurring/schedule-inspector-drawer";
import { LogHoursModal } from "@/components/dashboard/recurring/log-hours-modal";

export default function RecurringBillingPage() {
  const [search, setSearch] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [isRetainerOnly, setIsRetainerOnly] = React.useState<boolean>(false);

  // Modals & Drawer State
  const [isCreateOpen, setIsCreateOpen] = React.useState<boolean>(false);
  const [inspectScheduleId, setInspectScheduleId] = React.useState<string | null>(null);
  const [logHoursSchedule, setLogHoursSchedule] = React.useState<RecurringScheduleListItem | null>(
    null
  );

  const queryParams = React.useMemo(() => {
    return {
      status:
        statusFilter !== "ALL" && statusFilter !== "RETAINER"
          ? (statusFilter as RecurringStatus)
          : undefined,
      search: search.trim() || undefined,
    };
  }, [statusFilter, search]);

  const { data: scheduleData, isLoading, refetch } = useRecurringSchedules(queryParams);
  const { data: stats } = useRecurringStats();

  const pauseMutation = usePauseRecurringSchedule();
  const resumeMutation = useResumeRecurringSchedule();
  const cancelMutation = useCancelRecurringSchedule();
  const processNowMutation = useProcessRecurringNow();

  // Filter retainers if selected
  const schedules = React.useMemo(() => {
    const list = scheduleData?.schedules || [];
    if (statusFilter === "RETAINER" || isRetainerOnly) {
      return list.filter((s) => s.isRetainer);
    }
    return list;
  }, [scheduleData?.schedules, statusFilter, isRetainerOnly]);

  const handleInspect = (schedule: RecurringScheduleListItem) => {
    setInspectScheduleId(schedule.id);
  };

  const handleLogHours = (schedule: RecurringScheduleListItem) => {
    setLogHoursSchedule(schedule);
  };

  const handlePause = async (id: string) => {
    await pauseMutation.mutateAsync(id);
  };

  const handleResume = async (id: string) => {
    await resumeMutation.mutateAsync(id);
  };

  const handleCancel = async (id: string) => {
    if (confirm("Are you sure you want to cancel this recurring schedule?")) {
      await cancelMutation.mutateAsync(id);
    }
  };

  const handleProcessNow = async () => {
    try {
      const res = await processNowMutation.mutateAsync();
      alert(
        res.invoicesCreated > 0
          ? `Billing cycle processed! Created ${res.invoicesCreated} automated invoice(s).`
          : "Billing cycle checked. No due schedules required invoicing at this time."
      );
      refetch();
    } catch {
      alert("Failed to run immediate billing cycle.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 space-y-6 overflow-x-hidden p-4 sm:p-6 lg:p-8">
      {/* Executive Page Header */}
      <div className="border-border/40 flex flex-col gap-4 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="to-primary shadow-primary/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 text-white shadow-md sm:h-11 sm:w-11">
              <Repeat className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
                Recurring & Subscriptions
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed sm:text-sm">
            Autonomous client billing engines, cadence schedulers, and real-time retainer hour
            burn-downs.
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleProcessNow}
            disabled={processNowMutation.isPending}
            className="border-border/80 hover:bg-muted h-9.5 w-full cursor-pointer rounded-xl text-xs font-bold sm:w-auto"
          >
            {processNowMutation.isPending ? (
              <>
                <Loader2 className="text-primary mr-1.5 h-3.5 w-3.5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play className="text-primary mr-1.5 h-3.5 w-3.5" />
                Run Cycle Now
              </>
            )}
          </Button>

          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20 h-9.5 w-full cursor-pointer rounded-xl text-xs font-bold shadow-md sm:w-auto"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New Recurring Schedule
          </Button>
        </div>
      </div>

      {/* KPI Stats Row (4 World-Class Metric Cards with Ambient Glows) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* Card 1: Active Schedules */}
        <div className="border-border/80 from-card via-card/95 to-card/85 relative overflow-hidden rounded-2xl border bg-gradient-to-b p-3.5 shadow-xs transition-all duration-300 hover:shadow-md sm:p-5">
          <div className="text-muted-foreground mb-1.5 flex items-center justify-between text-[11px] font-bold tracking-wider uppercase sm:text-xs">
            <span className="truncate">Active Schedules</span>
            <div className="shrink-0 rounded-xl bg-emerald-500/10 p-1.5 text-emerald-600 sm:p-2 dark:text-emerald-400">
              <Repeat className="h-4 w-4" />
            </div>
          </div>
          <div className="text-foreground font-mono text-xl font-bold tracking-tight tabular-nums sm:text-2xl lg:text-3xl">
            {stats?.activeSchedules ?? 0}
          </div>
          <span className="text-muted-foreground mt-1 block truncate text-[10px] sm:text-[11px]">
            {stats?.totalSchedules ?? 0} total subscriptions configured
          </span>
        </div>

        {/* Card 2: Estimated MRR */}
        <div className="border-border/80 from-card via-card/95 to-card/85 relative overflow-hidden rounded-2xl border bg-gradient-to-b p-3.5 shadow-xs transition-all duration-300 hover:shadow-md sm:p-5">
          <div className="text-muted-foreground mb-1.5 flex items-center justify-between text-[11px] font-bold tracking-wider uppercase sm:text-xs">
            <span className="truncate">Estimated MRR</span>
            <div className="bg-primary/10 text-primary shrink-0 rounded-xl p-1.5 sm:p-2">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-foreground font-mono text-xl font-bold tracking-tight tabular-nums sm:text-2xl lg:text-3xl">
            ${(stats?.estimatedMRR ?? 0).toLocaleString("en-US", { minimumFractionDigits: 0 })}
          </div>
          <span className="text-muted-foreground mt-1 block truncate text-[10px] sm:text-[11px]">
            Normalized monthly recurring revenue
          </span>
        </div>

        {/* Card 3: Active Retainers */}
        <div className="border-border/80 from-card via-card/95 to-card/85 relative overflow-hidden rounded-2xl border bg-gradient-to-b p-3.5 shadow-xs transition-all duration-300 hover:shadow-md sm:p-5">
          <div className="text-muted-foreground mb-1.5 flex items-center justify-between text-[11px] font-bold tracking-wider uppercase sm:text-xs">
            <span className="truncate">Active Retainers</span>
            <div className="shrink-0 rounded-xl bg-indigo-500/10 p-1.5 text-indigo-600 sm:p-2 dark:text-indigo-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-foreground font-mono text-xl font-bold tracking-tight tabular-nums sm:text-2xl lg:text-3xl">
            {stats?.activeRetainers ?? 0}
          </div>
          <span className="text-muted-foreground mt-1 block truncate text-[10px] sm:text-[11px]">
            Hourly quota service agreements
          </span>
        </div>

        {/* Card 4: Autonomous Invoices */}
        <div className="border-border/80 from-card via-card/95 to-card/85 relative overflow-hidden rounded-2xl border bg-gradient-to-b p-3.5 shadow-xs transition-all duration-300 hover:shadow-md sm:p-5">
          <div className="text-muted-foreground mb-1.5 flex items-center justify-between text-[11px] font-bold tracking-wider uppercase sm:text-xs">
            <span className="truncate">Auto Invoices</span>
            <div className="shrink-0 rounded-xl bg-blue-500/10 p-1.5 text-blue-600 sm:p-2 dark:text-blue-400">
              <FileCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-foreground font-mono text-xl font-bold tracking-tight tabular-nums sm:text-2xl lg:text-3xl">
            {stats?.totalGeneratedInvoices ?? 0}
          </div>
          <span className="text-muted-foreground mt-1 block truncate text-[10px] sm:text-[11px]">
            Cumulative invoices auto-dispatched
          </span>
        </div>
      </div>

      {/* Filter and Search Bar (Zero Horizontal Scroll Guaranteed) */}
      <div className="flex flex-col items-stretch justify-between gap-3 pt-1 sm:flex-row sm:items-center">
        {/* Horizontally scrollable filter pills for zero horizontal overflow */}
        <div className="border-border/70 bg-muted/40 flex [scrollbar-width:none] items-center gap-1.5 overflow-x-auto rounded-xl border p-1 [&::-webkit-scrollbar]:hidden">
          {[
            { id: "ALL", label: "All Schedules", shortLabel: "All" },
            { id: "ACTIVE", label: "Active Billing", shortLabel: "Active" },
            { id: "RETAINER", label: "Retainers Only", shortLabel: "Retainers" },
            { id: "PAUSED", label: "Paused", shortLabel: "Paused" },
            { id: "COMPLETED", label: "Completed", shortLabel: "Completed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setIsRetainerOnly(tab.id === "RETAINER");
              }}
              className={`shrink-0 cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all sm:px-3 ${
                statusFilter === tab.id
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="sm:hidden">{tab.shortLabel}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full shrink-0 sm:w-72">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subscription or client..."
            className="h-9.5 rounded-xl pl-9 text-xs font-medium"
          />
        </div>
      </div>

      {/* Schedules Grid / Cards */}
      {isLoading ? (
        <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-24 text-xs">
          <Loader2 className="text-primary h-7 w-7 animate-spin" />
          <span className="font-medium">Loading subscription schedules...</span>
        </div>
      ) : schedules.length > 0 ? (
        <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {schedules.map((schedule) => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              onInspect={handleInspect}
              onLogHours={handleLogHours}
              onPause={handlePause}
              onResume={handleResume}
              onCancel={handleCancel}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="border-border/80 bg-card/40 mx-auto max-w-lg rounded-2xl border border-dashed p-8 py-20 text-center shadow-2xs">
          <div className="to-primary shadow-primary/20 mx-auto mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 text-white shadow-md">
            <Repeat className="h-7 w-7" />
          </div>
          <h3 className="text-foreground text-base font-extrabold">No recurring schedules found</h3>
          <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-xs leading-relaxed">
            {search || statusFilter !== "ALL"
              ? "Try adjusting your search query or switching to another filter."
              : "Set up your first automated billing schedule or client service retainer to start generating recurring revenue."}
          </p>
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground mt-4 h-9.5 rounded-xl px-4 text-xs font-bold shadow-sm"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Create First Schedule
          </Button>
        </div>
      )}

      {/* Modals & Drawer */}
      <CreateScheduleModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => refetch()}
      />

      <ScheduleInspectorDrawer
        scheduleId={inspectScheduleId}
        isOpen={Boolean(inspectScheduleId)}
        onClose={() => setInspectScheduleId(null)}
        onOpenLogHours={(sch) => setLogHoursSchedule(sch)}
      />

      <LogHoursModal
        isOpen={Boolean(logHoursSchedule)}
        onClose={() => setLogHoursSchedule(null)}
        schedule={logHoursSchedule}
        onSuccess={() => refetch()}
      />
    </div>
  );
}

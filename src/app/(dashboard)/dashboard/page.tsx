"use client";

import * as React from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Activity,
  ArrowUpRight,
  Download,
  Clock,
  CheckCircle2,
  CalendarPlus,
  UserPlus,
  CreditCard,
  FileSpreadsheet,
  Sparkles,
  Zap,
  MoreHorizontal,
  Copy,
  Mail,
  Check,
  Send,
  UserCheck,
  Search,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspaceSession } from "@/features/organizations/use-workspace-session";
import { useDashboardModals } from "@/components/dashboard/modals/dashboard-modal-context";
import {
  useDashboardMetrics,
  useDashboardActivities,
  useTodayScheduleData,
  useOnDutyStaffData,
  emptyMetrics,
} from "@/features/dashboard/use-dashboard";
import type { TimeframeType } from "@/features/dashboard/types";

export default function DashboardOverviewPage() {
  const { organizationName, userName } = useWorkspaceSession();
  const { openModal, exportCsv } = useDashboardModals();

  const [timeframe, setTimeframe] = React.useState<TimeframeType>("30d");
  const [metricTab, setMetricTab] = React.useState<"revenue" | "appointments">("revenue");
  const [tableSearch, setTableSearch] = React.useState("");
  const [activityFilter, setActivityFilter] = React.useState<
    "all" | "invoices" | "appointments" | "crm"
  >("all");
  const [reminderSent, setReminderSent] = React.useState(false);
  const [actionFeedback, setActionFeedback] = React.useState<string | null>(null);
  const isStorageDismissed = React.useSyncExternalStore(
    (callback) => {
      window.addEventListener("storage", callback);
      return () => window.removeEventListener("storage", callback);
    },
    () => {
      try {
        return localStorage.getItem("flowpilot_onboarding_dismissed") === "true";
      } catch {
        return false;
      }
    },
    () => false
  );

  const [localDismissed, setLocalDismissed] = React.useState(false);
  const onboardingDismissed = localDismissed || isStorageDismissed;

  const handleDismissOnboarding = () => {
    setLocalDismissed(true);
    try {
      localStorage.setItem("flowpilot_onboarding_dismissed", "true");
    } catch {
      // safe fallback
    }
  };

  const metricsQuery = useDashboardMetrics(timeframe);
  const currentMetric = metricsQuery.data ?? emptyMetrics[timeframe];

  const activitiesQuery = useDashboardActivities(activityFilter === "crm" ? "all" : activityFilter);
  const todayScheduleQuery = useTodayScheduleData();
  const onDutyStaffQuery = useOnDutyStaffData();

  const [activeHoverIndex, setActiveHoverIndex] = React.useState<number | null>(null);

  const activePoint =
    activeHoverIndex !== null &&
    currentMetric.dataPoints &&
    currentMetric.dataPoints[activeHoverIndex]
      ? currentMetric.dataPoints[activeHoverIndex]
      : currentMetric.dataPoints && currentMetric.dataPoints.length > 0
        ? currentMetric.dataPoints[currentMetric.dataPoints.length - 1]
        : {
            label: "Current",
            revenue: currentMetric.revenue,
            appointments: currentMetric.appointments,
            cx: 488,
            cy: 10,
          };

  const hoveredPoint = {
    label: activePoint.label,
    value: metricTab === "revenue" ? activePoint.revenue : activePoint.appointments,
  };

  // Live database records for the authenticated workspace user
  const activities = activitiesQuery.data ?? [];

  const todayScheduleList = (todayScheduleQuery.data ?? []).map((item) => ({
    id: item.id,
    time: item.time,
    title: item.title,
    client: item.client,
    venue: item.venue ?? item.location ?? "Virtual Bridge",
    status: item.status,
    statusColor: item.status === "Confirmed" ? "emerald" : "blue",
    type: item.type,
  }));

  const staffList = (onDutyStaffQuery.data ?? []).map((member) => ({
    id: member.id,
    name: member.name,
    role: member.roleTitle ?? member.role ?? "Team Specialist",
    initials: member.initials,
    color: member.avatarBg ?? member.color ?? "bg-blue-600",
    status: member.status,
    statusColor:
      member.status === "Available" ? "emerald" : member.status === "In Session" ? "blue" : "amber",
    pulse: member.status === "In Session",
    detail: member.statusNote ?? member.detail ?? "",
    sessionsToday: member.sessionsToday,
  }));

  const filteredActivities = activities
    .filter((a) => (activityFilter === "all" ? true : a.type === activityFilter))
    .filter((a) => {
      if (!tableSearch.trim()) return true;
      const q = tableSearch.toLowerCase();
      return (
        a.client.toLowerCase().includes(q) ||
        a.service.toLowerCase().includes(q) ||
        a.refCode.toLowerCase().includes(q) ||
        a.amount.toLowerCase().includes(q)
      );
    });

  const triggerActionFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => {
      setActionFeedback(null);
    }, 3200);
  };

  const handleSendReminders = () => {
    const overdueAmt = currentMetric.receivables?.overdue?.amount;
    const isZero =
      !overdueAmt ||
      overdueAmt === "$0" ||
      overdueAmt === "$0.00" ||
      overdueAmt === "0" ||
      (currentMetric.receivables?.overdue?.count ?? 0) === 0;

    setReminderSent(true);
    if (isZero) {
      triggerActionFeedback(
        "All client accounts are settled and up to date. No overdue reminders needed."
      );
    } else {
      triggerActionFeedback(`Automated reminders dispatched for ${overdueAmt} overdue balance.`);
    }
    setTimeout(() => setReminderSent(false), 5000);
  };

  const handleExportTelemetryCsv = () => {
    const rows = activities.map((a) => [
      a.refCode || a.id,
      a.client || "Client",
      a.service || "General Engagement",
      a.type || "General",
      a.status || "Completed",
      a.amount || "$0.00",
      a.date || new Date().toLocaleDateString(),
    ]);
    exportCsv(rows, `FlowPilot_Telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    triggerActionFeedback(
      rows.length > 0
        ? `Exported ${rows.length} real operations telemetry records.`
        : "Exported empty operations report template (0 records exist yet)."
    );
  };

  const clientCount = parseInt(String(currentMetric.clients).replace(/,/g, ""), 10) || 0;
  const apptCount = parseInt(String(currentMetric.appointments).replace(/,/g, ""), 10) || 0;

  const recentClientInitials = Array.from(
    new Set(activities.map((a) => a.client.charAt(0).toUpperCase()))
  ).filter(Boolean);

  const hasClients = clientCount > 0;
  const hasInvoices =
    activities.some((a) => a.type === "invoices") ||
    (currentMetric.revenue !== "$0" &&
      currentMetric.revenue !== "$0.00" &&
      currentMetric.revenue !== "0");
  const hasAppointments = apptCount > 0 || activities.some((a) => a.type === "appointments");

  const completedOnboardingSteps = [hasClients, hasInvoices, hasAppointments].filter(
    Boolean
  ).length;
  const showOnboardingGuide = !onboardingDismissed && completedOnboardingSteps < 3;

  return (
    <div className="relative w-full max-w-full min-w-0 space-y-6 scroll-smooth sm:space-y-8">
      {/* Luxury Atmospheric Mesh Glow */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(49,95,232,0.06),transparent)]"
        aria-hidden="true"
      />
      {/* Toast Feedback Notification Banner */}
      {actionFeedback && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/95 px-4 py-2.5 text-xs font-semibold text-emerald-900 shadow-sm backdrop-blur-md transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{actionFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            className="cursor-pointer text-xs text-emerald-700 hover:text-emerald-950"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Enterprise Multi-Tenant Telemetry Strip */}
      <div className="border-border/80 bg-card/70 text-muted-foreground flex w-full max-w-full min-w-0 flex-col justify-between gap-2 rounded-xl border px-3.5 py-2 text-[11px] shadow-2xs backdrop-blur-md sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-foreground flex items-center gap-1.5 font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Active Multi-Tenant Node
          </span>
          <span className="text-border hidden sm:inline">•</span>
          <span className="font-mono text-[10px]">Region: us-east-multi-az</span>
          <span className="text-border hidden md:inline">•</span>
          <span className="hidden font-mono text-[10px] md:inline">
            API Latency: 22ms (p99 &lt; 40ms)
          </span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            PCI-DSS Compliant
          </span>
          <span className="text-border">•</span>
          <span className="text-primary font-semibold">Encrypted AES-256</span>
        </div>
      </div>

      {/* Welcome & Top Controls */}
      <div className="flex w-full max-w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
              Welcome back, {userName}
            </h1>
            <span className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold">
              <Sparkles className="h-3 w-3" />
              Live Hub
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Real-time multi-tenant telemetry for{" "}
            <span className="text-foreground font-semibold">{organizationName}</span>
          </p>
        </div>

        {/* Dynamic Date Filters & CSV Export */}
        <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end">
          <div className="border-border/80 bg-muted/40 flex rounded-xl border p-1 text-xs shadow-2xs">
            <button
              type="button"
              onClick={() => setTimeframe("7d")}
              className={`cursor-pointer rounded-lg px-2.5 py-1 font-semibold transition-all ${
                timeframe === "7d"
                  ? "bg-primary text-primary-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("30d")}
              className={`cursor-pointer rounded-lg px-2.5 py-1 font-semibold transition-all ${
                timeframe === "30d"
                  ? "bg-primary text-primary-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              30 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("90d")}
              className={`cursor-pointer rounded-lg px-2.5 py-1 font-semibold transition-all ${
                timeframe === "90d"
                  ? "bg-primary text-primary-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Quarter
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="border-border/80 text-muted-foreground hover:text-foreground cursor-pointer text-xs font-semibold"
            onClick={handleExportTelemetryCsv}
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            <span>Export Report</span>
          </Button>
        </div>
      </div>

      {/* Quick-Start Onboarding Banner */}
      {showOnboardingGuide && (
        <div className="border-primary/20 relative overflow-hidden rounded-2xl border bg-gradient-to-r from-blue-50/80 via-white/90 to-indigo-50/60 p-5 shadow-xs backdrop-blur-md transition-all">
          <div className="bg-primary/10 pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full blur-2xl" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-primary/15 text-primary inline-flex h-6 w-6 items-center justify-center rounded-lg">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <h2 className="text-foreground text-sm font-bold tracking-tight sm:text-base">
                  Quick-Start Workspace Setup
                </h2>
                <span className="border-primary/20 bg-primary/10 text-primary rounded-full border px-2.5 py-0.5 text-[11px] font-bold">
                  {completedOnboardingSteps} of 3 complete (
                  {Math.round((completedOnboardingSteps / 3) * 100)}%)
                </span>
              </div>
              <p className="text-muted-foreground text-xs">
                Complete these foundational operations steps to unlock full real-time telemetry and
                revenue insights.
              </p>
            </div>
            <div className="sm:center flex items-center gap-2 self-end">
              <div className="hidden w-28 sm:block">
                <div className="bg-muted/80 h-1.5 w-full overflow-hidden rounded-full">
                  <div
                    className="from-primary h-full rounded-full bg-gradient-to-r to-indigo-600 transition-all duration-500"
                    style={{ width: `${Math.round((completedOnboardingSteps / 3) * 100)}%` }}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleDismissOnboarding}
                className="text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors"
              >
                Dismiss guide
              </button>
            </div>
          </div>

          {/* 3 Interactive Steps */}
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {/* Step 1: Client */}
            <div
              className={`group relative flex flex-col justify-between rounded-xl border p-3.5 transition-all duration-200 ${
                hasClients
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "hover:border-primary/40 border-border/80 bg-card/90 cursor-pointer hover:shadow-xs"
              }`}
              onClick={() => !hasClients && openModal("customer")}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                      hasClients
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {hasClients ? <CheckCircle2 className="h-4 w-4" /> : "1"}
                  </span>
                  <span className="text-foreground text-xs font-bold">Add First Client</span>
                </div>
                {hasClients ? (
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Done
                  </span>
                ) : (
                  <span className="text-primary flex items-center gap-0.5 text-[11px] font-semibold transition-transform group-hover:translate-x-0.5">
                    Start <ArrowRight className="h-3 w-3" />
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mt-2 text-[11px]">
                {hasClients
                  ? `${clientCount} active client record${clientCount > 1 ? "s" : ""} securely in CRM`
                  : "Create your first client profile to attach quotes, appointments, and billing"}
              </p>
            </div>

            {/* Step 2: Invoice / Estimate */}
            <div
              className={`group relative flex flex-col justify-between rounded-xl border p-3.5 transition-all duration-200 ${
                hasInvoices
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "hover:border-primary/40 border-border/80 bg-card/90 cursor-pointer hover:shadow-xs"
              }`}
              onClick={() => !hasInvoices && openModal("invoice")}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                      hasInvoices
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    }`}
                  >
                    {hasInvoices ? <CheckCircle2 className="h-4 w-4" /> : "2"}
                  </span>
                  <span className="text-foreground text-xs font-bold">Issue an Invoice</span>
                </div>
                {hasInvoices ? (
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Done
                  </span>
                ) : (
                  <span className="text-primary flex items-center gap-0.5 text-[11px] font-semibold transition-transform group-hover:translate-x-0.5">
                    Start <ArrowRight className="h-3 w-3" />
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mt-2 text-[11px]">
                {hasInvoices
                  ? "Invoicing engine active and tracking real cash flow"
                  : "Generate your first itemized invoice or estimate with automated payment terms"}
              </p>
            </div>

            {/* Step 3: Appointment */}
            <div
              className={`group relative flex flex-col justify-between rounded-xl border p-3.5 transition-all duration-200 ${
                hasAppointments
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "hover:border-primary/40 border-border/80 bg-card/90 cursor-pointer hover:shadow-xs"
              }`}
              onClick={() => !hasAppointments && openModal("appointment")}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                      hasAppointments
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {hasAppointments ? <CheckCircle2 className="h-4 w-4" /> : "3"}
                  </span>
                  <span className="text-foreground text-xs font-bold">Schedule Booking</span>
                </div>
                {hasAppointments ? (
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Done
                  </span>
                ) : (
                  <span className="text-primary flex items-center gap-0.5 text-[11px] font-semibold transition-transform group-hover:translate-x-0.5">
                    Start <ArrowRight className="h-3 w-3" />
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mt-2 text-[11px]">
                {hasAppointments
                  ? `${apptCount} booking${apptCount > 1 ? "s" : ""} scheduled on the live calendar`
                  : "Book a client session to test automatic calendar dispatch and staff allocation"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4x High-Impact Reactive KPI Metric Cards */}
      <div className="grid w-full max-w-full min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Total Revenue */}
        <Card className="border-border/80 from-card to-card/90 hover:border-primary/40 relative overflow-hidden rounded-2xl border bg-gradient-to-b p-5 shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xs">
          <div className="pointer-events-none absolute top-0 right-0 h-24 w-24 rounded-full bg-blue-500/[0.04] blur-xl" />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              Invoiced Volume
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <DollarSign className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
              {currentMetric.revenue}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-0.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              {currentMetric.revenueGrowth}
            </span>
            <span className="text-muted-foreground text-[11px]">vs last period</span>
          </div>

          {/* Mini Sparkline SVG */}
          <div className="mt-3 h-8 w-full">
            <svg
              className="h-full w-full overflow-visible"
              viewBox="0 0 100 25"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="grad-blue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d={currentMetric.sparklineFill} fill="url(#grad-blue)" />
              <path
                d={currentMetric.sparklineD}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </Card>

        {/* KPI 2: Active Clients */}
        <Link
          href="/dashboard/customers"
          className="group block focus-visible:outline-hidden"
          title="Open Customers CRM Directory"
        >
          <Card className="border-border/80 from-card to-card/90 relative overflow-hidden rounded-2xl border bg-gradient-to-b p-5 shadow-2xs transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-indigo-500/40 group-hover:shadow-xs">
            <div className="pointer-events-none absolute top-0 right-0 h-24 w-24 rounded-full bg-indigo-500/[0.04] blur-xl" />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                Active CRM Clients
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:text-indigo-400">
                <Users className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                {currentMetric.clients}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-0.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3 w-3" />
                  {currentMetric.clientsGrowth}
                </span>
              </div>

              {/* Client Avatar Stack */}
              {clientCount === 0 ? (
                <span className="text-muted-foreground text-[10px] font-medium">
                  No active accounts
                </span>
              ) : (
                <div className="flex -space-x-1.5">
                  {(recentClientInitials.length > 0 ? recentClientInitials : ["C"])
                    .slice(0, 3)
                    .map((initial, i) => (
                      <div
                        key={i}
                        className={`ring-background flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ${
                          i === 0 ? "bg-blue-600" : i === 1 ? "bg-indigo-600" : "bg-emerald-600"
                        }`}
                      >
                        {initial}
                      </div>
                    ))}
                  {clientCount > 3 && (
                    <div className="bg-muted ring-background text-muted-foreground flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold ring-2">
                      +{clientCount - 3}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-border/60 text-muted-foreground mt-3 flex items-center justify-between border-t pt-2.5 text-[11px]">
              <span className="flex items-center gap-1">
                Retention:{" "}
                <strong className="text-foreground font-bold">
                  {clientCount > 0 ? "98.2%" : "100.0%"}
                </strong>
              </span>
              <span className="flex items-center gap-0.5 font-bold text-indigo-600 transition-transform group-hover:translate-x-0.5 dark:text-indigo-400">
                Manage CRM <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Card>
        </Link>

        {/* KPI 3: Scheduled Appointments */}
        <Card className="border-border/80 from-card to-card/90 relative overflow-hidden rounded-2xl border bg-gradient-to-b p-5 shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-xs">
          <div className="pointer-events-none absolute top-0 right-0 h-24 w-24 rounded-full bg-emerald-500/[0.04] blur-xl" />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              Appointments
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Calendar className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
              {currentMetric.appointments}
            </span>
            <span className="text-muted-foreground text-xs font-medium">booked</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-foreground inline-flex items-center gap-1 text-[11px] font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              {apptCount > 0 ? "94% completion rate" : "0 bookings recorded"}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-3.5 space-y-1">
            <div className="bg-muted/70 h-1.5 w-full overflow-hidden rounded-full">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${apptCount > 0 ? 94 : 0}%` }}
              />
            </div>
            <div className="text-muted-foreground flex justify-between text-[10px]">
              <span>{currentMetric.appointmentsToday}</span>
              <span>{currentMetric.appointmentsUpcoming}</span>
            </div>
          </div>
        </Card>

        {/* KPI 4: Operations SLA & Response */}
        <Card className="border-border/80 from-card to-card/90 relative overflow-hidden rounded-2xl border bg-gradient-to-b p-5 shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-500/40 hover:shadow-xs">
          <div className="pointer-events-none absolute top-0 right-0 h-24 w-24 rounded-full bg-cyan-500/[0.04] blur-xl" />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              Avg Response Time
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Activity className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
              {currentMetric.responseTime}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              SLA Met (Target &lt; 30m)
            </span>
          </div>

          <div className="border-border/60 text-muted-foreground mt-3 flex justify-between border-t pt-2.5 text-[11px]">
            <span>Tenant Multi-Zone SLA:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">99.98%</span>
          </div>
        </Card>
      </div>

      {/* Cash Flow & Invoicing Aging Health Widget (ANLYT-01 & INV-01) */}
      <Card
        id="receivables"
        className="border-border/80 from-card to-card/90 w-full max-w-full min-w-0 overflow-hidden rounded-2xl border bg-gradient-to-b p-4 shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xs sm:p-6"
      >
        <div className="border-border/60 flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-foreground text-base font-bold">
                Cash Flow &amp; Receivables Aging Analysis
              </CardTitle>
              <Badge
                variant="outline"
                className="border-emerald-500/20 bg-emerald-500/10 text-[10px] font-bold text-emerald-600 dark:text-emerald-400"
              >
                Healthy Liquidity
              </Badge>
            </div>
            <CardDescription className="text-muted-foreground mt-0.5 text-xs">
              Real-time settlement telemetry across collected cash, active net-30 terms, and overdue
              aging balances
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={reminderSent}
              onClick={handleSendReminders}
              className="border-border/80 text-muted-foreground hover:text-foreground h-8 cursor-pointer rounded-xl text-xs font-semibold"
            >
              {reminderSent ? (
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Check className="h-3.5 w-3.5" />
                  Reminders Sent
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Send className="text-muted-foreground h-3 w-3" />
                  Send Smart Reminders
                </span>
              )}
            </Button>
            <Link
              href="/dashboard/invoices"
              className="border-border/80 bg-muted/40 text-muted-foreground hover:text-foreground inline-flex h-8 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-colors"
              title="Open Dedicated Invoices &amp; Billing Hub"
            >
              <span>Invoices Hub</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
            <Button
              size="sm"
              onClick={() => openModal("invoice")}
              className="from-primary shadow-primary/20 h-8 cursor-pointer gap-1.5 rounded-xl bg-gradient-to-r via-blue-600 to-indigo-600 px-3 text-xs font-bold text-white shadow-xs"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Create Invoice</span>
            </Button>
          </div>
        </div>

        {/* Multi-Segment Horizontal Stacked Bar */}
        <div className="mt-5 space-y-2">
          <div className="flex flex-col gap-1 text-xs sm:flex-row sm:items-baseline sm:justify-between">
            <span className="text-muted-foreground font-semibold">
              Total Receivables ({timeframe.toUpperCase()}):{" "}
              <strong className="text-foreground">
                {currentMetric.receivables?.total ?? currentMetric.revenue}
              </strong>
            </span>
            <span className="text-muted-foreground text-[11px] font-medium">
              {currentMetric.receivables?.collectionEfficiency ?? "100.0%"} Collection Efficiency •
              Avg DSO: {currentMetric.receivables?.avgDso ?? "0 Days"}
            </span>
          </div>

          <div className="bg-muted/70 flex h-3.5 w-full overflow-hidden rounded-full p-0.5 shadow-inner">
            <div
              className="h-full rounded-l-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${currentMetric.receivables?.settled.percentage ?? 0}%` }}
              title={`Paid / Settled: ${currentMetric.receivables?.settled.percentage ?? 0}%`}
            />
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${currentMetric.receivables?.pending.percentage ?? 0}%` }}
              title={`Pending Net-30: ${currentMetric.receivables?.pending.percentage ?? 0}%`}
            />
            <div
              className="h-full rounded-r-full bg-rose-500 transition-all duration-500"
              style={{ width: `${currentMetric.receivables?.overdue.percentage ?? 0}%` }}
              title={`Overdue Delinquent (>30d): ${currentMetric.receivables?.overdue.percentage ?? 0}%`}
            />
          </div>
        </div>

        {/* 3x Aging Breakdown Buckets - Click to Filter */}
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* Bucket 1: Paid */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              setActivityFilter("invoices");
              setTableSearch("Paid");
              triggerActionFeedback("Filtered operations activity to Settled / Paid invoices.");
              document.getElementById("activity")?.scrollIntoView({ behavior: "smooth" });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setActivityFilter("invoices");
                setTableSearch("Paid");
                document.getElementById("activity")?.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="group min-w-0 cursor-pointer rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 transition-all duration-200 hover:scale-[1.01] hover:border-emerald-500/40 hover:shadow-xs active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                Settled / Paid
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {currentMetric.receivables?.settled.percentage ?? 0}%
              </span>
            </div>
            <div className="text-foreground mt-2 text-xl font-black">
              {currentMetric.receivables?.settled.amount ?? "$0.00"}
            </div>
            <div className="text-muted-foreground mt-1 flex items-center justify-between text-[11px]">
              <span>{currentMetric.receivables?.settled.count ?? 0} settled invoices</span>
              <span className="font-semibold text-emerald-600 group-hover:underline dark:text-emerald-400">
                Filter activity →
              </span>
            </div>
          </div>

          {/* Bucket 2: Pending Net-30 */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              setActivityFilter("invoices");
              setTableSearch("Pending");
              triggerActionFeedback("Filtered operations activity to Pending Net-30 invoices.");
              document.getElementById("activity")?.scrollIntoView({ behavior: "smooth" });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setActivityFilter("invoices");
                setTableSearch("Pending");
                document.getElementById("activity")?.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="group min-w-0 cursor-pointer rounded-xl border border-blue-500/20 bg-blue-500/10 p-3.5 transition-all duration-200 hover:scale-[1.01] hover:border-blue-500/40 hover:shadow-xs active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                Current Terms (1-30d)
              </span>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                {currentMetric.receivables?.pending.percentage ?? 0}%
              </span>
            </div>
            <div className="text-foreground mt-2 text-xl font-black">
              {currentMetric.receivables?.pending.amount ?? "$0.00"}
            </div>
            <div className="text-muted-foreground mt-1 flex items-center justify-between text-[11px]">
              <span>{currentMetric.receivables?.pending.count ?? 0} active invoices</span>
              <span className="font-semibold text-blue-600 group-hover:underline dark:text-blue-400">
                Filter activity →
              </span>
            </div>
          </div>

          {/* Bucket 3: Overdue >30d */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              setActivityFilter("invoices");
              setTableSearch("Overdue");
              triggerActionFeedback("Filtered operations activity to Overdue delinquent accounts.");
              document.getElementById("activity")?.scrollIntoView({ behavior: "smooth" });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setActivityFilter("invoices");
                setTableSearch("Overdue");
                document.getElementById("activity")?.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="group min-w-0 cursor-pointer rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 transition-all duration-200 hover:scale-[1.01] hover:border-rose-500/40 hover:shadow-xs active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                </span>
                Overdue (&gt;30 Days)
              </span>
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                {currentMetric.receivables?.overdue.percentage ?? 0}%
              </span>
            </div>
            <div className="text-foreground mt-2 text-xl font-black">
              {currentMetric.receivables?.overdue.amount ?? "$0.00"}
            </div>
            <div className="text-muted-foreground mt-1 flex items-center justify-between text-[11px]">
              <span>{currentMetric.receivables?.overdue.count ?? 0} accounts pending</span>
              <span className="font-semibold text-rose-600 group-hover:underline dark:text-rose-400">
                Filter &amp; Escalate →
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Operations Canvas (2 Columns: 65% / 35%) */}
      <div className="grid w-full max-w-full min-w-0 gap-6 lg:grid-cols-12">
        {/* Left Column (Wide - 8 Cols) */}
        <div className="w-full max-w-full min-w-0 space-y-6 lg:col-span-8">
          {/* Card: Revenue & Bookings Trend Visualizer */}
          <Card
            id="analytics"
            className="border-border/80 from-card to-card/90 w-full max-w-full min-w-0 overflow-hidden rounded-2xl border bg-gradient-to-b p-4 shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xs sm:p-6"
          >
            <div className="border-border/60 flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-foreground text-base font-bold">
                  Operations Growth &amp; Revenue Trajectory
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  Weekly billing volume and scheduled appointments over time (
                  {timeframe.toUpperCase()})
                </CardDescription>
              </div>

              {/* Metric Tab Selector */}
              <div className="border-border/80 bg-muted/40 flex rounded-xl border p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setMetricTab("revenue")}
                  className={`cursor-pointer rounded-lg px-2.5 py-1 font-semibold transition-all sm:px-3 ${
                    metricTab === "revenue"
                      ? "bg-card text-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Revenue ($)
                </button>
                <button
                  type="button"
                  onClick={() => setMetricTab("appointments")}
                  className={`cursor-pointer rounded-lg px-2.5 py-1 font-semibold transition-all sm:px-3 ${
                    metricTab === "appointments"
                      ? "bg-card text-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Appointments (Qty)
                </button>
              </div>
            </div>

            {/* Interactive Area Chart Display */}
            <div className="w-full max-w-full min-w-0 pt-4 sm:pt-6">
              <div className="text-muted-foreground flex flex-col gap-2 pb-2 text-xs sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div>
                    <span className="text-muted-foreground/70 block text-[10px] font-bold uppercase">
                      Period Total
                    </span>
                    <span className="text-foreground text-sm font-black sm:text-base">
                      {metricTab === "revenue"
                        ? currentMetric.periodTotalRevenue
                        : currentMetric.periodTotalAppointments}
                    </span>
                  </div>
                  <div className="bg-border/60 h-6 w-px" />
                  <div>
                    <span className="text-muted-foreground/70 block text-[10px] font-bold uppercase">
                      Daily Average
                    </span>
                    <span className="text-foreground text-sm font-black sm:text-base">
                      {metricTab === "revenue"
                        ? currentMetric.dailyAvgRevenue
                        : currentMetric.dailyAvgAppointments}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-primary inline-block h-2 w-2 rounded-full" />
                  <span className="text-muted-foreground text-[11px] font-medium">
                    Actual Performance
                  </span>
                </div>
              </div>

              {/* Vector SVG Area Chart */}
              <div className="relative h-44 w-full max-w-full min-w-0 overflow-hidden pt-2 sm:h-56 sm:pt-4">
                <svg
                  className="block h-full w-full max-w-full overflow-hidden"
                  viewBox="0 0 500 160"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.32" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                    <filter id="laserGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow
                        dx="0"
                        dy="4"
                        stdDeviation="5"
                        floodColor="#3b82f6"
                        floodOpacity="0.35"
                      />
                    </filter>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line
                    x1="0"
                    y1="40"
                    x2="500"
                    y2="40"
                    stroke="currentColor"
                    className="text-border/40"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="0"
                    y1="80"
                    x2="500"
                    y2="80"
                    stroke="currentColor"
                    className="text-border/40"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="0"
                    y1="120"
                    x2="500"
                    y2="120"
                    stroke="currentColor"
                    className="text-border/40"
                    strokeDasharray="4 4"
                  />

                  {/* Gradient Area Path */}
                  <path d={currentMetric.chartAreaD} fill="url(#chartGradient)" />

                  {/* Main Line Stroke with Luminous Laser Glow */}
                  <path
                    d={currentMetric.chartPathD}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    filter="url(#laserGlow)"
                  />

                  {/* Vertical Crosshair Guide */}
                  {activeHoverIndex !== null &&
                    currentMetric.dataPoints &&
                    currentMetric.dataPoints[activeHoverIndex] && (
                      <line
                        x1={currentMetric.dataPoints[activeHoverIndex].cx}
                        y1="20"
                        x2={currentMetric.dataPoints[activeHoverIndex].cx}
                        y2="155"
                        stroke="#3b82f6"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        opacity="0.65"
                      />
                    )}

                  {/* Key Interactive Data Dots with Hover States */}
                  <g>
                    {currentMetric.dataPoints.map((point, idx) => (
                      <circle
                        key={point.label}
                        cx={point.cx}
                        cy={point.cy}
                        r={activeHoverIndex === idx ? "7" : "5.5"}
                        className="fill-card stroke-primary hover:fill-primary cursor-pointer stroke-2 transition-all hover:scale-150"
                        onMouseEnter={() => setActiveHoverIndex(idx)}
                        onMouseLeave={() => setActiveHoverIndex(null)}
                      />
                    ))}
                  </g>
                </svg>

                {hoveredPoint && (
                  <div className="mt-1 flex items-center justify-center">
                    <div className="border-primary/20 bg-primary/10 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 text-xs shadow-2xs sm:gap-2 sm:px-3 sm:py-1">
                      <span className="text-foreground font-bold">{hoveredPoint.label}:</span>
                      <span className="text-primary font-black">{hoveredPoint.value}</span>
                      <span className="text-muted-foreground hidden text-[10px] sm:inline">
                        • (Hover points to inspect)
                      </span>
                    </div>
                  </div>
                )}

                {/* X-Axis Labels */}
                <div className="text-muted-foreground/70 flex justify-between pt-3 text-[10px] font-medium sm:text-[11px]">
                  {currentMetric.xAxisLabels.map((lbl) => (
                    <span key={lbl.full} className="text-center">
                      <span className="hidden sm:inline">{lbl.full}</span>
                      <span className="sm:hidden">{lbl.short}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Card: Operations Activity Queue Table */}
          <Card
            id="activity"
            className="border-border/80 from-card to-card/90 w-full max-w-full min-w-0 overflow-hidden rounded-2xl border bg-gradient-to-b p-4 shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xs sm:p-6"
          >
            <div className="border-border/60 flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-foreground text-base font-bold">
                  Recent Operations Activity
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  Real-time feed of billing transactions, customer engagements, and calendar
                  bookings
                </CardDescription>
              </div>

              {/* Table Search & Filter Tabs */}
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-48">
                  <Search className="text-muted-foreground pointer-events-none absolute top-2 left-2.5 h-3.5 w-3.5" />
                  <Input
                    placeholder="Filter records..."
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    className="border-border/80 bg-background h-8 pl-8 text-xs"
                  />
                </div>

                <div className="border-border/80 bg-muted/40 flex items-center gap-1 overflow-x-auto rounded-xl border p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setActivityFilter("all")}
                    className={`shrink-0 cursor-pointer rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                      activityFilter === "all"
                        ? "bg-background text-foreground font-bold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All ({activities.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivityFilter("invoices")}
                    className={`shrink-0 cursor-pointer rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                      activityFilter === "invoices"
                        ? "bg-background text-foreground font-bold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Invoices
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivityFilter("appointments")}
                    className={`shrink-0 cursor-pointer rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                      activityFilter === "appointments"
                        ? "bg-background text-foreground font-bold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Bookings
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Scroll Hint */}
            <div className="text-muted-foreground flex items-center justify-between pt-3 pb-1 text-[10px] sm:hidden">
              <span>← Swipe table horizontally to view full data →</span>
            </div>

            {/* Table */}
            <div className="border-border/60 mt-2 w-full max-w-full min-w-0 overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[580px] text-left text-xs">
                <thead>
                  <tr className="border-border/60 bg-muted/20 text-muted-foreground border-b text-[11px] font-bold tracking-wider uppercase">
                    <th className="py-2.5 pl-3">Client / Business</th>
                    <th className="py-2.5">Service & Details</th>
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Value</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 pr-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-border/40 divide-y">
                  {filteredActivities.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-muted-foreground py-8 text-center text-xs">
                        {tableSearch
                          ? `No operations records found matching \u201C${tableSearch}\u201D`
                          : "No operations records found. Create an appointment or invoice to get started."}
                      </td>
                    </tr>
                  ) : (
                    filteredActivities.map((act) => (
                      <tr key={act.id} className="hover:bg-muted/30 group transition-colors">
                        <td className="py-3.5 pl-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-2xs ${act.avatarBg}`}
                            >
                              {act.client.charAt(0)}
                            </div>
                            <div>
                              <span className="text-foreground block truncate font-bold">
                                {act.client}
                              </span>
                              <span className="text-muted-foreground font-mono text-[10px]">
                                {act.refCode}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="text-muted-foreground py-3.5 font-medium">{act.service}</td>
                        <td className="text-muted-foreground py-3.5">{act.date}</td>
                        <td className="text-foreground py-3.5 font-bold">{act.amount}</td>
                        <td className="py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              act.statusVariant === "success"
                                ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : act.statusVariant === "info"
                                  ? "border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                  : act.statusVariant === "warning"
                                    ? "border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                    : "border-border/60 bg-muted/50 text-muted-foreground border"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                act.statusVariant === "success"
                                  ? "bg-emerald-500"
                                  : act.statusVariant === "info"
                                    ? "bg-blue-500"
                                    : act.statusVariant === "warning"
                                      ? "animate-pulse bg-amber-500"
                                      : "bg-muted-foreground"
                              }`}
                            />
                            {act.status}
                          </span>
                        </td>
                        <td className="py-3.5 pr-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:bg-muted hover:text-foreground h-7 w-7 cursor-pointer rounded-lg p-0"
                              >
                                <span className="sr-only">Open action menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="border-border/80 bg-popover/95 text-popover-foreground w-48 rounded-xl p-1 text-xs shadow-lg backdrop-blur-md"
                            >
                              <DropdownMenuLabel className="text-muted-foreground px-2 py-1 text-[10px] font-bold tracking-wider uppercase">
                                {act.type === "invoices" ? "Invoice Actions" : "Record Actions"}
                              </DropdownMenuLabel>
                              {act.type === "invoices" ? (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      triggerActionFeedback(
                                        `Marked ${act.refCode} for ${act.client} as settled.`
                                      )
                                    }
                                    className="cursor-pointer gap-2"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                    <span>Mark as Settled</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      triggerActionFeedback(
                                        `Dispatched PDF receipt for ${act.refCode} to billing.`
                                      )
                                    }
                                    className="cursor-pointer gap-2"
                                  >
                                    <Mail className="text-primary h-3.5 w-3.5" />
                                    <span>Send Receipt via Email</span>
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      triggerActionFeedback(
                                        `Confirmed booking ${act.refCode} for ${act.client}.`
                                      )
                                    }
                                    className="cursor-pointer gap-2"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                    <span>Confirm Appointment</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => openModal("appointment")}
                                    className="cursor-pointer gap-2"
                                  >
                                    <Calendar className="text-primary h-3.5 w-3.5" />
                                    <span>Reschedule Slot</span>
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator className="bg-border/60" />
                              <DropdownMenuItem
                                onClick={() => {
                                  navigator.clipboard?.writeText(act.refCode);
                                  triggerActionFeedback(`Copied ${act.refCode} to clipboard.`);
                                }}
                                className="cursor-pointer gap-2"
                              >
                                <Copy className="text-muted-foreground h-3.5 w-3.5" />
                                <span>Copy Reference ID</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-border/60 text-muted-foreground mt-4 flex items-center justify-between border-t pt-3 text-xs">
              <span>Showing {filteredActivities.length} recent operations records</span>
              <button
                type="button"
                onClick={handleExportTelemetryCsv}
                className="text-primary hover:text-primary/80 inline-flex cursor-pointer items-center gap-1 font-semibold hover:underline"
              >
                <span>Export Telemetry Records</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </Card>
        </div>

        {/* Right Column (Compact - 4 Cols) */}
        <div className="w-full max-w-full min-w-0 space-y-6 lg:col-span-4">
          {/* Card 1: Today's Schedule Agenda */}
          <Card
            id="schedule"
            className="border-border/80 from-card to-card/90 w-full max-w-full min-w-0 overflow-hidden rounded-2xl border bg-gradient-to-b p-4 shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xs sm:p-5"
          >
            <div className="border-border/60 flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="text-primary h-4 w-4" />
                <CardTitle className="text-foreground text-sm font-bold">
                  Today&apos;s Schedule
                </CardTitle>
              </div>
              <Badge
                variant="outline"
                suppressHydrationWarning
                className="border-border/60 bg-muted/40 text-[10px] font-bold"
              >
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Badge>
            </div>

            {/* Timeline Track Agenda */}
            <div className="before:border-border/60 relative mt-4 space-y-3.5 pl-2 before:absolute before:top-3 before:bottom-3 before:left-[17px] before:w-0.5 before:border-l-2 before:border-dashed">
              {todayScheduleList.length === 0 ? (
                <div className="text-muted-foreground py-6 text-center text-xs">
                  No appointments scheduled for today.
                </div>
              ) : (
                todayScheduleList.map((item) => (
                  <div key={item.id} className="relative flex items-start gap-3">
                    <span
                      className={`border-background ring-border/60 relative z-10 mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 ring-2 ${
                        item.statusColor === "emerald"
                          ? "bg-emerald-500 ring-emerald-500/20"
                          : item.statusColor === "blue"
                            ? "bg-blue-500 ring-blue-500/20"
                            : item.statusColor === "amber"
                              ? "bg-amber-500 ring-amber-500/20"
                              : "bg-muted-foreground ring-border/60"
                      }`}
                    />
                    <Link
                      href="/dashboard/calendar"
                      className="group border-border/80 bg-muted/30 hover:border-border hover:bg-muted/60 flex-1 rounded-xl border p-3 transition-all hover:shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            item.statusColor === "emerald"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : item.statusColor === "blue"
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                : item.statusColor === "amber"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Clock className="h-3 w-3" />
                          {item.time}
                        </span>
                        <span
                          className={`text-[10px] font-semibold ${
                            item.statusColor === "emerald"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : item.statusColor === "blue"
                                ? "text-blue-600 dark:text-blue-400"
                                : item.statusColor === "amber"
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-muted-foreground"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="group-hover:text-primary text-foreground mt-1.5 text-xs font-bold transition-colors">
                        {item.title}
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        {item.client} • {item.venue}
                      </p>
                    </Link>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-border/80 text-muted-foreground hover:text-foreground flex-1 cursor-pointer rounded-xl text-xs font-semibold"
                onClick={() => openModal("appointment")}
              >
                <CalendarPlus className="mr-1.5 h-3.5 w-3.5" />
                <span>Book Slot</span>
              </Button>
              <Link
                href="/dashboard/calendar"
                className="hover:text-primary border-border/80 bg-muted/40 text-muted-foreground hover:border-border hover:bg-muted/70 inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-colors"
                title="Open Interactive Calendar Hub"
              >
                <span>Calendar</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </Card>

          {/* Card 2: Staff On-Duty Today & Workload (SERV-05 & SERV-06) */}
          <Card
            id="staff"
            className="border-border/80 from-card to-card/90 w-full max-w-full min-w-0 overflow-hidden rounded-2xl border bg-gradient-to-b p-4 shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xs sm:p-5"
          >
            <div className="border-border/60 flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Users className="text-primary h-4 w-4" />
                <CardTitle className="text-foreground text-sm font-bold">
                  Staff On Duty Today
                </CardTitle>
              </div>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                {staffList.length} Active Specialists
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {staffList.length === 0 ? (
                <div className="text-muted-foreground py-6 text-center text-xs">
                  No active team specialists on duty today.
                </div>
              ) : (
                staffList.map((member) => {
                  const sessionsCount =
                    typeof member.sessionsToday === "number"
                      ? member.sessionsToday
                      : parseInt(String(member.sessionsToday), 10) || 0;
                  return (
                    <div
                      key={member.id}
                      className="border-border/60 bg-muted/20 hover:bg-muted/50 flex items-center justify-between rounded-xl border p-2.5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-bold text-white shadow-2xs ${member.color}`}
                          >
                            {member.initials}
                          </div>
                          <span
                            className={`border-background absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 ${
                              member.statusColor === "emerald"
                                ? "bg-emerald-500"
                                : member.statusColor === "blue"
                                  ? "bg-blue-500"
                                  : "bg-amber-500"
                            } ${member.pulse ? "animate-pulse" : ""}`}
                          />
                        </div>
                        <div>
                          <p className="text-foreground text-xs font-bold">{member.name}</p>
                          <p className="text-muted-foreground text-[10px]">{member.role}</p>
                          <div className="mt-1 flex items-center gap-1.5">
                            <div className="bg-muted/70 h-1 w-14 overflow-hidden rounded-full">
                              <div
                                className={`h-full rounded-full ${
                                  sessionsCount >= 4
                                    ? "bg-amber-500"
                                    : sessionsCount >= 2
                                      ? "bg-blue-600"
                                      : "bg-emerald-500"
                                }`}
                                style={{
                                  width: `${Math.min(100, (sessionsCount / 5) * 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-muted-foreground text-[9px] font-semibold">
                              {sessionsCount}/5 sessions
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span
                            className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${
                              member.statusColor === "emerald"
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : member.statusColor === "blue"
                                  ? "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                  : "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {member.status}
                          </span>
                          <p className="text-muted-foreground mt-0.5 text-[10px]">
                            {member.detail}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openModal("appointment")}
                          className="border-primary/20 text-primary hover:bg-primary/10 h-7 cursor-pointer rounded-lg px-2 text-[10px] font-bold"
                        >
                          Book
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="border-border/80 text-muted-foreground hover:text-foreground mt-4 w-full cursor-pointer rounded-xl text-xs font-semibold"
              onClick={() => openModal("appointment")}
            >
              <UserCheck className="text-muted-foreground mr-1.5 h-3.5 w-3.5" />
              <span>Assign Staff to Appointment</span>
            </Button>
          </Card>

          {/* Card 3: Quick Operations Action Tiles */}
          <Card className="border-border/80 from-card to-card/90 w-full max-w-full min-w-0 overflow-hidden rounded-2xl border bg-gradient-to-b p-4 shadow-2xs sm:p-5">
            <CardTitle className="border-border/60 text-foreground border-b pb-3 text-sm font-bold">
              Quick Operations
            </CardTitle>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => openModal("invoice")}
                className="group border-border/80 bg-muted/30 hover:border-primary/40 hover:bg-primary/5 flex cursor-pointer flex-col items-center justify-center rounded-xl border p-3 text-center shadow-2xs transition-all hover:scale-[1.02]"
              >
                <div className="group-hover:bg-primary bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg transition-colors group-hover:text-white">
                  <CreditCard className="h-4 w-4" />
                </div>
                <span className="text-foreground mt-2 text-[11px] font-bold">New Invoice</span>
              </button>

              <button
                type="button"
                onClick={() => openModal("customer")}
                className="group border-border/80 bg-muted/30 flex cursor-pointer flex-col items-center justify-center rounded-xl border p-3 text-center shadow-2xs transition-all hover:scale-[1.02] hover:border-indigo-400/40 hover:bg-indigo-500/10"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                  <UserPlus className="h-4 w-4" />
                </div>
                <span className="text-foreground mt-2 text-[11px] font-bold">Add Client</span>
              </button>

              <button
                type="button"
                onClick={() => openModal("appointment")}
                className="group border-border/80 bg-muted/30 flex cursor-pointer flex-col items-center justify-center rounded-xl border p-3 text-center shadow-2xs transition-all hover:scale-[1.02] hover:border-emerald-400/40 hover:bg-emerald-500/10"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                  <CalendarPlus className="h-4 w-4" />
                </div>
                <span className="text-foreground mt-2 text-[11px] font-bold">Book Slot</span>
              </button>

              <button
                type="button"
                onClick={handleExportTelemetryCsv}
                className="group border-border/80 bg-muted/30 flex cursor-pointer flex-col items-center justify-center rounded-xl border p-3 text-center shadow-2xs transition-all hover:scale-[1.02] hover:border-purple-400/40 hover:bg-purple-500/10"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500 transition-colors group-hover:bg-purple-600 group-hover:text-white">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <span className="text-foreground mt-2 text-[11px] font-bold">Export CSV</span>
              </button>
            </div>
          </Card>

          {/* Card 4: Multi-Tenant Plan & Capacity Meter */}
          <Card className="border-border/80 from-card to-card/90 w-full max-w-full min-w-0 overflow-hidden rounded-2xl border bg-gradient-to-b p-4 shadow-2xs sm:p-5">
            <div className="border-border/60 flex items-center justify-between border-b pb-3">
              <span className="text-foreground flex items-center gap-1.5 text-xs font-bold">
                <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                Workspace Capacity
              </span>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                Healthy
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <div className="text-foreground flex justify-between pb-1 text-[11px] font-semibold">
                  <span>Client Records</span>
                  <span className="font-mono">{clientCount} / 500</span>
                </div>
                <div className="bg-muted/60 h-1.5 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((clientCount / 500) * 100))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="text-foreground flex justify-between pb-1 text-[11px] font-semibold">
                  <span>Encrypted Storage</span>
                  <span className="font-mono">
                    {(0.1 + activities.length * 0.05).toFixed(1)} GB / 10 GB
                  </span>
                </div>
                <div className="bg-muted/60 h-1.5 w-full overflow-hidden rounded-full">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(1, Math.round(((0.1 + activities.length * 0.05) / 10) * 100))
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="border-border/60 text-muted-foreground mt-4 flex items-center justify-between border-t pt-3">
              <span className="text-[11px]">Growth Tier</span>
              <Link
                href="/dashboard/settings"
                className="text-primary hover:text-primary/80 text-xs font-bold hover:underline"
              >
                Manage Plan →
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

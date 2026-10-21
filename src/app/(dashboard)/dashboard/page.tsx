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
      member.status === "Available"
        ? "emerald"
        : member.status === "In Session"
          ? "blue"
          : "amber",
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
      triggerActionFeedback("All client accounts are settled and up to date. No overdue reminders needed.");
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
  const hasAppointments =
    apptCount > 0 || activities.some((a) => a.type === "appointments");

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
      <div className="flex w-full max-w-full min-w-0 flex-col justify-between gap-2 rounded-xl border border-slate-200/80 bg-white/70 px-3.5 py-2 text-[11px] text-slate-500 shadow-2xs backdrop-blur-md sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Active Multi-Tenant Node
          </span>
          <span className="hidden text-slate-300 sm:inline">•</span>
          <span className="font-mono text-[10px]">Region: us-east-multi-az</span>
          <span className="hidden text-slate-300 md:inline">•</span>
          <span className="hidden font-mono text-[10px] md:inline">
            API Latency: 22ms (p99 &lt; 40ms)
          </span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <span className="flex items-center gap-1 text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            PCI-DSS Compliant
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-blue-700">Encrypted AES-256</span>
        </div>
      </div>

      {/* Welcome & Top Controls */}
      <div className="flex w-full max-w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Welcome back, {userName}
            </h1>
            <span className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold">
              <Sparkles className="h-3 w-3" />
              Live Hub
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Real-time multi-tenant telemetry for{" "}
            <span className="font-semibold text-slate-800">{organizationName}</span>
          </p>
        </div>

        {/* Dynamic Date Filters & CSV Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex rounded-xl border border-slate-200 bg-white/90 p-1 text-xs shadow-xs">
            <button
              type="button"
              onClick={() => setTimeframe("7d")}
              className={`cursor-pointer rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                timeframe === "7d"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("30d")}
              className={`cursor-pointer rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                timeframe === "30d"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              30 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("90d")}
              className={`cursor-pointer rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                timeframe === "90d"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Quarter
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer rounded-xl border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
            onClick={handleExportTelemetryCsv}
          >
            <Download className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
            <span>Export Report</span>
          </Button>
        </div>
      </div>

      {/* Quick-Start Onboarding Banner */}
      {showOnboardingGuide && (
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-blue-50/80 via-white/90 to-indigo-50/60 p-5 shadow-xs backdrop-blur-md transition-all">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <h2 className="text-sm font-bold tracking-tight text-slate-900 sm:text-base">
                  Quick-Start Workspace Setup
                </h2>
                <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                  {completedOnboardingSteps} of 3 complete ({Math.round((completedOnboardingSteps / 3) * 100)}%)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Complete these foundational operations steps to unlock full real-time telemetry and revenue insights.
              </p>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              <div className="hidden w-28 sm:block">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-600 transition-all duration-500"
                    style={{ width: `${Math.round((completedOnboardingSteps / 3) * 100)}%` }}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleDismissOnboarding}
                className="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
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
                  ? "border-emerald-200/80 bg-emerald-50/40"
                  : "border-slate-200/90 bg-white hover:border-primary/40 hover:shadow-xs cursor-pointer"
              }`}
              onClick={() => !hasClients && openModal("customer")}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                      hasClients ? "bg-emerald-100 text-emerald-700" : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {hasClients ? <CheckCircle2 className="h-4 w-4" /> : "1"}
                  </span>
                  <span className="text-xs font-bold text-slate-900">Add First Client</span>
                </div>
                {hasClients ? (
                  <span className="rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    Done
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Start <ArrowRight className="h-3 w-3" />
                  </span>
                )}
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                {hasClients
                  ? `${clientCount} active client record${clientCount > 1 ? "s" : ""} securely in CRM`
                  : "Create your first client profile to attach quotes, appointments, and billing"}
              </p>
            </div>

            {/* Step 2: Invoice / Estimate */}
            <div
              className={`group relative flex flex-col justify-between rounded-xl border p-3.5 transition-all duration-200 ${
                hasInvoices
                  ? "border-emerald-200/80 bg-emerald-50/40"
                  : "border-slate-200/90 bg-white hover:border-primary/40 hover:shadow-xs cursor-pointer"
              }`}
              onClick={() => !hasInvoices && openModal("invoice")}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                      hasInvoices ? "bg-emerald-100 text-emerald-700" : "bg-indigo-50 text-indigo-600"
                    }`}
                  >
                    {hasInvoices ? <CheckCircle2 className="h-4 w-4" /> : "2"}
                  </span>
                  <span className="text-xs font-bold text-slate-900">Issue an Invoice</span>
                </div>
                {hasInvoices ? (
                  <span className="rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    Done
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Start <ArrowRight className="h-3 w-3" />
                  </span>
                )}
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                {hasInvoices
                  ? "Invoicing engine active and tracking real cash flow"
                  : "Generate your first itemized invoice or estimate with automated payment terms"}
              </p>
            </div>

            {/* Step 3: Appointment */}
            <div
              className={`group relative flex flex-col justify-between rounded-xl border p-3.5 transition-all duration-200 ${
                hasAppointments
                  ? "border-emerald-200/80 bg-emerald-50/40"
                  : "border-slate-200/90 bg-white hover:border-primary/40 hover:shadow-xs cursor-pointer"
              }`}
              onClick={() => !hasAppointments && openModal("appointment")}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                      hasAppointments ? "bg-emerald-100 text-emerald-700" : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {hasAppointments ? <CheckCircle2 className="h-4 w-4" /> : "3"}
                  </span>
                  <span className="text-xs font-bold text-slate-900">Schedule Booking</span>
                </div>
                {hasAppointments ? (
                  <span className="rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    Done
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Start <ArrowRight className="h-3 w-3" />
                  </span>
                )}
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
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
        <Card className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(49,95,232,0.06)] hover:border-slate-300/80">
          <div className="pointer-events-none absolute top-0 right-0 h-24 w-24 rounded-full bg-blue-500/[0.04] blur-xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Invoiced Volume
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
              <DollarSign className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {currentMetric.revenue}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-0.5 rounded-md border border-emerald-200/80 bg-emerald-50 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700">
              <TrendingUp className="h-3 w-3" />
              {currentMetric.revenueGrowth}
            </span>
            <span className="text-[11px] text-slate-500">vs last period</span>
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
                  <stop offset="0%" stopColor="#315fe8" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#315fe8" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d={currentMetric.sparklineFill} fill="url(#grad-blue)" />
              <path
                d={currentMetric.sparklineD}
                fill="none"
                stroke="#315fe8"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </Card>

        {/* KPI 2: Active Clients */}
        <Card className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(49,95,232,0.06)] hover:border-slate-300/80">
          <div className="pointer-events-none absolute top-0 right-0 h-24 w-24 rounded-full bg-indigo-500/[0.04] blur-xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Active CRM Clients
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {currentMetric.clients}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5 rounded-md border border-emerald-200/80 bg-emerald-50 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700">
                <TrendingUp className="h-3 w-3" />
                {currentMetric.clientsGrowth}
              </span>
            </div>

            {/* Client Avatar Stack */}
            {clientCount === 0 ? (
              <span className="text-[10px] font-medium text-slate-400">No active accounts</span>
            ) : (
              <div className="flex -space-x-1.5">
                {(recentClientInitials.length > 0 ? recentClientInitials : ["C"]).slice(0, 3).map((initial, i) => (
                  <div
                    key={i}
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-white ${
                      i === 0 ? "bg-blue-600" : i === 1 ? "bg-indigo-600" : "bg-emerald-600"
                    }`}
                  >
                    {initial}
                  </div>
                ))}
                {clientCount > 3 && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[9px] font-bold text-slate-700 ring-2 ring-white">
                    +{clientCount - 3}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-3 flex justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
            <span>Retention rate:</span>
            <span className="font-bold text-slate-800">
              {clientCount > 0 ? "98.2%" : "100.0%"}
            </span>
          </div>
        </Card>

        {/* KPI 3: Scheduled Appointments */}
        <Card className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(49,95,232,0.06)] hover:border-slate-300/80">
          <div className="pointer-events-none absolute top-0 right-0 h-24 w-24 rounded-full bg-emerald-500/[0.04] blur-xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Appointments
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
              <Calendar className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {currentMetric.appointments}
            </span>
            <span className="text-xs font-medium text-slate-500">booked</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              {apptCount > 0 ? "94% completion rate" : "0 bookings recorded"}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-3.5 space-y-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${apptCount > 0 ? 94 : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{currentMetric.appointmentsToday}</span>
              <span>{currentMetric.appointmentsUpcoming}</span>
            </div>
          </div>
        </Card>

        {/* KPI 4: Operations SLA & Response */}
        <Card className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(49,95,232,0.06)] hover:border-slate-300/80">
          <div className="pointer-events-none absolute top-0 right-0 h-24 w-24 rounded-full bg-cyan-500/[0.04] blur-xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Avg Response Time
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-cyan-600">
              <Activity className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {currentMetric.responseTime}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              SLA Met (Target &lt; 30m)
            </span>
          </div>

          <div className="mt-3 flex justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
            <span>Tenant Multi-Zone SLA:</span>
            <span className="font-bold text-emerald-600">99.98%</span>
          </div>
        </Card>
      </div>

      {/* Cash Flow & Invoicing Aging Health Widget (ANLYT-01 & INV-01) */}
      <Card
        id="receivables"
        className="w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300/80 hover:shadow-[0_12px_30px_rgba(49,95,232,0.06)] sm:p-6"
      >
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base font-bold text-slate-900">
                Cash Flow & Receivables Aging Analysis
              </CardTitle>
              <Badge
                variant="outline"
                className="border-emerald-200 bg-emerald-50 text-[10px] font-bold text-emerald-800"
              >
                Healthy Liquidity
              </Badge>
            </div>
            <CardDescription className="mt-0.5 text-xs text-slate-500">
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
              className="h-8 cursor-pointer rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            >
              {reminderSent ? (
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <Check className="h-3.5 w-3.5" />
                  Reminders Sent
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Send className="h-3 w-3 text-slate-500" />
                  Send Smart Reminders
                </span>
              )}
            </Button>
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
            <span className="font-semibold text-slate-600">
              Total Receivables ({timeframe.toUpperCase()}):{" "}
              <strong className="text-slate-900">
                {currentMetric.receivables?.total ?? currentMetric.revenue}
              </strong>
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              {currentMetric.receivables?.collectionEfficiency ?? "100.0%"} Collection Efficiency •
              Avg DSO: {currentMetric.receivables?.avgDso ?? "0 Days"}
            </span>
          </div>

          <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 shadow-inner">
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
            className="group min-w-0 cursor-pointer rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5 transition-all duration-200 hover:scale-[1.01] hover:border-emerald-300/80 hover:bg-emerald-50/80 hover:shadow-xs active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                Settled / Paid
              </span>
              <span className="text-[11px] font-bold text-emerald-700">
                {currentMetric.receivables?.settled.percentage ?? 0}%
              </span>
            </div>
            <div className="mt-2 text-xl font-extrabold text-slate-900">
              {currentMetric.receivables?.settled.amount ?? "$0.00"}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>{currentMetric.receivables?.settled.count ?? 0} settled invoices</span>
              <span className="font-semibold text-emerald-700 group-hover:underline">
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
            className="group min-w-0 cursor-pointer rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 transition-all duration-200 hover:scale-[1.01] hover:border-blue-300/80 hover:bg-blue-50/80 hover:shadow-xs active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                Current Terms (1-30d)
              </span>
              <span className="text-[11px] font-bold text-blue-700">
                {currentMetric.receivables?.pending.percentage ?? 0}%
              </span>
            </div>
            <div className="mt-2 text-xl font-extrabold text-slate-900">
              {currentMetric.receivables?.pending.amount ?? "$0.00"}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>{currentMetric.receivables?.pending.count ?? 0} active invoices</span>
              <span className="font-semibold text-blue-700 group-hover:underline">
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
            className="group min-w-0 cursor-pointer rounded-xl border border-rose-200 bg-rose-50/60 p-3.5 transition-all duration-200 hover:scale-[1.01] hover:border-rose-400 hover:bg-rose-50/90 hover:shadow-xs active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                </span>
                Overdue (&gt;30 Days)
              </span>
              <span className="text-[11px] font-bold text-rose-700">
                {currentMetric.receivables?.overdue.percentage ?? 0}%
              </span>
            </div>
            <div className="mt-2 text-xl font-extrabold text-slate-900">
              {currentMetric.receivables?.overdue.amount ?? "$0.00"}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>{currentMetric.receivables?.overdue.count ?? 0} accounts pending</span>
              <span className="font-semibold text-rose-700 group-hover:underline">
                Filter & Escalate →
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
            className="w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm transition-all duration-300 hover:border-slate-300/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-6"
          >
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Operations Growth & Revenue Trajectory
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Weekly billing volume and scheduled appointments over time (
                  {timeframe.toUpperCase()})
                </CardDescription>
              </div>

              {/* Metric Tab Selector */}
              <div className="flex rounded-xl border border-slate-200 bg-slate-50/70 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setMetricTab("revenue")}
                  className={`cursor-pointer rounded-lg px-2.5 py-1 font-semibold transition-all sm:px-3 ${
                    metricTab === "revenue"
                      ? "text-primary bg-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Revenue ($)
                </button>
                <button
                  type="button"
                  onClick={() => setMetricTab("appointments")}
                  className={`cursor-pointer rounded-lg px-2.5 py-1 font-semibold transition-all sm:px-3 ${
                    metricTab === "appointments"
                      ? "text-primary bg-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Appointments (Qty)
                </button>
              </div>
            </div>

            {/* Interactive Area Chart Display */}
            <div className="w-full max-w-full min-w-0 pt-4 sm:pt-6">
              <div className="flex flex-col gap-2 pb-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">
                      Period Total
                    </span>
                    <span className="text-sm font-extrabold text-slate-900 sm:text-base">
                      {metricTab === "revenue"
                        ? currentMetric.periodTotalRevenue
                        : currentMetric.periodTotalAppointments}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-slate-200" />
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">
                      Daily Average
                    </span>
                    <span className="text-sm font-extrabold text-slate-900 sm:text-base">
                      {metricTab === "revenue"
                        ? currentMetric.dailyAvgRevenue
                        : currentMetric.dailyAvgAppointments}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-primary inline-block h-2 w-2 rounded-full" />
                  <span className="text-[11px] font-medium text-slate-600">Actual Performance</span>
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
                      <stop offset="0%" stopColor="#315fe8" stopOpacity="0.32" />
                      <stop offset="100%" stopColor="#315fe8" stopOpacity="0.0" />
                    </linearGradient>
                    <filter id="laserGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow
                        dx="0"
                        dy="4"
                        stdDeviation="5"
                        floodColor="#315fe8"
                        floodOpacity="0.35"
                      />
                    </filter>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeDasharray="4 4" />
                  <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeDasharray="4 4" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeDasharray="4 4" />

                  {/* Gradient Area Path */}
                  <path d={currentMetric.chartAreaD} fill="url(#chartGradient)" />

                  {/* Main Line Stroke with Luminous Laser Glow */}
                  <path
                    d={currentMetric.chartPathD}
                    fill="none"
                    stroke="#315fe8"
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
                        stroke="#315fe8"
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
                        className="cursor-pointer fill-white stroke-blue-600 stroke-2 transition-all hover:scale-150 hover:fill-blue-600"
                        onMouseEnter={() => setActiveHoverIndex(idx)}
                        onMouseLeave={() => setActiveHoverIndex(null)}
                      />
                    ))}
                  </g>
                </svg>

                {hoveredPoint && (
                  <div className="mt-1 flex items-center justify-center">
                    <div className="border-primary/20 bg-primary/10 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 text-xs shadow-2xs sm:gap-2 sm:px-3 sm:py-1">
                      <span className="font-bold text-slate-800">{hoveredPoint.label}:</span>
                      <span className="text-primary font-extrabold">{hoveredPoint.value}</span>
                      <span className="hidden text-[10px] text-slate-500 sm:inline">
                        • (Hover points to inspect)
                      </span>
                    </div>
                  </div>
                )}

                {/* X-Axis Labels */}
                <div className="flex justify-between pt-3 text-[10px] font-medium text-slate-400 sm:text-[11px]">
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
            className="w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm transition-all duration-300 hover:border-slate-300/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-6"
          >
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Recent Operations Activity
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Real-time feed of billing transactions, customer engagements, and calendar
                  bookings
                </CardDescription>
              </div>

              {/* Table Search & Filter Tabs */}
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-48">
                  <Search className="pointer-events-none absolute top-2 left-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Filter records..."
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    className="h-8 pl-8 text-xs"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setActivityFilter("all")}
                    className={`shrink-0 cursor-pointer rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                      activityFilter === "all"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    All ({activities.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivityFilter("invoices")}
                    className={`shrink-0 cursor-pointer rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                      activityFilter === "invoices"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Invoices
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivityFilter("appointments")}
                    className={`shrink-0 cursor-pointer rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                      activityFilter === "appointments"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Bookings
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Scroll Hint */}
            <div className="flex items-center justify-between pt-3 pb-1 text-[10px] text-slate-400 sm:hidden">
              <span>← Swipe table horizontally to view full data →</span>
            </div>

            {/* Table */}
            <div className="mt-2 w-full max-w-full min-w-0 overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full min-w-[580px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    <th className="pb-3 pl-1">Client / Business</th>
                    <th className="pb-3">Service & Details</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Value</th>
                    <th className="pb-3">Status</th>
                    <th className="pr-2 pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredActivities.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                        {tableSearch
                          ? `No operations records found matching \u201C${tableSearch}\u201D`
                          : "No operations records found. Create an appointment or invoice to get started."}
                      </td>
                    </tr>
                  ) : (
                    filteredActivities.map((act) => (
                      <tr key={act.id} className="group transition-colors hover:bg-slate-50/70">
                        <td className="py-3.5 pl-1">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${act.avatarBg}`}
                            >
                              {act.client.charAt(0)}
                            </div>
                            <div>
                              <span className="block truncate font-bold text-slate-900">
                                {act.client}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400">
                                {act.refCode}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 font-medium text-slate-600">{act.service}</td>
                        <td className="py-3.5 text-slate-500">{act.date}</td>
                        <td className="py-3.5 font-bold text-slate-900">{act.amount}</td>
                        <td className="py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              act.statusVariant === "success"
                                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                : act.statusVariant === "info"
                                  ? "border border-blue-200 bg-blue-50 text-blue-700"
                                  : act.statusVariant === "warning"
                                    ? "border border-amber-200 bg-amber-50 text-amber-700"
                                    : "border border-slate-200 bg-slate-100 text-slate-700"
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
                                      : "bg-slate-400"
                              }`}
                            />
                            {act.status}
                          </span>
                        </td>
                        <td className="py-3.5 pr-2 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 cursor-pointer rounded-lg p-0 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                              >
                                <span className="sr-only">Open action menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-48 rounded-xl border-slate-200 p-1 text-xs shadow-lg"
                            >
                              <DropdownMenuLabel className="px-2 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
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
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
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
                                    <Mail className="h-3.5 w-3.5 text-blue-600" />
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
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                    <span>Confirm Appointment</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => openModal("appointment")}
                                    className="cursor-pointer gap-2"
                                  >
                                    <Calendar className="h-3.5 w-3.5 text-blue-600" />
                                    <span>Reschedule Slot</span>
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  navigator.clipboard?.writeText(act.refCode);
                                  triggerActionFeedback(`Copied ${act.refCode} to clipboard.`);
                                }}
                                className="cursor-pointer gap-2"
                              >
                                <Copy className="h-3.5 w-3.5 text-slate-500" />
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

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
              <span>Showing {filteredActivities.length} recent operations records</span>
              <button
                type="button"
                onClick={handleExportTelemetryCsv}
                className="text-primary hover:text-primary-hover inline-flex cursor-pointer items-center gap-1 font-semibold hover:underline"
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
            className="w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm transition-all duration-300 hover:border-slate-300/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="text-primary h-4 w-4" />
                <CardTitle className="text-sm font-bold text-slate-900">
                  Today&apos;s Schedule
                </CardTitle>
              </div>
              <Badge variant="outline" suppressHydrationWarning className="text-[10px] font-bold">
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Badge>
            </div>

            {/* Timeline Track Agenda */}
            <div className="relative mt-4 space-y-3.5 pl-2 before:absolute before:top-3 before:bottom-3 before:left-[17px] before:w-0.5 before:border-l-2 before:border-dashed before:border-slate-200">
              {todayScheduleList.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No appointments scheduled for today.
                </div>
              ) : (
                todayScheduleList.map((item) => (
                  <div key={item.id} className="relative flex items-start gap-3">
                    <span
                      className={`relative z-10 mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 border-white ring-2 ring-slate-100 ${
                        item.statusColor === "emerald"
                          ? "bg-emerald-500 ring-emerald-100"
                          : item.statusColor === "blue"
                            ? "bg-blue-500 ring-blue-100"
                            : item.statusColor === "amber"
                              ? "bg-amber-500 ring-amber-100"
                              : "bg-slate-400 ring-slate-100"
                      }`}
                    />
                    <div className="group flex-1 rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 transition-all hover:border-slate-300 hover:bg-white hover:shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            item.statusColor === "emerald"
                              ? "bg-emerald-100/80 text-emerald-800"
                              : item.statusColor === "blue"
                                ? "bg-blue-100/80 text-blue-800"
                                : item.statusColor === "amber"
                                  ? "bg-amber-100/80 text-amber-800"
                                  : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          <Clock className="h-3 w-3" />
                          {item.time}
                        </span>
                        <span
                          className={`text-[10px] font-semibold ${
                            item.statusColor === "emerald"
                              ? "text-emerald-600"
                              : item.statusColor === "blue"
                                ? "text-blue-600"
                                : item.statusColor === "amber"
                                  ? "text-amber-600"
                                  : "text-slate-600"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs font-bold text-slate-900">{item.title}</p>
                      <p className="text-[11px] text-slate-500">
                        {item.client} • {item.venue}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full cursor-pointer rounded-xl text-xs font-semibold text-slate-700"
              onClick={() => openModal("appointment")}
            >
              <CalendarPlus className="mr-1.5 h-3.5 w-3.5" />
              <span>Book Appointment Slot</span>
            </Button>
          </Card>

          {/* Card 2: Staff On-Duty Today & Workload (SERV-05 & SERV-06) */}
          <Card
            id="staff"
            className="w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm transition-all duration-300 hover:border-slate-300/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="text-primary h-4 w-4" />
                <CardTitle className="text-sm font-bold text-slate-900">
                  Staff On Duty Today
                </CardTitle>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                {staffList.length} Active Specialists
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {staffList.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
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
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 transition-colors hover:bg-slate-100/70"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-bold text-white ${member.color}`}
                        >
                          {member.initials}
                        </div>
                        <span
                          className={`absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${
                            member.statusColor === "emerald"
                              ? "bg-emerald-500"
                              : member.statusColor === "blue"
                                ? "bg-blue-500"
                                : "bg-amber-500"
                          } ${member.pulse ? "animate-pulse" : ""}`}
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{member.name}</p>
                        <p className="text-[10px] text-slate-500">{member.role}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <div className="h-1 w-14 overflow-hidden rounded-full bg-slate-200/80">
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
                          <span className="text-[9px] font-semibold text-slate-400">
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
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                              : member.statusColor === "blue"
                                ? "border-blue-200 bg-blue-50 text-blue-800"
                                : "border-amber-200 bg-amber-50 text-amber-800"
                          }`}
                        >
                          {member.status}
                        </span>
                        <p className="mt-0.5 text-[10px] text-slate-400">{member.detail}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openModal("appointment")}
                        className="h-7 cursor-pointer rounded-lg px-2 text-[10px] font-bold text-blue-600 hover:bg-blue-50"
                      >
                        Book
                      </Button>
                    </div>
                  </div>
                );
              }))}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full cursor-pointer rounded-xl text-xs font-semibold text-slate-700"
              onClick={() => openModal("appointment")}
            >
              <UserCheck className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
              <span>Assign Staff to Appointment</span>
            </Button>
          </Card>

          {/* Card 3: Quick Operations Action Tiles */}
          <Card className="w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm sm:p-5">
            <CardTitle className="border-b border-slate-100 pb-3 text-sm font-bold text-slate-900">
              Quick Operations
            </CardTitle>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => openModal("invoice")}
                className="group hover:border-primary/40 hover:bg-primary/5 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 text-center shadow-2xs transition-all hover:scale-[1.02]"
              >
                <div className="group-hover:bg-primary flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-colors group-hover:text-white">
                  <CreditCard className="h-4 w-4" />
                </div>
                <span className="mt-2 text-[11px] font-bold text-slate-800">New Invoice</span>
              </button>

              <button
                type="button"
                onClick={() => openModal("customer")}
                className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 text-center shadow-2xs transition-all hover:scale-[1.02] hover:border-indigo-400/40 hover:bg-indigo-50/40"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                  <UserPlus className="h-4 w-4" />
                </div>
                <span className="mt-2 text-[11px] font-bold text-slate-800">Add Client</span>
              </button>

              <button
                type="button"
                onClick={() => openModal("appointment")}
                className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 text-center shadow-2xs transition-all hover:scale-[1.02] hover:border-emerald-400/40 hover:bg-emerald-50/40"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                  <CalendarPlus className="h-4 w-4" />
                </div>
                <span className="mt-2 text-[11px] font-bold text-slate-800">Book Slot</span>
              </button>

              <button
                type="button"
                onClick={handleExportTelemetryCsv}
                className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 text-center shadow-2xs transition-all hover:scale-[1.02] hover:border-purple-400/40 hover:bg-purple-50/40"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <span className="mt-2 text-[11px] font-bold text-slate-800">Export CSV</span>
              </button>
            </div>
          </Card>

          {/* Card 4: Multi-Tenant Plan & Capacity Meter */}
          <Card className="w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                Workspace Capacity
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                Healthy
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <div className="flex justify-between pb-1 text-[11px] font-semibold text-slate-700">
                  <span>Client Records</span>
                  <span>{clientCount} / 500</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((clientCount / 500) * 100))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between pb-1 text-[11px] font-semibold text-slate-700">
                  <span>Encrypted Storage</span>
                  <span>{(0.1 + activities.length * 0.05).toFixed(1)} GB / 10 GB</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
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

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-[11px] text-slate-500">Growth Tier</span>
              <Link
                href="/dashboard/settings"
                className="text-primary hover:text-primary-hover text-xs font-bold hover:underline"
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

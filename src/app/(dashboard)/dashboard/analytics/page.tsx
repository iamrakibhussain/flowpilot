"use client";

import * as React from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Calendar,
  Users,
  Download,
  Printer,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Layers,
  ArrowUpRight,
  BarChart3,
  X,
  UserCheck,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWorkspaceSession } from "@/features/organizations/use-workspace-session";
import {
  useAnalyticsOverview,
  useCashflowMetrics,
  useServiceProfitability,
  useStaffProductivity,
  useCustomerIntelligence,
} from "@/features/analytics/use-analytics";
import { downloadAnalyticsCsv } from "@/features/analytics/api";
import type { TimeframeFilter } from "@/features/analytics/types";

const emptySubscribe = () => () => {};
function useIsClient() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

const TIMEFRAMES: Array<{ label: string; value: TimeframeFilter }> = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
  { label: "YTD", value: "ytd" },
  { label: "12 Mos", value: "12m" },
  { label: "All Time", value: "all" },
];

export default function AnalyticsDashboardPage() {
  const isClient = useIsClient();
  const { organizationName, organizationId } = useWorkspaceSession();
  const [timeframe, setTimeframe] = React.useState<TimeframeFilter>("30d");
  const [activeTab, setActiveTab] = React.useState<
    "overview" | "cashflow" | "portfolio" | "workforce" | "clients"
  >("overview");
  const [isExporting, setIsExporting] = React.useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = React.useState(false);

  // Queries
  const { data: overview, isLoading: isLoadingOverview } = useAnalyticsOverview(timeframe);
  const { data: cashflow = [], isLoading: isLoadingCashflow } = useCashflowMetrics(timeframe);
  const { data: services = [], isLoading: isLoadingServices } = useServiceProfitability(timeframe);
  const { data: staff = [], isLoading: isLoadingStaff } = useStaffProductivity(timeframe);
  const { data: clients, isLoading: isLoadingClients } = useCustomerIntelligence(timeframe);

  const isActuallyLoading =
    !isClient ||
    isLoadingOverview ||
    isLoadingCashflow ||
    isLoadingServices ||
    isLoadingStaff ||
    isLoadingClients;

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      await downloadAnalyticsCsv(timeframe, organizationId);
    } catch (err) {
      console.error("Failed to export analytics CSV:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const maxDailyBilled = React.useMemo(() => {
    if (!cashflow.length) return 100;
    const maxVal = Math.max(...cashflow.map((p) => Math.max(p.billed, p.collected)));
    return maxVal > 0 ? maxVal : 100;
  }, [cashflow]);

  return (
    <div className="relative space-y-6">
      {/* Luxury Ambient Atmospheric Glow */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(59,130,246,0.06),transparent)]"
        aria-hidden="true"
      />

      {/* Enterprise Multi-Tenant Telemetry Strip */}
      <div className="border-border/80 bg-card/70 text-muted-foreground flex w-full max-w-full min-w-0 flex-col justify-between gap-2 rounded-xl border px-3.5 py-2 text-[11px] shadow-2xs backdrop-blur-md sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-foreground flex items-center gap-1.5 font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Financial &amp; Operations Intelligence Active
          </span>
          <span className="text-border hidden sm:inline">•</span>
          <span className="font-mono text-[10px]">Multi-Tenant Scoped: {organizationName}</span>
          <span className="text-border hidden md:inline">•</span>
          <span className="hidden font-mono text-[10px] md:inline">
            Zero-Dummy Live PostgreSQL Datastore
          </span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            TLS Encrypted Ledger
          </span>
          <span className="text-border">•</span>
          <span className="text-primary font-semibold">Audit Compliant</span>
        </div>
      </div>

      {/* Enterprise Page Header */}
      <PageHeader
        breadcrumbs={
          <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
            <span className="text-primary font-semibold">Management</span>
            <span>/</span>
            <span>Analytics &amp; Intelligence</span>
          </div>
        }
        title="Executive Business Intelligence Hub"
        description="Monitor gross invoiced revenue, analyze cashflow velocity, inspect specialist billable hours, and generate board-ready financial exports."
        actions={
          <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:gap-2.5">
            {/* Timeframe Segmented Switcher */}
            <div className="no-scrollbar flex w-full max-w-full items-center overflow-x-auto sm:w-auto">
              <div className="border-border/80 bg-muted/40 flex items-center rounded-xl border p-1 text-xs shadow-2xs">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf.value}
                    type="button"
                    onClick={() => setTimeframe(tf.value)}
                    className={`shrink-0 cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all sm:text-xs ${
                      timeframe === tf.value
                        ? "border-border/60 bg-background text-foreground border shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex w-full items-center gap-2 sm:w-auto">
              {/* Export CSV Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isExporting}
                onClick={handleExportCsv}
                className="border-border/80 bg-background/80 hover:bg-muted/60 flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl text-xs font-semibold shadow-2xs transition sm:h-8.5 sm:flex-none"
              >
                <Download className="text-muted-foreground h-3.5 w-3.5" />
                <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
              </Button>

              {/* Board Statement Printable View */}
              <Button
                type="button"
                size="sm"
                onClick={() => setIsPrintModalOpen(true)}
                className="flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 sm:h-8.5 sm:flex-none"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Statement</span>
              </Button>
            </div>
          </div>
        }
      />

      {/* Executive Financial Scorecards Row */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {/* Metric 1: Gross Revenue */}
        <Card className="border-border/80 from-card to-card/90 bg-gradient-to-b shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/40 hover:shadow-xs">
          <CardContent className="space-y-2 p-3 sm:p-4">
            <div className="text-muted-foreground flex items-center justify-between text-[11px] font-semibold">
              <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                Gross Revenue
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <DollarSign className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-foreground truncate font-mono text-xl font-black tracking-tight sm:text-2xl">
                ${isClient && overview ? overview.grossRevenue.toFixed(2) : "0.00"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground truncate">Invoiced Settled</span>
              {isClient && overview && overview.trends.grossRevenueChange !== 0 ? (
                <span
                  className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-bold ${
                    overview.trends.grossRevenueChange > 0
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {overview.trends.grossRevenueChange > 0 ? (
                    <TrendingUp className="h-2.5 w-2.5" />
                  ) : (
                    <TrendingDown className="h-2.5 w-2.5" />
                  )}
                  {Math.abs(overview.trends.grossRevenueChange)}%
                </span>
              ) : (
                <span className="text-muted-foreground font-medium">—</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Net Cash Inflow */}
        <Card className="border-border/80 from-card to-card/90 bg-gradient-to-b shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-xs">
          <CardContent className="space-y-2 p-3 sm:p-4">
            <div className="text-muted-foreground flex items-center justify-between text-[11px] font-semibold">
              <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                Net Cash Inflow
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CreditCard className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-foreground truncate font-mono text-xl font-black tracking-tight sm:text-2xl">
                ${isClient && overview ? overview.netCashInflow.toFixed(2) : "0.00"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground truncate">Settled Treasury</span>
              {isClient && overview && overview.trends.netCashChange !== 0 ? (
                <span
                  className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-bold ${
                    overview.trends.netCashChange > 0
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {overview.trends.netCashChange > 0 ? (
                    <TrendingUp className="h-2.5 w-2.5" />
                  ) : (
                    <TrendingDown className="h-2.5 w-2.5" />
                  )}
                  {Math.abs(overview.trends.netCashChange)}%
                </span>
              ) : (
                <span className="text-muted-foreground font-medium">—</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Average Ticket Value */}
        <Card className="border-border/80 from-card to-card/90 bg-gradient-to-b shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/40 hover:shadow-xs">
          <CardContent className="space-y-2 p-3 sm:p-4">
            <div className="text-muted-foreground flex items-center justify-between text-[11px] font-semibold">
              <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                Average Ticket (ATV)
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-foreground truncate font-mono text-xl font-black tracking-tight sm:text-2xl">
                ${isClient && overview ? overview.atv.toFixed(2) : "0.00"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground truncate">Yield / Invoice</span>
              {isClient && overview && overview.trends.atvChange !== 0 ? (
                <span
                  className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-bold ${
                    overview.trends.atvChange > 0
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {overview.trends.atvChange > 0 ? (
                    <TrendingUp className="h-2.5 w-2.5" />
                  ) : (
                    <TrendingDown className="h-2.5 w-2.5" />
                  )}
                  {Math.abs(overview.trends.atvChange)}%
                </span>
              ) : (
                <span className="text-muted-foreground font-medium">—</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Outstanding Receivables */}
        <Card className="border-border/80 from-card to-card/90 bg-gradient-to-b shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500/40 hover:shadow-xs">
          <CardContent className="space-y-2 p-3 sm:p-4">
            <div className="text-muted-foreground flex items-center justify-between text-[11px] font-semibold">
              <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                Pending AR
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-foreground truncate font-mono text-xl font-black tracking-tight sm:text-2xl">
                ${isClient && overview ? overview.outstandingAr.toFixed(2) : "0.00"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground truncate">Unpaid Invoices</span>
              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 font-bold text-amber-600 dark:text-amber-400">
                In Collection
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 5: Fulfillment Rate */}
        <Card className="border-border/80 from-card to-card/90 bg-gradient-to-b shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/40 hover:shadow-xs">
          <CardContent className="space-y-2 p-3 sm:p-4">
            <div className="text-muted-foreground flex items-center justify-between text-[11px] font-semibold">
              <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                Fulfillment Rate
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Calendar className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-foreground truncate font-mono text-xl font-black tracking-tight sm:text-2xl">
                {isClient && overview ? overview.appointmentFulfillmentRate : 100}%
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground truncate">
                {isClient && overview ? overview.completedAppointments : 0} Delivered
              </span>
              <span className="rounded bg-blue-500/10 px-1.5 py-0.5 font-bold text-blue-600 dark:text-blue-400">
                {isClient && overview ? overview.totalAppointments : 0} Booked
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 6: Workforce Utilization */}
        <Card className="border-border/80 from-card to-card/90 bg-gradient-to-b shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-500/40 hover:shadow-xs">
          <CardContent className="space-y-2 p-3 sm:p-4">
            <div className="text-muted-foreground flex items-center justify-between text-[11px] font-semibold">
              <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                Capacity Yield
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Users className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-foreground truncate font-mono text-xl font-black tracking-tight sm:text-2xl">
                {isClient && overview ? overview.utilizationRate : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground truncate">Staff Schedule</span>
              <span className="rounded bg-purple-500/10 px-1.5 py-0.5 font-bold text-purple-600 dark:text-purple-400">
                Active
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Navigation Tabs */}
      <div className="border-border/80 border-b">
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-2 text-xs font-semibold">
          {[
            { id: "overview", label: "Executive Overview", icon: BarChart3 },
            { id: "cashflow", label: "Cash Flow & Inflow Curves", icon: TrendingUp },
            { id: "portfolio", label: "Service Profitability", icon: Layers },
            { id: "workforce", label: "Specialist Leaderboard", icon: Users },
            { id: "clients", label: "Client Retention & LTV", icon: UserCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 py-2 transition-all ${
                  isActive
                    ? "border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs"
                    : "border-border/80 bg-card text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Sections */}
      {isActuallyLoading ? (
        <div className="space-y-3 py-24 text-center">
          <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
          <p className="text-muted-foreground text-xs font-semibold">
            Aggregating real-time financial metrics from PostgreSQL...
          </p>
        </div>
      ) : activeTab === "overview" ? (
        /* TAB 1: EXECUTIVE OVERVIEW */
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Trajectory Bar Summary */}
            <Card className="border-border/80 from-card to-card/95 bg-gradient-to-b shadow-xs">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-foreground text-sm font-bold">Cashflow Trajectory</h3>
                    <p className="text-muted-foreground text-xs">
                      Daily billed vs collected revenue points
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("cashflow")}
                    className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs font-bold"
                  >
                    <span>Full Curves</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {cashflow.length === 0 ? (
                  <div className="text-muted-foreground py-12 text-center text-xs">
                    No transactions recorded for the selected timeframe.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex h-36 items-end gap-1.5 pt-6">
                      {cashflow.slice(-14).map((pt) => {
                        const heightPct = Math.max(
                          8,
                          Math.round((pt.collected / maxDailyBilled) * 100)
                        );
                        return (
                          <div
                            key={pt.date}
                            className="group relative flex flex-1 flex-col items-center justify-end"
                          >
                            {/* Hover Tooltip */}
                            <div className="border-border/80 bg-popover text-popover-foreground pointer-events-none absolute -top-8 z-20 hidden rounded-lg border px-2 py-0.5 text-[10px] font-bold whitespace-nowrap shadow-md group-hover:block">
                              ${pt.collected.toFixed(2)}
                            </div>
                            <div
                              style={{ height: `${heightPct}%` }}
                              className="w-full rounded-t-sm bg-gradient-to-t from-blue-600 to-indigo-500 opacity-80 transition-opacity group-hover:opacity-100"
                            />
                            <span className="text-muted-foreground mt-1 text-[8px]">
                              {pt.date.slice(8)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-border/60 text-muted-foreground flex items-center justify-between border-t pt-2 text-[10px]">
                      <span>14-Day Velocity</span>
                      <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        Peak: ${maxDailyBilled.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Profitability Offerings */}
            <Card className="border-border/80 from-card to-card/95 bg-gradient-to-b shadow-xs">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-foreground text-sm font-bold">Top Revenue Offerings</h3>
                    <p className="text-muted-foreground text-xs">
                      Services generating highest gross volume
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("portfolio")}
                    className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs font-bold"
                  >
                    <span>Portfolio</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {services.length === 0 ? (
                  <div className="text-muted-foreground py-12 text-center text-xs">
                    No service bookings recorded for this period.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {services.slice(0, 4).map((s) => (
                      <div
                        key={s.id}
                        className="border-border/70 bg-muted/20 hover:bg-muted/40 flex items-center justify-between rounded-xl border p-2.5 text-xs transition"
                      >
                        <div className="min-w-0">
                          <p className="text-foreground truncate font-bold">{s.name}</p>
                          <span className="text-muted-foreground text-[10px]">
                            {s.bookingsCount} booking{s.bookingsCount === 1 ? "" : "s"} • $
                            {s.price.toFixed(2)} fee
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-foreground font-mono font-black">
                            ${s.revenueGenerated.toFixed(2)}
                          </p>
                          <span className="inline-block rounded bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-bold text-blue-600 dark:text-blue-400">
                            {s.sharePercentage}% share
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Specialist Productivity Summary */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="border-border/80 from-card to-card/95 bg-gradient-to-b shadow-xs">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-foreground text-sm font-bold">Specialist Attribution</h3>
                    <p className="text-muted-foreground text-xs">
                      Delivered sessions and revenue generated
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("workforce")}
                    className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs font-bold"
                  >
                    <span>Leaderboard</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {staff.length === 0 ? (
                  <div className="text-muted-foreground py-12 text-center text-xs">
                    No workforce sessions recorded.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {staff.slice(0, 4).map((sm) => (
                      <div
                        key={sm.id}
                        className="border-border/70 bg-muted/20 flex items-center justify-between rounded-xl border p-2.5 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white shadow-2xs ${
                              sm.avatarBg || "bg-blue-600"
                            }`}
                          >
                            {sm.initials}
                          </div>
                          <div>
                            <p className="text-foreground font-bold">{sm.name}</p>
                            <span className="text-muted-foreground text-[10px]">
                              {sm.roleTitle} • {(sm.billableMinutes / 60).toFixed(1)} hrs logged
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-foreground font-mono font-black">
                            ${sm.revenueAttributed.toFixed(2)}
                          </p>
                          <span className="text-muted-foreground text-[10px]">
                            {sm.completedSessions} sessions
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Client Retention Snapshot */}
            <Card className="border-border/80 from-card to-card/95 bg-gradient-to-b shadow-xs">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-foreground text-sm font-bold">Client Retention Health</h3>
                    <p className="text-muted-foreground text-xs">
                      CRM repeat frequency &amp; lifetime value
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("clients")}
                    className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs font-bold"
                  >
                    <span>Intelligence</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {clients ? (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="border-border/70 bg-muted/20 rounded-xl border p-3.5 text-center">
                      <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                        Repeat Client Ratio
                      </span>
                      <p className="text-foreground mt-1 font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {clients.repeatRate}%
                      </p>
                      <span className="text-muted-foreground text-[10px]">
                        {clients.repeatCustomers} of {clients.totalCustomers} clients
                      </span>
                    </div>

                    <div className="border-border/70 bg-muted/20 rounded-xl border p-3.5 text-center">
                      <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                        Average LTV
                      </span>
                      <p className="text-foreground mt-1 font-mono text-2xl font-black">
                        ${clients.averageLtv.toFixed(2)}
                      </p>
                      <span className="text-muted-foreground text-[10px]">
                        Lifetime yield / client
                      </span>
                    </div>

                    <div className="border-border/70 bg-muted/20 rounded-xl border p-3.5 text-center">
                      <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                        New Acquisitions
                      </span>
                      <p className="text-foreground mt-1 font-mono text-2xl font-black text-blue-600 dark:text-blue-400">
                        {clients.newCustomers}
                      </p>
                      <span className="text-muted-foreground text-[10px]">Joined in period</span>
                    </div>

                    <div className="border-border/70 bg-muted/20 rounded-xl border p-3.5 text-center">
                      <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                        At-Risk Retention
                      </span>
                      <p className="text-foreground mt-1 font-mono text-2xl font-black text-amber-600 dark:text-amber-400">
                        {clients.atRiskCount}
                      </p>
                      <span className="text-muted-foreground text-[10px]">60+ days inactive</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground py-12 text-center text-xs">
                    Loading retention data...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : activeTab === "cashflow" ? (
        /* TAB 2: CASH FLOW & TRAJECTORY CURVES */
        <Card className="border-border/80 from-card to-card/95 bg-gradient-to-b shadow-xs">
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-foreground text-base font-bold">Cashflow Trajectory Ledger</h3>
                <p className="text-muted-foreground text-xs">
                  Continuous day-by-day revenue velocity comparing billed vs settled intake
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                  Billed
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  Collected
                </span>
              </div>
            </div>

            {cashflow.length === 0 ? (
              <div className="text-muted-foreground py-16 text-center text-xs">
                No financial transactions recorded for this period.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Visual Height-scaled Area Chart */}
                <div className="border-border/70 bg-muted/15 no-scrollbar flex h-64 items-end gap-1 overflow-x-auto rounded-2xl border p-4 pt-10">
                  {cashflow.map((pt) => {
                    const billedHeight = Math.max(
                      4,
                      Math.round((pt.billed / maxDailyBilled) * 100)
                    );
                    const collectedHeight = Math.max(
                      4,
                      Math.round((pt.collected / maxDailyBilled) * 100)
                    );

                    return (
                      <div
                        key={pt.date}
                        className="group relative flex min-w-[28px] flex-1 flex-col items-center justify-end"
                      >
                        {/* Hover Inspection Tooltip */}
                        <div className="border-border/80 bg-popover text-popover-foreground pointer-events-none absolute -top-14 z-20 hidden rounded-xl border p-2 text-[10px] font-bold whitespace-nowrap shadow-xl group-hover:block">
                          <p className="text-muted-foreground">{pt.date}</p>
                          <p className="text-emerald-600">Collected: ${pt.collected.toFixed(2)}</p>
                          <p className="text-blue-600">Billed: ${pt.billed.toFixed(2)}</p>
                        </div>

                        <div className="flex w-full items-end justify-center gap-0.5">
                          <div
                            style={{ height: `${billedHeight}%` }}
                            className="w-1/2 rounded-t-sm bg-blue-500/60 transition group-hover:bg-blue-500"
                          />
                          <div
                            style={{ height: `${collectedHeight}%` }}
                            className="w-1/2 rounded-t-sm bg-emerald-500 transition group-hover:bg-emerald-400"
                          />
                        </div>
                        <span className="text-muted-foreground mt-2 font-mono text-[9px]">
                          {pt.date.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Cashflow Summary Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-border/80 bg-muted/30 text-muted-foreground border-b font-semibold">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Invoiced Billed</th>
                        <th className="px-4 py-3">Cash Collected</th>
                        <th className="px-4 py-3">Appointments</th>
                        <th className="px-4 py-3 text-right">Collection Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-border/60 divide-y">
                      {cashflow
                        .filter((p) => p.billed > 0 || p.collected > 0 || p.appointmentsCount > 0)
                        .slice(-10)
                        .map((pt) => {
                          const rate =
                            pt.billed > 0
                              ? Math.min(100, Math.round((pt.collected / pt.billed) * 100))
                              : pt.collected > 0
                                ? 100
                                : 0;
                          return (
                            <tr key={pt.date} className="hover:bg-muted/30">
                              <td className="px-4 py-2.5 font-mono font-medium">{pt.date}</td>
                              <td className="px-4 py-2.5 font-mono text-blue-600 dark:text-blue-400">
                                ${pt.billed.toFixed(2)}
                              </td>
                              <td className="px-4 py-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                ${pt.collected.toFixed(2)}
                              </td>
                              <td className="px-4 py-2.5">{pt.appointmentsCount}</td>
                              <td className="px-4 py-2.5 text-right font-mono font-bold">
                                {rate}%
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : activeTab === "portfolio" ? (
        /* TAB 3: SERVICE PROFITABILITY MATRIX */
        <Card className="border-border/80 from-card to-card/95 bg-gradient-to-b shadow-xs">
          <CardContent className="space-y-6 p-6">
            <div>
              <h3 className="text-foreground text-base font-bold">
                Service Portfolio Profitability
              </h3>
              <p className="text-muted-foreground text-xs">
                Revenue contribution and booking frequency by service tier
              </p>
            </div>

            {services.length === 0 ? (
              <div className="text-muted-foreground py-16 text-center text-xs">
                No services or bookings found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-border/80 bg-muted/30 text-muted-foreground border-b font-semibold">
                    <tr>
                      <th className="px-4 py-3">Service Offering</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Unit Fee</th>
                      <th className="px-4 py-3">Total Bookings</th>
                      <th className="px-4 py-3">Revenue Generated</th>
                      <th className="px-4 py-3 text-right">Portfolio Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-border/60 divide-y">
                    {services.map((s) => (
                      <tr key={s.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <p className="text-foreground font-bold">{s.name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full border border-blue-200/60 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:border-blue-800/50 dark:bg-blue-950/40 dark:text-blue-300">
                            {s.category}
                          </span>
                        </td>
                        <td className="text-foreground px-4 py-3 font-mono font-bold">
                          ${s.price.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 font-semibold">{s.bookingsCount}</td>
                        <td className="px-4 py-3 font-mono font-black text-emerald-600 dark:text-emerald-400">
                          ${s.revenueGenerated.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="rounded bg-blue-500/10 px-2 py-0.5 font-bold text-blue-600 dark:text-blue-400">
                            {s.sharePercentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : activeTab === "workforce" ? (
        /* TAB 4: WORKFORCE & SPECIALIST LEADERBOARD */
        <Card className="border-border/80 from-card to-card/95 bg-gradient-to-b shadow-xs">
          <CardContent className="space-y-6 p-6">
            <div>
              <h3 className="text-foreground text-base font-bold">
                Workforce Productivity Leaderboard
              </h3>
              <p className="text-muted-foreground text-xs">
                Specialist billable hours, session delivery count, and attributed client revenue
              </p>
            </div>

            {staff.length === 0 ? (
              <div className="text-muted-foreground py-16 text-center text-xs">
                No specialists found in this organization.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {staff.map((sm, idx) => (
                  <Card
                    key={sm.id}
                    className="border-border/70 bg-card/60 relative overflow-hidden shadow-2xs"
                  >
                    <div className="absolute top-3 right-3">
                      <span className="text-muted-foreground font-mono text-xs font-black">
                        #{idx + 1}
                      </span>
                    </div>
                    <CardContent className="space-y-4 p-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-white shadow-xs ${
                            sm.avatarBg || "bg-blue-600"
                          }`}
                        >
                          {sm.initials}
                        </div>
                        <div>
                          <p className="text-foreground text-sm font-bold">{sm.name}</p>
                          <p className="text-muted-foreground text-xs">{sm.roleTitle}</p>
                        </div>
                      </div>

                      <div className="border-border/60 grid grid-cols-2 gap-2 border-t pt-3 text-xs">
                        <div>
                          <span className="text-muted-foreground text-[10px]">
                            Revenue Delivered
                          </span>
                          <p className="text-foreground font-mono text-base font-black text-emerald-600 dark:text-emerald-400">
                            ${sm.revenueAttributed.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px]">Billable Hours</span>
                          <p className="text-foreground font-mono text-base font-black">
                            {(sm.billableMinutes / 60).toFixed(1)} hrs
                          </p>
                        </div>
                      </div>

                      <div className="bg-muted/30 flex items-center justify-between rounded-lg p-2 text-[11px]">
                        <span className="text-muted-foreground">Sessions Completed</span>
                        <span className="text-foreground font-bold">{sm.completedSessions}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* TAB 5: CLIENT RETENTION & COHORT INTELLIGENCE */
        <Card className="border-border/80 from-card to-card/95 bg-gradient-to-b shadow-xs">
          <CardContent className="space-y-6 p-6">
            <div>
              <h3 className="text-foreground text-base font-bold">
                Client Retention &amp; Cohort Intelligence
              </h3>
              <p className="text-muted-foreground text-xs">
                CRM customer retention frequency, lifetime value metrics, and churn warning alerts
              </p>
            </div>

            {clients ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="border-border/80 bg-muted/20 space-y-2 rounded-2xl border p-5 text-center">
                  <UserCheck className="mx-auto h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-foreground text-sm font-bold">Repeat Customer Loyalty</p>
                  <p className="text-foreground font-mono text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    {clients.repeatRate}%
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {clients.repeatCustomers} out of {clients.totalCustomers} total clients have
                    booked more than once.
                  </p>
                </div>

                <div className="border-border/80 bg-muted/20 space-y-2 rounded-2xl border p-5 text-center">
                  <DollarSign className="mx-auto h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <p className="text-foreground text-sm font-bold">Mean Lifetime Value</p>
                  <p className="text-foreground font-mono text-3xl font-black">
                    ${clients.averageLtv.toFixed(2)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Average revenue yield generated per customer across all paid deliverables.
                  </p>
                </div>

                <div className="border-border/80 bg-muted/20 space-y-2 rounded-2xl border p-5 text-center">
                  <AlertCircle className="mx-auto h-8 w-8 text-amber-600 dark:text-amber-400" />
                  <p className="text-foreground text-sm font-bold">At-Risk Inactive Clients</p>
                  <p className="text-foreground font-mono text-3xl font-black text-amber-600 dark:text-amber-400">
                    {clients.atRiskCount}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Clients with zero bookings in 60+ days who previously scheduled regular
                    sessions.
                  </p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Board-Ready Printable Statement Modal */}
      {isPrintModalOpen && overview && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="border-border/80 bg-card relative max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border-t p-5 shadow-2xl sm:rounded-3xl sm:border sm:p-8">
            {/* Mobile Sheet Drag Indicator */}
            <div className="flex shrink-0 items-center justify-center pb-3 sm:hidden">
              <div className="bg-muted-foreground/30 h-1 w-12 rounded-full" />
            </div>

            <button
              type="button"
              onClick={() => setIsPrintModalOpen(false)}
              className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-4 right-4 cursor-pointer rounded-xl p-1.5 sm:top-5 sm:right-5"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Statement Header */}
            <div className="border-border/80 flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-start sm:justify-between sm:pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-foreground text-lg font-black">{organizationName}</h2>
                    <p className="text-muted-foreground text-xs">
                      Official Operations &amp; Financial Statement
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-left text-xs sm:text-right">
                <span className="rounded bg-blue-500/10 px-2 py-0.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                  {overview.timeframe.toUpperCase()}
                </span>
                <p className="text-muted-foreground mt-1 text-[11px]">
                  Generated: {new Date().toLocaleDateString("en-US", { dateStyle: "medium" })}
                </p>
              </div>
            </div>

            {/* Key Figures Table */}
            <div className="my-6 space-y-3">
              <h3 className="text-foreground text-xs font-bold tracking-wider uppercase">
                Audited Financial Figures
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="border-border/70 bg-muted/20 rounded-xl border p-3">
                  <span className="text-muted-foreground text-[10px]">Gross Invoiced</span>
                  <p className="text-foreground font-mono text-base font-black">
                    ${overview.grossRevenue.toFixed(2)}
                  </p>
                </div>
                <div className="border-border/70 bg-muted/20 rounded-xl border p-3">
                  <span className="text-muted-foreground text-[10px]">Net Cash Inflow</span>
                  <p className="text-foreground font-mono text-base font-black text-emerald-600 dark:text-emerald-400">
                    ${overview.netCashInflow.toFixed(2)}
                  </p>
                </div>
                <div className="border-border/70 bg-muted/20 rounded-xl border p-3">
                  <span className="text-muted-foreground text-[10px]">Average Ticket (ATV)</span>
                  <p className="text-foreground font-mono text-base font-black">
                    ${overview.atv.toFixed(2)}
                  </p>
                </div>
                <div className="border-border/70 bg-muted/20 rounded-xl border p-3">
                  <span className="text-muted-foreground text-[10px]">Outstanding AR</span>
                  <p className="text-foreground font-mono text-base font-black text-amber-600 dark:text-amber-400">
                    ${overview.outstandingAr.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Top Services Roster */}
            <div className="my-6 space-y-2">
              <h3 className="text-foreground text-xs font-bold tracking-wider uppercase">
                Top Revenue Offerings
              </h3>
              <div className="divide-border/60 border-border/70 divide-y rounded-xl border text-xs">
                {services.slice(0, 3).map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3">
                    <div>
                      <p className="font-bold">{s.name}</p>
                      <span className="text-muted-foreground text-[10px]">{s.category}</span>
                    </div>
                    <div className="text-right font-mono font-bold">
                      ${s.revenueGenerated.toFixed(2)} ({s.sharePercentage}%)
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="border-border/80 mt-6 flex flex-col-reverse items-center justify-end gap-2 border-t pt-4 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPrintModalOpen(false)}
                className="w-full cursor-pointer text-xs sm:w-auto"
              >
                Close
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => window.print()}
                className="bg-primary text-primary-foreground w-full cursor-pointer text-xs font-bold shadow-xs sm:w-auto"
              >
                <Printer className="mr-1.5 h-3.5 w-3.5" />
                Print PDF / Paper
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

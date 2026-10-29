"use client";

import * as React from "react";
import {
  Users,
  UserPlus,
  Search,
  LayoutGrid,
  Table as TableIcon,
  Clock,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Edit,
  ArrowRight,
  Calendar,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useStaff, useStaffMetrics, useUpdateStaffStatus } from "@/features/staff/use-staff";
import { useServices } from "@/features/appointments/use-appointments";
import { useWorkspaceSession } from "@/features/organizations/use-workspace-session";
import { StaffQuickPeekDrawer } from "@/components/dashboard/staff/staff-quick-peek-drawer";
import { AddStaffModal } from "@/components/dashboard/staff/add-staff-modal";
import { EditStaffModal } from "@/components/dashboard/staff/edit-staff-modal";
import { BookingWizardModal } from "@/components/dashboard/appointments/booking-wizard-modal";
import { TeamManagementView } from "@/components/dashboard/team/team-management-view";
import { useTeamMembers } from "@/features/team/use-team";
import type { StaffItem, StaffStatus, StaffTier } from "@/features/staff/types";

const statusMetaConfig: Record<
  StaffStatus,
  { label: string; bg: string; text: string; border: string; dot: string; glow: string }
> = {
  AVAILABLE: {
    label: "Available",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/25",
    dot: "bg-emerald-500",
    glow: "shadow-emerald-500/20",
  },
  IN_SESSION: {
    label: "In Session",
    bg: "bg-indigo-500/10 dark:bg-indigo-500/15",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-500/25",
    dot: "bg-indigo-500 animate-pulse",
    glow: "shadow-indigo-500/20",
  },
  ON_BREAK: {
    label: "On Break",
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/25",
    dot: "bg-amber-500",
    glow: "shadow-amber-500/20",
  },
  OFFLINE: {
    label: "Offline",
    bg: "bg-slate-500/10 dark:bg-slate-500/15",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-500/25",
    dot: "bg-slate-400",
    glow: "shadow-slate-500/20",
  },
};

const tierBadgeConfig: Record<
  StaffTier,
  { label: string; bg: string; text: string; border: string }
> = {
  FULL_TIME: {
    label: "Full Time",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200/60 dark:border-blue-800/50",
  },
  PART_TIME: {
    label: "Part Time",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200/60 dark:border-purple-800/50",
  },
  CONTRACTOR: {
    label: "Contractor",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200/60 dark:border-amber-800/50",
  },
};

const emptySubscribe = () => () => {};
function useIsClient() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function StaffOperationsPage() {
  const isClient = useIsClient();
  const { organizationId, isLoading: isSessionLoading } = useWorkspaceSession();

  // Navigation tab state
  const [activeHubTab, setActiveHubTab] = React.useState<"specialists" | "team">("specialists");

  // Filters & View mode state
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StaffStatus | "ALL">("ALL");
  const [serviceFilter, setServiceFilter] = React.useState<string>("ALL");
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid");

  // Drawer & Modal state
  const [selectedStaffForDrawer, setSelectedStaffForDrawer] = React.useState<StaffItem | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingStaff, setEditingStaff] = React.useState<StaffItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [bookingStaffId, setBookingStaffId] = React.useState<string | null>(null);
  const updateStatusMutation = useUpdateStaffStatus();

  // Data queries
  const {
    data: staffList = [],
    isLoading: isLoadingStaff,
    isPending: isPendingStaff,
    refetch: refetchStaff,
  } = useStaff(
    {
      search: search.trim() || undefined,
      status: statusFilter !== "ALL" ? statusFilter : undefined,
      serviceId: serviceFilter !== "ALL" ? serviceFilter : undefined,
    },
    organizationId
  );

  const isActuallyLoading =
    !isClient || isSessionLoading || isLoadingStaff || (isPendingStaff && !staffList.length);

  const { data: metrics, refetch: refetchMetrics } = useStaffMetrics(organizationId);
  const { data: services = [] } = useServices(true, organizationId);
  const { data: teamMembers = [] } = useTeamMembers(organizationId);

  const handleRefresh = () => {
    refetchStaff();
    refetchMetrics();
  };

  const handleOpenDrawer = (staff: StaffItem) => {
    setSelectedStaffForDrawer(staff);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (staff: StaffItem) => {
    setEditingStaff(staff);
    setIsEditModalOpen(true);
  };

  const handleQuickStatusChange = async (id: string, newStatus: StaffStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const totalStaff = metrics?.totalStaff ?? staffList.length;
  const availableStaff = metrics?.availableStaff ?? 0;
  const inSessionStaff = metrics?.inSessionStaff ?? 0;
  const onBreakStaff = metrics?.onBreakStaff ?? 0;
  const offlineStaff = metrics?.offlineStaff ?? 0;
  const totalBilled = metrics?.totalRevenueBilled ?? 0;
  const utilizationRate = metrics?.utilizationRate ?? 100;

  return (
    <div className="max-w-7xl space-y-7 pb-16">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <PageHeader
            title="Team & Staff Operations Hub"
            description="Manage workforce capacity, certified service deliverables, live shift schedules, and attributed revenue."
          />
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          {activeHubTab === "specialists" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="border-border/80 bg-background/80 hover:bg-muted/60 flex-1 cursor-pointer gap-1.5 rounded-xl text-xs font-semibold shadow-2xs backdrop-blur-xs transition sm:flex-none"
              >
                <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                <span className="hidden sm:inline">Sync Workforce</span>
                <span className="sm:hidden">Sync</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                className="flex-1 cursor-pointer gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-700 hover:to-indigo-700 sm:flex-none sm:px-4"
              >
                <UserPlus className="h-4 w-4" />
                <span>Onboard Specialist</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Primary Hub Navigation Tabs */}
      <div className="border-border/80 flex flex-col justify-between gap-3 border-b pb-3 sm:flex-row sm:items-center">
        <div className="bg-muted/40 border-border/70 grid w-full grid-cols-2 items-center gap-1.5 rounded-2xl border p-1 shadow-2xs backdrop-blur-md sm:inline-flex sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveHubTab("specialists")}
            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-bold transition-all sm:justify-start sm:gap-2.5 sm:px-4 ${
              activeHubTab === "specialists"
                ? "bg-background text-foreground border-border/60 border shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40"
            }`}
          >
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition ${
                activeHubTab === "specialists"
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
            </div>
            <span className="truncate text-[11px] sm:text-xs">Workforce</span>
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                activeHubTab === "specialists"
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {totalStaff}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveHubTab("team")}
            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-bold transition-all sm:justify-start sm:gap-2.5 sm:px-4 ${
              activeHubTab === "team"
                ? "bg-background text-foreground border-border/60 border shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40"
            }`}
          >
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition ${
                activeHubTab === "team"
                  ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
            <span className="truncate text-[11px] sm:text-xs">Team Access</span>
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                activeHubTab === "team"
                  ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {teamMembers.length}
            </span>
          </button>
        </div>

        <div className="text-muted-foreground hidden items-center gap-2 text-xs sm:flex">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-[11px] font-medium">
            {activeHubTab === "specialists"
              ? "Live Shift & Delivery Operations"
              : "Enterprise Role-Based Access Control"}
          </span>
        </div>
      </div>

      {activeHubTab === "team" ? (
        <TeamManagementView />
      ) : (
        <>
          {/* Capacity & Financial Pulse KPI Bar (2x2 Grid on Mobile, 4-Cols on Desktop) */}
          <div className="grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-4">
            {/* Metric 1: Active Workforce */}
            <Card className="border-border/70 from-card to-card/90 bg-gradient-to-b shadow-2xs transition-all duration-200 hover:border-emerald-500/30 hover:shadow-xs">
              <CardContent className="space-y-2.5 p-4 sm:p-5">
                <div className="text-muted-foreground flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-[10px] tracking-tight uppercase">Workforce Roster</span>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-foreground font-mono text-2xl font-black tracking-tight sm:text-3xl">
                    {availableStaff}
                  </span>
                  <span className="text-muted-foreground font-mono text-xs font-medium">
                    / {totalStaff} total
                  </span>
                </div>
                {/* Visual capacity distribution mini track */}
                <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    style={{ width: `${(availableStaff / Math.max(1, totalStaff)) * 100}%` }}
                    className="bg-emerald-500 transition-all duration-500"
                    title="Available"
                  />
                  <div
                    style={{ width: `${(inSessionStaff / Math.max(1, totalStaff)) * 100}%` }}
                    className="bg-indigo-500 transition-all duration-500"
                    title="In Session"
                  />
                  <div
                    style={{ width: `${(onBreakStaff / Math.max(1, totalStaff)) * 100}%` }}
                    className="bg-amber-500 transition-all duration-500"
                    title="On Break"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground truncate text-[10px]">
                    <strong className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {availableStaff}
                    </strong>{" "}
                    ready for client dispatch
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                    Active
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Metric 2: In Session Capacity */}
            <Card className="border-border/70 from-card to-card/90 bg-gradient-to-b shadow-2xs transition-all duration-200 hover:border-indigo-500/30 hover:shadow-xs">
              <CardContent className="space-y-2.5 p-4 sm:p-5">
                <div className="text-muted-foreground flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-[10px] tracking-tight uppercase">In-Flight Sessions</span>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-foreground font-mono text-2xl font-black tracking-tight sm:text-3xl">
                    {inSessionStaff}
                  </span>
                  {inSessionStaff > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
                      </span>
                      Live
                    </span>
                  )}
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    style={{ width: `${(inSessionStaff / Math.max(1, totalStaff)) * 100}%` }}
                    className="h-full bg-indigo-500 transition-all duration-500"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground truncate text-[10px]">
                    {onBreakStaff} on break • {offlineStaff} offline
                  </span>
                  <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2 py-0.5 text-[9px] font-bold text-indigo-600 dark:text-indigo-400">
                    Active Slot
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Metric 3: Attributed Revenue */}
            <Card className="border-border/70 from-card to-card/90 bg-gradient-to-b shadow-2xs transition-all duration-200 hover:border-blue-500/30 hover:shadow-xs">
              <CardContent className="space-y-2.5 p-4 sm:p-5">
                <div className="text-muted-foreground flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-[10px] tracking-tight uppercase">Billed Services</span>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-foreground font-mono text-2xl font-black tracking-tight sm:text-3xl">
                    ${totalBilled.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground truncate text-[10px]">
                    Delivered operations volume
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[9px] font-bold text-blue-600 dark:text-blue-400">
                    <Sparkles className="h-2.5 w-2.5" /> Synced
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Metric 4: Workforce Utilization */}
            <Card className="border-border/70 from-card to-card/90 bg-gradient-to-b shadow-2xs transition-all duration-200 hover:border-emerald-500/30 hover:shadow-xs">
              <CardContent className="space-y-2.5 p-4 sm:p-5">
                <div className="text-muted-foreground flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-[10px] tracking-tight uppercase">Utilization Yield</span>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-foreground font-mono text-2xl font-black tracking-tight sm:text-3xl">
                    {utilizationRate}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    style={{ width: `${utilizationRate}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground truncate text-[10px]">
                    Capacity efficiency
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-2.5 w-2.5" /> High
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Control Bar: Segmented Tabs, Search & View Switcher */}
          <div className="space-y-4">
            {/* Status Segmented Control */}
            <div className="flex scrollbar-none items-center overflow-x-auto pb-1">
              <div className="border-border/70 bg-muted/40 inline-flex items-center gap-1 rounded-2xl border p-1 backdrop-blur-xs">
                {[
                  { id: "ALL", label: "All Specialists", count: totalStaff },
                  { id: "AVAILABLE", label: "Available", count: availableStaff },
                  { id: "IN_SESSION", label: "In Session", count: inSessionStaff },
                  { id: "ON_BREAK", label: "On Break", count: onBreakStaff },
                  { id: "OFFLINE", label: "Offline", count: offlineStaff },
                ].map((tab) => {
                  const active = statusFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setStatusFilter(tab.id as StaffStatus | "ALL")}
                      className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                        active
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`py-0.2 rounded-full px-1.5 font-mono text-[10px] font-bold ${
                          active
                            ? "bg-primary/10 text-primary"
                            : "bg-muted/80 text-muted-foreground"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Controls Row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
                {/* Search Input */}
                <div className="relative max-w-md flex-1">
                  <Search className="text-muted-foreground absolute top-2.5 left-3.5 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search specialist by name, role or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border-border/80 bg-background/90 h-9.5 rounded-xl pl-10 text-xs shadow-2xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>

                {/* Service Qualification Dropdown Filter */}
                <div className="relative w-full sm:w-auto">
                  <select
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                    className="border-border/80 bg-background/90 text-foreground h-9.5 w-full cursor-pointer appearance-none rounded-xl border pr-9 pl-3 text-xs font-semibold shadow-2xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-none sm:w-auto"
                  >
                    <option value="ALL">All Service Qualifications</option>
                    {services.map((svc) => (
                      <option key={svc.id} value={svc.id}>
                        {svc.name} (${svc.price})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="text-muted-foreground pointer-events-none absolute top-3 right-3 h-3.5 w-3.5 opacity-60" />
                </div>
              </div>

              {/* Grid vs Table View Mode Switcher */}
              <div className="border-border/80 bg-muted/30 inline-flex items-center self-end rounded-xl border p-1 shadow-2xs sm:self-auto">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    viewMode === "grid"
                      ? "bg-background text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Grid Card View"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    viewMode === "table"
                      ? "bg-background text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Table Roster View"
                >
                  <TableIcon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Roster</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          {isActuallyLoading ? (
            <div className="flex h-72 items-center justify-center">
              <RefreshCw className="h-7 w-7 animate-spin text-blue-600" />
            </div>
          ) : staffList.length === 0 ? (
            <Card className="border-border/80 bg-surface/90 overflow-hidden shadow-2xs">
              <CardContent className="space-y-4 py-20 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 shadow-sm">
                  <Users className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-foreground text-base font-bold">No Specialists Found</p>
                  <p className="text-muted-foreground mx-auto mt-1 max-w-md text-xs leading-relaxed">
                    {search || statusFilter !== "ALL" || serviceFilter !== "ALL"
                      ? "No team members matched your current filter criteria. Try resetting your search or filter tags."
                      : "Start building your operations workforce by onboarding your first specialist to manage shift capacity and client bookings."}
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    size="sm"
                    onClick={() => setIsAddModalOpen(true)}
                    className="cursor-pointer gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Onboard First Specialist</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            /* World-Class Grid Card View */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {staffList.map((member) => {
                const meta = statusMetaConfig[member.status] || statusMetaConfig.AVAILABLE;
                const tierMeta = tierBadgeConfig[member.tier] || tierBadgeConfig.FULL_TIME;

                return (
                  <Card
                    key={member.id}
                    onClick={() => handleOpenDrawer(member)}
                    className="group border-border/70 from-card to-card/95 hover:border-border relative cursor-pointer overflow-hidden rounded-2xl border bg-gradient-to-b p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {/* Top: Avatar, Names, Role & Interactive Status Pill */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        {/* Avatar with Live Indicator Dot */}
                        <div className="relative shrink-0">
                          <div
                            className={`ring-background flex h-12 w-12 items-center justify-center rounded-2xl font-bold text-white shadow-sm ring-2 ${member.avatarBg}`}
                          >
                            {member.initials}
                          </div>
                          <span
                            className={`border-background absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full border-2 ${meta.dot}`}
                            title={meta.label}
                          />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-foreground truncate text-sm font-bold tracking-tight transition group-hover:text-blue-600">
                            {member.name}
                          </h3>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <span className="text-muted-foreground truncate text-xs font-medium">
                              {member.roleTitle}
                            </span>
                            <span
                              className={`py-0.2 inline-flex shrink-0 rounded-md border px-1.5 text-[9px] font-bold uppercase ${tierMeta.bg} ${tierMeta.text} ${tierMeta.border}`}
                            >
                              {tierMeta.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Status Dropdown Pill */}
                      <div onClick={(e) => e.stopPropagation()} className="relative shrink-0">
                        <select
                          value={member.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleQuickStatusChange(member.id, e.target.value as StaffStatus);
                          }}
                          className={`cursor-pointer appearance-none rounded-full border py-1 pr-6 pl-2.5 text-[10px] font-bold tracking-tight shadow-2xs transition focus:outline-none ${meta.bg} ${meta.text} ${meta.border}`}
                          title="Quick change operational status"
                        >
                          <option value="AVAILABLE" className="bg-background text-foreground">
                            ● Available
                          </option>
                          <option value="IN_SESSION" className="bg-background text-foreground">
                            ● In Session
                          </option>
                          <option value="ON_BREAK" className="bg-background text-foreground">
                            ● On Break
                          </option>
                          <option value="OFFLINE" className="bg-background text-foreground">
                            ● Offline
                          </option>
                        </select>
                        <ChevronDown
                          className={`pointer-events-none absolute top-2 right-1.5 h-3 w-3 opacity-60 ${meta.text}`}
                        />
                      </div>
                    </div>

                    {/* Schedule & Shift Strip */}
                    <div className="border-border/60 bg-muted/20 mt-4 space-y-2 rounded-xl border p-2.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                          <Clock className="h-3 w-3 text-blue-500" />
                          <span>
                            {member.shiftStart} – {member.shiftEnd}
                          </span>
                        </span>
                        <span className="text-foreground font-mono font-bold">
                          {member.hourlyRate ? `$${member.hourlyRate}/hr` : "Standard Base"}
                        </span>
                      </div>

                      {/* 7-Day Micro Strip */}
                      <div className="flex items-center justify-between gap-1 pt-0.5">
                        {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => {
                          const isWorking = member.workingDays.includes(day);
                          return (
                            <span
                              key={day}
                              className={`flex-1 rounded py-0.5 text-center font-mono text-[9px] font-bold ${
                                isWorking
                                  ? "border border-blue-500/20 bg-blue-600/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400"
                                  : "text-slate-300 opacity-60 dark:text-slate-700"
                              }`}
                            >
                              {day[0]}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Certified Deliverable Tags */}
                    <div className="mt-3.5 space-y-1.5">
                      <span className="text-muted-foreground block text-[10px] font-bold tracking-wider uppercase">
                        Certified Qualifications ({member.services.length})
                      </span>
                      <div className="flex min-h-[26px] flex-wrap gap-1">
                        {member.services.length === 0 ? (
                          <span className="text-muted-foreground text-[11px] italic">
                            General Consultation Deliverables
                          </span>
                        ) : (
                          <>
                            {member.services.slice(0, 2).map((svc) => (
                              <span
                                key={svc.id}
                                className="border-border/80 bg-background/80 text-foreground max-w-[130px] truncate rounded-lg border px-2 py-0.5 text-[10px] font-semibold shadow-2xs"
                              >
                                {svc.name}
                              </span>
                            ))}
                            {member.services.length > 2 && (
                              <span className="bg-muted text-muted-foreground rounded-lg px-1.5 py-0.5 font-mono text-[10px] font-bold">
                                +{member.services.length - 2}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Bottom Card Footer: Scorecard & Actions */}
                    <div className="border-border/60 mt-4 flex items-center justify-between border-t pt-3 text-[11px]">
                      <div className="text-muted-foreground">
                        <strong className="text-foreground font-mono font-black">
                          {member.appointmentCount}
                        </strong>{" "}
                        sessions{" "}
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          (${member.revenueGenerated})
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          title="Schedule session with this specialist"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBookingStaffId(member.id);
                          }}
                          className="border-border/80 text-foreground h-7 cursor-pointer gap-1 rounded-lg px-2 text-[11px] font-semibold hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40"
                        >
                          <Calendar className="h-3 w-3 text-blue-500" />
                          <span>Book</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(member);
                          }}
                          className="text-muted-foreground hover:text-foreground h-7 w-7 cursor-pointer rounded-lg p-0"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDrawer(member)}
                          className="text-muted-foreground h-7 w-7 cursor-pointer rounded-lg p-0 hover:text-blue-600"
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* World-Class Table Roster View */
            <Card className="border-border/80 bg-card overflow-hidden rounded-2xl border shadow-2xs">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-border/70 bg-muted/30 text-muted-foreground border-b text-[10px] font-bold tracking-wider uppercase">
                        <th className="py-3.5 pl-6">Specialist</th>
                        <th className="py-3.5">Role & Tier</th>
                        <th className="py-3.5">Operational Status</th>
                        <th className="py-3.5">Shift & Working Days</th>
                        <th className="py-3.5">Qualifications</th>
                        <th className="py-3.5">Delivered Yield</th>
                        <th className="py-3.5 pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-border/50 divide-y">
                      {staffList.map((member) => {
                        const meta = statusMetaConfig[member.status] || statusMetaConfig.AVAILABLE;
                        const tierMeta = tierBadgeConfig[member.tier] || tierBadgeConfig.FULL_TIME;

                        return (
                          <tr
                            key={member.id}
                            onClick={() => handleOpenDrawer(member)}
                            className="group hover:bg-muted/30 cursor-pointer transition"
                          >
                            {/* Specialist Info */}
                            <td className="py-3.5 pl-6">
                              <div className="flex items-center gap-3">
                                <div className="relative shrink-0">
                                  <div
                                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold text-white shadow-2xs ${member.avatarBg}`}
                                  >
                                    {member.initials}
                                  </div>
                                  <span
                                    className={`border-background absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 ${meta.dot}`}
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-foreground truncate font-bold transition group-hover:text-blue-600">
                                    {member.name}
                                  </p>
                                  <p className="text-muted-foreground truncate font-mono text-[11px]">
                                    {member.email || "No direct email linked"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Role & Contract Tier */}
                            <td className="py-3.5">
                              <p className="text-foreground font-semibold">{member.roleTitle}</p>
                              <span
                                className={`py-0.2 mt-0.5 inline-flex rounded border px-1.5 text-[9px] font-bold uppercase ${tierMeta.bg} ${tierMeta.text} ${tierMeta.border}`}
                              >
                                {tierMeta.label}
                              </span>
                            </td>

                            {/* Operational Status Dropdown */}
                            <td className="py-3.5">
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="relative inline-flex items-center"
                              >
                                <select
                                  value={member.status}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleQuickStatusChange(
                                      member.id,
                                      e.target.value as StaffStatus
                                    );
                                  }}
                                  className={`cursor-pointer appearance-none rounded-full border py-1 pr-6 pl-2.5 text-[10px] font-bold tracking-tight shadow-2xs transition focus:outline-none ${meta.bg} ${meta.text} ${meta.border}`}
                                  title="Quick change operational status"
                                >
                                  <option
                                    value="AVAILABLE"
                                    className="bg-background text-foreground"
                                  >
                                    ● Available
                                  </option>
                                  <option
                                    value="IN_SESSION"
                                    className="bg-background text-foreground"
                                  >
                                    ● In Session
                                  </option>
                                  <option
                                    value="ON_BREAK"
                                    className="bg-background text-foreground"
                                  >
                                    ● On Break
                                  </option>
                                  <option value="OFFLINE" className="bg-background text-foreground">
                                    ● Offline
                                  </option>
                                </select>
                                <ChevronDown
                                  className={`pointer-events-none absolute top-2 right-1.5 h-3 w-3 opacity-60 ${meta.text}`}
                                />
                              </div>
                            </td>

                            {/* Shift & Working Days */}
                            <td className="py-3.5">
                              <p className="text-foreground font-mono text-xs font-medium">
                                {member.shiftStart} – {member.shiftEnd}
                              </p>
                              <div className="mt-1 flex items-center gap-1">
                                {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => {
                                  const isWorking = member.workingDays.includes(d);
                                  return (
                                    <span
                                      key={d}
                                      className={`font-mono text-[9px] font-bold ${
                                        isWorking
                                          ? "text-blue-600 dark:text-blue-400"
                                          : "text-slate-300 dark:text-slate-700"
                                      }`}
                                    >
                                      {d[0]}
                                    </span>
                                  );
                                })}
                              </div>
                            </td>

                            {/* Qualifications */}
                            <td className="py-3.5">
                              <div className="flex max-w-[180px] flex-wrap gap-1">
                                {member.services.slice(0, 2).map((s) => (
                                  <span
                                    key={s.id}
                                    className="border-border/80 bg-muted/40 py-0.2 max-w-[120px] truncate rounded border px-1.5 text-[10px] font-medium"
                                  >
                                    {s.name}
                                  </span>
                                ))}
                                {member.services.length > 2 && (
                                  <span className="text-muted-foreground font-mono text-[10px] font-bold">
                                    +{member.services.length - 2}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Delivered Yield */}
                            <td className="py-3.5">
                              <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                ${member.revenueGenerated}
                              </p>
                              <p className="text-muted-foreground font-mono text-[10px]">
                                {member.appointmentCount} sessions
                              </p>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 pr-6 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setBookingStaffId(member.id);
                                  }}
                                  className="border-border/80 h-7 cursor-pointer gap-1 rounded-lg px-2 text-xs font-semibold hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40"
                                >
                                  <Calendar className="h-3.5 w-3.5 text-blue-500" />
                                  <span>Book</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEdit(member);
                                  }}
                                  className="border-border/80 hover:bg-muted h-7 cursor-pointer rounded-lg px-2 text-xs font-semibold"
                                >
                                  <Edit className="text-muted-foreground h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Slide-over Drawers & Interactive Modals */}
      <StaffQuickPeekDrawer
        staff={selectedStaffForDrawer}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpenEdit={(st) => {
          setIsDrawerOpen(false);
          handleOpenEdit(st);
        }}
      />

      <AddStaffModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      <EditStaffModal
        staff={editingStaff}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingStaff(null);
        }}
      />

      <BookingWizardModal
        isOpen={Boolean(bookingStaffId)}
        onClose={() => setBookingStaffId(null)}
        preselectedStaffId={bookingStaffId ?? undefined}
        organizationId={organizationId}
      />
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  Download,
  Mail,
  Phone,
  Building2,
  ArrowRight,
  LayoutGrid,
  List,
  MoreVertical,
  Edit3,
  Archive,
  RefreshCw,
  CreditCard,
  CalendarPlus,
  DollarSign,
  TrendingUp,
  Activity,
  UserCheck,
  Sparkles,
  X,
  ExternalLink,
  Crown,
  Eye,
  CheckSquare,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspaceSession } from "@/features/organizations/use-workspace-session";
import { useDashboardModals } from "@/components/dashboard/modals/dashboard-modal-context";
import { useCustomers } from "@/features/customers/use-customers";
import { EditCustomerModal } from "@/components/dashboard/modals/edit-customer-modal";
import { ArchiveCustomerDialog } from "@/components/dashboard/modals/archive-customer-dialog";
import { CustomerQuickPeekDrawer } from "@/components/dashboard/customers/customer-quick-peek-drawer";
import { calculateCustomerHealth } from "@/features/customers/customer-health";
import type { CustomerStatusType, CustomerListItem } from "@/features/customers/types";

type SortOption = "createdAt" | "ltv" | "name";

/**
 * Generates an executive-grade gradient tailored to the customer name hash
 */
function getAvatarGradient(name: string): string {
  const gradients = [
    "from-blue-600 via-indigo-600 to-violet-700 shadow-blue-500/20",
    "from-indigo-600 via-purple-600 to-pink-600 shadow-purple-500/20",
    "from-violet-600 via-fuchsia-600 to-rose-600 shadow-rose-500/20",
    "from-emerald-600 via-teal-600 to-cyan-700 shadow-emerald-500/20",
    "from-cyan-600 via-blue-600 to-indigo-700 shadow-cyan-500/20",
    "from-amber-500 via-orange-600 to-rose-600 shadow-orange-500/20",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

export default function CustomersDirectoryPage() {
  const { organizationName, isLoading: isSessionLoading } = useWorkspaceSession();
  const { openModal, exportCsv } = useDashboardModals();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<CustomerStatusType | "ALL">("ALL");
  const [selectedTag, setSelectedTag] = React.useState<string>("ALL");
  const [sortBy, setSortBy] = React.useState<SortOption>("createdAt");
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid");

  // Selected customer for modal actions
  const [editingCustomer, setEditingCustomer] = React.useState<CustomerListItem | null>(null);
  const [archivingCustomer, setArchivingCustomer] = React.useState<CustomerListItem | null>(null);
  const [archiveMode, setArchiveMode] = React.useState<"archive" | "reactivate">("archive");

  // Quick-Peek Drawer State
  const [peekCustomerId, setPeekCustomerId] = React.useState<string | null>(null);

  // Multi-Select Bulk Action State
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  // Clipboard copy toast state
  const [copiedText, setCopiedText] = React.useState<string | null>(null);

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data, isLoading, isPending, refetch } = useCustomers({
    search: debouncedSearch,
    status: statusFilter,
    tag: selectedTag !== "ALL" ? selectedTag : undefined,
    sortBy,
    sortOrder: sortBy === "name" ? "asc" : "desc",
    page: 1,
    limit: 100,
  });

  const isActuallyLoading = isSessionLoading || isLoading || (isPending && !data);

  const customers = React.useMemo(() => data?.customers ?? [], [data?.customers]);
  const totalCount = data?.total ?? 0;

  // Real Multi-Tenant Telemetry KPI aggregates
  const activeCount = customers.filter((c) => c.status === "ACTIVE").length;
  const leadsCount = customers.filter((c) => c.status === "LEAD").length;
  const totalPaidSum = customers.reduce((acc, c) => {
    const val = Number(c.totalPaid.replace(/[^0-9.-]+/g, "")) || 0;
    return acc + val;
  }, 0);
  const repeatClientCount = customers.filter(
    (c) => c.appointmentsCount > 1 || c.invoicesCount > 1
  ).length;
  const repeatRate =
    customers.length > 0 ? Math.round((repeatClientCount / customers.length) * 100) : 0;

  // Extract all unique tags present across records
  const allTags = React.useMemo(() => {
    const set = new Set<string>();
    customers.forEach((c) => c.tags?.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [customers]);

  const toggleSelectId = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === customers.length && customers.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(customers.map((c) => c.id)));
    }
  };

  const handleExportSelected = () => {
    const selected = customers.filter((c) => selectedIds.has(c.id));
    const rows = selected.map((c) => [
      c.id,
      c.name,
      c.company || "Individual Client",
      "Customer Account",
      c.status,
      c.totalPaid,
      new Date(c.createdAt).toLocaleDateString(),
    ]);
    exportCsv(rows, `FlowPilot_Selected_Customers_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportAll = () => {
    const rows = customers.map((c) => [
      c.id,
      c.name,
      c.company || "Individual Client",
      "Customer Account",
      c.status,
      c.totalPaid,
      new Date(c.createdAt).toLocaleDateString(),
    ]);
    exportCsv(rows, `FlowPilot_Customers_Directory_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const renderStatusBadge = (status: CustomerStatusType) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/90 bg-emerald-50/90 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Active Client
          </span>
        );
      case "LEAD":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/90 bg-blue-50/90 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Pipeline Lead
          </span>
        );
      case "INACTIVE":
        return (
          <span className="border-border/80 bg-muted/60 text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold">
            <span className="bg-muted-foreground/60 h-1.5 w-1.5 rounded-full" />
            Archived
          </span>
        );
      default:
        return (
          <span className="border-border/80 bg-muted/40 text-muted-foreground inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium">
            {status}
          </span>
        );
    }
  };

  const tagBadgeStyle = (tag: string) => {
    switch (tag.toLowerCase()) {
      case "vip":
        return "border-purple-200/90 bg-purple-50/90 text-purple-700 shadow-purple-500/10 dark:border-purple-500/30 dark:bg-purple-500/15 dark:text-purple-300";
      case "enterprise":
        return "border-blue-200/90 bg-blue-50/90 text-blue-700 shadow-blue-500/10 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-300";
      case "retainer":
        return "border-emerald-200/90 bg-emerald-50/90 text-emerald-700 shadow-emerald-500/10 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300";
      case "commercial":
        return "border-indigo-200/90 bg-indigo-50/90 text-indigo-700 shadow-indigo-500/10 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-300";
      case "residential":
        return "border-cyan-200/90 bg-cyan-50/90 text-cyan-700 shadow-cyan-500/10 dark:border-cyan-500/30 dark:bg-cyan-500/15 dark:text-cyan-300";
      default:
        return "border-border/80 bg-muted/60 text-muted-foreground";
    }
  };

  return (
    <div className="relative w-full max-w-full min-w-0 space-y-7 scroll-smooth pb-16">
      {/* Linear Atmospheric Mesh Lighting */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(59,130,246,0.08),transparent_70%),radial-gradient(ellipse_60%_50%_at_100%_35%,rgba(99,102,241,0.05),transparent_60%)]"
        aria-hidden="true"
      />

      {/* Top Header & Executive Command Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
              Customer CRM Directory
            </h1>
            <span className="border-primary/20 bg-primary/10 text-primary hidden items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold sm:inline-flex">
              <Sparkles className="text-primary h-3 w-3" />
              Linear Precision
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Unified multi-tenant client dossiers, operational engagements, and reconciled Lifetime
            Values for <strong className="text-foreground font-semibold">{organizationName}</strong>
            .
          </p>
        </div>

        {/* Global CTA Actions */}
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center sm:gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportAll}
            disabled={customers.length === 0}
            className="border-border/80 bg-card/80 text-foreground hover:bg-muted/50 cursor-pointer justify-center rounded-xl text-xs font-semibold shadow-2xs"
          >
            <Download className="text-muted-foreground mr-1.5 h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>

          <Button
            size="sm"
            onClick={() => openModal("customer")}
            className="from-primary to-primary/90 hover:from-primary/95 hover:to-primary/85 shadow-primary/20 cursor-pointer justify-center rounded-xl bg-gradient-to-r px-4 text-xs font-bold text-white shadow-md"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            <span>New Customer</span>
          </Button>
        </div>
      </div>

      {/* 4x Executive Telemetry KPI Cards with Embedded Micro-Visualizations */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Active Accounts Ratio */}
        <Card className="group border-border/80 from-card to-card/90 hover:border-primary/40 relative overflow-hidden rounded-2xl border bg-gradient-to-b p-5 shadow-2xs backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
              Active Accounts
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shadow-inner transition-transform group-hover:scale-105 dark:text-emerald-400">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-foreground text-2xl font-black tracking-tight tabular-nums">
              {activeCount}
            </span>
            <span className="text-muted-foreground text-xs">/ {totalCount} total</span>
          </div>
          {/* Micro Progress Track */}
          <div className="mt-2.5 space-y-1">
            <div className="text-muted-foreground flex justify-between text-[10px]">
              <span>Operational Share</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0}%
              </span>
            </div>
            <div className="bg-muted/60 h-1.5 w-full overflow-hidden rounded-full">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                style={{ width: `${totalCount > 0 ? (activeCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>
        </Card>

        {/* KPI 2: Pipeline Leads */}
        <Card className="group border-border/80 from-card to-card/90 hover:border-primary/40 relative overflow-hidden rounded-2xl border bg-gradient-to-b p-5 shadow-2xs backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
              Pipeline Leads
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 shadow-inner transition-transform group-hover:scale-105 dark:text-blue-400">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-foreground text-2xl font-black tracking-tight tabular-nums">
              {leadsCount}
            </span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Active Prospects
            </span>
          </div>
          {/* Conversion Stepper */}
          <div className="mt-2.5 flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`h-1.5 flex-1 rounded-full ${
                  leadsCount >= step ? "bg-primary" : "bg-muted/60"
                }`}
              />
            ))}
          </div>
        </Card>

        {/* KPI 3: Settled Portfolio LTV with Embedded Sparkline */}
        <Card className="group border-border/80 from-card to-card/90 hover:border-primary/40 relative overflow-hidden rounded-2xl border bg-gradient-to-b p-5 shadow-2xs backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
              Settled Portfolio LTV
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 shadow-inner transition-transform group-hover:scale-105 dark:text-indigo-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-foreground text-2xl font-black tracking-tight tabular-nums">
              ${totalPaidSum.toLocaleString("en-US", { minimumFractionDigits: 0 })}
            </span>
            {/* Embedded Micro SVG Sparkline */}
            <svg className="h-7 w-20 overflow-visible" viewBox="0 0 80 24">
              <defs>
                <linearGradient id="ltvGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M 0,18 Q 20,12 40,15 T 80,4 L 80,24 L 0,24 Z" fill="url(#ltvGlow)" />
              <path
                d="M 0,18 Q 20,12 40,15 T 80,4"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="text-muted-foreground mt-1 text-[11px]">Reconciled cash payments</p>
        </Card>

        {/* KPI 4: Repeat Client Retention */}
        <Card className="group border-border/80 from-card to-card/90 hover:border-primary/40 relative overflow-hidden rounded-2xl border bg-gradient-to-b p-5 shadow-2xs backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
              Repeat Client Rate
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 shadow-inner transition-transform group-hover:scale-105 dark:text-purple-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-foreground text-2xl font-black tracking-tight tabular-nums">
              {repeatRate}%
            </span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
              {repeatClientCount} loyalty accounts
            </span>
          </div>
          <div className="bg-muted/60 mt-2.5 h-1.5 w-full overflow-hidden rounded-full">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${repeatRate}%` }}
            />
          </div>
        </Card>
      </div>

      {/* Floating Modern Control Dock */}
      <div className="space-y-3">
        <div className="border-border/80 bg-card/90 flex flex-col gap-3 rounded-2xl border p-3.5 shadow-2xs backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input with Shortcut Badge */}
          <div className="relative w-full flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-2.5 left-3.5 h-4 w-4" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search clients by name, corporate email, company, or phone..."
              className="border-border/80 bg-muted/40 text-foreground placeholder:text-muted-foreground focus:bg-background h-9.5 w-full rounded-xl pr-14 pl-9.5 text-xs transition-colors"
            />
            {searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="text-muted-foreground hover:text-foreground absolute top-2.5 right-3 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <div className="border-border/80 bg-card text-muted-foreground pointer-events-none absolute top-2 right-3 hidden items-center rounded-md border px-1.5 py-0.5 font-mono text-[10px] sm:flex">
                /
              </div>
            )}
          </div>

          {/* Sliding Pill Status Tabs */}
          <div className="no-scrollbar border-border/80 bg-muted/40 flex w-full max-w-full items-center gap-1 overflow-x-auto rounded-xl border p-1 text-xs sm:w-auto">
            {(
              [
                { key: "ALL", label: "All Records", count: totalCount },
                { key: "ACTIVE", label: "Active", count: activeCount },
                { key: "LEAD", label: "Leads", count: leadsCount },
                {
                  key: "INACTIVE",
                  label: "Archived",
                  count: customers.filter((c) => c.status === "INACTIVE").length,
                },
              ] as const
            ).map((tab) => {
              const isActive = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-bold whitespace-nowrap transition-all sm:px-3 ${
                    isActive
                      ? "bg-card text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`py-0.2 rounded-full px-1.5 text-[10px] font-black ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sort & View Mode Toggle */}
          <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="border-border/80 bg-card text-foreground hover:bg-muted/50 h-9 flex-1 cursor-pointer rounded-xl border px-3 text-xs font-semibold shadow-2xs outline-none sm:flex-initial"
            >
              <option value="createdAt">Sort: Recent Onboarding</option>
              <option value="ltv">Sort: Highest LTV</option>
              <option value="name">Sort: Alphabetical (A-Z)</option>
            </select>

            <div className="border-border/80 bg-muted/40 flex shrink-0 items-center rounded-xl border p-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Visual Card Grid"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg transition-all ${
                  viewMode === "table"
                    ? "bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="High-Density Table"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Segment Tags Bar */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 px-1 text-xs">
            <span className="text-muted-foreground mr-1 font-semibold">Filter by Tag:</span>
            <button
              type="button"
              onClick={() => setSelectedTag("ALL")}
              className={`cursor-pointer rounded-lg px-2.5 py-1 font-semibold transition-all ${
                selectedTag === "ALL"
                  ? "bg-foreground text-background shadow-2xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              All Segments
            </button>
            {allTags.map((tag) => {
              const count = customers.filter((c) => c.tags?.includes(tag)).length;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition-all ${
                    selectedTag === tag
                      ? "from-primary bg-gradient-to-r to-indigo-600 text-white shadow-xs"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span>{tag}</span>
                  {count > 0 && (
                    <span
                      className={`py-0.2 rounded-full px-1.5 text-[9px] font-bold ${
                        selectedTag === tag
                          ? "bg-white/20 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {isActuallyLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="border-border/80 bg-card/60 h-52 animate-pulse rounded-2xl border p-5 shadow-2xs backdrop-blur-md"
            />
          ))}
        </div>
      )}

      {/* Pristine Empty State */}
      {!isActuallyLoading && customers.length === 0 && (
        <Card className="border-border/80 bg-card/60 flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center shadow-xs backdrop-blur-md">
          <div className="from-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br to-indigo-500/10 shadow-2xs">
            <Users className="h-8 w-8" />
          </div>
          <CardTitle className="text-foreground mt-4 text-base font-bold">
            {searchTerm || statusFilter !== "ALL" || selectedTag !== "ALL"
              ? "No matching client records found"
              : "No customer records registered yet"}
          </CardTitle>
          <p className="text-muted-foreground mt-1.5 max-w-sm text-xs">
            {searchTerm || statusFilter !== "ALL" || selectedTag !== "ALL"
              ? "Try adjusting your search query, clearing segment filters, or changing status tabs."
              : "Create your first client profile to attach quotes, manage bookings, and start generating revenue."}
          </p>
          <div className="mt-5 flex gap-2">
            {searchTerm || statusFilter !== "ALL" || selectedTag !== "ALL" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                  setSelectedTag("ALL");
                }}
                className="border-border/80 cursor-pointer rounded-xl text-xs font-semibold shadow-2xs"
              >
                Reset Search & Filters
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => openModal("customer")}
                className="from-primary hover:from-primary/95 shadow-primary/20 hover:shadow-primary/30 cursor-pointer rounded-xl bg-gradient-to-r to-indigo-600 text-xs font-bold text-white shadow-md transition-all hover:shadow-lg"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                <span>Add First Customer</span>
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* View Mode 1: High-Density Modern Table View */}
      {!isActuallyLoading && customers.length > 0 && viewMode === "table" && (
        <div className="border-border/80 bg-card/90 overflow-hidden rounded-2xl border shadow-2xs backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-border/60 bg-muted/30 text-muted-foreground border-b text-[11px] font-bold tracking-wider uppercase">
                <tr>
                  <th className="w-10 px-3.5 py-3.5 text-center">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                      title={selectedIds.size === customers.length ? "Deselect All" : "Select All"}
                    >
                      {selectedIds.size > 0 && selectedIds.size === customers.length ? (
                        <CheckSquare className="text-primary h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3.5">Client Account</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Health Radar</th>
                  <th className="px-4 py-3.5">Segment Tags</th>
                  <th className="px-4 py-3.5">Contact Details</th>
                  <th className="px-4 py-3.5 text-right">Engagements</th>
                  <th className="px-4 py-3.5 text-right">Settled LTV</th>
                  <th className="px-4 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-border/60 divide-y">
                {customers.map((customer) => {
                  const initials = customer.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  const avatarBg = getAvatarGradient(customer.name);
                  const paidVal = Number(customer.totalPaid.replace(/[^0-9.-]+/g, "")) || 0;
                  const isHighValue = paidVal >= 1000;
                  const health = calculateCustomerHealth(customer);
                  const isSelected = selectedIds.has(customer.id);

                  return (
                    <tr
                      key={customer.id}
                      onClick={() => setPeekCustomerId(customer.id)}
                      className={`group cursor-pointer transition-colors ${
                        isSelected ? "bg-primary/10 hover:bg-primary/15" : "hover:bg-muted/40"
                      }`}
                    >
                      {/* Checkbox Column */}
                      <td
                        className="w-10 px-3.5 py-3.5 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => toggleSelectId(customer.id, e)}
                          className="text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="text-primary h-4 w-4" />
                          ) : (
                            <Square className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                          )}
                        </button>
                      </td>

                      {/* Client Account */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${avatarBg} text-xs font-bold text-white shadow-sm transition-transform group-hover:scale-105`}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <span className="group-hover:text-primary text-foreground flex items-center gap-1.5 font-bold transition-colors">
                              {customer.name}
                              {isHighValue && (
                                <span className="py-0.2 inline-flex items-center gap-0.5 rounded-full border border-amber-300/80 bg-amber-50 px-1.5 text-[9px] font-bold text-amber-700 shadow-2xs dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
                                  <Crown className="h-2.5 w-2.5 fill-amber-700 text-amber-700 dark:fill-amber-400 dark:text-amber-400" />
                                  VIP
                                </span>
                              )}
                            </span>
                            {customer.company ? (
                              <p className="text-muted-foreground truncate text-[11px]">
                                {customer.company}
                              </p>
                            ) : (
                              <p className="text-muted-foreground/60 text-[11px] italic">
                                Individual
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">{renderStatusBadge(customer.status)}</td>

                      {/* Health Radar Pill */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold ${health.badgeStyle}`}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: health.ringColor }}
                          />
                          <span>{health.score}</span>
                          <span className="text-muted-foreground/50 font-normal">·</span>
                          <span>{health.tierLabel}</span>
                        </span>
                      </td>

                      {/* Tags */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {customer.tags && customer.tags.length > 0 ? (
                            customer.tags.map((t) => (
                              <span
                                key={t}
                                className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${tagBadgeStyle(
                                  t
                                )}`}
                              >
                                {t}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted-foreground/50 text-[11px]">—</span>
                          )}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="text-muted-foreground space-y-1 text-[11px]">
                          <button
                            type="button"
                            onClick={(e) => handleCopy(customer.email, e)}
                            className="hover:text-primary flex cursor-pointer items-center gap-1.5 transition-colors"
                            title="Click to copy email"
                          >
                            <Mail className="text-muted-foreground h-3 w-3" />
                            <span className="max-w-[170px] truncate">{customer.email}</span>
                            {copiedText === customer.email && (
                              <span className="rounded-md bg-emerald-500/10 px-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                Copied!
                              </span>
                            )}
                          </button>
                          {customer.phone && (
                            <button
                              type="button"
                              onClick={(e) => handleCopy(customer.phone!, e)}
                              className="hover:text-primary flex cursor-pointer items-center gap-1.5 transition-colors"
                              title="Click to copy phone"
                            >
                              <Phone className="text-muted-foreground h-3 w-3" />
                              <span className="max-w-[170px] truncate">{customer.phone}</span>
                              {copiedText === customer.phone && (
                                <span className="rounded-md bg-emerald-500/10 px-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                  Copied!
                                </span>
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Engagements */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="text-muted-foreground text-[11px]">
                          <span className="text-foreground font-bold">
                            {customer.appointmentsCount}
                          </span>{" "}
                          appt
                          <span className="text-muted-foreground/40 mx-1">·</span>
                          <span className="text-foreground font-bold">
                            {customer.invoicesCount}
                          </span>{" "}
                          inv
                        </div>
                      </td>

                      {/* Settled LTV */}
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-foreground font-extrabold tabular-nums">
                          {customer.totalPaid}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPeekCustomerId(customer.id)}
                            className="text-muted-foreground hover:bg-muted hover:text-foreground h-7 w-7 cursor-pointer rounded-lg p-0"
                            title="Quick Peek (Drawer)"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>

                          <Link
                            href={`/dashboard/customers/${customer.id}`}
                            className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg"
                            title="Full 360° Profile"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:bg-muted hover:text-foreground h-7 w-7 cursor-pointer rounded-lg p-0"
                              >
                                <MoreVertical className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 text-xs shadow-md">
                              <DropdownMenuItem
                                onClick={() => setPeekCustomerId(customer.id)}
                                className="flex cursor-pointer items-center gap-2"
                              >
                                <Eye className="text-muted-foreground h-3.5 w-3.5" />
                                <span>Quick Peek Drawer</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/dashboard/customers/${customer.id}`}
                                  className="flex cursor-pointer items-center gap-2"
                                >
                                  <Users className="text-muted-foreground h-3.5 w-3.5" />
                                  <span>View 360° Profile</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setEditingCustomer(customer)}
                                className="flex cursor-pointer items-center gap-2"
                              >
                                <Edit3 className="text-muted-foreground h-3.5 w-3.5" />
                                <span>Edit Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openModal("invoice")}
                                className="flex cursor-pointer items-center gap-2"
                              >
                                <CreditCard className="text-primary h-3.5 w-3.5" />
                                <span>Create Invoice</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openModal("appointment")}
                                className="flex cursor-pointer items-center gap-2"
                              >
                                <CalendarPlus className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>Book Appointment</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {customer.status !== "INACTIVE" ? (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setArchivingCustomer(customer);
                                    setArchiveMode("archive");
                                  }}
                                  className="flex cursor-pointer items-center gap-2 text-rose-600 focus:text-rose-700 dark:text-rose-400"
                                >
                                  <Archive className="h-3.5 w-3.5" />
                                  <span>Archive Client</span>
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setArchivingCustomer(customer);
                                    setArchiveMode("reactivate");
                                  }}
                                  className="flex cursor-pointer items-center gap-2 text-emerald-600 focus:text-emerald-700 dark:text-emerald-400"
                                >
                                  <RefreshCw className="h-3.5 w-3.5" />
                                  <span>Reactivate Client</span>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Mode 2: Modern Visual Card Grid */}
      {!isActuallyLoading && customers.length > 0 && viewMode === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer) => {
            const initials = customer.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();
            const avatarBg = getAvatarGradient(customer.name);
            const paidVal = Number(customer.totalPaid.replace(/[^0-9.-]+/g, "")) || 0;
            const isHighValue = paidVal >= 1000;
            const health = calculateCustomerHealth(customer);
            const isSelected = selectedIds.has(customer.id);

            return (
              <div
                key={customer.id}
                onClick={() => setPeekCustomerId(customer.id)}
                className={`group hover:border-primary/40 relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border p-5 shadow-2xs backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                  isSelected
                    ? "border-primary bg-primary/10 ring-primary/20 ring-2"
                    : "border-border/80 bg-card/90"
                }`}
              >
                {/* Ambient Aura */}
                <div className="bg-primary/[0.04] pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full blur-xl transition-all group-hover:scale-125" />

                <div>
                  {/* Top Row: Avatar + Name + Checkbox + Dropdown */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${avatarBg} text-sm font-bold text-white shadow-md transition-transform duration-300 group-hover:scale-105`}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="group-hover:text-primary text-foreground truncate text-sm font-bold transition-colors">
                            {customer.name}
                          </h3>
                          {isHighValue && (
                            <span className="py-0.2 inline-flex items-center gap-0.5 rounded-full border border-amber-300/80 bg-amber-50 px-1.5 text-[9px] font-bold text-amber-700 shadow-2xs dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
                              <Crown className="h-2.5 w-2.5 fill-amber-700 text-amber-700 dark:fill-amber-400 dark:text-amber-400" />
                              VIP
                            </span>
                          )}
                        </div>
                        {customer.company ? (
                          <div className="text-muted-foreground flex items-center gap-1 text-[11px]">
                            <Building2 className="text-muted-foreground h-3 w-3 shrink-0" />
                            <span className="truncate">{customer.company}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60 text-[11px] italic">
                            Individual Client
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className="flex shrink-0 items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => toggleSelectId(customer.id, e)}
                        className="text-muted-foreground hover:text-foreground cursor-pointer p-1"
                        title={isSelected ? "Deselect" : "Select"}
                      >
                        {isSelected ? (
                          <CheckSquare className="text-primary h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                        )}
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:bg-muted hover:text-foreground h-7 w-7 cursor-pointer rounded-lg p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-50 text-xs shadow-md">
                          <DropdownMenuItem
                            onClick={() => setPeekCustomerId(customer.id)}
                            className="flex cursor-pointer items-center gap-2"
                          >
                            <Eye className="text-muted-foreground h-3.5 w-3.5" />
                            <span>Quick Peek Drawer</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/customers/${customer.id}`}
                              className="flex cursor-pointer items-center gap-2"
                            >
                              <Users className="text-muted-foreground h-3.5 w-3.5" />
                              <span>View 360° Profile</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setEditingCustomer(customer)}
                            className="flex cursor-pointer items-center gap-2"
                          >
                            <Edit3 className="text-muted-foreground h-3.5 w-3.5" />
                            <span>Edit Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openModal("invoice")}
                            className="flex cursor-pointer items-center gap-2"
                          >
                            <CreditCard className="text-primary h-3.5 w-3.5" />
                            <span>Create Invoice</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openModal("appointment")}
                            className="flex cursor-pointer items-center gap-2"
                          >
                            <CalendarPlus className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Book Appointment</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {customer.status !== "INACTIVE" ? (
                            <DropdownMenuItem
                              onClick={() => {
                                setArchivingCustomer(customer);
                                setArchiveMode("archive");
                              }}
                              className="flex cursor-pointer items-center gap-2 text-rose-600 focus:text-rose-700 dark:text-rose-400"
                            >
                              <Archive className="h-3.5 w-3.5" />
                              <span>Archive Client</span>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => {
                                setArchivingCustomer(customer);
                                setArchiveMode("reactivate");
                              }}
                              className="flex cursor-pointer items-center gap-2 text-emerald-600 focus:text-emerald-700 dark:text-emerald-400"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              <span>Reactivate Client</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Status & Health Radar Strip */}
                  <div className="mt-3.5 flex flex-wrap items-center gap-2">
                    {renderStatusBadge(customer.status)}

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-extrabold ${health.badgeStyle}`}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: health.ringColor }}
                      />
                      <span>{health.score}</span>
                      <span className="text-muted-foreground/50 font-normal">·</span>
                      <span>{health.velocityLabel}</span>
                    </span>
                  </div>

                  {/* Tags */}
                  {customer.tags && customer.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {customer.tags.map((t) => (
                        <span
                          key={t}
                          className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${tagBadgeStyle(
                            t
                          )}`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Contact Chips with 1-click clipboard */}
                  <div
                    className="text-muted-foreground mt-3.5 space-y-1.5 text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={(e) => handleCopy(customer.email, e)}
                      className="hover:text-primary flex cursor-pointer items-center gap-1.5 transition-colors"
                      title="Click to copy email"
                    >
                      <Mail className="text-muted-foreground h-3.5 w-3.5" />
                      <span className="truncate">{customer.email}</span>
                      {copiedText === customer.email && (
                        <span className="rounded-md bg-emerald-500/10 px-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          Copied!
                        </span>
                      )}
                    </button>
                    {customer.phone && (
                      <button
                        type="button"
                        onClick={(e) => handleCopy(customer.phone!, e)}
                        className="hover:text-primary flex cursor-pointer items-center gap-1.5 transition-colors"
                        title="Click to copy phone"
                      >
                        <Phone className="text-muted-foreground h-3.5 w-3.5" />
                        <span className="truncate">{customer.phone}</span>
                        {copiedText === customer.phone && (
                          <span className="rounded-md bg-emerald-500/10 px-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            Copied!
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Footer Metrics & Direct Profile Link */}
                <div className="border-border/60 mt-5 border-t pt-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <p className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                        Settled LTV
                      </p>
                      <p className="text-foreground text-sm font-extrabold tabular-nums">
                        {customer.totalPaid}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPeekCustomerId(customer.id);
                        }}
                        className="text-muted-foreground hover:bg-muted hover:text-foreground h-8 cursor-pointer rounded-xl text-xs font-bold"
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        <span>Quick Peek</span>
                      </Button>

                      <Link
                        href={`/dashboard/customers/${customer.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-primary group/link text-foreground flex items-center gap-1 font-bold"
                      >
                        <span className="text-xs">Profile</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Executive Bulk Selection Dock */}
      {selectedIds.size > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 fixed bottom-5 left-1/2 z-40 w-[calc(100vw-1.5rem)] max-w-md -translate-x-1/2 duration-300 sm:bottom-7 sm:w-auto">
          <div className="border-border/80 bg-card/95 text-foreground flex items-center justify-between gap-2.5 rounded-2xl border px-3.5 py-2.5 shadow-2xl backdrop-blur-xl sm:justify-start sm:gap-3 sm:px-5 sm:py-3">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="bg-primary text-primary-foreground flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-black">
                {selectedIds.size}
              </span>
              <span className="truncate">{selectedIds.size === 1 ? "Selected" : "Selected"}</span>
            </div>

            <div className="bg-border/80 h-4 w-px" />

            <Button
              size="sm"
              variant="ghost"
              onClick={handleExportSelected}
              className="text-foreground hover:bg-muted h-8 cursor-pointer rounded-xl text-xs font-bold"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              <span>Export CSV ({selectedIds.size})</span>
            </Button>

            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg transition-colors"
              title="Clear Selection"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Slide-Over Quick-Peek Drawer */}
      <CustomerQuickPeekDrawer
        isOpen={Boolean(peekCustomerId)}
        customerId={peekCustomerId}
        onClose={() => setPeekCustomerId(null)}
        onEditCustomer={(cust) => {
          setEditingCustomer(cust);
          setPeekCustomerId(null);
        }}
        onBookAppointment={() => {
          openModal("appointment");
        }}
        onCreateInvoice={() => {
          openModal("invoice");
        }}
      />

      {/* Edit Customer Modal */}
      <EditCustomerModal
        isOpen={Boolean(editingCustomer)}
        onClose={() => setEditingCustomer(null)}
        customer={editingCustomer}
        onSuccess={() => {
          refetch();
          setEditingCustomer(null);
        }}
      />

      {/* Archive / Reactivate Customer Dialog */}
      <ArchiveCustomerDialog
        isOpen={Boolean(archivingCustomer)}
        onClose={() => setArchivingCustomer(null)}
        customer={archivingCustomer}
        mode={archiveMode}
        onSuccess={() => {
          refetch();
          setArchivingCustomer(null);
        }}
      />
    </div>
  );
}

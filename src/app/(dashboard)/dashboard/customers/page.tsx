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
  Calendar,
  FileText,
  ArrowRight,
  UserPlus,
  LayoutGrid,
  List,
  MoreVertical,
  Edit3,
  Archive,
  RefreshCw,
  CreditCard,
  CalendarPlus,
  Copy,
  DollarSign,
  TrendingUp,
  Activity,
  UserCheck,
  Sparkles,
  SlidersHorizontal,
  X,
  ExternalLink,
  Crown,
  ChevronRight,
  Zap,
  Eye,
  CheckSquare,
  Square,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
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
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Archived
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            {status}
          </span>
        );
    }
  };

  const tagBadgeStyle = (tag: string) => {
    switch (tag.toLowerCase()) {
      case "vip":
        return "border-purple-200/90 bg-purple-50/90 text-purple-700 shadow-purple-500/10";
      case "enterprise":
        return "border-blue-200/90 bg-blue-50/90 text-blue-700 shadow-blue-500/10";
      case "retainer":
        return "border-emerald-200/90 bg-emerald-50/90 text-emerald-700 shadow-emerald-500/10";
      case "commercial":
        return "border-indigo-200/90 bg-indigo-50/90 text-indigo-700 shadow-indigo-500/10";
      case "residential":
        return "border-cyan-200/90 bg-cyan-50/90 text-cyan-700 shadow-cyan-500/10";
      default:
        return "border-slate-200 bg-slate-100/90 text-slate-700";
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
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Customer CRM Directory
            </h1>
            <span className="hidden items-center gap-1 rounded-full border border-blue-200/80 bg-blue-50/80 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 sm:inline-flex">
              <Sparkles className="h-3 w-3 text-blue-600" />
              Linear Precision
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Unified multi-tenant client dossiers, operational engagements, and reconciled Lifetime
            Values for <strong className="font-semibold text-slate-800">{organizationName}</strong>.
          </p>
        </div>

        {/* Global CTA Actions */}
        <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:items-center sm:gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportAll}
            disabled={customers.length === 0}
            className="cursor-pointer rounded-xl border-slate-200/90 bg-white/80 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 justify-center"
          >
            <Download className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
            <span>Export CSV</span>
          </Button>

          <Button
            size="sm"
            onClick={() => openModal("customer")}
            className="from-primary to-primary/90 hover:from-primary/95 hover:to-primary/85 cursor-pointer rounded-xl bg-gradient-to-r px-4 text-xs font-bold text-white shadow-md shadow-blue-500/20 justify-center"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            <span>New Customer</span>
          </Button>
        </div>
      </div>

      {/* 4x Executive Telemetry KPI Cards with Embedded Micro-Visualizations */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Active Accounts Ratio */}
        <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_28px_-8px_rgba(49,95,232,0.08)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              Active Accounts
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-inner transition-transform group-hover:scale-105">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-slate-900 tabular-nums">
              {activeCount}
            </span>
            <span className="text-xs text-slate-400">/ {totalCount} total</span>
          </div>
          {/* Micro Progress Track */}
          <div className="mt-2.5 space-y-1">
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Operational Share</span>
              <span className="font-bold text-emerald-700">
                {totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                style={{ width: `${totalCount > 0 ? (activeCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>
        </Card>

        {/* KPI 2: Pipeline Leads */}
        <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_28px_-8px_rgba(49,95,232,0.08)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              Pipeline Leads
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-inner transition-transform group-hover:scale-105">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-slate-900 tabular-nums">
              {leadsCount}
            </span>
            <span className="text-xs font-semibold text-blue-600">Active Prospects</span>
          </div>
          {/* Conversion Stepper */}
          <div className="mt-2.5 flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`h-1.5 flex-1 rounded-full ${
                  leadsCount >= step ? "bg-blue-600" : "bg-slate-100"
                }`}
              />
            ))}
          </div>
        </Card>

        {/* KPI 3: Settled Portfolio LTV with Embedded Sparkline */}
        <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_28px_-8px_rgba(49,95,232,0.08)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              Settled Portfolio LTV
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-inner transition-transform group-hover:scale-105">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black tracking-tight text-slate-900 tabular-nums">
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
          <p className="mt-1 text-[11px] text-slate-500">Reconciled cash payments</p>
        </Card>

        {/* KPI 4: Repeat Client Retention */}
        <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_28px_-8px_rgba(49,95,232,0.08)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              Repeat Client Rate
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600 shadow-inner transition-transform group-hover:scale-105">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-slate-900 tabular-nums">
              {repeatRate}%
            </span>
            <span className="text-xs font-bold text-purple-700">
              {repeatClientCount} loyalty accounts
            </span>
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${repeatRate}%` }}
            />
          </div>
        </Card>
      </div>

      {/* Floating Modern Control Dock */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/85 p-3.5 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input with Shortcut Badge */}
          <div className="relative flex-1 w-full">
            <Search className="pointer-events-none absolute top-2.5 left-3.5 h-4 w-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search clients by name, corporate email, company, or phone..."
              className="h-9.5 rounded-xl border-slate-200 bg-slate-50/70 pr-14 pl-9.5 text-xs transition-colors focus:bg-white w-full"
            />
            {searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute top-2.5 right-3 cursor-pointer text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <div className="pointer-events-none absolute top-2 right-3 hidden items-center rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-400 sm:flex">
                /
              </div>
            )}
          </div>

          {/* Sliding Pill Status Tabs */}
          <div className="flex w-full sm:w-auto items-center gap-1 overflow-x-auto max-w-full rounded-xl border border-slate-200/80 bg-slate-100/90 p-1 text-xs no-scrollbar">
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
                  className={`flex shrink-0 whitespace-nowrap cursor-pointer items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 font-bold transition-all ${
                    isActive
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`py-0.2 rounded-full px-1.5 text-[10px] font-black ${
                      isActive ? "bg-primary text-white" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sort & View Mode Toggle */}
          <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="flex-1 sm:flex-initial h-9 cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs outline-none hover:bg-slate-50"
            >
              <option value="createdAt">Sort: Recent Onboarding</option>
              <option value="ltv">Sort: Highest LTV</option>
              <option value="name">Sort: Alphabetical (A-Z)</option>
            </select>

            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100/90 p-1 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
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
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
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
            <span className="mr-1 font-semibold text-slate-400">Filter by Tag:</span>
            <button
              type="button"
              onClick={() => setSelectedTag("ALL")}
              className={`cursor-pointer rounded-lg px-2.5 py-1 font-semibold transition-all ${
                selectedTag === "ALL"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span>{tag}</span>
                  {count > 0 && (
                    <span
                      className={`py-0.2 rounded-full px-1.5 text-[9px] font-bold ${
                        selectedTag === tag
                          ? "bg-white/20 text-white"
                          : "bg-slate-200 text-slate-700"
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
              className="h-52 animate-pulse rounded-2xl border border-slate-200/80 bg-white/70 p-5 shadow-2xs backdrop-blur-md"
            />
          ))}
        </div>
      )}

      {/* Pristine Empty State */}
      {!isActuallyLoading && customers.length === 0 && (
        <Card className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/80 bg-white/80 py-16 text-center shadow-xs backdrop-blur-md">
          <div className="from-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br to-indigo-500/10 shadow-2xs">
            <Users className="h-8 w-8" />
          </div>
          <CardTitle className="mt-4 text-base font-bold text-slate-900">
            {searchTerm || statusFilter !== "ALL" || selectedTag !== "ALL"
              ? "No matching client records found"
              : "No customer records registered yet"}
          </CardTitle>
          <p className="mt-1.5 max-w-sm text-xs text-slate-500">
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
                className="cursor-pointer rounded-xl border-slate-200 text-xs font-semibold shadow-2xs"
              >
                Reset Search & Filters
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => openModal("customer")}
                className="from-primary hover:from-primary/95 cursor-pointer rounded-xl bg-gradient-to-r to-indigo-600 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/30"
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
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="w-10 px-3.5 py-3.5 text-center">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="cursor-pointer text-slate-400 hover:text-slate-700"
                      title={selectedIds.size === customers.length ? "Deselect All" : "Select All"}
                    >
                      {selectedIds.size > 0 && selectedIds.size === customers.length ? (
                        <CheckSquare className="h-4 w-4 text-blue-600" />
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
              <tbody className="divide-y divide-slate-100/90">
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
                        isSelected ? "bg-blue-50/40 hover:bg-blue-50/60" : "hover:bg-slate-50/80"
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
                          className="cursor-pointer text-slate-400 hover:text-slate-700"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
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
                            <span className="group-hover:text-primary flex items-center gap-1.5 font-bold text-slate-900 transition-colors">
                              {customer.name}
                              {isHighValue && (
                                <span className="py-0.2 inline-flex items-center gap-0.5 rounded-full border border-amber-300/80 bg-amber-50 px-1.5 text-[9px] font-bold text-amber-700 shadow-2xs">
                                  <Crown className="h-2.5 w-2.5 fill-amber-700 text-amber-700" />
                                  VIP
                                </span>
                              )}
                            </span>
                            {customer.company ? (
                              <p className="truncate text-[11px] text-slate-500">
                                {customer.company}
                              </p>
                            ) : (
                              <p className="text-[11px] text-slate-400 italic">Individual</p>
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
                          <span className="font-normal text-slate-400">·</span>
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
                            <span className="text-[11px] text-slate-400">—</span>
                          )}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1 text-[11px] text-slate-600">
                          <button
                            type="button"
                            onClick={(e) => handleCopy(customer.email, e)}
                            className="hover:text-primary flex cursor-pointer items-center gap-1.5 transition-colors"
                            title="Click to copy email"
                          >
                            <Mail className="h-3 w-3 text-slate-400" />
                            <span className="max-w-[170px] truncate">{customer.email}</span>
                            {copiedText === customer.email && (
                              <span className="rounded-md bg-emerald-50 px-1 text-[10px] font-bold text-emerald-600">
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
                              <Phone className="h-3 w-3 text-slate-400" />
                              <span className="max-w-[170px] truncate">{customer.phone}</span>
                              {copiedText === customer.phone && (
                                <span className="rounded-md bg-emerald-50 px-1 text-[10px] font-bold text-emerald-600">
                                  Copied!
                                </span>
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Engagements */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="text-[11px] text-slate-600">
                          <span className="font-bold text-slate-900">
                            {customer.appointmentsCount}
                          </span>{" "}
                          appt
                          <span className="mx-1 text-slate-300">·</span>
                          <span className="font-bold text-slate-900">
                            {customer.invoicesCount}
                          </span>{" "}
                          inv
                        </div>
                      </td>

                      {/* Settled LTV */}
                      <td className="px-4 py-3.5 text-right">
                        <span className="font-extrabold text-slate-900 tabular-nums">
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
                            className="h-7 w-7 cursor-pointer rounded-lg p-0 text-slate-400 hover:bg-slate-100 hover:text-slate-800"
                            title="Quick Peek (Drawer)"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>

                          <Link
                            href={`/dashboard/customers/${customer.id}`}
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800"
                            title="Full 360° Profile"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 cursor-pointer rounded-lg p-0 text-slate-400 hover:bg-slate-100 hover:text-slate-800"
                              >
                                <MoreVertical className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 text-xs shadow-md">
                              <DropdownMenuItem
                                onClick={() => setPeekCustomerId(customer.id)}
                                className="flex cursor-pointer items-center gap-2"
                              >
                                <Eye className="h-3.5 w-3.5 text-slate-400" />
                                <span>Quick Peek Drawer</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/dashboard/customers/${customer.id}`}
                                  className="flex cursor-pointer items-center gap-2"
                                >
                                  <Users className="h-3.5 w-3.5 text-slate-400" />
                                  <span>View 360° Profile</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setEditingCustomer(customer)}
                                className="flex cursor-pointer items-center gap-2"
                              >
                                <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                                <span>Edit Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openModal("invoice")}
                                className="flex cursor-pointer items-center gap-2"
                              >
                                <CreditCard className="h-3.5 w-3.5 text-blue-600" />
                                <span>Create Invoice</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openModal("appointment")}
                                className="flex cursor-pointer items-center gap-2"
                              >
                                <CalendarPlus className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Book Appointment</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {customer.status !== "INACTIVE" ? (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setArchivingCustomer(customer);
                                    setArchiveMode("archive");
                                  }}
                                  className="flex cursor-pointer items-center gap-2 text-rose-600 focus:text-rose-700"
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
                                  className="flex cursor-pointer items-center gap-2 text-emerald-600 focus:text-emerald-700"
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
                className={`group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_20px_40px_-12px_rgba(49,95,232,0.12)] ${
                  isSelected
                    ? "border-blue-400 bg-blue-50/30 ring-2 ring-blue-500/20"
                    : "border-slate-200/90 bg-white/90"
                }`}
              >
                {/* Ambient Aura */}
                <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-blue-500/[0.04] blur-xl transition-all group-hover:scale-125" />

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
                          <h3 className="group-hover:text-primary truncate text-sm font-bold text-slate-900 transition-colors">
                            {customer.name}
                          </h3>
                          {isHighValue && (
                            <span className="py-0.2 inline-flex items-center gap-0.5 rounded-full border border-amber-300/80 bg-amber-50 px-1.5 text-[9px] font-bold text-amber-700 shadow-2xs">
                              <Crown className="h-2.5 w-2.5 fill-amber-700 text-amber-700" />
                              VIP
                            </span>
                          )}
                        </div>
                        {customer.company ? (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Building2 className="h-3 w-3 shrink-0 text-slate-400" />
                            <span className="truncate">{customer.company}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">Individual Client</span>
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
                        className="cursor-pointer p-1 text-slate-400 hover:text-slate-700"
                        title={isSelected ? "Deselect" : "Select"}
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Square className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                        )}
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 cursor-pointer rounded-lg p-0 text-slate-400 hover:bg-slate-100 hover:text-slate-800"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-50 text-xs shadow-md">
                          <DropdownMenuItem
                            onClick={() => setPeekCustomerId(customer.id)}
                            className="flex cursor-pointer items-center gap-2"
                          >
                            <Eye className="h-3.5 w-3.5 text-slate-400" />
                            <span>Quick Peek Drawer</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/customers/${customer.id}`}
                              className="flex cursor-pointer items-center gap-2"
                            >
                              <Users className="h-3.5 w-3.5 text-slate-400" />
                              <span>View 360° Profile</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setEditingCustomer(customer)}
                            className="flex cursor-pointer items-center gap-2"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                            <span>Edit Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openModal("invoice")}
                            className="flex cursor-pointer items-center gap-2"
                          >
                            <CreditCard className="h-3.5 w-3.5 text-blue-600" />
                            <span>Create Invoice</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openModal("appointment")}
                            className="flex cursor-pointer items-center gap-2"
                          >
                            <CalendarPlus className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Book Appointment</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {customer.status !== "INACTIVE" ? (
                            <DropdownMenuItem
                              onClick={() => {
                                setArchivingCustomer(customer);
                                setArchiveMode("archive");
                              }}
                              className="flex cursor-pointer items-center gap-2 text-rose-600 focus:text-rose-700"
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
                              className="flex cursor-pointer items-center gap-2 text-emerald-600 focus:text-emerald-700"
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
                      <span className="font-normal text-slate-400">·</span>
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
                    className="mt-3.5 space-y-1.5 text-xs text-slate-600"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={(e) => handleCopy(customer.email, e)}
                      className="hover:text-primary flex cursor-pointer items-center gap-1.5 transition-colors"
                      title="Click to copy email"
                    >
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{customer.email}</span>
                      {copiedText === customer.email && (
                        <span className="rounded-md bg-emerald-50 px-1 text-[10px] font-bold text-emerald-600">
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
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span className="truncate">{customer.phone}</span>
                        {copiedText === customer.phone && (
                          <span className="rounded-md bg-emerald-50 px-1 text-[10px] font-bold text-emerald-600">
                            Copied!
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Footer Metrics & Direct Profile Link */}
                <div className="mt-5 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                        Settled LTV
                      </p>
                      <p className="text-sm font-extrabold text-slate-900 tabular-nums">
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
                        className="h-8 cursor-pointer rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        <span>Quick Peek</span>
                      </Button>

                      <Link
                        href={`/dashboard/customers/${customer.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-primary group/link flex items-center gap-1 font-bold text-slate-700"
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
        <div className="animate-in fade-in slide-in-from-bottom-4 fixed bottom-5 sm:bottom-7 left-1/2 z-40 -translate-x-1/2 duration-300 w-[calc(100vw-1.5rem)] max-w-md sm:w-auto">
          <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3 rounded-2xl border border-slate-800 bg-slate-900/95 px-3.5 sm:px-5 py-2.5 sm:py-3 text-white shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[11px] font-black text-white">
                {selectedIds.size}
              </span>
              <span className="truncate">{selectedIds.size === 1 ? "Selected" : "Selected"}</span>
            </div>

            <div className="h-4 w-px bg-slate-700" />

            <Button
              size="sm"
              variant="ghost"
              onClick={handleExportSelected}
              className="h-8 cursor-pointer rounded-xl text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              <span>Export CSV ({selectedIds.size})</span>
            </Button>

            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
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

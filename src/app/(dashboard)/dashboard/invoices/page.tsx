"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  RefreshCw,
  TrendingUp,
  Receipt,
  ChevronRight,
  Copy,
  Check,
  Keyboard,
  Share2,
  LayoutGrid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useInvoices, useInvoiceStats } from "@/features/invoices/use-invoices";
import { useWorkspaceSession } from "@/features/organizations/use-workspace-session";
import type { InvoiceListItem, InvoiceStatusType } from "@/features/invoices/types";

import { InvoiceQuickPeekDrawer } from "@/components/dashboard/invoices/invoice-quick-peek-drawer";
import { InvoiceBuilderModal } from "@/components/dashboard/invoices/invoice-builder-modal";
import { RecordPaymentModal } from "@/components/dashboard/invoices/record-payment-modal";
import { InvoicePrintModal } from "@/components/dashboard/invoices/invoice-print-modal";

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

const STATUS_TABS: Array<{ id: "ALL" | InvoiceStatusType; label: string }> = [
  { id: "ALL", label: "All Statements" },
  { id: "PAID", label: "Paid & Settled" },
  { id: "PENDING", label: "Pending Payment" },
  { id: "OVERDUE", label: "Overdue Risk" },
  { id: "CANCELLED", label: "Void / Cancelled" },
];

const subscribeNoop = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function InvoicesDashboardPage() {
  const { organizationId, organizationName, isLoading: isSessionLoading } = useWorkspaceSession();
  const isClient = React.useSyncExternalStore(subscribeNoop, getClientSnapshot, getServerSnapshot);

  // View Mode: cards (ideal for mobile / visual grid) vs table (high-density spreadsheet)
  const [viewMode, setViewMode] = React.useState<"cards" | "table">("cards");

  // Filters & Search state
  const [selectedStatusTab, setSelectedStatusTab] = React.useState<"ALL" | InvoiceStatusType>(
    "ALL"
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const [copiedInvoiceId, setCopiedInvoiceId] = React.useState<string | null>(null);
  const [copiedPayLinkId, setCopiedPayLinkId] = React.useState<string | null>(null);

  // Multi-select state
  const [selectedInvoiceIds, setSelectedInvoiceIds] = React.useState<Set<string>>(new Set());

  // Keyboard shortcut & ref
  const [isShortcutModalOpen, setIsShortcutModalOpen] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Modals state
  const [isBuilderOpen, setIsBuilderOpen] = React.useState(false);
  const [drawerInvoice, setDrawerInvoice] = React.useState<InvoiceListItem | null>(null);
  const [paymentInvoice, setPaymentInvoice] = React.useState<InvoiceListItem | null>(null);
  const [printInvoice, setPrintInvoice] = React.useState<InvoiceListItem | null>(null);

  // Queries
  const {
    data: invoicesResponse,
    isLoading: isLoadingInvoices,
    isPending: isPendingInvoices,
    refetch: refetchInvoices,
    isRefetching,
  } = useInvoices(
    {
      status: selectedStatusTab !== "ALL" ? selectedStatusTab : undefined,
      search: searchQuery.trim() || undefined,
    },
    organizationId
  );

  const isActuallyLoading =
    !isClient || isSessionLoading || isLoadingInvoices || (isPendingInvoices && !invoicesResponse);

  const { data: stats } = useInvoiceStats(organizationId);
  const invoices = invoicesResponse?.invoices ?? [];

  // Global Keyboard Power Shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        if (e.key === "Escape") target.blur();
        return;
      }

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        setIsBuilderOpen(true);
      } else if (e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "?") {
        e.preventDefault();
        setIsShortcutModalOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setSelectedInvoiceIds(new Set());
        setDrawerInvoice(null);
        setIsShortcutModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Multi-select handlers
  const toggleSelectInvoice = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedInvoiceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedInvoiceIds.size === invoices.length && invoices.length > 0) {
      setSelectedInvoiceIds(new Set());
    } else {
      setSelectedInvoiceIds(new Set(invoices.map((i) => i.id)));
    }
  };

  const selectedInvoicesList = invoices.filter((i) => selectedInvoiceIds.has(i.id));
  const selectedTotalAmount = selectedInvoicesList.reduce((acc, it) => acc + it.total, 0);

  // Calculate settlement ratio
  const settlementRate =
    stats && stats.totalBilled > 0
      ? Math.min(100, Math.round((stats.cashCollected / stats.totalBilled) * 100))
      : 100;

  const handleCopyInvoiceNumber = async (invNumber: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(invNumber);
    setCopiedInvoiceId(id);
    setTimeout(() => setCopiedInvoiceId(null), 1800);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-24">
      {/* Studio Aurora Glow Mesh */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-35">
        <div className="absolute top-0 -left-[10%] h-[500px] w-[550px] rounded-full bg-blue-500/15 blur-[140px]" />
        <div className="absolute top-[20%] right-[5%] h-[400px] w-[450px] rounded-full bg-emerald-500/12 blur-[130px]" />
        <div className="absolute bottom-[10%] left-[25%] h-[350px] w-[400px] rounded-full bg-indigo-500/10 blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-7 px-4 pt-8 sm:px-6 lg:px-8">
        {/* Executive Header Banner */}
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                    Invoices & Cash Ledger
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    Live Engine
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {organizationName || "Operations Command"} • Multi-tenant billing, aging radar &
                  cash flow reconciliation
                </p>
              </div>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center sm:gap-2.5">
            <button
              type="button"
              onClick={() => setIsShortcutModalOpen(true)}
              className="hidden cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200/90 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-2xs transition-colors hover:bg-slate-100 sm:flex"
              title="Keyboard shortcuts (?)"
            >
              <Keyboard className="h-3.5 w-3.5 text-slate-500" />
              <span>⌘ Shortcuts</span>
            </button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchInvoices()}
              disabled={isRefetching}
              className="h-9 cursor-pointer justify-center gap-1.5 rounded-xl border-slate-200/90 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-slate-400 ${isRefetching ? "animate-spin text-blue-600" : ""}`}
              />
              <span>{isRefetching ? "Updating..." : "Refresh"}</span>
            </Button>

            <Button
              onClick={() => setIsBuilderOpen(true)}
              className="h-9 cursor-pointer justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-3 text-xs font-bold text-white shadow-md shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99]"
            >
              <Plus className="h-4 w-4" />
              <span>New Invoice</span>
              <kbd className="hidden rounded bg-blue-800/60 px-1 py-0.5 font-mono text-[10px] sm:inline">
                N
              </kbd>
            </Button>
          </div>
        </div>

        {/* Executive 4x Financial KPI Command Matrix with SVG Sparklines & DSO Telemetry */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Billed */}
          <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600" />
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Total Billed
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-inner transition-transform group-hover:scale-105">
                <Receipt className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="font-mono text-2xl font-black tracking-tight text-slate-900 tabular-nums">
                  $
                  {stats
                    ? stats.totalBilled.toLocaleString("en-US", { minimumFractionDigits: 2 })
                    : "0.00"}
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="font-bold text-blue-600">+14.2% MoM</span>
                  <span>•</span>
                  <span>{stats?.counts.total ?? 0} bills</span>
                </div>
              </div>
              <div className="h-8 w-24 shrink-0">
                <svg viewBox="0 0 100 32" className="h-full w-full overflow-visible">
                  <defs>
                    <linearGradient id="billedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 26 Q 25 24 45 16 T 75 12 T 100 4 L 100 32 L 0 32 Z"
                    fill="url(#billedGrad)"
                  />
                  <path
                    d="M 0 26 Q 25 24 45 16 T 75 12 T 100 4"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </Card>

          {/* Card 2: Cash Collected */}
          <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px] font-bold tracking-wider text-emerald-700 uppercase">
                Cash Collected
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-inner transition-transform group-hover:scale-105">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="font-mono text-2xl font-black tracking-tight text-emerald-700 tabular-nums">
                  $
                  {stats
                    ? stats.cashCollected.toLocaleString("en-US", { minimumFractionDigits: 2 })
                    : "0.00"}
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-700">
                  <span className="font-bold">Avg DSO: 4.8d</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500">{stats?.counts.paid ?? 0} settled</span>
                </div>
              </div>
              <div className="h-8 w-24 shrink-0">
                <svg viewBox="0 0 100 32" className="h-full w-full overflow-visible">
                  <defs>
                    <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 28 Q 20 22 40 18 T 70 8 T 100 3 L 100 32 L 0 32 Z"
                    fill="url(#cashGrad)"
                  />
                  <path
                    d="M 0 28 Q 20 22 40 18 T 70 8 T 100 3"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Micro Settlement Bar */}
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500">Collection progress</span>
                <span className="font-bold text-emerald-700">{settlementRate}% realized</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                  style={{ width: `${settlementRate}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Card 3: Pending Receivables */}
          <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px] font-bold tracking-wider text-amber-700 uppercase">
                Pending Receivables
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shadow-inner transition-transform group-hover:scale-105">
                <Clock className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="font-mono text-2xl font-black tracking-tight text-amber-800 tabular-nums">
                  $
                  {stats
                    ? stats.pendingReceivables.toLocaleString("en-US", { minimumFractionDigits: 2 })
                    : "0.00"}
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="font-bold text-amber-700">Realize 94.6%</span>
                  <span>•</span>
                  <span>{stats?.counts.pending ?? 0} active</span>
                </div>
              </div>
              <div className="h-8 w-24 shrink-0">
                <svg viewBox="0 0 100 32" className="h-full w-full overflow-visible">
                  <defs>
                    <linearGradient id="pendingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 14 Q 30 24 55 18 T 80 12 T 100 16 L 100 32 L 0 32 Z"
                    fill="url(#pendingGrad)"
                  />
                  <path
                    d="M 0 14 Q 30 24 55 18 T 80 12 T 100 16"
                    fill="none"
                    stroke="#d97706"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </Card>

          {/* Card 4: Overdue Risk */}
          <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-500 via-red-500 to-rose-600" />
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px] font-bold tracking-wider text-rose-700 uppercase">
                Overdue Risk
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 shadow-inner transition-transform group-hover:scale-105">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="font-mono text-2xl font-black tracking-tight text-rose-700 tabular-nums">
                  $
                  {stats
                    ? stats.overdueAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })
                    : "0.00"}
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="font-bold text-rose-700">Action Required</span>
                  <span>•</span>
                  <span>{stats?.counts.overdue ?? 0} late</span>
                </div>
              </div>
              <div className="h-8 w-24 shrink-0">
                <svg viewBox="0 0 100 32" className="h-full w-full overflow-visible">
                  <defs>
                    <linearGradient id="overdueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 24 Q 25 18 50 22 T 75 14 T 100 12 L 100 32 L 0 32 Z"
                    fill="url(#overdueGrad)"
                  />
                  <path
                    d="M 0 24 Q 25 18 50 22 T 75 14 T 100 12"
                    fill="none"
                    stroke="#e11d48"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Receivables Aging & Risk Radar 2.0 */}
        {stats && (stats.pendingReceivables > 0 || stats.overdueAmount > 0) && (
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-2xs backdrop-blur-xl">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <h3 className="text-xs font-bold tracking-wider text-slate-800 uppercase">
                  Receivables Aging & Risk Radar
                </h3>
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                Click any risk bucket to filter the ledger
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setSelectedStatusTab("PENDING")}
                className="group cursor-pointer rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 transition-all hover:border-blue-300 hover:bg-blue-50/40 sm:p-3.5"
              >
                <div className="flex items-center justify-between">
                  <span className="truncate text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                    Current (On-Track)
                  </span>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                </div>
                <p className="mt-1 font-mono text-base font-black text-slate-900 tabular-nums sm:text-lg">
                  ${stats.aging.current.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-400 group-hover:text-blue-600">
                  Filter pending →
                </p>
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => setSelectedStatusTab("OVERDUE")}
                className="group cursor-pointer rounded-xl border border-amber-200/80 bg-amber-50/50 p-3 transition-all hover:border-amber-400 hover:bg-amber-50/80 sm:p-3.5"
              >
                <div className="flex items-center justify-between">
                  <span className="truncate text-[10px] font-bold tracking-wider text-amber-800 uppercase">
                    1 – 30 Days Overdue
                  </span>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                </div>
                <p className="mt-1 font-mono text-base font-black text-amber-950 tabular-nums sm:text-lg">
                  ${stats.aging.days30.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                <p className="mt-0.5 text-[10px] text-amber-700 group-hover:underline">
                  Filter risk →
                </p>
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => setSelectedStatusTab("OVERDUE")}
                className="group cursor-pointer rounded-xl border border-rose-200/80 bg-rose-50/50 p-3 transition-all hover:border-rose-400 hover:bg-rose-50/80 sm:p-3.5"
              >
                <div className="flex items-center justify-between">
                  <span className="truncate text-[10px] font-bold tracking-wider text-rose-800 uppercase">
                    31 – 60 Days Overdue
                  </span>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                </div>
                <p className="mt-1 font-mono text-base font-black text-rose-950 tabular-nums sm:text-lg">
                  ${stats.aging.days60.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                <p className="mt-0.5 text-[10px] text-rose-700 group-hover:underline">
                  Filter risk →
                </p>
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => setSelectedStatusTab("OVERDUE")}
                className="group cursor-pointer rounded-xl border border-rose-300 bg-rose-100/60 p-3 transition-all hover:border-rose-500 hover:bg-rose-100/90 sm:p-3.5"
              >
                <div className="flex items-center justify-between">
                  <span className="truncate text-[10px] font-bold tracking-wider text-rose-900 uppercase">
                    60+ Days (Critical)
                  </span>
                  <span className="h-1.5 w-1.5 shrink-0 animate-ping rounded-full bg-rose-600" />
                </div>
                <p className="mt-1 font-mono text-base font-black text-rose-950 tabular-nums sm:text-lg">
                  ${stats.aging.days90Plus.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                <p className="mt-0.5 text-[10px] font-bold text-rose-800 group-hover:underline">
                  Action required →
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Controls & Segmented Filters */}
        <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
          {/* Sliding Pill Segmented Switcher with Live Record Counts */}
          <div className="flex max-w-full [scrollbar-width:none] items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200/90 bg-white/90 p-1.5 whitespace-nowrap shadow-2xs backdrop-blur-md [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {STATUS_TABS.map((tab) => {
              const isSelected = selectedStatusTab === tab.id;
              const count =
                tab.id === "ALL"
                  ? (stats?.counts.total ?? invoices.length)
                  : tab.id === "PAID"
                    ? (stats?.counts.paid ?? 0)
                    : tab.id === "PENDING"
                      ? (stats?.counts.pending ?? 0)
                      : tab.id === "OVERDUE"
                        ? (stats?.counts.overdue ?? 0)
                        : (stats?.counts.cancelled ?? 0);

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedStatusTab(tab.id)}
                  className={`relative flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                    isSelected ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeInvoiceStatusPill"
                      className="absolute inset-0 rounded-xl bg-slate-100 shadow-2xs"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                  {stats && (
                    <span
                      className={`py-0.2 relative z-10 rounded-full px-1.5 text-[10px] font-black ${
                        isSelected ? "bg-blue-600 text-white" : "bg-slate-200/80 text-slate-600"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Bar & View Mode Toggle (Cards vs Table) */}
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                ref={searchInputRef}
                placeholder="Search invoice #, client, email... (Press /)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 rounded-2xl border-slate-200/90 bg-white/90 pl-9.5 text-xs shadow-2xs backdrop-blur-sm focus:border-blue-500"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex shrink-0 items-center rounded-2xl border border-slate-200/90 bg-white/90 p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl transition-all ${
                  viewMode === "cards"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Visual Card Grid (Mobile Friendly)"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl transition-all ${
                  viewMode === "table"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="High-Density Table View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Ledger Statements: Loading, Empty, Cards & Table Views */}
        {isActuallyLoading ? (
          <Card className="overflow-hidden rounded-3xl border-slate-200/80 bg-white/95 shadow-2xs backdrop-blur-xl">
            <div className="flex flex-col items-center justify-center space-y-3 p-20">
              <RefreshCw className="h-7 w-7 animate-spin text-blue-600" />
              <p className="text-xs font-semibold text-slate-500">Loading ledger statements...</p>
            </div>
          </Card>
        ) : invoices.length === 0 ? (
          /* Pristine Empty State */
          <Card className="overflow-hidden rounded-3xl border-slate-200/80 bg-white/95 shadow-2xs backdrop-blur-xl">
            <div className="flex flex-col items-center justify-center space-y-4 p-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 shadow-inner ring-1 ring-blue-500/20">
                <Receipt className="h-8 w-8" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h3 className="text-base font-extrabold text-slate-900">
                  {searchQuery || selectedStatusTab !== "ALL"
                    ? "No invoices matching filter"
                    : "No Invoices Issued Yet"}
                </h3>
                <p className="text-xs leading-relaxed text-slate-500">
                  {searchQuery || selectedStatusTab !== "ALL"
                    ? "Try adjusting your search criteria or reset the status filters to view all records."
                    : "Generate your first itemized billing statement to begin tracking receivables and automated cash reconciliation."}
                </p>
              </div>

              {searchQuery || selectedStatusTab !== "ALL" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedStatusTab("ALL");
                  }}
                  className="rounded-xl border-slate-200 text-xs font-semibold"
                >
                  Clear Filters
                </Button>
              ) : (
                <Button
                  onClick={() => setIsBuilderOpen(true)}
                  className="rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  <span>Issue First Invoice</span>
                </Button>
              )}
            </div>
          </Card>
        ) : viewMode === "cards" ? (
          /* View Mode 1: Modern Visual Card Grid (Ultra-responsive on Mobile & Desktop) */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {invoices.map((inv) => {
              const isPaid = inv.status === "PAID";
              const isOverdue = inv.status === "OVERDUE";
              const isCancelled = inv.status === "CANCELLED";
              const isCopied = copiedInvoiceId === inv.id;
              const isCopiedPay = copiedPayLinkId === inv.id;
              const isSelected = selectedInvoiceIds.has(inv.id);

              const dueDate = new Date(inv.dueDate);
              const now = new Date();
              const diffDays = Math.ceil(
                (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
              );
              const avatarBg = getAvatarGradient(inv.customerName);
              const initials = inv.customerName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <Card
                  key={inv.id}
                  onClick={() => setDrawerInvoice(inv)}
                  className={`group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border bg-white/95 p-4 shadow-2xs backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${
                    isSelected
                      ? "border-blue-400 bg-blue-50/20 ring-2 ring-blue-500/20"
                      : "border-slate-200/90 hover:border-slate-300"
                  }`}
                >
                  {/* Top Edge Indicator */}
                  <div
                    className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${
                      isPaid
                        ? "from-emerald-500 to-teal-500"
                        : isOverdue
                          ? "from-rose-500 to-red-600"
                          : isCancelled
                            ? "from-slate-300 to-slate-400"
                            : "from-blue-500 via-indigo-500 to-amber-500"
                    }`}
                  />

                  <div className="space-y-3.5">
                    {/* Header: Checkbox + Statement # + Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          onClick={(e) => toggleSelectInvoice(inv.id, e)}
                          className="flex items-center justify-center p-0.5"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-xs font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                            #{inv.invoiceNumber}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyInvoiceNumber(inv.invoiceNumber, inv.id, e)}
                            className="cursor-pointer rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                            title="Copy statement number"
                          >
                            {isCopied ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Paid
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-800">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
                            {inv.daysOverdue}d Late
                          </span>
                        ) : isCancelled ? (
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500 line-through">
                            Cancelled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Client Dossier */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${avatarBg} text-xs font-bold text-white shadow-sm transition-transform group-hover:scale-105`}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-900 transition-colors group-hover:text-blue-700">
                          {inv.customerName}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {inv.customerCompany || inv.customerEmail}
                        </p>
                      </div>
                    </div>

                    {/* Financial Amount & Due Timeline Box */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                          Statement Balance
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                          {inv.itemsCount} line {inv.itemsCount === 1 ? "item" : "items"}
                        </span>
                      </div>
                      <div className="mt-1 flex items-baseline justify-between">
                        <p className="font-mono text-2xl font-black tracking-tight text-slate-900 tabular-nums">
                          ${inv.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                        <div className="text-right text-[11px]">
                          {isPaid ? (
                            <span className="font-semibold text-emerald-700">
                              Settled{" "}
                              {inv.paidAt
                                ? new Date(inv.paidAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "on record"}
                            </span>
                          ) : isOverdue ? (
                            <span className="font-bold text-rose-700">
                              Overdue by {inv.daysOverdue}d
                            </span>
                          ) : (
                            <span className="font-medium text-slate-500">
                              {diffDays === 0
                                ? "Due today"
                                : diffDays > 0
                                  ? `Due in ${diffDays}d`
                                  : "Due recently"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Row */}
                  <div
                    className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-1.5">
                      {!isPaid && !isCancelled && (
                        <Button
                          size="sm"
                          onClick={() => setPaymentInvoice(inv)}
                          className="h-8 cursor-pointer gap-1 rounded-lg bg-emerald-600 px-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Settle</span>
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPrintInvoice(inv)}
                        className="h-8 cursor-pointer gap-1 rounded-lg border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
                      >
                        <Printer className="h-3.5 w-3.5 text-slate-500" />
                        <span>Print</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          const payUrl = `https://flowpilot.app/pay/tok_${inv.id.slice(0, 10)}`;
                          await navigator.clipboard.writeText(payUrl);
                          setCopiedPayLinkId(inv.id);
                          setTimeout(() => setCopiedPayLinkId(null), 1800);
                        }}
                        className="h-8 cursor-pointer gap-1 rounded-lg border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
                        title="Copy client checkout link"
                      >
                        {isCopiedPay ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Share2 className="h-3.5 w-3.5 text-slate-500" />
                        )}
                        <span>{isCopiedPay ? "Copied" : "Link"}</span>
                      </Button>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDrawerInvoice(inv)}
                      className="h-8 w-8 cursor-pointer rounded-lg p-0 text-slate-400 hover:bg-slate-100 hover:text-slate-800"
                      title="Open Statement Drawer"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          /* View Mode 2: High-Density Table View */
          <Card className="overflow-hidden rounded-3xl border-slate-200/80 bg-white/95 shadow-2xs backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] tracking-wider text-slate-500 uppercase">
                  <tr>
                    <th className="w-10 px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedInvoiceIds.size === invoices.length && invoices.length > 0}
                        onChange={toggleSelectAll}
                        className="h-3.5 w-3.5 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        title="Select all visible statements"
                      />
                    </th>
                    <th className="px-5 py-4 font-bold">Statement #</th>
                    <th className="px-6 py-4 font-bold">Client Dossier</th>
                    <th className="px-5 py-4 font-bold">Issue Date</th>
                    <th className="px-5 py-4 font-bold">Due Schedule</th>
                    <th className="px-6 py-4 text-right font-bold">Amount Due</th>
                    <th className="px-5 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {invoices.map((inv) => {
                    const isPaid = inv.status === "PAID";
                    const isOverdue = inv.status === "OVERDUE";
                    const isCancelled = inv.status === "CANCELLED";
                    const isCopied = copiedInvoiceId === inv.id;
                    const isSelected = selectedInvoiceIds.has(inv.id);

                    const dueDate = new Date(inv.dueDate);
                    const now = new Date();
                    const diffDays = Math.ceil(
                      (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                    );

                    return (
                      <tr
                        key={inv.id}
                        onClick={() => setDrawerInvoice(inv)}
                        className={`group cursor-pointer transition-colors ${
                          isSelected ? "bg-blue-50/60" : "hover:bg-blue-50/30"
                        }`}
                      >
                        {/* Checkbox Column */}
                        <td
                          className="w-10 px-4 py-4 text-center"
                          onClick={(e) => toggleSelectInvoice(inv.id, e)}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="h-3.5 w-3.5 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>

                        {/* Invoice Number */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                              #{inv.invoiceNumber}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyInvoiceNumber(inv.invoiceNumber, inv.id, e)}
                              className="cursor-pointer rounded-md p-1 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-700"
                              title="Copy invoice number"
                            >
                              {isCopied ? (
                                <Check className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {inv.itemsCount} line {inv.itemsCount === 1 ? "item" : "items"}
                          </p>
                        </td>

                        {/* Client Dossier */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 text-xs font-black text-blue-700 ring-1 ring-blue-500/20">
                              {inv.customerName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-bold text-slate-900 group-hover:text-blue-700">
                                {inv.customerName}
                              </p>
                              <p className="truncate text-[11px] text-slate-400">
                                {inv.customerCompany || inv.customerEmail}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Issue Date */}
                        <td className="px-5 py-4 text-slate-600">
                          {new Date(inv.issueDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>

                        {/* Due Schedule */}
                        <td className="px-5 py-4">
                          <p
                            className={`font-medium ${isOverdue ? "font-bold text-rose-700" : "text-slate-700"}`}
                          >
                            {dueDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          {isPaid ? (
                            <span className="text-[10px] font-semibold text-emerald-600">
                              Settled
                            </span>
                          ) : isOverdue ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-600">
                              <AlertCircle className="h-2.5 w-2.5" />
                              {inv.daysOverdue}d overdue
                            </span>
                          ) : diffDays === 0 ? (
                            <span className="text-[10px] font-bold text-amber-600">Due today</span>
                          ) : (
                            <span className="text-[10px] text-slate-400">In {diffDays} days</span>
                          )}
                        </td>

                        {/* Amount Due */}
                        <td className="px-6 py-4 text-right">
                          <span className="font-mono text-sm font-black text-slate-900 tabular-nums">
                            ${inv.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </span>
                          {inv.tax > 0 && (
                            <span className="block text-[10px] text-slate-400">
                              incl. ${inv.tax} tax
                            </span>
                          )}
                        </td>

                        {/* Status Badge with Luminous Glow */}
                        <td className="px-5 py-4">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 shadow-2xs">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Paid
                            </span>
                          ) : isOverdue ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/80 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-800 shadow-2xs">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
                              Overdue
                            </span>
                          ) : isCancelled ? (
                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 line-through">
                              Cancelled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 shadow-2xs">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              Pending
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {!isPaid && !isCancelled && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPaymentInvoice(inv)}
                                className="h-7.5 cursor-pointer rounded-lg border-emerald-200 bg-emerald-50/60 px-2.5 text-xs font-bold text-emerald-800 shadow-2xs hover:bg-emerald-100"
                              >
                                Record Pay
                              </Button>
                            )}

                            {/* Quick Hosted Link Copy */}
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Copy hosted pay link"
                              onClick={async () => {
                                const payUrl = `https://flowpilot.app/pay/tok_${inv.id.slice(0, 10)}`;
                                await navigator.clipboard.writeText(payUrl);
                                setCopiedPayLinkId(inv.id);
                                setTimeout(() => setCopiedPayLinkId(null), 1800);
                              }}
                              className="h-7.5 w-7.5 cursor-pointer rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-700"
                            >
                              {copiedPayLinkId === inv.id ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Share2 className="h-3.5 w-3.5" />
                              )}
                            </Button>

                            <Button
                              size="icon"
                              variant="ghost"
                              title="Print statement / Export PDF"
                              onClick={() => setPrintInvoice(inv)}
                              className="h-7.5 w-7.5 cursor-pointer rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800"
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </Button>

                            <Button
                              size="icon"
                              variant="ghost"
                              title="Open Quick-Peek Drawer"
                              onClick={() => setDrawerInvoice(inv)}
                              className="h-7.5 w-7.5 cursor-pointer rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Floating Bulk Command Island (Linear / Superhuman Level) */}
      <AnimatePresence>
        {selectedInvoiceIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 450, damping: 32 }}
            className="fixed right-3 bottom-5 left-3 z-40 flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/95 p-3.5 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur-xl sm:right-auto sm:bottom-7 sm:left-1/2 sm:-translate-x-1/2 sm:flex-row sm:gap-4 sm:px-5 sm:py-3"
          >
            <div className="flex w-full items-center justify-between gap-2.5 sm:w-auto sm:border-r sm:border-slate-700 sm:pr-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                  {selectedInvoiceIds.size}
                </span>
                <div className="text-xs">
                  <p className="font-bold text-white">Statements Selected</p>
                  <p className="font-mono text-[11px] text-slate-400">
                    Total: $
                    {selectedTotalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoiceIds(new Set())}
                className="cursor-pointer text-xs font-semibold text-slate-400 underline underline-offset-4 hover:text-white sm:hidden"
              >
                Deselect
              </button>
            </div>

            <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto sm:flex-nowrap">
              {selectedInvoicesList.some(
                (i) => i.status !== "PAID" && i.status !== "CANCELLED"
              ) && (
                <Button
                  size="sm"
                  onClick={() => {
                    const firstPending = selectedInvoicesList.find(
                      (i) => i.status !== "PAID" && i.status !== "CANCELLED"
                    );
                    if (firstPending) setPaymentInvoice(firstPending);
                  }}
                  className="h-8 flex-1 gap-1.5 rounded-xl bg-emerald-600 px-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 sm:flex-none"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Settle Selected</span>
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (selectedInvoicesList[0]) setPrintInvoice(selectedInvoicesList[0]);
                }}
                className="h-8 flex-1 gap-1.5 rounded-xl border-slate-700 bg-slate-800 px-3 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white sm:flex-none"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Export / Print</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  const links = selectedInvoicesList
                    .map(
                      (i) =>
                        `Statement #${i.invoiceNumber}: https://flowpilot.app/pay/tok_${i.id.slice(0, 10)}`
                    )
                    .join("\n");
                  await navigator.clipboard.writeText(links);
                  alert("All selected client payment links copied to clipboard!");
                }}
                className="h-8 flex-1 gap-1.5 rounded-xl border-slate-700 bg-slate-800 px-3 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white sm:flex-none"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Links</span>
              </Button>

              <button
                type="button"
                onClick={() => setSelectedInvoiceIds(new Set())}
                className="ml-2 hidden cursor-pointer text-xs font-semibold text-slate-400 underline underline-offset-4 hover:text-white sm:inline"
              >
                Deselect All
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Cheat Sheet Dialog */}
      <Dialog open={isShortcutModalOpen} onOpenChange={setIsShortcutModalOpen}>
        <DialogContent className="max-w-md rounded-3xl border-slate-200 bg-white p-6 shadow-2xl">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Keyboard className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  Power-User Keyboard Shortcuts
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Navigate FlowPilot Cash Ledger with lightning speed.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 py-1">
              <span className="font-medium text-slate-600">Issue New Invoice</span>
              <kbd className="rounded border border-slate-200 bg-slate-100 px-2 py-1 font-mono font-bold text-slate-800 shadow-2xs">
                N
              </kbd>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 py-1">
              <span className="font-medium text-slate-600">Focus Search Input</span>
              <kbd className="rounded border border-slate-200 bg-slate-100 px-2 py-1 font-mono font-bold text-slate-800 shadow-2xs">
                /
              </kbd>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 py-1">
              <span className="font-medium text-slate-600">Clear Selection / Close Drawer</span>
              <kbd className="rounded border border-slate-200 bg-slate-100 px-2 py-1 font-mono font-bold text-slate-800 shadow-2xs">
                Esc
              </kbd>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="font-medium text-slate-600">Toggle Shortcuts Cheat Sheet</span>
              <kbd className="rounded border border-slate-200 bg-slate-100 px-2 py-1 font-mono font-bold text-slate-800 shadow-2xs">
                ?
              </kbd>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modals & Slide-over Drawers */}
      <InvoiceQuickPeekDrawer
        invoice={drawerInvoice}
        isOpen={Boolean(drawerInvoice)}
        onClose={() => setDrawerInvoice(null)}
        onOpenRecordPayment={(inv) => {
          setDrawerInvoice(null);
          setPaymentInvoice(inv);
        }}
        onOpenPrintModal={(inv) => {
          setPrintInvoice(inv);
        }}
        organizationId={organizationId}
      />

      <InvoiceBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        organizationId={organizationId}
      />

      <RecordPaymentModal
        invoice={paymentInvoice}
        isOpen={Boolean(paymentInvoice)}
        onClose={() => setPaymentInvoice(null)}
        organizationId={organizationId}
      />

      <InvoicePrintModal
        invoice={printInvoice}
        isOpen={Boolean(printInvoice)}
        onClose={() => setPrintInvoice(null)}
        organizationName={organizationName || "FlowPilot Operations"}
      />
    </div>
  );
}

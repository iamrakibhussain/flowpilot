"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  CalendarPlus,
  CreditCard,
  Edit3,
  Archive,
  RefreshCw,
  Sparkles,
  Crown,
  Copy,
  Check,
  ShieldCheck,
  FileText,
  User,
  Activity,
  History,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWorkspaceSession } from "@/features/organizations/use-workspace-session";
import { useDashboardModals } from "@/components/dashboard/modals/dashboard-modal-context";
import { useCustomer, useAddCustomerNote } from "@/features/customers/use-customers";
import { EditCustomerModal } from "@/components/dashboard/modals/edit-customer-modal";
import { ArchiveCustomerDialog } from "@/components/dashboard/modals/archive-customer-dialog";
import { calculateCustomerHealth } from "@/features/customers/customer-health";
import type { CustomerStatusType } from "@/features/customers/types";

interface ActivityEvent {
  id: string;
  type: "invoice" | "appointment" | "note" | "onboarding";
  title: string;
  description?: string;
  date: string;
  badge?: string;
  badgeStyle?: string;
  amount?: string;
  author?: string;
}

/**
 * Generates an executive-grade gradient tailored to the customer name hash
 */
function getAvatarGradient(name: string): string {
  const gradients = [
    "from-blue-600 via-indigo-600 to-violet-700 shadow-blue-500/25",
    "from-indigo-600 via-purple-600 to-pink-600 shadow-purple-500/25",
    "from-violet-600 via-fuchsia-600 to-rose-600 shadow-rose-500/25",
    "from-emerald-600 via-teal-600 to-cyan-700 shadow-emerald-500/25",
    "from-cyan-600 via-blue-600 to-indigo-700 shadow-cyan-500/25",
    "from-amber-500 via-orange-600 to-rose-600 shadow-orange-500/25",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

export default function CustomerProfileDetailPage() {
  const params = useParams();
  const customerId = String(params?.id ?? "");
  const router = useRouter();

  const { organizationName, isLoading: isSessionLoading } = useWorkspaceSession();
  const { openModal } = useDashboardModals();

  const [activeTab, setActiveTab] = React.useState<
    "overview" | "timeline" | "appointments" | "invoices" | "notes"
  >("overview");
  const [noteContent, setNoteContent] = React.useState("");
  const [noteSuccess, setNoteSuccess] = React.useState(false);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = React.useState(false);
  const [archiveMode, setArchiveMode] = React.useState<"archive" | "reactivate">("archive");

  // Copy toast state
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const handleCopy = (text: string, key: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const {
    data: customer,
    isLoading: isCustomerLoading,
    isPending: isCustomerPending,
    isError,
    refetch,
  } = useCustomer(customerId);
  const addNoteMutation = useAddCustomerNote(customerId);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || addNoteMutation.isPending) return;

    try {
      await addNoteMutation.mutateAsync(noteContent.trim());
      setNoteContent("");
      setNoteSuccess(true);
      setTimeout(() => setNoteSuccess(false), 3000);
    } catch {
      // Handled by error feedback
    }
  };

  // Prevent flashing error states while queries or sessions are settling
  const isInitialLoading =
    isSessionLoading || isCustomerLoading || (isCustomerPending && !isError && !customer);

  // Chronological Unified 360° Activity Stream
  const activityEvents = React.useMemo<ActivityEvent[]>(() => {
    if (!customer) return [];
    const events: ActivityEvent[] = [];

    // Invoices
    customer.invoices.forEach((inv) => {
      events.push({
        id: `inv-${inv.id}`,
        type: "invoice",
        title: `Invoice #${inv.invoiceNumber} (${inv.itemsCount} line items)`,
        description: `Payment terms: Due ${new Date(inv.dueDate).toLocaleDateString()}`,
        date: inv.issueDate,
        badge: inv.status,
        badgeStyle:
          inv.status === "PAID"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : inv.status === "OVERDUE"
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-amber-200 bg-amber-50 text-amber-700",
        amount: inv.total,
      });
    });

    // Appointments
    customer.appointments.forEach((apt) => {
      events.push({
        id: `apt-${apt.id}`,
        type: "appointment",
        title: apt.title,
        description: `${apt.durationMinutes} mins${apt.serviceName ? ` • ${apt.serviceName}` : ""}${apt.staffMemberName ? ` • Specialist: ${apt.staffMemberName}` : ""}`,
        date: apt.scheduledAt,
        badge: apt.status,
        badgeStyle:
          apt.status === "COMPLETED"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-blue-200 bg-blue-50 text-blue-700",
      });
    });

    // Staff Notes
    customer.parsedNotes.forEach((note) => {
      events.push({
        id: `note-${note.id}`,
        type: "note",
        title: `Staff Memo by ${note.authorName}`,
        description: note.content,
        date: note.createdAt,
        author: note.authorName,
        badge: "Internal Memo",
        badgeStyle: "border-slate-200 bg-slate-50 text-slate-600",
      });
    });

    // Account Onboarding Milestone
    events.push({
      id: `onboard-${customer.id}`,
      type: "onboarding",
      title: "Account Registered & Provisioned",
      description: `Client record onboarded into PostgreSQL workspace under ${organizationName}`,
      date: customer.createdAt,
      badge: "Workspace Milestone",
      badgeStyle: "border-purple-200 bg-purple-50 text-purple-700",
    });

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [customer, organizationName]);

  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-48 animate-pulse rounded-lg bg-slate-200/80" />
        <div className="h-48 w-full animate-pulse rounded-3xl bg-slate-100/90" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100/80" />
          ))}
        </div>
        <div className="h-96 w-full animate-pulse rounded-3xl bg-slate-100/60" />
      </div>
    );
  }

  if (isError || (!isInitialLoading && !customer)) {
    return (
      <div className="relative flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white/90 p-12 text-center shadow-sm backdrop-blur-xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 shadow-inner">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-xl font-extrabold tracking-tight text-slate-900">
          Client Profile Not Found
        </h2>
        <p className="mt-1.5 max-w-md text-xs text-slate-500">
          The requested client record does not exist or has been archived outside of your active
          multi-tenant organization partition.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard/customers")}
          className="mt-6 cursor-pointer rounded-xl border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Return to CRM Directory
        </Button>
      </div>
    );
  }

  const initials = customer.name
    ? customer.name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "CU";

  const invoicedVal = Number(customer.totalInvoiced?.replace(/[^0-9.-]+/g, "")) || 0;
  const paidVal = Number(customer.totalPaid?.replace(/[^0-9.-]+/g, "")) || 0;
  const outstandingVal = Number(customer.outstandingBalance?.replace(/[^0-9.-]+/g, "")) || 0;
  const settlementRate =
    invoicedVal > 0 ? Math.min(100, Math.round((paidVal / invoicedVal) * 100)) : 100;
  const isHighValue =
    paidVal >= 1000 || (customer.tags && customer.tags.some((t) => t.toLowerCase() === "vip"));

  const health = calculateCustomerHealth(customer);

  const statusBadgeStyle = (status: CustomerStatusType) => {
    switch (status) {
      case "ACTIVE":
        return {
          badge: "border-emerald-200/80 bg-emerald-50/90 text-emerald-700",
          beacon: "bg-emerald-500",
          ping: true,
          label: "Active Account",
        };
      case "LEAD":
        return {
          badge: "border-blue-200/80 bg-blue-50/90 text-blue-700",
          beacon: "bg-blue-500",
          ping: false,
          label: "Sales Prospect",
        };
      case "INACTIVE":
        return {
          badge: "border-slate-200/80 bg-slate-100 text-slate-600",
          beacon: "bg-slate-400",
          ping: false,
          label: "Archived Record",
        };
      default:
        return {
          badge: "border-slate-200 bg-slate-50 text-slate-600",
          beacon: "bg-slate-400",
          ping: false,
          label: status,
        };
    }
  };

  const statusMeta = statusBadgeStyle(customer.status);

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
    <div className="relative w-full max-w-full min-w-0 space-y-6 scroll-smooth pb-16 sm:space-y-7">
      {/* Linear Atmospheric Mesh Glow */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(59,130,246,0.08),transparent_70%),radial-gradient(ellipse_60%_50%_at_100%_35%,rgba(99,102,241,0.05),transparent_60%)]"
        aria-hidden="true"
      />

      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/customers"
          className="group hover:text-primary inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition-colors"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200/80 bg-white/80 shadow-2xs transition-transform group-hover:-translate-x-0.5">
            <ArrowLeft className="h-3.5 w-3.5" />
          </div>
          <span>Back to Customers Directory</span>
        </Link>

        <div className="hidden items-center gap-2 text-[11px] text-slate-400 sm:flex">
          <span className="font-medium text-slate-600">{organizationName}</span>
          <span>/</span>
          <span>CRM Client #</span>
          <span className="font-mono text-slate-700">{customer.id.slice(0, 8)}...</span>
        </div>
      </div>

      {/* 360° Executive Dossier Identity Header Card */}
      <Card className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 p-4 shadow-[0_16px_36px_-12px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-7">
        {/* Subtle Ambient Decorative Glow Spot */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="flex flex-col gap-5 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Identity & Basic Dossier */}
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
            {/* Multi-Tone Gradient Avatar with Glow */}
            <div className="relative shrink-0">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-xl font-black text-white shadow-xl sm:h-20 sm:w-20 sm:text-2xl ${getAvatarGradient(
                  customer.name
                )}`}
              >
                {initials}
              </div>
              {/* VIP Crown Floating Indicator */}
              {isHighValue && (
                <div
                  className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-md shadow-amber-500/30 sm:h-7 sm:w-7"
                  title="VIP High-Value Client"
                >
                  <Crown className="h-3 w-3 fill-amber-950 sm:h-3.5 sm:w-3.5" />
                </div>
              )}
            </div>

            {/* Profile Typography & Pills */}
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <h1 className="text-xl font-extrabold tracking-tight break-words text-slate-900 sm:text-2xl lg:text-3xl">
                  {customer.name}
                </h1>

                {/* Live Status Beacon Pill */}
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold shadow-2xs ${statusMeta.badge}`}
                >
                  <span className="relative flex h-2 w-2">
                    {statusMeta.ping && (
                      <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                    )}
                    <span
                      className={`relative inline-flex h-2 w-2 rounded-full ${statusMeta.beacon}`}
                    />
                  </span>
                  <span>{statusMeta.label}</span>
                </span>

                {/* Client Health Radar Pill */}
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-extrabold shadow-2xs ${health.badgeStyle}`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: health.ringColor }}
                  />
                  <span>
                    Score {health.score} • {health.tierLabel}
                  </span>
                </span>

                {/* High Value Badge */}
                {isHighValue && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-purple-200/90 bg-gradient-to-r from-purple-50 to-pink-50 px-2.5 py-1 text-[11px] font-bold text-purple-700 shadow-2xs">
                    <Sparkles className="h-3 w-3 fill-purple-600 text-purple-600" />
                    High-Value Portfolio
                  </span>
                )}
              </div>

              {/* Company & Meta Subline */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 sm:gap-3">
                {customer.company ? (
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Building2 className="text-primary h-3.5 w-3.5" />
                    <span>{customer.company}</span>
                  </div>
                ) : (
                  <span className="text-slate-400 italic">Individual Account</span>
                )}

                <span className="text-slate-300">•</span>

                <div className="flex items-center gap-1.5 text-slate-500">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    Client since{" "}
                    {new Date(customer.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Segment Tags */}
              {customer.tags && customer.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {customer.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-lg border px-2.5 py-0.5 text-[11px] font-bold ${tagBadgeStyle(
                        tag
                      )}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 1-Click Interactive Contact Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs sm:gap-3">
                {/* Email with copy */}
                <button
                  type="button"
                  onClick={(e) => handleCopy(customer.email, "email", e)}
                  className="hover:border-primary/50 hover:text-primary group flex max-w-full cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50/80 px-2.5 py-1 text-slate-600 transition-all hover:bg-white"
                  title="Click to copy email address"
                >
                  <Mail className="group-hover:text-primary h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="max-w-[200px] truncate font-medium sm:max-w-none">
                    {customer.email}
                  </span>
                  {copiedKey === "email" ? (
                    <Check className="h-3 w-3 shrink-0 text-emerald-600" />
                  ) : (
                    <Copy className="h-3 w-3 shrink-0 text-slate-400 opacity-60 group-hover:opacity-100" />
                  )}
                </button>

                {/* Phone with copy */}
                {customer.phone && (
                  <button
                    type="button"
                    onClick={(e) => handleCopy(customer.phone!, "phone", e)}
                    className="hover:border-primary/50 hover:text-primary group flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50/80 px-2.5 py-1 text-slate-600 transition-all hover:bg-white"
                    title="Click to copy phone number"
                  >
                    <Phone className="group-hover:text-primary h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="font-medium">{customer.phone}</span>
                    {copiedKey === "phone" ? (
                      <Check className="h-3 w-3 shrink-0 text-emerald-600" />
                    ) : (
                      <Copy className="h-3 w-3 shrink-0 text-slate-400 opacity-60 group-hover:opacity-100" />
                    )}
                  </button>
                )}

                {/* Toast feedback if copied */}
                {copiedKey && (
                  <span className="animate-in fade-in inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Copied to clipboard
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contextual Executive Action Toolbar */}
          <div className="grid w-full grid-cols-2 gap-2 self-start sm:flex sm:w-auto sm:items-center sm:gap-2.5 lg:self-center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditModalOpen(true)}
              className="cursor-pointer justify-center rounded-xl border-slate-200/90 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
            >
              <Edit3 className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
              <span>Edit Record</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => openModal("appointment")}
              className="cursor-pointer justify-center rounded-xl border-blue-200/90 bg-blue-50/60 px-3 text-xs font-semibold text-blue-700 shadow-2xs hover:bg-blue-100/60"
            >
              <CalendarPlus className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
              <span>Book</span>
            </Button>

            <Button
              size="sm"
              onClick={() => openModal("invoice")}
              className="from-primary to-primary/90 hover:from-primary/95 hover:to-primary/85 cursor-pointer justify-center rounded-xl bg-gradient-to-r px-3.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20"
            >
              <CreditCard className="mr-1.5 h-3.5 w-3.5" />
              <span>Invoice</span>
            </Button>

            {customer.status !== "INACTIVE" ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setArchiveMode("archive");
                  setIsArchiveDialogOpen(true);
                }}
                className="cursor-pointer justify-center rounded-xl border border-rose-100 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 sm:border-0"
                title="Archive client record"
              >
                <Archive className="mr-1 h-3.5 w-3.5 sm:mr-0" />
                <span className="sm:hidden">Archive</span>
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setArchiveMode("reactivate");
                  setIsArchiveDialogOpen(true);
                }}
                className="cursor-pointer justify-center rounded-xl border border-emerald-100 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 sm:border-0"
                title="Reactivate client record"
              >
                <RefreshCw className="mr-1 h-3.5 w-3.5 sm:mr-0" />
                <span className="sm:hidden">Reactivate</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 4x Executive Financial & Engagement Telemetry KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {/* KPI 1: Lifetime Value (Gross Invoiced) */}
        <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-2xs backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              Lifetime Value (LTV)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-inner transition-transform group-hover:scale-105">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black tracking-tight text-slate-900 tabular-nums">
            {customer.totalInvoiced}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>Cumulative gross billing</span>
            <span className="font-semibold text-blue-600">{customer.invoicesCount} invoices</span>
          </div>
        </Card>

        {/* KPI 2: Total Settled / Reconciled */}
        <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-2xs backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              Total Settled
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-inner transition-transform group-hover:scale-105">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black tracking-tight text-slate-900 tabular-nums">
            {customer.totalPaid}
          </div>
          {/* Micro settlement recovery bar */}
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-[10px] font-medium text-slate-500">
              <span>Collection rate</span>
              <span className="font-bold text-emerald-700">{settlementRate}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                style={{ width: `${settlementRate}%` }}
              />
            </div>
          </div>
        </Card>

        {/* KPI 3: Outstanding Receivables */}
        <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-2xs backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              Outstanding Due
            </span>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl shadow-inner transition-transform group-hover:scale-105 ${
                outstandingVal > 0 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {outstandingVal > 0 ? <Clock className="h-4 w-4" /> : <Check className="h-4 w-4" />}
            </div>
          </div>
          <div
            className={`mt-3 text-2xl font-black tracking-tight tabular-nums ${
              outstandingVal > 0 ? "text-amber-600" : "text-slate-900"
            }`}
          >
            {customer.outstandingBalance}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            {outstandingVal > 0 ? (
              <span className="font-semibold text-amber-600">Pending collection</span>
            ) : (
              <span className="font-semibold text-emerald-600">All accounts clear ✓</span>
            )}
            <span className="text-slate-400">Receivables</span>
          </div>
        </Card>

        {/* KPI 4: Total Operational Sessions */}
        <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-2xs backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              Engagements
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-inner transition-transform group-hover:scale-105">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black tracking-tight text-slate-900 tabular-nums">
            {customer.appointmentsCount}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>Booked consultations</span>
            <span className="font-semibold text-indigo-600">Active</span>
          </div>
        </Card>
      </div>

      {/* Floating Modern Pill Dock Navigation with Unified Timeline Tab */}
      <div className="flex min-w-0 items-center justify-between border-b border-slate-200/80 pb-3">
        <div className="no-scrollbar flex w-full max-w-full items-center gap-1.5 overflow-x-auto rounded-2xl border border-slate-200/80 bg-slate-100/90 p-1.5 shadow-inner backdrop-blur-md sm:w-auto">
          {(
            [
              { key: "overview", label: "Dossier Overview", count: null },
              {
                key: "timeline",
                label: "360° Activity Stream",
                count: activityEvents.length,
              },
              {
                key: "appointments",
                label: "Appointments",
                count: customer.appointments.length,
              },
              { key: "invoices", label: "Invoices", count: customer.invoices.length },
              { key: "notes", label: "Staff Notes", count: customer.parsedNotes.length },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all sm:px-4 sm:py-2 ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm ring-1 shadow-slate-900/5 ring-slate-900/5"
                    : "text-slate-600 hover:bg-white/50 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`py-0.2 rounded-full px-1.5 text-[10px] font-black ${
                      isActive ? "bg-primary text-white" : "bg-slate-200/80 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="hidden shrink-0 items-center gap-2 text-xs text-slate-500 sm:flex">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span className="font-medium">Strict Multi-Tenant Isolated</span>
        </div>
      </div>

      {/* Tab 1: Overview & Details */}
      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Client & Contact Dossier Card (2 cols on large) */}
          <Card className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-2xs backdrop-blur-xl lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Client & Contact Dossier
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Primary operational contacts and verified database records
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="h-8 cursor-pointer rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50"
              >
                Edit Details
              </Button>
            </div>

            <div className="mt-4 divide-y divide-slate-100 text-xs">
              <div className="flex items-center justify-between py-3">
                <span className="font-medium text-slate-500">Full Name</span>
                <span className="font-bold text-slate-900">{customer.name}</span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="font-medium text-slate-500">Email Address</span>
                <button
                  type="button"
                  onClick={(e) => handleCopy(customer.email, "email-row", e)}
                  className="hover:text-primary flex cursor-pointer items-center gap-1.5 font-semibold text-slate-800 transition-colors"
                >
                  <span>{customer.email}</span>
                  {copiedKey === "email-row" ? (
                    <Check className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <Copy className="h-3 w-3 text-slate-400" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="font-medium text-slate-500">Phone Number</span>
                {customer.phone ? (
                  <button
                    type="button"
                    onClick={(e) => handleCopy(customer.phone!, "phone-row", e)}
                    className="hover:text-primary flex cursor-pointer items-center gap-1.5 font-semibold text-slate-800 transition-colors"
                  >
                    <span>{customer.phone}</span>
                    {copiedKey === "phone-row" ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <Copy className="h-3 w-3 text-slate-400" />
                    )}
                  </button>
                ) : (
                  <span className="text-slate-400 italic">Not provided</span>
                )}
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="font-medium text-slate-500">Company Affiliation</span>
                <span className="font-semibold text-slate-900">
                  {customer.company || "Individual Client Account"}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="font-medium text-slate-500">Billing Address</span>
                <span className="max-w-[240px] truncate text-right font-medium text-slate-800">
                  {customer.address || "No address on file"}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="font-medium text-slate-500">Account Onboarded</span>
                <span className="font-semibold text-slate-800">
                  {new Date(customer.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </div>
          </Card>

          {/* Client Relationship Health Radar Gauge Card */}
          <Card className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-2xs backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-600" />
                <CardTitle className="text-sm font-bold text-slate-900">Health Radar</CardTitle>
              </div>
              <span
                className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-bold ${health.badgeStyle}`}
              >
                Grade {health.grade}
              </span>
            </div>

            {/* Circular Gauge */}
            <div className="mt-5 flex flex-col items-center justify-center text-center">
              <div className="relative flex h-24 w-24 items-center justify-center">
                <svg className="h-24 w-24 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    strokeDasharray={`${health.score}, 100`}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke={health.ringColor}
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black text-slate-900 tabular-nums">
                    {health.score}
                  </span>
                  <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                    / 100
                  </span>
                </div>
              </div>

              <h4 className="mt-3 text-sm font-extrabold text-slate-900">{health.tierLabel}</h4>
              <p className="text-[11px] font-semibold text-slate-500">{health.velocityLabel}</p>
            </div>

            {/* Signals Checklist */}
            <div className="mt-5 space-y-2 border-t border-slate-100 pt-3 text-xs">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Velocity Factors
              </span>
              <div className="space-y-1.5">
                {health.signals.map((sig, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {sig.type === "positive" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    ) : sig.type === "warning" ? (
                      <Clock className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                    ) : (
                      <Activity className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                    )}
                    <span className="font-medium text-slate-700">{sig.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Unified 360° Chronological Activity Stream */}
      {activeTab === "timeline" && (
        <Card className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-2xs backdrop-blur-xl sm:p-7">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-inner">
                <History className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Unified 360° Touchpoints Timeline
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Complete chronological history of invoices, sessions, staff observations, and
                  account milestones
                </CardDescription>
              </div>
            </div>
            <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
              {activityEvents.length} Recorded Touchpoints
            </span>
          </div>

          <div className="relative mt-7 pl-6 before:absolute before:top-2 before:bottom-2 before:left-2.5 before:w-0.5 before:bg-slate-200">
            <div className="space-y-6">
              {activityEvents.map((event) => (
                <div key={event.id} className="group relative">
                  {/* Node Icon */}
                  <div className="absolute top-1 -left-[30px] flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-100 shadow-xs transition-transform group-hover:scale-110">
                    {event.type === "invoice" ? (
                      <CreditCard className="h-3 w-3 text-emerald-600" />
                    ) : event.type === "appointment" ? (
                      <Calendar className="h-3 w-3 text-blue-600" />
                    ) : event.type === "note" ? (
                      <FileText className="h-3 w-3 text-amber-600" />
                    ) : (
                      <UserPlus className="h-3 w-3 text-purple-600" />
                    )}
                  </div>

                  {/* Event Content Card */}
                  <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-2xs transition-all hover:border-slate-300">
                    <div className="flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{event.title}</span>
                        {event.badge && (
                          <span
                            className={`py-0.2 rounded-md border px-2 text-[10px] font-bold ${
                              event.badgeStyle ?? "border-slate-200 bg-slate-50 text-slate-600"
                            }`}
                          >
                            {event.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        {event.amount && (
                          <span className="font-black text-slate-900 tabular-nums">
                            {event.amount}
                          </span>
                        )}
                        <span>
                          {new Date(event.date).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                    </div>
                    {event.description && (
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Tab 3: Appointments */}
      {activeTab === "appointments" && (
        <Card className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-2xs backdrop-blur-xl">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Scheduled Engagements
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Past sessions, upcoming consultations, and operations appointments
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                asChild
                className="cursor-pointer rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Link href="/dashboard/calendar">
                  <Calendar className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                  <span>Open Calendar</span>
                </Link>
              </Button>
              <Button
                size="sm"
                onClick={() => openModal("appointment")}
                className="bg-primary hover:bg-primary/90 cursor-pointer rounded-xl text-xs font-semibold text-white shadow-md shadow-blue-500/20"
              >
                <CalendarPlus className="mr-1.5 h-3.5 w-3.5" />
                <span>Book Appointment</span>
              </Button>
            </div>
          </div>

          {customer.appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-inner">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-slate-900">
                No Appointments Scheduled Yet
              </h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500">
                Book client consultations, project kickoffs, or operations sessions directly linked
                to this customer record.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openModal("appointment")}
                className="mt-5 cursor-pointer rounded-xl border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
              >
                <CalendarPlus className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                <span>Schedule First Appointment</span>
              </Button>
            </div>
          ) : (
            <div className="mt-5 divide-y divide-slate-100">
              {customer.appointments.map((apt) => (
                <Link
                  key={apt.id}
                  href="/dashboard/calendar"
                  className="group -mx-3 flex flex-col gap-3 rounded-2xl px-3 py-4 text-xs transition-colors hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900">{apt.title}</p>
                      {apt.serviceName && (
                        <span className="rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {apt.serviceName}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-slate-500">
                      <span className="font-medium text-slate-700">
                        {new Date(apt.scheduledAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                      <span>•</span>
                      <span>{apt.durationMinutes} minutes duration</span>
                      {apt.staffMemberName && (
                        <>
                          <span>•</span>
                          <span className="font-medium text-indigo-700">
                            Specialist: {apt.staffMemberName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={`self-start text-[10px] font-bold sm:self-center ${
                      apt.status === "COMPLETED"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : apt.status === "CANCELLED"
                          ? "border-rose-200 bg-rose-50 text-rose-700"
                          : "border-blue-200 bg-blue-50 text-blue-700"
                    }`}
                  >
                    {apt.status}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab 4: Invoices */}
      {activeTab === "invoices" && (
        <Card className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-2xs backdrop-blur-xl">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Invoices & Cash Ledger
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Itemized bills, settlement status, and multi-currency payment records
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => openModal("invoice")}
              className="bg-primary hover:bg-primary/90 cursor-pointer rounded-xl text-xs font-semibold text-white shadow-md shadow-blue-500/20"
            >
              <CreditCard className="mr-1.5 h-3.5 w-3.5" />
              <span>Issue New Invoice</span>
            </Button>
          </div>

          {customer.invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-inner">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-slate-900">
                No Invoices Issued for this Client
              </h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500">
                Generate professional itemized invoices to track payments and calculate real
                Lifetime Value.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openModal("invoice")}
                className="mt-5 cursor-pointer rounded-xl border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
              >
                <CreditCard className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                <span>Issue First Invoice</span>
              </Button>
            </div>
          ) : (
            <div className="mt-5 divide-y divide-slate-100">
              {customer.invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex flex-col gap-3 py-4 text-xs sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-extrabold text-slate-900">Invoice #{inv.invoiceNumber}</p>
                      <span className="rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {inv.itemsCount} line {inv.itemsCount === 1 ? "item" : "items"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-slate-500">
                      <span>Issued: {new Date(inv.issueDate).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Due: {new Date(inv.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-900 tabular-nums">
                      {inv.total}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold ${
                        inv.status === "PAID"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : inv.status === "OVERDUE"
                            ? "border-rose-200 bg-rose-50 text-rose-700"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                      }`}
                    >
                      {inv.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab 5: Internal Staff Notes */}
      {activeTab === "notes" && (
        <div className="space-y-6">
          {/* Note Composer Card */}
          <Card className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-2xs backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Add Internal Staff Observation
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Private operational notes, client requirements, or follow-up memos. Confidential
                  to your team.
                </CardDescription>
              </div>
              <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                🔒 Internal Only
              </span>
            </div>

            <form onSubmit={handleAddNote} className="mt-4 space-y-3.5">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Type your operational observation or client preference here..."
                rows={3}
                className="focus:border-primary focus:ring-primary/10 w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs text-slate-900 shadow-2xs transition-colors outline-none focus:bg-white focus:ring-4"
              />

              <div className="flex items-center justify-between">
                {noteSuccess && (
                  <span className="animate-in fade-in flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" /> Note saved successfully!
                  </span>
                )}
                <div className="ml-auto">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!noteContent.trim() || addNoteMutation.isPending}
                    className="bg-primary hover:bg-primary/90 cursor-pointer rounded-xl px-4 text-xs font-semibold text-white shadow-md shadow-blue-500/20"
                  >
                    <Send className="mr-1.5 h-3.5 w-3.5" />
                    <span>{addNoteMutation.isPending ? "Synchronizing..." : "Post Note"}</span>
                  </Button>
                </div>
              </div>
            </form>
          </Card>

          {/* Chronological Notes History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                Chronological Notes Timeline ({customer.parsedNotes.length})
              </h3>
            </div>

            {customer.parsedNotes.length === 0 ? (
              <Card className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 text-center backdrop-blur-xl">
                <p className="text-xs text-slate-400">
                  No internal staff notes recorded yet for this client profile.
                </p>
              </Card>
            ) : (
              customer.parsedNotes.map((note) => (
                <Card
                  key={note.id}
                  className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-2xs transition-all hover:border-slate-300"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-xs font-extrabold text-blue-700">
                        {note.authorName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-900">{note.authorName}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(note.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed whitespace-pre-wrap text-slate-700">
                    {note.content}
                  </p>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      <EditCustomerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        customer={customer}
        onSuccess={() => {
          refetch();
          setIsEditModalOpen(false);
        }}
      />

      {/* Archive / Reactivate Customer Dialog */}
      <ArchiveCustomerDialog
        isOpen={isArchiveDialogOpen}
        onClose={() => setIsArchiveDialogOpen(false)}
        customer={customer}
        mode={archiveMode}
        onSuccess={() => {
          refetch();
          setIsArchiveDialogOpen(false);
        }}
      />
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import {
  X,
  ExternalLink,
  Building2,
  CreditCard,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Crown,
  Copy,
  Check,
  Send,
  Edit3,
  Activity,
  ChevronRight,
  FolderKanban,
} from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCustomer, useAddCustomerNote } from "@/features/customers/use-customers";
import { calculateCustomerHealth } from "@/features/customers/customer-health";
import type { CustomerDetailResponse } from "@/features/customers/types";

export interface CustomerQuickPeekDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string | null;
  onEditCustomer?: (customer: CustomerDetailResponse) => void;
  onBookAppointment?: () => void;
  onCreateInvoice?: () => void;
}

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

export function CustomerQuickPeekDrawer({
  isOpen,
  onClose,
  customerId,
  onEditCustomer,
  onBookAppointment,
  onCreateInvoice,
}: CustomerQuickPeekDrawerProps) {
  const { data: customer, isLoading } = useCustomer(customerId ?? "");
  const addNoteMutation = useAddCustomerNote(customerId ?? "");

  const [activeTab, setActiveTab] = React.useState<
    "health" | "invoices" | "appointments" | "notes"
  >("health");
  const [quickNote, setQuickNote] = React.useState("");
  const [noteSuccess, setNoteSuccess] = React.useState(false);
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

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim() || addNoteMutation.isPending || !customerId) return;
    try {
      await addNoteMutation.mutateAsync(quickNote.trim());
      setQuickNote("");
      setNoteSuccess(true);
      setTimeout(() => setNoteSuccess(false), 2500);
    } catch {
      // Handled by query mutation
    }
  };

  if (!customerId) return null;

  const initials = customer?.name
    ? customer.name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "CU";

  const health = customer ? calculateCustomerHealth(customer) : null;
  const paidVal = customer ? Number(customer.totalPaid?.replace(/[^0-9.-]+/g, "")) || 0 : 0;
  const isHighValue =
    paidVal >= 1000 || (customer?.tags && customer.tags.some((t) => t.toLowerCase() === "vip"));

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        {/* Frosted Backdrop */}
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-300" />

        {/* Sliding Panel */}
        <DialogPrimitive.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-xl flex-col border-l border-border/80 bg-card text-foreground shadow-2xl backdrop-blur-2xl duration-300 focus:outline-none">
          {/* Header */}
          <div className="relative border-b border-border/80 p-5 sm:p-6">
            {/* Ambient spot blur */}
            <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-blue-500/10 blur-2xl" />

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-bold text-white shadow-md ${
                    customer ? getAvatarGradient(customer.name) : "bg-muted"
                  }`}
                >
                  {initials}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <DialogPrimitive.Title className="truncate text-lg font-bold tracking-tight text-foreground">
                      {customer?.name ?? "Loading Client..."}
                    </DialogPrimitive.Title>

                    {customer && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                          customer.status === "ACTIVE"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : customer.status === "LEAD"
                              ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300"
                              : "border-border/80 bg-muted text-muted-foreground"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            customer.status === "ACTIVE"
                              ? "bg-emerald-500"
                              : customer.status === "LEAD"
                                ? "bg-blue-500"
                                : "bg-muted-foreground"
                          }`}
                        />
                        {customer.status}
                      </span>
                    )}

                    {isHighValue && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/80 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
                        <Crown className="h-2.5 w-2.5 fill-amber-700 text-amber-700 dark:fill-amber-300 dark:text-amber-300" />
                        VIP
                      </span>
                    )}
                  </div>

                  {customer?.company ? (
                    <div className="flex items-center gap-1.5 pt-0.5 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3 text-muted-foreground/70" />
                      <span className="font-semibold text-foreground">{customer.company}</span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground italic">Individual Account</p>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-border/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Close drawer (Esc)"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </div>

            {/* Quick Action Toolbar */}
            {customer && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Link
                  href={`/dashboard/customers/${customer.id}`}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold shadow-xs transition-transform active:scale-95"
                >
                  <span>Full 360° Profile</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (onEditCustomer) onEditCustomer(customer);
                  }}
                  className="h-8 cursor-pointer rounded-xl border-border/80 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  <Edit3 className="mr-1 h-3 w-3 text-muted-foreground" />
                  <span>Edit</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (onBookAppointment) onBookAppointment();
                  }}
                  className="h-8 cursor-pointer rounded-xl border-blue-200/80 bg-blue-50/50 text-xs font-semibold text-blue-700 hover:bg-blue-100/50 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300"
                >
                  <CalendarPlus className="mr-1 h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span>Book</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (onCreateInvoice) onCreateInvoice();
                  }}
                  className="h-8 cursor-pointer rounded-xl border-emerald-200/80 bg-emerald-50/50 text-xs font-semibold text-emerald-700 hover:bg-emerald-100/50 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
                >
                  <CreditCard className="mr-1 h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Invoice</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="h-8 cursor-pointer rounded-xl border-amber-200/80 bg-amber-50/50 text-xs font-semibold text-amber-700 hover:bg-amber-100/50 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300"
                >
                  <Link href={`/dashboard/projects?customerId=${customer.id}`}>
                    <FolderKanban className="mr-1 h-3 w-3 text-amber-600 dark:text-amber-400" />
                    <span>Projects</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Drawer Body with Custom Scroll */}
          <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
            {isLoading || !customer ? (
              <div className="space-y-4">
                <div className="h-24 animate-pulse rounded-2xl bg-muted" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-16 animate-pulse rounded-xl bg-muted" />
                  <div className="h-16 animate-pulse rounded-xl bg-muted" />
                </div>
                <div className="h-44 animate-pulse rounded-2xl bg-muted" />
              </div>
            ) : (
              <>
                {/* 4x Compact Telemetry KPI Tiles */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-2xl border border-border/80 bg-muted/40 p-3 shadow-2xs">
                    <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                      LTV
                    </span>
                    <p className="mt-1 text-sm font-bold tracking-tight text-foreground tabular-nums">
                      {customer.totalInvoiced}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/80 bg-muted/40 p-3 shadow-2xs">
                    <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                      Settled
                    </span>
                    <p className="mt-1 text-sm font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {customer.totalPaid}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/80 bg-muted/40 p-3 shadow-2xs">
                    <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                      Due
                    </span>
                    <p className="mt-1 text-sm font-bold tracking-tight text-amber-600 dark:text-amber-400 tabular-nums">
                      {customer.outstandingBalance}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/80 bg-muted/40 p-3 shadow-2xs">
                    <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                      Sessions
                    </span>
                    <p className="mt-1 text-sm font-bold tracking-tight text-indigo-600 dark:text-indigo-400 tabular-nums">
                      {customer.appointmentsCount}
                    </p>
                  </div>
                </div>

                {/* Contact Quick Chips */}
                <div className="space-y-2 rounded-2xl border border-border/80 bg-card p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-muted-foreground">Direct Email:</span>
                    <button
                      type="button"
                      onClick={(e) => handleCopy(customer.email, "drawer-email", e)}
                      className="hover:text-primary flex cursor-pointer items-center gap-1.5 font-semibold text-foreground transition-colors"
                    >
                      <span>{customer.email}</span>
                      {copiedKey === "drawer-email" ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3 text-muted-foreground" />
                      )}
                    </button>
                  </div>

                  {customer.phone && (
                    <div className="flex items-center justify-between border-t border-border/60 pt-2 text-xs">
                      <span className="font-medium text-muted-foreground">Direct Phone:</span>
                      <button
                        type="button"
                        onClick={(e) => handleCopy(customer.phone!, "drawer-phone", e)}
                        className="hover:text-primary flex cursor-pointer items-center gap-1.5 font-semibold text-foreground transition-colors"
                      >
                        <span>{customer.phone}</span>
                        {copiedKey === "drawer-phone" ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  )}

                  {customer.address && (
                    <div className="flex items-center justify-between border-t border-border/60 pt-2 text-xs">
                      <span className="font-medium text-muted-foreground">Address:</span>
                      <span className="max-w-[240px] truncate font-medium text-foreground">
                        {customer.address}
                      </span>
                    </div>
                  )}
                </div>

                {/* Mini Segmented Tabs */}
                <div className="no-scrollbar flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-border/80 bg-muted/60 p-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveTab("health")}
                    className={`flex-1 shrink-0 cursor-pointer rounded-lg px-2.5 py-1.5 text-center whitespace-nowrap transition-all ${
                      activeTab === "health"
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Health Radar
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("invoices")}
                    className={`flex-1 shrink-0 cursor-pointer rounded-lg px-2.5 py-1.5 text-center whitespace-nowrap transition-all ${
                      activeTab === "invoices"
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Invoices ({customer.invoices.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("appointments")}
                    className={`flex-1 shrink-0 cursor-pointer rounded-lg px-2.5 py-1.5 text-center whitespace-nowrap transition-all ${
                      activeTab === "appointments"
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Sessions ({customer.appointments.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("notes")}
                    className={`flex-1 shrink-0 cursor-pointer rounded-lg px-2.5 py-1.5 text-center whitespace-nowrap transition-all ${
                      activeTab === "notes"
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Notes ({customer.parsedNotes.length})
                  </button>
                </div>

                {/* Tab 1: Health Radar Breakdown */}
                {activeTab === "health" && health && (
                  <div className="space-y-4">
                    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                            Account Health Score
                          </span>
                          <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
                              {health.score}
                            </span>
                            <span className="text-xs font-semibold text-muted-foreground">/ 100</span>
                            <span
                              className={`ml-2 inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-bold ${health.badgeStyle}`}
                            >
                              Grade {health.grade} • {health.tierLabel}
                            </span>
                          </div>
                        </div>

                        {/* Circular Radar Ring */}
                        <div className="relative flex h-16 w-16 items-center justify-center">
                          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-muted/60"
                              strokeWidth="3.5"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              strokeDasharray={`${health.score}, 100`}
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              stroke={health.ringColor}
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute text-[11px] font-bold text-foreground">
                            {health.velocityLabel.split(" ")[0]}
                          </div>
                        </div>
                      </div>

                      {/* Signals Checklist */}
                      <div className="mt-4 space-y-2 border-t border-border/60 pt-3">
                        <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                          Operational Velocity Signals
                        </span>
                        <div className="space-y-1.5">
                          {health.signals.map((sig, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              {sig.type === "positive" ? (
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                              ) : sig.type === "warning" ? (
                                <Clock className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                              ) : (
                                <Activity className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                              )}
                              <span className="font-medium text-foreground">{sig.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Recent Invoices */}
                {activeTab === "invoices" && (
                  <div className="space-y-3">
                    {customer.invoices.length === 0 ? (
                      <p className="py-8 text-center text-xs text-muted-foreground">
                        No invoices generated yet for this client.
                      </p>
                    ) : (
                      customer.invoices.slice(0, 5).map((inv) => (
                        <div
                          key={inv.id}
                          className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-3 text-xs shadow-2xs"
                        >
                          <div>
                            <p className="font-semibold text-foreground">Invoice #{inv.invoiceNumber}</p>
                            <p className="text-[11px] text-muted-foreground">
                              Issued: {new Date(inv.issueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="font-bold tracking-tight text-foreground tabular-nums">
                              {inv.total}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-semibold ${
                                inv.status === "PAID"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
                                  : inv.status === "OVERDUE"
                                    ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
                                    : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300"
                              }`}
                            >
                              {inv.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Tab 3: Appointments */}
                {activeTab === "appointments" && (
                  <div className="space-y-3">
                    {customer.appointments.length === 0 ? (
                      <p className="py-8 text-center text-xs text-muted-foreground">
                        No appointments booked yet for this client.
                      </p>
                    ) : (
                      customer.appointments.slice(0, 5).map((apt) => (
                        <div
                          key={apt.id}
                          className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-3 text-xs shadow-2xs"
                        >
                          <div>
                            <p className="font-semibold text-foreground">{apt.title}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {new Date(apt.scheduledAt).toLocaleString(undefined, {
                                dateStyle: "short",
                                timeStyle: "short",
                              })}{" "}
                              • {apt.durationMinutes}m
                            </p>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-semibold">
                            {apt.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Tab 4: Internal Notes + Quick Composer */}
                {activeTab === "notes" && (
                  <div className="space-y-4">
                    {/* Quick Composer */}
                    <form onSubmit={handleAddNote} className="space-y-2.5">
                      <textarea
                        value={quickNote}
                        onChange={(e) => setQuickNote(e.target.value)}
                        placeholder="Add quick operational note..."
                        rows={2}
                        className="w-full rounded-xl border border-border/80 bg-muted/30 p-2.5 text-xs text-foreground placeholder:text-muted-foreground shadow-2xs outline-none focus:bg-background focus:ring-2 focus:ring-primary/20"
                      />
                      <div className="flex items-center justify-between">
                        {noteSuccess && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <Check className="h-3 w-3" /> Saved!
                          </span>
                        )}
                        <Button
                          type="submit"
                          size="sm"
                          disabled={!quickNote.trim() || addNoteMutation.isPending}
                          className="ml-auto h-7 rounded-lg text-xs font-semibold"
                        >
                          <Send className="mr-1 h-3 w-3" />
                          <span>{addNoteMutation.isPending ? "Posting..." : "Post Note"}</span>
                        </Button>
                      </div>
                    </form>

                    {/* Notes List */}
                    <div className="space-y-2 pt-2">
                      {customer.parsedNotes.length === 0 ? (
                        <p className="py-6 text-center text-xs text-muted-foreground">
                          No staff notes recorded yet.
                        </p>
                      ) : (
                        customer.parsedNotes.slice(0, 4).map((note) => (
                          <div
                            key={note.id}
                            className="rounded-xl border border-border/80 bg-muted/30 p-3 text-xs"
                          >
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                              <span className="font-semibold text-foreground">{note.authorName}</span>
                              <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="mt-1.5 whitespace-pre-wrap text-foreground/90">
                              {note.content}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Drawer Footer with Quick Link */}
          {customer && (
            <div className="flex items-center justify-between border-t border-border/80 bg-muted/30 p-4 text-xs">
              <span className="font-mono text-[11px] text-muted-foreground">
                UUID: {customer.id.slice(0, 13)}...
              </span>
              <Link
                href={`/dashboard/customers/${customer.id}`}
                className="hover:text-primary flex items-center gap-1 font-semibold text-foreground"
              >
                <span>Navigate to 360° Profile</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

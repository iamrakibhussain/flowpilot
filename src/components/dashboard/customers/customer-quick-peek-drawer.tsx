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
        <DialogPrimitive.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-xl flex-col border-l border-slate-200/90 bg-white/95 shadow-2xl backdrop-blur-2xl duration-300 focus:outline-none">
          {/* Header */}
          <div className="relative border-b border-slate-200/80 p-5 sm:p-6">
            {/* Ambient spot blur */}
            <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-blue-500/10 blur-2xl" />

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-black text-white shadow-md ${
                    customer ? getAvatarGradient(customer.name) : "bg-slate-300"
                  }`}
                >
                  {initials}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <DialogPrimitive.Title className="truncate text-lg font-extrabold text-slate-900">
                      {customer?.name ?? "Loading Client..."}
                    </DialogPrimitive.Title>

                    {customer && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                          customer.status === "ACTIVE"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : customer.status === "LEAD"
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : "border-slate-200 bg-slate-100 text-slate-600"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            customer.status === "ACTIVE"
                              ? "bg-emerald-500"
                              : customer.status === "LEAD"
                                ? "bg-blue-500"
                                : "bg-slate-400"
                          }`}
                        />
                        {customer.status}
                      </span>
                    )}

                    {isHighValue && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/80 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                        <Crown className="h-2.5 w-2.5 fill-amber-700 text-amber-700" />
                        VIP
                      </span>
                    )}
                  </div>

                  {customer?.company ? (
                    <div className="flex items-center gap-1.5 pt-0.5 text-xs text-slate-500">
                      <Building2 className="h-3 w-3 text-slate-400" />
                      <span className="font-semibold text-slate-700">{customer.company}</span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">Individual Account</p>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-slate-200/80 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
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
                  className="bg-primary hover:bg-primary/90 flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-transform active:scale-95"
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
                  className="h-8 cursor-pointer rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Edit3 className="mr-1 h-3 w-3 text-slate-400" />
                  <span>Edit</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (onBookAppointment) onBookAppointment();
                  }}
                  className="h-8 cursor-pointer rounded-xl border-blue-200 bg-blue-50/50 text-xs font-semibold text-blue-700 hover:bg-blue-100/50"
                >
                  <CalendarPlus className="mr-1 h-3 w-3 text-blue-600" />
                  <span>Book</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (onCreateInvoice) onCreateInvoice();
                  }}
                  className="h-8 cursor-pointer rounded-xl border-emerald-200 bg-emerald-50/50 text-xs font-semibold text-emerald-700 hover:bg-emerald-100/50"
                >
                  <CreditCard className="mr-1 h-3 w-3 text-emerald-600" />
                  <span>Invoice</span>
                </Button>
              </div>
            )}
          </div>

          {/* Drawer Body with Custom Scroll */}
          <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
            {isLoading || !customer ? (
              <div className="space-y-4">
                <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
                  <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
                </div>
                <div className="h-44 animate-pulse rounded-2xl bg-slate-100" />
              </div>
            ) : (
              <>
                {/* 4x Compact Telemetry KPI Tiles */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 shadow-2xs">
                    <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                      LTV
                    </span>
                    <p className="mt-1 text-sm font-black text-slate-900 tabular-nums">
                      {customer.totalInvoiced}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 shadow-2xs">
                    <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                      Settled
                    </span>
                    <p className="mt-1 text-sm font-black text-emerald-700 tabular-nums">
                      {customer.totalPaid}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 shadow-2xs">
                    <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                      Due
                    </span>
                    <p className="mt-1 text-sm font-black text-amber-600 tabular-nums">
                      {customer.outstandingBalance}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 shadow-2xs">
                    <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                      Sessions
                    </span>
                    <p className="mt-1 text-sm font-black text-indigo-700 tabular-nums">
                      {customer.appointmentsCount}
                    </p>
                  </div>
                </div>

                {/* Contact Quick Chips */}
                <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-500">Direct Email:</span>
                    <button
                      type="button"
                      onClick={(e) => handleCopy(customer.email, "drawer-email", e)}
                      className="hover:text-primary flex cursor-pointer items-center gap-1.5 font-bold text-slate-800 transition-colors"
                    >
                      <span>{customer.email}</span>
                      {copiedKey === "drawer-email" ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3 text-slate-400" />
                      )}
                    </button>
                  </div>

                  {customer.phone && (
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                      <span className="font-medium text-slate-500">Direct Phone:</span>
                      <button
                        type="button"
                        onClick={(e) => handleCopy(customer.phone!, "drawer-phone", e)}
                        className="hover:text-primary flex cursor-pointer items-center gap-1.5 font-bold text-slate-800 transition-colors"
                      >
                        <span>{customer.phone}</span>
                        {copiedKey === "drawer-phone" ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3 text-slate-400" />
                        )}
                      </button>
                    </div>
                  )}

                  {customer.address && (
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                      <span className="font-medium text-slate-500">Address:</span>
                      <span className="max-w-[240px] truncate font-medium text-slate-700">
                        {customer.address}
                      </span>
                    </div>
                  )}
                </div>

                {/* Mini Segmented Tabs */}
                <div className="no-scrollbar flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-slate-200/80 bg-slate-100/90 p-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveTab("health")}
                    className={`flex-1 shrink-0 cursor-pointer rounded-lg px-2.5 py-1.5 text-center whitespace-nowrap transition-all ${
                      activeTab === "health"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Health Radar
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("invoices")}
                    className={`flex-1 shrink-0 cursor-pointer rounded-lg px-2.5 py-1.5 text-center whitespace-nowrap transition-all ${
                      activeTab === "invoices"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Invoices ({customer.invoices.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("appointments")}
                    className={`flex-1 shrink-0 cursor-pointer rounded-lg px-2.5 py-1.5 text-center whitespace-nowrap transition-all ${
                      activeTab === "appointments"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Sessions ({customer.appointments.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("notes")}
                    className={`flex-1 shrink-0 cursor-pointer rounded-lg px-2.5 py-1.5 text-center whitespace-nowrap transition-all ${
                      activeTab === "notes"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Notes ({customer.parsedNotes.length})
                  </button>
                </div>

                {/* Tab 1: Health Radar Breakdown */}
                {activeTab === "health" && health && (
                  <div className="space-y-4">
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80 p-5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                            Account Health Score
                          </span>
                          <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900">
                              {health.score}
                            </span>
                            <span className="text-xs font-bold text-slate-400">/ 100</span>
                            <span
                              className={`ml-2 inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-extrabold ${health.badgeStyle}`}
                            >
                              Grade {health.grade} • {health.tierLabel}
                            </span>
                          </div>
                        </div>

                        {/* Circular Radar Ring */}
                        <div className="relative flex h-16 w-16 items-center justify-center">
                          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-slate-100"
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
                          <div className="absolute text-[11px] font-black text-slate-700">
                            {health.velocityLabel.split(" ")[0]}
                          </div>
                        </div>
                      </div>

                      {/* Signals Checklist */}
                      <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">
                          Operational Velocity Signals
                        </span>
                        <div className="space-y-1.5">
                          {health.signals.map((sig, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
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
                    </div>
                  </div>
                )}

                {/* Tab 2: Recent Invoices */}
                {activeTab === "invoices" && (
                  <div className="space-y-3">
                    {customer.invoices.length === 0 ? (
                      <p className="py-8 text-center text-xs text-slate-400">
                        No invoices generated yet for this client.
                      </p>
                    ) : (
                      customer.invoices.slice(0, 5).map((inv) => (
                        <div
                          key={inv.id}
                          className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3 text-xs shadow-2xs"
                        >
                          <div>
                            <p className="font-bold text-slate-900">Invoice #{inv.invoiceNumber}</p>
                            <p className="text-[11px] text-slate-400">
                              Issued: {new Date(inv.issueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="font-extrabold text-slate-900 tabular-nums">
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
                      ))
                    )}
                  </div>
                )}

                {/* Tab 3: Appointments */}
                {activeTab === "appointments" && (
                  <div className="space-y-3">
                    {customer.appointments.length === 0 ? (
                      <p className="py-8 text-center text-xs text-slate-400">
                        No appointments booked yet for this client.
                      </p>
                    ) : (
                      customer.appointments.slice(0, 5).map((apt) => (
                        <div
                          key={apt.id}
                          className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3 text-xs shadow-2xs"
                        >
                          <div>
                            <p className="font-bold text-slate-900">{apt.title}</p>
                            <p className="text-[11px] text-slate-400">
                              {new Date(apt.scheduledAt).toLocaleString(undefined, {
                                dateStyle: "short",
                                timeStyle: "short",
                              })}{" "}
                              • {apt.durationMinutes}m
                            </p>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-bold">
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
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 shadow-2xs outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                      />
                      <div className="flex items-center justify-between">
                        {noteSuccess && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
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
                        <p className="py-6 text-center text-xs text-slate-400">
                          No staff notes recorded yet.
                        </p>
                      ) : (
                        customer.parsedNotes.slice(0, 4).map((note) => (
                          <div
                            key={note.id}
                            className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 text-xs"
                          >
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span className="font-bold text-slate-700">{note.authorName}</span>
                              <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="mt-1.5 whitespace-pre-wrap text-slate-700">
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
            <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-50/80 p-4 text-xs">
              <span className="font-mono text-[11px] text-slate-500">
                UUID: {customer.id.slice(0, 13)}...
              </span>
              <Link
                href={`/dashboard/customers/${customer.id}`}
                className="hover:text-primary flex items-center gap-1 font-bold text-slate-700"
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

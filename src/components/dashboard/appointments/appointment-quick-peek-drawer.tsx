"use client";

import * as React from "react";
import Link from "next/link";
import {
  X,
  Calendar,
  Clock,
  Phone,
  Mail,
  Video,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink,
  Download,
  CalendarPlus,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  useUpdateAppointmentStatus,
  useCancelAppointment,
} from "@/features/appointments/use-appointments";
import type { AppointmentListItem } from "@/features/appointments/types";

interface AppointmentQuickPeekDrawerProps {
  appointment: AppointmentListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenReschedule: (apt: AppointmentListItem) => void;
  onOpenInvoiceModal?: (appointment: AppointmentListItem) => void;
  organizationId?: string;
}

function getGoogleCalendarUrl(appointment: AppointmentListItem): string {
  const start = new Date(appointment.scheduledAt);
  const end = new Date(start.getTime() + appointment.durationMinutes * 60 * 1000);
  const formatTime = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: appointment.title,
    dates: `${formatTime(start)}/${formatTime(end)}`,
    details: `${appointment.notes ?? "Scheduled via FlowPilot"}\nClient: ${appointment.customerName} (${appointment.customerEmail})\nSpecialist: ${appointment.staffMemberName ?? "General Staff Pool"}`,
    location: appointment.location ?? "FlowPilot Secure Virtual Conference",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function downloadIcsFile(appointment: AppointmentListItem) {
  const start = new Date(appointment.scheduledAt);
  const end = new Date(start.getTime() + appointment.durationMinutes * 60 * 1000);
  const formatTime = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FlowPilot//Scheduling Engine//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:flowpilot-${appointment.id}@flowpilot.app`,
    `DTSTAMP:${formatTime(new Date())}`,
    `DTSTART:${formatTime(start)}`,
    `DTEND:${formatTime(end)}`,
    `SUMMARY:${appointment.title}`,
    `DESCRIPTION:${(appointment.notes ?? "Scheduled via FlowPilot").replace(/\n/g, "\\n")}`,
    `LOCATION:${appointment.location ?? "FlowPilot Secure Virtual Conference"}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${appointment.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function AppointmentQuickPeekDrawer({
  appointment,
  isOpen,
  onClose,
  onOpenReschedule,
  onOpenInvoiceModal,
  organizationId,
}: AppointmentQuickPeekDrawerProps) {
  const updateStatusMutation = useUpdateAppointmentStatus();
  const cancelMutation = useCancelAppointment();

  const [showCancelPrompt, setShowCancelPrompt] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("");
  const [isCopied, setIsCopied] = React.useState(false);

  if (!isOpen || !appointment) return null;

  const scheduledDate = new Date(appointment.scheduledAt);

  const handleClose = () => {
    setShowCancelPrompt(false);
    setCancelReason("");
    setIsCopied(false);
    onClose();
  };

  const handleCopySummary = async () => {
    const summary = [
      `Appointment: ${appointment.title}`,
      `Date & Time: ${scheduledDate.toLocaleString()}`,
      `Duration: ${appointment.durationMinutes} mins`,
      `Client: ${appointment.customerName} (${appointment.customerEmail})`,
      `Specialist: ${appointment.staffMemberName ?? "General Staff Pool"}`,
      appointment.location ? `Location/Link: ${appointment.location}` : null,
      appointment.notes ? `Notes: ${appointment.notes}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(summary);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // clipboard fallback
    }
  };

  const handleComplete = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        id: appointment.id,
        status: "COMPLETED",
        organizationId,
      });
    } catch {
      // handled
    }
  };

  const handleConfirm = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        id: appointment.id,
        status: "CONFIRMED",
        organizationId,
      });
    } catch {
      // handled
    }
  };

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync({
        id: appointment.id,
        reason: cancelReason.trim() || undefined,
        organizationId,
      });
      setShowCancelPrompt(false);
    } catch {
      // handled
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={handleClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md border-l border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-2xl">
          <div className="flex h-full flex-col divide-y divide-slate-100">
            {/* Header */}
            <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-extrabold ${
                      appointment.status === "COMPLETED"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : appointment.status === "CONFIRMED"
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : appointment.status === "PENDING"
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : "border-slate-200 bg-slate-100 text-slate-600"
                    }`}
                  >
                    {appointment.status}
                  </Badge>

                  <Badge
                    variant="outline"
                    className="border-slate-200 bg-white text-[10px] font-bold text-slate-700 shadow-2xs"
                  >
                    {appointment.type === "VIDEO" ? (
                      <Video className="mr-1 h-3 w-3 text-purple-600" />
                    ) : appointment.type === "PHONE" ? (
                      <Phone className="mr-1 h-3 w-3 text-blue-600" />
                    ) : (
                      <MapPin className="mr-1 h-3 w-3 text-emerald-600" />
                    )}
                    <span>{appointment.type.replace("_", " ")}</span>
                  </Badge>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="cursor-pointer rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <h2 className="mt-3.5 text-base font-black tracking-tight text-slate-900 sm:text-lg">
                {appointment.title}
              </h2>
              <div className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-500">
                <Calendar className="h-3.5 w-3.5 text-blue-500" />
                <span>
                  {scheduledDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span>•</span>
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  {scheduledDate.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  ({appointment.durationMinutes} mins)
                </span>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
              {/* Universal External Calendar Sync Bar */}
              <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/40 p-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold tracking-wider text-indigo-700 uppercase">
                    Calendar Synchronization
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">Universal Sync</span>
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <a
                    href={getGoogleCalendarUrl(appointment)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-white py-2 text-xs font-bold text-indigo-700 shadow-2xs transition-colors hover:bg-indigo-50 active:scale-95"
                  >
                    <CalendarPlus className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Google Cal</span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>

                  <button
                    type="button"
                    onClick={() => downloadIcsFile(appointment)}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 active:scale-95"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-600" />
                    <span>iCal / Apple</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopySummary}
                    title="Copy briefing to clipboard"
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition-colors hover:bg-slate-50 active:scale-95"
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Client Profile Card */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Client Record
                </span>
                <Card className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-black text-white shadow-md shadow-blue-500/20">
                        {appointment.customerName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <Link
                          href={`/dashboard/customers/${appointment.customerId}`}
                          className="group flex items-center gap-1.5 text-sm font-bold text-slate-900 hover:text-blue-600"
                        >
                          <span>{appointment.customerName}</span>
                          <ExternalLink className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                        </Link>
                        <p className="text-xs text-slate-500">{appointment.customerEmail}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                    {appointment.customerPhone && (
                      <a
                        href={`tel:${appointment.customerPhone}`}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                      >
                        <Phone className="h-3 w-3 text-emerald-600" />
                        <span>{appointment.customerPhone}</span>
                      </a>
                    )}
                    <a
                      href={`mailto:${appointment.customerEmail}`}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                    >
                      <Mail className="h-3 w-3 text-blue-600" />
                      <span>Send Email</span>
                    </a>
                  </div>
                </Card>
              </div>

              {/* Service & Specialist Section */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Engagement Details
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 shadow-2xs">
                    <p className="text-[11px] font-semibold text-slate-500">Service Offering</p>
                    <p className="mt-1 text-xs font-bold text-slate-900">
                      {appointment.serviceName ?? "Consultation Session"}
                    </p>
                    {appointment.servicePrice !== null &&
                      appointment.servicePrice !== undefined && (
                        <p className="mt-0.5 text-xs font-black text-emerald-600">
                          ${appointment.servicePrice.toFixed(2)}
                        </p>
                      )}
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 shadow-2xs">
                    <p className="text-[11px] font-semibold text-slate-500">Assigned Specialist</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[9px] font-black text-white">
                        {appointment.staffInitials ?? "SP"}
                      </div>
                      <p className="truncate text-xs font-bold text-slate-900">
                        {appointment.staffMemberName ?? "Operations Team"}
                      </p>
                    </div>
                    <p className="mt-0.5 truncate text-[10px] text-slate-500">
                      {appointment.staffMemberRole ?? "Specialist"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location or Meeting Bridge */}
              <div className="space-y-1.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500">Session Location</span>
                <p className="text-xs font-semibold text-slate-800">
                  {appointment.location ?? "FlowPilot Secure Virtual Conference"}
                </p>
              </div>

              {/* Notes */}
              {appointment.notes && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    Internal Operational Notes
                  </span>
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 text-xs text-slate-700 shadow-2xs">
                    <p className="leading-relaxed whitespace-pre-wrap">{appointment.notes}</p>
                  </div>
                </div>
              )}

              {/* Cancel Prompt Inline */}
              {showCancelPrompt && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-rose-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-xs font-bold">Confirm Appointment Cancellation</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter mandatory cancellation reason..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="mt-2.5 w-full rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-inner focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  />
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCancelPrompt(false)}
                      className="cursor-pointer rounded-xl text-xs font-semibold"
                    >
                      Dismiss
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleCancel}
                      disabled={cancelMutation.isPending}
                      className="cursor-pointer rounded-xl bg-rose-600 text-xs font-semibold text-white shadow-md hover:bg-rose-700"
                    >
                      {cancelMutation.isPending ? "Cancelling..." : "Confirm Cancel"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Lifecycle Actions Bar */}
            <div className="bg-slate-50/80 p-4 shadow-inner sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {appointment.status !== "COMPLETED" && appointment.status !== "CANCELLED" && (
                    <Button
                      size="sm"
                      onClick={handleComplete}
                      disabled={updateStatusMutation.isPending}
                      className="cursor-pointer rounded-xl bg-emerald-600 text-xs font-semibold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                      <span>Mark Complete</span>
                    </Button>
                  )}

                  {appointment.status === "PENDING" && (
                    <Button
                      size="sm"
                      onClick={handleConfirm}
                      disabled={updateStatusMutation.isPending}
                      className="cursor-pointer rounded-xl bg-blue-600 text-xs font-semibold text-white shadow-md hover:bg-blue-700"
                    >
                      Confirm
                    </Button>
                  )}

                  {appointment.status !== "CANCELLED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenReschedule(appointment)}
                      className="cursor-pointer rounded-xl border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-100"
                    >
                      <Calendar className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                      <span>Reschedule</span>
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {onOpenInvoiceModal && appointment.status !== "CANCELLED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenInvoiceModal(appointment)}
                      className="cursor-pointer rounded-xl border-emerald-200 bg-emerald-50/70 text-xs font-semibold text-emerald-800 shadow-2xs hover:bg-emerald-100"
                    >
                      <FileText className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                      <span>Issue Bill</span>
                    </Button>
                  )}

                  {appointment.status !== "CANCELLED" && !showCancelPrompt && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowCancelPrompt(true)}
                      className="cursor-pointer text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import {
  X,
  Clock,
  Mail,
  Phone,
  Briefcase,
  ExternalLink,
  Edit,
  Check,
  Calendar,
  ShieldCheck,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { BookingWizardModal } from "@/components/dashboard/appointments/booking-wizard-modal";
import { InviteMemberModal } from "@/components/dashboard/team/invite-member-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useStaffById, useUpdateStaffStatus } from "@/features/staff/use-staff";
import type { StaffItem, StaffStatus } from "@/features/staff/types";

interface StaffQuickPeekDrawerProps {
  staff: StaffItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenEdit: (staff: StaffItem) => void;
}

const statusConfig: Record<
  StaffStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  AVAILABLE: {
    label: "Available Now",
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  IN_SESSION: {
    label: "In Session",
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    border: "border-indigo-500/20",
    dot: "bg-indigo-400 animate-ping",
  },
  ON_BREAK: {
    label: "On Break",
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500/20",
    dot: "bg-amber-500",
  },
  OFFLINE: {
    label: "Offline / Shift Ended",
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    border: "border-slate-500/20",
    dot: "bg-slate-400",
  },
};

export function StaffQuickPeekDrawer({
  staff,
  isOpen,
  onClose,
  onOpenEdit,
}: StaffQuickPeekDrawerProps) {
  const updateStatusMutation = useUpdateStaffStatus();
  const [isBookingModalOpen, setIsBookingModalOpen] = React.useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);

  // Fetch full details with real appointments agenda
  const { data: detailedStaff, isLoading } = useStaffById(staff?.id || "");
  const currentStaff = detailedStaff || staff;

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !currentStaff) return null;

  const currentStatus = currentStaff.status;
  const statusMeta = statusConfig[currentStatus] || statusConfig.AVAILABLE;

  const handleStatusChange = async (newStatus: StaffStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: currentStaff.id, status: newStatus });
    } catch (err) {
      console.error("Failed to update staff status:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 flex w-full max-w-full pl-0 sm:w-auto sm:pl-10">
        <div className="border-border/80 bg-background flex h-[100dvh] h-full w-full max-w-full flex-col overflow-hidden border-l shadow-2xl transition-transform duration-300 sm:w-[560px]">
          {/* Mobile Drag Indicator */}
          <div className="bg-background flex shrink-0 items-center justify-center pt-2.5 pb-1 sm:hidden">
            <div className="bg-border h-1 w-12 rounded-full" />
          </div>

          {/* Header */}
          <div className="border-border/80 bg-card/60 flex shrink-0 items-center justify-between border-b px-3.5 py-3 backdrop-blur-md sm:px-6 sm:py-4">
            <div className="flex min-w-0 flex-1 items-center gap-2.5 pr-2 sm:gap-3">
              <div className="relative shrink-0">
                <div
                  className={`ring-background flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white shadow-sm ring-2 sm:h-12 sm:w-12 sm:rounded-2xl ${currentStaff.avatarBg}`}
                >
                  {currentStaff.initials}
                </div>
                <span
                  className={`border-background absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 sm:h-3.5 sm:w-3.5 ${statusMeta.dot}`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-foreground truncate text-sm font-bold tracking-tight sm:text-base">
                  {currentStaff.name}
                </h2>
                <div className="mt-0.5 flex flex-wrap items-center gap-1 sm:gap-1.5">
                  <span className="text-muted-foreground truncate text-[11px] font-medium sm:text-xs">
                    {currentStaff.roleTitle}
                  </span>
                  <span className="border-border/80 bg-muted/40 py-0.2 text-foreground inline-flex shrink-0 rounded-md border px-1.5 text-[8.5px] font-bold uppercase sm:text-[9px]">
                    {currentStaff.tier.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenEdit(currentStaff)}
                className="border-border h-9 cursor-pointer gap-1 rounded-xl px-2.5 text-xs font-semibold shadow-2xs sm:h-9 sm:px-3"
                title="Edit Specialist Profile"
              >
                <Edit className="h-3.5 w-3.5 text-slate-500" />
                <span className="xs:inline hidden sm:inline">Edit Profile</span>
              </Button>
              <button
                type="button"
                onClick={onClose}
                className="text-foreground hover:bg-muted border-border/80 bg-muted/30 cursor-pointer rounded-xl border p-2 transition active:scale-95 sm:p-2"
                aria-label="Close drawer"
                title="Close (Esc)"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 space-y-6 overflow-y-auto p-4 text-xs sm:p-6">
            {/* Live Operational Status Switcher */}
            <div className="border-border/80 bg-surface/80 rounded-2xl border p-4 shadow-2xs">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                  Current Operational Status
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}
                >
                  <span className={`h-2 w-2 rounded-full ${statusMeta.dot}`} />
                  {statusMeta.label}
                </span>
              </div>

              {/* Status Switch Buttons */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(Object.keys(statusConfig) as StaffStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusChange(st)}
                    disabled={updateStatusMutation.isPending}
                    className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border py-2 text-[11px] font-semibold transition active:scale-95 ${
                      currentStatus === st
                        ? "border-blue-600 bg-blue-600 text-white shadow-2xs"
                        : "border-border text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    }`}
                  >
                    {currentStatus === st && <Check className="h-3 w-3" />}
                    <span>
                      {st === "AVAILABLE"
                        ? "Available"
                        : st === "IN_SESSION"
                          ? "In Session"
                          : st === "ON_BREAK"
                            ? "Break"
                            : "Offline"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Performance & Revenue Scorecard */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Card className="border-border/80 bg-surface/90 shadow-2xs">
                <div className="p-3.5">
                  <span className="text-muted-foreground block text-[11px] font-medium">
                    Sessions Delivered
                  </span>
                  <span className="text-foreground font-mono text-xl font-black">
                    {currentStaff.appointmentCount}
                  </span>
                  <span className="text-muted-foreground mt-0.5 block text-[10px]">
                    All-time completed
                  </span>
                </div>
              </Card>

              <Card className="border-border/80 bg-surface/90 shadow-2xs">
                <div className="p-3.5">
                  <span className="text-muted-foreground block text-[11px] font-medium">
                    Billed Revenue
                  </span>
                  <span className="text-foreground font-mono text-xl font-black">
                    $
                    {currentStaff.revenueGenerated.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                    })}
                  </span>
                  <span className="mt-0.5 block text-[10px] font-semibold text-emerald-500">
                    Attributed volume
                  </span>
                </div>
              </Card>

              <Card className="border-border/80 bg-surface/90 col-span-2 shadow-2xs sm:col-span-1">
                <div className="p-3.5">
                  <span className="text-muted-foreground block text-[11px] font-medium">
                    Staff Tier / Rate
                  </span>
                  <span className="text-foreground truncate font-mono text-base font-bold">
                    {currentStaff.hourlyRate
                      ? `$${currentStaff.hourlyRate}/hr`
                      : currentStaff.tier.replace("_", " ")}
                  </span>
                  <span className="text-muted-foreground mt-0.5 block text-[10px]">
                    {currentStaff.commissionRate
                      ? `${currentStaff.commissionRate}% Commission`
                      : "Standard Base"}
                  </span>
                </div>
              </Card>
            </div>

            {/* Contact & Shift Details */}
            <div className="border-border/80 space-y-3 rounded-2xl border p-4.5">
              <h3 className="text-foreground text-xs font-semibold tracking-wider uppercase">
                Work Schedule & Shift Capacity
              </h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 shrink-0 text-blue-500" />
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Standard Shift</span>
                    <span className="text-foreground font-semibold">
                      {currentStaff.shiftStart} – {currentStaff.shiftEnd}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Briefcase className="h-4 w-4 shrink-0 text-indigo-500" />
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Contract Tier</span>
                    <span className="text-foreground font-semibold capitalize">
                      {currentStaff.tier.replace("_", " ").toLowerCase()}
                    </span>
                  </div>
                </div>

                {currentStaff.email && (
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                    <div className="min-w-0">
                      <span className="text-muted-foreground block text-[10px]">Email Address</span>
                      <a
                        href={`mailto:${currentStaff.email}`}
                        className="text-foreground truncate font-medium hover:text-blue-600"
                      >
                        {currentStaff.email}
                      </a>
                    </div>
                  </div>
                )}

                {currentStaff.phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Phone Number</span>
                      <a
                        href={`tel:${currentStaff.phone}`}
                        className="text-foreground font-medium hover:text-blue-600"
                      >
                        {currentStaff.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Working Days Badges */}
              <div className="border-border/60 border-t pt-3">
                <span className="text-muted-foreground mb-2 block text-[11px] font-medium">
                  Active Working Days
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => {
                    const isWorking = currentStaff.workingDays.includes(day);
                    return (
                      <span
                        key={day}
                        className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                          isWorking
                            ? "border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "bg-muted/40 text-muted-foreground line-through opacity-40"
                        }`}
                      >
                        {day}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Workspace Portal & RBAC Access Card */}
            <div className="border-border/80 from-background to-muted/20 space-y-3 rounded-2xl border bg-gradient-to-br p-4.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-500" />
                  <h3 className="text-foreground text-xs font-semibold tracking-wider uppercase">
                    Workspace Portal Access
                  </h3>
                </div>
                {currentStaff.userId ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <UserCheck className="h-3 w-3" />
                    Account Linked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    No Portal Account
                  </span>
                )}
              </div>

              {currentStaff.userId ? (
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  This specialist has an active FlowPilot login account. They can log in to view
                  their assigned appointments, manage working availability, and access workspace
                  features.
                </p>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    This specialist does not have an active login account yet. Send an email
                    invitation with their role to grant portal access.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setIsInviteModalOpen(true)}
                    className="w-full cursor-pointer gap-2 rounded-xl border-blue-500/30 bg-blue-500/5 text-xs font-semibold text-blue-600 hover:bg-blue-500/10 dark:text-blue-400"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Invite Specialist to Workspace</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Qualified Services */}
            <div className="border-border/80 space-y-3 rounded-2xl border p-4.5">
              <div className="flex items-center justify-between">
                <h3 className="text-foreground text-xs font-semibold tracking-wider uppercase">
                  Service Qualifications ({currentStaff.services.length})
                </h3>
                <span className="text-muted-foreground text-[10px]">Certified deliverables</span>
              </div>

              {currentStaff.services.length === 0 ? (
                <p className="text-muted-foreground text-[11px] italic">
                  No specific services mapped. This team member delivers general consultations.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {currentStaff.services.map((service) => (
                    <div
                      key={service.id}
                      className="border-border/60 bg-muted/20 flex items-center justify-between rounded-xl border p-2.5"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-foreground block truncate font-semibold">
                          {service.name}
                        </span>
                        <span className="text-muted-foreground block text-[10px]">
                          {service.durationMinutes} mins session
                        </span>
                      </div>
                      <span className="text-foreground shrink-0 font-mono font-bold">
                        ${service.price}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Scheduled Appointments */}
            <div className="border-border/80 space-y-3 rounded-2xl border p-4.5">
              <div className="flex items-center justify-between">
                <h3 className="text-foreground text-xs font-semibold tracking-wider uppercase">
                  Client Appointments Agenda
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setIsBookingModalOpen(true)}
                    className="border-border cursor-pointer gap-1.5 rounded-xl text-xs font-semibold"
                  >
                    <Calendar className="h-3.5 w-3.5 text-blue-500" />
                    <span>Book Session</span>
                  </Button>
                  <Link
                    href={`/dashboard/calendar?staffId=${currentStaff.id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <span>Open Calendar</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {isLoading ? (
                <p className="text-muted-foreground py-4 text-center">Loading client agenda...</p>
              ) : !detailedStaff?.recentAppointments ||
                detailedStaff.recentAppointments.length === 0 ? (
                <p className="text-muted-foreground py-2 text-[11px] italic">
                  No scheduled client appointments assigned to this team specialist yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {detailedStaff.recentAppointments.map((app) => (
                    <div
                      key={app.id}
                      className="border-border/60 bg-muted/20 flex items-center justify-between rounded-xl border p-2.5"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-foreground block truncate font-semibold">
                          {app.title}
                        </span>
                        <span className="text-muted-foreground flex items-center gap-2 text-[10px]">
                          <span>Client: {app.customerName}</span>
                          <span>•</span>
                          <span suppressHydrationWarning>
                            {new Date(app.scheduledAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </span>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                          app.status === "COMPLETED"
                            ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                            : app.status === "CONFIRMED"
                              ? "border border-blue-500/20 bg-blue-500/10 text-blue-500"
                              : "border border-amber-500/20 bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-border/80 bg-surface/90 flex shrink-0 flex-col items-center justify-between gap-2.5 border-t px-4 py-3 sm:flex-row sm:px-6 sm:py-3.5">
            <span className="text-muted-foreground hidden text-[11px] sm:inline">
              Specialist ID: <code className="font-mono">{currentStaff.id.slice(0, 8)}</code>
            </span>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenEdit(currentStaff)}
                className="border-border flex-1 cursor-pointer rounded-xl text-xs font-semibold sm:hidden sm:flex-none"
              >
                <Edit className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                <span>Edit Profile</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="border-border bg-muted/20 hover:bg-muted flex-1 cursor-pointer rounded-xl text-xs font-semibold sm:flex-none"
              >
                Close Drawer
              </Button>
            </div>
          </div>
        </div>
      </div>

      <BookingWizardModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        preselectedStaffId={currentStaff.id}
        organizationId={currentStaff.organizationId}
      />

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        defaultEmail={currentStaff.email || ""}
        defaultStaffMemberId={currentStaff.id}
      />
    </div>
  );
}

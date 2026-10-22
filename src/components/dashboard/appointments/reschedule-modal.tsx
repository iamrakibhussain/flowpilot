"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, AlertTriangle, RefreshCw } from "lucide-react";
import {
  useRescheduleAppointment,
  useCheckConflict,
  useStaffMembers,
} from "@/features/appointments/use-appointments";
import type { AppointmentListItem } from "@/features/appointments/types";

interface RescheduleModalProps {
  appointment: AppointmentListItem | null;
  isOpen: boolean;
  onClose: () => void;
  organizationId?: string;
}

interface RescheduleFormProps {
  appointment: AppointmentListItem;
  onClose: () => void;
  organizationId?: string;
}

function RescheduleForm({ appointment, onClose, organizationId }: RescheduleFormProps) {
  const { data: staffMembers = [] } = useStaffMembers(organizationId);
  const rescheduleMutation = useRescheduleAppointment();
  const conflictCheckMutation = useCheckConflict();
  const checkConflict = conflictCheckMutation.mutateAsync;

  const initialDate = React.useMemo(() => {
    const dt = new Date(appointment.scheduledAt);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, [appointment.scheduledAt]);

  const initialTime = React.useMemo(() => {
    const dt = new Date(appointment.scheduledAt);
    const hh = String(dt.getHours()).padStart(2, "0");
    const min = String(dt.getMinutes()).padStart(2, "0");
    return `${hh}:${min}`;
  }, [appointment.scheduledAt]);

  const [date, setDate] = React.useState(initialDate);
  const [time, setTime] = React.useState(initialTime);
  const [duration, setDuration] = React.useState(appointment.durationMinutes);
  const [selectedStaffId, setSelectedStaffId] = React.useState(appointment.staffMemberId ?? "");
  const [reason, setReason] = React.useState("");
  const [conflictWarning, setConflictWarning] = React.useState<string | null>(null);

  // Debounced conflict check on changes
  React.useEffect(() => {
    if (!date || !time || !selectedStaffId) {
      return;
    }

    const scheduledDate = new Date(`${date}T${time}:00`);
    if (isNaN(scheduledDate.getTime())) return;

    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        const result = await checkConflict({
          payload: {
            staffMemberId: selectedStaffId,
            scheduledAt: scheduledDate.toISOString(),
            durationMinutes: duration,
            excludeAppointmentId: appointment.id,
          },
          organizationId,
        });

        if (isMounted) {
          if (result.hasConflict && result.conflictingAppointment) {
            setConflictWarning(
              `Staff Member Conflict: ${result.conflictingAppointment.staffMemberName ?? "This staff member"} is already booked for "${result.conflictingAppointment.title}" during this slot.`
            );
          } else {
            setConflictWarning(null);
          }
        }
      } catch {
        // Silently skip check error, server will enforce on submit
      }
    }, 350);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [date, time, selectedStaffId, duration, appointment.id, organizationId, checkConflict]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return;

    const scheduledDate = new Date(`${date}T${time}:00`);
    if (isNaN(scheduledDate.getTime())) return;

    try {
      await rescheduleMutation.mutateAsync({
        id: appointment.id,
        payload: {
          newScheduledAt: scheduledDate.toISOString(),
          newDurationMinutes: duration,
          newStaffMemberId: selectedStaffId || undefined,
          reason: reason.trim() || undefined,
        },
        organizationId,
      });
      onClose();
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      {/* Conflict Alert Banner */}
      {conflictWarning && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-800 shadow-2xs">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
          <div>
            <p className="font-bold">Collision Warning</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-rose-700">{conflictWarning}</p>
          </div>
        </div>
      )}

      {/* Date Picker */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-slate-700">New Scheduled Date</Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setConflictWarning(null);
          }}
          required
          className="rounded-xl border-slate-200 text-xs shadow-2xs focus:border-blue-500"
        />
      </div>

      {/* Time & Duration Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700">Start Time</Label>
          <Input
            type="time"
            value={time}
            onChange={(e) => {
              setTime(e.target.value);
              setConflictWarning(null);
            }}
            required
            className="rounded-xl border-slate-200 text-xs shadow-2xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700">Duration (Minutes)</Label>
          <select
            value={duration}
            onChange={(e) => {
              setDuration(Number(e.target.value));
              setConflictWarning(null);
            }}
            className="flex h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-none"
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes (1 hr)</option>
            <option value={90}>90 minutes (1.5 hrs)</option>
            <option value={120}>120 minutes (2 hrs)</option>
          </select>
        </div>
      </div>

      {/* Staff Member Reassignment */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-slate-700">Assigned Staff Specialist</Label>
        <select
          value={selectedStaffId}
          onChange={(e) => {
            setSelectedStaffId(e.target.value);
            setConflictWarning(null);
          }}
          className="flex h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-none"
        >
          <option value="">Unassigned / Any Specialist</option>
          {staffMembers.map((sm) => (
            <option key={sm.id} value={sm.id}>
              {sm.name} ({sm.roleTitle})
            </option>
          ))}
        </select>
      </div>

      {/* Reschedule Reason Audit */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-slate-700">
          Reason for Rescheduling (Audit Log)
        </Label>
        <Input
          type="text"
          placeholder="e.g. Client requested 30m delay, flight postponed..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="rounded-xl border-slate-200 text-xs shadow-2xs"
        />
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-end gap-2.5 pt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={rescheduleMutation.isPending}
          className="cursor-pointer rounded-xl border-slate-200 text-xs font-semibold text-slate-700"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={rescheduleMutation.isPending || Boolean(conflictWarning)}
          className="cursor-pointer rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50"
        >
          {rescheduleMutation.isPending ? (
            <>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              <span>Checking & Updating...</span>
            </>
          ) : (
            <span>Confirm Reschedule</span>
          )}
        </Button>
      </div>
    </form>
  );
}

export function RescheduleModal({
  appointment,
  isOpen,
  onClose,
  organizationId,
}: RescheduleModalProps) {
  if (!isOpen || !appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-2xl backdrop-blur-xl sm:p-7">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="via-blue-650 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25">
              <Calendar className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50 px-3 py-1 text-[10px] font-extrabold text-blue-700 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              <span>Collision Re-check</span>
            </span>
          </div>
          <DialogTitle className="mt-3.5 text-xl font-black tracking-tight text-slate-900">
            Reschedule Appointment
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Shift date, adjust duration, or reassign specialist for{" "}
            <span className="font-semibold text-slate-800">{appointment.customerName}</span>.
          </DialogDescription>
        </DialogHeader>

        <RescheduleForm
          key={appointment.id}
          appointment={appointment}
          onClose={onClose}
          organizationId={organizationId}
        />
      </DialogContent>
    </Dialog>
  );
}

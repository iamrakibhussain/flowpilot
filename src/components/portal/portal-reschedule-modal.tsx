"use client";

import * as React from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PortalAppointment } from "@/features/portal/types";
import { usePortalAppointmentSlots } from "@/features/portal/use-portal";

interface PortalRescheduleModalProps {
  appointment: PortalAppointment;
  brandColor?: string;
  minNoticeHours?: number;
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (newScheduledAt: string) => Promise<void>;
}

export function PortalRescheduleModal({
  appointment,
  brandColor = "#2563eb",
  minNoticeHours = 2,
  isOpen,
  onClose,
  onReschedule,
}: PortalRescheduleModalProps) {
  // Compute initial target date (tomorrow by default)
  const defaultDateStr = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);

  const [selectedDate, setSelectedDate] = React.useState(defaultDateStr);
  const [selectedSlotTime, setSelectedSlotTime] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Fetch available slots from backend
  const { data: slots, isLoading: isLoadingSlots } = usePortalAppointmentSlots(
    appointment.id,
    selectedDate,
    isOpen
  );

  // Handle ESC key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  const handleConfirmReschedule = async () => {
    if (!selectedSlotTime) {
      setErrorMessage("Please select an available time slot.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      // Combine date and time to ISO string
      const fullIsoString = new Date(`${selectedDate}T${selectedSlotTime}:00`).toISOString();
      await onReschedule(fullIsoString);
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to reschedule appointment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 backdrop-blur-md sm:p-4"
    >
      <div className="relative my-auto flex max-h-[90vh] w-full max-w-lg flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl transition-all sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
            >
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                Reschedule Appointment
              </h3>
              <p className="text-xs text-slate-500">{appointment.title}</p>
            </div>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Booking Info & Policy Notice */}
        <div className="mt-4 space-y-3 overflow-y-auto">
          <div className="rounded-2xl border border-blue-200/80 bg-blue-50/70 p-3.5 text-xs text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200">
            <div className="flex items-center justify-between font-bold">
              <span>Current Time:</span>
              <span>{new Date(appointment.scheduledAt).toLocaleString()}</span>
            </div>
            {appointment.staffMember && (
              <p className="mt-1 text-[11px] text-blue-700 dark:text-blue-300">
                Specialist: {appointment.staffMember.name} ({appointment.staffMember.roleTitle})
              </p>
            )}
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-amber-50/80 p-2.5 text-[11px] text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
            <span>
              Policy Notice: Changes require at least <strong>{minNoticeHours} hours</strong> notice.
              Your selected time will automatically sync with your specialist&apos;s schedule.
            </span>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
              {errorMessage}
            </div>
          )}

          {/* Date Picker */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300">
              Select Reschedule Date
            </label>
            <Input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSlotTime(null);
                setErrorMessage(null);
              }}
              className="h-10 rounded-xl bg-slate-50 font-semibold dark:bg-slate-950"
            />
          </div>

          {/* Available Slots Selector */}
          <div className="space-y-2 pt-1">
            <label className="flex items-center justify-between text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300">
              <span>Available Time Slots</span>
              {isLoadingSlots && <span className="text-[11px] text-slate-400">Loading open slots...</span>}
            </label>

            {isLoadingSlots ? (
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                ))}
              </div>
            ) : !slots || slots.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500 dark:border-slate-800">
                <Clock className="mx-auto h-6 w-6 opacity-40" />
                <p className="mt-2 font-medium">No open slots available on this date.</p>
                <p className="text-[11px] text-slate-400">Please choose another day from the calendar above.</p>
              </div>
            ) : (
              <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
                {slots.map((slot) => {
                  const isSelected = selectedSlotTime === slot.startTime;
                  return (
                    <button
                      key={slot.startTime}
                      type="button"
                      onClick={() => setSelectedSlotTime(slot.startTime)}
                      className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                        isSelected
                          ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      <span>{slot.startTime}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex shrink-0 items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onClose}
            className="h-11 flex-1 cursor-pointer rounded-xl font-bold sm:h-10"
          >
            Keep Existing
          </Button>
          <Button
            type="button"
            disabled={isSubmitting || !selectedSlotTime}
            onClick={handleConfirmReschedule}
            style={{ backgroundColor: brandColor }}
            className="h-11 flex-1 cursor-pointer gap-2 rounded-xl font-bold text-white shadow-md shadow-blue-500/20 sm:h-10"
          >
            {isSubmitting ? "Syncing..." : "Confirm New Slot"}
          </Button>
        </div>
      </div>
    </div>
  );
}

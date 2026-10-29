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
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Video,
  MapPin,
  Phone,
  AlertTriangle,
  RefreshCw,
  Search,
  X,
  Clock,
} from "lucide-react";
import { useCustomers } from "@/features/customers/use-customers";
import {
  useCreateAppointment,
  useCheckConflict,
  useServices,
  useStaffMembers,
} from "@/features/appointments/use-appointments";
import type { AppointmentMeetingType } from "@/features/appointments/types";

interface BookingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  initialTime?: string;
  preselectedCustomerId?: string;
  preselectedStaffId?: string;
  organizationId?: string;
}

interface BookingWizardFormProps {
  onClose: () => void;
  initialDate?: string;
  initialTime?: string;
  preselectedCustomerId?: string;
  preselectedStaffId?: string;
  organizationId?: string;
}

function BookingWizardForm({
  onClose,
  initialDate,
  initialTime,
  preselectedCustomerId,
  preselectedStaffId,
  organizationId,
}: BookingWizardFormProps) {
  const { data: customerData } = useCustomers({ status: "ACTIVE", limit: 100 });
  const customers = React.useMemo(() => customerData?.customers ?? [], [customerData]);

  const { data: services = [] } = useServices(true, organizationId);
  const { data: staffMembers = [] } = useStaffMembers(organizationId);

  const createMutation = useCreateAppointment();
  const checkConflictMutation = useCheckConflict();
  const checkConflict = checkConflictMutation.mutateAsync;

  const defaultDate = React.useMemo(() => {
    if (initialDate) return initialDate;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, [initialDate]);

  const [customerId, setCustomerId] = React.useState(preselectedCustomerId ?? "");
  const [customerSearch, setCustomerSearch] = React.useState("");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = React.useState(false);

  const [serviceId, setServiceId] = React.useState("");
  const [staffMemberId, setStaffMemberId] = React.useState(preselectedStaffId ?? "");
  const [date, setDate] = React.useState(defaultDate);
  const [time, setTime] = React.useState(initialTime ?? "10:00");
  const [duration, setDuration] = React.useState(60);
  const [meetingType, setMeetingType] = React.useState<AppointmentMeetingType>("VIDEO");
  const [title, setTitle] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [conflictAlert, setConflictAlert] = React.useState<string | null>(null);

  // Filter customers by search
  const filteredCustomers = React.useMemo(() => {
    if (!customerSearch.trim()) return customers.slice(0, 8);
    const q = customerSearch.toLowerCase();
    return customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.company && c.company.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [customers, customerSearch]);

  const selectedCustomer = React.useMemo(() => {
    return customers.find((c) => c.id === customerId);
  }, [customers, customerId]);

  // Adjust duration and title when service changes
  const handleServiceSelect = (id: string) => {
    setServiceId(id);
    const srv = services.find((s) => s.id === id);
    if (srv) {
      setDuration(srv.durationMinutes);
      if (!title) {
        setTitle(srv.name);
      }
    }
  };

  // Selected specialist details for smart schedule validation
  const selectedStaff = React.useMemo(
    () => staffMembers.find((sm) => sm.id === staffMemberId),
    [staffMembers, staffMemberId]
  );

  const scheduleNotice = React.useMemo(() => {
    if (!selectedStaff || !date) return null;
    const dayMap = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const d = new Date(`${date}T12:00:00`);
    if (isNaN(d.getTime())) return null;
    const dayCode = dayMap[d.getDay()];

    if (selectedStaff.workingDays && selectedStaff.workingDays.length > 0) {
      if (!selectedStaff.workingDays.includes(dayCode)) {
        return `Schedule Notice: ${selectedStaff.name} does not regularly work on ${dayCode}s (Active shift: ${selectedStaff.workingDays.join(", ")}).`;
      }
    }
    if (selectedStaff.shiftStart && selectedStaff.shiftEnd && time) {
      if (time < selectedStaff.shiftStart || time > selectedStaff.shiftEnd) {
        return `Outside Shift: ${selectedStaff.name}'s standard hours are ${selectedStaff.shiftStart} – ${selectedStaff.shiftEnd}.`;
      }
    }
    return null;
  }, [selectedStaff, date, time]);

  // Instant Conflict Pre-flight Check
  React.useEffect(() => {
    if (!date || !time || !staffMemberId) {
      return;
    }

    const scheduledDate = new Date(`${date}T${time}:00`);
    if (isNaN(scheduledDate.getTime())) return;

    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        const result = await checkConflict({
          payload: {
            staffMemberId,
            scheduledAt: scheduledDate.toISOString(),
            durationMinutes: duration,
          },
          organizationId,
        });

        if (isMounted) {
          if (result.hasConflict && result.conflictingAppointment) {
            setConflictAlert(
              `Double-Booking Notice: ${result.conflictingAppointment.staffMemberName ?? "Specialist"} is already booked for "${result.conflictingAppointment.title}" during this slot.`
            );
          } else {
            setConflictAlert(null);
          }
        }
      } catch {
        // Ignored
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [date, time, staffMemberId, duration, organizationId, checkConflict]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !date || !time) return;

    const scheduledDate = new Date(`${date}T${time}:00`);
    if (isNaN(scheduledDate.getTime())) return;

    try {
      await createMutation.mutateAsync({
        payload: {
          customerId,
          serviceId: serviceId || undefined,
          staffMemberId: staffMemberId || undefined,
          title: title.trim() || undefined,
          scheduledAt: scheduledDate.toISOString(),
          durationMinutes: duration,
          type: meetingType,
          location: location.trim() || undefined,
          notes: notes.trim() || undefined,
        },
        organizationId,
      });
      onClose();
    } catch {
      // Handled by mutation error
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
      {/* Visual Step Tracker */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50/80 px-3 py-2 text-[11px] font-bold sm:px-4 sm:py-2.5">
        <div className="flex items-center gap-1.5 text-blue-700">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white shadow-2xs">
            1
          </span>
          <span className="hidden sm:inline">Client & Service</span>
          <span className="sm:hidden">Client</span>
        </div>
        <span className="text-slate-300">•</span>
        <div className="flex items-center gap-1.5 text-slate-700">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-black text-slate-700">
            2
          </span>
          <span className="hidden sm:inline">Schedule & Duration</span>
          <span className="sm:hidden">Schedule</span>
        </div>
        <span className="text-slate-300">•</span>
        <div className="flex items-center gap-1.5 text-slate-700">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-black text-slate-700">
            3
          </span>
          <span className="hidden sm:inline">Meeting Format</span>
          <span className="sm:hidden">Format</span>
        </div>
      </div>

      {/* Conflict Warning */}
      {conflictAlert && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200/90 bg-rose-50/95 p-3.5 text-xs text-rose-800 shadow-xs">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
            <AlertTriangle className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="font-extrabold text-rose-900">Scheduling Collision Warning</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-rose-700">{conflictAlert}</p>
          </div>
        </div>
      )}

      {/* Schedule Shift Warning */}
      {scheduleNotice && !conflictAlert && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200/90 bg-amber-50/95 p-3.5 text-xs text-amber-800 shadow-xs">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
            <Clock className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="font-extrabold text-amber-900">Shift Availability Notice</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-amber-700">{scheduleNotice}</p>
          </div>
        </div>
      )}

      {/* 1. Smart Searchable Client Combobox */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-slate-700">
          Select Client <span className="text-rose-500">*</span>
        </Label>

        {selectedCustomer ? (
          <div className="flex items-center justify-between rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/70 to-indigo-50/40 p-3 shadow-2xs">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xs font-black text-white shadow-xs">
                {selectedCustomer.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-black text-slate-900">
                  {selectedCustomer.name}
                </p>
                <p className="truncate text-[11px] text-slate-500">
                  {selectedCustomer.email}{" "}
                  {selectedCustomer.company ? `• ${selectedCustomer.company}` : ""}
                </p>
              </div>
            </div>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setCustomerId("");
                setCustomerSearch("");
                setIsCustomerDropdownOpen(true);
              }}
              className="h-8 rounded-xl border-slate-200 bg-white text-[11px] font-bold text-slate-700 hover:bg-slate-50"
            >
              Change
            </Button>
          </div>
        ) : (
          <div className="relative">
            <div className="relative">
              <Search className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Type to search clients by name, email, or company..."
                value={customerSearch}
                onFocus={() => setIsCustomerDropdownOpen(true)}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setIsCustomerDropdownOpen(true);
                }}
                className="h-10 rounded-xl border-slate-200 pl-9 text-xs font-medium shadow-2xs focus:border-blue-500"
              />
              {customerSearch && (
                <button
                  type="button"
                  onClick={() => setCustomerSearch("")}
                  className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {isCustomerDropdownOpen && (
              <div className="absolute top-full right-0 left-0 z-30 mt-1 max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
                {filteredCustomers.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-500">
                    No matching client records found.
                  </div>
                ) : (
                  filteredCustomers.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCustomerId(c.id);
                        setIsCustomerDropdownOpen(false);
                      }}
                      className="flex w-full cursor-pointer items-center justify-between rounded-xl p-2 text-left transition-colors hover:bg-blue-50/70"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-[10px] font-bold text-blue-700">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-900">{c.name}</p>
                          <p className="truncate text-[10px] text-slate-500">{c.email}</p>
                        </div>
                      </div>
                      {c.company && (
                        <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {c.company}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Service & Specialist Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-700">Service Offering</Label>
          <select
            value={serviceId}
            onChange={(e) => handleServiceSelect(e.target.value)}
            className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-none"
          >
            <option value="">Custom Operations Session</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} (${s.price.toFixed(2)} • {s.durationMinutes}m)
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-700">Assigned Specialist</Label>
          <select
            value={staffMemberId}
            onChange={(e) => {
              setStaffMemberId(e.target.value);
              setConflictAlert(null);
            }}
            className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-none"
          >
            <option value="">General Staff Pool / Unassigned</option>
            {staffMembers.map((sm) => {
              const isCertified = serviceId
                ? (sm.services || []).some((s) => s.id === serviceId)
                : false;
              return (
                <option key={sm.id} value={sm.id}>
                  {sm.name} ({sm.roleTitle}){serviceId ? (isCertified ? " • Certified" : "") : ""}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* 3. Date, Time & Duration */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-700">
            Date <span className="text-rose-500">*</span>
          </Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setConflictAlert(null);
            }}
            required
            className="rounded-xl border-slate-200 text-xs shadow-2xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-700">
            Start Time <span className="text-rose-500">*</span>
          </Label>
          <Input
            type="time"
            value={time}
            onChange={(e) => {
              setTime(e.target.value);
              setConflictAlert(null);
            }}
            required
            className="rounded-xl border-slate-200 text-xs shadow-2xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-700">Duration</Label>
          <select
            value={duration}
            onChange={(e) => {
              setDuration(Number(e.target.value));
              setConflictAlert(null);
            }}
            className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-none"
          >
            <option value={15}>15 mins</option>
            <option value={30}>30 mins</option>
            <option value={45}>45 mins</option>
            <option value={60}>60 mins (1 hr)</option>
            <option value={90}>90 mins (1.5 hrs)</option>
            <option value={120}>120 mins (2 hrs)</option>
          </select>
        </div>
      </div>

      {/* 4. Meeting Type Tabs */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-slate-700">Meeting Format</Label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setMeetingType("VIDEO")}
            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-semibold transition-all ${
              meetingType === "VIDEO"
                ? "border-purple-300 bg-purple-50 text-purple-700 shadow-xs"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Video className="h-3.5 w-3.5 text-purple-600" />
            <span>Video Bridge</span>
          </button>

          <button
            type="button"
            onClick={() => setMeetingType("IN_PERSON")}
            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-semibold transition-all ${
              meetingType === "IN_PERSON"
                ? "border-emerald-300 bg-emerald-50 text-emerald-700 shadow-xs"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
            <span>In-Person</span>
          </button>

          <button
            type="button"
            onClick={() => setMeetingType("PHONE")}
            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-semibold transition-all ${
              meetingType === "PHONE"
                ? "border-blue-300 bg-blue-50 text-blue-700 shadow-xs"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Phone className="h-3.5 w-3.5 text-blue-600" />
            <span>Phone Call</span>
          </button>
        </div>
      </div>

      {/* Title / Description */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-slate-700">Appointment Subject</Label>
        <Input
          placeholder="e.g. Q4 Strategy Review, Initial Consultation..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-xl border-slate-200 text-xs shadow-2xs"
        />
      </div>

      {/* Location */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-slate-700">Location or Meeting Link</Label>
        <Input
          placeholder="e.g. Meet URL, Office Studio 4B..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="rounded-xl border-slate-200 text-xs shadow-2xs"
        />
      </div>

      {/* Operational Notes */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-slate-700">Internal Session Notes</Label>
        <Textarea
          rows={2}
          placeholder="Private instructions, client briefing, or agenda..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="rounded-xl border-slate-200 text-xs shadow-2xs"
        />
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex items-center justify-end gap-2.5 pt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={createMutation.isPending}
          className="cursor-pointer rounded-xl border-slate-200 text-xs font-semibold text-slate-700"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={createMutation.isPending || !customerId || Boolean(conflictAlert)}
          className="cursor-pointer rounded-xl bg-blue-600 px-5 text-xs font-semibold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 disabled:opacity-50"
        >
          {createMutation.isPending ? (
            <>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              <span>Securing Slot...</span>
            </>
          ) : (
            <span>Confirm & Schedule</span>
          )}
        </Button>
      </div>
    </form>
  );
}

export function BookingWizardModal({
  isOpen,
  onClose,
  initialDate,
  initialTime,
  preselectedCustomerId,
  preselectedStaffId,
  organizationId,
}: BookingWizardModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-2xl backdrop-blur-xl sm:p-7">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="via-blue-650 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25">
              <Calendar className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50 px-3 py-1 text-[10px] font-extrabold text-blue-700 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              <span>Smart Booking Wizard</span>
            </span>
          </div>
          <DialogTitle className="mt-3.5 text-xl font-black tracking-tight text-slate-900">
            Book New Client Appointment
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Schedule an operational session, consultation, or billable service with real-time
            conflict detection.
          </DialogDescription>
        </DialogHeader>

        <BookingWizardForm
          onClose={onClose}
          initialDate={initialDate}
          initialTime={initialTime}
          preselectedCustomerId={preselectedCustomerId}
          preselectedStaffId={preselectedStaffId}
          organizationId={organizationId}
        />
      </DialogContent>
    </Dialog>
  );
}

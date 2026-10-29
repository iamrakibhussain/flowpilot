"use client";

import * as React from "react";
import { X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateStaff, useDeleteStaff } from "@/features/staff/use-staff";
import { useServices } from "@/features/appointments/use-appointments";
import type { StaffItem, StaffTier, StaffStatus } from "@/features/staff/types";

interface EditStaffModalProps {
  staff: StaffItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const ALL_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function EditStaffForm({ staff, onClose }: { staff: StaffItem; onClose: () => void }) {
  const updateStaffMutation = useUpdateStaff();
  const deleteStaffMutation = useDeleteStaff();
  const { data: services = [] } = useServices(true);

  const [name, setName] = React.useState(staff.name || "");
  const [roleTitle, setRoleTitle] = React.useState(staff.roleTitle || "");
  const [email, setEmail] = React.useState(staff.email || "");
  const [phone, setPhone] = React.useState(staff.phone || "");
  const [status, setStatus] = React.useState<StaffStatus>(staff.status || "AVAILABLE");
  const [tier, setTier] = React.useState<StaffTier>(staff.tier || "FULL_TIME");
  const [hourlyRate, setHourlyRate] = React.useState<string>(
    staff.hourlyRate != null ? String(staff.hourlyRate) : ""
  );
  const [commissionRate, setCommissionRate] = React.useState<string>(
    staff.commissionRate != null ? String(staff.commissionRate) : ""
  );
  const [shiftStart, setShiftStart] = React.useState(staff.shiftStart || "09:00");
  const [shiftEnd, setShiftEnd] = React.useState(staff.shiftEnd || "17:00");
  const [workingDays, setWorkingDays] = React.useState<string[]>(
    staff.workingDays || ["MON", "TUE", "WED", "THU", "FRI"]
  );
  const [selectedServiceIds, setSelectedServiceIds] = React.useState<string[]>(
    (staff.services || []).map((s) => s.id)
  );
  const [bio, setBio] = React.useState(staff.bio || "");
  const [error, setError] = React.useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = React.useState(false);

  const toggleDay = (day: string) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter((d) => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const toggleService = (serviceId: string) => {
    if (selectedServiceIds.includes(serviceId)) {
      setSelectedServiceIds(selectedServiceIds.filter((id) => id !== serviceId));
    } else {
      setSelectedServiceIds([...selectedServiceIds, serviceId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter the staff member's full name");
      return;
    }

    try {
      await updateStaffMutation.mutateAsync({
        id: staff.id,
        payload: {
          name: name.trim(),
          roleTitle: roleTitle.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          status,
          tier,
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
          commissionRate: commissionRate ? parseFloat(commissionRate) : null,
          shiftStart,
          shiftEnd,
          workingDays,
          serviceIds: selectedServiceIds,
          bio: bio.trim() || null,
        },
      });

      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update specialist profile";
      setError(msg);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteStaffMutation.mutateAsync(staff.id);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete staff member";
      setError(msg);
    }
  };

  return (
    <div className="border-border/80 bg-background relative z-10 flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl transition-all sm:rounded-3xl">
      {/* Header */}
      <div className="border-border/80 bg-card/60 flex shrink-0 items-center justify-between border-b px-4 py-3.5 sm:px-6 sm:py-4.5">
        <div className="flex min-w-0 items-center gap-2.5 pr-2 sm:gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-white shadow-sm sm:h-10 sm:w-10 sm:rounded-2xl ${staff.avatarBg}`}
          >
            {staff.initials}
          </div>
          <div className="min-w-0">
            <h2 className="text-foreground truncate text-sm font-bold sm:text-base">
              Edit Specialist Profile
            </h2>
            <p className="text-muted-foreground truncate text-[11px] sm:text-xs">
              Update credentials, contract tier, availability & assignments
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-foreground hover:bg-muted border-border/80 bg-muted/30 shrink-0 cursor-pointer rounded-xl border p-2 transition active:scale-95"
          aria-label="Close modal"
          title="Close (Esc)"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>

      {/* Form Body */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 space-y-4 overflow-y-auto p-4 text-xs sm:space-y-5 sm:p-6"
      >
        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Basic Identity */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Full Name</Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Specialization / Role</Label>
            <Input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              className="rounded-xl text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Work Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Contact Phone</Label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Operational Status & Tier */}
        <div className="border-border/80 space-y-3.5 rounded-2xl border p-4">
          <span className="text-foreground block text-xs font-semibold tracking-wider uppercase">
            Contract Tier & Current Status
          </span>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium">Current Status</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StaffStatus)}
                className="bg-background border-border text-foreground w-full rounded-xl border px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-none"
              >
                <option value="AVAILABLE">Available</option>
                <option value="IN_SESSION">In Session</option>
                <option value="ON_BREAK">On Break</option>
                <option value="OFFLINE">Offline</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium">Contract Tier</Label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as StaffTier)}
                className="bg-background border-border text-foreground w-full rounded-xl border px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-none"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACTOR">Contractor</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium">Hourly ($)</Label>
                <Input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  step="0.01"
                  className="rounded-xl font-mono text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium">Comm. (%)</Label>
                <Input
                  type="number"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  step="0.1"
                  placeholder="0"
                  className="rounded-xl font-mono text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Shift Hours & Working Days */}
        <div className="border-border/80 space-y-3.5 rounded-2xl border p-4">
          <span className="text-foreground block text-xs font-semibold tracking-wider uppercase">
            Shift Hours & Weekly Availability
          </span>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium">Shift Start</Label>
              <Input
                type="time"
                value={shiftStart}
                onChange={(e) => setShiftStart(e.target.value)}
                className="rounded-xl font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium">Shift End</Label>
              <Input
                type="time"
                value={shiftEnd}
                onChange={(e) => setShiftEnd(e.target.value)}
                className="rounded-xl font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block text-[11px] font-medium">Working Days</Label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_DAYS.map((day) => {
                const active = workingDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                      active
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "border-border text-muted-foreground hover:bg-muted/30 border"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Qualified Deliverables */}
        <div className="border-border/80 space-y-3 rounded-2xl border p-4">
          <div className="flex items-center justify-between">
            <span className="text-foreground block text-xs font-semibold tracking-wider uppercase">
              Assign Service Qualifications
            </span>
            <span className="text-muted-foreground text-[10px]">
              {selectedServiceIds.length} assigned
            </span>
          </div>

          <div className="grid max-h-40 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
            {services.map((svc) => {
              const isChecked = selectedServiceIds.includes(svc.id);
              return (
                <label
                  key={svc.id}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-2.5 transition ${
                    isChecked
                      ? "text-foreground border-blue-500/40 bg-blue-500/10"
                      : "border-border/60 hover:bg-muted/30 text-muted-foreground"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2 pr-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleService(svc.id)}
                      className="h-3.5 w-3.5 rounded text-blue-600"
                    />
                    <span className="truncate text-xs font-medium">{svc.name}</span>
                  </div>
                  <span className="text-foreground shrink-0 font-mono text-xs font-bold">
                    ${svc.price}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Bio / Background Notes */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Professional Background / Bio</Label>
          <textarea
            rows={2}
            className="border-border bg-background placeholder:text-muted-foreground w-full rounded-xl border p-3 text-xs focus:border-blue-500 focus:outline-none"
            placeholder="Specialist biography, notable accreditations, or internal operational notes..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        {/* Delete Danger Zone */}
        <div className="space-y-2 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="block text-xs font-bold text-rose-600 dark:text-rose-400">
                Archive / Delete Specialist
              </span>
              <span className="text-muted-foreground text-[11px]">
                Upcoming appointments will be safely unassigned without data loss.
              </span>
            </div>
            {!isConfirmingDelete ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsConfirmingDelete(true)}
                className="cursor-pointer border-rose-500/30 text-xs text-rose-600 hover:bg-rose-500/10"
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                <span>Delete</span>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsConfirmingDelete(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteStaffMutation.isPending}
                  className="bg-rose-600 text-xs text-white hover:bg-rose-700"
                >
                  {deleteStaffMutation.isPending ? "Removing..." : "Confirm Delete"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-border/80 bg-surface/90 flex flex-col-reverse items-center justify-end gap-2.5 border-t pt-4 sm:flex-row sm:gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-border w-full cursor-pointer rounded-xl text-xs font-semibold sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={updateStaffMutation.isPending}
            className="w-full cursor-pointer rounded-xl bg-blue-600 px-5 text-xs font-semibold text-white hover:bg-blue-700 sm:w-auto"
          >
            {updateStaffMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function EditStaffModal({ staff, isOpen, onClose }: EditStaffModalProps) {
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

  if (!isOpen || !staff) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-2.5 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <EditStaffForm key={staff.id} staff={staff} onClose={onClose} />
    </div>
  );
}

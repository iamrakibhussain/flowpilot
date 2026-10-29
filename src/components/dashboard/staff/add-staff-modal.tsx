"use client";

import * as React from "react";
import { X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateStaff } from "@/features/staff/use-staff";
import { useSendTeamInvitation } from "@/features/team/use-team";
import { useServices } from "@/features/appointments/use-appointments";
import type { StaffTier } from "@/features/staff/types";

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-indigo-600",
  "bg-violet-600",
  "bg-purple-600",
  "bg-rose-600",
  "bg-amber-600",
  "bg-emerald-600",
  "bg-cyan-600",
];

const ALL_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export function AddStaffModal({ isOpen, onClose }: AddStaffModalProps) {
  const createStaffMutation = useCreateStaff();
  const sendInviteMutation = useSendTeamInvitation();
  const [sendPortalInvite, setSendPortalInvite] = React.useState(true);
  const { data: services = [] } = useServices(true);

  const [name, setName] = React.useState("");
  const [roleTitle, setRoleTitle] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [tier, setTier] = React.useState<StaffTier>("FULL_TIME");
  const [hourlyRate, setHourlyRate] = React.useState<string>("");
  const [commissionRate, setCommissionRate] = React.useState<string>("");
  const [shiftStart, setShiftStart] = React.useState("09:00");
  const [shiftEnd, setShiftEnd] = React.useState("17:00");
  const [workingDays, setWorkingDays] = React.useState<string[]>([
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
  ]);
  const [selectedServiceIds, setSelectedServiceIds] = React.useState<string[]>([]);
  const [avatarBg, setAvatarBg] = React.useState(AVATAR_COLORS[0]);
  const [bio, setBio] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

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

  if (!isOpen) return null;

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
    if (!roleTitle.trim()) {
      setError("Please specify their specialization or role title");
      return;
    }

    try {
      const created = await createStaffMutation.mutateAsync({
        name: name.trim(),
        roleTitle: roleTitle.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        tier,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        commissionRate: commissionRate ? parseFloat(commissionRate) : undefined,
        shiftStart,
        shiftEnd,
        workingDays,
        serviceIds: selectedServiceIds,
        avatarBg,
        bio: bio.trim() || undefined,
      });

      if (sendPortalInvite && email.trim()) {
        try {
          await sendInviteMutation.mutateAsync({
            email: email.trim(),
            role: "MEMBER",
            staffMemberId: created.id,
          });
        } catch (inviteErr) {
          console.warn("Staff created but portal invitation failed to send:", inviteErr);
        }
      }

      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to provision team member";
      setError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-2.5 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="border-border/80 bg-background relative z-10 flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl transition-all sm:rounded-3xl">
        {/* Header */}
        <div className="border-border/80 bg-card/60 flex shrink-0 items-center justify-between border-b px-4 py-3.5 sm:px-6 sm:py-4.5">
          <div className="flex min-w-0 items-center gap-2.5 pr-2 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 shadow-sm sm:h-10 sm:w-10 sm:rounded-2xl">
              <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-foreground truncate text-sm font-bold sm:text-base">
                Onboard Team Specialist
              </h2>
              <p className="text-muted-foreground truncate text-[11px] sm:text-xs">
                Configure role, shift availability, compensation, and qualifications
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
              <Label className="text-xs font-semibold">
                Full Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="e.g. Dr. Sarah Jenkins"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Specialization / Role Title <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="e.g. Senior Dental Specialist"
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
                placeholder="sarah@agency.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Contact Phone</Label>
              <Input
                type="tel"
                placeholder="+1 (555) 019-2834"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>

            {email.trim().length > 0 && (
              <div className="flex items-center gap-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5 p-2.5 sm:col-span-2">
                <input
                  type="checkbox"
                  id="portal-invite-add"
                  checked={sendPortalInvite}
                  onChange={(e) => setSendPortalInvite(e.target.checked)}
                  className="h-3.5 w-3.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="portal-invite-add"
                  className="text-foreground cursor-pointer text-[11px] font-medium"
                >
                  Send workspace login invitation (Role:{" "}
                  <span className="font-bold text-blue-600">MEMBER</span>) to{" "}
                  <span className="font-mono text-blue-600">{email}</span>
                </label>
              </div>
            )}
          </div>

          {/* Tier & Compensation */}
          <div className="border-border/80 space-y-3.5 rounded-2xl border p-4">
            <span className="text-foreground block text-xs font-semibold tracking-wider uppercase">
              Contract Tier & Compensation
            </span>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium">Staff Tier</Label>
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

              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium">Hourly Rate ($)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 85.00"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  step="0.01"
                  className="rounded-xl font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium">Commission Cut (%)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 15.00"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  step="0.1"
                  className="rounded-xl font-mono text-xs"
                />
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

          {/* Qualified Deliverables & Services */}
          <div className="border-border/80 space-y-3 rounded-2xl border p-4">
            <div className="flex items-center justify-between">
              <span className="text-foreground block text-xs font-semibold tracking-wider uppercase">
                Assign Service Qualifications
              </span>
              <span className="text-muted-foreground text-[10px]">
                {selectedServiceIds.length} selected
              </span>
            </div>

            {services.length === 0 ? (
              <p className="text-muted-foreground text-[11px] italic">
                No active services configured in your catalog yet.
              </p>
            ) : (
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
            )}
          </div>

          {/* Bio / Background Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Professional Background / Bio</Label>
            <textarea
              rows={2}
              placeholder="Brief summary of specialist experience, certifications, and expertise..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="bg-background border-border text-foreground w-full rounded-xl border p-2.5 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Avatar Color Picker */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Avatar Color Palette</Label>
            <div className="flex items-center gap-2">
              {AVATAR_COLORS.map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setAvatarBg(bg)}
                  className={`h-7 w-7 cursor-pointer rounded-full transition ${bg} ${
                    avatarBg === bg
                      ? "scale-110 ring-2 ring-blue-500 ring-offset-2"
                      : "opacity-80 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-border/80 flex flex-col-reverse items-center justify-end gap-2.5 border-t pt-4 sm:flex-row sm:gap-3">
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
              disabled={createStaffMutation.isPending}
              className="w-full cursor-pointer rounded-xl bg-blue-600 px-5 text-xs font-semibold text-white hover:bg-blue-700 sm:w-auto"
            >
              {createStaffMutation.isPending ? "Onboarding..." : "Provision Specialist"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
  Coffee,
  Palmtree,
  Stethoscope,
  Building2,
  GraduationCap,
  Clock,
  Lock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useStaffMembers } from "@/features/appointments/use-appointments";
import { useCreateBlockedTime } from "@/features/staff/use-blocked-time";
import { useWorkspaceSession } from "@/features/organizations/use-workspace-session";
import type { BlockedTimeType } from "@/features/staff/types";

interface BlockTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
  defaultTime?: string;
  defaultStaffId?: string;
  defaultType?: BlockedTimeType;
}

const TYPE_CONFIG: Array<{
  type: BlockedTimeType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = [
  { type: "BREAK", label: "Break / Lunch", icon: Coffee, color: "hover:border-slate-400" },
  { type: "VACATION", label: "Vacation", icon: Palmtree, color: "hover:border-amber-500" },
  { type: "SICK_LEAVE", label: "Sick Leave", icon: Stethoscope, color: "hover:border-rose-500" },
  {
    type: "COMPANY_HOLIDAY",
    label: "Company Holiday",
    icon: Building2,
    color: "hover:border-indigo-500",
  },
  { type: "TRAINING", label: "Training", icon: GraduationCap, color: "hover:border-blue-500" },
  { type: "OTHER", label: "Other", icon: Clock, color: "hover:border-slate-500" },
];

function BlockTimeModalContent({
  onClose,
  defaultDate,
  defaultTime,
  defaultStaffId,
  defaultType,
}: Omit<BlockTimeModalProps, "isOpen">) {
  const { organizationRole, session } = useWorkspaceSession();
  const isLeader = organizationRole === "OWNER" || organizationRole === "ADMIN";
  const { data: staffMembers = [], isLoading: isLoadingStaff } = useStaffMembers();

  // Find linked staff profile for the logged in user
  const userStaffMember = React.useMemo(() => {
    if (!session?.user?.email) return null;
    return (
      staffMembers.find((s) => s.email?.toLowerCase() === session.user?.email?.toLowerCase()) ||
      null
    );
  }, [staffMembers, session]);
  const createMutation = useCreateBlockedTime();

  // Initial values computed directly for useState without cascading useEffect
  const todayStr = React.useMemo(() => {
    if (defaultDate) return defaultDate;
    const now = new Date();
    return now.toISOString().slice(0, 10);
  }, [defaultDate]);

  const nowTimeStr = React.useMemo(() => {
    if (defaultTime) return defaultTime;
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = now.getMinutes() < 30 ? "00" : "30";
    return `${h}:${m}`;
  }, [defaultTime]);

  const initialEndTime = React.useMemo(() => {
    if (defaultTime) {
      const [h, m] = defaultTime.split(":").map(Number);
      const endH = String((h + 1) % 24).padStart(2, "0");
      return `${endH}:${String(m).padStart(2, "0")}`;
    }
    return "13:00";
  }, [defaultTime]);

  const initialStaffId = React.useMemo(() => {
    if (defaultType === "COMPANY_HOLIDAY") return "";
    if (!isLeader && userStaffMember) return userStaffMember.id;
    if (defaultStaffId) return defaultStaffId;
    const matched = userStaffMember || staffMembers.find((s) => s.email === session?.user?.email);
    return matched?.id || staffMembers[0]?.id || "";
  }, [defaultType, isLeader, userStaffMember, defaultStaffId, staffMembers, session]);

  const [type, setType] = React.useState<BlockedTimeType>(defaultType || "BREAK");
  const [title, setTitle] = React.useState(
    defaultType === "COMPANY_HOLIDAY" ? "Office Holiday / Closed" : ""
  );
  const [selectedStaffId, setSelectedStaffId] = React.useState<string>(initialStaffId);
  const [isAllDay, setIsAllDay] = React.useState(defaultType === "COMPANY_HOLIDAY");
  const [date, setDate] = React.useState(todayStr);
  const [startTime, setStartTime] = React.useState(nowTimeStr);
  const [endTime, setEndTime] = React.useState(initialEndTime);
  const [notes, setNotes] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // When type is COMPANY_HOLIDAY, set default title and clear individual staff member
  const handleTypeSelect = (selected: BlockedTimeType) => {
    setType(selected);
    if (selected === "COMPANY_HOLIDAY") {
      setIsAllDay(true);
      if (!title || title === "Lunch Break" || title === "Personal Leave") {
        setTitle("Office Holiday / Closed");
      }
      setSelectedStaffId("");
    } else if (selected === "BREAK") {
      setIsAllDay(false);
      if (!title || title === "Office Holiday / Closed") {
        setTitle("Lunch Break");
      }
      if (!selectedStaffId && staffMembers.length > 0) {
        setSelectedStaffId(staffMembers[0].id);
      }
    } else if (selected === "VACATION" || selected === "SICK_LEAVE") {
      setIsAllDay(true);
      if (!title || title === "Office Holiday / Closed") {
        setTitle(selected === "VACATION" ? "Annual Vacation" : "Sick Leave");
      }
      if (!selectedStaffId && staffMembers.length > 0) {
        setSelectedStaffId(staffMembers[0].id);
      }
    }
  };

  // Quick preset buttons
  const applyPreset = (minutes: number, defaultName?: string) => {
    setIsAllDay(false);
    if (defaultName) setTitle(defaultName);
    const [h, m] = startTime.split(":").map(Number);
    const totalMinutes = h * 60 + m + minutes;
    const endH = String(Math.floor(totalMinutes / 60) % 24).padStart(2, "0");
    const endM = String(totalMinutes % 60).padStart(2, "0");
    setEndTime(`${endH}:${endM}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMessage("Please enter a title for this blocked slot");
      return;
    }

    if (type !== "COMPANY_HOLIDAY" && !selectedStaffId) {
      setErrorMessage("Please select a specialist or team member");
      return;
    }

    let startIso: string;
    let endIso: string;

    if (isAllDay) {
      startIso = `${date}T00:00:00.000Z`;
      endIso = `${date}T23:59:59.999Z`;
    } else {
      if (!startTime || !endTime) {
        setErrorMessage("Please enter both start time and end time");
        return;
      }
      if (endTime <= startTime) {
        setErrorMessage("End time must be after start time");
        return;
      }
      startIso = `${date}T${startTime}:00.000Z`;
      endIso = `${date}T${endTime}:00.000Z`;
    }

    try {
      await createMutation.mutateAsync({
        staffMemberId: type === "COMPANY_HOLIDAY" || !selectedStaffId ? null : selectedStaffId,
        title: trimmedTitle,
        type,
        startTime: startIso,
        endTime: endIso,
        allDay: isAllDay,
        notes: notes.trim() || null,
      });

      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to block time. Please try again.";
      setErrorMessage(msg);
    }
  };

  return (
    <DialogContent className="border-border/80 bg-card/95 text-card-foreground max-h-[92vh] w-[95vw] overflow-y-auto rounded-3xl border p-4 shadow-2xl backdrop-blur-2xl sm:max-w-xl sm:p-7">
      <DialogHeader className="space-y-2 pr-10">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-500 shadow-xs sm:h-11 sm:w-11">
            <Lock className="h-5 w-5" />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-600 shadow-2xs dark:text-amber-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
            <span>Schedule Lock Engine</span>
          </span>
        </div>
        <DialogTitle className="text-foreground text-lg font-black tracking-tight sm:text-xl">
          Block Time &amp; Availability
        </DialogTitle>
        <DialogDescription className="text-muted-foreground text-xs">
          Reserve calendar intervals for breaks, staff leaves, or company-wide office closures.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="mt-3 space-y-4">
        {/* Error Banner */}
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-500">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Type Selector */}
        <div>
          <Label className="text-foreground text-xs font-bold">Category</Label>
          <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TYPE_CONFIG.map((item) => {
              const Icon = item.icon;
              const isSelected = type === item.type;
              const disabled = item.type === "COMPANY_HOLIDAY" && !isLeader;

              return (
                <button
                  key={item.type}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleTypeSelect(item.type)}
                  className={`flex items-center justify-start gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all active:scale-95 sm:flex-col sm:justify-center sm:gap-1.5 ${
                    isSelected
                      ? "border-amber-500/60 bg-amber-500/15 text-amber-600 shadow-xs ring-1 ring-amber-500/30 dark:text-amber-300"
                      : "border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  } ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
                >
                  <Icon className="h-4 w-4 shrink-0 text-amber-500" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div>
          <Label htmlFor="block-title" className="text-foreground text-xs font-bold">
            Title / Reason <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="block-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Lunch Break, Annual Leave, Eid Holiday"
            className="border-border/80 bg-background text-foreground placeholder:text-muted-foreground mt-1.5 h-10 rounded-xl text-xs font-medium shadow-2xs focus-visible:border-amber-500"
            required
          />
        </div>

        {/* Specialist Selection */}
        {type !== "COMPANY_HOLIDAY" ? (
          <div>
            <Label htmlFor="block-staff" className="text-foreground text-xs font-bold">
              Team Member <span className="text-rose-500">*</span>
            </Label>
            {!isLeader ? (
              <div className="border-border/80 bg-muted/30 text-foreground mt-1.5 flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs font-medium">
                <span>
                  {userStaffMember?.name || session?.user?.name || "Your Personal Schedule"}
                </span>
                <span className="border-border/60 bg-background text-muted-foreground rounded-md border px-2 py-0.5 text-[10px] font-bold">
                  My Schedule (Locked)
                </span>
              </div>
            ) : (
              <select
                id="block-staff"
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                disabled={isLoadingStaff}
                className="border-border/80 bg-background text-foreground mt-1.5 h-10 w-full rounded-xl border px-3 text-xs font-medium shadow-2xs focus:border-amber-500 focus:outline-none"
              >
                <option value="" disabled>
                  Select specialist
                </option>
                {staffMembers.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} ({staff.roleTitle || "Specialist"})
                  </option>
                ))}
              </select>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3 text-xs text-indigo-600 dark:text-indigo-400">
            <span className="font-bold">Company-Wide Holiday:</span> This will automatically close
            availability for all specialists across the workspace.
          </div>
        )}

        {/* Date & All Day Toggle */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="block-date" className="text-foreground text-xs font-bold">
              Date
            </Label>
            <Input
              id="block-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-border/80 bg-background text-foreground mt-1.5 h-10 rounded-xl text-xs font-medium [color-scheme:dark] shadow-2xs"
            />
          </div>

          <div className="flex flex-col justify-end">
            <label className="border-border/80 bg-muted/20 text-foreground hover:bg-muted/40 flex h-10 cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 text-xs font-medium transition-colors">
              <input
                type="checkbox"
                checked={isAllDay}
                onChange={(e) => setIsAllDay(e.target.checked)}
                className="border-border h-4 w-4 cursor-pointer rounded text-amber-500 focus:ring-0"
              />
              <span className="font-semibold">All Day (Full Day Off)</span>
            </label>
          </div>
        </div>

        {/* Time pickers (if not All Day) */}
        {!isAllDay && (
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="block-start-time" className="text-foreground text-xs font-bold">
                  Start Time
                </Label>
                <Input
                  id="block-start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="border-border/80 bg-background text-foreground mt-1.5 h-10 rounded-xl text-xs font-medium [color-scheme:dark] shadow-2xs"
                />
              </div>
              <div>
                <Label htmlFor="block-end-time" className="text-foreground text-xs font-bold">
                  End Time
                </Label>
                <Input
                  id="block-end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="border-border/80 bg-background text-foreground mt-1.5 h-10 rounded-xl text-xs font-medium [color-scheme:dark] shadow-2xs"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-muted-foreground mr-1 text-[11px] font-bold">
                Quick Presets:
              </span>
              {[
                { label: "15m Break", mins: 15, name: "15 min Break" },
                { label: "30m Lunch", mins: 30, name: "Lunch Break" },
                { label: "1h Meeting", mins: 60, name: "1-Hour Team Session" },
                { label: "3h Half Day", mins: 180, name: "Half Day Leave" },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset.mins, preset.name)}
                  className="border-border/70 bg-muted/40 text-foreground cursor-pointer rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-all hover:border-amber-500/50 hover:bg-amber-500/10 active:scale-95"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <Label htmlFor="block-notes" className="text-foreground text-xs font-bold">
            Internal Notes <span className="text-muted-foreground font-normal">(Optional)</span>
          </Label>
          <Textarea
            id="block-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any internal context or coverage arrangements..."
            rows={2}
            className="border-border/80 bg-background text-foreground placeholder:text-muted-foreground mt-1.5 resize-none rounded-xl text-xs font-medium shadow-2xs focus-visible:border-amber-500"
          />
        </div>

        {/* Action buttons */}
        <div className="border-border/40 flex flex-col-reverse items-stretch justify-end gap-2.5 border-t pt-3 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={createMutation.isPending}
            className="border-border/80 text-muted-foreground hover:text-foreground h-10 cursor-pointer rounded-xl text-xs font-bold sm:h-9"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="h-10 cursor-pointer rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-xs font-black text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 active:scale-95 sm:h-9"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Blocked Time...
              </>
            ) : (
              "Confirm & Block Slot"
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

export function BlockTimeModal({
  isOpen,
  onClose,
  defaultDate,
  defaultTime,
  defaultStaffId,
  defaultType,
}: BlockTimeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {isOpen && (
        <BlockTimeModalContent
          key={`${isOpen}-${defaultDate || ""}-${defaultTime || ""}-${defaultStaffId || ""}-${defaultType || ""}`}
          onClose={onClose}
          defaultDate={defaultDate}
          defaultTime={defaultTime}
          defaultStaffId={defaultStaffId}
          defaultType={defaultType}
        />
      )}
    </Dialog>
  );
}

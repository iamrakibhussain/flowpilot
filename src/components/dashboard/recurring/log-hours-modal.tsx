"use client";

import React from "react";
import { Clock, AlertTriangle, CheckCircle2, Loader2, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLogRetainerHours } from "@/features/recurring/use-recurring";
import type { RecurringScheduleListItem } from "@/features/recurring/types";

interface LogHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: RecurringScheduleListItem | null;
  onSuccess?: () => void;
}

export function LogHoursModal({ isOpen, onClose, schedule, onSuccess }: LogHoursModalProps) {
  const [hours, setHours] = React.useState<string>("1.0");
  const [date, setDate] = React.useState<string>(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);

  const logMutation = useLogRetainerHours();

  const handleClose = () => {
    setHours("1.0");
    setDate(new Date().toISOString().slice(0, 10));
    setNotes("");
    setError(null);
    onClose();
  };

  if (!schedule) return null;

  const currentLogged = schedule.currentRetainerLog?.hoursLogged ?? 0;
  const allocated = schedule.currentRetainerLog?.hoursAllocated ?? schedule.retainerHours ?? 0;
  const parsedHours = parseFloat(hours) || 0;
  const newTotalLogged = Math.round((currentLogged + parsedHours) * 100) / 100;
  const newOverage = Math.max(0, Math.round((newTotalLogged - allocated) * 100) / 100);
  const overageRate = schedule.overageHourlyRate ?? 0;
  const overageCost = Math.round(newOverage * overageRate * 100) / 100;

  const currentBurnPercent =
    allocated > 0 ? Math.min(100, Math.round((currentLogged / allocated) * 100)) : 0;
  const newBurnPercent =
    allocated > 0 ? Math.min(100, Math.round((newTotalLogged / allocated) * 100)) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (parsedHours <= 0) {
      setError("Logged hours must be greater than zero");
      return;
    }

    try {
      await logMutation.mutateAsync({
        scheduleId: schedule.id,
        payload: {
          hours: parsedHours,
          date: new Date(date).toISOString(),
          notes: notes.trim() || undefined,
        },
      });

      onSuccess?.();
      handleClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to log retainer hours. Please try again.";
      setError(message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="border-border/80 max-h-[90vh] w-[95vw] overflow-x-hidden overflow-y-auto rounded-2xl border p-5 pr-12 shadow-2xl sm:max-w-md sm:rounded-3xl sm:p-6 sm:pr-6">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 shadow-xs dark:text-indigo-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-extrabold tracking-tight">
                Log Retainer Hours
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-0.5 text-xs">
                Record billable client hours for{" "}
                <span className="text-foreground font-bold">{schedule.title}</span>.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-3 text-xs font-semibold text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* Live Interactive Quota Meter */}
          <div className="bg-muted/30 border-border/70 space-y-3 rounded-xl border p-4">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-muted-foreground">Active Retainer Burn:</span>
              <span className="text-foreground font-mono">
                {currentLogged} hrs → <span className="text-primary">{newTotalLogged} hrs</span> /{" "}
                {allocated} hrs
              </span>
            </div>

            {/* Visual Dual Progress Track */}
            <div className="bg-muted relative h-2.5 w-full overflow-hidden rounded-full">
              {/* Existing burned */}
              <div
                className="absolute top-0 left-0 h-full rounded-full bg-indigo-600/60 transition-all"
                style={{ width: `${currentBurnPercent}%` }}
              />
              {/* New burned projection */}
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  newOverage > 0
                    ? "bg-rose-500"
                    : newBurnPercent >= 80
                      ? "bg-amber-500"
                      : "bg-indigo-600"
                }`}
                style={{ width: `${newBurnPercent}%` }}
              />
            </div>

            <div className="text-muted-foreground border-border/50 flex items-center justify-between border-t pt-1 text-[11px]">
              <span>Allocated: {allocated} hrs</span>
              <span>Remaining: {Math.max(0, allocated - newTotalLogged)} hrs</span>
            </div>
          </div>

          {/* Overage Warning / Notice */}
          {newOverage > 0 ? (
            <div className="space-y-1 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3.5 text-xs text-amber-700 dark:text-amber-400">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                Quota Exceeded (+{newOverage} hrs overage)
              </div>
              <p className="text-[11px] leading-relaxed">
                This entry exceeds the contracted {allocated} hours. Overage will bill at{" "}
                <span className="text-foreground font-bold">
                  ${overageRate}/hr (Est. +${overageCost})
                </span>{" "}
                in the upcoming invoice.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>
                Within monthly quota. {Math.max(0, allocated - newTotalLogged)} hrs remaining after
                this entry.
              </span>
            </div>
          )}

          {/* Inputs Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="hours" className="text-foreground text-xs font-bold">
                Hours to Add *
              </Label>
              <Input
                id="hours"
                type="number"
                step="0.25"
                min="0.25"
                max="100"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="2.5"
                required
                className="h-9.5 rounded-xl font-mono text-sm font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-foreground text-xs font-bold">
                Work Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="h-9.5 rounded-xl text-xs font-medium"
              />
            </div>
          </div>

          {/* Notes Input */}
          <div className="space-y-1.5">
            <Label
              htmlFor="notes"
              className="text-foreground flex items-center gap-1.5 text-xs font-bold"
            >
              <FileText className="text-muted-foreground h-3.5 w-3.5" />
              Task / Work Performed Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Performance audit, API optimization, client strategy review..."
              rows={3}
              className="resize-none rounded-xl text-xs"
            />
          </div>

          <div className="flex flex-col-reverse items-stretch justify-end gap-2 pt-2 sm:flex-row sm:items-center sm:gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={logMutation.isPending}
              className="h-10 w-full cursor-pointer rounded-xl text-xs font-semibold sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={logMutation.isPending || parsedHours <= 0}
              className="h-10 w-full cursor-pointer rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-md hover:bg-indigo-700 sm:w-auto"
            >
              {logMutation.isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                `Confirm & Log ${parsedHours} hrs`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

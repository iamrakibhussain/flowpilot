"use client";

import * as React from "react";
import {
  X,
  Clock,
  Shield,
  Users,
  Edit,
  Trash2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeleteService, useToggleServiceActive } from "@/features/services/use-services";
import type { ServiceItem } from "@/features/services/types";

interface ServiceQuickPeekDrawerProps {
  service: ServiceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenEdit: (service: ServiceItem) => void;
}

export function ServiceQuickPeekDrawer({
  service,
  isOpen,
  onClose,
  onOpenEdit,
}: ServiceQuickPeekDrawerProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const deleteMutation = useDeleteService();
  const toggleMutation = useToggleServiceActive();

  const handleClose = React.useCallback(() => {
    setShowDeleteConfirm(false);
    onClose();
  }, [onClose]);

  // Handle ESC key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen || !service) return null;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(service.id);
      setShowDeleteConfirm(false);
      onClose();
    } catch (err) {
      console.error("Failed to delete service:", err);
    }
  };

  const handleToggle = async () => {
    try {
      await toggleMutation.mutateAsync(service.id);
    } catch (err) {
      console.error("Failed to toggle service status:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 flex w-full max-w-full pl-0 sm:w-auto sm:pl-10">
        <div className="border-border/80 bg-background text-foreground flex h-[100dvh] h-full w-full max-w-full flex-col overflow-hidden border-l shadow-2xl transition-transform duration-300 sm:w-[520px]">
          {/* Mobile Drag Indicator */}
          <div className="bg-background flex shrink-0 items-center justify-center pt-2.5 pb-1 sm:hidden">
            <div className="bg-border h-1 w-12 rounded-full" />
          </div>

          {/* Header */}
          <div className="border-border/80 bg-card/60 flex shrink-0 items-center justify-between border-b px-4 py-3.5 backdrop-blur-md sm:px-6 sm:py-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="mb-1 inline-block rounded-full border border-blue-200/60 bg-blue-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-blue-700 dark:border-blue-800/50 dark:bg-blue-950/40 dark:text-blue-300">
                  {service.category || "General"}
                </span>
                <h2 className="text-foreground truncate text-base font-bold sm:text-lg">
                  {service.name}
                </h2>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenEdit(service)}
                className="border-border/80 text-foreground hover:bg-muted flex h-8 cursor-pointer items-center gap-1.5 px-2.5 text-xs"
              >
                <Edit className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
              <button
                type="button"
                onClick={handleClose}
                className="text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded-lg p-1.5 transition-colors"
                aria-label="Close drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
            {/* Status & Price Banner */}
            <div className="grid grid-cols-2 gap-3">
              <div className="border-border/80 bg-card rounded-xl border p-3.5 shadow-2xs">
                <span className="text-muted-foreground text-[11px] font-semibold">Full Fee</span>
                <p className="text-foreground mt-0.5 font-mono text-2xl font-black">
                  ${service.price.toFixed(2)}
                </p>
                <span className="text-muted-foreground text-[10px]">Standard rate</span>
              </div>

              <div className="border-border/80 bg-card rounded-xl border p-3.5 shadow-2xs">
                <span className="text-muted-foreground text-[11px] font-semibold">
                  Session Length
                </span>
                <p className="mt-0.5 font-mono text-2xl font-black text-blue-600 dark:text-blue-400">
                  {service.durationMinutes}m
                </p>
                <span className="text-muted-foreground text-[10px]">
                  {service.durationMinutes >= 60
                    ? `${(service.durationMinutes / 60).toFixed(1)} hours`
                    : "Under 1 hour"}
                </span>
              </div>
            </div>

            {/* Catalog Visibility Toggle Card */}
            <div className="border-border/80 bg-card flex items-center justify-between rounded-xl border p-4 shadow-2xs">
              <div>
                <p className="text-foreground text-xs font-bold">Catalog Status</p>
                <p className="text-muted-foreground text-[11px]">
                  {service.isActive
                    ? "Available to clients & staff booking"
                    : "Archived / hidden from booking flows"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggle}
                disabled={toggleMutation.isPending}
                className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                  service.isActive
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "border-border/80 bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {service.isActive ? "Active (Live)" : "Inactive"}
              </button>
            </div>

            {/* Description */}
            {service.description && (
              <div className="space-y-1.5">
                <h3 className="text-foreground text-xs font-bold">Description</h3>
                <p className="border-border/80 bg-card text-muted-foreground rounded-xl border p-3.5 text-xs leading-relaxed shadow-2xs">
                  {service.description}
                </p>
              </div>
            )}

            {/* Smart Buffer Timing Visual Diagram */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-foreground text-xs font-bold">Buffer & Calendar Protection</h3>
              </div>
              <div className="border-border/80 bg-card space-y-3 rounded-xl border p-4 shadow-2xs">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex-1 text-center">
                    <span className="text-muted-foreground text-[11px] font-medium">
                      Setup Buffer
                    </span>
                    <p className="mt-0.5 font-bold text-blue-600 dark:text-blue-400">
                      {service.bufferBefore} min
                    </p>
                  </div>
                  <ArrowRight className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                  <div className="flex-1 text-center">
                    <span className="text-muted-foreground text-[11px] font-medium">Session</span>
                    <p className="text-foreground mt-0.5 font-bold">
                      {service.durationMinutes} min
                    </p>
                  </div>
                  <ArrowRight className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                  <div className="flex-1 text-center">
                    <span className="text-muted-foreground text-[11px] font-medium">
                      Cleanup Buffer
                    </span>
                    <p className="mt-0.5 font-bold text-emerald-600 dark:text-emerald-400">
                      {service.bufferAfter} min
                    </p>
                  </div>
                </div>

                <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  {service.bufferBefore > 0 && (
                    <div
                      style={{
                        width: `${(service.bufferBefore / (service.bufferBefore + service.durationMinutes + service.bufferAfter)) * 100}%`,
                      }}
                      className="h-full bg-blue-500"
                      title={`Buffer Before: ${service.bufferBefore}m`}
                    />
                  )}
                  <div
                    style={{
                      width: `${(service.durationMinutes / (service.bufferBefore + service.durationMinutes + service.bufferAfter)) * 100}%`,
                    }}
                    className="bg-primary h-full"
                    title={`Session Duration: ${service.durationMinutes}m`}
                  />
                  {service.bufferAfter > 0 && (
                    <div
                      style={{
                        width: `${(service.bufferAfter / (service.bufferBefore + service.durationMinutes + service.bufferAfter)) * 100}%`,
                      }}
                      className="h-full bg-emerald-500"
                      title={`Buffer After: ${service.bufferAfter}m`}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Deposit Terms */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-foreground text-xs font-bold">Deposit Policy</h3>
              </div>
              <div className="border-border/80 bg-card rounded-xl border p-4 shadow-2xs">
                {service.requireDeposit ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-foreground text-xs font-bold">Deposit Enforced</p>
                      <p className="text-muted-foreground mt-0.5 text-[11px]">
                        Client must pay upfront to secure calendar reservation.
                      </p>
                    </div>
                    <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                      {service.depositType === "PERCENTAGE"
                        ? `${service.depositAmount}% Deposit`
                        : `$${Number(service.depositAmount).toFixed(2)} Deposit`}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-foreground text-xs font-semibold">No Deposit Required</p>
                      <p className="text-muted-foreground mt-0.5 text-[11px]">
                        Clients can reserve time without immediate advance payment.
                      </p>
                    </div>
                    <span className="border-border/80 bg-muted text-muted-foreground rounded-md border px-2 py-0.5 text-[11px] font-semibold">
                      Standard
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Assigned Specialists */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-foreground text-xs font-bold">
                    Qualified Specialists ({service.staffMembers?.length || 0})
                  </h3>
                </div>
              </div>

              {!service.staffMembers || service.staffMembers.length === 0 ? (
                <div className="border-border/80 bg-card rounded-xl border p-4 text-center shadow-2xs">
                  <p className="text-foreground text-xs font-semibold">
                    No specialists currently assigned.
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-[11px]">
                    Click &quot;Edit&quot; above to assign team members.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {service.staffMembers.map((sm) => (
                    <div
                      key={sm.id}
                      className="border-border/80 bg-card flex items-center gap-3 rounded-xl border p-3 shadow-2xs"
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-2xs ${
                          sm.avatarBg || "bg-blue-600"
                        }`}
                      >
                        {sm.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-foreground truncate text-xs font-bold">{sm.name}</p>
                        <p className="text-muted-foreground truncate text-[11px]">{sm.roleTitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Danger Zone: Delete / Archive */}
            <div className="border-border/80 border-t pt-4">
              {showDeleteConfirm ? (
                <div className="space-y-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 shadow-2xs dark:border-rose-800 dark:bg-rose-950/40">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                    <div>
                      <p className="text-xs font-bold text-rose-700 dark:text-rose-300">
                        Confirm Deletion
                      </p>
                      <p className="mt-0.5 text-[11px] text-rose-600/90 dark:text-rose-400/90">
                        If this service has past appointments, it will be safely archived without
                        losing historic records.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="border-border/80 text-foreground hover:bg-muted flex-1 cursor-pointer text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="flex-1 cursor-pointer bg-rose-600 text-xs font-bold text-white shadow-xs hover:bg-rose-700"
                    >
                      {deleteMutation.isPending ? "Processing..." : "Confirm Delete"}
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-rose-200 px-3 py-2.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-800/60 dark:text-rose-400 dark:hover:bg-rose-950/30"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete or Archive Service</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Bottom Close Button */}
          <div className="border-border/80 bg-card/60 border-t p-4 sm:hidden">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-border/80 text-foreground hover:bg-muted w-full cursor-pointer text-xs"
            >
              Close Drawer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

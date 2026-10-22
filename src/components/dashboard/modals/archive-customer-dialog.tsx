"use client";

import * as React from "react";
import { RefreshCw, AlertTriangle, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useArchiveCustomer, useReactivateCustomer } from "@/features/customers/use-customers";
import type { CustomerListItem, CustomerDetailResponse } from "@/features/customers/types";

export interface ArchiveCustomerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerListItem | CustomerDetailResponse | null;
  mode?: "archive" | "reactivate";
  onSuccess?: () => void;
}

export function ArchiveCustomerDialog({
  isOpen,
  onClose,
  customer,
  mode = "archive",
  onSuccess,
}: ArchiveCustomerDialogProps) {
  const archiveMutation = useArchiveCustomer();
  const reactivateMutation = useReactivateCustomer();

  const isPending = archiveMutation.isPending || reactivateMutation.isPending;
  const isArchive = mode === "archive";

  const [serverError, setServerError] = React.useState<string | null>(null);

  const handleConfirm = async () => {
    if (!customer || isPending) return;
    setServerError(null);

    try {
      if (isArchive) {
        await archiveMutation.mutateAsync(customer.id);
      } else {
        await reactivateMutation.mutateAsync(customer.id);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : `Failed to ${isArchive ? "archive" : "reactivate"} customer.`;
      setServerError(msg);
    }
  };

  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl sm:max-w-md">
        <DialogHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-inner ${
                isArchive
                  ? "bg-amber-100 text-amber-700 shadow-amber-500/20"
                  : "bg-emerald-100 text-emerald-700 shadow-emerald-500/20"
              }`}
            >
              {isArchive ? (
                <AlertTriangle className="h-6 w-6" />
              ) : (
                <RefreshCw className="h-6 w-6" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold tracking-tight text-slate-900">
                {isArchive ? "Archive Client Record" : "Reactivate Client Record"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Confirm status lifecycle transition for{" "}
                <strong className="text-slate-800">{customer.name}</strong>.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {serverError && (
          <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-700 shadow-2xs">
            {serverError}
          </div>
        )}

        <div className="space-y-3.5 py-3 text-xs text-slate-600">
          {isArchive ? (
            <>
              <p className="leading-relaxed">
                Archiving this client marks their record as{" "}
                <span className="font-bold text-slate-800">INACTIVE</span>. They will no longer
                appear in active appointment scheduling pickers or active invoice creation menus.
              </p>
              <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/80 p-3.5 text-emerald-800">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <div className="text-[11px] leading-relaxed">
                  <strong className="block font-bold">Zero Data Loss Guarantee:</strong> All past
                  invoices, historical payments, and appointment audit trails remain 100% preserved
                  in PostgreSQL. You can reactivate this record anytime.
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="leading-relaxed">
                Reactivating this client restores their account to{" "}
                <span className="font-bold text-emerald-700">ACTIVE</span> status, immediately
                re-enabling them across calendar scheduling and billing workflows.
              </p>
              <div className="flex items-start gap-2.5 rounded-2xl border border-blue-200/80 bg-blue-50/80 p-3.5 text-blue-800">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <div className="text-[11px] leading-relaxed">
                  <strong className="block font-bold">Immediate Availability:</strong> Client
                  dossier and historical ledger will seamlessly reintegrate into all workspace
                  views.
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="border-t border-slate-100 pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isPending}
            className="cursor-pointer rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isPending}
            onClick={handleConfirm}
            className={`cursor-pointer rounded-xl px-4 text-xs font-semibold text-white shadow-md ${
              isArchive
                ? "bg-amber-600 shadow-amber-600/20 hover:bg-amber-700"
                : "bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-700"
            }`}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : isArchive ? (
              <span>Archive Client</span>
            ) : (
              <span>Reactivate Client</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

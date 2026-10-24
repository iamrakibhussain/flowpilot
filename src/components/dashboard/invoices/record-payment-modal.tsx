"use client";

import * as React from "react";
import {
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Lock,
  Wallet,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRecordPayment } from "@/features/invoices/use-invoices";
import type { InvoiceListItem } from "@/features/invoices/types";

interface RecordPaymentModalProps {
  invoice: InvoiceListItem | null;
  isOpen: boolean;
  onClose: () => void;
  organizationId?: string;
}

const PAYMENT_METHODS = [
  { id: "BANK_TRANSFER", label: "Bank Wire / ACH", icon: Building2, desc: "Direct clearing" },
  {
    id: "CREDIT_CARD",
    label: "Credit Card / Stripe",
    icon: CreditCard,
    desc: "Instant settlement",
  },
  { id: "CASH", label: "Cash Settlement", icon: Wallet, desc: "Physical receipt" },
  { id: "CHECK", label: "Corporate Cheque", icon: FileCheck2, desc: "Bank check clearing" },
  { id: "WIRE", label: "International Swift", icon: Building2, desc: "Cross-border wire" },
  { id: "OTHER", label: "Direct Transfer", icon: CheckCircle2, desc: "Other payment route" },
];

function RecordPaymentContent({
  invoice,
  onClose,
  organizationId,
}: {
  invoice: InvoiceListItem;
  onClose: () => void;
  organizationId?: string;
}) {
  const recordPaymentMutation = useRecordPayment();

  const [paymentMethod, setPaymentMethod] = React.useState("BANK_TRANSFER");
  const [paidAt, setPaidAt] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [referenceNotes, setReferenceNotes] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      await recordPaymentMutation.mutateAsync({
        id: invoice.id,
        payload: {
          paidAt: new Date(paidAt).toISOString(),
          paymentMethod,
          referenceNotes: referenceNotes.trim() || undefined,
        },
        organizationId,
      });

      onClose();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to record payment. Please try again.";
      setErrorMessage(msg);
    }
  };

  return (
    <>
      <DialogHeader className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-lg font-black tracking-tight text-slate-900">
                Record Payment & Clear Invoice
              </DialogTitle>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-600/20">
                Treasury
              </span>
            </div>
            <DialogDescription className="text-xs text-slate-500">
              Settle Invoice #{invoice.invoiceNumber} • Billed to {invoice.customerName}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* Amount Settlement Callout Card */}
      <div className="my-1 rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-emerald-50/70 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black tracking-widest text-emerald-800 uppercase">
              Settlement Amount Due
            </p>
            <p className="font-mono text-3xl font-black tracking-tight text-emerald-950">
              ${invoice.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-white/80 px-3 py-1 text-xs font-bold text-emerald-800 shadow-xs">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Full Settlement
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p className="font-medium">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Payment Method Selector */}
        <div className="space-y-2">
          <Label className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            Clearing Route / Payment Channel
          </Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              const isSelected = paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50/80 font-bold text-emerald-950 shadow-sm ring-2 ring-emerald-500/30"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50/80"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <Icon
                      className={`h-4 w-4 ${isSelected ? "text-emerald-600" : "text-slate-400"}`}
                    />
                    {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />}
                  </div>
                  <div>
                    <p className="text-xs leading-tight font-bold">{method.label}</p>
                    <p className="text-[10px] font-normal text-slate-400">{method.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Date */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="paidAt" className="text-xs font-semibold text-slate-700">
              Payment Received Date
            </Label>
            <button
              type="button"
              onClick={() => setPaidAt(new Date().toISOString().slice(0, 10))}
              className="text-[10px] font-bold text-emerald-700 hover:underline"
            >
              Today
            </button>
          </div>
          <div className="relative">
            <Calendar className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="paidAt"
              type="date"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              required
              className="h-10 rounded-xl border-slate-200 pl-9 font-mono text-xs focus-visible:ring-emerald-500"
            />
          </div>
        </div>

        {/* Reference Notes / Transaction ID */}
        <div className="space-y-1.5">
          <Label htmlFor="referenceNotes" className="text-xs font-semibold text-slate-700">
            Transaction Reference / Check # / Receipt Notes{" "}
            <span className="font-normal text-slate-400">(Optional)</span>
          </Label>
          <Textarea
            id="referenceNotes"
            placeholder="e.g. Wire confirmation #TRX-94812, Stripe charge #ch_3M..., or Bank Cheque #1042"
            value={referenceNotes}
            onChange={(e) => setReferenceNotes(e.target.value)}
            rows={2}
            className="resize-none rounded-xl border-slate-200 text-xs focus-visible:ring-emerald-500"
          />
        </div>

        <DialogFooter className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={recordPaymentMutation.isPending}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={recordPaymentMutation.isPending}
            className="gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 font-semibold text-white shadow-md shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 focus-visible:ring-emerald-500 active:scale-98"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>
              {recordPaymentMutation.isPending
                ? "Clearing Statement..."
                : "Confirm & Settle Invoice"}
            </span>
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function RecordPaymentModal({
  invoice,
  isOpen,
  onClose,
  organizationId,
}: RecordPaymentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] rounded-2xl border-slate-200/90 bg-white p-4 shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-6">
        {isOpen && invoice && (
          <RecordPaymentContent
            invoice={invoice}
            onClose={onClose}
            organizationId={organizationId}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

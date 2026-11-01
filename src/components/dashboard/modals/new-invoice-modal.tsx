"use client";

import * as React from "react";
import {
  CreditCard,
  Plus,
  Trash2,
  Building2,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
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
import {
  useDashboardCustomersData,
  useDashboardMutations,
} from "@/features/dashboard/use-dashboard";
import { useServices } from "@/features/services/use-services";

interface LineItem {
  id: string;
  description: string;
  rate: number;
  quantity: number;
}

export interface NewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewInvoiceModal({ isOpen, onClose }: NewInvoiceModalProps) {
  const customersQuery = useDashboardCustomersData();
  const servicesQuery = useServices({ activeOnly: true });
  const { createInvoice } = useDashboardMutations();

  const [selectedClient, setSelectedClient] = React.useState<string>("");
  const [customClientName, setCustomClientName] = React.useState<string>("");

  const defaultDueDate = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  }, []);

  const [dueDate, setDueDate] = React.useState(defaultDueDate);
  const [taxRate, setTaxRate] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [createdRefCode, setCreatedRefCode] = React.useState("");

  const customers = customersQuery.data ?? [];
  const services = servicesQuery.data ?? [];
  const activeClient =
    customers.length > 0
      ? selectedClient === "__new__"
        ? customClientName
        : selectedClient || customers[0]?.name || ""
      : customClientName || selectedClient;

  const [lineItems, setLineItems] = React.useState<LineItem[]>([
    {
      id: "item-1",
      description: "Professional Services Retainer",
      rate: 500,
      quantity: 1,
    },
  ]);

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: "Consultation / Service Hours",
        rate: 200,
        quantity: 1,
      },
    ]);
  };

  const addServiceLineItem = (srv: { name: string; price: number }) => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${prev.length + 1}`,
        description: srv.name,
        rate: Number(srv.price) || 0,
        quantity: 1,
      },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (
    id: string,
    field: "description" | "rate" | "quantity",
    value: string | number
  ) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return { ...item, [field]: value };
      })
    );
  };

  const subtotal = lineItems.reduce(
    (acc, item) => acc + (Number(item.rate) || 0) * (Number(item.quantity) || 0),
    0
  );
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  const handleClose = () => {
    setErrorMessage(null);
    setIsSuccess(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await createInvoice({
        customerName: activeClient,
        amount: total,
        dueDate: dueDate,
        status: "PENDING",
        items: lineItems.map((item) => ({
          description: item.description,
          rate: Number(item.rate) || 0,
          quantity: Number(item.quantity) || 1,
        })),
      });
      if (res?.invoiceNumber) {
        setCreatedRefCode(res.invoiceNumber);
      }
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to create invoice. Please try again.";
      console.error("Invoice creation failed:", err);
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-h-[92vh] w-[95vw] overflow-y-auto rounded-3xl border border-slate-200/90 bg-white p-4 shadow-2xl sm:max-w-2xl sm:p-7">
        <DialogHeader className="space-y-1 pr-10">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <CreditCard className="h-4 w-4" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Create New Invoice{createdRefCode ? ` (${createdRefCode})` : ""}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            Generate and dispatch an itemized invoice for client business billing.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="space-y-3 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Invoice Issued Successfully!</h3>
            <p className="mx-auto max-w-sm text-xs text-slate-500">
              Invoice #{createdRefCode} for ${total.toFixed(2)} has been recorded and sent to{" "}
              <span className="font-semibold text-slate-700">{activeClient}</span>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            {/* Top Row: Client & Due Date */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="invoice-client" className="text-xs font-semibold text-slate-700">
                  Client / Organization
                </Label>
                {customers.length > 0 ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <Building2 className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                      <select
                        id="invoice-client"
                        value={selectedClient}
                        onChange={(e) => setSelectedClient(e.target.value)}
                        className="focus:border-primary focus:ring-primary/20 h-10 w-full rounded-xl border border-slate-200 bg-white pr-3 pl-9 text-xs font-medium text-slate-800 shadow-2xs outline-none focus:ring-2"
                      >
                        {customers.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name} ({c.tier ?? "Client"})
                          </option>
                        ))}
                        <option value="__new__">+ Enter New Client / Organization...</option>
                      </select>
                    </div>
                    {selectedClient === "__new__" && (
                      <Input
                        placeholder="Type client or company name"
                        value={customClientName}
                        onChange={(e) => setCustomClientName(e.target.value)}
                        className="h-9 text-xs"
                        required
                      />
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <Building2 className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="invoice-client"
                      placeholder="Enter Client or Company Name"
                      value={customClientName}
                      onChange={(e) => setCustomClientName(e.target.value)}
                      className="h-10 pl-9 text-xs"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="invoice-due-date" className="text-xs font-semibold text-slate-700">
                  Payment Due Date
                </Label>
                <div className="relative">
                  <Calendar className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="invoice-due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-10 pl-9 text-xs"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Line Items Table Builder */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label className="text-xs font-semibold text-slate-700">Itemized Line Items</Label>
                <div className="flex items-center gap-2">
                  {services.length > 0 && (
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        const selected = services.find((s) => s.id === e.target.value);
                        if (selected) {
                          addServiceLineItem(selected);
                          e.target.value = "";
                        }
                      }}
                      className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-700 shadow-2xs outline-none hover:bg-slate-50 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="" disabled>
                        + Add from Service...
                      </option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} (${s.price})
                        </option>
                      ))}
                    </select>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLineItem}
                    className="text-primary h-7 rounded-lg text-[11px] font-semibold"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add Line
                  </Button>
                </div>
              </div>

              <div className="space-y-2.5 rounded-2xl border border-slate-200/90 bg-slate-50/50 p-2.5 sm:p-3">
                {lineItems.map((item) => {
                  const lineTotal = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
                  return (
                    <div
                      key={item.id}
                      className="space-y-2.5 rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs transition-shadow hover:shadow-sm sm:grid sm:grid-cols-12 sm:items-center sm:gap-2.5 sm:space-y-0"
                    >
                      {/* Top Row on Mobile: Description + Delete button */}
                      <div className="flex items-center gap-2 sm:col-span-6">
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(item.id, "description", e.target.value)}
                          placeholder="Service description..."
                          className="h-9 flex-1 rounded-lg border-slate-200 text-xs"
                          required
                        />
                        {/* Mobile delete button */}
                        <button
                          type="button"
                          onClick={() => removeLineItem(item.id)}
                          disabled={lineItems.length === 1}
                          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 sm:hidden"
                          title="Remove line"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Bottom Row on Mobile / Cols 7-12 on Desktop */}
                      <div className="grid grid-cols-12 items-center gap-2 sm:col-span-6">
                        <div className="col-span-4 sm:col-span-4">
                          <Label className="text-[10px] font-semibold text-slate-500 sm:hidden">
                            Qty
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(item.id, "quantity", Number(e.target.value))
                            }
                            className="h-9 rounded-lg border-slate-200 text-center font-mono text-xs"
                            placeholder="Qty"
                            required
                          />
                        </div>
                        <div className="col-span-4 sm:col-span-4">
                          <Label className="text-[10px] font-semibold text-slate-500 sm:hidden">
                            Rate
                          </Label>
                          <div className="relative">
                            <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs font-semibold text-slate-400">
                              $
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.rate}
                              onChange={(e) => updateItem(item.id, "rate", Number(e.target.value))}
                              className="h-9 rounded-lg border-slate-200 pl-6 text-right font-mono text-xs font-semibold"
                              required
                            />
                          </div>
                        </div>
                        <div className="col-span-4 flex items-center justify-end gap-1.5 text-right sm:col-span-4">
                          <div>
                            <Label className="block text-[10px] font-semibold text-slate-500 sm:hidden">
                              Total
                            </Label>
                            <span className="font-mono text-xs font-bold text-slate-900">
                              ${lineTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          {/* Desktop delete button */}
                          <button
                            type="button"
                            onClick={() => removeLineItem(item.id)}
                            disabled={lineItems.length === 1}
                            className="hidden cursor-pointer rounded-lg p-1 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 sm:flex"
                            title="Remove line"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tax & Financial Totals */}
            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span>Applicable Tax (%):</span>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="h-6 w-14 rounded-md border border-slate-200 bg-white px-1.5 text-right text-xs"
                  />
                </div>
                <span className="font-semibold text-slate-900">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-extrabold text-slate-900">
                <span>Total Due:</span>
                <span className="text-primary text-base">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <DialogFooter className="flex flex-col-reverse items-stretch justify-end gap-2.5 border-t border-slate-100 pt-3 sm:flex-row sm:items-center">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-10 w-full rounded-xl text-xs font-semibold sm:h-9 sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="from-primary h-10 w-full rounded-xl bg-gradient-to-r via-blue-600 to-indigo-600 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 active:scale-98 sm:h-9 sm:w-auto"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                <span>Issue & Send Invoice</span>
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

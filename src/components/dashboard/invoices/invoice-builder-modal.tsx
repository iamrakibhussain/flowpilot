"use client";

import * as React from "react";
import {
  CreditCard,
  Plus,
  Trash2,
  Building2,
  CheckCircle2,
  AlertCircle,
  Search,
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
import { useCustomers } from "@/features/customers/use-customers";
import { useCreateInvoice } from "@/features/invoices/use-invoices";
import { useServices } from "@/features/services/use-services";
import type { CreateInvoicePayload } from "@/features/invoices/types";

export interface InvoiceBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCustomerId?: string;
  initialCustomerName?: string;
  initialItems?: Array<{ description: string; quantity: number; unitPrice: number }>;
  initialNotes?: string;
  organizationId?: string;
}

interface LineItemRow {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

function InvoiceBuilderForm({
  onClose,
  initialCustomerId,
  initialCustomerName,
  initialItems,
  initialNotes,
  organizationId,
}: Omit<InvoiceBuilderModalProps, "isOpen">) {
  const { data: customerData } = useCustomers({ limit: 100 });
  const customers = React.useMemo(() => customerData?.customers ?? [], [customerData]);
  const { data: services = [] } = useServices({ activeOnly: true }, organizationId);
  const createInvoiceMutation = useCreateInvoice();

  // Client Selection State
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<string>(
    () => initialCustomerId || ""
  );
  const activeCustomerId =
    selectedCustomerId !== "__SEARCH__"
      ? selectedCustomerId || initialCustomerId || (customers[0]?.id ?? "")
      : "";

  const [customClientName, setCustomClientName] = React.useState<string>(
    () => initialCustomerName || ""
  );
  const [customClientEmail, setCustomClientEmail] = React.useState<string>("");
  const [clientSearchQuery, setClientSearchQuery] = React.useState("");
  const [isClientDropdownOpen, setIsClientDropdownOpen] = React.useState(false);
  const [isManualClientMode, setIsManualClientMode] = React.useState<boolean>(() =>
    Boolean(!initialCustomerId && initialCustomerName)
  );

  // Line items state
  const [lineItems, setLineItems] = React.useState<LineItemRow[]>(() => {
    if (initialItems && initialItems.length > 0) {
      return initialItems.map((item, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));
    }
    return [
      {
        id: "item-1",
        description: "Consultation & Professional Services",
        quantity: 1,
        unitPrice: 350,
      },
    ];
  });

  // Financial fields
  const [taxRate, setTaxRate] = React.useState<number>(0);
  const [issueDate, setIssueDate] = React.useState(() => new Date().toISOString().slice(0, 10));

  const [dueDate, setDueDate] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });

  const [notes, setNotes] = React.useState(
    () =>
      initialNotes ||
      "Payment terms: Net 14 days. Please include invoice number in wire/transfer reference."
  );

  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [createdInvoiceNumber, setCreatedInvoiceNumber] = React.useState<string | null>(null);

  // Selected customer object
  const selectedCustomer = React.useMemo(() => {
    if (selectedCustomerId === "__SEARCH__") return null;
    return customers.find((c) => c.id === activeCustomerId) || null;
  }, [customers, activeCustomerId, selectedCustomerId]);

  // Filtered customers for dropdown
  const filteredCustomers = React.useMemo(() => {
    if (!clientSearchQuery.trim()) return customers;
    const q = clientSearchQuery.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q))
    );
  }, [customers, clientSearchQuery]);

  // Dynamic Financial Calculations
  const subtotal = React.useMemo(() => {
    return lineItems.reduce(
      (acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0),
      0
    );
  }, [lineItems]);

  const taxAmount = React.useMemo(() => {
    const rate = Math.max(0, Number(taxRate) || 0);
    return Math.round(subtotal * (rate / 100) * 100) / 100;
  }, [subtotal, taxRate]);

  const grandTotal = React.useMemo(() => {
    return Math.round((subtotal + taxAmount) * 100) / 100;
  }, [subtotal, taxAmount]);

  // Line item handlers
  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: "Service Item",
        quantity: 1,
        unitPrice: 150,
      },
    ]);
  };

  const addServiceLineItem = (service: { name: string; price: number }) => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${prev.length + 1}`,
        description: service.name,
        quantity: 1,
        unitPrice: Number(service.price) || 0,
      },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((it) => it.id !== id));
  };

  const updateLineItem = (
    id: string,
    field: "description" | "quantity" | "unitPrice",
    val: string | number
  ) => {
    setLineItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: val } : it)));
  };

  // Due date presets
  const applyDueDatePreset = (daysOffset: number) => {
    const d = new Date(issueDate);
    d.setDate(d.getDate() + daysOffset);
    setDueDate(d.toISOString().slice(0, 10));
  };

  const applyNotesPreset = (presetText: string) => {
    setNotes(presetText);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isManualClientMode && !selectedCustomerId) {
      setErrorMessage("Please select a customer from the CRM.");
      return;
    }

    if (isManualClientMode && !customClientName.trim()) {
      setErrorMessage("Please enter a client name.");
      return;
    }

    if (lineItems.length === 0 || subtotal <= 0) {
      setErrorMessage("Invoice must contain valid line items with an amount greater than zero.");
      return;
    }

    try {
      const payload: CreateInvoicePayload = {
        customerId: !isManualClientMode ? activeCustomerId : undefined,
        customerName: isManualClientMode ? customClientName.trim() : undefined,
        customerEmail:
          isManualClientMode && customClientEmail.trim() ? customClientEmail.trim() : undefined,
        issueDate: new Date(issueDate).toISOString(),
        dueDate: new Date(dueDate).toISOString(),
        tax: taxAmount,
        notes: notes.trim() || undefined,
        items: lineItems.map((it) => ({
          description: it.description.trim() || "Item",
          quantity: Number(it.quantity) || 1,
          unitPrice: Number(it.unitPrice) || 0,
        })),
      };

      const result = await createInvoiceMutation.mutateAsync({
        payload,
        organizationId,
      });

      setCreatedInvoiceNumber(result.invoiceNumber);

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create invoice.";
      setErrorMessage(msg);
    }
  };

  return (
    <>
      <DialogHeader className="border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-black tracking-tight text-slate-900">
                  {createdInvoiceNumber
                    ? `Statement #${createdInvoiceNumber} Created`
                    : "Issue Commercial Invoice"}
                </DialogTitle>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 ring-1 ring-blue-500/20">
                  Bank-Grade
                </span>
              </div>
              <DialogDescription className="text-xs text-slate-500">
                Generate, record, and link an itemized billing statement to your CRM client ledger.
              </DialogDescription>
            </div>
          </div>
        </div>
      </DialogHeader>

      {createdInvoiceNumber ? (
        <div className="animate-in zoom-in-95 my-8 flex flex-col items-center justify-center space-y-3 rounded-3xl border border-emerald-200 bg-gradient-to-b from-emerald-50/80 to-teal-50/40 p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-500/30">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h3 className="text-xl font-black text-emerald-950">
            Invoice #{createdInvoiceNumber} Dispatched
          </h3>
          <p className="max-w-sm text-xs leading-relaxed text-emerald-700">
            The billing statement has been recorded, added to the organization cash ledger, and
            linked to the client dossier with real-time audit logs.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p className="font-medium">{errorMessage}</p>
            </div>
          )}

          {/* Client Selector Block */}
          <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                Billed Client Dossier
              </Label>
              <button
                type="button"
                onClick={() => setIsManualClientMode(!isManualClientMode)}
                className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700"
              >
                {isManualClientMode ? "← Select from CRM Customers" : "+ Enter Non-CRM Client"}
              </button>
            </div>

            {isManualClientMode ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">Client / Company Name</Label>
                  <Input
                    placeholder="e.g. Acme Corporation"
                    value={customClientName}
                    onChange={(e) => setCustomClientName(e.target.value)}
                    required
                    className="h-10 rounded-xl border-slate-200 bg-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">Client Billing Email (Optional)</Label>
                  <Input
                    type="email"
                    placeholder="billing@acme.com"
                    value={customClientEmail}
                    onChange={(e) => setCustomClientEmail(e.target.value)}
                    className="h-10 rounded-xl border-slate-200 bg-white text-xs"
                  />
                </div>
              </div>
            ) : selectedCustomer ? (
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-xs">
                    {selectedCustomer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{selectedCustomer.name}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {selectedCustomer.company && (
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          {selectedCustomer.company}
                        </span>
                      )}
                      <span className="font-mono text-slate-400">{selectedCustomer.email}</span>
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCustomerId("__SEARCH__");
                    setIsClientDropdownOpen(true);
                  }}
                  className="h-8 rounded-lg border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Change Client
                </Button>
              </div>
            ) : (
              /* Searchable Combobox */
              <div className="relative">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Type to search CRM customers by name, company, or email..."
                    value={clientSearchQuery}
                    onChange={(e) => {
                      setClientSearchQuery(e.target.value);
                      setIsClientDropdownOpen(true);
                    }}
                    onFocus={() => setIsClientDropdownOpen(true)}
                    className="h-11 rounded-xl border-slate-200 bg-white pl-10 text-xs"
                  />
                </div>

                {isClientDropdownOpen && (
                  <div className="absolute top-12 right-0 left-0 z-30 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                    {filteredCustomers.length === 0 ? (
                      <p className="p-3 text-center text-xs text-slate-400">
                        No matching CRM customers found.
                      </p>
                    ) : (
                      filteredCustomers.map((cust) => (
                        <button
                          key={cust.id}
                          type="button"
                          onClick={() => {
                            setSelectedCustomerId(cust.id);
                            setIsClientDropdownOpen(false);
                          }}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors hover:bg-slate-100/80"
                        >
                          <div>
                            <p className="font-semibold text-slate-900">{cust.name}</p>
                            <p className="text-[11px] text-slate-500">
                              {cust.company ? `${cust.company} • ` : ""}
                              {cust.email}
                            </p>
                          </div>
                          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700">
                            Select
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dates & Payment Terms Quick Switcher */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Issue Date</Label>
              <Input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
                className="h-10 rounded-xl border-slate-200 font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-700">Due Schedule</Label>
                <div className="flex items-center gap-1">
                  {[
                    { label: "Receipt", days: 0 },
                    { label: "Net 7", days: 7 },
                    { label: "Net 14", days: 14 },
                    { label: "Net 30", days: 30 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyDueDatePreset(preset.days)}
                      className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-600 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="h-10 rounded-xl border-slate-200 font-mono text-xs"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                Itemized Services & Deliverables
              </Label>
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
                    className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 shadow-2xs outline-none hover:bg-slate-50 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="" disabled>
                      + Add from Service Catalog...
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
                  className="h-7 gap-1 rounded-lg border-slate-200 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Line Item</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2 rounded-2xl border border-slate-200/90 bg-slate-50/50 p-3">
              {lineItems.map((item) => {
                const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 items-center gap-2 rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs transition-shadow hover:shadow-sm"
                  >
                    <div className="col-span-12 space-y-1 sm:col-span-6">
                      <Input
                        placeholder="Item Description (e.g. Design sprint or advisory retainer)"
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                        className="h-9 rounded-lg border-slate-200 text-xs"
                      />
                    </div>
                    <div className="col-span-4 space-y-1 sm:col-span-2">
                      <Input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, "quantity", e.target.value)}
                        className="h-9 rounded-lg border-slate-200 text-center font-mono text-xs"
                      />
                    </div>
                    <div className="col-span-4 space-y-1 sm:col-span-2">
                      <div className="relative">
                        <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs font-semibold text-slate-400">
                          $
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Rate"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(item.id, "unitPrice", e.target.value)}
                          className="h-9 rounded-lg border-slate-200 pl-6 text-right font-mono text-xs"
                        />
                      </div>
                    </div>
                    <div className="col-span-4 flex items-center justify-end gap-2 pr-0.5 sm:col-span-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        ${lineTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeLineItem(item.id)}
                        disabled={lineItems.length === 1}
                        className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-20"
                        title="Remove line item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial Summary & Tax Rate */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="taxRate" className="text-xs font-semibold text-slate-700">
                  Tax / VAT Rate (%)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                    className="h-9 w-24 rounded-lg border-slate-200 font-mono text-xs"
                  />
                  <span className="text-xs text-slate-500">
                    Calculated Tax:{" "}
                    <strong className="font-mono text-slate-800">
                      ${taxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Terms Preset Pills */}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-slate-500">
                  Quick Terms Presets
                </Label>
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() =>
                      applyNotesPreset(
                        "Payment terms: Net 14 days. Wire instructions: FLOWUS33XXX."
                      )
                    }
                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Net 14 Wire
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyNotesPreset("Payment due immediately upon receipt of invoice.")
                    }
                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Immediate Receipt
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyNotesPreset("Monthly operations retainer billed in advance.")
                    }
                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Monthly Retainer
                  </button>
                </div>
              </div>
            </div>

            {/* Totals Summary Glass Card */}
            <div className="space-y-2 rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-xs text-white shadow-md">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span className="font-mono font-semibold text-white">
                  ${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Tax ({taxRate}%)</span>
                <span className="font-mono font-semibold text-white">
                  ${taxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-700/80 pt-2.5 text-base font-black text-white">
                <span>Total Statement Due</span>
                <span className="font-mono text-emerald-400">
                  ${grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Terms / Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-semibold text-slate-700">
              Payment Terms & Settlement Instructions
            </Label>
            <Textarea
              id="notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none rounded-xl border-slate-200 text-xs"
            />
          </div>

          <DialogFooter className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createInvoiceMutation.isPending}
              className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createInvoiceMutation.isPending}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 active:scale-98"
            >
              {createInvoiceMutation.isPending ? "Generating Invoice..." : "Issue & Record Invoice"}
            </Button>
          </DialogFooter>
        </form>
      )}
    </>
  );
}

export function InvoiceBuilderModal({
  isOpen,
  onClose,
  initialCustomerId,
  initialCustomerName,
  initialItems,
  initialNotes,
  organizationId,
}: InvoiceBuilderModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] w-[95vw] overflow-y-auto rounded-2xl border-slate-200/90 bg-white p-4 shadow-2xl sm:max-w-3xl sm:rounded-3xl sm:p-6">
        {isOpen && (
          <InvoiceBuilderForm
            onClose={onClose}
            initialCustomerId={initialCustomerId}
            initialCustomerName={initialCustomerName}
            initialItems={initialItems}
            initialNotes={initialNotes}
            organizationId={organizationId}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

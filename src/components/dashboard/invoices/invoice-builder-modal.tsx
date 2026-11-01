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
import { useOrganizationSettings } from "@/features/organizations/use-organization-settings";
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
  const { data: orgSettings } = useOrganizationSettings();
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
  const [userTaxRate, setUserTaxRate] = React.useState<number | null>(null);
  const taxRate = userTaxRate !== null ? userTaxRate : (orgSettings?.defaultTaxRate ?? 0);
  const setTaxRate = (val: number) => setUserTaxRate(val);

  const [issueDate, setIssueDate] = React.useState(() => new Date().toISOString().slice(0, 10));

  const [dueDate, setDueDate] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });

  const [userNotes, setUserNotes] = React.useState<string | null>(null);
  const defaultCalculatedNotes = React.useMemo(() => {
    if (initialNotes) return initialNotes;
    if (orgSettings?.defaultPaymentTerms || orgSettings?.invoiceFooter) {
      return `Payment terms: ${orgSettings.defaultPaymentTerms || "Net 14 days"}. ${
        orgSettings.invoiceFooter || "Please include invoice number in wire/transfer reference."
      }`;
    }
    return "Payment terms: Net 14 days. Please include invoice number in wire/transfer reference.";
  }, [initialNotes, orgSettings?.defaultPaymentTerms, orgSettings?.invoiceFooter]);

  const notes = userNotes !== null ? userNotes : defaultCalculatedNotes;
  const setNotes = (val: string) => setUserNotes(val);

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
        description: "Professional Service Deliverable",
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
      <DialogHeader className="space-y-2 border-b border-border/60 pb-4 pr-12 text-left">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-600 dark:text-blue-400 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span>Commercial Billing Engine</span>
            </span>
            <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold">
              Bank-Grade
            </span>
          </div>
        </div>
        <div>
          <DialogTitle className="text-lg sm:text-xl font-black tracking-tight text-foreground">
            {createdInvoiceNumber
              ? `Statement #${createdInvoiceNumber} Created`
              : "Issue Commercial Invoice"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            Generate, record, and link an itemized billing statement to your CRM client ledger.
          </DialogDescription>
        </div>
      </DialogHeader>

      {createdInvoiceNumber ? (
        <div className="animate-in zoom-in-95 my-8 flex flex-col items-center justify-center space-y-3 rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-teal-500/5 p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-500/30">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h3 className="text-xl font-black text-foreground">
            Invoice #{createdInvoiceNumber} Dispatched
          </h3>
          <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
            The billing statement has been recorded, added to the organization cash ledger, and
            linked to the client dossier with real-time audit logs.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-500">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{errorMessage}</p>
            </div>
          )}

          {/* 1. Client Selector Block */}
          <div className="space-y-3 rounded-2xl border border-border/80 bg-muted/20 p-3.5 sm:p-4 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                <span>Billed Client Dossier</span>
              </Label>
              <button
                type="button"
                onClick={() => setIsManualClientMode(!isManualClientMode)}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                {isManualClientMode ? "← Pick from CRM Customers" : "+ Non-CRM Client"}
              </button>
            </div>

            {isManualClientMode ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground font-medium">Client / Company Name</Label>
                  <Input
                    placeholder="e.g. Acme Corporation"
                    value={customClientName}
                    onChange={(e) => setCustomClientName(e.target.value)}
                    required
                    className="h-10 rounded-xl bg-background text-xs shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground font-medium">Client Billing Email (Optional)</Label>
                  <Input
                    type="email"
                    placeholder="billing@acme.com"
                    value={customClientEmail}
                    onChange={(e) => setCustomClientEmail(e.target.value)}
                    className="h-10 rounded-xl bg-background text-xs shadow-2xs"
                  />
                </div>
              </div>
            ) : selectedCustomer ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-border/80 bg-background p-3.5 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-xs">
                    {selectedCustomer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{selectedCustomer.name}</p>
                    <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                      {selectedCustomer.company && (
                        <span className="font-semibold text-foreground">{selectedCustomer.company} •</span>
                      )}
                      <span className="font-mono text-muted-foreground truncate">{selectedCustomer.email}</span>
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
                  className="h-8 w-full sm:w-auto rounded-xl text-xs font-bold shrink-0"
                >
                  Change Client
                </Button>
              </div>
            ) : (
              /* Searchable Combobox */
              <div className="relative">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search CRM customers by name, company, or email..."
                    value={clientSearchQuery}
                    onChange={(e) => {
                      setClientSearchQuery(e.target.value);
                      setIsClientDropdownOpen(true);
                    }}
                    onFocus={() => setIsClientDropdownOpen(true)}
                    className="h-11 rounded-xl bg-background pl-10 text-xs shadow-2xs"
                  />
                </div>

                {isClientDropdownOpen && (
                  <div className="absolute top-12 right-0 left-0 z-30 max-h-56 overflow-y-auto rounded-xl border border-border/80 bg-card p-1.5 shadow-xl">
                    {filteredCustomers.length === 0 ? (
                      <p className="p-3 text-center text-xs text-muted-foreground">
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
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors hover:bg-muted/60"
                        >
                          <div>
                            <p className="font-semibold text-foreground">{cust.name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {cust.company ? `${cust.company} • ` : ""}
                              {cust.email}
                            </p>
                          </div>
                          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
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

          {/* 2. Dates & Payment Terms */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Invoice Issue Date</Label>
              <Input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
                className="h-10 rounded-xl bg-background text-xs font-medium [color-scheme:dark] shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground">Due Date</Label>
                <div className="flex items-center gap-1">
                  {[
                    { label: "Receipt", days: 0 },
                    { label: "+7d", days: 7 },
                    { label: "+14d", days: 14 },
                    { label: "+30d", days: 30 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyDueDatePreset(preset.days)}
                      className="cursor-pointer rounded-lg border border-border/80 bg-muted/40 px-2 py-0.5 text-[10px] font-bold text-foreground transition-all hover:border-primary hover:bg-primary/10 hover:text-primary active:scale-95"
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
                className="h-10 rounded-xl bg-background text-xs font-medium [color-scheme:dark] shadow-2xs"
              />
            </div>
          </div>

          {/* 3. Line Items Table / Cards */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                Itemized Services &amp; Deliverables
              </Label>
              <div className="flex flex-wrap items-center gap-2">
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
                    className="h-8 max-w-[170px] sm:max-w-none truncate rounded-lg border border-border/80 bg-background px-2 text-xs font-semibold text-foreground shadow-2xs outline-none hover:bg-muted/40 focus:ring-1 focus:ring-primary"
                  >
                    <option value="" disabled>
                      + Add Service Catalog...
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
                  className="h-8 gap-1 rounded-lg text-xs font-bold text-primary border-border/80"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Line Item</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2.5 rounded-2xl border border-border/80 bg-muted/20 p-2.5 sm:p-3 shadow-2xs">
              {lineItems.map((item, idx) => {
                const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                return (
                  <React.Fragment key={item.id}>
                    {/* MOBILE DEDICATED CARD (< sm) */}
                    <div className="sm:hidden space-y-3 rounded-2xl border border-border/80 bg-card p-3.5 shadow-xs">
                      <div className="flex items-center justify-between border-b border-border/40 pb-2">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                          Deliverable #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeLineItem(item.id)}
                          disabled={lineItems.length === 1}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-500/10 disabled:opacity-20 cursor-pointer"
                          title="Remove line"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div>
                        <Label className="text-[11px] font-semibold text-foreground">Item Description</Label>
                        <Input
                          placeholder="e.g. Design sprint or advisory retainer"
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                          className="mt-1 h-9 rounded-xl text-xs bg-background"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2.5 pt-1">
                        <div>
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase">Qty</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, "quantity", e.target.value)}
                            className="mt-1 h-9 text-center font-mono text-xs font-bold rounded-xl bg-background"
                            required
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase">Rate ($)</Label>
                          <div className="relative mt-1">
                            <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                              $
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => updateLineItem(item.id, "unitPrice", e.target.value)}
                              className="h-9 pl-6 text-right font-mono text-xs font-bold rounded-xl bg-background"
                              required
                            />
                          </div>
                        </div>
                        <div className="flex flex-col justify-end text-right">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Total</span>
                          <div className="flex h-9 items-center justify-end rounded-xl bg-muted/40 px-2 mt-1">
                            <span className="font-mono text-xs font-black text-foreground">
                              ${lineTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* DESKTOP TABLE ROW (sm and up) */}
                    <div className="hidden sm:grid grid-cols-12 items-center gap-2.5 rounded-xl border border-border/80 bg-card p-3 shadow-xs transition-shadow hover:shadow-sm">
                      <div className="col-span-6">
                        <Input
                          placeholder="Item Description (e.g. Design sprint or advisory retainer)"
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                          className="h-9 rounded-lg border-border/80 text-xs bg-background"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, "quantity", e.target.value)}
                          className="h-9 rounded-lg border-border/80 text-center font-mono text-xs bg-background"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <div className="relative">
                          <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                            $
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Rate"
                            value={item.unitPrice}
                            onChange={(e) => updateLineItem(item.id, "unitPrice", e.target.value)}
                            className="h-9 rounded-lg border-border/80 pl-6 text-right font-mono text-xs bg-background"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-span-2 flex items-center justify-end gap-2 pr-0.5">
                        <span className="font-mono text-xs font-bold text-foreground">
                          ${lineTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeLineItem(item.id)}
                          disabled={lineItems.length === 1}
                          className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 disabled:opacity-20 cursor-pointer"
                          title="Remove line item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* 4. Financial Summary & Totals Glass Card */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="taxRate" className="text-xs font-bold text-foreground">
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
                    className="h-9 w-20 rounded-xl font-mono text-xs font-bold bg-background shadow-2xs"
                  />
                  <span className="text-xs text-muted-foreground">
                    Calculated Tax:{" "}
                    <strong className="font-mono text-foreground font-black">
                      ${taxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Terms Preset Pills */}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-muted-foreground">
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
                    className="cursor-pointer rounded-lg border border-border/80 bg-muted/40 px-2.5 py-1 font-bold text-foreground hover:bg-muted active:scale-95 transition-all"
                  >
                    Net 14 Wire
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyNotesPreset("Payment due immediately upon receipt of invoice.")
                    }
                    className="cursor-pointer rounded-lg border border-border/80 bg-muted/40 px-2.5 py-1 font-bold text-foreground hover:bg-muted active:scale-95 transition-all"
                  >
                    Immediate Receipt
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyNotesPreset("Monthly operations retainer billed in advance.")
                    }
                    className="cursor-pointer rounded-lg border border-border/80 bg-muted/40 px-2.5 py-1 font-bold text-foreground hover:bg-muted active:scale-95 transition-all"
                  >
                    Monthly Retainer
                  </button>
                </div>
              </div>
            </div>

            {/* Totals Summary Glass Card */}
            <div className="space-y-2 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-5 text-xs text-white shadow-lg">
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
              <div className="flex items-center justify-between border-t border-slate-700/80 pt-3">
                <span className="font-bold text-white text-sm">Total Statement Due</span>
                <span className="font-mono text-lg font-black text-emerald-400">
                  ${grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* 5. Terms / Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-bold text-foreground">
              Payment Terms &amp; Settlement Instructions
            </Label>
            <Textarea
              id="notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none rounded-xl text-xs bg-background shadow-2xs"
            />
          </div>

          {/* 6. Footer Actions */}
          <DialogFooter className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createInvoiceMutation.isPending}
              className="h-11 sm:h-10 w-full sm:w-auto rounded-xl border-border/80 text-foreground hover:bg-muted font-bold text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createInvoiceMutation.isPending}
              className="h-11 sm:h-10 w-full sm:w-auto rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-black text-xs text-white shadow-md shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 active:scale-95"
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
      <DialogContent className="max-h-[92vh] w-[95vw] sm:max-w-3xl overflow-y-auto rounded-3xl border border-border/80 bg-card/95 text-foreground p-4 sm:p-7 shadow-2xl backdrop-blur-2xl">
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
